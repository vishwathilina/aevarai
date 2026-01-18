package com.example.auction.payment.repository;

import com.example.auction.payment.entity.Commission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Long> {

    Optional<Commission> findByAuctionId(Long auctionId);

    boolean existsByAuctionId(Long auctionId);

    @Query("SELECT SUM(c.amount) FROM Commission c")
    BigDecimal getTotalPlatformEarnings();
}