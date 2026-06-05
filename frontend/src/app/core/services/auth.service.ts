import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(tap(res => this.setUser(res)));
  }

  register(data: any) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(tap(res => this.setUser(res)));
  }

  registerOnly(data: any) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data);
  }

  logout() {
    localStorage.removeItem('auth');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.currentUser?.token ?? null;
  }

  get role(): string | null {
    return this.currentUser?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  private setUser(user: AuthResponse) {
    localStorage.setItem('auth', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getStoredUser(): AuthResponse | null {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : null;
  }
}
