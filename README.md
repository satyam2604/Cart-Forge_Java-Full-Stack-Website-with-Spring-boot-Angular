<<<<<<< HEAD
# Cart-Forge - Price Lock E-Commerce Application

Full-stack e-commerce app with price locking, checkout, payments, seller dashboard, and finance reporting.

## Tech Stack
- **Backend**: Spring Boot 3.2, Spring Security (JWT), Spring Data JPA, H2 Database
- **Frontend**: Angular 17 (Standalone Components), TypeScript

---

## Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+ and npm
- Angular CLI (`npm install -g @angular/cli`)

---

## Backend Setup

```bash
cd ecommerce-app/backend
mvn spring-boot:run
```

Backend runs on: http://localhost:8080  
H2 Console: http://localhost:8080/h2-console  
- JDBC URL: `jdbc:h2:mem:ecommercedb`
- Username: `sa`, Password: (empty)

---

## Frontend Setup

```bash
cd ecommerce-app/frontend
npm install
ng serve
```

Frontend runs on: http://localhost:4200

---

## Demo Accounts

| Role     | Username  | Password |
|----------|-----------|----------|
| Customer | customer1 | password |
| Seller   | seller1   | password |
| Finance  | finance1  | password |

Customer starts with ₹5000 wallet balance.

---

## Features by User Story

| US#  | Feature                        | Description |
|------|-------------------------------|-------------|
| US020 | Cart Revalidation             | Validates lock, price, stock, seller status before checkout |
| US021 | Proceed to Checkout           | Locked price applied if within lock period; live price if expired |
| US022 | Online Payment                | UPI / Card / Net Banking / Wallet simulation |
| US023 | Payment Success               | Order ID generated, stock updated, confirmation shown |
| US024 | Payment Failure               | Enter "FAIL..." as transaction ID to simulate failure; cart retained |
| US025 | Lock Expiry Handling          | Scheduled job runs every minute; expired locks updated, cart shows live price |
| US026 | Refund on Lock Expiry         | 75% refund auto-credited; 25% retained as service charge |
| US027 | Price Drop Credit             | When seller reduces price, difference credited to locked customers' wallets |
| US028 | Order History                 | Order list with ID, product, amount, status |
| US029 | Seller Login                  | Role-based JWT auth; seller-only routes protected |
| US030 | Manage Product Price & Stock  | Seller can create/update products; changes reflected in real-time |
| US031 | View Locked Products          | Seller sees all active locks with expiry details |
| US032 | Finance Dashboard             | Lock payments, refunds, wallet credits summary |
| US033 | Financial Reports             | CSV download of all transactions |
| US034 | Notifications                 | In-app notifications for lock, expiry, order, refund events |
| US035 | Logout & Session Management   | JWT invalidated on logout; protected routes redirect to login |

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login

### Products
- `GET /api/products` - List all active products

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add item `{ productId, quantity }`
- `DELETE /api/cart/{id}` - Remove item

### Price Locks
- `POST /api/locks` - Lock price `{ productId, quantity, lockHours }`
- `GET /api/locks` - Get user's locks

### Orders
- `GET /api/orders/validate` - Validate cart before checkout
- `POST /api/orders/checkout` - Process payment `{ paymentMethod, transactionId }`
- `GET /api/orders/history` - Order history

### Seller (SELLER role required)
- `GET /api/seller/products` - Seller's products
- `POST /api/seller/products` - Create product
- `PUT /api/seller/products/{id}` - Update product (triggers price drop credit if price reduced)
- `GET /api/seller/locked-products` - Active locks on seller's products

### Finance (FINANCE role required)
- `GET /api/finance/summary` - Dashboard summary
- `GET /api/finance/transactions?type=LOCK_FEE` - Transactions (filterable by type)

### User
- `GET /api/user/profile` - User profile with wallet balance
- `POST /api/user/wallet/topup` - Top up wallet `{ amount }`

### Notifications
- `GET /api/notifications` - All notifications
- `GET /api/notifications/unread-count` - Unread count
- `POST /api/notifications/mark-read` - Mark all as read

---

## Payment Simulation
- Enter any transaction ID (e.g., `TXN123456`) → **Payment Success**
- Enter a transaction ID starting with `FAIL` (e.g., `FAIL001`) → **Payment Failure**

---

## Price Lock Flow
1. Customer browses products
2. Tops up wallet (starts with ₹5000)
3. Clicks "Lock Price" → pays 5% lock fee from wallet
4. Lock is valid for chosen duration (1/6/12/24 hours)
5. During checkout, locked price is applied
6. If lock expires before checkout:
   - 75% of lock fee refunded automatically
   - Cart updates to live price
   - Customer notified
7. If seller reduces price while lock is active:
   - Price difference credited to customer's wallet
=======
# Cart-Forge_Java-Full-Stack-Website-with-Spring-boot-Angular
>>>>>>> c1e9f3645e2df82fc795fe0ed4bcfcbaa38aab32
