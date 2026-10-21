import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

interface CustomerQuote {
  quote_number: string;
  revision_number: number;
  state: string;
  amount: string;
  currency: string;
  tax_mode: string;
  scope_summary: string;
  expires_at: string;
}

@Component({
  standalone: true,
  imports: [DatePipe],
  selector: 'app-customer-quote',
  template: `<h1 tabindex="-1">Your quotation</h1>
    <p class="eyebrow">Private, revocable access · opening is not acceptance or payment</p>
    @if (loading()) {
      <p role="status">Checking this secure quotation link…</p>
    } @else if (error()) {
      <section role="alert" tabindex="-1">
        <h2>Quotation unavailable</h2>
        <p>{{ error() }}</p>
        <p>Contact the business using your existing verified contact route for assistance.</p>
      </section>
    } @else if (quote()) {
      <section aria-labelledby="quote-heading">
        <h2 id="quote-heading">
          {{ quote()!.quote_number }} · revision {{ quote()!.revision_number }}
        </h2>
        <p>
          <strong>{{ quote()!.currency }} {{ quote()!.amount }}</strong> · {{ quote()!.tax_mode }}
        </p>
        <p>{{ quote()!.scope_summary }}</p>
        <p>Expires {{ quote()!.expires_at | date: 'long' }}</p>
        <button type="button" (click)="download()">Download reviewed PDF</button>
        <p>
          This R1 view has no online Accept or Pay action. Commercial acceptance happens through the
          approved offline process.
        </p>
      </section>
    }`,
})
export class CustomerQuotePage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly quote = signal<CustomerQuote | null>(null);
  private session: string | null = null;

  ngOnInit() {
    this.title.setTitle('Private quotation');
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow, noarchive' });
    this.meta.updateTag({ name: 'referrer', content: 'no-referrer' });
    const token = location.hash.startsWith('#') ? location.hash.slice(1) : '';
    history.replaceState(null, '', location.pathname + location.search);
    if (!token) return this.fail();
    this.http.post<{ session: string }>('/api/v1/quote-access/exchange', { token }).subscribe({
      next: (result) => {
        this.session = result.session;
        this.load();
      },
      error: () => this.fail(),
    });
  }
  private load() {
    this.http.get<CustomerQuote>('/api/v1/customer/quote', { headers: this.headers() }).subscribe({
      next: (quote) => {
        this.quote.set(quote);
        this.loading.set(false);
      },
      error: () => this.fail(),
    });
  }
  download() {
    this.http
      .get('/api/v1/customer/quote/document', { headers: this.headers(), responseType: 'blob' })
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'quotation.pdf';
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 0);
        },
        error: () => this.fail(),
      });
  }
  private headers() {
    return new HttpHeaders({ 'X-Quote-Session': this.session ?? '' });
  }
  private fail() {
    this.loading.set(false);
    this.quote.set(null);
    this.session = null;
    this.error.set('This link is invalid, expired, superseded or revoked.');
  }
}
