package com.example.auction.product.controller;

import com.example.auction.product.dto.ProductCreateRequest;
import com.example.auction.product.dto.ProductResponse;
import com.example.auction.product.entity.Product;
import com.example.auction.product.entity.ProductImage;
import com.example.auction.product.entity.ProductDocument;
import com.example.auction.product.entity.ProductStatus;
import com.example.auction.product.repository.ProductRepository;
import com.example.auction.product.repository.ProductImageRepository;
import com.example.auction.product.repository.ProductDocumentRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductDocumentRepository productDocumentRepository;

    public ProductController(ProductRepository productRepository, ProductImageRepository productImageRepository, ProductDocumentRepository productDocumentRepository) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.productDocumentRepository = productDocumentRepository;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> submitProduct(
            @RequestBody ProductCreateRequest request,
            HttpServletRequest httpRequest) {

        // Get userId from request attribute (set by JwtFilter)
        Object userIdAttr = httpRequest.getAttribute("userId");
        if (userIdAttr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                "User authentication required. Please ensure you are logged in.");
        }

        Long sellerId;
        try {
            sellerId = Long.parseLong(userIdAttr.toString());
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                "Invalid user authentication. Please login again.");
        }

        // Validate request
        if (request.title == null || request.title.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product title is required");
        }
        if (request.description == null || request.description.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product description is required");
        }
        if (request.category == null || request.category.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product category is required");
        }

        try {
            Product product = new Product();
            product.setTitle(request.title.trim());
            product.setDescription(request.description.trim());
            product.setCategory(request.category.trim());
            product.setHandlingFeePaid(request.handlingFeePaid);
            product.setSellerId(sellerId);
            product.setStatus(ProductStatus.PENDING);

            Product savedProduct = productRepository.save(product);
            
            if (savedProduct == null || savedProduct.getId() == null) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Failed to save product: Product was not persisted");
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ProductResponse.withMessage(savedProduct, "Product submitted successfully"));
        } catch (ResponseStatusException e) {
            // Re-throw ResponseStatusException as-is
            throw e;
        } catch (Exception e) {
            // Log the full exception for debugging
            System.err.println("Error saving product: " + e.getMessage());
            System.err.println("Exception type: " + e.getClass().getName());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Failed to save product: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
        }
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

        if (product.getStatus() != ProductStatus.DOC_REJECTED && product.getStatus() != ProductStatus.REJECTED) {
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

    // ========== PRODUCT IMAGES ==========

    @PostMapping("/{productId}/images")
    public ResponseEntity<Map<String, Object>> addProductImages(
            @PathVariable Long productId,
            @RequestBody List<String> imageUrls,
            HttpServletRequest httpRequest) {

        Long sellerId = Long.parseLong((String) httpRequest.getAttribute("userId"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (!product.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only add images to your own products");
        }

        for (String imageUrl : imageUrls) {
            ProductImage image = new ProductImage();
            image.setProductId(productId);
            image.setImageUrl(imageUrl);
            productImageRepository.save(image);
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Images added successfully",
                        "count", imageUrls.size()));
    }

    @GetMapping("/{productId}/images")
    public List<ProductImage> getProductImages(@PathVariable Long productId) {
        return productImageRepository.findByProductId(productId);
    }

    // ========== PRODUCT DOCUMENTS ==========

    @PostMapping("/{productId}/documents")
    public ResponseEntity<Map<String, Object>> addProductDocuments(
            @PathVariable Long productId,
            @RequestBody List<Map<String, String>> documents,
            HttpServletRequest httpRequest) {

        Long sellerId = Long.parseLong((String) httpRequest.getAttribute("userId"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (!product.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only add documents to your own products");
        }

        for (Map<String, String> doc : documents) {
            ProductDocument document = new ProductDocument();
            document.setProductId(productId);
            document.setDocumentUrl(doc.get("documentUrl"));
            document.setDocumentType(doc.get("documentType"));
            productDocumentRepository.save(document);
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Documents added successfully",
                        "count", documents.size()));
    }

    @GetMapping("/{productId}/documents")
    public List<ProductDocument> getProductDocuments(@PathVariable Long productId) {
        return productDocumentRepository.findByProductId(productId);
    }
}
