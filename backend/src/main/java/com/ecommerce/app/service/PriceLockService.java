package com.ecommerce.app.service;

import com.ecommerce.app.dto.Dtos.*;
import com.ecommerce.app.model.*;
import com.ecommerce.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PriceLockService {

    // 75% refund in ALL cancellation cases
    private static final BigDecimal REFUND_PERCENT = new BigDecimal("0.75");
    private final Random random = new Random();

    private final PriceLockRepository priceLockRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;

    /** Fee: 1 day=5%, 3 days=7%, 5 days=10% */
    private BigDecimal getLockFeePercent(int lockDays) {
        if (lockDays <= 1) return new BigDecimal("0.05");
        if (lockDays <= 3) return new BigDecimal("0.07");
        return new BigDecimal("0.10");
    }

    @Transactional
    public PriceLock lockPrice(User user, LockPriceRequest req) {
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < req.getQuantity())
            throw new RuntimeException("Insufficient stock");

        priceLockRepository.findByUserAndProductAndStatus(user, product, PriceLock.LockStatus.ACTIVE)
                .ifPresent(l -> { throw new RuntimeException("Active lock already exists for this product"); });

        BigDecimal feePercent = getLockFeePercent(req.getLockHours());
        BigDecimal lockFee = product.getPrice()
                .multiply(feePercent)
                .multiply(BigDecimal.valueOf(req.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);

        if (user.getWalletBalance().compareTo(lockFee) < 0)
            throw new RuntimeException("Insufficient wallet balance for lock fee");

        user.setWalletBalance(user.getWalletBalance().subtract(lockFee));
        userRepository.save(user);

        PriceLock lock = new PriceLock();
        lock.setUser(user);
        lock.setProduct(product);
        lock.setLockedPrice(product.getPrice());
        lock.setQuantity(req.getQuantity());
        lock.setLockFee(lockFee);
        lock.setLockedAt(LocalDateTime.now());
        // lockHours field now stores days; convert to hours
        lock.setExpiresAt(LocalDateTime.now().plusHours((long) req.getLockHours() * 24));
        lock.setStatus(PriceLock.LockStatus.ACTIVE);
        priceLockRepository.save(lock);

        String feeLabel = (int)(feePercent.doubleValue() * 100) + "%";
        recordTransaction(user, Transaction.TransactionType.LOCK_FEE, lockFee,
                "Lock fee (" + feeLabel + ") for " + product.getName(), lock.getId().toString());
        notificationService.send(user, "Price locked for " + product.getName() +
                " at \u20b9" + product.getPrice() + " for " + req.getLockHours() + " day(s). Fee: \u20b9" + lockFee, "LOCK");
        return lock;
    }

    @Transactional
    public void cancelLock(User user, Long lockId) {
        PriceLock lock = priceLockRepository.findById(lockId)
                .orElseThrow(() -> new RuntimeException("Lock not found"));
        if (!lock.getUser().getId().equals(user.getId()))
            throw new RuntimeException("Unauthorized");
        if (lock.getStatus() != PriceLock.LockStatus.ACTIVE)
            throw new RuntimeException("Only active locks can be cancelled");

        lock.setStatus(PriceLock.LockStatus.REFUNDED);
        priceLockRepository.save(lock);

        // Always 75% refund on cancellation
        BigDecimal refund = lock.getLockFee().multiply(REFUND_PERCENT).setScale(2, RoundingMode.HALF_UP);
        user.setWalletBalance(user.getWalletBalance().add(refund));
        userRepository.save(user);

        recordTransaction(user, Transaction.TransactionType.REFUND, refund,
                "75% refund for cancelled lock on " + lock.getProduct().getName(), lock.getId().toString());
        notificationService.send(user, "Lock cancelled for " + lock.getProduct().getName() +
                ". \u20b9" + refund + " (75% of lock fee) refunded to your wallet.", "LOCK_EXPIRY");
    }

    public List<PriceLock> getUserLocks(User user) {
        return priceLockRepository.findByUser(user);
    }

    public List<PriceLock> getLockedProductsBySeller(User seller) {
        List<Product> sellerProducts = productRepository.findBySellerAndActiveTrue(seller);
        return sellerProducts.stream()
                .flatMap(p -> priceLockRepository.findByProductAndStatus(p, PriceLock.LockStatus.ACTIVE).stream())
                .toList();
    }

    /** Check for expired locks every 60 seconds */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processExpiredLocks() {
        List<PriceLock> expired = priceLockRepository.findByStatusAndExpiresAtBefore(
                PriceLock.LockStatus.ACTIVE, LocalDateTime.now());
        for (PriceLock lock : expired) {
            lock.setStatus(PriceLock.LockStatus.EXPIRED);
            priceLockRepository.save(lock);
            BigDecimal refund = lock.getLockFee().multiply(REFUND_PERCENT).setScale(2, RoundingMode.HALF_UP);
            User u = lock.getUser();
            u.setWalletBalance(u.getWalletBalance().add(refund));
            userRepository.save(u);
            recordTransaction(u, Transaction.TransactionType.REFUND, refund,
                    "75% refund for expired lock on " + lock.getProduct().getName(), lock.getId().toString());
            notificationService.send(u, "Price lock expired for " + lock.getProduct().getName() +
                    ". \u20b9" + refund + " (75%) refunded. Live price now applies.", "LOCK_EXPIRY");
        }
    }

    /** Randomly fluctuate product prices ±5% every 30 seconds */
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void fluctuatePrices() {
        List<Product> products = productRepository.findByActiveTrue();
        for (Product p : products) {
            if (random.nextInt(100) >= 40) continue;
            BigDecimal oldPrice = p.getPrice();
            double pct = (random.nextDouble() * 0.10) - 0.05;
            BigDecimal newPrice = oldPrice.multiply(BigDecimal.valueOf(1 + pct))
                    .setScale(0, RoundingMode.HALF_UP);
            if (newPrice.compareTo(BigDecimal.ONE) < 0) continue;
            p.setPrice(newPrice);
            productRepository.save(p);
            if (newPrice.compareTo(oldPrice) < 0) handlePriceDrop(p, oldPrice);
        }
    }

    @Transactional
    public void handlePriceDrop(Product product, BigDecimal oldPrice) {
        BigDecimal newPrice = product.getPrice();
        if (newPrice.compareTo(oldPrice) >= 0) return;
        // Only notify — credit is applied at order confirmation, not here
        List<PriceLock> activeLocks = priceLockRepository.findByProductAndStatus(product, PriceLock.LockStatus.ACTIVE);
        for (PriceLock lock : activeLocks) {
            notificationService.send(lock.getUser(),
                    "Price of " + product.getName() + " dropped to \u20b9" + newPrice +
                    "! Your locked price is \u20b9" + lock.getLockedPrice() +
                    ". Difference will be credited to your wallet when you complete your order.",
                    "PRICE_DROP");
        }
    }

    private void recordTransaction(User user, Transaction.TransactionType type,
                                   BigDecimal amount, String desc, String refId) {
        Transaction t = new Transaction();
        t.setUser(user);
        t.setType(type);
        t.setAmount(amount);
        t.setDescription(desc);
        t.setReferenceId(refId);
        t.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(t);
    }
}
