import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PUBLIC_API_ORIGIN } from './content-api.service';
import { isNonProduction, PUBLIC_SITE_MODE } from './site-mode';

interface PublicConfig {
  environment: string;
  contact: { email: string; phone: string };
}

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(PUBLIC_API_ORIGIN);
  readonly siteMode = inject(PUBLIC_SITE_MODE);
  readonly nonProduction = isNonProduction(this.siteMode);
  readonly email = signal('');
  readonly phone = signal('');
  @ViewChild('menu') menu?: ElementRef<HTMLDetailsElement>;

  ngOnInit() {
    this.http.get<PublicConfig>(`${this.apiOrigin}/api/v1/public/config`).subscribe({
      next: ({ contact }) => {
        this.email.set(this.isVerifiedEmail(contact.email) ? contact.email : '');
        this.phone.set(contact.phone.trim());
      },
      error: () => {
        // The shell remains useful when optional public configuration is unavailable.
      },
    });
  }

  closeMenu() {
    if (this.menu) this.menu.nativeElement.open = false;
  }

  handleMenuKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.menu?.nativeElement.open) {
      this.closeMenu();
      this.menu.nativeElement.querySelector('summary')?.focus();
    }
  }

  private isVerifiedEmail(value: string) {
    return !!value && !value.toLowerCase().endsWith('@example.invalid');
  }
}
