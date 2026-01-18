package com.example.auction.delivery.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class DeliveryRequest {

    @NotNull(message = "Auction ID is required")
    private Long auctionId;

    private String deliveryType;

    private BigDecimal deliveryFee;

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public String getDeliveryType() {
        return deliveryType;
    }

    public void setDeliveryType(String deliveryType) {
        this.deliveryType = deliveryType;
    }

    public BigDecimal getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(BigDecimal deliveryFee) {
        this.deliveryFee = deliveryFee;
    }
}
