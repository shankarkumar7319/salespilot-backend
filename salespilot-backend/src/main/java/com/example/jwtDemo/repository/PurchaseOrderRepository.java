package com.example.jwtDemo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.jwtDemo.entity.PurchaseOrder;
import com.example.jwtDemo.entity.User;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByIdAndUser(Long id, User user);

    // ✅ ADD THIS (for order history)
    List<PurchaseOrder> findByUserUsername(String username);
    
    Optional<PurchaseOrder> findByIdAndUserUsername(Long id, String username);
}