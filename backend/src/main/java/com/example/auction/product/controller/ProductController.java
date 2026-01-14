package com.example.auction.product.controller;

import com.example.auction.product.dto.ProductCreateRequest;
import com.example.auction.product.dto.ProductResponse;
import com.example.auction.product.entity.Product;
import com.example.auction.product.entity.ProductStatus;
import com.example.auction.product.repository.ProductRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> submitProduct(
            @RequestBody ProductCreateRequest request,
            HttpServletRequest httpRequest) {

        Long sellerId = Long.parseLong((String) httpRequest.getAttribute("userId"));

        Product product = new Product();
        product.setTitle(request.title);
        product.setDescription(request.description);
        product.setCategory(request.category);
        product.setHandlingFeePaid(request.handlingFeePaid);
        product.setSellerId(sellerId);
        product.setStatus(ProductStatus.PENDING);

        productRepository.save(product);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ProductResponse.withMessage(product, "Product submitted successfully"));
    }

    @GetMapping("/my")
    public List<ProductResponse> getMyProducts(HttpServletRequest httpRequest) {
        Long sellerId = Long.parseLong((String) httpRequest.getAttribute("userId"));
        return productRepository.findBySellerId(sellerId)
                .stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    @PutMapping("/{id}/resubmit")
    public ResponseEntity<ProductResponse> resubmitProduct(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        Long sellerId = Long.parseLong((String) httpRequest.getAttribute("userId"));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (!product.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only resubmit your own products");
        }

        if (product.getStatus() != ProductStatus.REJECTED && product.getStatus() != ProductStatus.DOC_REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only rejected products can be resubmitted. Current status: " + product.getStatus());
        }

        product.setStatus(ProductStatus.PENDING);
        product.setReviewedBy(null);
        product.setReviewedAt(null);
        product.setRejectionReason(null);
        product.setReviewRemarks(null);

        productRepository.save(product);

        return ResponseEntity.ok(ProductResponse.withMessage(product, "Product resubmitted for review"));
    }

    @GetMapping("/approved")
    public List<ProductResponse> getApprovedProducts() {
        return productRepository.findByStatus(ProductStatus.APPROVED)
                .stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public ProductResponse getProductById(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return ProductResponse.fromEntity(product);
    }
}
