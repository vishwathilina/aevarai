package com.example.auction.auth.controller;

import com.example.auction.auth.dto.ProfileResponse;
import com.example.auction.auth.dto.ProfileUpdateRequest;
import com.example.auction.auth.entity.User;
import com.example.auction.auth.repository.UserRepository;
import com.example.auction.auction.entity.AuctionStatus;
import com.example.auction.auction.repository.AuctionRepository;
import com.example.auction.bidding.repository.BidRepository;
import com.example.auction.product.entity.ProductStatus;
import com.example.auction.product.repository.ProductRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository userRepository;
    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final ProductRepository productRepository;

    public ProfileController(
            UserRepository userRepository,
            BidRepository bidRepository,
            AuctionRepository auctionRepository,
            ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.bidRepository = bidRepository;
        this.auctionRepository = auctionRepository;
        this.productRepository = productRepository;
    }

    /**
     * GET /api/profile
     * Returns the current user's profile with statistics
     */
    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Calculate statistics
        int bidsPlaced = (int) bidRepository.countByBidderId(userId);
        int auctionsWon = auctionRepository.findByWinnerUserIdAndStatus(userId, AuctionStatus.ENDED).size();
        int itemsSold = (int) productRepository.countBySellerIdAndStatus(userId, ProductStatus.SOLD);

        ProfileResponse response = ProfileResponse.fromEntity(user, bidsPlaced, auctionsWon, itemsSold);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/profile
     * Updates the current user's profile
     */
    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            HttpServletRequest httpRequest) {
        Long userId = getAuthenticatedUserId(httpRequest);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Update fields if provided
        if (request.name != null && !request.name.trim().isEmpty()) {
            user.setName(request.name.trim());
        }
        if (request.email != null && !request.email.trim().isEmpty()) {
            // Check if email is already taken by another user
            userRepository.findByEmail(request.email.trim())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getId().equals(userId)) {
                            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
                        }
                    });
            user.setEmail(request.email.trim());
        }
        if (request.phone != null) {
            user.setPhone(request.phone.trim().isEmpty() ? null : request.phone.trim());
        }
        if (request.location != null) {
            user.setLocation(request.location.trim().isEmpty() ? null : request.location.trim());
        }

        userRepository.save(user);

        // Recalculate statistics
        int bidsPlaced = (int) bidRepository.countByBidderId(userId);
        int auctionsWon = auctionRepository.findByWinnerUserIdAndStatus(userId, AuctionStatus.ENDED).size();
        int itemsSold = (int) productRepository.countBySellerIdAndStatus(userId, ProductStatus.SOLD);

        ProfileResponse response = ProfileResponse.fromEntity(user, bidsPlaced, auctionsWon, itemsSold);
        return ResponseEntity.ok(response);
    }

    /**
     * Extract and validate user ID from JWT token
     */
    private Long getAuthenticatedUserId(HttpServletRequest request) {
        Object userIdAttr = request.getAttribute("userId");

        if (userIdAttr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        try {
            return Long.parseLong(userIdAttr.toString());
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid user ID");
        }
    }
}
