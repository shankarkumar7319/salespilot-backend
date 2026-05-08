package com.example.jwtDemo.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.jwtDemo.dto.CreatePaymentOrderResponse;
import com.example.jwtDemo.dto.VerifyPaymentRequest;
import com.example.jwtDemo.entity.CartItem;
import com.example.jwtDemo.entity.OrderItem;
import com.example.jwtDemo.entity.PaymentTransaction;
import com.example.jwtDemo.entity.Product;
import com.example.jwtDemo.entity.PurchaseOrder;
import com.example.jwtDemo.entity.User;
import com.example.jwtDemo.repository.CartItemRepository;
import com.example.jwtDemo.repository.OrderItemRepository;
import com.example.jwtDemo.repository.PaymentTransactionRepository;
import com.example.jwtDemo.repository.ProductRepository;
import com.example.jwtDemo.repository.PurchaseOrderRepository;
import com.example.jwtDemo.repository.UserRepository;

@Service
public class PaymentService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final RazorpayService razorpayService;

    public PaymentService(CartItemRepository cartItemRepository,
                          UserRepository userRepository,
                          ProductRepository productRepository,
                          PurchaseOrderRepository purchaseOrderRepository,
                          OrderItemRepository orderItemRepository,
                          PaymentTransactionRepository paymentTransactionRepository,
                          RazorpayService razorpayService) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.razorpayService = razorpayService;
    }

    // =========================
    // CREATE PAYMENT ORDER
    // =========================
    @Transactional
    public CreatePaymentOrderResponse createPaymentOrder() {

        User user = getCurrentUser();
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            if (cartItem.getQuantity() > product.getStock()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            BigDecimal subtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            totalAmount = totalAmount.add(subtotal);
        }

        // ✅ Clean status
        PurchaseOrder order = new PurchaseOrder(
                user,
                totalAmount,
                razorpayService.getCurrency(),
                "PENDING_PAYMENT"
        );

        purchaseOrderRepository.save(order);

        long amountInPaise = toPaise(totalAmount);
        String receipt = "receipt_" + order.getId();

        RazorpayService.RazorpayOrderResponse razorpayOrder =
                razorpayService.createOrder(amountInPaise, receipt);

        order.setRazorpayOrderId(razorpayOrder.id());
        purchaseOrderRepository.save(order);

        return new CreatePaymentOrderResponse(
                order.getId(),
                razorpayOrder.id(),
                amountInPaise,
                razorpayService.getCurrency(),
                razorpayService.getKeyId()
        );
    }

    // =========================
    // VERIFY PAYMENT
    // =========================
    @Transactional
    public String verifyPayment(VerifyPaymentRequest request) {

        User user = getCurrentUser();

        PurchaseOrder order = purchaseOrderRepository
                .findByIdAndUser(request.localOrderId(), user)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (request.razorpayPaymentId() == null) {

            // ✅ SAVE FAILED TRANSACTION
            PaymentTransaction failedTxn = new PaymentTransaction(
                    order,
                    "FAILED_" + System.currentTimeMillis(),
                    request.razorpayOrderId(),
                    null,
                    "FAILED"
            );

            failedTxn.setUser(user);
            paymentTransactionRepository.save(failedTxn);

            // ✅ UPDATE ORDER
            order.setStatus("FAILED");
            purchaseOrderRepository.save(order);

            return "Payment failed";
        }
        
        
        // ✅ Prevent duplicate payment
        if (paymentTransactionRepository.existsByRazorpayPaymentId(request.razorpayPaymentId())) {
            return "Payment already processed";
        }

        if ("PAID".equals(order.getStatus())) {
            return "Order already paid";
        }

        if (!order.getRazorpayOrderId().equals(request.razorpayOrderId())) {
            throw new RuntimeException("Razorpay order id mismatch");
        }

        try {
            boolean validSignature = razorpayService.verifySignature(
                    order.getRazorpayOrderId(),
                    request.razorpayPaymentId(),
                    request.razorpaySignature()
            );

            if (!validSignature) {

                PaymentTransaction failedTxn = new PaymentTransaction(
                        order,
                        request.razorpayPaymentId(),
                        request.razorpayOrderId(),
                        request.razorpaySignature(),
                        "FAILED"
                );

                failedTxn.setUser(user);   // ✅ IMPORTANT

                paymentTransactionRepository.save(failedTxn);

                throw new RuntimeException("Invalid payment signature");
            }

            List<CartItem> cartItems = cartItemRepository.findByUser(user);

            if (cartItems.isEmpty()) {
                throw new RuntimeException("Cart is empty");
            }

            for (CartItem cartItem : cartItems) {

                Product product = cartItem.getProduct();

                if (cartItem.getQuantity() > product.getStock()) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }

                // ✅ Save order item
                OrderItem orderItem = new OrderItem(
                        order,
                        product,
                        cartItem.getQuantity(),
                        product.getPrice()
                );

                orderItemRepository.save(orderItem);

                // ✅ Update stock
                product.setStock(product.getStock() - cartItem.getQuantity());
                productRepository.save(product);
            }

            // ✅ Save success transaction
            PaymentTransaction txn = new PaymentTransaction(
                    order,
                    request.razorpayPaymentId(),
                    request.razorpayOrderId(),
                    request.razorpaySignature(),
                    "SUCCESS"
            );

            // 🔥 ADD THIS
            txn.setUser(user);

         // 🔥 DEBUG (must add)
            System.out.println("PAYMENT ID FROM REQUEST: " + request.razorpayPaymentId());

            paymentTransactionRepository.save(txn);

            // ✅ Update order
            order.setStatus("PAID");
            purchaseOrderRepository.save(order);

            // ✅ Clear cart
            cartItemRepository.deleteByUser(user);

            return "Payment successful and order placed";

        } 
        
        catch (Exception e) {

            // ✅ Update order
            order.setStatus("FAILED");
            purchaseOrderRepository.save(order);

            // ✅ SAVE FAILED TRANSACTION (MISSING PART)
            PaymentTransaction failedTxn = new PaymentTransaction(
                    order,
                    request.razorpayPaymentId() != null ? request.razorpayPaymentId() : "FAILED_" + System.currentTimeMillis(),
                    request.razorpayOrderId(),
                    request.razorpaySignature(),
                    "FAILED"
            );

            failedTxn.setUser(user);

            paymentTransactionRepository.save(failedTxn);

            throw e;
        } 
    }

    // =========================
    // HELPER METHODS
    // =========================
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private long toPaise(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }
}