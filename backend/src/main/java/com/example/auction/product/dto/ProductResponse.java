package com.example.auction.product.dto;

import com.example.auction.product.entity.Product;
import com.example.auction.product.entity.ProductStatus;

import java.time.LocalDateTime;

public class ProductResponse {
    public Long id;
    public String title;
    public String description;
    public String category;
    public Long sellerId;
    public ProductStatus status;
    public boolean handlingFeePaid;
    public Long reviewedBy;
    public LocalDateTime reviewedAt;
    public String rejectionReason;
    public String reviewRemarks;
    public LocalDateTime createdAt;
    public String message;

    public static ProductResponse fromEntity(Product product) {
        ProductResponse response = new ProductResponse();
        response.id = product.getId();
        response.title = product.getTitle();
        response.description = product.getDescription();
        response.category = product.getCategory();
        response.sellerId = product.getSellerId();
        response.status = product.getStatus();
        response.handlingFeePaid = product.isHandlingFeePaid();
        response.reviewedBy = product.getReviewedBy();
        response.reviewedAt = product.getReviewedAt();
        response.rejectionReason = product.getRejectionReason();
        response.reviewRemarks = product.getReviewRemarks();
        response.createdAt = product.getCreatedAt();
        return response;
    }

    public static ProductResponse withMessage(Product product, String message) {
        ProductResponse response = fromEntity(product);
        response.message = message;
        return response;
    }
}
