package com.ecommerce.app.controller;

import com.ecommerce.app.model.Transaction;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.TransactionRepository;
import com.ecommerce.app.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "6. User", description = "Profile and wallet — Any logged-in user")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping("/profile")
    @Operation(summary = "Get my profile", description = "Returns logged-in user's profile including wallet balance.")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetails ud) {
        User user = userRepository.findByUsername(ud.getUsername()).orElseThrow();
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/wallet/topup")
    @Operation(summary = "Top up wallet",
            description = "Add money to wallet. Body: { \"amount\": \"500\", \"paymentMethod\": \"UPI\", \"transactionId\": \"TXN123\" }. " +
                    "Use transactionId starting with FAIL to simulate failure.")
    public ResponseEntity<Map<String, Object>> topUpWallet(@AuthenticationPrincipal UserDetails ud,
                                                            @RequestBody Map<String, String> body) {
        User user = userRepository.findByUsername(ud.getUsername()).orElseThrow();
        BigDecimal amount = new BigDecimal(body.get("amount"));
        String transactionId = body.getOrDefault("transactionId", "");
        String paymentMethod = body.getOrDefault("paymentMethod", "UPI");

        if (transactionId.toUpperCase().startsWith("FAIL")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Payment failed. Please try again."));
        }

        user.setWalletBalance(user.getWalletBalance().add(amount));
        userRepository.save(user);

        Transaction t = new Transaction();
        t.setUser(user);
        t.setType(Transaction.TransactionType.WALLET_CREDIT);
        t.setAmount(amount);
        t.setDescription("Wallet top-up via " + paymentMethod);
        t.setReferenceId(transactionId);
        t.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(t);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "walletBalance", user.getWalletBalance(),
                "message", "₹" + amount + " added to your wallet successfully!"
        ));
    }
}
