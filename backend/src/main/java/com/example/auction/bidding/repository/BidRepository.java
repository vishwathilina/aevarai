package com.example.auction.bidding.repository;

import com.example.auction.bidding.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByAuctionIdOrderByBidAmountDesc(Long auctionId);

    List<Bid> findByBidderIdOrderByCreatedAtDesc(Long bidderId);

    Optional<Bid> findTopByAuctionIdOrderByBidAmountDesc(Long auctionId);

    Optional<Bid> findTopByAuctionIdAndBidderIdOrderByCreatedAtDesc(Long auctionId, Long bidderId);

    long countByAuctionId(Long auctionId);

    List<Bid> findByAuctionIdAndBidderIdOrderByBidAmountDesc(Long auctionId, Long bidderId);
}
