package com.example.auction.auction.dto;

import java.time.LocalDateTime;

public class AuctionCreateRequest {
    public Long productId;
    public Double startPrice;
    public Double minIncrement;
    public LocalDateTime startTime;
    public LocalDateTime endTime;
}
