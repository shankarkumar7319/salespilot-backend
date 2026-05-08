package com.example.jwtDemo.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        String productName,
        String imageUrl,
        int quantity,
        BigDecimal price
) {}