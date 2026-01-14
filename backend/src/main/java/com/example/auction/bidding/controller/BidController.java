package com.example.auction.bidding.controller;

import com.example.auction.bidding.dto.*;
import com.example.auction.bidding.service.BidService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bids")
public class BidController {

    private final BidService bidService;

    public BidController(BidService bidService) {
        this.bidService = bidService;
    }

    @PostMapping
    public ResponseEntity<BidResponse> placeBid(
            @Valid @RequestBody BidRequest request,
            HttpServletRequest httpRequest) {
        Long userId = Long.parseLong((String) httpRequest.getAttribute("userId"));
        BidResponse response = bidService.placeBid(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/proxy")
    public ResponseEntity<ProxyBidResponse> placeProxyBid(
            @Valid @RequestBody ProxyBidRequest request,
            HttpServletRequest httpRequest) {
        Long userId = Long.parseLong((String) httpRequest.getAttribute("userId"));
        ProxyBidResponse response = bidService.placeProxyBid(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<BidResponse>> getAuctionBids(@PathVariable Long auctionId) {
        List<BidResponse> bids = bidService.getAuctionBids(auctionId);
        return ResponseEntity.ok(bids);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BidResponse>> getUserBids(@PathVariable Long userId) {
        List<BidResponse> bids = bidService.getUserBids(userId);
        return ResponseEntity.ok(bids);
    }

    @GetMapping("/proxy/auction/{auctionId}/user/{userId}")
    public ResponseEntity<ProxyBidResponse> getUserProxyBid(
            @PathVariable Long auctionId,
            @PathVariable Long userId) {
        Optional<ProxyBidResponse> proxyBid = bidService.getUserProxyBid(auctionId, userId);
        return proxyBid.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
