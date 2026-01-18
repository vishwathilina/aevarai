package com.example.auction.notification;

import com.example.auction.delivery.entity.Notification;
import com.example.auction.delivery.repository.NotificationRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void notifyDocumentApproved(Long sellerId, String productTitle) {
        Notification notification = new Notification();
        notification.setUserId(sellerId);
        notification.setTitle("Document Review Approved");
        notification.setMessage("Your product \"" + productTitle
                + "\" has passed document review. It will now proceed to physical inspection.");
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public void notifyDocumentRejected(Long sellerId, String productTitle, String reason) {
        Notification notification = new Notification();
        notification.setUserId(sellerId);
        notification.setTitle("Document Review Rejected");
        notification
                .setMessage("Your product \"" + productTitle + "\" has been rejected during document review. Reason: "
                        + reason + ". You may resubmit with corrected documents.");
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public void notifyInspectionApproved(Long sellerId, String productTitle) {
        Notification notification = new Notification();
        notification.setUserId(sellerId);
        notification.setTitle("Physical Inspection Approved");
        notification.setMessage("Your product \"" + productTitle
                + "\" has passed physical inspection and is now approved for auction.");
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public void notifyInspectionRejected(Long sellerId, String productTitle, String reason) {
        Notification notification = new Notification();
        notification.setUserId(sellerId);
        notification.setTitle("Physical Inspection Rejected");
        notification.setMessage("Your product \"" + productTitle
                + "\" has been rejected during physical inspection. Reason: " + reason);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public void notifyAuctionCreated(Long sellerId, String productTitle, String startTime, String endTime) {
        Notification notification = new Notification();
        notification.setUserId(sellerId);
        notification.setTitle("Auction Scheduled");
        notification.setMessage("An auction has been scheduled for your product \"" + productTitle
                + "\". Start: " + startTime + ", End: " + endTime);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public void notifyAuctionStarted(Long sellerId, String productTitle, Long auctionId) {
        Notification notification = new Notification();
        notification.setUserId(sellerId);
        notification.setTitle("Auction Now Live!");
        notification.setMessage("The auction for your product \"" + productTitle
                + "\" is now LIVE! Auction ID: " + auctionId);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public void notifyAuctionWon(Long winnerId, String productTitle, Long auctionId, Double winningBid) {
        Notification notification = new Notification();
        notification.setUserId(winnerId);
        notification.setTitle("🎉 You Won the Auction!");
        notification.setMessage("Congratulations! You won the auction for \"" + productTitle
                + "\" with a bid of $" + String.format("%.2f", winningBid)
                + ". Please complete payment to receive your item. Auction ID: " + auctionId);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }
}
