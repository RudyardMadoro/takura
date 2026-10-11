import { JsonPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  standalone: true,
  imports: [FormsModule, JsonPipe],
  selector: 'app-board-operations',
  template: `<h1 tabindex="-1">Boards Team inbox</h1>
    <p>Counts, lists and details use the same server-side team and record scope.</p>
    <button (click)="load()">Refresh inbox</button>
    @if (error()) {
      <p role="alert">{{ error() }}</p>
    }
    <p aria-live="polite">Visible requests: {{ count() }}</p>
    <ul>
      @for (item of items(); track item.id) {
        <li>
          <button (click)="detail(item.id)">{{ item.reference }} · {{ item.state }}</button>
        </li>
      }
    </ul>
    @if (selected()) {
      <section>
        <h2>{{ selected().reference }}</h2>
        <p>{{ selected().full_name }} · {{ selected().preferred_contact }}</p>
        <p>{{ selected().town_or_suburb }}, {{ selected().country_code }}</p>
        <p>{{ selected().description }}</p>
        <pre>{{ selected().request_lines | json }}</pre>
      </section>
    }`,
})
export class BoardInboxPage {
  private readonly http = inject(HttpClient);
  readonly items = signal<any[]>([]);
  readonly selected = signal<any>(null);
  readonly count = signal(0);
  readonly error = signal('');
  constructor() {
    this.load();
  }
  load() {
    this.http.get<any>('/api/v1/admin/enquiries').subscribe({
      next: (r) => this.items.set(r.items),
      error: () => this.error.set('Inbox is unavailable or outside your scope.'),
    });
    this.http
      .get<any>('/api/v1/admin/enquiries/count')
      .subscribe({ next: (r) => this.count.set(r.count) });
  }
  detail(id: string) {
    this.http.get<any>('/api/v1/admin/enquiries/' + id).subscribe({
      next: (r) => this.selected.set(r),
      error: () => this.error.set('That record is unavailable or outside your scope.'),
    });
  }
}
@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-catalogue-admin',
  template: `<h1 tabindex="-1">Board catalogue management</h1>
    <p>
      Published specification revisions are immutable. Prices and stock counts are not collected.
    </p>
    <button (click)="load()">Refresh</button>
    @if (error()) {
      <p role="alert">{{ error() }}</p>
    }
    @for (v of variants(); track v.id) {
      <article>
        <h2>{{ v.name }} · {{ v.sku }}</h2>
        <p>
          {{ v.material_type }} {{ v.finish }} {{ v.thickness_mm }} mm · revision {{ v.revision }}
        </p>
        <p>{{ v.enabled ? 'Published' : 'Disabled' }}{{ v.archived ? ' · archived' : '' }}</p>
        <button (click)="archive(v)">Archive</button>
      </article>
    }`,
})
export class CatalogueAdminPage {
  private readonly http = inject(HttpClient);
  readonly variants = signal<any[]>([]);
  readonly error = signal('');
  constructor() {
    this.load();
  }
  load() {
    this.http.get<any[]>('/api/v1/admin/catalogue/variants').subscribe({
      next: (r) => this.variants.set(r),
      error: () => this.error.set('Catalogue access is not granted.'),
    });
  }
  archive(v: any) {
    this.http
      .delete('/api/v1/admin/catalogue/variants/' + v.id, {
        headers: new HttpHeaders({ 'If-Match': `"${v.revision}"` }),
      })
      .subscribe({
        next: () => this.load(),
        error: () => this.error.set('The item changed; refresh before retrying.'),
      });
  }
}
