import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItem } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadCart() {
    return this.http.get<CartItem[]>(this.api).pipe(tap(items => this.cartSubject.next(items)));
  }

  addToCart(productId: number, quantity: number) {
    return this.http.post<CartItem>(this.api, { productId, quantity })
      .pipe(tap(() => this.loadCart().subscribe()));
  }

  updateQty(id: number, quantity: number) {
    return this.http.put<CartItem>(`${this.api}/${id}`, { quantity })
      .pipe(tap(() => this.loadCart().subscribe()));
  }

  removeItem(id: number) {
    return this.http.delete(`${this.api}/${id}`)
      .pipe(tap(() => this.loadCart().subscribe()));
  }

  get cartCount(): number {
    return this.cartSubject.value.length;
  }

  get cartTotal(): number {
    return this.cartSubject.value.reduce((sum, i) => sum + i.appliedPrice * i.quantity, 0);
  }
}
