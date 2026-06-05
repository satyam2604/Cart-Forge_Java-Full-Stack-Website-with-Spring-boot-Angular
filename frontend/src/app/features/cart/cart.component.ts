import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { LockService } from '../../core/services/api.services';
import { CartItem } from '../../core/models';
import { Subscription, interval } from 'rxjs';
import { FooterComponent } from '../../shared/components/footer.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FooterComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Shopping Cart</h1>
        <p>{{items.length}} item(s) in your cart</p>
      </div>

      <div class="spinner" *ngIf="loading"></div>

      <div class="cart-layout" *ngIf="!loading && items.length > 0">
        <div class="cart-items">
          <div class="cart-item card" *ngFor="let item of items">
            <img [src]="item.imageUrl || 'https://placehold.co/80x80/94a3b8/ffffff?text=IMG'" [alt]="item.productName">
            <div class="item-details">
              <h4>{{item.productName}}</h4>
              <div class="price-info">
                <span class="applied-price">₹{{item.appliedPrice | number:'1.0-0'}}</span>
                <span class="live-price text-muted" *ngIf="item.locked && item.livePrice !== item.appliedPrice">
                  Live: ₹{{item.livePrice | number:'1.0-0'}}
                </span>
                <span class="lock-badge" *ngIf="item.locked">
                  <i class="fas fa-lock"></i> Locked until {{item.lockExpiry | date:'short'}}
                </span>
                <span class="price-up" *ngIf="priceChanges[item.productId] === 'up'">
                  <i class="fas fa-arrow-up"></i> Price went up!
                </span>
                <span class="price-down" *ngIf="priceChanges[item.productId] === 'down'">
                  <i class="fas fa-arrow-down"></i> Price dropped!
                </span>
              </div>
              <div class="qty-row mt-2">
                <div class="qty-control">
                  <button class="qty-btn" (click)="decQty(item)" [disabled]="updatingId === item.id">−</button>
                  <span class="qty-num">{{item.quantity}}</span>
                  <button class="qty-btn" (click)="incQty(item)" [disabled]="updatingId === item.id">+</button>
                </div>
                <button class="btn btn-danger btn-sm" (click)="removeItem(item)" title="Remove item">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div class="item-actions">
              <strong>₹{{(item.appliedPrice * item.quantity) | number:'1.0-0'}}</strong>
              <button class="btn btn-secondary btn-sm mt-1" *ngIf="!item.locked" (click)="openLockModal(item)">
                <i class="fas fa-lock"></i> Lock Price
              </button>
            </div>
          </div>
        </div>

        <div class="cart-summary card">
          <h3>Order Summary</h3>
          <div class="summary-row" *ngFor="let item of items">
            <span>{{item.productName}} x{{item.quantity}}</span>
            <div class="text-right">
              <div>₹{{item.payableAmount | number:'1.0-0'}}</div>
              <div *ngIf="item.locked" style="font-size:11px;color:#10b981">Lock fee paid: ₹{{item.lockFeeAlreadyPaid | number:'1.0-0'}}</div>
            </div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-total flex-between">
            <strong>Total Payable</strong>
            <strong style="font-size:20px;color:#2563eb">₹{{total | number:'1.0-0'}}</strong>
          </div>
          <a routerLink="/checkout" class="btn btn-primary btn-block btn-lg mt-3">
            <i class="fas fa-credit-card"></i> Proceed to Checkout
          </a>
          <a routerLink="/products" class="btn btn-outline btn-block mt-2">
            <i class="fas fa-arrow-left"></i> Continue Shopping
          </a>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && items.length === 0">
        <i class="fas fa-shopping-cart"></i>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started</p>
        <a routerLink="/products" class="btn btn-primary mt-3">Browse Products</a>
      </div>
    </div>

    <!-- Lock Price Modal -->
    <div class="modal-overlay" *ngIf="lockModal" (click)="lockModal = false">
      <div class="modal-box card" (click)="$event.stopPropagation()">
        <div class="modal-header flex-between">
          <h3><i class="fas fa-lock text-warning"></i> Lock Price</h3>
          <button class="btn btn-sm" (click)="lockModal = false"><i class="fas fa-times"></i></button>
        </div>
        <div *ngIf="selectedItem">
          <p><strong>{{selectedItem.productName}}</strong></p>
          <p class="text-muted" style="font-size:13px">Current Price: <strong>₹{{selectedItem.appliedPrice | number:'1.0-0'}}</strong></p>
          <div class="form-group mt-3">
            <label>Lock Duration</label>
            <select class="form-control" [(ngModel)]="lockHours">
              <option [value]="1">1 Day (5% fee)</option>
              <option [value]="3">3 Days (7% fee)</option>
              <option [value]="5">5 Days (10% fee)</option>
            </select>
          </div>
          <div class="lock-fee-info">
            <div class="flex-between">
              <span>Lock Fee</span>
              <strong>₹{{(selectedItem.appliedPrice * getFeePercent(lockHours) / 100 * selectedItem.quantity) | number:'1.2-2'}}</strong>
            </div>
            <div class="flex-between mt-1">
              <span>Remaining at checkout ({{100 - getFeePercent(lockHours)}}%)</span>
              <strong>₹{{(selectedItem.appliedPrice * selectedItem.quantity * (1 - getFeePercent(lockHours)/100)) | number:'1.2-2'}}</strong>
            </div>
          </div>
          <div class="alert alert-danger" *ngIf="lockError">{{lockError}}</div>
          <div class="alert alert-success" *ngIf="lockSuccess">{{lockSuccess}}</div>
          <button class="btn btn-secondary btn-block mt-3" (click)="confirmLock()" [disabled]="lockLoading">
            <i class="fas fa-lock"></i> {{lockLoading ? 'Locking...' : 'Confirm Lock'}}
          </button>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
    .cart-item { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 12px; }
    .cart-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
    .item-details { flex: 1; }
    .item-details h4 { font-size: 15px; font-weight: 600; margin-bottom: 6px; }
    .price-info { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .applied-price { font-size: 18px; font-weight: 700; color: #2563eb; }
    .live-price { font-size: 13px; text-decoration: line-through; }
    .qty-row { display: flex; align-items: center; gap: 10px; }
    .item-actions { text-align: right; min-width: 100px; display: flex; flex-direction: column; align-items: flex-end; }
    .summary-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; color: #374151; }
    .summary-divider { border-top: 1px solid #e2e8f0; margin: 12px 0; }
    .summary-total { padding: 8px 0; }
    .price-up { color: #ef4444; font-size: 12px; font-weight: 600; }
    .price-down { color: #10b981; font-size: 12px; font-weight: 600; }
    .lock-fee-info { background: #f8fafc; padding: 12px; border-radius: 8px; margin-top: 12px; font-size: 14px; }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 300; padding: 20px;
    }
    .modal-box { width: 100%; max-width: 400px; }
    .modal-header { margin-bottom: 16px; }
    @media (max-width: 768px) { .cart-layout { grid-template-columns: 1fr; } }
  `]
})
export class CartComponent implements OnInit, OnDestroy {
  items: CartItem[] = [];
  loading = true;
  updatingId: number | null = null;
  priceChanges: Record<number, 'up' | 'down' | null> = {};
  private prevPrices: Record<number, number> = {};
  private pollSub?: Subscription;

  lockModal = false;
  selectedItem: CartItem | null = null;
  lockHours = 1;

  getFeePercent(days: number): number {
    if (days <= 1) return 5; if (days <= 3) return 7; return 10;
  }
  lockLoading = false;
  lockError = '';
  lockSuccess = '';

  constructor(private cartService: CartService, private lockService: LockService) {}

  ngOnInit() {
    this.cartService.loadCart().subscribe(items => {
      this.items = items;
      this.loading = false;
      items.forEach(i => this.prevPrices[i.productId] = i.appliedPrice);
    });
    this.pollSub = interval(30000).subscribe(() => this.refreshPrices());
  }

  ngOnDestroy() { this.pollSub?.unsubscribe(); }

  refreshPrices() {
    this.cartService.loadCart().subscribe(items => {
      items.forEach(i => {
        const prev = this.prevPrices[i.productId];
        if (prev !== undefined && i.appliedPrice !== prev) {
          this.priceChanges[i.productId] = i.appliedPrice > prev ? 'up' : 'down';
          setTimeout(() => { this.priceChanges[i.productId] = null; }, 5000);
        }
        this.prevPrices[i.productId] = i.appliedPrice;
      });
      this.items = items;
    });
  }

  get total(): number {
    return this.items.reduce((sum, i) => sum + (i.payableAmount ?? i.appliedPrice * i.quantity), 0);
  }

  incQty(item: CartItem) {
    this.updatingId = item.id;
    this.cartService.addToCart(item.productId, 1).subscribe({
      next: () => { this.updatingId = null; this.refreshPrices(); },
      error: () => this.updatingId = null
    });
  }

  decQty(item: CartItem) {
    if (item.quantity <= 1) { this.removeItem(item); return; }
    this.updatingId = item.id;
    this.cartService.updateQty(item.id, item.quantity - 1).subscribe({
      next: () => { this.updatingId = null; this.refreshPrices(); },
      error: () => this.updatingId = null
    });
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.id).subscribe(() => {
      this.items = this.items.filter(i => i.id !== item.id);
    });
  }

  openLockModal(item: CartItem) {
    this.selectedItem = item;
    this.lockHours = 1;
    this.lockError = '';
    this.lockSuccess = '';
    this.lockModal = true;
  }

  confirmLock() {
    if (!this.selectedItem) return;
    this.lockLoading = true;
    this.lockError = '';
    this.lockService.lockPrice(this.selectedItem.productId, this.selectedItem.quantity, this.lockHours).subscribe({
      next: () => {
        this.lockSuccess = 'Price locked successfully!';
        this.lockLoading = false;
        setTimeout(() => { this.lockModal = false; this.refreshPrices(); }, 1500);
      },
      error: (err) => {
        this.lockError = err.error?.message || 'Failed to lock price';
        this.lockLoading = false;
      }
    });
  }
}
