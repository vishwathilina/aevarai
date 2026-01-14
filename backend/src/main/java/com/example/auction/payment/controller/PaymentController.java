package com.example.auction.payment.controller;

import com.example.auction.payment.dto.*;
import com.example.auction.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/payments/checkout")
    public ResponseEntity<?> initiateCheckout(@Valid @RequestBody PaymentRequest request) {
        try {
            PaymentResponse response = paymentService.initiateCheckout(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/payments/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody WebhookPayload payload) {
        try {
            paymentService.handleWebhook(payload);
            return ResponseEntity.ok(createSuccessResponse("Webhook processed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/commissions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CommissionResponse>> getAllCommissions() {
        List<CommissionResponse> commissions = paymentService.getAllCommissions();
        return ResponseEntity.ok(commissions);
    }

    @GetMapping("/commissions/earnings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTotalEarnings() {
        BigDecimal total = paymentService.getTotalPlatformEarnings();
        Map<String, Object> response = new HashMap<>();
        response.put("totalEarnings", total);
        response.put("currency", "USD");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payments/auction/{auctionId}")
    public ResponseEntity<?> getPaymentByAuction(@PathVariable Long auctionId) {
        try {
            PaymentResponse payment = paymentService.getPaymentByAuctionId(auctionId);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/payments/bidder/{bidderId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByBidder(@PathVariable Long bidderId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByBidderId(bidderId);
        return ResponseEntity.ok(payments);
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }

    private Map<String, String> createSuccessResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return response;
    }
}