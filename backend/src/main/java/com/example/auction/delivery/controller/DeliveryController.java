package com.example.auction.delivery.controller;

import com.example.auction.delivery.dto.DeliveryRequest;
import com.example.auction.delivery.entity.Delivery;
import com.example.auction.delivery.repository.DeliveryRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @PostMapping
    public ResponseEntity<Delivery> createDelivery(@Valid @RequestBody DeliveryRequest request) {
        if (deliveryRepository.findByAuctionId(request.getAuctionId()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        Delivery delivery = new Delivery();
        delivery.setAuctionId(request.getAuctionId());
        delivery.setDeliveryType(request.getDeliveryType());
        delivery.setDeliveryFee(request.getDeliveryFee());
        delivery.setStatus("PENDING");

        Delivery saved = deliveryRepository.save(delivery);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<Object> getDeliveryByAuction(@PathVariable Long auctionId) {
        Optional<Delivery> delivery = deliveryRepository.findByAuctionId(auctionId);
        return delivery.<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Delivery not found"));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Object> completeDelivery(@PathVariable Long id) {
        Optional<Delivery> deliveryOpt = deliveryRepository.findById(id);
        if (deliveryOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Delivery not found");
        }
        Delivery delivery = deliveryOpt.get();
        delivery.setStatus("COMPLETED");
        Delivery saved = deliveryRepository.save(delivery);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateDelivery(@PathVariable Long id, @Valid @RequestBody DeliveryRequest request) {
        Optional<Delivery> deliveryOpt = deliveryRepository.findById(id);
        if (deliveryOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Delivery not found");
        }
        Delivery delivery = deliveryOpt.get();
        if (request.getDeliveryType() != null) {
            delivery.setDeliveryType(request.getDeliveryType());
        }
        if (request.getDeliveryFee() != null) {
            delivery.setDeliveryFee(request.getDeliveryFee());
        }
        Delivery saved = deliveryRepository.save(delivery);
        return ResponseEntity.ok(saved);
    }
}
