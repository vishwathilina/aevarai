package com.example.auction.product.repository;

import com.example.auction.product.entity.Product;
import com.example.auction.product.entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatus(ProductStatus status);

    List<Product> findBySellerId(Long sellerId);

    List<Product> findBySellerIdAndStatus(Long sellerId, ProductStatus status);

    // Count methods for seller dashboard
    long countBySellerId(Long sellerId);

    long countBySellerIdAndStatus(Long sellerId, ProductStatus status);
}
