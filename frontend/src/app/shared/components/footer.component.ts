import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="slim-footer">
      <span class="copy">© 2026 Cart-Forge. All rights reserved.</span>
      <div class="contact-wrap">
        <button class="contact-btn" (click)="open = !open">
          Contact Us <i class="fas fa-chevron-up" [class.rotated]="!open"></i>
        </button>
        <div class="contact-drop" *ngIf="open">
          <p><i class="fas fa-envelope"></i> support&#64;cartforge.in</p>
          <p><i class="fas fa-phone"></i> +91 98765 43210</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .slim-footer {
      background: #1e293b; color: #94a3b8;
      padding: 10px 24px; display: flex; align-items: center;
      justify-content: space-between; font-size: 12px; position: relative;
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    }
    .copy { color: #64748b; }
    .contact-wrap { position: relative; }
    .contact-btn {
      background: none; border: none; color: #94a3b8; font-size: 12px;
      cursor: pointer; display: flex; align-items: center; gap: 5px; padding: 0;
    }
    .contact-btn:hover { color: white; }
    .contact-btn i { transition: transform 0.2s; }
    .contact-btn i.rotated { transform: rotate(180deg); }
    .contact-drop {
      position: absolute; bottom: 32px; right: 0;
      background: #0f172a; border: 1px solid #334155;
      border-radius: 8px; padding: 12px 16px; min-width: 220px;
      box-shadow: 0 -4px 16px rgba(0,0,0,0.3);
    }
    .contact-drop p {
      color: #cbd5e1; font-size: 13px; margin-bottom: 6px;
      display: flex; align-items: center; gap: 8px;
    }
    .contact-drop p:last-child { margin-bottom: 0; }
    .contact-drop i { color: #2563eb; width: 14px; }
  `]
})
export class FooterComponent {
  open = false;
}
