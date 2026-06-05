package com.ecommerce.app.service;

import com.ecommerce.app.dto.Dtos.*;
import com.ecommerce.app.model.Product;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final PriceLockService priceLockService;

    public List<Product> getAllProducts() {
        return productRepository.findByActiveTrue();
    }

    public List<Product> getSellerProducts(User seller) {
        return productRepository.findBySellerAndActiveTrue(seller);
    }

    public Product createProduct(User seller, ProductRequest req) {
        Product p = new Product();
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setCategory(req.getCategory());
        p.setImageUrl(req.getImageUrl());
        p.setPrice(req.getPrice());
        p.setStock(req.getStock());
        p.setSeller(seller);
        return productRepository.save(p);
    }

    public Product updateProduct(User seller, Long productId, ProductRequest req) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!p.getSeller().getId().equals(seller.getId()))
            throw new RuntimeException("Unauthorized");

        BigDecimal oldPrice = p.getPrice();
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setCategory(req.getCategory());
        p.setImageUrl(req.getImageUrl());
        p.setPrice(req.getPrice());
        p.setStock(req.getStock());
        productRepository.save(p);

        // Handle price drop credit (US027)
        if (req.getPrice().compareTo(oldPrice) < 0) {
            priceLockService.handlePriceDrop(p, oldPrice);
        }

        return p;
    }
}
