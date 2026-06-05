import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  template: `
    <div class="landing">
      <!-- Nav -->
      <nav class="l-nav">
        <div class="l-nav-inner">
          <span class="brand"><i class="fas fa-shopping-cart"></i> Cart-Forge</span>
          <div class="nav-btns">
            <a routerLink="/login" class="btn-ghost">Sign In</a>
            <a routerLink="/register" class="btn-solid">Register</a>
          </div>
        </div>
      </nav>

      <!-- Hero -->
      <div class="hero">
        <div class="hero-text">
          <div class="badge"><i class="fas fa-bolt"></i> Smart Shopping Platform</div>
          <h1>Lock Prices.<br><span class="accent">Shop Smarter.</span></h1>
          <p>Secure product prices before they change. Real-time tracking, instant refunds, seamless checkout.</p>
          <div class="hero-btns">
            <a routerLink="/register" class="btn-primary-lg"><i class="fas fa-rocket"></i> Get Started</a>
            <a routerLink="/login" class="btn-outline-lg"><i class="fas fa-sign-in-alt"></i> Sign In</a>
          </div>
        </div>
      </div>

      <!-- USP Cards -->
      <div class="usps">
        <div class="usp-card">
          <i class="fas fa-lock" style="color:#d97706"></i>
          <div>
            <strong>Price Lock</strong>
            <p>Lock any price for up to 24h with a 10% fee — never overpay.</p>
          </div>
        </div>
        <div class="usp-card">
          <i class="fas fa-chart-line" style="color:#2563eb"></i>
          <div>
            <strong>Live Fluctuation</strong>
            <p>Prices update in real-time so you always know the market rate.</p>
          </div>
        </div>
        <div class="usp-card">
          <i class="fas fa-undo-alt" style="color:#059669"></i>
          <div>
            <strong>Instant Refunds</strong>
            <p>Cancel an order and get your wallet credited immediately.</p>
          </div>
        </div>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .landing { min-height: 100vh; display: flex; flex-direction: column; background: #f5f5f5; }

    /* Nav */
    .l-nav { background: #0f172a; padding: 0 24px; }
    .l-nav-inner { max-width: 1200px; margin: 0 auto; height: 56px; display: flex; align-items: center; justify-content: space-between; }
    .brand { font-size: 18px; font-weight: 800; color: white; display: flex; align-items: center; gap: 8px; }
    .brand i { color: #60a5fa; }
    .nav-btns { display: flex; gap: 10px; }
    .btn-ghost {
      color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.3);
      padding: 6px 18px; border-radius: 6px; font-size: 13px; font-weight: 500;
      text-decoration: none; transition: all 0.2s;
    }
    .btn-ghost:hover { border-color: white; color: white; }
    .btn-solid {
      background: #2563eb; color: white; padding: 6px 18px;
      border-radius: 6px; font-size: 13px; font-weight: 600;
      text-decoration: none; transition: all 0.2s;
    }
    .btn-solid:hover { background: #1d4ed8; }

    /* Hero */
    .hero {
      flex: 1; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%);
      display: flex; align-items: center; padding: 60px 24px;
    }
    .hero-text { max-width: 600px; margin: 0 auto; text-align: center; }
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
      color: #93c5fd; padding: 5px 14px; border-radius: 20px; font-size: 12px;
      margin-bottom: 20px;
    }
    .hero-text h1 { font-size: clamp(36px, 5vw, 60px); font-weight: 800; color: white; line-height: 1.15; margin-bottom: 16px; }
    .accent { background: linear-gradient(90deg, #60a5fa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero-text p { font-size: 16px; color: rgba(255,255,255,0.7); margin-bottom: 32px; line-height: 1.6; }
    .hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn-primary-lg {
      background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px;
      font-size: 15px; font-weight: 600; text-decoration: none;
      display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(37,99,235,0.4);
    }
    .btn-primary-lg:hover { background: #1d4ed8; transform: translateY(-1px); }
    .btn-outline-lg {
      border: 2px solid rgba(255,255,255,0.4); color: white; background: rgba(255,255,255,0.05);
      padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600;
      text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;
    }
    .btn-outline-lg:hover { border-color: white; background: rgba(255,255,255,0.12); }

    /* USP */
    .usps {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
      background: #e2e8f0;
    }
    .usp-card {
      background: white; padding: 20px 24px; display: flex; align-items: flex-start; gap: 14px;
    }
    .usp-card i { font-size: 22px; margin-top: 2px; flex-shrink: 0; }
    .usp-card strong { font-size: 14px; font-weight: 700; color: #1e293b; display: block; margin-bottom: 4px; }
    .usp-card p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5; }

    @media (max-width: 640px) {
      .usps { grid-template-columns: 1fr; }
      .hero-btns { flex-direction: column; align-items: center; }
    }
  `]
})
export class LandingComponent {}
