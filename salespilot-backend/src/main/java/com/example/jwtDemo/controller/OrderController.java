package com.example.jwtDemo.controller;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.jwtDemo.entity.PurchaseOrder;
import com.example.jwtDemo.repository.PurchaseOrderRepository;

@RestController
@RequestMapping("/customer/orders")
public class OrderController {

    private final PurchaseOrderRepository purchaseOrderRepository;

    public OrderController(PurchaseOrderRepository purchaseOrderRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    // ✅ ADD YOUR METHOD HERE
    @GetMapping
    public List<PurchaseOrder> getOrders() {

        System.out.println("AUTH DEBUG: " +
            SecurityContextHolder.getContext().getAuthentication());

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return purchaseOrderRepository.findByUserUsername(username);
    }
    
    @GetMapping("/{id}")
    public PurchaseOrder getOrderById(@PathVariable Long id) {

        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        return order;
    }
    
}