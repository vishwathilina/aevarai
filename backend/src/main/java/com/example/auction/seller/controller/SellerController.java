package com.example.auction.seller.controller;

import com.example.auction.seller.dto.*;
import com.example.auction.seller.service.SellerService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * REST Controller for Seller Dashboard APIs
 * All endpoints require AUCTIONEER role
 */
@RestController
@RequestMapping("/api/seller")
public class SellerController {

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    /**
     * GET /api/seller/dashboard
     * Returns dashboard statistics for the authenticated seller
     */
    @GetMapping("/dashboard")
    public ResponseEntity<SellerDashboardDTO> getDashboard(HttpServletRequest request) {
        Long sellerId = getAuthenticatedSellerId(request);
        SellerDashboardDTO stats = sellerService.getDashboardStats(sellerId);
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/seller/products
     * Returns all products for the authenticated seller
     */
    @GetMapping("/products")
    public ResponseEntity<List<SellerProductDTO>> getProducts(HttpServletRequest request) {
        Long sellerId = getAuthenticatedSellerId(request);
        List<SellerProductDTO> products = sellerService.getSellerProducts(sellerId);
        return ResponseEntity.ok(products);
    }

    /**
     * PUT /api/seller/products/{id}
     * Updates a product (only if PENDING or REJECTED)
     */
    @PutMapping("/products/{id}")
    public ResponseEntity<SellerProductDTO> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductUpdateRequest request,
            HttpServletRequest httpRequest) {
        Long sellerId = getAuthenticatedSellerId(httpRequest);
        SellerProductDTO updatedProduct = sellerService.updateProduct(id, request, sellerId);
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * GET /api/seller/auctions
     * Returns all auctions for the authenticated seller
     */
    @GetMapping("/auctions")
    public ResponseEntity<List<SellerAuctionDTO>> getAuctions(HttpServletRequest request) {
        Long sellerId = getAuthenticatedSellerId(request);
        List<SellerAuctionDTO> auctions = sellerService.getSellerAuctions(sellerId);
        return ResponseEntity.ok(auctions);
    }

    /**
     * GET /api/seller/sales
     * Returns completed sales for the authenticated seller
     */
    @GetMapping("/sales")
    public ResponseEntity<List<SaleDTO>> getSales(HttpServletRequest request) {
        Long sellerId = getAuthenticatedSellerId(request);
        List<SaleDTO> sales = sellerService.getSellerSales(sellerId);
        return ResponseEntity.ok(sales);
    }

    /**
     * Extract and validate seller ID from JWT token
     */
    private Long getAuthenticatedSellerId(HttpServletRequest request) {
        Object userIdAttr = request.getAttribute("userId");
        Object roleAttr = request.getAttribute("role");

        if (userIdAttr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        String role = (String) roleAttr;
        if (!"AUCTIONEER".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only sellers can access this resource");
        }

        try {
            return Long.parseLong(userIdAttr.toString());
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid user ID");
        }
    }
}
