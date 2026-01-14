package com.example.auction.product.controller;

import com.example.auction.product.dto.ProductResponse;
import com.example.auction.product.entity.Product;
import com.example.auction.product.entity.ProductStatus;
import com.example.auction.product.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductRepository productRepository;

    public AdminProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/approved")
    public List<ProductResponse> getApprovedProducts() {
        return productRepository.findByStatus(ProductStatus.APPROVED)
                .stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<ProductResponse> lockProductForAuction(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (product.getStatus() != ProductStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only approved products can be locked for auction. Current status: " + product.getStatus());
        }

        product.setStatus(ProductStatus.AUCTIONED);
        productRepository.save(product);

        return ResponseEntity.ok(ProductResponse.withMessage(product, "Product locked for auction"));
    }

    @PutMapping("/{id}/sold")
    public ResponseEntity<ProductResponse> markProductAsSold(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (product.getStatus() != ProductStatus.AUCTIONED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only auctioned products can be marked as sold. Current status: " + product.getStatus());
        }

        product.setStatus(ProductStatus.SOLD);
        productRepository.save(product);

        return ResponseEntity.ok(ProductResponse.withMessage(product, "Product marked as sold"));
    }

    @PutMapping("/{id}/unlock")
    public ResponseEntity<ProductResponse> unlockProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (product.getStatus() != ProductStatus.AUCTIONED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only auctioned products can be unlocked. Current status: " + product.getStatus());
        }

        product.setStatus(ProductStatus.APPROVED);
        productRepository.save(product);

        return ResponseEntity.ok(ProductResponse.withMessage(product, "Product unlocked and available for auction"));
    }
}
