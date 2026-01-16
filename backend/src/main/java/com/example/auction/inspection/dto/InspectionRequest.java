package com.example.auction.inspection.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class InspectionRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Inspector ID is required")
    private Long inspectorId;

    @Size(max = 1000, message = "Remarks must be at most 1000 characters")
    private String remarks;

    // Getters and setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getInspectorId() { return inspectorId; }
    public void setInspectorId(Long inspectorId) { this.inspectorId = inspectorId; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
