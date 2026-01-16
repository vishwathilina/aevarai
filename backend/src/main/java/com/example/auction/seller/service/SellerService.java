package com.example.auction.seller.service;

import com.example.auction.auction.entity.Auction;
import com.example.auction.auction.entity.AuctionStatus;
import com.example.auction.auction.repository.AuctionRepository;
import com.example.auction.auth.entity.User;
import com.example.auction.auth.repository.UserRepository;
import com.example.auction.bidding.repository.BidRepository;
import com.example.auction.payment.entity.Payment;
import com.example.auction.payment.repository.PaymentRepository;
import com.example.auction.product.entity.Product;
import com.example.auction.product.entity.ProductStatus;
import com.example.auction.product.repository.ProductRepository;
import com.example.auction.seller.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SellerService {

    private final ProductRepository productRepository;
    private final AuctionRepository auctionRepository;
    private final PaymentRepository paymentRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;

    public SellerService(ProductRepository productRepository,
            AuctionRepository auctionRepository,
            PaymentRepository paymentRepository,
            BidRepository bidRepository,
            UserRepository userRepository) {
        this.productRepository = productRepository;
        this.auctionRepository = auctionRepository;
        this.paymentRepository = paymentRepository;
        this.bidRepository = bidRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get dashboard statistics for a seller
     */
    public SellerDashboardDTO getDashboardStats(Long sellerId) {
        int totalProducts = (int) productRepository.countBySellerId(sellerId);
        int totalAuctions = (int) auctionRepository.countBySellerId(sellerId);
        int activeAuctions = (int) auctionRepository.countBySellerIdAndStatus(sellerId, AuctionStatus.LIVE);

        // Get sold products (auctions with winners)
        List<Auction> soldAuctions = auctionRepository.findBySellerIdAndWinnerIdIsNotNull(sellerId);
        int soldProducts = soldAuctions.size();

        // Calculate total sales amount
        BigDecimal totalSalesAmount = BigDecimal.ZERO;
        for (Auction auction : soldAuctions) {
            Optional<Payment> payment = paymentRepository.findByAuctionId(auction.getId());
            if (payment.isPresent() && "SUCCESS".equals(payment.get().getStatus())) {
                totalSalesAmount = totalSalesAmount.add(payment.get().getAmount());
            } else if (auction.getCurrentPrice() != null) {
                totalSalesAmount = totalSalesAmount.add(BigDecimal.valueOf(auction.getCurrentPrice()));
            }
        }

        return new SellerDashboardDTO(totalProducts, totalAuctions, activeAuctions, soldProducts, totalSalesAmount);
    }

    /**
     * Get all products for a seller
     */
    public List<SellerProductDTO> getSellerProducts(Long sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        return products.stream()
                .map(this::mapToSellerProductDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update a product (only if PENDING or REJECTED)
     */
    public SellerProductDTO updateProduct(Long productId, ProductUpdateRequest request, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // Verify ownership
        if (!product.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't own this product");
        }

        // Only allow editing PENDING or DOC_REJECTED products (document stage resubmission)
        if (product.getStatus() != ProductStatus.PENDING && product.getStatus() != ProductStatus.DOC_REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Can only edit products in PENDING or DOC_REJECTED status");
        }

        // Update fields
        if (request.getTitle() != null) {
            product.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            product.setCategory(request.getCategory());
        }

        // If product was document-rejected, set back to pending for re-review
        if (product.getStatus() == ProductStatus.DOC_REJECTED) {
            product.setStatus(ProductStatus.PENDING);
            product.setRejectionReason(null);
        }

        Product savedProduct = productRepository.save(product);
        return mapToSellerProductDTO(savedProduct);
    }

    /**
     * Get all auctions for a seller
     */
    public List<SellerAuctionDTO> getSellerAuctions(Long sellerId) {
        List<Auction> auctions = auctionRepository.findBySellerId(sellerId);
        return auctions.stream()
                .map(this::mapToSellerAuctionDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get completed sales for a seller
     */
    public List<SaleDTO> getSellerSales(Long sellerId) {
        List<Auction> soldAuctions = auctionRepository.findBySellerIdAndWinnerIdIsNotNull(sellerId);

        return soldAuctions.stream()
                .filter(auction -> auction.getStatus() == AuctionStatus.ENDED)
                .map(this::mapToSaleDTO)
                .collect(Collectors.toList());
    }

    private SellerProductDTO mapToSellerProductDTO(Product product) {
        SellerProductDTO dto = new SellerProductDTO();
        dto.setProductId(product.getId());
        dto.setTitle(product.getTitle());
        dto.setDescription(product.getDescription());
        dto.setCategory(product.getCategory());
        dto.setStatus(product.getStatus() != null ? product.getStatus().name() : null);
        dto.setRejectionReason(product.getRejectionReason());
        dto.setReviewRemarks(product.getReviewRemarks());
        dto.setHandlingFeePaid(product.isHandlingFeePaid());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        return dto;
    }

    private SellerAuctionDTO mapToSellerAuctionDTO(Auction auction) {
        SellerAuctionDTO dto = new SellerAuctionDTO();
        dto.setAuctionId(auction.getId());
        dto.setProductId(auction.getProductId());

        // Get product title
        productRepository.findById(auction.getProductId())
                .ifPresent(product -> dto.setProductTitle(product.getTitle()));

        dto.setStartTime(auction.getStartTime());
        dto.setEndTime(auction.getEndTime());
        dto.setStartPrice(auction.getStartPrice());
        dto.setCurrentPrice(auction.getCurrentPrice());
        dto.setMinIncrement(auction.getMinIncrement());
        dto.setStatus(auction.getStatus() != null ? auction.getStatus().name() : null);

        // Get total bids count
        long bidCount = bidRepository.countByAuctionId(auction.getId());
        dto.setTotalBids((int) bidCount);

        return dto;
    }

    private SaleDTO mapToSaleDTO(Auction auction) {
        SaleDTO dto = new SaleDTO();
        dto.setAuctionId(auction.getId());
        dto.setProductId(auction.getProductId());

        // Get product name
        productRepository.findById(auction.getProductId())
                .ifPresent(product -> dto.setProductName(product.getTitle()));

        // Get final price (current price at auction end)
        dto.setFinalPrice(auction.getCurrentPrice() != null
                ? BigDecimal.valueOf(auction.getCurrentPrice())
                : BigDecimal.ZERO);

        // Get winner info
        Long winnerId = auction.getWinnerId() != null ? auction.getWinnerId() : auction.getWinnerUserId();
        if (winnerId != null) {
            dto.setWinnerId(winnerId);
            userRepository.findById(winnerId).ifPresent(user -> {
                dto.setWinnerName(user.getName());
                dto.setWinnerEmail(user.getEmail());
            });
        }

        dto.setAuctionEndDate(auction.getEndTime());

        // Get payment status
        Optional<Payment> payment = paymentRepository.findByAuctionId(auction.getId());
        dto.setPaymentStatus(payment.map(Payment::getStatus).orElse("PENDING"));

        return dto;
    }
}
