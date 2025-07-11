// 🔐 auth.guard.ts (No change if using claimReq as data)
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const claimReq = route.data['claimReq'] as Function;
    if (claimReq) {
      const claims = authService.getClaims();
      // auth.guard.ts
      if (!claimReq(claims)) {
        router.navigate(['/forbidden'], { queryParams: { type: '403' } });
        return false;
      }
      return true;
    }
    return true;
  } else {
    router.navigateByUrl('/signin');
    return false;
  }
};
