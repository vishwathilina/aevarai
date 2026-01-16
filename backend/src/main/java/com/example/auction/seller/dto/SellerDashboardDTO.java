package com.example.auction.seller.dto;

import java.math.BigDecimal;

/**
 * DTO for seller dashboard statistics
 */
public class SellerDashboardDTO {

    private int totalProducts;
    private int totalAuctions;
    private int activeAuctions;
    private int soldProducts;
    private BigDecimal totalSalesAmount;

    public SellerDashboardDTO() {
    }

    public SellerDashboardDTO(int totalProducts, int totalAuctions, int activeAuctions,
            int soldProducts, BigDecimal totalSalesAmount) {
        this.totalProducts = totalProducts;
        this.totalAuctions = totalAuctions;
        this.activeAuctions = activeAuctions;
        this.soldProducts = soldProducts;
        this.totalSalesAmount = totalSalesAmount;
    }

    public int getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(int totalProducts) {
        this.totalProducts = totalProducts;
    }

    public int getTotalAuctions() {
        return totalAuctions;
    }

    public void setTotalAuctions(int totalAuctions) {
        this.totalAuctions = totalAuctions;
    }

    public int getActiveAuctions() {
        return activeAuctions;
    }

    public void setActiveAuctions(int activeAuctions) {
        this.activeAuctions = activeAuctions;
    }

    public int getSoldProducts() {
        return soldProducts;
    }

    public void setSoldProducts(int soldProducts) {
        this.soldProducts = soldProducts;
    }

    public BigDecimal getTotalSalesAmount() {
        return totalSalesAmount;
    }

    public void setTotalSalesAmount(BigDecimal totalSalesAmount) {
        this.totalSalesAmount = totalSalesAmount;
    }
}
