package com.example.jwtDemo.dto;

public record TransactionDTO(
		
		String paymentId,
		Long orderId,
		String status
		
		) {

}
