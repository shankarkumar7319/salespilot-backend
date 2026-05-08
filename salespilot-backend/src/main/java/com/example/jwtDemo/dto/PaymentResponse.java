package com.example.jwtDemo.dto;

public record PaymentResponse(
        Long orderId,
        String razorpayPaymentId,
        String razorpayOrderId,
        String status
) {}