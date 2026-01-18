package com.example.auction.payment.service;

import com.example.auction.auction.entity.Auction;
import com.example.auction.auction.entity.AuctionStatus;
import com.example.auction.auction.repository.AuctionRepository;
import com.example.auction.payment.dto.*;
import com.example.auction.payment.entity.Commission;
import com.example.auction.payment.entity.Payment;
import com.example.auction.payment.repository.CommissionRepository;
import com.example.auction.payment.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final BigDecimal DEFAULT_COMMISSION_RATE = new BigDecimal("5.00");

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CommissionRepository commissionRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Transactional
    public PaymentResponse initiateCheckout(PaymentRequest request) {
        Auction auction = auctionRepository.findById(request.getAuctionId())
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (auction.getStatus() != AuctionStatus.ENDED) {
            throw new RuntimeException("Auction is not ended yet");
        }

        if (auction.getWinnerUserId() == null) {
            throw new RuntimeException("Auction has no winner");
        }

        // Check if payment already exists
        Payment existingPayment = paymentRepository.findByAuctionId(auction.getId()).orElse(null);
        if (existingPayment != null) {
            PaymentResponse response = mapToPaymentResponse(existingPayment);
            // If payment is already successful, don't create new PaymentIntent
            if ("SUCCESS".equals(existingPayment.getStatus())) {
                return response;
            }
            // If pending, try to retrieve PaymentIntent from Stripe
            try {
                PaymentIntent existingIntent = PaymentIntent.retrieve(existingPayment.getStripePaymentId());
                if (existingIntent.getClientSecret() != null) {
                    response.setClientSecret(existingIntent.getClientSecret());
                    return response;
                }
            } catch (StripeException e) {
                // If retrieval fails, continue to create new PaymentIntent below
                // Update existing payment record with new PaymentIntent
            }
        }

        BigDecimal amount = BigDecimal.valueOf(auction.getCurrentPrice());

        // Create Stripe PaymentIntent
        PaymentIntent paymentIntent;
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue()) // Convert to cents
                    .setCurrency("usd")
                    .putMetadata("auctionId", auction.getId().toString())
                    .putMetadata("bidderId", auction.getWinnerUserId().toString())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            paymentIntent = PaymentIntent.create(params);
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create Stripe PaymentIntent: " + e.getMessage());
        }

        // Create or update payment record
        Payment payment = existingPayment != null ? existingPayment : new Payment();
        payment.setAuctionId(auction.getId());
        payment.setBidderId(auction.getWinnerUserId());
        payment.setAmount(amount);
        payment.setStatus("PENDING");
        payment.setStripePaymentId(paymentIntent.getId());

        payment = paymentRepository.save(payment);

        createCommissionRecord(auction, amount);

        PaymentResponse response = mapToPaymentResponse(payment);
        response.setClientSecret(paymentIntent.getClientSecret());
        return response;
    }

    @Transactional
    public void handleWebhook(WebhookPayload payload) {
        Payment payment = paymentRepository.findByStripePaymentId(payload.getPaymentIntentId())
                .orElseThrow(() -> new RuntimeException("Payment not found for this payment intent"));

        if ("payment_intent.succeeded".equals(payload.getEventType())) {
            payment.setStatus("SUCCESS");
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);

        } else if ("payment_intent.payment_failed".equals(payload.getEventType())) {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
        }
    }

    public List<CommissionResponse> getAllCommissions() {
        return commissionRepository.findAll()
                .stream()
                .map(this::mapToCommissionResponse)
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalPlatformEarnings() {
        BigDecimal total = commissionRepository.getTotalPlatformEarnings();
        return total != null ? total : BigDecimal.ZERO;
    }

    public PaymentResponse getPaymentByAuctionId(Long auctionId) {
        Payment payment = paymentRepository.findByAuctionId(auctionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToPaymentResponse(payment);
    }

    public List<PaymentResponse> getPaymentsByBidderId(Long bidderId) {
        return paymentRepository.findByBidderId(bidderId)
                .stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    private BigDecimal calculateCommission(BigDecimal amount) {
        return amount.multiply(DEFAULT_COMMISSION_RATE.divide(new BigDecimal("100")))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private void createCommissionRecord(Auction auction, BigDecimal paymentAmount) {
        if (commissionRepository.existsByAuctionId(auction.getId())) {
            return;
        }

        BigDecimal commissionAmount = calculateCommission(paymentAmount);

        Commission commission = new Commission();
        commission.setAuctionId(auction.getId());
        commission.setPercentage(DEFAULT_COMMISSION_RATE);
        commission.setAmount(commissionAmount);

        commissionRepository.save(commission);
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setAuctionId(payment.getAuctionId());
        response.setBidderId(payment.getBidderId());
        response.setAmount(payment.getAmount());
        response.setStripePaymentId(payment.getStripePaymentId());
        response.setStatus(payment.getStatus());
        response.setPaidAt(payment.getPaidAt());
        return response;
    }

    private CommissionResponse mapToCommissionResponse(Commission commission) {
        CommissionResponse response = new CommissionResponse();
        response.setId(commission.getId());
        response.setAuctionId(commission.getAuctionId());
        response.setPercentage(commission.getPercentage());
        response.setAmount(commission.getAmount());
        response.setCreatedAt(commission.getCreatedAt());
        return response;
    }
}
