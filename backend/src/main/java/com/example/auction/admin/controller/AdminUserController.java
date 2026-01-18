package com.example.auction.admin.controller;

import com.example.auction.admin.dto.UserResponse;
import com.example.auction.admin.dto.UserUpdateRequest;
import com.example.auction.auth.entity.User;
import com.example.auction.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return UserResponse.fromEntity(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UserUpdateRequest request) {
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            // Check if email already exists for another user
            userRepository.findByEmail(request.getEmail())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getId().equals(id)) {
                            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
                        }
                    });
            user.setEmail(request.getEmail());
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            // Prevent changing ADMIN role
            if (user.getRole().equals("ADMIN") && !request.getRole().equals("ADMIN")) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot change ADMIN role");
            }
            // Validate role is one of the allowed roles
            String[] allowedRoles = {"BIDDER", "AUCTIONEER", "INSPECTOR", "ADMIN"};
            boolean isValidRole = false;
            for (String role : allowedRoles) {
                if (role.equals(request.getRole())) {
                    isValidRole = true;
                    break;
                }
            }
            if (!isValidRole) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role. Allowed roles: BIDDER, AUCTIONEER, INSPECTOR, ADMIN");
            }
            user.setRole(request.getRole());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(UserResponse.fromEntity(savedUser));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<UserResponse> activateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setActive(true);
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(UserResponse.fromEntity(savedUser));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Prevent deactivating ADMIN users
        if (user.getRole().equals("ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot deactivate ADMIN users");
        }

        user.setActive(false);
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(UserResponse.fromEntity(savedUser));
    }
}
