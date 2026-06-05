import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../core/services/api.services';
import { PriceLock, Product } from '../../core/models';
import { FooterComponent } from '../../shared/components/footer.component';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Footwear', 'Books', 'Home & Kitchen',
  'Sports & Fitness', 'Beauty & Personal Care', 'Toys & Games',
  'Groceries', 'Furniture', 'Automotive', 'Jewellery', 'Health', 'Stationery'
];

@Component({
  selector: 'app-seller',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  template: `
    <div class="container">
      <div class="page-header flex-between">
        <div>
          <h1>Seller Dashboard</h1>
          <p>Manage your products and view locked items</p>
        </div>
        <button class="btn btn-primary" (click)="openProductModal()">
          <i class="fas fa-plus"></i> Add Product
        </button>
      </div>

      <div class="tabs mb-4">
        <button class="tab-btn" [class.active]="activeTab === 'products'" (click)="activeTab = 'products'">
          <i class="fas fa-box"></i> My Products ({{products.length}})
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'locks'" (click)="activeTab = 'locks'">
          <i class="fas fa-lock"></i> Locked Products ({{lockedProducts.length}})
        </button>
      </div>

      <!-- Products Tab -->
      <div *ngIf="activeTab === 'products'">
        <div class="spinner" *ngIf="loading"></div>
        <div class="empty-state" *ngIf="!loading && products.length === 0">
          <i class="fas fa-box-open"></i>
          <h3>No products yet</h3>
          <button class="btn btn-primary mt-3" (click)="openProductModal()">Add First Product</button>
        </div>
        <table class="table card" *ngIf="!loading && products.length > 0">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of products">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <img [src]="p.imageUrl || 'https://placehold.co/40x40/94a3b8/ffffff?text=IMG'" style="width:40px;height:40px;object-fit:cover;border-radius:6px">
                  <div>
                    <div style="font-weight:600">{{p.name}}</div>
                    <div class="text-muted" style="font-size:12px">{{p.description | slice:0:40}}...</div>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-info">{{p.category}}</span></td>
              <td><strong>₹{{p.price | number:'1.0-0'}}</strong></td>
              <td>
                <span [class.text-danger]="p.stock < 10" [class.text-success]="p.stock >= 10">
                  {{p.stock}}
                </span>
              </td>
              <td><span class="badge" [class.badge-success]="p.active" [class.badge-danger]="!p.active">{{p.active ? 'Active' : 'Inactive'}}</span></td>
              <td>
                <button class="btn btn-outline btn-sm" (click)="editProduct(p)">
                  <i class="fas fa-edit"></i> Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Locked Products Tab -->
      <div *ngIf="activeTab === 'locks'">
        <div class="spinner" *ngIf="loadingLocks"></div>
        <div class="empty-state" *ngIf="!loadingLocks && lockedProducts.length === 0">
          <i class="fas fa-lock-open"></i>
          <h3>No active price locks</h3>
        </div>
        <table class="table card" *ngIf="!loadingLocks && lockedProducts.length > 0">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Locked Price</th>
              <th>Qty</th>
              <th>Expires At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let lock of lockedProducts">
              <td><strong>{{lock.product.name}}</strong></td>
              <td>{{lock.user.username}}</td>
              <td>₹{{lock.lockedPrice | number:'1.0-0'}}</td>
              <td>{{lock.quantity}}</td>
              <td [class.text-danger]="isExpiringSoon(lock.expiresAt)">{{lock.expiresAt | date:'short'}}</td>
              <td><span class="badge badge-success">{{lock.status}}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
      <div class="modal-box card" (click)="$event.stopPropagation()">
        <div class="modal-header flex-between mb-3">
          <h3>{{editingProduct ? 'Edit Product' : 'Add Product'}}</h3>
          <button class="btn btn-sm" (click)="showModal = false"><i class="fas fa-times"></i></button>
        </div>
        <div class="alert alert-success" *ngIf="saveSuccess">{{saveSuccess}}</div>
        <div class="alert alert-danger" *ngIf="saveError">{{saveError}}</div>
        <form (ngSubmit)="saveProduct()">
          <div class="grid grid-2">
            <div class="form-group">
              <label>Name</label>
              <input class="form-control" [(ngModel)]="form.name" name="name" required>
            </div>
            <div class="form-group">
              <label>Category</label>
              <select class="form-control" [(ngModel)]="form.category" name="category" required>
                <option value="">-- Select Category --</option>
                <option *ngFor="let c of categoryList" [value]="c">{{c}}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <input class="form-control" [(ngModel)]="form.description" name="description">
          </div>
          <div class="form-group">
            <label>Image URL</label>
            <input class="form-control" [(ngModel)]="form.imageUrl" name="imageUrl">
          </div>
          <div class="grid grid-2">
            <div class="form-group">
              <label>Price (₹)</label>
              <input class="form-control" type="number" [(ngModel)]="form.price" name="price" required min="1">
            </div>
            <div class="form-group">
              <label>Stock (min 10)</label>
              <input class="form-control" type="number" [(ngModel)]="form.stock" name="stock" required min="10">
              <small class="text-muted" *ngIf="form.stock > 0 && form.stock < 10" style="color:#ef4444">Minimum stock is 10</small>
            </div>
          </div>
          <button class="btn btn-primary btn-block" type="submit" [disabled]="saving || form.stock < 10 || !form.category">
            {{saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}}
          </button>
        </form>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styles: [`
    .tabs { display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; }
    .tab-btn {
      padding: 10px 20px; border: none; background: none; cursor: pointer;
      font-size: 14px; font-weight: 500; color: #6b7280; border-bottom: 2px solid transparent;
      margin-bottom: -2px; transition: all 0.2s;
    }
    .tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 300; padding: 20px;
    }
    .modal-box { width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
  `]
})
export class SellerComponent implements OnInit {
  products: Product[] = [];
  lockedProducts: PriceLock[] = [];
  activeTab = 'products';
  loading = true;
  loadingLocks = true;
  showModal = false;
  editingProduct: Product | null = null;
  saving = false;
  saveSuccess = '';
  saveError = '';
  categoryList = CATEGORIES;

  form = { name: '', description: '', category: '', imageUrl: '', price: 0, stock: 10 };

  constructor(private sellerService: SellerService) {}

  ngOnInit() {
    this.loadProducts();
    this.sellerService.getLockedProducts().subscribe(l => { this.lockedProducts = l; this.loadingLocks = false; });
  }

  loadProducts() {
    this.sellerService.getProducts().subscribe(p => { this.products = p; this.loading = false; });
  }

  openProductModal() {
    this.editingProduct = null;
    this.form = { name: '', description: '', category: '', imageUrl: '', price: 0, stock: 10 };
    this.saveSuccess = '';
    this.saveError = '';
    this.showModal = true;
  }

  editProduct(p: Product) {
    this.editingProduct = p;
    this.form = { name: p.name, description: p.description, category: p.category, imageUrl: p.imageUrl, price: p.price, stock: p.stock };
    this.saveSuccess = '';
    this.saveError = '';
    this.showModal = true;
  }

  saveProduct() {
    if (this.form.stock < 10) { this.saveError = 'Minimum stock is 10'; return; }
    this.saving = true;
    this.saveError = '';
    const obs = this.editingProduct
      ? this.sellerService.updateProduct(this.editingProduct.id, this.form)
      : this.sellerService.createProduct(this.form);

    obs.subscribe({
      next: () => {
        this.saveSuccess = this.editingProduct ? 'Product updated!' : 'Product added!';
        this.saving = false;
        this.loadProducts();
        setTimeout(() => this.showModal = false, 1200);
      },
      error: (err) => { this.saveError = err.error?.message || 'Failed to save'; this.saving = false; }
    });
  }

  isExpiringSoon(date: string): boolean {
    return new Date(date).getTime() - Date.now() < 3600000;
  }
}
