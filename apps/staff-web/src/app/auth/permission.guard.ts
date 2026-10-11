import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StaffSessionService } from './staff-session.service';
export const permissionGuard =
  (operation: string): CanActivateFn =>
  () => {
    const s = inject(StaffSessionService);
    return s.operations().has(operation) || inject(Router).createUrlTree(['/forbidden']);
  };
