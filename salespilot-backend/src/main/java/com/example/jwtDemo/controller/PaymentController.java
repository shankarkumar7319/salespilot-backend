package com.example.jwtDemo.controller;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.jwtDemo.dto.CreatePaymentOrderResponse;
import com.example.jwtDemo.dto.OrderDetailsResponse;
import com.example.jwtDemo.dto.OrderItemResponse;
import com.example.jwtDemo.dto.TransactionDTO;
import com.example.jwtDemo.dto.VerifyPaymentRequest;
import com.example.jwtDemo.entity.PurchaseOrder;
import com.example.jwtDemo.repository.PaymentTransactionRepository;
import com.example.jwtDemo.repository.PurchaseOrderRepository;
import com.example.jwtDemo.service.PaymentService;

@RestController
@RequestMapping("/customer/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    public PaymentController(PaymentService paymentService,
                             PurchaseOrderRepository purchaseOrderRepository,
                             PaymentTransactionRepository paymentTransactionRepository) {
        this.paymentService = paymentService;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
    }

    // ✅ CREATE ORDER
    @PostMapping("/create-order")
    public ResponseEntity<CreatePaymentOrderResponse> createOrder() {
        return ResponseEntity.ok(paymentService.createPaymentOrder());
    }

    // ✅ VERIFY PAYMENT
    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request) {

        String message = paymentService.verifyPayment(request);
        return ResponseEntity.ok(Map.of("message", message));
    }


    // ✅ ORDER DETAILS
    @GetMapping("/orders/{id}")
    public OrderDetailsResponse getOrderDetails(@PathVariable Long id) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println(SecurityContextHolder.getContext().getAuthentication());
        
        PurchaseOrder order = purchaseOrderRepository
                .findByIdAndUserUsername(id, username)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProduct().getName(),
                        item.getProduct().getImageUrl(),
                        item.getQuantity(),
                        item.getPriceAtPurchase()
                ))
                .toList();

        return new OrderDetailsResponse(
                order.getId(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getRazorpayOrderId(),
                items
        );
    }

    
    // ✅ ALL ORDERS
    @GetMapping("/orders")
    public List<PurchaseOrder> getOrders() {
        return purchaseOrderRepository.findAll();
    }

    // ✅ TRANSACTIONS (FIXED 🔥)
    @GetMapping("/transactions")
    public List<TransactionDTO> getTransactions() {

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return paymentTransactionRepository
                .findByOrderUserUsername(username)
                .stream()
                .map(txn -> new TransactionDTO(
                        txn.getRazorpayPaymentId(),
                        txn.getOrder().getId(),
                        txn.getStatus()
                ))
                .toList();
    }
}