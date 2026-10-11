import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CatalogueApiService } from './catalogue-api.service';
interface Line {
  variant_id: string;
  requested_specification: string;
  quantity: number;
  collection_preference: string;
  substitutes_allowed: string;
}
@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-board-quote',
  template: `<article class="page">
    <p class="eyebrow">Board quotation request · not an order or reservation</p>
    <h1 tabindex="-1">Request full board sheets</h1>
    <p aria-live="polite">Step {{ step }} of 4 — {{ titles[step - 1] }}</p>
    @if (errors.length) {
      <div #summary class="error" role="alert" tabindex="-1">
        <h2>Check your request</h2>
        <ul>
          @for (e of errors; track e) {
            <li>{{ e }}</li>
          }
        </ul>
      </div>
    }
    @if (receipt) {
      <section role="status" tabindex="-1">
        <h2>Request received</h2>
        <p>
          Your committed reference is <strong>{{ receipt }}</strong
          >.
        </p>
        <p>The Boards Team will review it. This is not an order, stock reservation or payment.</p>
      </section>
    } @else {
      <form (ngSubmit)="next()">
        @if (step === 1) {
          <fieldset>
            <legend>Service selection</legend>
            <label><input type="checkbox" checked disabled /> Standalone board sales</label>
            <p>Cutting, construction and installation selections are not needed for full sheets.</p>
          </fieldset>
        }
        @if (step === 2) {
          <h2>Requirements</h2>
          @for (line of lines; track $index; let i = $index) {
            <fieldset>
              <legend>Board line {{ i + 1 }}</legend>
              <label
                >Published variant ID (optional)<input
                  [(ngModel)]="line.variant_id"
                  name="variant{{ i }}" /></label
              ><label
                >Or describe the board<input
                  [(ngModel)]="line.requested_specification"
                  name="spec{{ i }}"
                  maxlength="500" /></label
              ><label
                >Quantity in full sheets<input
                  type="number"
                  [(ngModel)]="line.quantity"
                  name="qty{{ i }}"
                  min="1"
                  max="9999"
              /></label>
              <p>Unit: SHEET · Fulfilment: FULL_SHEET</p>
              <label
                >Collection preference<select
                  [(ngModel)]="line.collection_preference"
                  name="collection{{ i }}"
                >
                  <option>COLLECTION</option>
                  <option>DELIVERY</option>
                  <option>UNDECIDED</option>
                </select></label
              ><label
                >Substitutes<select [(ngModel)]="line.substitutes_allowed" name="sub{{ i }}">
                  <option>DISCUSS</option>
                  <option>YES</option>
                  <option>NO</option>
                </select></label
              >
              @if (lines.length > 1) {
                <button type="button" (click)="remove(i)">Remove line</button>
              }
            </fieldset>
          }
          <button type="button" (click)="add()" [disabled]="lines.length >= 10">
            Add board line
          </button>
        }
        @if (step === 3) {
          <h2>Contact and location</h2>
          <label
            >Full name<input
              required
              [(ngModel)]="fullName"
              name="fullName"
              autocomplete="name"
              maxlength="120" /></label
          ><label
            >Preferred contact<select [(ngModel)]="preference" name="preference">
              <option>EMAIL</option>
              <option>CALL</option>
              <option>WHATSAPP</option>
            </select></label
          >
          @if (preference === 'EMAIL') {
            <label
              >Email<input type="email" [(ngModel)]="email" name="email" autocomplete="email"
            /></label>
          } @else {
            <label
              >Phone<input type="tel" [(ngModel)]="phone" name="phone" autocomplete="tel"
            /></label>
          }
          <label>Country code<input [(ngModel)]="country" name="country" maxlength="2" /></label
          ><label>Town or suburb<input [(ngModel)]="suburb" name="suburb" maxlength="120" /></label
          ><label
            >Describe your request<textarea
              [(ngModel)]="description"
              name="description"
              minlength="10"
              maxlength="5000"
            ></textarea>
          </label>
          <p>Attachments are not required for full-sheet sales.</p>
        }
        @if (step === 4) {
          <h2>Review and submit</h2>
          <p>
            {{ lines.length }} full-sheet line(s), preferred contact {{ preference }}, location
            {{ suburb }}, {{ country }}.
          </p>
          <p>{{ description }}</p>
          <label
            ><input type="checkbox" [(ngModel)]="privacy" name="privacy" /> I acknowledge the
            current demonstration privacy notice (demo-privacy-v1).</label
          ><label
            ><input type="checkbox" [(ngModel)]="marketing" name="marketing" /> Optional marketing
            updates</label
          >
        }
        <div class="wizard-actions">
          @if (step > 1) {
            <button type="button" (click)="step = step - 1">Back</button>
          }
          <button type="submit" [disabled]="submitting">
            {{ step === 4 ? (submitting ? 'Submitting…' : 'Submit request') : 'Continue' }}
          </button>
        </div>
      </form>
    }
  </article>`,
})
export class QuotePage {
  @ViewChild('summary') summary?: ElementRef<HTMLElement>;
  private readonly api = inject(CatalogueApiService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly titles = ['Service selection', 'Requirements', 'Contact and files', 'Review and submit'];
  step = 1;
  lines: Line[] = [
    {
      variant_id: inject(ActivatedRoute).snapshot.queryParamMap.get('variant') ?? '',
      requested_specification: '',
      quantity: 1,
      collection_preference: 'UNDECIDED',
      substitutes_allowed: 'DISCUSS',
    },
  ];
  fullName = '';
  preference = 'EMAIL';
  email = '';
  phone = '';
  country = 'ZA';
  suburb = '';
  description = '';
  privacy = false;
  marketing = false;
  submitting = false;
  errors: string[] = [];
  receipt = '';
  private key = crypto.randomUUID();
  add() {
    if (this.lines.length < 10)
      this.lines.push({
        variant_id: '',
        requested_specification: '',
        quantity: 1,
        collection_preference: 'UNDECIDED',
        substitutes_allowed: 'DISCUSS',
      });
  }
  remove(i: number) {
    this.lines.splice(i, 1);
  }
  next() {
    this.errors = [];
    if (this.step < 4) {
      this.step++;
      return;
    }
    this.submit();
  }
  private submit() {
    this.submitting = true;
    const body = {
      services: ['BOARD_SALES'],
      contact: {
        full_name: this.fullName,
        email: this.email || null,
        phone: this.phone || null,
        preferred_contact: this.preference,
      },
      location: { country_code: this.country, town_or_suburb: this.suburb },
      description: this.description,
      request_lines: this.lines.map((l) => ({
        variant_id: l.variant_id || null,
        requested_specification: l.requested_specification || null,
        quantity: l.quantity,
        unit: 'SHEET',
        fulfilment: 'FULL_SHEET',
        collection_preference: l.collection_preference,
        substitutes_allowed: l.substitutes_allowed,
      })),
      attachment_ids: [],
      privacy_acknowledged: this.privacy,
      privacy_notice_version: 'demo-privacy-v1',
      marketing_opt_in: this.marketing,
    };
    this.api.submit(body, this.key).subscribe({
      next: (r) => {
        this.receipt = r.reference;
        this.submitting = false;
        this.changeDetector.markForCheck();
      },
      error: (e: HttpErrorResponse) => {
        this.submitting = false;
        this.errors = e.error?.field_errors?.map(
          (x: { user_message: string }) => x.user_message,
        ) ?? [
          e.error?.message ??
            'The request could not be submitted. Your entries are preserved; retrying uses the same request key.',
        ];
        this.changeDetector.markForCheck();
        setTimeout(() => this.summary?.nativeElement.focus());
      },
    });
  }
}
