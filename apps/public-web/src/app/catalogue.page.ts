import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoardPage, BoardProduct, HardwareItem } from './catalogue-api.service';
import { RevealDirective } from './reveal.directive';
@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, RevealDirective],
  selector: 'app-catalogue',
  template: `<article class="page catalogue-page">
    <header class="catalogue-heading reveal" appReveal>
      <div>
        <p class="eyebrow">Materials catalogue</p>
        <h1 tabindex="-1">
          {{
            kind === 'hardware'
              ? 'Supporting hardware'
              : kind === 'board'
                ? (product?.name ?? 'Board detail')
                : 'Standalone board supply'
          }}
        </h1>
      </div>
      <p>
        Published specifications for quotation requests. Prices and stock quantities remain
        intentionally absent; availability wording is explicit.
      </p>
    </header>
    @if (error) {
      <div class="error" role="alert">
        <h2>Catalogue unavailable</h2>
        <p>Please try again later.</p>
      </div>
    } @else if (kind === 'boards') {
      <form
        class="filters catalogue-filters reveal"
        appReveal
        (ngSubmit)="apply()"
        aria-label="Board filters"
      >
        <div class="filter-heading">
          <strong>Refine published boards</strong
          ><span>Filters update the URL so results can be revisited.</span>
        </div>
        <label
          >Material type<select name="type" [(ngModel)]="type">
            <option value="">All</option>
            <option>MELAMINE</option>
            <option>MDF</option>
            <option>PLYWOOD</option>
          </select></label
        ><label>Finish<input name="finish" [(ngModel)]="finish" /></label
        ><label
          >Thickness (mm)<input
            name="thickness"
            inputmode="decimal"
            [(ngModel)]="thickness" /></label
        ><label
          >Sheet size<select name="sheet_size" [(ngModel)]="sheetSize">
            <option value="">All</option>
            <option value="2440x1220">2440 × 1220 mm</option>
          </select></label
        ><button>Apply filters</button><a routerLink="/boards">Clear</a>
      </form>
      <div class="board-product-grid reveal" appReveal>
        @for (item of products; track item.id; let index = $index) {
          <article class="board-product-card">
            <a
              class="board-product-art"
              [class]="'board-product-art board-product-art-' + ((index % 3) + 1)"
              [routerLink]="['/boards', item.slug]"
              [queryParams]="route.snapshot.queryParams"
              aria-hidden="true"
              tabindex="-1"
              ><span aria-hidden="true"></span
            ></a>
            <div class="board-product-copy">
              <p class="tag">Published board specification</p>
              <h2>
                <a
                  [routerLink]="['/boards', item.slug]"
                  [queryParams]="route.snapshot.queryParams"
                  >{{ item.name }}</a
                >
              </h2>
              <p>{{ item.description }}</p>
              <p>
                {{ item.variants[0].material_type }} · {{ item.variants[0].finish }} ·
                {{ item.variants[0].thickness_mm }} mm
              </p>
              <p>{{ item.variants[0].availability_wording }}</p>
              <a
                class="text-link"
                [routerLink]="['/boards', item.slug]"
                [queryParams]="route.snapshot.queryParams"
                >View specifications</a
              >
            </div>
          </article>
        } @empty {
          <p>
            No published boards match these filters. Clear a filter or describe an unknown
            specification in the quote request.
          </p>
        }
      </div>
    } @else if (kind === 'board' && product) {
      <section class="board-detail-hero reveal" appReveal>
        <div>
          <p class="eyebrow">Published board</p>
          <h2>{{ product.name }}</h2>
          <p class="lead">{{ product.description }}</p>
          <p>
            Choose a published variant below. This is a quotation path, not a cart, reservation or
            stock promise.
          </p>
        </div>
        <div
          class="board-detail-art"
          role="img"
          [attr.aria-label]="'Abstract board material study for ' + product.name"
        >
          <span></span><span></span><span></span>
        </div>
      </section>
      <fieldset class="variant-selector">
        <legend>Choose a published variant</legend>
        @for (v of product.variants; track v.id) {
          <label class="variant"
            ><input type="radio" name="variant" [value]="v.id" [(ngModel)]="selected" /><strong
              >{{ v.material_type }} · {{ v.finish }}</strong
            ><span
              >{{ v.thickness_mm }} mm · {{ v.sheet_length_mm }} × {{ v.sheet_width_mm }} mm ·
              {{ v.unit }}</span
            ><span>{{ v.availability_wording }}</span
            ><span>{{ v.collection_delivery_wording }}</span></label
          >
        }
      </fieldset>
      <div class="board-detail-actions">
        <a
          class="action"
          routerLink="/request-quote"
          [queryParams]="{ variant: selected || product.variants[0].id }"
          >Request full sheets</a
        >

        <a routerLink="/boards" [queryParams]="route.snapshot.queryParams"
          >Back to preserved results</a
        >
      </div>
    } @else if (kind === 'hardware') {
      <div class="hardware-grid reveal" appReveal>
        @for (item of hardware; track item.id) {
          <article class="card hardware-card">
            <p class="tag">{{ item.category }} · {{ item.unit }}</p>
            <h2>{{ item.name }}</h2>
            <p>{{ item.description }}</p>
            <p><strong>Supply item only:</strong> this is not painting or installation labour.</p>
            <p>{{ item.availability_wording }}</p>
          </article>
        } @empty {
          <p>No published supporting supplies are available.</p>
        }
      </div>
    }
  </article>`,
})
export class CataloguePage {
  readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly kind = this.route.snapshot.data['kind'];
  type = this.route.snapshot.queryParamMap.get('type') ?? '';
  finish = this.route.snapshot.queryParamMap.get('finish') ?? '';
  thickness = this.route.snapshot.queryParamMap.get('thickness') ?? '';
  sheetSize = this.route.snapshot.queryParamMap.get('sheet_size') ?? '';
  selected = '';
  products: BoardProduct[] = [];
  product?: BoardProduct;
  hardware: HardwareItem[] = [];
  error = false;
  constructor() {
    const d = this.route.snapshot.data['catalogue'];
    if (d?.error) this.error = true;
    else if (this.kind === 'boards') this.products = (d as BoardPage)?.items ?? [];
    else if (this.kind === 'board') {
      this.product = d as BoardProduct;
      this.selected = this.product?.variants[0]?.id ?? '';
    } else this.hardware = d as HardwareItem[];
  }
  apply() {
    this.router.navigate(['/boards'], {
      queryParams: {
        type: this.type || null,
        finish: this.finish || null,
        thickness: this.thickness || null,
        sheet_size: this.sheetSize || null,
      },
    });
  }
}
