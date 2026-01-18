package com.example.auction.product.entity;

public enum ProductStatus {
    PENDING, // Product submitted, awaiting document review
    DOC_APPROVED, // Documents approved, awaiting physical inspection
    DOC_REJECTED, // Documents rejected, seller can resubmit
    INSPECTION_PENDING, // Physical inspection scheduled/in progress
    APPROVED, // Fully approved for auction
    REJECTED, // Final rejection after inspection
    AUCTIONED, // Currently in auction
    SOLD // Sold at auction
}
