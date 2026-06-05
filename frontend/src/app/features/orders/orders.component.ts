import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { LockService } from '../../core/services/api.services';
import { CartService } from '../../core/services/cart.service';
import { Order, PriceLock } from '../../core/models';
import { FooterComponent } from '../../shared/components/footer.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  template: `
    <!-- Toast -->
    <div class="orders-toast" *ngIf="toast.msg" [class]="'orders-toast ' + toast.type">
      <i class="fas" [class.fa-check-circle]="toast.type==='success'" [class.fa-times-circle]="toast.type==='error'" [class.fa-info-circle]="toast.type==='info'"></i>
      {{toast.msg}}
    </div>

    <!-- Confirm popup -->
    <div class="modal-overlay" *ngIf="confirmDialog.show">
      <div class="confirm-box card">
        <div class="confirm-icon" [class.danger]="confirmDialog.danger">
          <i class="fas" [class.fa-exclamation-triangle]="confirmDialog.danger" [class.fa-question-circle]="!confirmDialog.danger"></i>
        </div>
        <h3>{{confirmDialog.title}}</h3>
        <p class="text-muted">{{confirmDialog.message}}</p>
        <div class="confirm-btns">
          <button class="btn btn-outline" (click)="confirmDialog.show = false">No, Keep It</button>
          <button class="btn btn-danger" (click)="confirmDialog.onConfirm(); confirmDialog.show = false">Yes, Cancel Lock</button>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="page-header">
        <h1>My Orders & Locks</h1>
      </div>

      <div class="tabs mb-4">
        <button class="tab-btn" [class.active]="activeTab === 'orders'" (click)="activeTab = 'orders'">
          <i class="fas fa-box"></i> Orders
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'locks'" (click)="activeTab = 'locks'">
          <i class="fas fa-lock"></i> Price Locks
        </button>
      </div>

      <!-- Orders Tab -->
      <div *ngIf="activeTab === 'orders'">
        <div class="spinner" *ngIf="loadingOrders"></div>
        <div class="empty-state" *ngIf="!loadingOrders && orders.length === 0">
          <i class="fas fa-box-open"></i>
          <h3>No orders yet</h3>
          <a routerLink="/products" class="btn btn-primary mt-3">Start Shopping</a>
        </div>
        <div class="order-card card mb-3" *ngFor="let order of orders">
          <div class="order-header flex-between">
            <div>
              <span class="order-id">{{order.orderId}}</span>
              <span class="badge" [class]="getStatusClass(order.status)">{{order.status}}</span>
            </div>
            <div class="text-right">
              <div style="font-size:18px;font-weight:700;color:#2563eb">₹{{order.totalAmount | number:'1.0-0'}}</div>
              <div class="text-muted" style="font-size:12px">{{order.createdAt | date:'medium'}}</div>
            </div>
          </div>
          <div class="order-items mt-3">
            <div class="order-item-row" *ngFor="let item of order.items">
              <span>{{item.product.name}}</span>
              <span class="text-muted">x{{item.quantity}}</span>
              <span class="lock-badge" *ngIf="item.priceLocked"><i class="fas fa-lock"></i> Locked</span>
              <span>₹{{item.totalPrice | number:'1.0-0'}}</span>
            </div>
          </div>
          <div class="text-muted mt-2" style="font-size:12px">
            <i class="fas fa-credit-card"></i> {{order.paymentMethod}}
          </div>
        </div>
      </div>

      <!-- Locks Tab -->
      <div *ngIf="activeTab === 'locks'">
        <div class="spinner" *ngIf="loadingLocks"></div>
        <div class="empty-state" *ngIf="!loadingLocks && locks.length === 0">
          <i class="fas fa-lock-open"></i>
          <h3>No price locks</h3>
          <a routerLink="/products" class="btn btn-primary mt-3">Browse Products</a>
        </div>
        <div class="lock-card card mb-3" *ngFor="let lock of locks">
          <div class="flex-between">
            <div>
              <strong style="font-size:16px">{{lock.product.name}}</strong>
              <div class="text-muted" style="font-size:13px;margin-top:2px">Qty: {{lock.quantity}}</div>
            </div>
            <span class="badge" [class]="getLockStatusClass(lock.status)">{{lock.status}}</span>
          </div>

          <div class="lock-details mt-3">
            <div class="lock-detail-row">
              <span class="text-muted">Locked Price</span>
              <strong>₹{{lock.lockedPrice | number:'1.0-0'}}</strong>
            </div>
            <div class="lock-detail-row">
              <span class="text-muted">Lock Fee Paid</span>
              <span style="color:#ef4444">₹{{lock.lockFee | number:'1.2-2'}}</span>
            </div>
            <div class="lock-detail-row">
              <span class="text-muted">You Pay at Checkout</span>
              <strong style="color:#2563eb">₹{{getPayable(lock) | number:'1.2-2'}}</strong>
            </div>
            <div class="lock-detail-row">
              <span class="text-muted">Expires At</span>
              <span [class.text-danger]="isExpired(lock.expiresAt)">{{lock.expiresAt | date:'medium'}}</span>
            </div>
          </div>

          <!-- Active lock actions -->
          <div class="lock-actions mt-3" *ngIf="lock.status === 'ACTIVE'">
            <button class="btn btn-primary btn-sm" (click)="addLockToCart(lock)" [disabled]="addingToCart === lock.id">
              <i class="fas" [class.fa-shopping-cart]="addingToCart !== lock.id" [class.fa-spinner]="addingToCart === lock.id" [class.fa-spin]="addingToCart === lock.id"></i>
              {{addingToCart === lock.id ? 'Adding...' : 'Go to Cart'}}
            </button>
            <button class="btn btn-outline btn-sm" style="border-color:#ef4444;color:#ef4444" (click)="askCancelLock(lock)">
              <i class="fas fa-times-circle"></i> Cancel Lock (75% refund)
            </button>
          </div>

          <div class="refund-note mt-2" *ngIf="lock.status === 'REFUNDED'">
            <i class="fas fa-info-circle"></i> 75% of lock fee (₹{{(lock.lockFee * 0.75) | number:'1.2-2'}}) was refunded to your wallet.
          </div>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .orders-toast {
      position: fixed; top: 80px; right: 20px; z-index: 9999;
      padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;
      display: flex; align-items: center; gap: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease; color: white;
    }
    .orders-toast.success { background: #10b981; }
    .orders-toast.error { background: #ef4444; }
    .orders-toast.info { background: #2563eb; }
    @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 500; padding: 20px; }
    .confirm-box { max-width: 380px; width: 100%; text-align: center; padding: 32px 24px; }
    .confirm-icon { font-size: 48px; margin-bottom: 16px; }
    .confirm-icon.danger { color: #ef4444; }
    .confirm-icon:not(.danger) { color: #2563eb; }
    .confirm-box h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .confirm-btns { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
    .tabs { display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; }
    .tab-btn { padding: 10px 20px; border: none; background: none; cursor: pointer; font-size: 14px; font-weight: 500; color: #6b7280; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
    .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }
    .order-header { flex-wrap: wrap; gap: 8px; }
    .order-id { font-weight: 600; margin-right: 8px; }
    .order-item-row { display: flex; gap: 12px; align-items: center; padding: 6px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .order-item-row span:first-child { flex: 1; }
    .lock-card { }
    .lock-details { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f8fafc; padding: 14px; border-radius: 8px; }
    .lock-detail-row { display: flex; flex-direction: column; font-size: 13px; gap: 4px; }
    .lock-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .refund-note { font-size: 12px; color: #10b981; background: #d1fae5; padding: 8px 12px; border-radius: 6px; }
    @media (max-width: 768px) { .lock-details { grid-template-columns: 1fr 1fr; } }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  locks: PriceLock[] = [];
  activeTab = 'orders';
  loadingOrders = true;
  loadingLocks = true;
  addingToCart: number | null = null;

  toast = { msg: '', type: 'success' };
  confirmDialog = { show: false, title: '', message: '', danger: false, onConfirm: () => {} };

  constructor(
    private orderService: OrderService,
    private lockService: LockService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.orderService.getHistory().subscribe(o => { this.orders = o; this.loadingOrders = false; });
    this.lockService.getUserLocks().subscribe(l => { this.locks = l; this.loadingLocks = false; });
  }

  showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toast = { msg, type };
    setTimeout(() => this.toast.msg = '', 3500);
  }

  // payable = full price - lock fee already paid
  getPayable(lock: PriceLock): number {
    return lock.lockedPrice * lock.quantity - lock.lockFee;
  }

  addLockToCart(lock: PriceLock) {
    this.addingToCart = lock.id;
    this.cartService.addToCart(lock.product.id, lock.quantity).subscribe({
      next: () => {
        this.addingToCart = null;
        this.showToast(`${lock.product.name} (x${lock.quantity}) added to cart at locked price!`, 'success');
      },
      error: (err) => {
        this.addingToCart = null;
        this.showToast(err.error?.message || 'Failed to add to cart.', 'error');
      }
    });
  }

  askCancelLock(lock: PriceLock) {
    const refund = (lock.lockFee * 0.75).toFixed(2);
    this.confirmDialog = {
      show: true,
      title: 'Cancel Price Lock?',
      message: `Cancel lock on "${lock.product.name}"? You will receive ₹${refund} (75% of lock fee) back to your wallet.`,
      danger: true,
      onConfirm: () => {
        this.lockService.cancelLock(lock.id).subscribe({
          next: () => {
            lock.status = 'REFUNDED';
            this.showToast(`Lock cancelled. ₹${refund} refunded to your wallet.`, 'info');
          },
          error: () => this.showToast('Failed to cancel lock.', 'error')
        });
      }
    };
  }

  getStatusClass(status: string): string {
    const m: any = { CONFIRMED: 'badge-success', FAILED: 'badge-danger', PENDING: 'badge-warning', CANCELLED: 'badge-secondary' };
    return m[status] || 'badge-secondary';
  }

  getLockStatusClass(status: string): string {
    const m: any = { ACTIVE: 'badge-success', EXPIRED: 'badge-danger', USED: 'badge-info', REFUNDED: 'badge-warning' };
    return m[status] || 'badge-secondary';
  }

  isExpired(date: string): boolean { return new Date(date) < new Date(); }
}
