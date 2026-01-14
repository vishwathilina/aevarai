package com.example.auction.bidding.repository;

import com.example.auction.bidding.entity.ProxyBid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProxyBidRepository extends JpaRepository<ProxyBid, Long> {

    Optional<ProxyBid> findByAuctionIdAndBidderId(Long auctionId, Long bidderId);

    List<ProxyBid> findByAuctionIdOrderByMaxAmountDesc(Long auctionId);

    List<ProxyBid> findByBidderId(Long bidderId);

    boolean existsByAuctionIdAndBidderId(Long auctionId, Long bidderId);

    List<ProxyBid> findByAuctionIdAndBidderIdNotOrderByMaxAmountDesc(Long auctionId, Long bidderId);
}
