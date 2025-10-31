import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * auth guard to protect routes
 * redirects to login if user is not authenticated
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['/login']); // back to login page
};