package com.example.auction.delivery.controller;

import com.example.auction.delivery.entity.Notification;
import com.example.auction.delivery.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam(required = false) Long userId) {
        List<Notification> notifications = (userId != null)
                ? notificationRepository.findByUserId(userId)
                : notificationRepository.findByIsReadFalse();
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElse(null);
        if (notification == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Notification not found");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok("Notification marked as read");
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestParam Long userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        notifications.forEach(n -> {
            if (!n.getIsRead()) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
        return ResponseEntity.ok("All notifications marked as read");
    }
}
