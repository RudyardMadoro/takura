import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StaffSessionService } from './staff-session.service';
export const permissionGuard =
  (operation: string): CanActivateFn =>
  () => {
    const s = inject(StaffSessionService);
    return s.operations().has(operation) || inject(Router).createUrlTree(['/forbidden']);
  };
export const anyPermissionGuard =
  (...operations: string[]): CanActivateFn =>
  () => {
    const s = inject(StaffSessionService);
    return (
      operations.some((operation) => s.operations().has(operation)) ||
      inject(Router).createUrlTree(['/forbidden'])
    );
  };
