package com.example.auction.product.controller;

import com.example.auction.product.dto.ProductResponse;
import com.example.auction.product.dto.ProductReviewRequest;
import com.example.auction.product.entity.Product;
import com.example.auction.product.entity.ProductStatus;
import com.example.auction.product.repository.ProductRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reviewer/products")
public class ReviewerProductController {

    private final ProductRepository productRepository;

    public ReviewerProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/pending")
    public List<ProductResponse> getPendingProducts() {
        return productRepository.findByStatus(ProductStatus.PENDING)
                .stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ProductResponse> approveProduct(
            @PathVariable Long id,
            @RequestBody ProductReviewRequest request,
            HttpServletRequest httpRequest) {

        Long reviewerId = Long.parseLong((String) httpRequest.getAttribute("userId"));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (product.getStatus() != ProductStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only pending products can be approved. Current status: " + product.getStatus());
        }

        // Stage 1: document review approved -> move to inspection queue
        product.setStatus(ProductStatus.DOC_APPROVED);
        product.setReviewedBy(reviewerId);
        product.setReviewedAt(LocalDateTime.now());
        product.setReviewRemarks(request.remarks);
        product.setRejectionReason(null);

        productRepository.save(product);

        return ResponseEntity.ok(ProductResponse.withMessage(product, "Product approved successfully"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ProductResponse> rejectProduct(
            @PathVariable Long id,
            @RequestBody ProductReviewRequest request,
            HttpServletRequest httpRequest) {

        Long reviewerId = Long.parseLong((String) httpRequest.getAttribute("userId"));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (product.getStatus() != ProductStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only pending products can be rejected. Current status: " + product.getStatus());
        }

        if (request.reason == null || request.reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
        }

        // Stage 1: document review rejected -> seller can resubmit
        product.setStatus(ProductStatus.DOC_REJECTED);
        product.setReviewedBy(reviewerId);
        product.setReviewedAt(LocalDateTime.now());
        product.setRejectionReason(request.reason);

        productRepository.save(product);

        return ResponseEntity.ok(ProductResponse.withMessage(product, "Product rejected"));
    }
}
