# 🛒 Cart-Forge — Price Lock E-Commerce Platform

> A full-stack e-commerce web application built with **Spring Boot** and **Angular** featuring a unique **Price Lock** system that lets customers lock product prices before they fluctuate — so you always pay what you saw.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Demo Accounts](#demo-accounts)
- [Price Lock System](#price-lock-system)
- [Payment Simulation](#payment-simulation)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Scheduled Jobs](#scheduled-jobs)
- [User Roles & Access](#user-roles--access)
- [Screenshots](#screenshots)

---

## Overview

Cart-Forge solves the biggest pain point in online shopping — **price uncertainty**. Products fluctuate in price every 30 seconds. Customers can lock a price by paying a small fee (5%, 7%, or 10% depending on duration), and at checkout they only pay the remaining amount. If the price drops after locking, the difference is credited to their wallet when the order is confirmed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT |
| ORM | Spring Data JPA, Hibernate |
| Database | H2 In-Memory (auto-seeded on startup) |
| API Docs | Swagger / OpenAPI 3 (SpringDoc) |
| Frontend | Angular 17, TypeScript, Standalone Components |
| Styling | Custom CSS (no external UI library) |
| Build | Maven (backend), Angular CLI (frontend) |

---

## Key Features

### 🔒 Price Lock (Core USP)
- Lock any product price for **1 day (5% fee)**, **3 days (7% fee)**, or **5 days (10% fee)**
- Lock fee is deducted from wallet immediately
- At checkout, you pay only the **remaining %** (95%, 93%, or 90%)
- If price drops after locking, the **difference is credited to your wallet** when order is confirmed
- Cancel anytime — **75% of lock fee refunded** to wallet
- Lock expires automatically — **75% refunded** on expiry

### 📈 Real-Time Price Fluctuation
- Product prices change randomly **±5% every 30 seconds** (40% chance per product)
- Cart polls every 30 seconds and shows **price up / price down** indicators
- Locked items are protected from price increases

### 💳 Wallet System
- Built-in wallet with top-up via **UPI** or **Card**
- All transactions recorded (lock fees, payments, refunds, price-drop credits)
- Wallet balance visible on products page

### 🛍️ Shopping Flow
- Browse products with search and category filter
- Pagination (12 products per page)
- Quantity selector (1–10 per product)
- Add to cart with popup toast notification
- Cart with +/− quantity controls
- Checkout with order summary showing exact payable amount

### 👤 Role-Based Access
- **Customer** — browse, lock, cart, checkout, orders
- **Seller** — manage products, view locked items
- **Finance** — revenue dashboard, transaction reports
- **Admin** — full system control, user management, add/delete users

### 🔔 Notifications
- In-app bell icon with unread badge
- Notifications for: price lock, lock expiry, order confirmed, payment failed, price drop, role change

---

## Project Structure

```
ecommerce-app/
├── backend/
│   └── src/main/java/com/ecommerce/app/
│       ├── controller/        # 11 REST controllers
│       ├── service/           # 8 business logic services
│       ├── model/             # 8 JPA entities
│       ├── repository/        # 7 Spring Data repositories
│       ├── dto/               # Request/Response DTOs
│       ├── security/          # JWT filter, config, utils
│       └── DataSeeder.java    # Auto-seeds demo data on startup
│
└── frontend/
    └── src/app/
        ├── core/
        │   ├── models.ts          # TypeScript interfaces
        │   ├── services/          # HTTP services (auth, cart, product, etc.)
        │   ├── guards/            # Auth + role guards
        │   └── interceptors/      # JWT token interceptor
        ├── features/
        │   ├── landing/           # Public landing page
        │   ├── auth/              # Login + Register
        │   ├── products/          # Product listing with lock & cart
        │   ├── cart/              # Cart with qty controls
        │   ├── checkout/          # Payment page
        │   ├── orders/            # Order history + price locks
        │   ├── seller/            # Seller dashboard
        │   ├── finance/           # Finance dashboard
        │   └── admin/             # Admin panel
        └── shared/
            └── components/        # Footer component
```

---

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+ and npm
- Angular CLI: `npm install -g @angular/cli`

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/cart-forge.git
cd cart-forge/ecommerce-app
```

### 2. Run the Backend
```bash
cd backend
mvn spring-boot:run
```

Backend starts on: **http://localhost:8081**

| URL | Description |
|---|---|
| http://localhost:8081/api | REST API base |
| http://localhost:8081/swagger-ui.html | Swagger API docs |
| http://localhost:8081/h2-console | H2 database console |

H2 Console credentials:
- JDBC URL: `jdbc:h2:mem:ecommercedb`
- Username: `sa`
- Password: *(leave empty)*

### 3. Run the Frontend
```bash
cd frontend
npm install
ng serve
```

Frontend starts on: **http://localhost:4200**

> ⚠️ Start the backend **before** the frontend. The database is seeded automatically on first startup.

---

## Demo Accounts

All accounts use password: **`password`**

| Role | Username | Starting Wallet |
|---|---|---|
| Customer | `customer1` | ₹5,000 |
| Seller | `seller1` | ₹0 |
| Finance | `finance1` | ₹0 |
| Admin | `admin1` | ₹0 |

> The database resets every time the backend restarts (H2 in-memory). All seed data is re-created automatically.

---

## Price Lock System

### How It Works

```
Customer locks price
        │
        ▼
Lock fee deducted from wallet
(5% for 1 day / 7% for 3 days / 10% for 5 days)
        │
        ▼
Price fluctuates (every 30 seconds)
        │
   ┌────┴────┐
   │         │
Price UP   Price DOWN
   │         │
   │         ▼
   │   Notification sent:
   │   "Difference will be credited on order"
   │
   ▼
Customer checks out
        │
        ▼
Pays remaining % (95% / 93% / 90%)
        │
        ▼
If live price < locked price:
  → Difference credited to wallet NOW
        │
        ▼
Order confirmed ✓
```

### Lock Fee & Refund Table

| Duration | Lock Fee | Checkout Payment | Cancel Refund | Expiry Refund |
|---|---|---|---|---|
| 1 Day | 5% | 95% of locked price | 75% of fee | 75% of fee |
| 3 Days | 7% | 93% of locked price | 75% of fee | 75% of fee |
| 5 Days | 10% | 90% of locked price | 75% of fee | 75% of fee |

### Price Drop Credit
- Price drop credit is **only applied when the order is confirmed**
- If you cancel the lock or don't buy, no price drop credit is given
- Notification is sent when price drops to inform you of the pending credit

---

## Payment Simulation

This project simulates a payment gateway. No real payment is processed.

| Transaction ID | Result |
|---|---|
| Any value (e.g. `TXN123456`, `UPI987`) | ✅ Payment Success |
| Starts with `FAIL` (e.g. `FAIL001`) | ❌ Payment Failure |

Supported payment methods: **UPI** (UPI ID + Transaction ID) and **Card** (card number, expiry, CVV + Transaction ID).

---

## API Reference

### Authentication — No token required
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT token |

### Products — Any authenticated user
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Get all active products |

### Cart — Customer only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | Get cart items |
| POST | `/api/cart` | Add item `{ productId, quantity }` |
| PUT | `/api/cart/{id}` | Update item quantity `{ quantity }` |
| DELETE | `/api/cart/{id}` | Remove item |

### Price Locks — Customer only
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/locks` | Lock price `{ productId, quantity, lockHours }` (lockHours = days: 1/3/5) |
| GET | `/api/locks` | Get all user's locks |
| DELETE | `/api/locks/{id}` | Cancel active lock (75% refund) |

### Orders — Customer only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders/validate` | Validate cart before checkout |
| POST | `/api/orders/checkout` | Place order `{ paymentMethod, transactionId }` |
| GET | `/api/orders/history` | Order history |

### User & Wallet — Any authenticated user
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/user/profile` | Get profile + wallet balance |
| POST | `/api/user/wallet/topup` | Top up wallet `{ amount, paymentMethod, transactionId }` |

### Notifications — Any authenticated user
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | All notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| POST | `/api/notifications/mark-read` | Mark all as read |

### Seller — SELLER role only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/seller/products` | Seller's products |
| POST | `/api/seller/products` | Create product |
| PUT | `/api/seller/products/{id}` | Update product |
| GET | `/api/seller/locked-products` | Active locks on seller's products |

### Finance — FINANCE role only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/finance/summary` | Revenue dashboard |
| GET | `/api/finance/transactions` | All transactions (filter by `?type=LOCK_FEE\|PAYMENT\|REFUND\|WALLET_CREDIT\|PRICE_DROP_CREDIT`) |

### Admin — ADMIN role only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | System statistics |
| GET | `/api/admin/users` | All users (admins excluded from UI) |
| POST | `/api/admin/users` | Create new user (Customer/Seller/Finance only) |
| PUT | `/api/admin/users/{id}/toggle-status` | Activate / deactivate user |
| PUT | `/api/admin/users/{id}/role` | Change user role |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/products` | All products |
| PUT | `/api/admin/products/{id}/toggle-status` | Show / hide product |
| DELETE | `/api/admin/products/{id}` | Delete product |
| GET | `/api/admin/orders` | All orders |
| GET | `/api/admin/locks` | All price locks |

---

## Database Schema

```
users
  id, username, full_name, email, phone, password (BCrypt),
  role (CUSTOMER|SELLER|FINANCE|ADMIN), wallet_balance, active

products
  id, name, description, category, image_url, price, stock,
  seller_id (FK → users), active

cart_items
  id, user_id (FK), product_id (FK), quantity, applied_price

price_locks
  id, user_id (FK), product_id (FK), locked_price, quantity,
  lock_fee, locked_at, expires_at,
  status (ACTIVE|EXPIRED|USED|REFUNDED)

orders
  id, order_id (unique), user_id (FK), total_amount,
  created_at, status (PENDING|CONFIRMED|FAILED|CANCELLED),
  payment_method, payment_transaction_id

order_items
  id, order_id (FK), product_id (FK), quantity,
  unit_price, total_price, price_locked

transactions
  id, user_id (FK), type (LOCK_FEE|PAYMENT|REFUND|WALLET_CREDIT|PRICE_DROP_CREDIT),
  amount, description, reference_id, created_at

notifications
  id, user_id (FK), message, type, read, created_at
```

---

## Scheduled Jobs

| Job | Frequency | What It Does |
|---|---|---|
| `processExpiredLocks()` | Every 60 seconds | Marks expired locks, refunds 75% of lock fee to wallet |
| `fluctuatePrices()` | Every 30 seconds | Randomly changes product prices ±5% (40% chance per product). Notifies locked customers of price drops. |

---

## User Roles & Access

| Feature | Customer | Seller | Finance | Admin |
|---|---|---|---|---|
| Browse products | ✅ | ❌ | ❌ | ❌ |
| Lock prices | ✅ | ❌ | ❌ | ❌ |
| Cart & checkout | ✅ | ❌ | ❌ | ❌ |
| Order history | ✅ | ❌ | ❌ | ❌ |
| Wallet top-up | ✅ | ❌ | ❌ | ❌ |
| Manage products | ❌ | ✅ | ❌ | ❌ |
| View locked items | ❌ | ✅ | ❌ | ❌ |
| Finance dashboard | ❌ | ❌ | ✅ | ❌ |
| Transaction reports | ❌ | ❌ | ✅ | ❌ |
| User management | ❌ | ❌ | ❌ | ✅ |
| System stats | ❌ | ❌ | ❌ | ✅ |

---

## Validation Rules

| Field | Rule |
|---|---|
| Username | Must start with a letter or `_`, letters/numbers/underscore only, 3–20 chars |
| Full Name | Letters and spaces only, must start with a letter |
| Phone | Exactly 10 digits, must start with 6, 7, 8, or 9 |
| Password | Min 8 chars, must include uppercase, lowercase, number, and special char (`@$!%*?&`) |
| Email | Standard email format |
| Product stock (seller) | Minimum 10 units |

---

## Environment Configuration

**Backend** — `backend/src/main/resources/application.properties`
```properties
server.port=8081
spring.datasource.url=jdbc:h2:mem:ecommercedb
jwt.expiration=86400000   # 24 hours
```

**Frontend** — `frontend/src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api'
};
```

---

## License

This project is built for educational purposes as part of a DSA/Full-Stack course project.

---

<div align="center">
  <strong>Built with ❤️ using Spring Boot + Angular</strong><br>
  © 2026 Cart-Forge. All rights reserved.
</div>
