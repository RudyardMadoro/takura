import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StaffSessionService } from './auth/staff-session.service';
@Component({
  standalone: true,
  selector: 'app-sign-in',
  template: `<h1 tabindex="-1">Staff sign in</h1>
    <p>Use the approved identity provider. MFA is required.</p>
    <button type="button" (click)="session.signIn()">Sign in</button
    ><button type="button" (click)="session.establish()">Continue after provider sign in</button>
    @if (session.error()) {
      <p role="alert">{{ session.error() }}</p>
    }
    <p><a href="mailto:identity-recovery@example.invalid">Provider account recovery</a></p>`,
})
export class SignInPage {
  readonly session = inject(StaffSessionService);
}
@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-dashboard',
  template: `<h1 tabindex="-1">Staff workspace</h1>
    <nav aria-label="Staff">
      <a routerLink="/access">Access management</a> <a routerLink="/settings">Settings</a>
      <a routerLink="/content">Editorial content</a>
    </nav>
    <button (click)="session.logout()">Sign out</button>`,
})
export class DashboardPage {
  readonly session = inject(StaffSessionService);
}
@Component({
  standalone: true,
  selector: 'app-settings',
  template: `<h1 tabindex="-1">Settings</h1>
    <p>Typed, revisioned configuration requires the current ETag.</p>`,
})
export class SettingsPage {}
@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-forbidden',
  template: `<h1 tabindex="-1">Access denied</h1>
    <p>The required operation is not granted.</p>
    <a routerLink="/workspace">Return to workspace</a>`,
})
export class AccessDeniedPage {}
@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-not-found',
  template: `<h1 tabindex="-1">Page not found</h1>
    <a routerLink="/workspace">Return to workspace</a>`,
})
export class NotFoundPage {}
