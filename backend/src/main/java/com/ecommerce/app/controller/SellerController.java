package com.ecommerce.app.controller;

import com.ecommerce.app.dto.Dtos.*;
import com.ecommerce.app.model.PriceLock;
import com.ecommerce.app.model.Product;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.UserRepository;
import com.ecommerce.app.service.PriceLockService;
import com.ecommerce.app.service.ProductService;
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
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@Tag(name = "8. Seller", description = "Product management — Seller token required (login as seller1)")
@SecurityRequirement(name = "Bearer Authentication")
public class SellerController {

    private final ProductService productService;
    private final PriceLockService priceLockService;
    private final UserRepository userRepository;

    @GetMapping("/products")
    @Operation(summary = "Get my products", description = "Returns all active products belonging to the logged-in seller.")
    public ResponseEntity<List<Product>> getProducts(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(productService.getSellerProducts(getUser(ud)));
    }

    @PostMapping("/products")
    @Operation(summary = "Create new product",
            description = "Creates a new product. Body: { \"name\": \"Product\", \"description\": \"Desc\", " +
                    "\"category\": \"Electronics\", \"imageUrl\": \"url\", \"price\": 999, \"stock\": 50 }")
    public ResponseEntity<Product> createProduct(@AuthenticationPrincipal UserDetails ud,
                                                  @RequestBody ProductRequest req) {
        return ResponseEntity.ok(productService.createProduct(getUser(ud), req));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update product price and stock",
            description = "Updates product details. If price is reduced, price drop credit is sent to all locked customers.")
    public ResponseEntity<Product> updateProduct(@AuthenticationPrincipal UserDetails ud,
                                                  @Parameter(description = "Product ID") @PathVariable Long id,
                                                  @RequestBody ProductRequest req) {
        return ResponseEntity.ok(productService.updateProduct(getUser(ud), id, req));
    }

    @GetMapping("/locked-products")
    @Operation(summary = "View locked products", description = "Returns all active price locks on the seller's products.")
    public ResponseEntity<List<PriceLock>> getLockedProducts(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(priceLockService.getLockedProductsBySeller(getUser(ud)));
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByUsername(ud.getUsername()).orElseThrow();
    }
}
