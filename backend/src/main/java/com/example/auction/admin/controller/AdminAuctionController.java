package com.example.auction.admin.controller;

import com.example.auction.auction.dto.AuctionCreateRequest;
import com.example.auction.auction.dto.AuctionResponse;
import com.example.auction.auction.entity.Auction;
import com.example.auction.auction.entity.AuctionStatus;
import com.example.auction.auction.repository.AuctionRepository;
import com.example.auction.notification.NotificationService;
import com.example.auction.product.entity.Product;
import com.example.auction.product.entity.ProductStatus;
import com.example.auction.product.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/auctions")
public class AdminAuctionController {

    private final AuctionRepository auctionRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;

    public AdminAuctionController(AuctionRepository auctionRepository,
            ProductRepository productRepository,
            NotificationService notificationService) {
        this.auctionRepository = auctionRepository;
        this.productRepository = productRepository;
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<AuctionResponse> createAuction(@RequestBody AuctionCreateRequest request) {
        Product product = productRepository.findById(request.productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (product.getStatus() != ProductStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product must be APPROVED to create an auction");
        }

        if (auctionRepository.existsByProductId(request.productId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An auction already exists for this product");
        }

        Auction auction = new Auction();
        auction.setProductId(request.productId);
        auction.setSellerId(product.getSellerId());
        auction.setStartPrice(request.startPrice);
        auction.setCurrentPrice(null);
        auction.setMinIncrement(request.minIncrement);
        auction.setStartTime(request.startTime);
        auction.setEndTime(request.endTime);
        auction.setStatus(AuctionStatus.SCHEDULED);

        auctionRepository.save(auction);

        notificationService.notifyAuctionCreated(
                product.getSellerId(),
                product.getTitle(),
                request.startTime.toString(),
                request.endTime.toString());

        AuctionResponse response = new AuctionResponse();
        response.auctionId = auction.getId();
        response.status = auction.getStatus().name();
        response.message = "Auction created successfully";

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<AuctionResponse> startAuction(@PathVariable Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auction not found"));

        if (auction.getStatus() != AuctionStatus.SCHEDULED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Auction can only be started when status is SCHEDULED. Current status: " + auction.getStatus());
        }

        auction.setStatus(AuctionStatus.LIVE);
        auction.setCurrentPrice(auction.getStartPrice());
        auctionRepository.save(auction);

        Product product = productRepository.findById(auction.getProductId())
                .orElse(null);
        if (product != null) {
            notificationService.notifyAuctionStarted(
                    auction.getSellerId(),
                    product.getTitle(),
                    auction.getId());
        }

        AuctionResponse response = new AuctionResponse();
        response.auctionId = auction.getId();
        response.status = auction.getStatus().name();
        response.message = "Auction started successfully";

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<AuctionResponse> endAuction(@PathVariable Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auction not found"));

        if (auction.getStatus() != AuctionStatus.LIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Auction can only be ended when status is LIVE. Current status: " + auction.getStatus());
        }

        if (auction.getCurrentPrice().equals(auction.getStartPrice())) {
            auction.setStatus(AuctionStatus.NO_BIDS);
        } else {
            auction.setStatus(AuctionStatus.ENDED);
        }

        auctionRepository.save(auction);

        AuctionResponse response = new AuctionResponse();
        response.auctionId = auction.getId();
        response.status = auction.getStatus().name();
        response.message = auction.getStatus() == AuctionStatus.NO_BIDS
                ? "Auction ended with no bids"
                : "Auction ended successfully";

        return ResponseEntity.ok(response);
    }
}
