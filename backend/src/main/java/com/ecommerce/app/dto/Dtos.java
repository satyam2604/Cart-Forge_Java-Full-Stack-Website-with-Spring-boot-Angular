package com.ecommerce.app.dto;

import com.ecommerce.app.model.User;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class Dtos {

    public static class LoginRequest {
        private String username;
        private String password;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String username;
        private String password;
        private String fullName;
        private String email;
        private String phone;
        private User.Role role;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public User.Role getRole() { return role; }
        public void setRole(User.Role role) { this.role = role; }
    }

    public static class AuthResponse {
        private String token;
        private String username;
        private String role;
        private Long userId;
        public AuthResponse(String token, String username, String role, Long userId) {
            this.token = token; this.username = username; this.role = role; this.userId = userId;
        }
        public String getToken() { return token; }
        public String getUsername() { return username; }
        public String getRole() { return role; }
        public Long getUserId() { return userId; }
    }

    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String imageUrl;
        private Integer quantity;
        private BigDecimal livePrice;
        private BigDecimal appliedPrice;
        private boolean locked;
        private LocalDateTime lockExpiry;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getLivePrice() { return livePrice; }
        public void setLivePrice(BigDecimal livePrice) { this.livePrice = livePrice; }
        public BigDecimal getAppliedPrice() { return appliedPrice; }
        public void setAppliedPrice(BigDecimal appliedPrice) { this.appliedPrice = appliedPrice; }
        public boolean isLocked() { return locked; }
        public void setLocked(boolean locked) { this.locked = locked; }
        public LocalDateTime getLockExpiry() { return lockExpiry; }
        public void setLockExpiry(LocalDateTime lockExpiry) { this.lockExpiry = lockExpiry; }
        // payableAmount = what user pays now (full price minus lock fee already paid)
        private BigDecimal payableAmount;
        private BigDecimal lockFeeAlreadyPaid = BigDecimal.ZERO;
        public BigDecimal getPayableAmount() { return payableAmount; }
        public void setPayableAmount(BigDecimal v) { this.payableAmount = v; }
        public BigDecimal getLockFeeAlreadyPaid() { return lockFeeAlreadyPaid; }
        public void setLockFeeAlreadyPaid(BigDecimal v) { this.lockFeeAlreadyPaid = v; }
    }

    public static class AddToCartRequest {
        private Long productId;
        private Integer quantity;
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class UpdateCartRequest {
        private Integer quantity;
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class LockPriceRequest {
        private Long productId;
        private Integer quantity;
        private int lockHours;
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public int getLockHours() { return lockHours; }
        public void setLockHours(int lockHours) { this.lockHours = lockHours; }
    }

    public static class CheckoutValidationResponse {
        private boolean valid;
        private String message;
        private List<CartItemResponse> items;
        private BigDecimal totalAmount;
        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public List<CartItemResponse> getItems() { return items; }
        public void setItems(List<CartItemResponse> items) { this.items = items; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    }

    public static class PaymentRequest {
        private String paymentMethod;
        private String transactionId;
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    }

    public static class PaymentResponse {
        private boolean success;
        private String message;
        private String orderId;
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
    }

    public static class ProductRequest {
        private String name;
        private String description;
        private String category;
        private String imageUrl;
        private BigDecimal price;
        private Integer stock;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public Integer getStock() { return stock; }
        public void setStock(Integer stock) { this.stock = stock; }
    }

    public static class FinanceSummary {
        private BigDecimal totalLockRevenue;
        private BigDecimal totalRefunds;
        private BigDecimal totalWalletCredits;
        private BigDecimal totalPayments;
        private long totalOrders;
        private long activeLocks;
        public BigDecimal getTotalLockRevenue() { return totalLockRevenue; }
        public void setTotalLockRevenue(BigDecimal v) { this.totalLockRevenue = v; }
        public BigDecimal getTotalRefunds() { return totalRefunds; }
        public void setTotalRefunds(BigDecimal v) { this.totalRefunds = v; }
        public BigDecimal getTotalWalletCredits() { return totalWalletCredits; }
        public void setTotalWalletCredits(BigDecimal v) { this.totalWalletCredits = v; }
        public BigDecimal getTotalPayments() { return totalPayments; }
        public void setTotalPayments(BigDecimal v) { this.totalPayments = v; }
        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long v) { this.totalOrders = v; }
        public long getActiveLocks() { return activeLocks; }
        public void setActiveLocks(long v) { this.activeLocks = v; }
    }
}
