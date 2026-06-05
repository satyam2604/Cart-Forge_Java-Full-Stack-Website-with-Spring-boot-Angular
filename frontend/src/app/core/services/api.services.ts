import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FinanceSummary, Notification, PriceLock, Product, Transaction } from '../models';

@Injectable({ providedIn: 'root' })
export class LockService {
  private api = `${environment.apiUrl}/locks`;
  constructor(private http: HttpClient) {}
  lockPrice(productId: number, quantity: number, lockHours: number) {
    return this.http.post<PriceLock>(this.api, { productId, quantity, lockHours });
  }
  getUserLocks() { return this.http.get<PriceLock[]>(this.api); }
  cancelLock(id: number) { return this.http.delete(`${this.api}/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = `${environment.apiUrl}/notifications`;
  constructor(private http: HttpClient) {}
  getAll() { return this.http.get<Notification[]>(this.api); }
  getUnreadCount() { return this.http.get<{ count: number }>(`${this.api}/unread-count`); }
  markAllRead() { return this.http.post(`${this.api}/mark-read`, {}); }
}

@Injectable({ providedIn: 'root' })
export class SellerService {
  private api = `${environment.apiUrl}/seller`;
  constructor(private http: HttpClient) {}
  getProducts() { return this.http.get<Product[]>(`${this.api}/products`); }
  createProduct(data: any) { return this.http.post<Product>(`${this.api}/products`, data); }
  updateProduct(id: number, data: any) { return this.http.put<Product>(`${this.api}/products/${id}`, data); }
  getLockedProducts() { return this.http.get<PriceLock[]>(`${this.api}/locked-products`); }
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private api = `${environment.apiUrl}/finance`;
  constructor(private http: HttpClient) {}
  getSummary() { return this.http.get<FinanceSummary>(`${this.api}/summary`); }
  getTransactions(type?: string) {
    const params = type ? `?type=${type}` : '';
    return this.http.get<Transaction[]>(`${this.api}/transactions${params}`);
  }
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = `${environment.apiUrl}/user`;
  constructor(private http: HttpClient) {}
  getProfile() { return this.http.get<any>(`${this.api}/profile`); }
  topUpWallet(amount: number, paymentMethod: string, transactionId: string) {
    return this.http.post<any>(`${this.api}/wallet/topup`, { amount: amount.toString(), paymentMethod, transactionId });
  }
}
