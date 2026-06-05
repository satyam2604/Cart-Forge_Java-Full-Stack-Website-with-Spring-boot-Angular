import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { LockService, UserService } from '../../core/services/api.services';
import { Product } from '../../core/models';
import { FooterComponent } from '../../shared/components/footer.component';

const PAGE_SIZE = 12;

const LOCK_OPTIONS = [
  { days: 1, label: '1 Day', feePercent: 5 },
  { days: 3, label: '3 Days', feePercent: 7 },
  { days: 5, label: '5 Days', feePercent: 10 }
];

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FooterComponent],
  template: `
    <!-- Cart added toast -->
    <div class="cart-toast" *ngIf="toastMsg" [class.show]="toastMsg">
      <i class="fas fa-check-circle"></i> {{toastMsg}}
      <a routerLink="/cart" class="toast-link">View Cart →</a>
    </div>

    <div class="container">
      <div class="page-header flex-between">
        <div>
          <h1>Products</h1>
          <p>Browse and lock prices before they change</p>
        </div>
        <div class="wallet-info card" style="padding:12px 20px">
          <small class="text-muted">Wallet Balance</small>
          <div style="font-size:18px;font-weight:700;color:#2563eb">₹{{walletBalance | number:'1.2-2'}}</div>
          <button class="btn btn-outline btn-sm mt-1" (click)="showTopup = true">Top Up</button>
        </div>
      </div>

      <div class="filter-bar mb-4">
        <input class="form-control" style="max-width:300px" [(ngModel)]="search" (ngModelChange)="onFilterChange()" placeholder="Search products...">
        <select class="form-control" style="max-width:200px" [(ngModel)]="selectedCategory" (ngModelChange)="onFilterChange()">
          <option value="">All Categories</option>
          <option *ngFor="let c of categories" [value]="c">{{c}}</option>
        </select>
      </div>

      <div class="spinner" *ngIf="loading"></div>

      <div class="grid grid-4" *ngIf="!loading">
        <div class="product-card card" *ngFor="let p of pagedProducts">
          <div class="product-img">
            <img [src]="p.imageUrl" [alt]="p.name" (error)="onImgError($event)">
            <span class="category-tag">{{p.category}}</span>
          </div>
          <div class="product-body">
            <h3>{{p.name}}</h3>
            <p class="text-muted" style="font-size:13px">{{p.description}}</p>
            <div class="price-row">
              <span class="price">₹{{p.price | number:'1.0-0'}}</span>
              <span class="stock" [class.low]="p.stock < 10">{{p.stock}} left</span>
            </div>
            <div class="qty-row" *ngIf="p.stock > 0">
              <span style="font-size:13px;color:#6b7280">Qty:</span>
              <div class="qty-control">
                <button class="qty-btn" (click)="decQty(p)" [disabled]="getQty(p) <= 1">−</button>
                <span class="qty-num">{{getQty(p)}}</span>
                <button class="qty-btn" (click)="incQty(p)" [disabled]="getQty(p) >= 10 || getQty(p) >= p.stock">+</button>
              </div>
            </div>
            <div class="product-actions mt-2">
              <button class="btn btn-primary btn-sm" (click)="addToCart(p)" [disabled]="p.stock === 0 || addingToCart === p.id">
                <i class="fas fa-cart-plus"></i> Add to Cart
              </button>
              <button class="btn btn-secondary btn-sm" (click)="openLockModal(p)">
                <i class="fas fa-lock"></i> Lock Price
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && filteredProducts.length === 0">
        <i class="fas fa-search"></i><h3>No products found</h3>
      </div>

      <div class="pagination" *ngIf="!loading && totalPages > 1">
        <button class="page-btn" (click)="goToPage(1)" [disabled]="currentPage === 1">«</button>
        <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">‹ Prev</button>
        <ng-container *ngFor="let p of pageNumbers">
          <button class="page-btn" [class.active]="p === currentPage" (click)="goToPage(p)">{{p}}</button>
        </ng-container>
        <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">Next ›</button>
        <button class="page-btn" (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages">»</button>
        <span class="page-info">Page {{currentPage}} of {{totalPages}}</span>
      </div>
    </div>

    <!-- Lock Price Modal -->
    <div class="modal-overlay" *ngIf="lockModal" (click)="lockModal = false">
      <div class="modal-box card" (click)="$event.stopPropagation()">
        <div class="modal-header flex-between">
          <h3><i class="fas fa-lock text-warning"></i> Lock Price</h3>
          <button class="btn btn-sm" (click)="lockModal = false"><i class="fas fa-times"></i></button>
        </div>
        <div *ngIf="selectedProduct && !lockSuccess">
          <p><strong>{{selectedProduct.name}}</strong></p>
          <p class="text-muted" style="font-size:13px">Current Price: <strong>₹{{selectedProduct.price | number:'1.0-0'}}</strong></p>
          <div class="form-group mt-3">
            <label>Quantity</label>
            <input class="form-control" type="number" [(ngModel)]="lockQty" min="1" [max]="selectedProduct.stock">
          </div>
          <div class="form-group">
            <label>Lock Duration</label>
            <div class="lock-options">
              <div class="lock-opt" *ngFor="let opt of lockOptions"
                [class.selected]="lockDays === opt.days" (click)="lockDays = opt.days">
                <div class="lock-opt-label">{{opt.label}}</div>
                <div class="lock-opt-fee">{{opt.feePercent}}% fee</div>
              </div>
            </div>
          </div>
          <div class="lock-fee-info">
            <div class="flex-between">
              <span>Lock Fee ({{selectedFeePercent}}%)</span>
              <strong>₹{{lockFee | number:'1.2-2'}}</strong>
            </div>
            <div class="flex-between mt-1">
              <span>Remaining to pay at checkout</span>
              <strong>₹{{(selectedProduct.price * lockQty - lockFee) | number:'1.2-2'}}</strong>
            </div>
            <div class="flex-between mt-1">
              <span>Your Wallet</span>
              <strong>₹{{walletBalance | number:'1.2-2'}}</strong>
            </div>
          </div>
          <div class="alert alert-info mt-2" style="font-size:12px">
            <i class="fas fa-info-circle"></i> You pay <strong>{{selectedFeePercent}}%</strong> now to lock the price.
            At checkout you pay only the remaining <strong>{{100 - selectedFeePercent}}%</strong>.
            On cancellation, <strong>75%</strong> of lock fee is refunded.
          </div>
          <div class="alert alert-danger" *ngIf="lockError">{{lockError}}</div>
          <div class="flex gap-2 mt-3">
            <button class="btn btn-secondary btn-block" (click)="confirmLock()" [disabled]="lockLoading">
              <i class="fas fa-lock"></i> {{lockLoading ? 'Locking...' : 'Confirm Lock'}}
            </button>
          </div>
        </div>
        <!-- Lock success state -->
        <div *ngIf="lockSuccess" style="text-align:center;padding:16px 0">
          <i class="fas fa-check-circle" style="font-size:48px;color:#10b981"></i>
          <h3 style="margin-top:12px;color:#10b981">Price Locked!</h3>
          <p class="text-muted mt-2">{{lockSuccess}}</p>
          <p style="font-size:13px;color:#6b7280;margin-top:8px">Go to <strong>My Orders → Price Locks</strong> to add this item to cart.</p>
          <button class="btn btn-primary mt-3" (click)="lockModal = false; lockSuccess = ''">
            <i class="fas fa-check"></i> Done
          </button>
        </div>
      </div>
    </div>

    <!-- Wallet Top-up Modal -->
    <div class="modal-overlay" *ngIf="showTopup" (click)="showTopup = false">
      <div class="modal-box card" (click)="$event.stopPropagation()">
        <div class="modal-header flex-between">
          <h3><i class="fas fa-wallet"></i> Top Up Wallet</h3>
          <button class="btn btn-sm" (click)="showTopup = false"><i class="fas fa-times"></i></button>
        </div>
        <div *ngIf="topupSuccess" style="text-align:center;padding:20px 0">
          <i class="fas fa-check-circle" style="font-size:48px;color:#10b981"></i>
          <h3 style="margin-top:12px;color:#10b981">Payment Successful!</h3>
          <p class="text-muted">{{topupSuccess}}</p>
          <p style="font-size:18px;font-weight:700;color:#2563eb">New Balance: ₹{{walletBalance | number:'1.2-2'}}</p>
          <button class="btn btn-primary mt-3" (click)="showTopup = false; topupSuccess = ''">Done</button>
        </div>
        <div *ngIf="topupFailure" style="text-align:center;padding:20px 0">
          <i class="fas fa-times-circle" style="font-size:48px;color:#ef4444"></i>
          <h3 style="margin-top:12px;color:#ef4444">Payment Failed</h3>
          <p class="text-muted">{{topupFailure}}</p>
          <button class="btn btn-primary mt-3" (click)="topupFailure = ''">Try Again</button>
        </div>
        <div *ngIf="!topupSuccess && !topupFailure">
          <div class="form-group mt-2">
            <label>Amount (₹)</label>
            <input class="form-control" type="number" [(ngModel)]="topupAmount" min="100" placeholder="Enter amount">
            <div class="flex gap-2 mt-2">
              <button class="btn btn-outline btn-sm" (click)="topupAmount = 500">₹500</button>
              <button class="btn btn-outline btn-sm" (click)="topupAmount = 1000">₹1000</button>
              <button class="btn btn-outline btn-sm" (click)="topupAmount = 2000">₹2000</button>
              <button class="btn btn-outline btn-sm" (click)="topupAmount = 5000">₹5000</button>
            </div>
          </div>
          <div class="form-group">
            <label>Payment Method</label>
            <div class="payment-methods">
              <div class="pay-option" [class.selected]="topupMethod === 'UPI'" (click)="topupMethod = 'UPI'; topupTxnId = ''">
                <i class="fas fa-mobile-alt"></i> UPI
              </div>
              <div class="pay-option" [class.selected]="topupMethod === 'CARD'" (click)="topupMethod = 'CARD'; topupTxnId = ''">
                <i class="fas fa-credit-card"></i> Card
              </div>
            </div>
          </div>
          <div class="form-group" *ngIf="topupMethod === 'UPI'">
            <label>UPI ID</label>
            <input class="form-control" [(ngModel)]="upiId" placeholder="yourname@bankname"
              [class.is-valid]="upiId && isValidUpi(upiId)"
              [class.is-invalid]="upiId && !isValidUpi(upiId)">
            <div class="inv" *ngIf="upiId && !isValidUpi(upiId)">Enter a valid UPI ID (e.g. name&#64;okaxis)</div>
            <label class="mt-2">Transaction ID</label>
            <input class="form-control" [(ngModel)]="topupTxnId" placeholder="e.g. UPI123456789"
              [class.is-valid]="topupTxnId.length >= 6"
              [class.is-invalid]="topupTxnId && topupTxnId.length < 6">
            <div class="inv" *ngIf="topupTxnId && topupTxnId.length < 6">Transaction ID must be at least 6 characters</div>
          </div>
          <div *ngIf="topupMethod === 'CARD'">
            <div class="form-group">
              <label>Card Number</label>
              <input class="form-control" [(ngModel)]="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19"
                (input)="formatCard($event)" (keypress)="onlyDigits($event)"
                [class.is-valid]="cardDigits === 16"
                [class.is-invalid]="cardNumber && cardDigits !== 16">
              <div class="inv" *ngIf="cardNumber && cardDigits !== 16">Card number must be 16 digits</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div class="form-group">
                <label>Expiry (MM/YY)</label>
                <input class="form-control" [(ngModel)]="cardExpiry" placeholder="MM/YY" maxlength="5"
                  (input)="formatExpiry($event)" (keypress)="onlyDigits($event)"
                  [class.is-valid]="cardExpiry.length === 5 && isValidExpiry(cardExpiry)"
                  [class.is-invalid]="cardExpiry && (cardExpiry.length < 5 || !isValidExpiry(cardExpiry))">
                <div class="inv" *ngIf="cardExpiry && !isValidExpiry(cardExpiry)">Invalid or expired date</div>
              </div>
              <div class="form-group">
                <label>CVV</label>
                <input class="form-control" [(ngModel)]="cardCvv" placeholder="123" maxlength="3" type="password"
                  (keypress)="onlyDigits($event)"
                  [class.is-valid]="cardCvv.length === 3"
                  [class.is-invalid]="cardCvv && cardCvv.length !== 3">
                <div class="inv" *ngIf="cardCvv && cardCvv.length !== 3">CVV must be 3 digits</div>
              </div>
            </div>
            <div class="form-group">
              <label>Transaction ID</label>
              <input class="form-control" [(ngModel)]="topupTxnId" placeholder="e.g. CARD987654321"
                [class.is-valid]="topupTxnId.length >= 6"
                [class.is-invalid]="topupTxnId && topupTxnId.length < 6">
              <div class="inv" *ngIf="topupTxnId && topupTxnId.length < 6">Transaction ID must be at least 6 characters</div>
            </div>
          </div>
          <button class="btn btn-primary btn-block mt-3" (click)="topUp()" [disabled]="topupLoading || !isTopupFormValid() || topupAmount < 100">
            <i class="fas fa-spinner fa-spin" *ngIf="topupLoading"></i>
            {{topupLoading ? 'Processing...' : 'Pay ₹' + topupAmount}}
          </button>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .cart-toast {
      position: fixed; top: 80px; right: 20px; z-index: 999;
      background: #10b981; color: white; padding: 12px 20px; border-radius: 8px;
      display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease;
    }
    .toast-link { color: white; font-weight: 700; text-decoration: underline; margin-left: 4px; }
    @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .filter-bar { display: flex; gap: 12px; flex-wrap: wrap; }
    .product-card { padding: 0; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
    .product-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
    .product-img { position: relative; height: 180px; overflow: hidden; background: #f1f5f9; }
    .product-img img { width: 100%; height: 100%; object-fit: cover; }
    .category-tag { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.6); color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
    .product-body { padding: 16px; }
    .product-body h3 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
    .price-row { display: flex; align-items: center; justify-content: space-between; margin: 10px 0; }
    .price { font-size: 20px; font-weight: 700; color: #2563eb; }
    .stock { font-size: 12px; color: #6b7280; }
    .stock.low { color: #ef4444; font-weight: 600; }
    .qty-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .product-actions { display: flex; gap: 8px; }
    .wallet-info { text-align: center; }
    .lock-options { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-top: 6px; }
    .lock-opt { border: 2px solid #e2e8f0; border-radius: 8px; padding: 10px 6px; text-align: center; cursor: pointer; transition: all 0.2s; }
    .lock-opt:hover { border-color: #f59e0b; }
    .lock-opt.selected { border-color: #f59e0b; background: #fef3c7; }
    .lock-opt-label { font-size: 13px; font-weight: 700; color: #1e293b; }
    .lock-opt-fee { font-size: 11px; color: #6b7280; margin-top: 2px; }
    .lock-fee-info { background: #f8fafc; padding: 12px; border-radius: 8px; margin-top: 12px; font-size: 14px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 300; padding: 20px; }
    .modal-box { width: 100%; max-width: 440px; max-height: 90vh; overflow-y: auto; }
    .modal-header { margin-bottom: 16px; }
    .payment-methods { display: flex; gap: 10px; margin-top: 6px; }
    .pay-option { flex: 1; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; text-align: center; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; color: #374151; }
    .pay-option:hover { border-color: #2563eb; color: #2563eb; }
    .pay-option.selected { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
    .pay-option i { display: block; font-size: 20px; margin-bottom: 4px; }
    .is-valid { border-color: #10b981 !important; }
    .is-invalid { border-color: #ef4444 !important; }
    .inv { color: #ef4444; font-size: 12px; margin-top: 4px; }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  search = '';
  selectedCategory = '';
  addingToCart: number | null = null;
  toastMsg = '';
  walletBalance = 0;
  currentPage = 1;
  private qtyMap: Record<number, number> = {};
  lockOptions = LOCK_OPTIONS;

  lockModal = false;
  selectedProduct: Product | null = null;
  lockQty = 1;
  lockDays = 1;
  lockLoading = false;
  lockError = '';
  lockSuccess = '';

  showTopup = false;
  topupAmount = 500;
  topupMethod = 'UPI';
  topupTxnId = '';
  upiId = '';
  topupLoading = false;
  topupSuccess = '';
  topupFailure = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private lockService: LockService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.productService.getAll().subscribe(p => { this.products = p; this.loading = false; });
    this.userService.getProfile().subscribe(u => this.walletBalance = u.walletBalance);
  }

  get categories(): string[] { return [...new Set(this.products.map(p => p.category))]; }

  get filteredProducts(): Product[] {
    return this.products.filter(p =>
      (!this.search || p.name.toLowerCase().includes(this.search.toLowerCase())) &&
      (!this.selectedCategory || p.category === this.selectedCategory)
    );
  }

  get totalPages(): number { return Math.ceil(this.filteredProducts.length / PAGE_SIZE); }
  get pagedProducts(): Product[] { const s = (this.currentPage - 1) * PAGE_SIZE; return this.filteredProducts.slice(s, s + PAGE_SIZE); }
  get pageNumbers(): number[] {
    const pages: number[] = []; const start = Math.max(1, this.currentPage - 2); const end = Math.min(this.totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i); return pages;
  }
  onFilterChange() { this.currentPage = 1; }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage = p; window.scrollTo({ top: 0, behavior: 'smooth' }); }

  getQty(p: Product): number { return this.qtyMap[p.id] ?? 1; }
  incQty(p: Product) { const c = this.getQty(p); if (c < 10 && c < p.stock) this.qtyMap[p.id] = c + 1; }
  decQty(p: Product) { const c = this.getQty(p); if (c > 1) this.qtyMap[p.id] = c - 1; }

  get selectedFeePercent(): number {
    return LOCK_OPTIONS.find(o => o.days === this.lockDays)?.feePercent ?? 5;
  }

  get lockFee(): number {
    if (!this.selectedProduct) return 0;
    return this.selectedProduct.price * (this.selectedFeePercent / 100) * this.lockQty;
  }

  get cardDigits(): number { return this.cardNumber.split('').filter(c => c !== ' ').length; }

  isValidUpi(id: string): boolean { return /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(id); }

  isValidExpiry(val: string): boolean {
    if (!/^\d{2}\/\d{2}$/.test(val)) return false;
    const [mm, yy] = val.split('/').map(Number);
    if (mm < 1 || mm > 12) return false;
    const now = new Date(); const expDate = new Date(2000 + yy, mm - 1, 1);
    return expDate >= new Date(now.getFullYear(), now.getMonth(), 1);
  }

  onlyDigits(e: KeyboardEvent) { if (!/\d/.test(e.key)) e.preventDefault(); }

  isTopupFormValid(): boolean {
    if (!this.topupTxnId || this.topupTxnId.length < 6) return false;
    if (this.topupMethod === 'UPI') return this.isValidUpi(this.upiId);
    if (this.topupMethod === 'CARD') {
      return this.cardDigits === 16 &&
             this.isValidExpiry(this.cardExpiry) &&
             this.cardCvv.length === 3;
    }
    return false;
  }

  formatExpiry(event: Event) {
    let val = (event.target as HTMLInputElement).value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2);
    this.cardExpiry = val;
  }

  addToCart(p: Product) {
    const qty = this.getQty(p);
    this.addingToCart = p.id;
    this.cartService.addToCart(p.id, qty).subscribe({
      next: () => {
        this.addingToCart = null;
        this.toastMsg = `${p.name} (x${qty}) added to cart!`;
        setTimeout(() => this.toastMsg = '', 3000);
      },
      error: () => this.addingToCart = null
    });
  }

  openLockModal(p: Product) {
    this.selectedProduct = p; this.lockQty = 1; this.lockDays = 1;
    this.lockError = ''; this.lockSuccess = ''; this.lockModal = true;
  }

  confirmLock() {
    if (!this.selectedProduct) return;
    this.lockLoading = true; this.lockError = '';
    this.lockService.lockPrice(this.selectedProduct.id, this.lockQty, this.lockDays).subscribe({
      next: () => {
        this.lockSuccess = `Price locked for ${this.lockDays} day(s)! Lock fee ₹${this.lockFee.toFixed(2)} deducted. Pay remaining ${100 - this.selectedFeePercent}% at checkout.`;
        this.walletBalance -= this.lockFee;
        this.lockLoading = false;
      },
      error: (err) => { this.lockError = err.error?.message || 'Failed to lock price'; this.lockLoading = false; }
    });
  }

  topUp() {
    this.topupLoading = true;
    this.userService.topUpWallet(this.topupAmount, this.topupMethod, this.topupTxnId).subscribe({
      next: (res) => {
        this.topupLoading = false;
        if (res.success) { this.walletBalance = res.walletBalance; this.topupSuccess = res.message; this.topupTxnId = ''; this.upiId = ''; this.cardNumber = ''; this.cardExpiry = ''; this.cardCvv = ''; }
        else { this.topupFailure = res.message; }
      },
      error: (err) => { this.topupLoading = false; this.topupFailure = err.error?.message || 'Payment failed.'; }
    });
  }

  formatCard(event: Event) {
    let val = (event.target as HTMLInputElement).value.replace(/\D/g, '').substring(0, 16);
    this.cardNumber = val.replace(/(\d{4})/g, '$1 ').trim();
  }

  onImgError(event: Event) { (event.target as HTMLImageElement).src = 'https://placehold.co/400x300/94a3b8/ffffff?text=No+Image'; }
}
