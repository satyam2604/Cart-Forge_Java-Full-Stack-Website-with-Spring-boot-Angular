package com.ecommerce.app.controller;

import com.ecommerce.app.dto.Dtos.*;
import com.ecommerce.app.model.PriceLock;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.UserRepository;
import com.ecommerce.app.service.PriceLockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/locks")
@RequiredArgsConstructor
@Tag(name = "4. Price Locks", description = "Lock product prices — Customer token required")
@SecurityRequirement(name = "Bearer Authentication")
public class PriceLockController {

    private final PriceLockService priceLockService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Lock a product price",
            description = "Locks the current price of a product. Lock fee = 10% of price × quantity. " +
                    "Body: { \"productId\": 1, \"quantity\": 1, \"lockHours\": 1 }")
    public ResponseEntity<PriceLock> lockPrice(@AuthenticationPrincipal UserDetails ud,
                                                @RequestBody LockPriceRequest req) {
        return ResponseEntity.ok(priceLockService.lockPrice(getUser(ud), req));
    }

    @GetMapping
    @Operation(summary = "Get my price locks", description = "Returns all price locks (active, expired, used) for the logged-in customer.")
    public ResponseEntity<List<PriceLock>> getUserLocks(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(priceLockService.getUserLocks(getUser(ud)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a price lock",
            description = "Cancels an active price lock. Full lock fee is refunded to wallet.")
    public ResponseEntity<Void> cancelLock(@AuthenticationPrincipal UserDetails ud,
                                           @Parameter(description = "Lock ID to cancel") @PathVariable Long id) {
        priceLockService.cancelLock(getUser(ud), id);
        return ResponseEntity.ok().build();
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByUsername(ud.getUsername()).orElseThrow();
    }
}
