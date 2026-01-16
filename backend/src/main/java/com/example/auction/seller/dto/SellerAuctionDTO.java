package com.example.auction.seller.dto;

import java.time.LocalDateTime;

/**
 * DTO for seller's auction listing
 */
public class SellerAuctionDTO {

    private Long auctionId;
    private Long productId;
    private String productTitle;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double startPrice;
    private Double currentPrice;
    private Double minIncrement;
    private String status;
    private int totalBids;

    public SellerAuctionDTO() {
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductTitle() {
        return productTitle;
    }

    public void setProductTitle(String productTitle) {
        this.productTitle = productTitle;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Double getStartPrice() {
        return startPrice;
    }

    public void setStartPrice(Double startPrice) {
        this.startPrice = startPrice;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public Double getMinIncrement() {
        return minIncrement;
    }

    public void setMinIncrement(Double minIncrement) {
        this.minIncrement = minIncrement;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getTotalBids() {
        return totalBids;
    }

    public void setTotalBids(int totalBids) {
        this.totalBids = totalBids;
    }
}
