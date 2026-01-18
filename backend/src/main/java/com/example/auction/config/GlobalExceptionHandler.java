package com.example.auction.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, Object> error = new HashMap<>();
        HttpStatusCode statusCode = ex.getStatusCode();
        
        error.put("timestamp", LocalDateTime.now().toString());
        error.put("status", statusCode.value());
        
        // Get reason phrase from HttpStatus if possible
        String reasonPhrase = "Error";
        if (statusCode instanceof HttpStatus) {
            reasonPhrase = ((HttpStatus) statusCode).getReasonPhrase();
        } else {
            // Fallback: use status code to get reason phrase
            try {
                HttpStatus httpStatus = HttpStatus.valueOf(statusCode.value());
                reasonPhrase = httpStatus.getReasonPhrase();
            } catch (IllegalArgumentException e) {
                reasonPhrase = "Unknown Status";
            }
        }
        
        error.put("error", reasonPhrase);
        error.put("message", ex.getReason() != null ? ex.getReason() : reasonPhrase);
        
        return ResponseEntity.status(statusCode).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now().toString());
        error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        error.put("error", HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
        error.put("message", ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
        error.put("exception", ex.getClass().getSimpleName());
        
        // Log the full exception for debugging
        System.err.println("Unhandled exception: " + ex.getMessage());
        ex.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
