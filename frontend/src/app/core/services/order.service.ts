import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CheckoutValidation, Order, PaymentResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = `${environment.apiUrl}/orders`;
  constructor(private http: HttpClient) {}

  validateCart() { return this.http.get<CheckoutValidation>(`${this.api}/validate`); }

  checkout(paymentMethod: string, transactionId: string) {
    return this.http.post<PaymentResponse>(`${this.api}/checkout`, { paymentMethod, transactionId });
  }

  getHistory() { return this.http.get<Order[]>(`${this.api}/history`); }
}
