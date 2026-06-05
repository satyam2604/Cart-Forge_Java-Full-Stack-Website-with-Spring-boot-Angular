import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { NotificationService } from './core/services/api.services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-wrapper">
      <nav class="navbar" *ngIf="auth.isLoggedIn()">
        <div class="container">
          <div class="flex-between" style="height:64px">
            <a routerLink="/products" class="brand">
              <i class="fas fa-shopping-cart"></i> Cart-Forge
            </a>
            <div class="nav-links">
              <a routerLink="/products" routerLinkActive="active" *ngIf="role === 'CUSTOMER'">
                <i class="fas fa-store"></i> <span class="hide-mobile">Products</span>
              </a>
              <a routerLink="/cart" routerLinkActive="active" *ngIf="role === 'CUSTOMER'">
                <i class="fas fa-shopping-cart"></i>
                <span class="hide-mobile">Cart</span>
                <span class="cart-badge" *ngIf="cartCount > 0">{{cartCount}}</span>
              </a>
              <a routerLink="/orders" routerLinkActive="active" *ngIf="role === 'CUSTOMER'">
                <i class="fas fa-box"></i> <span class="hide-mobile">Orders</span>
              </a>
              <a routerLink="/seller" routerLinkActive="active" *ngIf="role === 'SELLER'">
                <i class="fas fa-store-alt"></i> <span class="hide-mobile">Dashboard</span>
              </a>
              <a routerLink="/finance" routerLinkActive="active" *ngIf="role === 'FINANCE'">
                <i class="fas fa-chart-bar"></i> <span class="hide-mobile">Finance</span>
              </a>
              <a routerLink="/admin" routerLinkActive="active" *ngIf="role === 'ADMIN'">
                <i class="fas fa-shield-alt"></i> <span class="hide-mobile">Admin</span>
              </a>
              <div class="notification-btn" (click)="toggleNotifications()">
                <i class="fas fa-bell"></i>
                <span class="notif-badge" *ngIf="unreadCount > 0">{{unreadCount}}</span>
              </div>
              <div class="user-menu">
                <span class="username hide-mobile">{{auth.currentUser?.username}}</span>
                <button class="btn btn-outline btn-sm" (click)="logout()">
                  <i class="fas fa-sign-out-alt"></i> <span class="hide-mobile">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div class="notification-panel" *ngIf="showNotifications">
        <div class="notif-header flex-between">
          <strong>Notifications</strong>
          <button class="btn btn-sm btn-outline" (click)="markAllRead()">Mark all read</button>
        </div>
        <div class="notif-list">
          <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.read">
            <i class="fas" [class]="getNotifIcon(n.type)"></i>
            <div>
              <p>{{n.message}}</p>
              <small class="text-muted">{{n.createdAt | date:'short'}}</small>
            </div>
          </div>
          <div *ngIf="notifications.length === 0" class="text-center text-muted" style="padding:20px">
            No notifications
          </div>
        </div>
      </div>
      <div class="notif-overlay" *ngIf="showNotifications" (click)="showNotifications = false"></div>

      <main class="main-content" [class.no-nav]="!auth.isLoggedIn()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-wrapper { min-height: 100vh; display: flex; flex-direction: column; }
    .navbar {
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      position: sticky; top: 0; z-index: 100;
      padding: 0 16px;
      margin-top: 8px;
    }
    .brand {
      font-size: 20px; font-weight: 700; color: #2563eb;
      text-decoration: none; display: flex; align-items: center; gap: 8px;
    }
    .nav-links { display: flex; align-items: center; gap: 4px; }
    .nav-links a {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: 8px;
      text-decoration: none; color: #374151; font-size: 14px;
      transition: all 0.2s; position: relative; font-weight: 500;
    }
    .nav-links a:hover, .nav-links a.active { background: #eff6ff; color: #2563eb; }
    .cart-badge, .notif-badge {
      position: absolute; top: 2px; right: 2px;
      background: #ef4444; color: white;
      border-radius: 50%; width: 18px; height: 18px;
      font-size: 10px; display: flex; align-items: center; justify-content: center;
    }
    .notification-btn {
      position: relative; padding: 8px 14px; cursor: pointer;
      border-radius: 8px; color: #374151; font-size: 16px;
    }
    .notification-btn:hover { background: #eff6ff; color: #2563eb; }
    .user-menu { display: flex; align-items: center; gap: 8px; margin-left: 4px; }
    .username { font-size: 14px; font-weight: 500; color: #374151; }
    .main-content { flex: 1; padding: 28px 0; }
    .main-content.no-nav { padding: 0; }
    .notification-panel {
      position: fixed; top: 80px; right: 16px;
      width: 360px; background: white;
      border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      z-index: 200; max-height: 480px; overflow-y: auto;
    }
    .notif-header { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; }
    .notif-item {
      display: flex; gap: 12px; padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9; font-size: 13px;
    }
    .notif-item.unread { background: #eff6ff; }
    .notif-item i { margin-top: 2px; color: #2563eb; }
    .notif-overlay { position: fixed; inset: 0; z-index: 150; }
  `]
})
export class AppComponent implements OnInit {
  notifications: any[] = [];
  unreadCount = 0;
  showNotifications = false;

  constructor(
    public auth: AuthService,
    private cartService: CartService,
    private notifService: NotificationService
  ) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(user => {
      if (user) {
        if (user.role === 'CUSTOMER') this.cartService.loadCart().subscribe();
        this.loadNotifications();
      }
    });
  }

  get role() { return this.auth.role; }
  get cartCount() { return this.cartService.cartCount; }

  loadNotifications() {
    this.notifService.getAll().subscribe(n => this.notifications = n);
    this.notifService.getUnreadCount().subscribe(r => this.unreadCount = r.count);
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.loadNotifications();
  }

  markAllRead() {
    this.notifService.markAllRead().subscribe(() => {
      this.unreadCount = 0;
      this.notifications.forEach(n => n.read = true);
    });
  }

  getNotifIcon(type: string): string {
    const icons: any = {
      LOCK: 'fa-lock', LOCK_EXPIRY: 'fa-clock', ORDER_CONFIRMED: 'fa-check-circle',
      PAYMENT_FAILED: 'fa-times-circle', PRICE_DROP: 'fa-arrow-down'
    };
    return icons[type] || 'fa-bell';
  }

  logout() { this.auth.logout(); }
}
