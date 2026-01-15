package com.example.auction.bidding.service;

import com.example.auction.auction.entity.Auction;
import com.example.auction.auction.entity.AuctionStatus;
import com.example.auction.auction.repository.AuctionRepository;
import com.example.auction.auth.entity.User;
import com.example.auction.auth.repository.UserRepository;
import com.example.auction.bidding.dto.*;
import com.example.auction.bidding.entity.Bid;
import com.example.auction.bidding.entity.ProxyBid;
import com.example.auction.bidding.repository.BidRepository;
import com.example.auction.bidding.repository.ProxyBidRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service layer for bidding operations.
 * Handles manual bidding, proxy bidding, and auto-bidding logic.
 */
@Service
public class BidService {

    private final BidRepository bidRepository;
    private final ProxyBidRepository proxyBidRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    public BidService(BidRepository bidRepository,
            ProxyBidRepository proxyBidRepository,
            AuctionRepository auctionRepository,
            UserRepository userRepository) {
        this.bidRepository = bidRepository;
        this.proxyBidRepository = proxyBidRepository;
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
    }

    /**
     * Place a manual bid on an auction
     */
    @Transactional
    public BidResponse placeBid(BidRequest request, Long userId) {
        // 1. Validate auction exists and is LIVE
        Auction auction = auctionRepository.findById(request.auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (auction.getStatus() != AuctionStatus.LIVE) {
            throw new RuntimeException("Cannot bid on this auction. Auction status: " + auction.getStatus());
        }

        // 2. Check if auction has expired
        if (auction.getEndTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot bid on expired auction");
        }

        // 3. Check if user is the seller
        if (auction.getSellerId().equals(userId)) {
            throw new RuntimeException("You cannot bid on your own auction");
        }

        // 4. Validate bid amount
        Double minRequiredBid = auction.getCurrentPrice() + auction.getMinIncrement();
        if (request.bidAmount.doubleValue() < minRequiredBid) {
            throw new RuntimeException(String.format(
                    "Bid amount must be at least %.2f (current price: %.2f + min increment: %.2f)",
                    minRequiredBid, auction.getCurrentPrice(), auction.getMinIncrement()));
        }

        // 5. Check if user is already the highest bidder
        Optional<Bid> highestBid = bidRepository.findTopByAuctionIdOrderByBidAmountDesc(request.auctionId);
        if (highestBid.isPresent() && highestBid.get().getBidderId().equals(userId)) {
            throw new RuntimeException("You are already the highest bidder. Wait for someone to outbid you.");
        }

        // 6. Create and save the manual bid
        Bid bid = new Bid();
        bid.setAuctionId(request.auctionId);
        bid.setBidderId(userId);
        bid.setBidAmount(request.bidAmount);
        bid.setBidType("MANUAL");
        bid = bidRepository.save(bid);

        // 7. Update auction current price and winner
        auction.setCurrentPrice(request.bidAmount.doubleValue());
        auction.setWinnerId(userId);
        auction.setWinnerUserId(userId);
        auctionRepository.save(auction);

        // 8. Process proxy bids (auto-bidding)
        processProxyBids(auction, userId);

        // 9. Return response
        return toBidResponse(bid);
    }

    /**
     * Place or update a proxy bid
     */
    @Transactional
    public ProxyBidResponse placeProxyBid(ProxyBidRequest request, Long userId) {
        // 1. Validate auction exists and is LIVE
        Auction auction = auctionRepository.findById(request.auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (auction.getStatus() != AuctionStatus.LIVE) {
            throw new RuntimeException("Cannot set proxy bid on this auction. Auction status: " + auction.getStatus());
        }

        // 2. Check if user is the seller
        if (auction.getSellerId().equals(userId)) {
            throw new RuntimeException("You cannot set proxy bid on your own auction");
        }

        // 3. Validate max amount is greater than current price
        if (request.maxAmount.doubleValue() <= auction.getCurrentPrice()) {
            throw new RuntimeException(String.format(
                    "Max amount must be greater than current price: %.2f",
                    auction.getCurrentPrice()));
        }

        // 4. Check if user already has a proxy bid for this auction
        Optional<ProxyBid> existingProxy = proxyBidRepository.findByAuctionIdAndBidderId(
                request.auctionId, userId);

        ProxyBid proxyBid;
        if (existingProxy.isPresent()) {
            // Update existing proxy bid
            proxyBid = existingProxy.get();
            proxyBid.setMaxAmount(request.maxAmount);
        } else {
            // Create new proxy bid
            proxyBid = new ProxyBid();
            proxyBid.setAuctionId(request.auctionId);
            proxyBid.setBidderId(userId);
            proxyBid.setMaxAmount(request.maxAmount);
        }
        proxyBid = proxyBidRepository.save(proxyBid);

        // 5. Immediately process proxy bids if this user should bid now
        processProxyBidsForNewProxy(auction, userId, request.maxAmount);

        // 6. Return response
        return toProxyBidResponse(proxyBid);
    }

    /**
     * Process proxy bids after a manual bid is placed.
     * This triggers auto-bidding for users who have proxy bids set up.
     */
    private void processProxyBids(Auction auction, Long manualBidderId) {
        // Find all proxy bids for this auction, ordered by max amount descending
        List<ProxyBid> proxyBids = proxyBidRepository.findByAuctionIdOrderByMaxAmountDesc(auction.getId());

        if (proxyBids.isEmpty()) {
            return;
        }

        // Find the proxy bid with the highest max amount that can still bid
        ProxyBid highestProxy = null;
        for (ProxyBid proxy : proxyBids) {
            // Skip the manual bidder's proxy (if they have one)
            if (proxy.getBidderId().equals(manualBidderId)) {
                continue;
            }

            // Check if this proxy's max amount is higher than current price
            if (proxy.getMaxAmount().doubleValue() > auction.getCurrentPrice()) {
                highestProxy = proxy;
                break;
            }
        }

        // If we found a proxy bid that can outbid, create auto-bid
        if (highestProxy != null) {
            Double requiredBid = auction.getCurrentPrice() + auction.getMinIncrement();

            // Only place a bid if proxy's max amount can cover the required bid
            if (highestProxy.getMaxAmount().doubleValue() < requiredBid) {
                // Proxy can't afford the required bid, don't place any bid
                return;
            }

            // Calculate the bid amount (minimum required)
            Double newBidAmount = requiredBid;

            // Cap at max amount (should never happen due to check above, but safety)
            if (newBidAmount > highestProxy.getMaxAmount().doubleValue()) {
                newBidAmount = highestProxy.getMaxAmount().doubleValue();
            }

            // Create PROXY_AUTO bid
            Bid autoBid = new Bid();
            autoBid.setAuctionId(auction.getId());
            autoBid.setBidderId(highestProxy.getBidderId());
            autoBid.setBidAmount(BigDecimal.valueOf(newBidAmount));
            autoBid.setBidType("PROXY_AUTO");
            bidRepository.save(autoBid);

            // Update auction
            auction.setCurrentPrice(newBidAmount);
            auction.setWinnerId(highestProxy.getBidderId());
            auction.setWinnerUserId(highestProxy.getBidderId());
            auctionRepository.save(auction);
        }
    }

    /**
     * Process proxy bids when a new proxy bid is created.
     * If the new proxy has the highest max amount, it should bid immediately.
     */
    private void processProxyBidsForNewProxy(Auction auction, Long newProxyUserId, BigDecimal maxAmount) {
        // Don't auto-bid if this user is already the highest bidder
        if (auction.getWinnerId() != null && auction.getWinnerId().equals(newProxyUserId)) {
            return;
        }

        Double currentPrice = auction.getCurrentPrice();
        Double requiredBid = currentPrice + auction.getMinIncrement();

        // If max amount can't cover the required bid, don't place any bid
        if (maxAmount.doubleValue() < requiredBid) {
            return;
        }

        // Calculate new bid amount (start with minimum required)
        Double newBidAmount = requiredBid;

        // Check if we need to outbid other proxy bids
        List<ProxyBid> otherProxies = proxyBidRepository.findByAuctionIdAndBidderIdNotOrderByMaxAmountDesc(
                auction.getId(), newProxyUserId);

        // Find the highest competing proxy
        ProxyBid highestCompetitor = otherProxies.isEmpty() ? null : otherProxies.get(0);

        if (highestCompetitor != null) {
            // If competitor's max is higher or equal, we can't win, don't bid
            if (highestCompetitor.getMaxAmount().doubleValue() >= maxAmount.doubleValue()) {
                return;
            } else if (highestCompetitor.getMaxAmount().doubleValue() >= currentPrice) {
                // Bid above competitor's max
                newBidAmount = highestCompetitor.getMaxAmount().doubleValue() + auction.getMinIncrement();
            }
        }

        // Cap at our max amount
        if (newBidAmount > maxAmount.doubleValue()) {
            newBidAmount = maxAmount.doubleValue();
        }

        // Final check: ensure bid is at least the required amount
        if (newBidAmount < requiredBid) {
            return;
        }

        // Create PROXY_AUTO bid
        Bid autoBid = new Bid();
        autoBid.setAuctionId(auction.getId());
        autoBid.setBidderId(newProxyUserId);
        autoBid.setBidAmount(BigDecimal.valueOf(newBidAmount));
        autoBid.setBidType("PROXY_AUTO");
        bidRepository.save(autoBid);

        // Update auction
        auction.setCurrentPrice(newBidAmount);
        auction.setWinnerId(newProxyUserId);
        auction.setWinnerUserId(newProxyUserId);
        auctionRepository.save(auction);
    }

    /**
     * Get all bids for an auction
     */
    public List<BidResponse> getAuctionBids(Long auctionId) {
        List<Bid> bids = bidRepository.findByAuctionIdOrderByBidAmountDesc(auctionId);
        return bids.stream()
                .map(this::toBidResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all bids placed by a user
     */
    public List<BidResponse> getUserBids(Long userId) {
        List<Bid> bids = bidRepository.findByBidderIdOrderByCreatedAtDesc(userId);
        return bids.stream()
                .map(this::toBidResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get user's proxy bid for an auction
     */
    public Optional<ProxyBidResponse> getUserProxyBid(Long auctionId, Long userId) {
        return proxyBidRepository.findByAuctionIdAndBidderId(auctionId, userId)
                .map(this::toProxyBidResponse);
    }

    /**
     * Convert Bid entity to BidResponse DTO
     */
    private BidResponse toBidResponse(Bid bid) {
        BidResponse response = new BidResponse();
        response.id = bid.getId();
        response.auctionId = bid.getAuctionId();
        response.bidAmount = bid.getBidAmount();
        response.bidType = bid.getBidType();
        response.createdAt = bid.getCreatedAt();

        // Fetch bidder name
        User bidder = userRepository.findById(bid.getBidderId())
                .orElse(null);
        response.bidderName = bidder != null ? bidder.getName() : "Unknown";

        return response;
    }

    /**
     * Convert ProxyBid entity to ProxyBidResponse DTO
     */
    private ProxyBidResponse toProxyBidResponse(ProxyBid proxyBid) {
        ProxyBidResponse response = new ProxyBidResponse();
        response.id = proxyBid.getId();
        response.auctionId = proxyBid.getAuctionId();
        response.maxAmount = proxyBid.getMaxAmount();
        response.createdAt = proxyBid.getCreatedAt();

        return response;
    }
}
