package com.example.auction.seller.dto;

/**
 * Request DTO for updating a product
 */
public class ProductUpdateRequest {

    private String title;
    private String description;
    private String category;

    public ProductUpdateRequest() {
    }

    public ProductUpdateRequest(String title, String description, String category) {
        this.title = title;
        this.description = description;
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
