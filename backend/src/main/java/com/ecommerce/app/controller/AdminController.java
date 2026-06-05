package com.ecommerce.app.controller;

import com.ecommerce.app.model.*;
import com.ecommerce.app.service.AdminService;
import com.ecommerce.app.service.AdminService.SystemStats;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "10. Admin", description = "Full system control — Admin token required (login as admin1)")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get system statistics", description = "Returns total users, products, orders, revenue, active locks.")
    public ResponseEntity<SystemStats> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @PostMapping("/users")
    @Operation(summary = "Create new user", description = "Admin creates a new CUSTOMER, SELLER or FINANCE user.")
    public ResponseEntity<User> createUser(@RequestBody Map<String, String> body) {
        User.Role role = User.Role.valueOf(body.getOrDefault("role", "CUSTOMER"));
        User user = adminService.createUser(
                body.get("username"), body.get("fullName"),
                body.get("email"), body.get("phone"),
                body.get("password"), role);
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users", description = "Returns all users in the system. Passwords are hidden.")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/toggle-status")
    @Operation(summary = "Toggle user active/inactive", description = "Activates or deactivates a user account.")
    public ResponseEntity<User> toggleUserStatus(
            @Parameter(description = "User ID") @PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUserStatus(id));
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Change user role",
            description = "Changes user role. Body: { \"role\": \"CUSTOMER\" } — options: CUSTOMER, SELLER, FINANCE, ADMIN")
    public ResponseEntity<User> changeRole(
            @Parameter(description = "User ID") @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.changeUserRole(id, User.Role.valueOf(body.get("role"))));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user", description = "Permanently deletes a user account.")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID") @PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/products")
    @Operation(summary = "Get all products", description = "Returns all products including inactive ones.")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(adminService.getAllProducts());
    }

    @PutMapping("/products/{id}/toggle-status")
    @Operation(summary = "Toggle product visibility", description = "Shows or hides a product from customers.")
    public ResponseEntity<Product> toggleProductStatus(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleProductStatus(id));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete product", description = "Permanently deletes a product.")
    public ResponseEntity<Void> deleteProduct(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        adminService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/orders")
    @Operation(summary = "Get all orders", description = "Returns all orders across all customers.")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @GetMapping("/locks")
    @Operation(summary = "Get all price locks", description = "Returns all price locks system-wide.")
    public ResponseEntity<List<PriceLock>> getAllLocks() {
        return ResponseEntity.ok(adminService.getAllLocks());
    }
}
