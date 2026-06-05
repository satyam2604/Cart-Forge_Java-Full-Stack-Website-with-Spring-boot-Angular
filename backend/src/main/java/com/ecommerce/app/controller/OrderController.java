package com.ecommerce.app.controller;

import com.ecommerce.app.dto.Dtos.*;
import com.ecommerce.app.model.Order;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.UserRepository;
import com.ecommerce.app.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "5. Orders", description = "Checkout and order history — Customer token required")
@SecurityRequirement(name = "Bearer Authentication")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @GetMapping("/validate")
    @Operation(summary = "Validate cart before checkout",
            description = "Checks stock, seller status, and applies locked/live prices. Call this before checkout.")
    public ResponseEntity<CheckoutValidationResponse> validateCart(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.validateCart(getUser(ud)));
    }

    @PostMapping("/checkout")
    @Operation(summary = "Process payment and place order",
            description = "Processes payment and creates order. Use any transactionId for success. " +
                    "Start transactionId with 'FAIL' to simulate failure. " +
                    "Body: { \"paymentMethod\": \"UPI\", \"transactionId\": \"TXN123\" }")
    public ResponseEntity<PaymentResponse> checkout(@AuthenticationPrincipal UserDetails ud,
                                                     @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(orderService.processPayment(getUser(ud), req));
    }

    @GetMapping("/history")
    @Operation(summary = "Get order history", description = "Returns all orders for the logged-in customer, newest first.")
    public ResponseEntity<List<Order>> getHistory(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(orderService.getOrderHistory(getUser(ud)));
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByUsername(ud.getUsername()).orElseThrow();
    }
}
