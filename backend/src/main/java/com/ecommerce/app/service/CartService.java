package com.ecommerce.app.service;

import com.ecommerce.app.dto.Dtos.*;
import com.ecommerce.app.model.*;
import com.ecommerce.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final PriceLockRepository priceLockRepository;

    public List<CartItemResponse> getCart(User user) {
        return cartItemRepository.findByUser(user).stream()
                .map(item -> toResponse(item, user))
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemResponse addToCart(User user, AddToCartRequest req) {
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (product.getStock() < req.getQuantity())
            throw new RuntimeException("Insufficient stock");

        Optional<CartItem> existing = cartItemRepository.findByUserAndProduct(user, product);
        CartItem item = existing.orElse(new CartItem());
        item.setUser(user);
        item.setProduct(product);
        item.setQuantity(req.getQuantity());
        item.setAppliedPrice(product.getPrice());
        cartItemRepository.save(item);
        return toResponse(item, user);
    }

    @Transactional
    public CartItemResponse updateQuantity(User user, Long cartItemId, int quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (!item.getUser().getId().equals(user.getId()))
            throw new RuntimeException("Unauthorized");
        if (item.getProduct().getStock() < quantity)
            throw new RuntimeException("Insufficient stock");
        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return toResponse(item, user);
    }

    @Transactional
    public void removeFromCart(User user, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (!item.getUser().getId().equals(user.getId()))
            throw new RuntimeException("Unauthorized");
        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(User user) {
        cartItemRepository.deleteByUser(user);
    }

    public CartItemResponse toResponse(CartItem item, User user) {
        CartItemResponse r = new CartItemResponse();
        r.setId(item.getId());
        r.setProductId(item.getProduct().getId());
        r.setProductName(item.getProduct().getName());
        r.setImageUrl(item.getProduct().getImageUrl());
        r.setQuantity(item.getQuantity());
        r.setLivePrice(item.getProduct().getPrice());

        Optional<PriceLock> lock = priceLockRepository.findByUserAndProductAndStatus(
                user, item.getProduct(), PriceLock.LockStatus.ACTIVE);

        if (lock.isPresent() && lock.get().getExpiresAt().isAfter(LocalDateTime.now())) {
            r.setLocked(true);
            r.setAppliedPrice(lock.get().getLockedPrice());
            r.setLockExpiry(lock.get().getExpiresAt());
        } else {
            r.setLocked(false);
            r.setAppliedPrice(item.getProduct().getPrice());
        }
        return r;
    }
}
