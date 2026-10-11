import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class StaffSessionService {
  readonly handle = signal<string | null>(null);
  readonly operations = signal<ReadonlySet<string>>(new Set());
  readonly error = signal<string | null>(null);
  constructor(
    private http: HttpClient,
    private oidc: OidcSecurityService,
    private router: Router,
  ) {}
  signIn() {
    this.oidc.authorize();
  }
  async establish() {
    try {
      const created = await firstValueFrom(
        this.http.post<{ session_handle: string }>('/api/v1/admin/session', {}),
      );
      this.handle.set(created.session_handle);
      const current = await firstValueFrom(
        this.http.get<{ operations: string[] }>('/api/v1/admin/session'),
      );
      this.operations.set(new Set(current.operations));
      await this.router.navigateByUrl('/workspace');
    } catch {
      this.error.set(
        'Sign-in succeeded, but this identity has no approved staff access or the session evidence is invalid.',
      );
    }
  }
  async logout() {
    if (this.handle())
      await firstValueFrom(this.http.delete('/api/v1/admin/session')).catch(() => undefined);
    this.handle.set(null);
    this.operations.set(new Set());
    this.oidc.logoff().subscribe();
  }
  expire() {
    this.handle.set(null);
    this.operations.set(new Set());
    void this.router.navigateByUrl('/?expired=true');
  }
}
