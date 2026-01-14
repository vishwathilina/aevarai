package com.example.auction.inspection.repository;

import com.example.auction.inspection.entity.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    List<Inspection> findByProductId(Long productId);

    List<Inspection> findByStatus(String status);
}
