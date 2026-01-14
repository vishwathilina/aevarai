package com.example.auction.inspection.controller;

import com.example.auction.inspection.dto.InspectionRequest;
import com.example.auction.inspection.dto.InspectionResponse;
import com.example.auction.inspection.service.InspectionService;
import com.example.auction.product.dto.ProductResponse;
import com.example.auction.product.entity.ProductStatus;
import com.example.auction.product.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspections")
public class InspectionController {

    private final InspectionService inspectionService;
    private final ProductRepository productRepository;

    public InspectionController(InspectionService inspectionService, ProductRepository productRepository) {
        this.inspectionService = inspectionService;
        this.productRepository = productRepository;
    }

    @PreAuthorize("hasRole('INSPECTOR')")
    @PostMapping
    public ResponseEntity<InspectionResponse> createInspection(@Valid @RequestBody InspectionRequest request) {
        InspectionResponse response = inspectionService.createInspection(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<InspectionResponse>> getInspectionsByProduct(@PathVariable Long productId) {
        List<InspectionResponse> responses = inspectionService.getInspectionsByProduct(productId);
        return ResponseEntity.ok(responses);
    }

    @PreAuthorize("hasRole('INSPECTOR')")
    @GetMapping("/pending")
    public ResponseEntity<List<InspectionResponse>> getPendingInspections() {
        List<InspectionResponse> responses = inspectionService.getPendingInspections();
        return ResponseEntity.ok(responses);
    }

    @PreAuthorize("hasRole('INSPECTOR')")
    @GetMapping("/products/ready")
    public ResponseEntity<List<ProductResponse>> getProductsReadyForInspection() {
        List<ProductResponse> products = productRepository.findByStatus(ProductStatus.DOC_APPROVED)
                .stream()
                .map(ProductResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(products);
    }

    @PreAuthorize("hasRole('INSPECTOR')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<InspectionResponse> approveInspection(
            @PathVariable Long id,
            @RequestBody(required = false) InspectionRequest request) {
        String remarks = (request != null) ? request.getRemarks() : null;
        InspectionResponse response = inspectionService.approveInspection(id, remarks);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('INSPECTOR')")
    @PutMapping("/{id}/reject")
    public ResponseEntity<InspectionResponse> rejectInspection(
            @PathVariable Long id,
            @RequestBody(required = false) InspectionRequest request) {
        String remarks = (request != null) ? request.getRemarks() : null;
        InspectionResponse response = inspectionService.rejectInspection(id, remarks);
        return ResponseEntity.ok(response);
    }
}
