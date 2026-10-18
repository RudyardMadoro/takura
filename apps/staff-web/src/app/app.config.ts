import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  AbstractSecurityStorage,
  authInterceptor,
  DefaultSessionStorageService,
  LogLevel,
  provideAuth,
  withAppInitializerAuthCheck,
} from 'angular-auth-oidc-client';
import { routes } from './app.routes';
import { sessionInterceptor } from './auth/session.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor(), sessionInterceptor])),
    provideAuth(
      {
        config: {
          authority: 'http://127.0.0.1:8080/dev-oidc',
          redirectUrl: window.location.origin + '/auth/callback',
          postLogoutRedirectUri: window.location.origin + '/signed-out',
          clientId: 'takura-staff-local',
          scope: 'openid profile takura.staff',
          responseType: 'code',
          silentRenew: false,
          useRefreshToken: false,
          secureRoutes: ['/api/v1/admin'],
          logLevel: LogLevel.Error,
        },
      },
      withAppInitializerAuthCheck(),
    ),
    { provide: AbstractSecurityStorage, useClass: DefaultSessionStorageService },
  ],
};
