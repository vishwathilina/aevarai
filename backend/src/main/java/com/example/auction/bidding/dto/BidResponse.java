package com.example.auction.bidding.dto;

import com.example.auction.bidding.entity.Bid;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidResponse {

    public Long id;

    public Long auctionId;

    public String bidderName;

    public BigDecimal bidAmount;

    public String bidType;

    public LocalDateTime createdAt;

    public String message;

    public static BidResponse fromEntity(Bid bid, String bidderName) {
        BidResponse response = new BidResponse();
        response.id = bid.getId();
        response.auctionId = bid.getAuctionId();
        response.bidderName = bidderName;
        response.bidAmount = bid.getBidAmount();
        response.bidType = bid.getBidType();
        response.createdAt = bid.getCreatedAt();
        return response;
    }

    public static BidResponse withMessage(Bid bid, String bidderName, String message) {
        BidResponse response = fromEntity(bid, bidderName);
        response.message = message;
        return response;
    }
}
