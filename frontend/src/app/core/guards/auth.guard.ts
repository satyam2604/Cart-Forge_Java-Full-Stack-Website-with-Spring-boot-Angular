import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

export const roleGuard = (...roles: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && roles.includes(auth.role!)) return true;
  const roleRoutes: any = { SELLER: '/seller', FINANCE: '/finance', ADMIN: '/admin' };
  router.navigate([roleRoutes[auth.role!] || '/login']);
  return false;
};
