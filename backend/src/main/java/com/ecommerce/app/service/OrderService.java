package com.ecommerce.app.service;

import com.ecommerce.app.dto.Dtos.*;
import com.ecommerce.app.model.*;
import com.ecommerce.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartItemRepository cartItemRepository;
    private final PriceLockRepository priceLockRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public CheckoutValidationResponse validateCart(User user) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        CheckoutValidationResponse response = new CheckoutValidationResponse();

        if (cartItems.isEmpty()) {
            response.setValid(false);
            response.setMessage("Cart is empty");
            return response;
        }

        List<CartItemResponse> items = new ArrayList<>();
        // payableTotal = what user pays NOW (90% for locked, 100% for unlocked)
        BigDecimal payableTotal = BigDecimal.ZERO;
        boolean valid = true;
        StringBuilder issues = new StringBuilder();

        for (CartItem item : cartItems) {
            Product product = item.getProduct();

            if (!product.isActive() || !product.getSeller().isActive()) {
                valid = false;
                issues.append(product.getName()).append(" is unavailable. ");
                continue;
            }
            if (product.getStock() < item.getQuantity()) {
                valid = false;
                issues.append(product.getName()).append(" has insufficient stock. ");
                continue;
            }

            CartItemResponse r = new CartItemResponse();
            r.setId(item.getId());
            r.setProductId(product.getId());
            r.setProductName(product.getName());
            r.setQuantity(item.getQuantity());
            r.setLivePrice(product.getPrice());

            var lockOpt = priceLockRepository.findByUserAndProductAndStatus(
                    user, product, PriceLock.LockStatus.ACTIVE);

            if (lockOpt.isPresent() && lockOpt.get().getExpiresAt().isAfter(LocalDateTime.now())) {
                PriceLock lock = lockOpt.get();
                r.setLocked(true);
                r.setAppliedPrice(lock.getLockedPrice());
                r.setLockExpiry(lock.getExpiresAt());
                // User already paid lock fee (e.g. 10%), so now pays remaining 90%
                BigDecimal feeAlreadyPaid = lock.getLockFee(); // total fee for all qty
                BigDecimal fullAmount = lock.getLockedPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                BigDecimal payable = fullAmount.subtract(feeAlreadyPaid).max(BigDecimal.ZERO);
                r.setPayableAmount(payable);
                r.setLockFeeAlreadyPaid(feeAlreadyPaid);
                payableTotal = payableTotal.add(payable);
            } else {
                r.setLocked(false);
                r.setAppliedPrice(product.getPrice());
                r.setPayableAmount(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                r.setLockFeeAlreadyPaid(BigDecimal.ZERO);
                payableTotal = payableTotal.add(r.getPayableAmount());
            }

            items.add(r);
        }

        response.setValid(valid);
        response.setMessage(valid ? "Cart validated successfully" : issues.toString().trim());
        response.setItems(items);
        response.setTotalAmount(payableTotal);
        return response;
    }

    @Transactional
    public PaymentResponse processPayment(User user, PaymentRequest req) {
        CheckoutValidationResponse validation = validateCart(user);
        if (!validation.isValid()) {
            PaymentResponse r = new PaymentResponse();
            r.setSuccess(false);
            r.setMessage("Checkout blocked: " + validation.getMessage());
            return r;
        }

        boolean paymentSuccess = !req.getTransactionId().startsWith("FAIL");

        if (!paymentSuccess) {
            notificationService.send(user, "Payment failed. Your cart has been retained.", "PAYMENT_FAILED");
            PaymentResponse r = new PaymentResponse();
            r.setSuccess(false);
            r.setMessage("Payment Failed. Please try again.");
            return r;
        }

        Order order = new Order();
        order.setOrderId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setUser(user);
        order.setTotalAmount(validation.getTotalAmount());
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.CONFIRMED);
        order.setPaymentMethod(req.getPaymentMethod());
        order.setPaymentTransactionId(req.getTransactionId());

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItemResponse cartItem : validation.getItems()) {
            Product product = productRepository.findById(cartItem.getProductId()).orElseThrow();
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            priceLockRepository.findByUserAndProductAndStatus(user, product, PriceLock.LockStatus.ACTIVE)
                    .ifPresent(lock -> {
                        // If live price dropped below locked price, credit the difference now
                        BigDecimal livePrice = product.getPrice();
                        if (livePrice.compareTo(lock.getLockedPrice()) < 0) {
                            BigDecimal diff = lock.getLockedPrice().subtract(livePrice);
                            BigDecimal credit = diff.multiply(BigDecimal.valueOf(cartItem.getQuantity()))
                                    .setScale(2, RoundingMode.HALF_UP);
                            User u = lock.getUser();
                            u.setWalletBalance(u.getWalletBalance().add(credit));
                            userRepository.save(u);
                            Transaction ct = new Transaction();
                            ct.setUser(u);
                            ct.setType(Transaction.TransactionType.PRICE_DROP_CREDIT);
                            ct.setAmount(credit);
                            ct.setDescription("Price drop credit for " + product.getName() +
                                    " on order " + order.getOrderId());
                            ct.setReferenceId(order.getOrderId());
                            ct.setCreatedAt(LocalDateTime.now());
                            transactionRepository.save(ct);
                            notificationService.send(u, "\u20b9" + credit + " price drop credit added to your wallet for " +
                                    product.getName() + " (order " + order.getOrderId() + ").", "PRICE_DROP");
                        }
                        lock.setStatus(PriceLock.LockStatus.USED);
                        priceLockRepository.save(lock);
                    });

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(product);
            oi.setQuantity(cartItem.getQuantity());
            oi.setUnitPrice(cartItem.getAppliedPrice());
            oi.setTotalPrice(cartItem.getPayableAmount());
            oi.setPriceLocked(cartItem.isLocked());
            orderItems.add(oi);
        }

        order.setItems(orderItems);
        orderRepository.save(order);

        Transaction t = new Transaction();
        t.setUser(user);
        t.setType(Transaction.TransactionType.PAYMENT);
        t.setAmount(validation.getTotalAmount());
        t.setDescription("Payment for order " + order.getOrderId());
        t.setReferenceId(order.getOrderId());
        t.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(t);

        cartItemRepository.deleteByUser(user);

        notificationService.send(user, "Order " + order.getOrderId() + " confirmed! You paid \u20b9" +
                validation.getTotalAmount() + " (lock fees already deducted).", "ORDER_CONFIRMED");

        PaymentResponse r = new PaymentResponse();
        r.setSuccess(true);
        r.setMessage("Order placed successfully!");
        r.setOrderId(order.getOrderId());
        return r;
    }

    public List<Order> getOrderHistory(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }
}
