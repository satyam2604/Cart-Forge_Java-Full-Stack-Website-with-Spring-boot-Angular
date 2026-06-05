import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = `${environment.apiUrl}/admin`;
  constructor(private http: HttpClient) {}

  getStats() { return this.http.get<any>(`${this.api}/stats`); }

  getUsers() { return this.http.get<any[]>(`${this.api}/users`); }
  createUser(data: any) { return this.http.post<any>(`${this.api}/users`, data); }
  toggleUserStatus(id: number) { return this.http.put<any>(`${this.api}/users/${id}/toggle-status`, {}); }
  changeUserRole(id: number, role: string) { return this.http.put<any>(`${this.api}/users/${id}/role`, { role }); }
  deleteUser(id: number) { return this.http.delete(`${this.api}/users/${id}`); }

  getProducts() { return this.http.get<any[]>(`${this.api}/products`); }
  toggleProductStatus(id: number) { return this.http.put<any>(`${this.api}/products/${id}/toggle-status`, {}); }
  deleteProduct(id: number) { return this.http.delete(`${this.api}/products/${id}`); }

  getOrders() { return this.http.get<any[]>(`${this.api}/orders`); }
  getLocks() { return this.http.get<any[]>(`${this.api}/locks`); }
}
