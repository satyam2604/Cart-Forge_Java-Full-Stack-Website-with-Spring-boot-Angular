import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { CheckoutValidation } from '../../core/models';
import { FooterComponent } from '../../shared/components/footer.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FooterComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Checkout</h1>
      </div>

      <div class="spinner" *ngIf="loading"></div>

      <div *ngIf="!loading && validation">
        <div class="alert alert-danger" *ngIf="!validation.valid">
          <i class="fas fa-exclamation-triangle"></i> {{validation.message}}
          <a routerLink="/cart" class="btn btn-sm btn-outline mt-2">Back to Cart</a>
        </div>

        <div class="checkout-layout" *ngIf="validation.valid">
          <div class="checkout-left">
            <!-- Order Review -->
            <div class="card mb-4">
              <h3 class="mb-3">Order Review</h3>
              <div class="order-item" *ngFor="let item of validation.items">
                <div>
                  <strong>{{item.productName}}</strong>
                  <div class="text-muted" style="font-size:13px">Qty: {{item.quantity}}</div>
                  <div *ngIf="item.locked" class="lock-breakdown mt-1">
                    <span class="lock-badge"><i class="fas fa-lock"></i> Price Locked</span>
                    <div style="font-size:12px;color:#6b7280;margin-top:4px">
                      Full price: ₹{{(item.appliedPrice * item.quantity) | number:'1.0-0'}} —
                      Lock fee paid: ₹{{item.lockFeeAlreadyPaid | number:'1.2-2'}}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div style="font-weight:700;color:#2563eb">₹{{item.payableAmount | number:'1.0-0'}}</div>
                  <div class="text-muted" style="font-size:11px">{{item.locked ? 'You pay (' + getPayPercent(item) + '%)' : 'Full price'}}</div>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="card">
              <h3 class="mb-3">Payment Method</h3>
              <div class="pay-tabs">
                <button class="pay-tab" [class.active]="paymentMethod === 'UPI'" (click)="paymentMethod = 'UPI'; clearPayFields()">
                  <i class="fas fa-mobile-alt"></i> UPI
                </button>
                <button class="pay-tab" [class.active]="paymentMethod === 'CARD'" (click)="paymentMethod = 'CARD'; clearPayFields()">
                  <i class="fas fa-credit-card"></i> Card
                </button>
              </div>

              <!-- UPI Fields -->
              <div *ngIf="paymentMethod === 'UPI'" class="pay-fields">
                <div class="form-group">
                  <label>UPI ID</label>
                  <input class="form-control" [(ngModel)]="upiId" placeholder="yourname@bankname"
                    [class.is-valid]="upiId && isValidUpi(upiId)"
                    [class.is-invalid]="upiId && !isValidUpi(upiId)">
                  <div class="inv" *ngIf="upiId && !isValidUpi(upiId)">Enter a valid UPI ID (e.g. name&#64;okaxis, name&#64;upi)</div>
                </div>
                <div class="form-group">
                  <label>Transaction ID</label>
                  <input class="form-control" [(ngModel)]="transactionId" placeholder="e.g. UPI123456789"
                    [class.is-valid]="transactionId.length >= 6"
                    [class.is-invalid]="transactionId && transactionId.length < 6">
                  <div class="inv" *ngIf="transactionId && transactionId.length < 6">Transaction ID must be at least 6 characters</div>
                  <small class="text-muted">Enter FAIL... to simulate failure</small>
                </div>
              </div>

              <!-- Card Fields -->
              <div *ngIf="paymentMethod === 'CARD'" class="pay-fields">
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
                  <input class="form-control" [(ngModel)]="transactionId" placeholder="e.g. CARD987654321"
                    [class.is-valid]="transactionId.length >= 6"
                    [class.is-invalid]="transactionId && transactionId.length < 6">
                  <div class="inv" *ngIf="transactionId && transactionId.length < 6">Transaction ID must be at least 6 characters</div>
                  <small class="text-muted">Enter FAIL... to simulate failure</small>
                </div>
              </div>
            </div>
          </div>

          <div class="checkout-right">
            <div class="card">
              <h3 class="mb-3">Price Summary</h3>
              <div class="summary-row" *ngFor="let item of validation.items">
                <span>{{item.productName}} x{{item.quantity}}</span>
                <div class="text-right">
                  <div>₹{{item.payableAmount | number:'1.0-0'}}</div>
                  <div *ngIf="item.locked" style="font-size:11px;color:#10b981">{{getPayPercent(item)}}% payable ({{100 - getPayPercent(item)}}% lock fee paid)</div>
                </div>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-total flex-between">
                <strong>Total Payable Now</strong>
                <strong style="font-size:22px;color:#2563eb">₹{{validation.totalAmount | number:'1.0-0'}}</strong>
              </div>
              <div class="alert alert-info mt-2" style="font-size:12px" *ngIf="hasLockedItems">
                <i class="fas fa-lock"></i> Lock fees already deducted from total. You pay only the remaining amount.
              </div>
              <div class="alert alert-danger mt-3" *ngIf="error">{{error}}</div>
              <button class="btn btn-primary btn-block btn-lg mt-3"
                (click)="placeOrder()" [disabled]="!isPaymentFormValid() || placing">
                <i class="fas fa-spinner fa-spin" *ngIf="placing"></i>
                <i class="fas fa-lock" *ngIf="!placing"></i>
                {{placing ? 'Processing...' : 'Pay ₹' + (validation.totalAmount | number:'1.0-0')}}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Result Modal -->
      <div class="modal-overlay" *ngIf="orderResult">
        <div class="result-modal card" [class.success]="orderResult.success" [class.failure]="!orderResult.success">
          <div class="result-icon">
            <i class="fas" [class.fa-check-circle]="orderResult.success" [class.fa-times-circle]="!orderResult.success"></i>
          </div>
          <h2>{{orderResult.success ? 'Order Confirmed!' : 'Payment Failed'}}</h2>
          <p>{{orderResult.message}}</p>
          <p *ngIf="orderResult.orderId" class="order-id">Order ID: <strong>{{orderResult.orderId}}</strong></p>
          <div class="flex gap-3 mt-4" style="justify-content:center">
            <a routerLink="/orders" class="btn btn-primary" *ngIf="orderResult.success">View Orders</a>
            <a routerLink="/cart" class="btn btn-outline" *ngIf="!orderResult.success">Back to Cart</a>
            <a routerLink="/products" class="btn btn-outline">Continue Shopping</a>
          </div>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .checkout-layout { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
    .order-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .lock-breakdown { margin-top: 4px; }
    .pay-tabs { display: flex; gap: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
    .pay-tab { flex: 1; padding: 12px; border: none; background: white; cursor: pointer; font-size: 14px; font-weight: 500; color: #6b7280; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
    .pay-tab:first-child { border-right: 1px solid #e2e8f0; }
    .pay-tab.active { background: #eff6ff; color: #2563eb; font-weight: 600; }
    .pay-tab i { font-size: 16px; }
    .is-valid { border-color: #10b981 !important; }
    .is-invalid { border-color: #ef4444 !important; }
    .inv { color: #ef4444; font-size: 12px; margin-top: 4px; }
    .pay-fields { animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .summary-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; }
    .summary-divider { border-top: 1px solid #e2e8f0; margin: 12px 0; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 300; padding: 20px; }
    .result-modal { max-width: 440px; width: 100%; text-align: center; padding: 40px; }
    .result-icon { font-size: 64px; margin-bottom: 16px; }
    .result-modal.success .result-icon { color: #10b981; }
    .result-modal.failure .result-icon { color: #ef4444; }
    .result-modal h2 { font-size: 24px; margin-bottom: 8px; }
    .order-id { background: #f1f5f9; padding: 8px 16px; border-radius: 6px; margin-top: 12px; font-size: 14px; }
    @media (max-width: 768px) { .checkout-layout { grid-template-columns: 1fr; } }
  `]
})
export class CheckoutComponent implements OnInit {
  validation: CheckoutValidation | null = null;
  loading = true;
  paymentMethod = 'UPI';
  transactionId = '';
  upiId = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';
  placing = false;
  error = '';
  orderResult: any = null;

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit() {
    this.orderService.validateCart().subscribe({
      next: v => { this.validation = v; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get hasLockedItems(): boolean {
    return this.validation?.items?.some(i => i.locked) ?? false;
  }

  // Returns the % the user pays now: 95 for 5% fee, 93 for 7%, 90 for 10%
  getPayPercent(item: any): number {
    if (!item.locked || !item.lockFeeAlreadyPaid || !item.appliedPrice || !item.quantity) return 100;
    const fullAmount = item.appliedPrice * item.quantity;
    const feePercent = Math.round((item.lockFeeAlreadyPaid / fullAmount) * 100);
    return 100 - feePercent;
  }

  get cardDigits(): number { return this.cardNumber.split('').filter(c => c !== ' ').length; }

  clearPayFields() { this.transactionId = ''; this.upiId = ''; this.cardNumber = ''; this.cardExpiry = ''; this.cardCvv = ''; }

  isValidUpi(id: string): boolean { return /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(id); }

  isValidExpiry(val: string): boolean {
    if (!/^\d{2}\/\d{2}$/.test(val)) return false;
    const [mm, yy] = val.split('/').map(Number);
    if (mm < 1 || mm > 12) return false;
    const now = new Date(); const expDate = new Date(2000 + yy, mm - 1, 1);
    return expDate >= new Date(now.getFullYear(), now.getMonth(), 1);
  }

  onlyDigits(e: KeyboardEvent) { if (!/\d/.test(e.key)) e.preventDefault(); }

  isPaymentFormValid(): boolean {
    if (!this.transactionId || this.transactionId.length < 6) return false;
    if (this.paymentMethod === 'UPI') return this.isValidUpi(this.upiId);
    if (this.paymentMethod === 'CARD') {
      return this.cardDigits === 16 &&
             this.isValidExpiry(this.cardExpiry) &&
             this.cardCvv.length === 3;
    }
    return false;
  }

  formatCard(event: Event) {
    let val = (event.target as HTMLInputElement).value.replace(/\D/g, '').substring(0, 16);
    this.cardNumber = val.replace(/(\d{4})/g, '$1 ').trim();
  }

  formatExpiry(event: Event) {
    let val = (event.target as HTMLInputElement).value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2);
    this.cardExpiry = val;
  }

  placeOrder() {
    this.placing = true; this.error = '';
    this.orderService.checkout(this.paymentMethod, this.transactionId).subscribe({
      next: res => { this.placing = false; this.orderResult = res; },
      error: err => { this.error = err.error?.message || 'Payment failed'; this.placing = false; }
    });
  }
}
