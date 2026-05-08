package com.example.jwtDemo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.jwtDemo.entity.PaymentTransaction;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    List<PaymentTransaction> findByOrderUserUsername(String username);

    boolean existsByRazorpayPaymentId(String paymentId);
}