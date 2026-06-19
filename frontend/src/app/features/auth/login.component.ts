import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FooterComponent } from '../../shared/components/footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FooterComponent],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <i class="fas fa-shopping-cart brand-icon"></i>
          <h1>Cart-Forge</h1>
          <p>Sign in to your account</p>
        </div>
        <div class="alert alert-success" *ngIf="registeredMsg">
          <i class="fas fa-check-circle"></i> {{registeredMsg}}
        </div>
        <div class="alert alert-danger" *ngIf="error">{{error}}</div>
        <form (ngSubmit)="login()" #loginForm="ngForm" novalidate autocomplete="off">
          <div class="form-group">
            <label>Username</label>
            <input class="form-control" [(ngModel)]="username" name="username"
              #usernameRef="ngModel" required minlength="3"
              [class.is-invalid]="usernameRef.touched && usernameRef.invalid"
              [class.is-valid]="usernameRef.touched && usernameRef.valid"
              placeholder="Enter username" autocomplete="off">
            <div class="invalid-feedback" *ngIf="usernameRef.touched && usernameRef.errors?.['required']">Username is required</div>
            <div class="invalid-feedback" *ngIf="usernameRef.touched && usernameRef.errors?.['minlength']">Username must be at least 3 characters</div>
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="input-group">
              <input class="form-control" [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password" name="password"
                #passwordRef="ngModel" required minlength="6"
                [class.is-invalid]="passwordRef.touched && passwordRef.invalid"
                [class.is-valid]="passwordRef.touched && passwordRef.valid"
                placeholder="Enter password" autocomplete="off">
              <button type="button" class="toggle-pass" (click)="showPassword = !showPassword">
                <i class="fas" [class.fa-eye]="!showPassword" [class.fa-eye-slash]="showPassword"></i>
              </button>
            </div>
            <div class="invalid-feedback" *ngIf="passwordRef.touched && passwordRef.errors?.['required']">Password is required</div>
            <div class="invalid-feedback" *ngIf="passwordRef.touched && passwordRef.errors?.['minlength']">Password must be at least 6 characters</div>
          </div>
          <button class="btn btn-primary btn-block btn-lg" type="submit"
            [disabled]="loading || loginForm.invalid">
            <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
            {{loading ? 'Signing in...' : 'Sign In'}}
          </button>
        </form>
        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Register</a></p>
        </div>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; flex-direction: column; align-items: center;
      justify-content: center; background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      padding: 20px;
    }
    .auth-card { width: 100%; max-width: 400px; }
    .auth-header { text-align: center; margin-bottom: 24px; }
    .brand-icon { font-size: 40px; color: #2563eb; margin-bottom: 8px; }
    .auth-header h1 { font-size: 28px; font-weight: 700; color: #1e293b; }
    .auth-header p { color: #6b7280; margin-top: 4px; }
    .auth-footer { text-align: center; margin-top: 16px; font-size: 14px; }
    .auth-footer a { color: #2563eb; text-decoration: none; font-weight: 500; }
    .input-group { position: relative; }
    .input-group .form-control { padding-right: 40px; }
    .toggle-pass {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: #6b7280; z-index: 1;
    }
    .form-control.is-invalid { border-color: #ef4444; }
    .form-control.is-valid { border-color: #10b981; }
    .invalid-feedback { color: #ef4444; font-size: 12px; margin-top: 4px; display: block; }
  `]
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  loading = false;
  error = '';
  registeredMsg = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['registered']) {
        this.username = params['registered'];
        this.registeredMsg = 'Account created! Please sign in with your credentials.';
      }
    });
  }

  login() {
    this.loading = true;
    this.error = '';
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        const routes: any = { CUSTOMER: '/products', SELLER: '/seller', FINANCE: '/finance', ADMIN: '/admin' };
        this.router.navigate([routes[res.role] || '/login']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid credentials';
        this.loading = false;
      }
    });
  }

}
