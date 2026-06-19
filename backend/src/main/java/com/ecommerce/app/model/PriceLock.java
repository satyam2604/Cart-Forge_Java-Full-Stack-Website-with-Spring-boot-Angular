package com.ecommerce.app.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_locks")
public class PriceLock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private BigDecimal lockedPrice;
    private Integer quantity;
    private BigDecimal lockFee;

    @Column(columnDefinition = "DATETIME")
    private LocalDateTime lockedAt;

    @Column(columnDefinition = "DATETIME")
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    private LockStatus status;

    public enum LockStatus { ACTIVE, EXPIRED, USED, REFUNDED }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public BigDecimal getLockedPrice() { return lockedPrice; }
    public void setLockedPrice(BigDecimal lockedPrice) { this.lockedPrice = lockedPrice; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getLockFee() { return lockFee; }
    public void setLockFee(BigDecimal lockFee) { this.lockFee = lockFee; }
    public LocalDateTime getLockedAt() { return lockedAt; }
    public void setLockedAt(LocalDateTime lockedAt) { this.lockedAt = lockedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LockStatus getStatus() { return status; }
    public void setStatus(LockStatus status) { this.status = status; }
}
