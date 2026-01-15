package com.example.auction.payment.service;

import com.example.auction.auction.entity.Auction;
import com.example.auction.auction.entity.AuctionStatus;
import com.example.auction.auction.repository.AuctionRepository;
import com.example.auction.payment.dto.*;
import com.example.auction.payment.entity.Commission;
import com.example.auction.payment.entity.Payment;
import com.example.auction.payment.repository.CommissionRepository;
import com.example.auction.payment.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
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

        if (paymentRepository.existsByAuctionId(auction.getId())) {
            throw new RuntimeException("Payment already exists for this auction");
        }

        BigDecimal amount = BigDecimal.valueOf(auction.getCurrentPrice());

        Payment payment = new Payment();
        payment.setAuctionId(auction.getId());
        payment.setBidderId(auction.getWinnerUserId());
        payment.setAmount(amount);
        payment.setStatus("PENDING");

        String stripePaymentId = "pi_sandbox_" + UUID.randomUUID().toString().substring(0, 8);
        payment.setStripePaymentId(stripePaymentId);

        payment = paymentRepository.save(payment);

        createCommissionRecord(auction, amount);

        return mapToPaymentResponse(payment);
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
