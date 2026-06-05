import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../core/services/api.services';
import { FinanceSummary, Transaction } from '../../core/models';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Finance Dashboard</h1>
        <p>Transaction visibility and revenue management</p>
      </div>

      <div class="spinner" *ngIf="loading"></div>

      <div *ngIf="!loading && summary">
        <!-- Summary Cards -->
        <div class="grid grid-3 mb-4">
          <div class="stat-card card">
            <div class="stat-icon" style="background:#dbeafe;color:#2563eb"><i class="fas fa-lock"></i></div>
            <div>
              <div class="stat-label">Lock Revenue</div>
              <div class="stat-value">₹{{summary.totalLockRevenue | number:'1.2-2'}}</div>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon" style="background:#fee2e2;color:#ef4444"><i class="fas fa-undo"></i></div>
            <div>
              <div class="stat-label">Total Refunds</div>
              <div class="stat-value">₹{{summary.totalRefunds | number:'1.2-2'}}</div>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon" style="background:#d1fae5;color:#10b981"><i class="fas fa-credit-card"></i></div>
            <div>
              <div class="stat-label">Total Payments</div>
              <div class="stat-value">₹{{summary.totalPayments | number:'1.2-2'}}</div>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon" style="background:#fef3c7;color:#f59e0b"><i class="fas fa-wallet"></i></div>
            <div>
              <div class="stat-label">Wallet Credits</div>
              <div class="stat-value">₹{{summary.totalWalletCredits | number:'1.2-2'}}</div>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon" style="background:#ede9fe;color:#7c3aed"><i class="fas fa-box"></i></div>
            <div>
              <div class="stat-label">Total Orders</div>
              <div class="stat-value">{{summary.totalOrders}}</div>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon" style="background:#fce7f3;color:#db2777"><i class="fas fa-lock"></i></div>
            <div>
              <div class="stat-label">Active Locks</div>
              <div class="stat-value">{{summary.activeLocks}}</div>
            </div>
          </div>
        </div>

        <!-- Net Revenue -->
        <div class="card mb-4">
          <div class="flex-between">
            <div>
              <div class="text-muted" style="font-size:14px">Net Revenue (Payments + Lock Fees - Refunds)</div>
              <div style="font-size:28px;font-weight:700;color:#10b981">
                ₹{{(summary.totalPayments + summary.totalLockRevenue - summary.totalRefunds) | number:'1.2-2'}}
              </div>
            </div>
            <button class="btn btn-outline" (click)="downloadReport()">
              <i class="fas fa-download"></i> Download Report
            </button>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="card">
          <div class="flex-between mb-3">
            <h3>Transactions</h3>
            <select class="form-control" style="max-width:200px" [(ngModel)]="filterType" (change)="filterTransactions()">
              <option value="">All Types</option>
              <option value="LOCK_FEE">Lock Fees</option>
              <option value="PAYMENT">Payments</option>
              <option value="REFUND">Refunds</option>
              <option value="PRICE_DROP_CREDIT">Price Drop Credits</option>
              <option value="WALLET_CREDIT">Wallet Credits</option>
            </select>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Type</th>
                <th>Description</th>
                <th>Reference</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of transactions">
                <td style="font-size:13px">{{t.createdAt | date:'short'}}</td>
                <td>{{t.user.username}}</td>
                <td><span class="badge" [class]="getTypeClass(t.type)">{{t.type | titlecase}}</span></td>
                <td style="font-size:13px">{{t.description}}</td>
                <td style="font-size:12px;color:#6b7280">{{t.referenceId}}</td>
                <td class="text-right" [class.text-success]="isCredit(t.type)" [class.text-danger]="!isCredit(t.type)">
                  <strong>{{isCredit(t.type) ? '+' : '-'}}₹{{t.amount | number:'1.2-2'}}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="transactions.length === 0">
            <i class="fas fa-receipt"></i>
            <h3>No transactions found</h3>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card { display: flex; align-items: center; gap: 16px; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
    .stat-label { font-size: 13px; color: #6b7280; margin-bottom: 2px; }
    .stat-value { font-size: 22px; font-weight: 700; color: #1e293b; }
  `]
})
export class FinanceComponent implements OnInit {
  summary: FinanceSummary | null = null;
  transactions: Transaction[] = [];
  loading = true;
  filterType = '';

  constructor(private financeService: FinanceService) {}

  ngOnInit() {
    this.financeService.getSummary().subscribe(s => { this.summary = s; this.loading = false; });
    this.financeService.getTransactions().subscribe(t => this.transactions = t);
  }

  filterTransactions() {
    this.financeService.getTransactions(this.filterType || undefined).subscribe(t => this.transactions = t);
  }

  getTypeClass(type: string): string {
    const map: any = {
      LOCK_FEE: 'badge-warning', PAYMENT: 'badge-success',
      REFUND: 'badge-danger', PRICE_DROP_CREDIT: 'badge-info', WALLET_CREDIT: 'badge-info'
    };
    return map[type] || 'badge-secondary';
  }

  isCredit(type: string): boolean {
    return ['PAYMENT', 'LOCK_FEE'].includes(type);
  }

  downloadReport() {
    const rows = [
      ['Date', 'User', 'Type', 'Description', 'Amount'],
      ...this.transactions.map(t => [t.createdAt, t.user?.username, t.type, t.description, t.amount])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'finance-report.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
