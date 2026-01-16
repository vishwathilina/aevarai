package com.example.auction.inspection.controller;

import com.example.auction.inspection.dto.*;
import com.example.auction.inspection.entity.Inspection;
import com.example.auction.inspection.repository.InspectionRepository;
import com.example.auction.product.dto.ProductResponse;
import com.example.auction.product.entity.Product;
import com.example.auction.product.entity.ProductStatus;
import com.example.auction.product.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inspections")
public class InspectionController {
    @Autowired
    private InspectionRepository inspectionRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Products ready for physical inspection (document-approved)
     * Backed by ProductStatus.DOC_APPROVED
     */
    @PreAuthorize("hasRole('INSPECTOR')")
    @GetMapping("/pending")
    public ResponseEntity<List<ProductResponse>> getProductsReadyForInspection() {
        List<ProductResponse> products = productRepository.findByStatus(ProductStatus.DOC_APPROVED)
                .stream()
                .map(ProductResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(products);
    }

    @PreAuthorize("hasRole('INSPECTOR')")
    @PostMapping
    public ResponseEntity<InspectionResponse> createInspection(@Valid @RequestBody InspectionRequest request) {
        // Mark product as inspection pending once an inspection is created
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (product.getStatus() != ProductStatus.DOC_APPROVED) {
            throw new RuntimeException("Product must be DOC_APPROVED to start inspection. Current status: " + product.getStatus());
        }
        product.setStatus(ProductStatus.INSPECTION_PENDING);
        productRepository.save(product);

        Inspection inspection = new Inspection();
        inspection.setProductId(request.getProductId());
        inspection.setInspectorId(request.getInspectorId());
        inspection.setRemarks(request.getRemarks());
        inspection.setStatus("PENDING");
        Inspection saved = inspectionRepository.save(inspection);
        return new ResponseEntity<>(toResponse(saved), HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<InspectionResponse>> getInspectionsByProduct(@PathVariable Long productId) {
        List<Inspection> inspections = inspectionRepository.findByProductId(productId);
        List<InspectionResponse> responses = inspections.stream().map(this::toResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PreAuthorize("hasRole('INSPECTOR')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<InspectionResponse> approveInspection(@PathVariable Long id,
            @RequestBody(required = false) InspectionRequest request) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));
        inspection.setStatus("APPROVED");
        if (request != null && request.getRemarks() != null) {
            inspection.setRemarks(request.getRemarks());
        }

        // Stage 2 approve => product becomes fully APPROVED
        Product product = productRepository.findById(inspection.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(ProductStatus.APPROVED);
        productRepository.save(product);

        Inspection saved = inspectionRepository.save(inspection);
        return ResponseEntity.ok(toResponse(saved));
    }

    @PreAuthorize("hasRole('INSPECTOR')")
    @PutMapping("/{id}/reject")
    public ResponseEntity<InspectionResponse> rejectInspection(@PathVariable Long id,
            @RequestBody(required = false) InspectionRequest request) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inspection not found"));
        inspection.setStatus("REJECTED");
        if (request != null && request.getRemarks() != null) {
            inspection.setRemarks(request.getRemarks());
        }

        // Stage 2 reject => product becomes finally REJECTED
        Product product = productRepository.findById(inspection.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(ProductStatus.REJECTED);
        productRepository.save(product);

        Inspection saved = inspectionRepository.save(inspection);
        return ResponseEntity.ok(toResponse(saved));
    }

    private InspectionResponse toResponse(Inspection inspection) {
        InspectionResponse response = new InspectionResponse();
        response.setId(inspection.getId());
        response.setProductId(inspection.getProductId());
        response.setInspectorId(inspection.getInspectorId());
        response.setStatus(inspection.getStatus());
        response.setRemarks(inspection.getRemarks());
        response.setCreatedAt(inspection.getCreatedAt());
        response.setUpdatedAt(inspection.getUpdatedAt());
        return response;
    }
}
