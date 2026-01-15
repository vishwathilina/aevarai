package com.example.auction.payment.dto;

public class WebhookPayload {

    private String eventType;
    private String paymentIntentId;
    private String status;
    private String chargeId;

    public String getEventType() {
        return eventType;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public String getStatus() {
        return status;
    }

    public String getChargeId() {
        return chargeId;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setChargeId(String chargeId) {
        this.chargeId = chargeId;
    }
}
