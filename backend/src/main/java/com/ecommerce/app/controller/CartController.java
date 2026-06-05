package com.ecommerce.app.controller;

import com.ecommerce.app.dto.Dtos;
import com.ecommerce.app.dto.Dtos.*;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.UserRepository;
import com.ecommerce.app.service.CartService;
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
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "3. Cart", description = "Shopping cart management — Customer token required")
@SecurityRequirement(name = "Bearer Authentication")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get cart items", description = "Returns all items in the logged-in customer's cart with locked/live prices.")
    public ResponseEntity<List<CartItemResponse>> getCart(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(cartService.getCart(getUser(ud)));
    }

    @PostMapping
    @Operation(summary = "Add item to cart",
            description = "Add a product to cart. Body: { \"productId\": 1, \"quantity\": 1 }")
    public ResponseEntity<CartItemResponse> addToCart(@AuthenticationPrincipal UserDetails ud,
                                                       @RequestBody AddToCartRequest req) {
        return ResponseEntity.ok(cartService.addToCart(getUser(ud), req));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update cart item quantity", description = "Update quantity of a specific cart item.")
    public ResponseEntity<CartItemResponse> updateQuantity(@AuthenticationPrincipal UserDetails ud,
                                                           @Parameter(description = "Cart item ID") @PathVariable Long id,
                                                           @RequestBody Dtos.UpdateCartRequest req) {
        return ResponseEntity.ok(cartService.updateQuantity(getUser(ud), id, req.getQuantity()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove item from cart", description = "Remove a specific cart item by its cart item ID.")
    public ResponseEntity<Void> removeItem(@AuthenticationPrincipal UserDetails ud,
                                           @Parameter(description = "Cart item ID") @PathVariable Long id) {
        cartService.removeFromCart(getUser(ud), id);
        return ResponseEntity.ok().build();
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByUsername(ud.getUsername()).orElseThrow();
    }
}
