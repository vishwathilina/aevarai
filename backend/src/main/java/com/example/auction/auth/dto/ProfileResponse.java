package com.example.auction.auth.dto;

import com.example.auction.auth.entity.User;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ProfileResponse {
    public Long id;
    public String name;
    public String email;
    public String phone;
    public String location;
    public String role;
    public String joinedDate;
    public ProfileStats stats;

    public static class ProfileStats {
        public int bidsPlaced;
        public int auctionsWon;
        public int itemsSold;
    }

    public static ProfileResponse fromEntity(User user, int bidsPlaced, int auctionsWon, int itemsSold) {
        ProfileResponse response = new ProfileResponse();
        response.id = user.getId();
        response.name = user.getName();
        response.email = user.getEmail();
        response.phone = user.getPhone();
        response.location = user.getLocation();
        response.role = user.getRole();
        
        // Format joined date
        if (user.getCreatedAt() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy");
            response.joinedDate = user.getCreatedAt().format(formatter);
        } else {
            response.joinedDate = "Unknown";
        }

        // Set stats
        response.stats = new ProfileStats();
        response.stats.bidsPlaced = bidsPlaced;
        response.stats.auctionsWon = auctionsWon;
        response.stats.itemsSold = itemsSold;

        return response;
    }
}
