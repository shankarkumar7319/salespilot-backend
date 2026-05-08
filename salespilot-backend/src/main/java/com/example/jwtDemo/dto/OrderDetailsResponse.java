package com.example.jwtDemo.dto;

import java.math.BigDecimal;
import java.util.List;

public record OrderDetailsResponse(
        Long orderId,
        String status,
        BigDecimal totalAmount,
        String razorpayOrderId,
        List<OrderItemResponse> items
) {}