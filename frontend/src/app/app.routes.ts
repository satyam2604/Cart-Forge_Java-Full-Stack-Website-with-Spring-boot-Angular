import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent),
    canActivate: [roleGuard('CUSTOMER')]
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    canActivate: [roleGuard('CUSTOMER')]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [roleGuard('CUSTOMER')]
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [roleGuard('CUSTOMER')]
  },
  {
    path: 'seller',
    loadComponent: () => import('./features/seller/seller.component').then(m => m.SellerComponent),
    canActivate: [roleGuard('SELLER')]
  },
  {
    path: 'finance',
    loadComponent: () => import('./features/finance/finance.component').then(m => m.FinanceComponent),
    canActivate: [roleGuard('FINANCE')]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [roleGuard('ADMIN')]
  },
  { path: '**', redirectTo: '/login' }
];
