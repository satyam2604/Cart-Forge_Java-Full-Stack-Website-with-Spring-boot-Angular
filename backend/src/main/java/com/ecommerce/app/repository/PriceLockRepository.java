package com.ecommerce.app.repository;

import com.ecommerce.app.model.PriceLock;
import com.ecommerce.app.model.Product;
import com.ecommerce.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PriceLockRepository extends JpaRepository<PriceLock, Long> {
    Optional<PriceLock> findByUserAndProductAndStatus(User user, Product product, PriceLock.LockStatus status);
    List<PriceLock> findByStatus(PriceLock.LockStatus status);
    List<PriceLock> findByProductAndStatus(Product product, PriceLock.LockStatus status);
    List<PriceLock> findByStatusAndExpiresAtBefore(PriceLock.LockStatus status, LocalDateTime time);
    List<PriceLock> findByUser(User user);
}
