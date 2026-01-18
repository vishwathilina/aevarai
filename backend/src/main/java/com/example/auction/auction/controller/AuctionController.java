package com.example.auction.auction.controller;

import com.example.auction.auction.dto.PublicAuctionDTO;
import com.example.auction.auction.entity.Auction;
import com.example.auction.auction.entity.AuctionStatus;
import com.example.auction.auction.repository.AuctionRepository;
import com.example.auction.product.entity.Product;
import com.example.auction.product.entity.ProductImage;
import com.example.auction.product.repository.ProductRepository;
import com.example.auction.product.repository.ProductImageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionRepository auctionRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public AuctionController(AuctionRepository auctionRepository,
                             ProductRepository productRepository,
                             ProductImageRepository productImageRepository) {
        this.auctionRepository = auctionRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }

    @GetMapping("/live")
    public List<PublicAuctionDTO> getLiveAuctions() {
        List<Auction> auctions = auctionRepository.findByStatus(AuctionStatus.LIVE);
        return auctions.stream()
                .map(this::mapToPublicAuctionDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{auctionId}")
    public PublicAuctionDTO getAuctionById(@PathVariable Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auction not found"));
        return mapToPublicAuctionDTO(auction);
    }

    @GetMapping("/won/{userId}")
    public List<PublicAuctionDTO> getWonAuctions(@PathVariable Long userId) {
        List<Auction> auctions = auctionRepository.findByWinnerUserIdAndStatus(userId, AuctionStatus.ENDED);
        return auctions.stream()
                .map(this::mapToPublicAuctionDTO)
                .collect(Collectors.toList());
    }

    private PublicAuctionDTO mapToPublicAuctionDTO(Auction auction) {
        PublicAuctionDTO dto = new PublicAuctionDTO();
        dto.setAuctionId(auction.getId());
        dto.setProductId(auction.getProductId());

        // Load product details for title & category
        if (auction.getProductId() != null) {
            productRepository.findById(auction.getProductId())
                    .ifPresent(product -> {
                        dto.setProductTitle(product.getTitle());
                        dto.setProductCategory(product.getCategory());
                    });

            // Load primary image for card display (first image for product)
            productImageRepository.findByProductId(auction.getProductId())
                    .stream()
                    .findFirst()
                    .ifPresent(image -> dto.setImageUrl(image.getImageUrl()));
        }

        dto.setStartPrice(auction.getStartPrice());
        dto.setCurrentPrice(auction.getCurrentPrice());
        dto.setMinIncrement(auction.getMinIncrement());
        dto.setStartTime(auction.getStartTime());
        dto.setEndTime(auction.getEndTime());
        dto.setStatus(auction.getStatus() != null ? auction.getStatus().name() : null);

        return dto;
    }
}
