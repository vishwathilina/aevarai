package com.example.auction.product.repository;

import com.example.auction.product.entity.ProductDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductDocumentRepository extends JpaRepository<ProductDocument, Long> {
    List<ProductDocument> findByProductId(Long productId);

    void deleteByProductId(Long productId);
}
