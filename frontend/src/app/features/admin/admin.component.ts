import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Toast -->
    <div class="admin-toast" *ngIf="toast.msg" [class]="'admin-toast ' + toast.type">
      <i class="fas" [class.fa-check-circle]="toast.type==='success'" [class.fa-times-circle]="toast.type==='error'" [class.fa-info-circle]="toast.type==='info'"></i>
      {{toast.msg}}
    </div>

    <!-- Confirm Dialog -->
    <div class="modal-overlay" *ngIf="confirmDialog.show">
      <div class="confirm-box card">
        <div class="confirm-icon" [class.danger]="confirmDialog.danger">
          <i class="fas" [class.fa-trash]="confirmDialog.danger" [class.fa-question-circle]="!confirmDialog.danger"></i>
        </div>
        <h3>{{confirmDialog.title}}</h3>
        <p class="text-muted">{{confirmDialog.message}}</p>
        <div class="confirm-btns">
          <button class="btn btn-outline" (click)="confirmDialog.show = false">Cancel</button>
          <button class="btn" [class.btn-danger]="confirmDialog.danger" [class.btn-primary]="!confirmDialog.danger"
            (click)="confirmDialog.onConfirm(); confirmDialog.show = false">
            {{confirmDialog.confirmLabel}}
          </button>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <div class="modal-overlay" *ngIf="showAddUser" (click)="showAddUser = false">
      <div class="modal-box card" (click)="$event.stopPropagation()">
        <div class="flex-between mb-3">
          <h3><i class="fas fa-user-plus" style="color:#7c3aed"></i> Add New User</h3>
          <button class="btn btn-sm" (click)="showAddUser = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="alert-popup success" *ngIf="addUserSuccess">
          <i class="fas fa-check-circle"></i> {{addUserSuccess}}
        </div>
        <div class="alert-popup error" *ngIf="addUserError">
          <i class="fas fa-times-circle"></i> {{addUserError}}
        </div>
        <form (ngSubmit)="submitAddUser()" #addForm="ngForm" novalidate>

          <!-- Row 1: Full Name + Username -->
          <div class="grid grid-2">
            <div class="form-group">
              <label>Full Name <span class="req">*</span></label>
              <input class="form-control" [(ngModel)]="newUser.fullName" name="fullName"
                #fnRef="ngModel" required minlength="2" [pattern]="fullNamePattern"
                [class.is-invalid]="fnRef.touched && fnRef.invalid"
                [class.is-valid]="fnRef.touched && fnRef.valid"
                (input)="onAdminFullName($event)"
                placeholder="Letters and spaces only">
              <div class="inv" *ngIf="fnRef.touched && fnRef.errors?.['required']">Required</div>
              <div class="inv" *ngIf="fnRef.touched && fnRef.errors?.['pattern']">Only letters and spaces, must start with a letter</div>
            </div>
            <div class="form-group">
              <label>Username <span class="req">*</span></label>
              <input class="form-control" [(ngModel)]="newUser.username" name="username"
                #unRef="ngModel" required minlength="3" maxlength="20" [pattern]="usernamePattern"
                [class.is-invalid]="unRef.touched && unRef.invalid"
                [class.is-valid]="unRef.touched && unRef.valid"
                (input)="onAdminUsername($event)"
                placeholder="Starts with letter or _">
              <div class="inv" *ngIf="unRef.touched && unRef.errors?.['required']">Required</div>
              <div class="inv" *ngIf="unRef.touched && unRef.errors?.['minlength']">Min 3 characters</div>
              <div class="inv" *ngIf="unRef.touched && unRef.errors?.['pattern']">Must start with a letter or underscore</div>
            </div>
          </div>

          <!-- Row 2: Email + Phone -->
          <div class="grid grid-2">
            <div class="form-group">
              <label>Email <span class="req">*</span></label>
              <input class="form-control" type="email" [(ngModel)]="newUser.email" name="email"
                #emRef="ngModel" required [pattern]="emailPattern"
                [class.is-invalid]="emRef.touched && emRef.invalid"
                [class.is-valid]="emRef.touched && emRef.valid"
                placeholder="example@email.com">
              <div class="inv" *ngIf="emRef.touched && emRef.errors?.['required']">Required</div>
              <div class="inv" *ngIf="emRef.touched && emRef.errors?.['pattern']">Enter a valid email address</div>
            </div>
            <div class="form-group">
              <label>Phone <span class="req">*</span></label>
              <input class="form-control" [(ngModel)]="newUser.phone" name="phone"
                #phRef="ngModel" required pattern="^[6-9][0-9]{9}$" maxlength="10"
                [class.is-invalid]="phRef.touched && phRef.invalid"
                [class.is-valid]="phRef.touched && phRef.valid"
                (keypress)="onPhoneKeypress($event)"
                (input)="onPhoneInput($event)"
                placeholder="10-digit mobile (6-9 start)">
              <div class="inv" *ngIf="phRef.touched && phRef.errors?.['required']">Required</div>
              <div class="inv" *ngIf="phRef.touched && phRef.errors?.['pattern']">Valid 10-digit number starting with 6–9</div>
            </div>
          </div>

          <!-- Row 3: Password + Role -->
          <div class="grid grid-2">
            <div class="form-group">
              <label>Password <span class="req">*</span></label>
              <div class="pw-wrap">
                <input class="form-control" [type]="showPw ? 'text' : 'password'"
                  [(ngModel)]="newUser.password" name="password"
                  #pwRef="ngModel" required minlength="8" [pattern]="passwordPattern"
                  [class.is-invalid]="pwRef.touched && pwRef.invalid"
                  [class.is-valid]="pwRef.touched && pwRef.valid"
                  placeholder="Min 8, A-Z, 0-9, special">
                <button type="button" class="pw-toggle" (click)="showPw = !showPw">
                  <i class="fas" [class.fa-eye]="!showPw" [class.fa-eye-slash]="showPw"></i>
                </button>
              </div>
              <div class="inv" *ngIf="pwRef.touched && pwRef.errors?.['required']">Required</div>
              <div class="inv" *ngIf="pwRef.touched && pwRef.errors?.['minlength']">Min 8 characters</div>
              <div class="inv" *ngIf="pwRef.touched && pwRef.errors?.['pattern']">Needs uppercase, lowercase, number &amp; special char (&#64;$!%*?&amp;)</div>
              <div class="pw-strength" *ngIf="newUser.password">
                <div class="pw-bar"><div class="pw-fill" [style.width]="pwStrength + '%'" [class]="pwClass"></div></div>
                <small [class]="pwClass">{{pwLabel}}</small>
              </div>
            </div>
            <div class="form-group">
              <label>Role <span class="req">*</span></label>
              <select class="form-control" [(ngModel)]="newUser.role" name="role">
                <option value="CUSTOMER">Customer</option>
                <option value="SELLER">Seller</option>
                <option value="FINANCE">Finance</option>
              </select>
            </div>
          </div>

          <button class="btn btn-primary btn-block" type="submit" [disabled]="addForm.invalid || addingUser">
            <i class="fas fa-spinner fa-spin" *ngIf="addingUser"></i>
            {{addingUser ? 'Creating...' : 'Create User'}}
          </button>
        </form>
      </div>
    </div>

    <div class="container">
      <div class="page-header">
        <h1><i class="fas fa-shield-alt" style="color:#7c3aed"></i> Admin Dashboard</h1>
        <p>Full system control — users, products, orders, locks</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-4 mb-4" *ngIf="stats">
        <div class="stat-card card"><div class="stat-icon" style="background:#ede9fe;color:#7c3aed"><i class="fas fa-users"></i></div><div><div class="stat-label">Total Users</div><div class="stat-value">{{stats.totalUsers}}</div></div></div>
        <div class="stat-card card"><div class="stat-icon" style="background:#dbeafe;color:#2563eb"><i class="fas fa-box"></i></div><div><div class="stat-label">Products</div><div class="stat-value">{{stats.totalProducts}}</div></div></div>
        <div class="stat-card card"><div class="stat-icon" style="background:#d1fae5;color:#10b981"><i class="fas fa-shopping-bag"></i></div><div><div class="stat-label">Total Orders</div><div class="stat-value">{{stats.totalOrders}}</div></div></div>
        <div class="stat-card card"><div class="stat-icon" style="background:#fef3c7;color:#f59e0b"><i class="fas fa-lock"></i></div><div><div class="stat-label">Active Locks</div><div class="stat-value">{{stats.activeLocks}}</div></div></div>
        <div class="stat-card card"><div class="stat-icon" style="background:#fee2e2;color:#ef4444"><i class="fas fa-user-tie"></i></div><div><div class="stat-label">Sellers</div><div class="stat-value">{{stats.totalSellers}}</div></div></div>
        <div class="stat-card card"><div class="stat-icon" style="background:#fce7f3;color:#db2777"><i class="fas fa-user"></i></div><div><div class="stat-label">Customers</div><div class="stat-value">{{stats.totalCustomers}}</div></div></div>
        <div class="stat-card card"><div class="stat-icon" style="background:#d1fae5;color:#10b981"><i class="fas fa-check-circle"></i></div><div><div class="stat-label">Confirmed Orders</div><div class="stat-value">{{stats.confirmedOrders}}</div></div></div>
        <div class="stat-card card"><div class="stat-icon" style="background:#fee2e2;color:#ef4444"><i class="fas fa-rupee-sign"></i></div><div><div class="stat-label">Revenue</div><div class="stat-value">₹{{stats.totalRevenue | number:'1.0-0'}}</div></div></div>
      </div>

      <!-- Tabs -->
      <div class="tabs mb-4">
        <button class="tab-btn" [class.active]="tab==='users'" (click)="switchTab('users')"><i class="fas fa-users"></i> Users ({{nonAdminUsers.length}})</button>
        <button class="tab-btn" [class.active]="tab==='products'" (click)="switchTab('products')"><i class="fas fa-box"></i> Products ({{products.length}})</button>
        <button class="tab-btn" [class.active]="tab==='orders'" (click)="switchTab('orders')"><i class="fas fa-shopping-bag"></i> Orders ({{orders.length}})</button>
        <button class="tab-btn" [class.active]="tab==='locks'" (click)="switchTab('locks')"><i class="fas fa-lock"></i> Locks ({{locks.length}})</button>
      </div>

      <div class="spinner" *ngIf="loading"></div>

      <!-- Users Tab -->
      <div *ngIf="tab==='users' && !loading">
        <div class="flex-between mb-3">
          <input class="form-control" style="max-width:300px" [(ngModel)]="userSearch" placeholder="Search users...">
          <button class="btn btn-primary" (click)="openAddUser()">
            <i class="fas fa-user-plus"></i> Add User
          </button>
        </div>
        <div class="card">
          <table class="table">
            <thead><tr><th>ID</th><th>Username</th><th>Full Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Wallet</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let u of filteredUsers">
                <td class="text-muted" style="font-size:12px">{{u.id}}</td>
                <td><strong>{{u.username}}</strong></td>
                <td style="font-size:13px">{{u.fullName || '—'}}</td>
                <td style="font-size:13px">{{u.email}}</td>
                <td style="font-size:13px">{{u.phone}}</td>
                <td>
                  <select class="role-select" [value]="u.role" (change)="changeRole(u, $event)">
                    <option value="CUSTOMER">Customer</option>
                    <option value="SELLER">Seller</option>
                    <option value="FINANCE">Finance</option>
                  </select>
                </td>
                <td>₹{{u.walletBalance | number:'1.0-0'}}</td>
                <td><span class="badge" [class.badge-success]="u.active" [class.badge-danger]="!u.active">{{u.active ? 'Active' : 'Inactive'}}</span></td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm" [class.btn-danger]="u.active" [class.btn-success]="!u.active" (click)="toggleUser(u)" title="Toggle status">
                      <i class="fas" [class.fa-ban]="u.active" [class.fa-check]="!u.active"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" (click)="askDeleteUser(u)" title="Delete"><i class="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="filteredUsers.length === 0"><i class="fas fa-users"></i><h3>No users found</h3></div>
        </div>
      </div>

      <!-- Products Tab -->
      <div *ngIf="tab==='products' && !loading">
        <div class="card mb-3"><input class="form-control" style="max-width:300px" [(ngModel)]="productSearch" placeholder="Search products..."></div>
        <div class="card">
          <table class="table">
            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Seller</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of filteredProducts">
                <td><img [src]="p.imageUrl" style="width:48px;height:36px;object-fit:cover;border-radius:4px"></td>
                <td><strong>{{p.name}}</strong></td>
                <td><span class="badge badge-info">{{p.category}}</span></td>
                <td style="font-size:13px">{{p.seller?.username}}</td>
                <td><strong>₹{{p.price | number:'1.0-0'}}</strong></td>
                <td [class.text-danger]="p.stock < 10">{{p.stock}}</td>
                <td><span class="badge" [class.badge-success]="p.active" [class.badge-danger]="!p.active">{{p.active ? 'Active' : 'Inactive'}}</span></td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-sm" [class.btn-danger]="p.active" [class.btn-success]="!p.active" (click)="toggleProduct(p)">
                      <i class="fas" [class.fa-eye-slash]="p.active" [class.fa-eye]="!p.active"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" (click)="askDeleteProduct(p)"><i class="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Orders Tab -->
      <div *ngIf="tab==='orders' && !loading">
        <div class="card">
          <table class="table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              <tr *ngFor="let o of orders">
                <td><strong style="font-size:13px">{{o.orderId}}</strong></td>
                <td>{{o.user?.username}}</td>
                <td><strong>₹{{o.totalAmount | number:'1.0-0'}}</strong></td>
                <td style="font-size:13px">{{o.paymentMethod}}</td>
                <td><span class="badge" [class]="getOrderStatusClass(o.status)">{{o.status}}</span></td>
                <td style="font-size:12px;color:#6b7280">{{o.createdAt | date:'short'}}</td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="orders.length===0"><i class="fas fa-shopping-bag"></i><h3>No orders yet</h3></div>
        </div>
      </div>

      <!-- Locks Tab -->
      <div *ngIf="tab==='locks' && !loading">
        <div class="card">
          <table class="table">
            <thead><tr><th>Customer</th><th>Product</th><th>Locked Price</th><th>Qty</th><th>Lock Fee</th><th>Status</th><th>Expires</th></tr></thead>
            <tbody>
              <tr *ngFor="let l of locks">
                <td>{{l.user?.username}}</td>
                <td><strong>{{l.product?.name}}</strong></td>
                <td>₹{{l.lockedPrice | number:'1.0-0'}}</td>
                <td>{{l.quantity}}</td>
                <td>₹{{l.lockFee | number:'1.2-2'}}</td>
                <td><span class="badge" [class]="getLockStatusClass(l.status)">{{l.status}}</span></td>
                <td style="font-size:12px" [class.text-danger]="isExpired(l.expiresAt)">{{l.expiresAt | date:'short'}}</td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" *ngIf="locks.length===0"><i class="fas fa-lock-open"></i><h3>No locks yet</h3></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-toast {
      position: fixed; top: 80px; right: 20px; z-index: 9999;
      padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 500;
      display: flex; align-items: center; gap: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease; color: white;
    }
    .admin-toast.success { background: #10b981; }
    .admin-toast.error { background: #ef4444; }
    .admin-toast.info { background: #2563eb; }
    @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 500; padding: 20px; }
    .modal-box { width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
    .confirm-box { max-width: 380px; width: 100%; text-align: center; padding: 32px 24px; }
    .confirm-icon { font-size: 48px; margin-bottom: 16px; }
    .confirm-icon.danger { color: #ef4444; }
    .confirm-icon:not(.danger) { color: #2563eb; }
    .confirm-box h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .confirm-btns { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }
    .alert-popup { padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
    .alert-popup.success { background: #d1fae5; color: #065f46; }
    .alert-popup.error { background: #fee2e2; color: #991b1b; }
    .stat-card { display:flex; align-items:center; gap:16px; }
    .stat-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
    .stat-label { font-size:13px; color:#6b7280; margin-bottom:2px; }
    .stat-value { font-size:22px; font-weight:700; color:#1e293b; }
    .tabs { display:flex; gap:8px; border-bottom:2px solid #e2e8f0; }
    .tab-btn { padding:10px 20px; border:none; background:none; cursor:pointer; font-size:14px; font-weight:500; color:#6b7280; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all 0.2s; }
    .tab-btn.active { color:#7c3aed; border-bottom-color:#7c3aed; }
    .role-select { padding:4px 8px; border:1px solid #e2e8f0; border-radius:6px; font-size:13px; cursor:pointer; }
    .req { color: #ef4444; }
    .inv { color: #ef4444; font-size: 11px; margin-top: 3px; display: block; }
    .form-control.is-invalid { border-color: #ef4444; }
    .form-control.is-valid { border-color: #10b981; }
    .pw-wrap { position: relative; }
    .pw-wrap .form-control { padding-right: 38px; }
    .pw-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6b7280; }
    .pw-strength { margin-top: 5px; }
    .pw-bar { height: 4px; background: #e2e8f0; border-radius: 2px; margin-bottom: 2px; }
    .pw-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
    .pw-fill.weak { background: #ef4444; } .pw-fill.fair { background: #f59e0b; }
    .pw-fill.good { background: #3b82f6; } .pw-fill.strong { background: #10b981; }
    small.weak { color: #ef4444; font-size: 11px; } small.fair { color: #f59e0b; font-size: 11px; }
    small.good { color: #3b82f6; font-size: 11px; } small.strong { color: #10b981; font-size: 11px; }
  `]
})
export class AdminComponent implements OnInit {
  tab = 'users';
  stats: any = null;
  users: any[] = [];
  products: any[] = [];
  orders: any[] = [];
  locks: any[] = [];
  loading = false;
  userSearch = '';
  productSearch = '';

  toast = { msg: '', type: 'success' };
  confirmDialog = { show: false, title: '', message: '', confirmLabel: 'Confirm', danger: false, onConfirm: () => {} };

  showAddUser = false;
  addingUser = false;
  addUserSuccess = '';
  addUserError = '';
  newUser = { fullName: '', username: '', email: '', phone: '', password: '', role: 'CUSTOMER' };
  showPw = false;

  // Validation patterns
  fullNamePattern = '^[a-zA-Z][a-zA-Z ]*$';
  usernamePattern = '^[a-zA-Z_][a-zA-Z0-9_]{2,19}$';
  emailPattern = '^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$';
  passwordPattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getStats().subscribe(s => this.stats = s);
    this.switchTab('users');
  }

  showToast(msg: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toast = { msg, type };
    setTimeout(() => this.toast.msg = '', 3000);
  }

  showConfirm(title: string, message: string, confirmLabel: string, danger: boolean, onConfirm: () => void) {
    this.confirmDialog = { show: true, title, message, confirmLabel, danger, onConfirm };
  }

  switchTab(t: string) {
    this.tab = t; this.loading = true;
    const loaders: any = {
      users: () => this.adminService.getUsers().subscribe(d => { this.users = d; this.loading = false; }),
      products: () => this.adminService.getProducts().subscribe(d => { this.products = d; this.loading = false; }),
      orders: () => this.adminService.getOrders().subscribe(d => { this.orders = d; this.loading = false; }),
      locks: () => this.adminService.getLocks().subscribe(d => { this.locks = d; this.loading = false; })
    };
    loaders[t]();
  }

  // Exclude ADMIN users from the table
  get nonAdminUsers() { return this.users.filter(u => u.role !== 'ADMIN'); }

  get filteredUsers() {
    return this.nonAdminUsers.filter(u => !this.userSearch ||
      u.username.toLowerCase().includes(this.userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(this.userSearch.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(this.userSearch.toLowerCase()));
  }

  get filteredProducts() {
    return this.products.filter(p => !this.productSearch || p.name.toLowerCase().includes(this.productSearch.toLowerCase()));
  }

  openAddUser() {
    this.newUser = { fullName: '', username: '', email: '', phone: '', password: '', role: 'CUSTOMER' };
    this.addUserSuccess = ''; this.addUserError = ''; this.showPw = false;
    this.showAddUser = true;
  }

  onAdminFullName(e: Event) {
    const i = e.target as HTMLInputElement;
    i.value = i.value.replace(/[^a-zA-Z ]/g, '').replace(/^ +/, '');
    this.newUser.fullName = i.value;
  }

  onAdminUsername(e: Event) {
    const i = e.target as HTMLInputElement;
    i.value = i.value.replace(/^[^a-zA-Z_]+/, '');
    this.newUser.username = i.value;
  }

  onPhoneKeypress(e: KeyboardEvent) { if (!/[0-9]/.test(e.key)) e.preventDefault(); }

  onPhoneInput(e: Event) {
    const i = e.target as HTMLInputElement;
    i.value = i.value.replace(/\D/g, '').substring(0, 10);
    this.newUser.phone = i.value;
  }

  get pwStrength(): number {
    const p = this.newUser.password; if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s += 25; if (/[A-Z]/.test(p)) s += 25;
    if (/[0-9]/.test(p)) s += 25; if (/[@$!%*?&]/.test(p)) s += 25;
    return s;
  }
  get pwClass(): string { const s = this.pwStrength; if (s <= 25) return 'weak'; if (s <= 50) return 'fair'; if (s <= 75) return 'good'; return 'strong'; }
  get pwLabel(): string { return ({ weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' } as any)[this.pwClass]; }

  submitAddUser() {
    this.addingUser = true; this.addUserSuccess = ''; this.addUserError = '';
    this.adminService.createUser(this.newUser).subscribe({
      next: (created) => {
        this.addingUser = false;
        this.addUserSuccess = `User "${created.username}" created successfully!`;
        this.users.push(created);
        this.adminService.getStats().subscribe(s => this.stats = s);
        setTimeout(() => { this.showAddUser = false; this.addUserSuccess = ''; }, 1500);
        this.showToast(`User "${created.username}" added.`, 'success');
      },
      error: (err) => {
        this.addingUser = false;
        this.addUserError = err.error?.message || 'Failed to create user.';
      }
    });
  }

  toggleUser(u: any) {
    this.adminService.toggleUserStatus(u.id).subscribe(updated => {
      u.active = updated.active;
      this.adminService.getStats().subscribe(s => this.stats = s);
      this.showToast(`User "${u.username}" ${updated.active ? 'activated' : 'deactivated'}.`);
    });
  }

  changeRole(u: any, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    const oldRole = u.role;
    this.showConfirm('Change Role', `Change "${u.username}" from ${oldRole} to ${role}?`, 'Change Role', false, () => {
      this.adminService.changeUserRole(u.id, role).subscribe({
        next: updated => { u.role = updated.role; this.showToast(`Role of "${u.username}" changed to ${role}.`, 'info'); },
        error: () => { (event.target as HTMLSelectElement).value = oldRole; this.showToast('Failed to change role.', 'error'); }
      });
    });
  }

  askDeleteUser(u: any) {
    this.showConfirm('Delete User', `Permanently delete "${u.username}"? This cannot be undone.`, 'Delete', true, () => {
      this.adminService.deleteUser(u.id).subscribe(() => {
        this.users = this.users.filter(x => x.id !== u.id);
        this.adminService.getStats().subscribe(s => this.stats = s);
        this.showToast(`User "${u.username}" deleted.`, 'error');
      });
    });
  }

  toggleProduct(p: any) {
    this.adminService.toggleProductStatus(p.id).subscribe(updated => {
      p.active = updated.active;
      this.showToast(`Product "${p.name}" ${updated.active ? 'shown' : 'hidden'}.`);
    });
  }

  askDeleteProduct(p: any) {
    this.showConfirm('Delete Product', `Permanently delete "${p.name}"? This cannot be undone.`, 'Delete', true, () => {
      this.adminService.deleteProduct(p.id).subscribe(() => {
        this.products = this.products.filter(x => x.id !== p.id);
        this.adminService.getStats().subscribe(s => this.stats = s);
        this.showToast(`Product "${p.name}" deleted.`, 'error');
      });
    });
  }

  getOrderStatusClass(s: string) {
    const m: any = { CONFIRMED: 'badge-success', FAILED: 'badge-danger', PENDING: 'badge-warning', CANCELLED: 'badge-secondary' };
    return m[s] || 'badge-secondary';
  }

  getLockStatusClass(s: string) {
    const m: any = { ACTIVE: 'badge-success', EXPIRED: 'badge-danger', USED: 'badge-info', REFUNDED: 'badge-warning' };
    return m[s] || 'badge-secondary';
  }

  isExpired(date: string) { return new Date(date) < new Date(); }
}
