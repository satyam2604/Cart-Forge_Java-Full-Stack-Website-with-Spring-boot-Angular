export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'SELLER' | 'FINANCE' | 'ADMIN';
  walletBalance: number;
  active: boolean;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  userId: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  stock: number;
  seller: User;
  active: boolean;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  livePrice: number;
  appliedPrice: number;
  payableAmount: number;
  lockFeeAlreadyPaid: number;
  locked: boolean;
  lockExpiry: string;
}

export interface PriceLock {
  id: number;
  user: User;
  product: Product;
  lockedPrice: number;
  quantity: number;
  lockFee: number;
  lockedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'USED' | 'REFUNDED';
}

export interface Order {
  id: number;
  orderId: string;
  totalAmount: number;
  createdAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
  paymentMethod: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  priceLocked: boolean;
}

export interface CheckoutValidation {
  valid: boolean;
  message: string;
  items: CartItem[];
  totalAmount: number;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  orderId: string;
}

export interface Transaction {
  id: number;
  user: User;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  referenceId: string;
}

export interface FinanceSummary {
  totalLockRevenue: number;
  totalRefunds: number;
  totalWalletCredits: number;
  totalPayments: number;
  totalOrders: number;
  activeLocks: number;
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}
