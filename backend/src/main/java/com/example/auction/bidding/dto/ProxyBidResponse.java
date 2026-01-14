package com.example.auction.bidding.dto;

import com.example.auction.bidding.entity.ProxyBid;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProxyBidResponse {

    public Long id;

    public Long auctionId;

    public BigDecimal maxAmount;

    public LocalDateTime createdAt;

    public String message;

    public static ProxyBidResponse fromEntity(ProxyBid proxyBid) {
        ProxyBidResponse response = new ProxyBidResponse();
        response.id = proxyBid.getId();
        response.auctionId = proxyBid.getAuctionId();
        response.maxAmount = proxyBid.getMaxAmount();
        response.createdAt = proxyBid.getCreatedAt();
        return response;
    }

    public static ProxyBidResponse withMessage(ProxyBid proxyBid, String message) {
        ProxyBidResponse response = fromEntity(proxyBid);
        response.message = message;
        return response;
    }
}
