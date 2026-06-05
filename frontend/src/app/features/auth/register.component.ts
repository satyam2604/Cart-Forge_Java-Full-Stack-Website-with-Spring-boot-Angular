import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FooterComponent } from '../../shared/components/footer.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FooterComponent],
  template: `
    <div class="reg-page">
      <!-- Left brand panel -->
      <div class="reg-left">
        <div class="reg-left-inner">
          <div class="brand-logo"><i class="fas fa-shopping-cart"></i></div>
          <h2>Cart-Forge</h2>
          <p>The smart way to shop — lock prices, track live changes, and get instant refunds.</p>
          <div class="usp-list">
            <div class="usp-item"><i class="fas fa-lock"></i> Price Lock Technology</div>
            <div class="usp-item"><i class="fas fa-chart-line"></i> Real-Time Fluctuation</div>
            <div class="usp-item"><i class="fas fa-undo-alt"></i> Instant Refunds</div>
          </div>
          <div class="already-have">
            Already have an account? <a routerLink="/login">Sign In</a>
          </div>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="reg-right">
        <div class="reg-form-wrap">
          <h3>Create Account</h3>
          <p class="sub">Fill in the details below to get started</p>

          <div class="alert alert-success" *ngIf="successMsg"><i class="fas fa-check-circle"></i> {{successMsg}}</div>
          <div class="alert alert-danger" *ngIf="error">{{error}}</div>

          <form (ngSubmit)="register()" #regForm="ngForm" novalidate>

            <!-- Row 1: Full Name + Username -->
            <div class="row-2">
              <div class="form-group">
                <label>Full Name <span class="req">*</span></label>
                <input class="form-control" [(ngModel)]="form.fullName" name="fullName"
                  #fullNameRef="ngModel" required minlength="2"
                  pattern="^[a-zA-Z][a-zA-Z ]*$"
                  [class.is-invalid]="fullNameRef.touched && fullNameRef.invalid"
                  [class.is-valid]="fullNameRef.touched && fullNameRef.valid"
                  (input)="onFullNameInput($event)"
                  placeholder="Letters and spaces only">
                <div class="invalid-feedback" *ngIf="fullNameRef.touched && fullNameRef.errors?.['required']">Required</div>
                <div class="invalid-feedback" *ngIf="fullNameRef.touched && fullNameRef.errors?.['pattern']">Only letters and spaces allowed</div>
              </div>
              <div class="form-group">
                <label>Username <span class="req">*</span></label>
                <input class="form-control" [(ngModel)]="form.username" name="username"
                  #usernameRef="ngModel" required minlength="3" maxlength="20"
                  [pattern]="usernamePattern"
                  [class.is-invalid]="usernameRef.touched && usernameRef.invalid"
                  [class.is-valid]="usernameRef.touched && usernameRef.valid"
                  (input)="onUsernameInput($event)"
                  placeholder="Starts with letter or _">
                <div class="invalid-feedback" *ngIf="usernameRef.touched && usernameRef.errors?.['required']">Required</div>
                <div class="invalid-feedback" *ngIf="usernameRef.touched && usernameRef.errors?.['pattern']">Must start with a letter or underscore</div>
                <div class="invalid-feedback" *ngIf="usernameRef.touched && usernameRef.errors?.['minlength']">Min 3 characters</div>
              </div>
            </div>

            <!-- Row 2: Email + Role -->
            <div class="row-2">
              <div class="form-group">
                <label>Email <span class="req">*</span></label>
                <input class="form-control" type="email" [(ngModel)]="form.email" name="email"
                  #emailRef="ngModel" required pattern="^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$"
                  [class.is-invalid]="emailRef.touched && emailRef.invalid"
                  [class.is-valid]="emailRef.touched && emailRef.valid"
                  placeholder="example@email.com">
                <div class="invalid-feedback" *ngIf="emailRef.touched && emailRef.errors?.['required']">Required</div>
                <div class="invalid-feedback" *ngIf="emailRef.touched && emailRef.errors?.['pattern']">Enter a valid email</div>
              </div>
              <div class="form-group">
                <label>Role <span class="req">*</span></label>
                <select class="form-control" [(ngModel)]="form.role" name="role">
                  <option value="CUSTOMER">Customer</option>
                  <option value="SELLER">Seller</option>
                </select>
              </div>
            </div>

            <!-- Phone -->
            <div class="form-group">
              <label>Phone <span class="req">*</span></label>
              <input class="form-control" [(ngModel)]="form.phone" name="phone"
                #phoneRef="ngModel" required pattern="^[6-9][0-9]{9}$"
                [class.is-invalid]="phoneRef.touched && phoneRef.invalid"
                [class.is-valid]="phoneRef.touched && phoneRef.valid"
                (keypress)="onPhoneKeypress($event)" (input)="onPhoneInput($event)"
                placeholder="10-digit mobile (starts 6-9)" maxlength="10">
              <div class="invalid-feedback" *ngIf="phoneRef.touched && phoneRef.errors?.['required']">Required</div>
              <div class="invalid-feedback" *ngIf="phoneRef.touched && phoneRef.errors?.['pattern']">Valid 10-digit number starting with 6–9</div>
            </div>

            <!-- Row 3: Password + Confirm -->
            <div class="row-2">
              <div class="form-group">
                <label>Password <span class="req">*</span></label>
                <div class="input-group">
                  <input class="form-control" [type]="showPassword ? 'text' : 'password'"
                    [(ngModel)]="form.password" name="password"
                    #passwordRef="ngModel" required minlength="8"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
                    [class.is-invalid]="passwordRef.touched && passwordRef.invalid"
                    [class.is-valid]="passwordRef.touched && passwordRef.valid"
                    placeholder="Min 8, A-Z, 0-9, special">
                  <button type="button" class="toggle-pass" (click)="showPassword = !showPassword">
                    <i class="fas" [class.fa-eye]="!showPassword" [class.fa-eye-slash]="showPassword"></i>
                  </button>
                </div>
                <div class="invalid-feedback" *ngIf="passwordRef.touched && passwordRef.errors?.['required']">Required</div>
                <div class="invalid-feedback" *ngIf="passwordRef.touched && passwordRef.errors?.['pattern']">Needs uppercase, lowercase, number & special char</div>
                <div class="password-strength" *ngIf="form.password">
                  <div class="strength-bar"><div class="strength-fill" [style.width]="passwordStrength + '%'" [class]="strengthClass"></div></div>
                  <small [class]="strengthClass">{{strengthLabel}}</small>
                </div>
              </div>
              <div class="form-group">
                <label>Confirm Password <span class="req">*</span></label>
                <input class="form-control" [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="form.confirmPassword" name="confirmPassword"
                  #confirmRef="ngModel" required
                  [class.is-invalid]="confirmRef.touched && form.password !== form.confirmPassword"
                  [class.is-valid]="confirmRef.touched && !!form.confirmPassword && form.password === form.confirmPassword"
                  placeholder="Re-enter password">
                <div class="invalid-feedback" *ngIf="confirmRef.touched && form.password !== form.confirmPassword">Passwords do not match</div>
                <div class="valid-feedback" *ngIf="confirmRef.touched && !!form.confirmPassword && form.password === form.confirmPassword">Passwords match!</div>
              </div>
            </div>

            <button class="btn btn-primary btn-block btn-lg" type="submit"
              [disabled]="loading || regForm.invalid || form.password !== form.confirmPassword">
              <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
              {{loading ? 'Creating...' : 'Create Account'}}
            </button>
          </form>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .reg-page { display: flex; min-height: 100vh; }
    .reg-left { width: 360px; flex-shrink: 0; background: linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%); display: flex; align-items: center; justify-content: center; padding: 40px 32px; }
    .reg-left-inner { color: white; }
    .brand-logo { font-size: 40px; color: #60a5fa; margin-bottom: 12px; }
    .reg-left-inner h2 { font-size: 26px; font-weight: 800; margin-bottom: 10px; }
    .reg-left-inner > p { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 28px; }
    .usp-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .usp-item { display: flex; align-items: center; gap: 10px; font-size: 14px; color: rgba(255,255,255,0.85); }
    .usp-item i { color: #60a5fa; width: 16px; }
    .already-have { font-size: 13px; color: rgba(255,255,255,0.6); }
    .already-have a { color: #93c5fd; font-weight: 600; text-decoration: none; margin-left: 4px; }
    .reg-right { flex: 1; background: #f8fafc; display: flex; align-items: flex-start; justify-content: center; padding: 40px 24px 60px; overflow-y: auto; }
    .reg-form-wrap { width: 100%; max-width: 560px; }
    .reg-form-wrap h3 { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .sub { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .req { color: #ef4444; }
    .input-group { position: relative; }
    .input-group .form-control { padding-right: 40px; }
    .toggle-pass { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6b7280; }
    .password-strength { margin-top: 6px; }
    .strength-bar { height: 4px; background: #e2e8f0; border-radius: 2px; margin-bottom: 3px; }
    .strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
    .strength-fill.weak { background: #ef4444; } .strength-fill.fair { background: #f59e0b; }
    .strength-fill.good { background: #3b82f6; } .strength-fill.strong { background: #10b981; }
    small.weak { color: #ef4444; font-size: 11px; } small.fair { color: #f59e0b; font-size: 11px; }
    small.good { color: #3b82f6; font-size: 11px; } small.strong { color: #10b981; font-size: 11px; }
    @media (max-width: 768px) { .reg-page { flex-direction: column; } .reg-left { width: 100%; padding: 32px 24px; } .row-2 { grid-template-columns: 1fr; } }
  `]
})
export class RegisterComponent {
  usernamePattern = '^[a-zA-Z_][a-zA-Z0-9_]{2,19}$';
  form = { fullName: '', username: '', email: '', phone: '', password: '', confirmPassword: '', role: 'CUSTOMER' };
  loading = false; error = ''; successMsg = ''; showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  onFullNameInput(e: Event) {
    const i = e.target as HTMLInputElement;
    // Allow only letters and spaces, must start with a letter
    i.value = i.value.replace(/[^a-zA-Z ]/g, '').replace(/^ +/, '');
    this.form.fullName = i.value;
  }

