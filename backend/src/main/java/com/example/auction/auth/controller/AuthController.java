package com.example.auction.auth.controller;

import com.example.auction.auth.dto.AuthResponse;
import com.example.auction.auth.dto.LoginRequest;
import com.example.auction.auth.dto.RegisterRequest;
import com.example.auction.auth.entity.User;
import com.example.auction.auth.repository.UserRepository;
import com.example.auction.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setName(request.name);
        user.setEmail(request.email);
        user.setPassword(request.password); // plaintext for now
        user.setRole(request.role);

        userRepository.save(user);

        AuthResponse res = new AuthResponse();
        res.userId = user.getId();
        res.role = user.getRole();
        res.message = "User registered successfully";

        return res;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.email)
                // avoid user enumeration; treat missing user the same as bad password
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!user.getPassword().equals(request.password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = JwtUtil.generateToken(user.getId(), user.getRole());

        AuthResponse res = new AuthResponse();
        res.userId = user.getId();
        res.role = user.getRole();
        res.token = token;
        res.message = "Login successful";

        return res;
    }

}
