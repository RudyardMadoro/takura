import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { StaffSessionService } from './staff-session.service';
export const sessionInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(StaffSessionService),
    handle = session.handle();
  const outbound =
    handle && request.url.includes('/api/v1/admin/')
      ? request.clone({ setHeaders: { 'X-Staff-Session': handle } })
      : request;
  return next(outbound).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && handle) session.expire();
      return throwError(() => error);
    }),
  );
};
