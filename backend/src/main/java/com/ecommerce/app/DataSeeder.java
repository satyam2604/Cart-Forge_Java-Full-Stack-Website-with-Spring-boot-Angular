package com.ecommerce.app;

import com.ecommerce.app.model.Product;
import com.ecommerce.app.model.User;
import com.ecommerce.app.repository.ProductRepository;
import com.ecommerce.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        User customer = createUser("customer1", "password", "customer@example.com", "9999999991", User.Role.CUSTOMER, new BigDecimal("5000"));
        User seller   = createUser("seller1",   "password", "seller@example.com",   "9999999992", User.Role.SELLER,   BigDecimal.ZERO);
        createUser("finance1", "password", "finance@example.com", "9999999993", User.Role.FINANCE, BigDecimal.ZERO);
        createUser("admin1",   "password", "admin@example.com",   "9999999994", User.Role.ADMIN,   BigDecimal.ZERO);

        // Electronics
        createProduct("iPhone 15 Pro",        "Latest Apple smartphone with A17 Pro chip and titanium design", "Electronics", "https://placehold.co/400x300/1a1a2e/ffffff?text=iPhone+15+Pro",      new BigDecimal("129999"), 50,  seller);
        createProduct("Samsung Galaxy S24 Ultra", "Samsung flagship with 200MP camera and S Pen",             "Electronics", "https://placehold.co/400x300/0f3460/ffffff?text=Galaxy+S24+Ultra",   new BigDecimal("124999"), 30,  seller);
        createProduct("Sony WH-1000XM5",      "Industry-leading noise cancelling wireless headphones",        "Electronics", "https://placehold.co/400x300/16213e/ffffff?text=Sony+WH-1000XM5",    new BigDecimal("29999"),  100, seller);
        createProduct("Apple AirPods Pro 2",  "Active noise cancellation with Adaptive Audio",                "Electronics", "https://placehold.co/400x300/e2e8f0/1a1a2e?text=AirPods+Pro+2",     new BigDecimal("24900"),  80,  seller);
        createProduct("OnePlus 12",           "Flagship killer with Snapdragon 8 Gen 3",                      "Electronics", "https://placehold.co/400x300/7c0a02/ffffff?text=OnePlus+12",         new BigDecimal("64999"),  60,  seller);
        createProduct("iPad Air M2",          "Powerful iPad with M2 chip and Liquid Retina display",         "Electronics", "https://placehold.co/400x300/2563eb/ffffff?text=iPad+Air+M2",        new BigDecimal("74900"),  40,  seller);

        // Computers
        createProduct("MacBook Air M3",       "Supercharged by M3 chip, fanless design, all-day battery",    "Computers",   "https://placehold.co/400x300/374151/ffffff?text=MacBook+Air+M3",     new BigDecimal("114900"), 20,  seller);
        createProduct("Dell XPS 15",          "Premium laptop with OLED display and Intel Core i9",           "Computers",   "https://placehold.co/400x300/1e3a5f/ffffff?text=Dell+XPS+15",        new BigDecimal("189999"), 15,  seller);
        createProduct("Logitech MX Master 3S","Advanced wireless mouse with ultra-fast scrolling",            "Computers",   "https://placehold.co/400x300/064e3b/ffffff?text=MX+Master+3S",       new BigDecimal("9995"),   120, seller);
        createProduct("Samsung 27\" 4K Monitor","UHD IPS monitor with USB-C and HDR600",                     "Computers",   "https://placehold.co/400x300/1e293b/ffffff?text=Samsung+4K+Monitor", new BigDecimal("45999"),  25,  seller);

        // Footwear
        createProduct("Nike Air Max 270",     "Lightweight running shoes with Max Air cushioning",            "Footwear",    "https://placehold.co/400x300/dc2626/ffffff?text=Nike+Air+Max+270",   new BigDecimal("12995"),  200, seller);
        createProduct("Adidas Ultraboost 23", "Responsive running shoes with BOOST midsole",                  "Footwear",    "https://placehold.co/400x300/000000/ffffff?text=Adidas+Ultraboost",  new BigDecimal("17999"),  150, seller);
        createProduct("Puma RS-X",            "Bold retro-inspired sneakers with RS cushioning",              "Footwear",    "https://placehold.co/400x300/0369a1/ffffff?text=Puma+RS-X",          new BigDecimal("8999"),   180, seller);
        createProduct("Woodland Leather Boots","Genuine leather waterproof trekking boots",                   "Footwear",    "https://placehold.co/400x300/78350f/ffffff?text=Woodland+Boots",     new BigDecimal("5999"),   90,  seller);

        // Clothing
        createProduct("Levi's 511 Slim Jeans","Classic slim fit jeans in stretch denim",                      "Clothing",    "https://placehold.co/400x300/1d4ed8/ffffff?text=Levis+511+Jeans",    new BigDecimal("3999"),   150, seller);
        createProduct("Allen Solly Formal Shirt","Premium cotton slim fit formal shirt",                      "Clothing",    "https://placehold.co/400x300/0891b2/ffffff?text=Allen+Solly+Shirt",  new BigDecimal("1799"),   200, seller);
        createProduct("Nike Dri-FIT T-Shirt", "Moisture-wicking performance training tee",                    "Clothing",    "https://placehold.co/400x300/dc2626/ffffff?text=Nike+Dri-FIT",       new BigDecimal("1499"),   300, seller);
        createProduct("Zara Puffer Jacket",   "Lightweight water-resistant puffer jacket",                    "Clothing",    "https://placehold.co/400x300/4b5563/ffffff?text=Zara+Puffer+Jacket", new BigDecimal("6999"),   75,  seller);

        // Home & Kitchen
        createProduct("Instant Pot Duo 7-in-1","Electric pressure cooker, slow cooker, rice cooker and more","Home & Kitchen","https://placehold.co/400x300/b45309/ffffff?text=Instant+Pot+Duo",  new BigDecimal("8999"),   60,  seller);
        createProduct("Dyson V15 Detect",     "Powerful cordless vacuum with laser dust detection",           "Home & Kitchen","https://placehold.co/400x300/7c3aed/ffffff?text=Dyson+V15+Detect", new BigDecimal("52900"),  35,  seller);
        createProduct("Philips Air Fryer XXL","7L digital air fryer with rapid air technology",               "Home & Kitchen","https://placehold.co/400x300/b91c1c/ffffff?text=Philips+Air+Fryer",new BigDecimal("12995"),  55,  seller);
        createProduct("Nespresso Vertuo Pop", "Single-serve coffee machine with 5 cup sizes",                 "Home & Kitchen","https://placehold.co/400x300/3f1f0a/ffffff?text=Nespresso+Vertuo", new BigDecimal("14999"),  45,  seller);

        // Sports & Fitness
        createProduct("Fitbit Charge 6",      "Advanced fitness tracker with built-in GPS and heart rate",    "Sports & Fitness","https://placehold.co/400x300/065f46/ffffff?text=Fitbit+Charge+6", new BigDecimal("14999"),  70,  seller);
        createProduct("Yoga Mat Premium",     "6mm thick non-slip eco-friendly yoga mat",                     "Sports & Fitness","https://placehold.co/400x300/0d9488/ffffff?text=Yoga+Mat+Premium",new BigDecimal("1999"),   250, seller);
        createProduct("Adjustable Dumbbell Set","5-52.5 lbs adjustable dumbbells with stand",                 "Sports & Fitness","https://placehold.co/400x300/1f2937/ffffff?text=Dumbbell+Set",    new BigDecimal("24999"),  40,  seller);

        // Books
        createProduct("Atomic Habits",        "An easy and proven way to build good habits by James Clear",   "Books",       "https://placehold.co/400x300/f59e0b/1a1a2e?text=Atomic+Habits",     new BigDecimal("499"),    500, seller);
        createProduct("The Psychology of Money","Timeless lessons on wealth, greed and happiness",            "Books",       "https://placehold.co/400x300/10b981/ffffff?text=Psychology+of+Money",new BigDecimal("399"),    400, seller);
        createProduct("Clean Code",           "A handbook of agile software craftsmanship by Robert Martin",  "Books",       "https://placehold.co/400x300/2563eb/ffffff?text=Clean+Code",         new BigDecimal("699"),    300, seller);
    }

    private User createUser(String username, String password, String email, String phone, User.Role role, BigDecimal wallet) {
        User u = new User();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(password));
        u.setEmail(email);
        u.setPhone(phone);
        u.setRole(role);
        u.setWalletBalance(wallet);
        return userRepository.save(u);
    }

    private void createProduct(String name, String desc, String category, String imageUrl, BigDecimal price, int stock, User seller) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setCategory(category);
        p.setImageUrl(imageUrl);
        p.setPrice(price);
        p.setStock(stock);
        p.setSeller(seller);
        productRepository.save(p);
    }
}
