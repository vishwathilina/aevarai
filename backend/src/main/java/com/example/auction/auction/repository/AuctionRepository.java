package com.example.auction.auction.repository;

import com.example.auction.auction.entity.Auction;
import com.example.auction.auction.entity.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    List<Auction> findByStatus(AuctionStatus status);
    List<Auction> findBySellerId(Long sellerId);
    Optional<Auction> findByProductId(Long productId);
    boolean existsByProductId(Long productId);
}
