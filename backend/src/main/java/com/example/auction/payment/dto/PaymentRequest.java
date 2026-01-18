package com.example.auction.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class PaymentRequest {

    @NotNull(message = "Auction ID is required")
    private Long auctionId;

    // Payment method is optional - Stripe Elements handles this on frontend
    private String paymentMethod;

    private String stripeToken;

    // Amount is optional - calculated from auction current price
    private Double amount;

    public Long getAuctionId() {
        return auctionId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getStripeToken() {
        return stripeToken;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setStripeToken(String stripeToken) {
        this.stripeToken = stripeToken;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}
