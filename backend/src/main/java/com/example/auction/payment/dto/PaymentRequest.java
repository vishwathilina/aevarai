package com.example.auction.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class PaymentRequest {

    @NotNull(message = "Auction ID is required")
    private Long auctionId;

    @NotNull(message = "Payment method is required")
    private String paymentMethod;

    private String stripeToken;

    @Positive(message = "Amount must be positive")
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
