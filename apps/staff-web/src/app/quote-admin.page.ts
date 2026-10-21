import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-quote-admin',
  template: `<h1 tabindex="-1">Quote revisions</h1>
    <p>
      Upload an externally prepared PDF. The system scans and pins it privately; it does not
      calculate prices or generate PDFs.
    </p>
    @if (error()) {
      <p role="alert" tabindex="-1">{{ error() }}</p>
    }
    <form (ngSubmit)="create()" aria-label="Create quote revision">
      <label
        >Prepared PDF
        <input
          type="file"
          accept="application/pdf,.pdf"
          (change)="upload($event)"
          [disabled]="uploading"
      /></label>
      <p aria-live="polite">{{ uploadStatus }}</p>
      <label
        >Clean PDF attachment ID <input required name="pdf" [(ngModel)]="draft.pdf_attachment_id"
      /></label>
      <label
        >Exact amount
        <input
          required
          name="amount"
          inputmode="decimal"
          pattern="[0-9]+(\\.[0-9]{1,2})?"
          [(ngModel)]="draft.amount"
      /></label>
      <label
        >Currency <input required name="currency" maxlength="3" [(ngModel)]="draft.currency"
      /></label>
      <label
        >Tax mode
        <select name="tax" [(ngModel)]="draft.tax_mode">
          <option>NOT_APPLICABLE</option>
          <option>INCLUSIVE</option>
          <option>EXCLUSIVE</option>
          <option>UNCONFIRMED</option>
        </select></label
      >
      <label
        >Scope summary
        <textarea
          required
          name="scope"
          maxlength="5000"
          [(ngModel)]="draft.scope_summary"
        ></textarea>
      </label>
      <label
        >Material and service basis <textarea required name="basis" [(ngModel)]="basis"></textarea>
      </label>
      <label
        >Commercial terms reviewed <textarea required name="terms" [(ngModel)]="terms"></textarea>
      </label>
      <label
        ><input type="checkbox" name="amount-match" [(ngModel)]="amountMatches" /> PDF and recorded
        amount agree</label
      >
      <label
        ><input type="checkbox" name="terms-reviewed" [(ngModel)]="termsReviewed" /> Scope,
        exclusions, responsibilities and terms reviewed</label
      >
      <button type="submit">Create draft revision</button>
    </form>
    <h2>Revision history</h2>
    @for (quote of quotes(); track quote.id) {
      <article>
        <h3>{{ quote.quote_number }} · R{{ quote.revision_number }} · {{ quote.state }}</h3>
        <p>{{ quote.currency }} {{ quote.amount }} · expires {{ quote.expires_at }}</p>
        <div class="actions">
          <button (click)="action(quote, 'submit-approval')">Submit for approval</button>
          <button (click)="action(quote, 'approve')">Approve exact revision</button>
          <button (click)="issue(quote)">Issue controlled link</button>
        </div>
        @if (issuedUrl()[quote.id]) {
          <p role="status">
            One-time delivery link created. Handle it as a secret; it is not stored in browser
            storage.
          </p>
        }
      </article>
    }`,
  styles: [
    `
      :host {
        display: block;
        max-width: 60rem;
        margin: auto;
        padding: 1rem;
      }
      form,
      label {
        display: grid;
        gap: 0.35rem;
      }
      form {
        gap: 1rem;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      input,
      select,
      textarea,
      button {
        font: inherit;
        min-height: 2.75rem;
      }
      article {
        border-top: 1px solid;
        padding: 1rem 0;
      }
    `,
  ],
})
export class QuoteAdminPage {
  private readonly http = inject(HttpClient);
  private readonly enquiry = inject(ActivatedRoute).snapshot.paramMap.get('enquiry') ?? '';
  readonly quotes = signal<any[]>([]);
  readonly error = signal('');
  readonly issuedUrl = signal<Record<string, string>>({});
  basis = '';
  terms = '';
  amountMatches = false;
  termsReviewed = false;
  uploading = false;
  uploadStatus = 'No quote PDF selected.';
  draft: any = {
    pdf_attachment_id: '',
    amount: '2500.00',
    currency: 'ZAR',
    tax_mode: 'NOT_APPLICABLE',
    scope_summary: '',
  };
  constructor() {
    this.load();
  }
  async upload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    this.error.set('');
    this.uploadStatus = 'Preparing private upload…';
    try {
      const checksum = Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer())),
      )
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const session: any = await firstValueFrom(
        this.http.post('/api/v1/admin/quote-upload-sessions', {
          files: [
            {
              file_name: file.name,
              byte_size: file.size,
              content_type: file.type || 'application/pdf',
              checksum_sha256: checksum,
            },
          ],
        }),
      );
      const allocation = session.files[0],
        form = new FormData();
      for (const [key, value] of Object.entries(allocation.upload.fields))
        form.append(key, String(value));
      form.append('file', file);
      const stored = await fetch(allocation.upload.url, { method: 'POST', body: form });
      if (!stored.ok) throw new Error('Storage rejected the PDF.');
      const completed: any = await firstValueFrom(
        this.http.post(
          `/api/v1/upload-sessions/${session.session_id}/files/${allocation.attachment_id}/complete`,
          {},
          { headers: new HttpHeaders({ 'X-Upload-Capability': session.capability }) },
        ),
      );
      if (completed.state === 'REJECTED') throw new Error('The PDF failed safety validation.');
      this.draft.pdf_attachment_id = allocation.attachment_id;
      this.uploadStatus = `PDF ${completed.state.toLowerCase()}; create the draft only after scanning reaches CLEAN.`;
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Quote PDF upload failed.');
      this.uploadStatus = 'No usable quote PDF selected.';
    } finally {
      this.uploading = false;
    }
  }
  load() {
    this.http.get<any[]>(`/api/v1/admin/enquiries/${this.enquiry}/quote-revisions`).subscribe({
      next: (v) => this.quotes.set(v),
      error: () => this.error.set('Quote history is unavailable or outside your scope.'),
    });
  }
  create() {
    const body = {
      ...this.draft,
      group_id: this.quotes()[0]?.group_id ?? null,
      material_snapshot: { basis: this.basis, production_authorised: false },
      commercial_terms: { reviewed_terms: this.terms },
      review_checklist: {
        pdf_amount_matches: this.amountMatches,
        terms_reviewed: this.termsReviewed,
      },
    };
    this.http.post(`/api/v1/admin/enquiries/${this.enquiry}/quote-revisions`, body).subscribe({
      next: () => this.load(),
      error: () =>
        this.error.set('Draft rejected. Use a CLEAN PDF and complete every structured field.'),
    });
  }
  action(q: any, action: string) {
    this.http
      .post(
        `/api/v1/admin/quote-revisions/${q.id}/${action}`,
        {},
        { headers: new HttpHeaders({ 'If-Match': `"${q.revision}"` }) },
      )
      .subscribe({
        next: () => this.load(),
        error: () =>
          this.error.set(
            'Action rejected because the revision, permission or evidence guard was not satisfied.',
          ),
      });
  }
  issue(q: any) {
    this.http
      .post<any>(
        `/api/v1/admin/quote-revisions/${q.id}/send`,
        {},
        {
          headers: new HttpHeaders({
            'If-Match': `"${q.revision}"`,
            'Idempotency-Key': crypto.randomUUID(),
          }),
        },
      )
      .subscribe({
        next: (r) => {
          this.issuedUrl.update((v) => ({ ...v, [q.id]: r.customer_url }));
          this.load();
        },
        error: () =>
          this.error.set(
            'Issue rejected. Approval, contact route, expiry and exact PDF evidence are required.',
          ),
      });
  }
}
