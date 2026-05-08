package com.example.jwtDemo.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.*;

import com.example.jwtDemo.entity.PurchaseOrder;
import com.example.jwtDemo.repository.PurchaseOrderRepository;
import com.example.jwtDemo.repository.UserRepository;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;

    public AdminController(PurchaseOrderRepository purchaseOrderRepository,
                           UserRepository userRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard() {

        List<PurchaseOrder> orders = purchaseOrderRepository.findAll();

        long totalOrders = orders.size();

        double totalRevenue = orders.stream()
                .filter(o -> "PAID".equals(o.getStatus()))
                .mapToDouble(o -> o.getTotalAmount().doubleValue())
                .sum();

        // ✅ IMPORTANT FIX HERE

        List<Map<String, Object>> recentOrders = orders.stream()
                .sorted((o1, o2) -> Long.compare(o2.getId(), o1.getId())) // safer sorting
                .limit(50000)
                .map(o -> {

                    Map<String, Object> map = new HashMap<>();

                    map.put("id", o.getId());
                    map.put("username",
                            o.getUser() != null ? o.getUser().getUsername() : "N/A"); // ✅ null safe
                    map.put("total", o.getTotalAmount());
                    map.put("status", o.getStatus());

                    return map;
                })
                .collect(Collectors.toList()); // ✅ Java 8 compatible
        
        return Map.of(
                "totalOrders", totalOrders,
                "totalRevenue", totalRevenue,
                "totalUsers", userRepository.count(),
                "recentOrders", recentOrders
        );
    }
}