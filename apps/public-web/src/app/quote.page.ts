import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CatalogueApiService } from './catalogue-api.service';
import { firstValueFrom } from 'rxjs';
import { ENQUIRY_SERVICES, serviceLabel, supportedService } from './enquiry-services';

interface Line {
  variant_id: string;
  requested_specification: string;
  quantity: number;
  fulfilment: string;
  collection_preference: string;
  substitutes_allowed: string;
}
@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-board-quote',
  template: `<article class="page quote-page">
    <header class="quote-heading">
      <div>
        <p class="eyebrow">Project brief</p>
        <h1 tabindex="-1">Request a quotation</h1>
      </div>
      <p>
        One guided request for full sheets, cutting assistance or a mixed property brief. Submission
        creates an enquiry—not an order, reservation, payment or fabrication instruction.
      </p>
    </header>
    <nav class="quote-progress" aria-label="Quotation request progress">
      <ol>
        @for (title of titles; track title; let index = $index) {
          <li
            [class.current]="step === index + 1"
            [class.complete]="step > index + 1"
            [attr.aria-current]="step === index + 1 ? 'step' : null"
          >
            <span>{{ index + 1 }}</span
            ><strong>{{ title }}</strong>
          </li>
        }
      </ol>
    </nav>
    <p class="visually-hidden" aria-live="polite">Step {{ step }} of 4 — {{ titles[step - 1] }}</p>
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
        <p>
          One coordinating team will review the complete request. This is not an order, booking or
          payment.
        </p>
      </section>
    } @else {
      <form class="quote-form" (ngSubmit)="next()">
        @if (step === 1) {
          <fieldset>
            <legend>Select one to ten services</legend>
            @for (option of serviceOptions; track option[0]) {
              <label class="choice"
                ><input
                  type="checkbox"
                  [checked]="selected.includes(option[0])"
                  (change)="toggle(option[0], $any($event.target).checked, $any($event.target))"
                />
                {{ option[1] }}</label
              >
            }
          </fieldset>
        }
        @if (step === 2) {
          <h2>Requirements</h2>
          @if (selected.includes('PROPERTY_TRANSFORMATION')) {
            <fieldset>
              <legend>Property transformation</legend>
              <label
                >Representative status<select
                  [(ngModel)]="details.propertyRepresentative"
                  name="propertyRepresentative"
                >
                  <option>OWNER</option>
                  <option>AUTHORISED_REPRESENTATIVE</option>
                  <option>NOT_AUTHORISED</option>
                </select></label
              ><label
                >Site scope<select [(ngModel)]="details.propertyScope" name="propertyScope">
                  <option>EXISTING_HOUSE</option>
                  <option>ADDITIONAL_LAND</option>
                  <option>BOTH</option>
                </select></label
              ><label
                >Intended use<select [(ngModel)]="details.propertyUse" name="propertyUse">
                  <option>RENTAL</option>
                  <option>SHORT_STAY</option>
                  <option>PERSONAL</option>
                  <option>UNDECIDED</option>
                </select></label
              ><label
                >Optional land area m²<input
                  type="number"
                  min="1"
                  max="1000000"
                  [(ngModel)]="details.landArea"
                  name="landArea"
              /></label>
              <p>No unit count, approval or return is calculated or guaranteed.</p>
            </fieldset>
          }
          @for (service of selected; track service) {
            @if (service === 'CONSTRUCTION' || service === 'EXTENSION') {
              <fieldset>
                <legend>{{ label(service) }}</legend>
                <label
                  >Work type<input
                    [(ngModel)]="details[service + 'WorkType']"
                    [name]="service + 'WorkType'"
                /></label>
              </fieldset>
            }
            @if (service === 'RENOVATION' || service === 'MAINTENANCE') {
              <fieldset>
                <legend>{{ label(service) }}</legend>
                <label
                  >Affected area<input
                    [(ngModel)]="details[service + 'Area']"
                    [name]="service + 'Area'" /></label
                ><label
                  >Urgency<select
                    [(ngModel)]="details[service + 'Urgency']"
                    [name]="service + 'Urgency'"
                  >
                    <option>ROUTINE</option>
                    <option>SOON</option>
                    <option>URGENT</option>
                  </select></label
                >
                <p>Urgent does not promise emergency dispatch.</p>
              </fieldset>
            }
          }
          @if (selected.includes('INTERIORS')) {
            <fieldset>
              <legend>Interiors</legend>
              <label>Rooms, comma separated<input [(ngModel)]="details.rooms" name="rooms" /></label
              ><label
                >Design objective<input
                  [(ngModel)]="details.designObjective"
                  name="designObjective"
              /></label>
            </fieldset>
          }
          @if (selected.includes('CABINETRY')) {
            <fieldset>
              <legend>Cabinetry</legend>
              <label
                >Product category<select
                  [(ngModel)]="details.cabinetryProduct"
                  name="cabinetryProduct"
                >
                  <option>KITCHEN</option>
                  <option>CABINET</option>
                  <option>WARDROBE</option>
                  <option>VANITY</option>
                  <option>TV_UNIT</option>
                  <option>COMPONENT</option>
                  <option>OTHER</option>
                </select></label
              >
              @if (details.cabinetryProduct === 'OTHER') {
                <label
                  >Explain other product<input
                    [(ngModel)]="details.cabinetryOther"
                    name="cabinetryOther"
                /></label>
              }
              <label
                >Fulfilment<select
                  [(ngModel)]="details.cabinetryFulfilment"
                  name="cabinetryFulfilment"
                >
                  <option>SUPPLY_ONLY</option>
                  <option>FIX_AND_SUPPLY</option>
                  <option>UNDECIDED</option>
                </select></label
              ><label
                ><input type="checkbox" [(ngModel)]="details.measuringHelp" name="measuringHelp" />
                Measuring help requested</label
              ><label
                >Material or finish (optional)<input
                  [(ngModel)]="details.cabinetryMaterial"
                  name="cabinetryMaterial" /></label
              ><label
                >Approximate dimensions (unverified)<input
                  [(ngModel)]="details.cabinetryDimensions"
                  name="cabinetryDimensions" /></label
              ><label
                ><input type="checkbox" [(ngModel)]="details.exclusions" name="exclusions" /> I
                understand plumbing, wiring, structural work, appliances and countertops are
                excluded unless explicitly agreed.</label
              >
            </fieldset>
          }
          @if (hasBoards()) {
            <fieldset>
              <legend>Board requirements</legend>
              @for (line of lines; track $index; let i = $index) {
                <section>
                  <h3>Board line {{ i + 1 }}</h3>
                  <label
                    >Published variant ID (optional)<input
                      [(ngModel)]="line.variant_id"
                      name="variant{{ i }}" /></label
                  ><label
                    >Or describe material, finish, thickness and size<input
                      [(ngModel)]="line.requested_specification"
                      name="spec{{ i }}"
                      maxlength="500" /></label
                  ><label
                    >Quantity in full sheets or part count<input
                      type="number"
                      [(ngModel)]="line.quantity"
                      name="qty{{ i }}"
                      min="1"
                      max="9999" /></label
                  ><label
                    >Fulfilment<select [(ngModel)]="line.fulfilment" name="fulfilment{{ i }}">
                      <option>FULL_SHEET</option>
                      @if (selected.includes('BOARD_CUTTING')) {
                        <option>CUT_TO_SIZE</option>
                      }
                    </select></label
                  ><label
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
                    <button type="button" (click)="removeLine(i)">Remove line</button>
                  }
                </section>
              }
              <button type="button" (click)="addLine()" [disabled]="lines.length >= 10">
                Add board line
              </button>
            </fieldset>
          }
          @if (selected.includes('BOARD_CUTTING')) {
            <fieldset>
              <legend>Cut-to-size qualification</legend>
              <label
                >Material source<select [(ngModel)]="details.materialSource" name="materialSource">
                  <option>BUSINESS_SUPPLIED</option>
                  <option>CUSTOMER_SUPPLIED</option>
                  <option>UNDECIDED</option>
                </select></label
              ><label
                >Input mode<select [(ngModel)]="details.cuttingMode" name="cuttingMode">
                  <option>NEED_HELP</option>
                  <option>ATTACHMENT</option>
                </select></label
              >
              @if (details.cuttingMode === 'NEED_HELP') {
                <label
                  >Describe the help needed<textarea
                    [(ngModel)]="details.cuttingHelp"
                    name="cuttingHelp"
                  ></textarea>
                </label>
              }
              <p>
                Dimensions use <strong>FINISHED_PART_SIZE</strong>. No kerf, nesting or production
                instruction is calculated.
              </p>
              <a href="/cut-list-template.csv" download>Download inert cut-list template</a>
            </fieldset>
          }
          @if (selected.includes('HARDWARE')) {
            <fieldset>
              <legend>Hardware supplies</legend>
              <label
                >Category or item description<input
                  [(ngModel)]="details.hardwareDescription"
                  name="hardwareDescription" /></label
              ><label
                >Quantity<input
                  type="number"
                  min="1"
                  [(ngModel)]="details.hardwareQuantity"
                  name="hardwareQuantity" /></label
              ><label
                >Unit<select [(ngModel)]="details.hardwareUnit" name="hardwareUnit">
                  <option>EACH</option>
                  <option>PACK</option>
                  <option>LITRE</option>
                  <option>METRE</option>
                </select></label
              ><label
                >Pack size or preference (optional)<input
                  [(ngModel)]="details.hardwarePack"
                  name="hardwarePack"
              /></label>
            </fieldset>
          }
        }
        @if (step === 3) {
          <h2>Contact and files</h2>
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
            >Describe the overall request<textarea
              [(ngModel)]="description"
              name="description"
              minlength="10"
              maxlength="5000"
            ></textarea></label
          ><label
            >Budget band (optional)<select [(ngModel)]="budgetBand" name="budgetBand">
              <option value="">Not supplied</option>
              <option>NOT_SURE</option>
              <option>DEMO_LOW</option>
              <option>DEMO_MEDIUM</option>
            </select></label
          ><label
            >Currency snapshot (optional)<input
              [(ngModel)]="budgetCurrency"
              name="budgetCurrency"
              maxlength="3" /></label
          ><label
            >Desired start (optional)<input
              type="date"
              [(ngModel)]="desiredStart"
              name="desiredStart"
          /></label>
          <label class="upload-panel"
            >Plans, photos or cutting list
            <span
              >Select files only when they help explain the request. Cutting assistance remains
              available without an attachment.</span
            >
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.pdf,.xlsx"
              (change)="uploadFiles($event)"
              [disabled]="uploading"
            />
          </label>
          <p>
            Up to five JPEG, PNG, WebP, PDF or non-macro XLSX files; 10 MiB each and 50 MiB
            combined. Files remain private while validation and scanning are pending.
          </p>
          <p aria-live="polite">{{ uploadStatus }}</p>
          @if (selectedFileSummary) {
            <p class="file-selection-summary">{{ selectedFileSummary }}</p>
          }
          @if (uploading) {
            <button type="button" (click)="cancelUpload()">Cancel upload</button>
          }
        }
        @if (step === 4) {
          <h2>Review and submit</h2>
          <p>Services: {{ selected.join(', ') }}</p>
          <p>
            {{ lines.length }} board line(s) where relevant; preferred contact {{ preference }};
            location {{ suburb }}, {{ country }}.
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
  readonly serviceOptions = ENQUIRY_SERVICES;
  readonly titles = ['Service selection', 'Requirements', 'Contact and files', 'Review and submit'];
  step = 1;
  selected: string[] = [];
  details: any = {
    propertyRepresentative: 'OWNER',
    propertyScope: 'EXISTING_HOUSE',
    propertyUse: 'UNDECIDED',
    cabinetryProduct: 'KITCHEN',
    cabinetryFulfilment: 'UNDECIDED',
    materialSource: 'UNDECIDED',
    cuttingMode: 'NEED_HELP',
    hardwareQuantity: 1,
    hardwareUnit: 'EACH',
  };
  lines: Line[] = [];
  fullName = '';
  preference = 'EMAIL';
  email = '';
  phone = '';
  country = 'ZA';
  suburb = '';
  description = '';
  budgetBand = '';
  budgetCurrency = '';
  desiredStart = '';
  privacy = false;
  marketing = false;
  submitting = false;
  errors: string[] = [];
  receipt = '';
  uploading = false;
  uploadStatus = 'No files selected.';
  selectedFileSummary = '';
  attachmentIds: string[] = [];
  uploadCapability = '';
  private activeUpload?: XMLHttpRequest;
  private key = crypto.randomUUID();
  constructor() {
    const route = inject(ActivatedRoute).snapshot;
    const variant = route.queryParamMap.get('variant') ?? '';
    const requested = supportedService(route.queryParamMap.get('service'));
    this.selected = [requested ?? 'BOARD_SALES'];
    this.lines = [this.newLine(variant)];
  }
  label(code: string) {
    return serviceLabel(code);
  }
  hasBoards() {
    return this.selected.includes('BOARD_SALES') || this.selected.includes('BOARD_CUTTING');
  }
  toggle(code: string, on: boolean, checkbox?: HTMLInputElement) {
    if (on) {
      if (!this.selected.includes(code)) this.selected.push(code);
      if ((code === 'BOARD_SALES' || code === 'BOARD_CUTTING') && !this.lines.length)
        this.lines.push(this.newLine(''));
      return;
    }
    if (
      this.hasPopulatedDetails(code) &&
      !confirm('Removing this service clears its entered requirements. Continue?')
    ) {
      // The native checkbox toggles before confirmation; restore it when removal is cancelled.
      if (checkbox) checkbox.checked = true;
      return;
    }
    this.selected = this.selected.filter((x) => x !== code);
    this.clearDetails(code);
  }
  hasPopulatedDetails(code: string) {
    return (
      (code === 'CABINETRY' && !!this.details.cabinetryMaterial) ||
      (code === 'BOARD_CUTTING' && !!this.details.cuttingHelp) ||
      (code === 'PROPERTY_TRANSFORMATION' && !!this.details.landArea)
    );
  }
  clearDetails(code: string) {
    if (code === 'CABINETRY') {
      this.details.cabinetryMaterial = '';
      this.details.cabinetryDimensions = '';
    }
    if (code === 'BOARD_CUTTING') this.details.cuttingHelp = '';
    if (code === 'PROPERTY_TRANSFORMATION') this.details.landArea = null;
  }
  newLine(variant: string): Line {
    return {
      variant_id: variant,
      requested_specification: '',
      quantity: 1,
      fulfilment: 'FULL_SHEET',
      collection_preference: 'UNDECIDED',
      substitutes_allowed: 'DISCUSS',
    };
  }
  addLine() {
    if (this.lines.length < 10) this.lines.push(this.newLine(''));
  }
  removeLine(i: number) {
    this.lines.splice(i, 1);
  }
  next() {
    this.errors = [];
    if (this.step === 1 && !this.selected.length) {
      this.errors = ['Select at least one service.'];
      return;
    }
    if (this.step < 4) {
      this.step++;
      return;
    }
    this.submit();
  }
  async uploadFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    const combinedBytes = files.reduce((total, file) => total + file.size, 0);
    this.selectedFileSummary = `${files.length} file(s) selected · ${(combinedBytes / 1024 / 1024).toFixed(1)} MiB combined.`;
    this.errors = [];
    if (
      files.length > 5 ||
      files.some((file) => file.size > 10 * 1024 * 1024) ||
      files.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024
    ) {
      this.errors = ['Choose at most five files, no larger than 10 MiB each or 50 MiB combined.'];
      this.selectedFileSummary = '';
      input.value = '';
      return;
    }
    this.uploading = true;
    this.uploadStatus = 'Preparing secure uploads…';
    try {
      const requested = await Promise.all(
        files.map(async (file) => ({
          file_name: file.name,
          byte_size: file.size,
          content_type: file.type || 'application/octet-stream',
          checksum_sha256: Array.from(
            new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer())),
          )
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(''),
        })),
      );
      const session = await firstValueFrom(this.api.createUploadSession(requested));
      for (let i = 0; i < files.length; i++) {
        this.uploadStatus = `Uploading file ${i + 1} of ${files.length}…`;
        const allocation = session.files[i];
        const form = new FormData();
        for (const [key, value] of Object.entries(allocation.upload.fields))
          form.append(key, value);
        form.append('file', files[i]);
        await this.postFile(allocation.upload.url, form, i, files.length);
        const completed = await firstValueFrom(
          this.api.completeUpload(session.session_id, allocation.attachment_id, session.capability),
        );
        if (completed.state === 'REJECTED')
          throw new Error('A file failed safety validation. Remove it or use NEED_HELP.');
      }
      this.attachmentIds = session.files.map((file) => file.attachment_id);
      this.uploadCapability = session.capability;
      this.uploadStatus = `${files.length} file(s) uploaded and awaiting or passing safety scanning.`;
    } catch (error) {
      this.attachmentIds = [];
      this.uploadCapability = '';
      this.errors = [
        error instanceof Error ? error.message : 'Upload failed. Retry or continue without files.',
      ];
      this.uploadStatus =
        error instanceof Error && error.message === 'Upload cancelled.'
          ? 'Upload cancelled. Select the files again to retry.'
          : 'No usable files are attached.';
    } finally {
      this.activeUpload = undefined;
      this.uploading = false;
      this.changeDetector.markForCheck();
    }
  }
  cancelUpload() {
    this.activeUpload?.abort();
    this.uploadStatus = 'Upload cancelled. Select the files again to retry.';
    this.uploading = false;
  }
  private postFile(url: string, body: FormData, index: number, total: number) {
    return new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest();
      this.activeUpload = request;
      request.open('POST', url);
      request.upload.onprogress = (event) => {
        if (event.lengthComputable)
          this.uploadStatus = `Uploading file ${index + 1} of ${total}: ${Math.round((event.loaded / event.total) * 100)}%`;
      };
      request.onload = () =>
        request.status >= 200 && request.status < 300
          ? resolve()
          : reject(new Error('The storage service rejected an upload.'));
      request.onerror = () =>
        reject(new Error('The upload was interrupted. Select the files again to retry.'));
      request.onabort = () => reject(new Error('Upload cancelled.'));
      request.send(body);
    });
  }
  private serviceDetails() {
    const out: any = {};
    for (const s of this.selected) {
      switch (s) {
        case 'PROPERTY_TRANSFORMATION':
          out[s] = {
            representative_status: this.details.propertyRepresentative,
            site_scope: this.details.propertyScope,
            intended_use: this.details.propertyUse,
            ...(this.details.landArea ? { land_area_m2: this.details.landArea } : {}),
          };
          break;
        case 'CONSTRUCTION':
        case 'EXTENSION':
          out[s] = { work_type: this.details[s + 'WorkType'] ?? '' };
          break;
        case 'RENOVATION':
        case 'MAINTENANCE':
          out[s] = {
            affected_area: this.details[s + 'Area'] ?? '',
            urgency: this.details[s + 'Urgency'] ?? 'ROUTINE',
          };
          break;
        case 'INTERIORS':
          out[s] = {
            rooms: (this.details.rooms ?? '')
              .split(',')
              .map((x: string) => x.trim())
              .filter(Boolean),
            design_objective: this.details.designObjective ?? '',
          };
          break;
        case 'CABINETRY':
          out[s] = {
            product_types: [this.details.cabinetryProduct],
            fulfilment: this.details.cabinetryFulfilment,
            other_explanation: this.details.cabinetryOther ?? '',
            measurement_help: !!this.details.measuringHelp,
            material: this.details.cabinetryMaterial ?? '',
            approximate_dimensions: this.details.cabinetryDimensions ?? '',
            measurement_status: 'UNVERIFIED',
            exclusions_acknowledged: !!this.details.exclusions,
            exclusions: ['PLUMBING', 'WIRING', 'STRUCTURAL_WORK', 'APPLIANCES', 'COUNTERTOPS'],
          };
          break;
        case 'BOARD_SALES':
          out[s] = { collection_preference: this.lines[0]?.collection_preference ?? 'UNDECIDED' };
          break;
        case 'BOARD_CUTTING':
          out[s] = {
            material_source: this.details.materialSource,
            input_mode: this.details.cuttingMode,
            ...(this.details.cuttingMode === 'NEED_HELP'
              ? { help_description: this.details.cuttingHelp ?? '' }
              : {}),
            dimension_convention: 'FINISHED_PART_SIZE',
          };
          break;
        case 'HARDWARE':
          out[s] = {
            lines: [
              {
                description: this.details.hardwareDescription ?? '',
                quantity: this.details.hardwareQuantity,
                unit: this.details.hardwareUnit,
                pack_size: this.details.hardwarePack ?? '',
              },
            ],
            collection_preference: 'UNDECIDED',
            substitutes_allowed: 'DISCUSS',
          };
      }
    }
    return out;
  }
  private submit() {
    this.submitting = true;
    const body = {
      services: this.selected,
      contact: {
        full_name: this.fullName,
        email: this.email || null,
        phone: this.phone || null,
        preferred_contact: this.preference,
      },
      location: { country_code: this.country, town_or_suburb: this.suburb },
      description: this.description,
      service_details: this.serviceDetails(),
      request_lines: this.hasBoards()
        ? this.lines.map((l) => ({
            ...l,
            variant_id: l.variant_id || null,
            requested_specification: l.requested_specification || null,
            unit: 'SHEET',
          }))
        : [],
      attachment_ids: this.attachmentIds,
      upload_capability: this.uploadCapability || null,
      budget_band: this.budgetBand || null,
      budget_currency: this.budgetCurrency || null,
      desired_start: this.desiredStart || null,
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
            'The request could not be submitted. Your entries are preserved; retry with the same content.',
        ];
        this.changeDetector.markForCheck();
        setTimeout(() => this.summary?.nativeElement.focus());
      },
    });
  }
}
