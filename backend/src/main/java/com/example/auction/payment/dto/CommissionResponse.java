package com.example.auction.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CommissionResponse {

    private Long id;
    private Long auctionId;
    private BigDecimal percentage;
    private BigDecimal amount;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
