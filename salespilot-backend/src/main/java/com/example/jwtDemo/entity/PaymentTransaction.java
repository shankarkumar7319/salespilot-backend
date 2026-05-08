package com.example.jwtDemo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private PurchaseOrder order;

    @Column(nullable = false, unique = true)
    private String razorpayPaymentId;

    private String razorpayOrderId;

    @Column(length = 500)
    private String razorpaySignature;

    @Column(nullable = false)
    private String status;

    public PaymentTransaction() {}

    public PaymentTransaction(PurchaseOrder order, String razorpayPaymentId,
                              String razorpayOrderId, String razorpaySignature, String status) {
        this.order = order;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpaySignature = razorpaySignature;
        this.status = status;
    }

    public Long getId() {
    	return id; 
    }

    public User getUser() { 
    	return user;
    }

    public void setUser(User user) { this.user = user; }

    public PurchaseOrder getOrder() { return order; }

    public void setOrder(PurchaseOrder order) { this.order = order; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public String getRazorpayOrderId() { return razorpayOrderId; }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpaySignature() { return razorpaySignature; }

    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }

    public String getStatus() { return status; }

    public void setStatus(String status) { this.status = status; }
}