  onUsernameInput(e: Event) {
    const i = e.target as HTMLInputElement;
    // Remove leading digits — must start with letter or underscore
    i.value = i.value.replace(/^[^a-zA-Z_]+/, '');
    this.form.username = i.value;
  }
  onPhoneKeypress(e: KeyboardEvent) { if (!/[0-9]/.test(e.key)) e.preventDefault(); }
  onPhoneInput(e: Event) {
    const i = e.target as HTMLInputElement;
    i.value = i.value.replace(/\D/g, '').substring(0, 10);
    this.form.phone = i.value;
  }

  get passwordStrength(): number {
    const p = this.form.password; if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s += 25; if (/[A-Z]/.test(p)) s += 25;
    if (/[0-9]/.test(p)) s += 25; if (/[@$!%*?&]/.test(p)) s += 25;
    return s;
  }
  get strengthClass(): string { const s = this.passwordStrength; if (s <= 25) return 'weak'; if (s <= 50) return 'fair'; if (s <= 75) return 'good'; return 'strong'; }
  get strengthLabel(): string { return ({ weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' } as any)[this.strengthClass]; }

  register() {
    if (this.form.password !== this.form.confirmPassword) { this.error = 'Passwords do not match'; return; }
    this.loading = true; this.error = '';
    this.authService.registerOnly(this.form).subscribe({
      next: () => { this.successMsg = 'Account created! Redirecting to login...'; this.loading = false; setTimeout(() => this.router.navigate(['/login'], { queryParams: { registered: this.form.username } }), 1500); },
      error: (err) => { this.error = err.error?.message || 'Registration failed'; this.loading = false; }
    });
  }
}
