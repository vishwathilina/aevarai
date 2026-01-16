package com.example.auction.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {

    private Long id;
    private Long auctionId;
    private Long bidderId;
    private BigDecimal amount;
    private String stripePaymentId;
    private String clientSecret; // For Stripe PaymentIntent
    private String status;
    private LocalDateTime paidAt;

    public Long getId() {
        return id;
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public Long getBidderId() {
        return bidderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getStripePaymentId() {
        return stripePaymentId;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public void setBidderId(Long bidderId) {
        this.bidderId = bidderId;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setStripePaymentId(String stripePaymentId) {
        this.stripePaymentId = stripePaymentId;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }
}
