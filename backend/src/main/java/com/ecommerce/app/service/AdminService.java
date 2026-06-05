package com.ecommerce.app.service;

import com.ecommerce.app.model.*;
import com.ecommerce.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PriceLockRepository priceLockRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // ── System Stats ──────────────────────────────────────────────
    public SystemStats getStats() {
        SystemStats s = new SystemStats();
        s.setTotalUsers(userRepository.count());
        s.setTotalProducts(productRepository.count());
        s.setTotalOrders(orderRepository.count());
        s.setActiveLocks(priceLockRepository.findByStatus(PriceLock.LockStatus.ACTIVE).size());
        s.setTotalRevenue(safeSum(Transaction.TransactionType.PAYMENT));
        s.setTotalCustomers(userRepository.countByRole(User.Role.CUSTOMER));
        s.setTotalSellers(userRepository.countByRole(User.Role.SELLER));
        s.setConfirmedOrders(orderRepository.countByStatus(Order.OrderStatus.CONFIRMED));
        s.setFailedOrders(orderRepository.countByStatus(Order.OrderStatus.FAILED));
        return s;
    }

    // ── User Management ───────────────────────────────────────────
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        users.forEach(u -> u.setPassword(null));
        return users;
    }

    @Transactional
    public User createUser(String username, String fullName, String email, String phone, String password, User.Role role) {
        if (userRepository.existsByUsername(username))
            throw new RuntimeException("Username already taken");
        if (userRepository.existsByEmail(email))
            throw new RuntimeException("Email already registered");
        if (role == User.Role.ADMIN)
            throw new RuntimeException("Cannot create ADMIN accounts");
        User user = new User();
        user.setUsername(username);
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setWalletBalance(java.math.BigDecimal.ZERO);
        return userRepository.save(user);
    }

    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    @Transactional
    public User changeUserRole(Long userId, User.Role role) {
        if (role == User.Role.ADMIN)
            throw new RuntimeException("Cannot assign ADMIN role");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() == User.Role.ADMIN)
            throw new RuntimeException("Cannot change role of an ADMIN account");
        String oldRole = user.getRole().name();
        user.setRole(role);
        userRepository.save(user);
        notificationService.send(user, "Your account role has been changed from " + oldRole +
                " to " + role.name() + " by the administrator.", "ROLE_CHANGE");
        return user;
    }

    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    // ── Product Management ────────────────────────────────────────
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional
    public Product toggleProductStatus(Long productId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        p.setActive(!p.isActive());
        return productRepository.save(p);
    }

    @Transactional
    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    // ── Order Management ──────────────────────────────────────────
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // ── Lock Management ───────────────────────────────────────────
    public List<PriceLock> getAllLocks() {
        return priceLockRepository.findAll();
    }

    private BigDecimal safeSum(Transaction.TransactionType type) {
        BigDecimal sum = transactionRepository.sumByType(type);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public static class SystemStats {
        private long totalUsers;
        private long totalCustomers;
        private long totalSellers;
        private long totalProducts;
        private long totalOrders;
        private long confirmedOrders;
        private long failedOrders;
        private long activeLocks;
        private BigDecimal totalRevenue;
        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long v) { this.totalUsers = v; }
        public long getTotalCustomers() { return totalCustomers; }
        public void setTotalCustomers(long v) { this.totalCustomers = v; }
        public long getTotalSellers() { return totalSellers; }
        public void setTotalSellers(long v) { this.totalSellers = v; }
        public long getTotalProducts() { return totalProducts; }
        public void setTotalProducts(long v) { this.totalProducts = v; }
        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long v) { this.totalOrders = v; }
        public long getConfirmedOrders() { return confirmedOrders; }
        public void setConfirmedOrders(long v) { this.confirmedOrders = v; }
        public long getFailedOrders() { return failedOrders; }
        public void setFailedOrders(long v) { this.failedOrders = v; }
        public long getActiveLocks() { return activeLocks; }
        public void setActiveLocks(long v) { this.activeLocks = v; }
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal v) { this.totalRevenue = v; }
    }
}
