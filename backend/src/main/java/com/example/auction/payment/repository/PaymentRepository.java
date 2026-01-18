package com.example.auction.payment.repository;

import com.example.auction.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByAuctionId(Long auctionId);

    List<Payment> findByBidderId(Long bidderId);

    Optional<Payment> findByStripePaymentId(String stripePaymentId);

    List<Payment> findByStatus(String status);

    boolean existsByAuctionId(Long auctionId);
}