import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicContent, PublicContentPage, ResolvedContentError } from './content-api.service';
import { isNonProduction, PUBLIC_SITE_MODE } from './site-mode';

@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-public-page',
  template: `
    <article class="page" [attr.aria-busy]="loading">
      <p class="eyebrow">Demonstration content</p>
      <h1 #heading tabindex="-1">{{ pageTitle }}</h1>
      @if (loading) {
        <p role="status">Loading published content…</p>
      } @else if (error) {
        <section class="error" role="alert">
          <h2>
            {{ error === 'not-found' ? 'Published page not found' : 'Content is unavailable' }}
          </h2>
          <p>
            {{
              error === 'not-found'
                ? 'This item is missing, draft or archived.'
                : 'Please try again later.'
            }}
          </p>
        </section>
      } @else {
        @switch (kind) {
          @case ('home') {
            <p class="lead">
              Three clear offers: property transformation, custom cabinetry and standalone board
              supply.
            </p>
            <section class="cards" aria-label="Primary services">
              <a routerLink="/property-transformation"
                ><h2>Property transformation</h2>
                <p>Assessment-led feasibility without approval or return promises.</p></a
              >
              <a routerLink="/cabinetry"
                ><h2>Custom cabinetry</h2>
                <p>Supply-only or fix-and-supply routes.</p></a
              >
              <a class="timber" routerLink="/boards"
                ><h2>Standalone board supply</h2>
                <p>Browse published full-sheet specifications and request a quotation.</p></a
              >
            </section>
            <section>
              <h2>A careful process</h2>
              <ol>
                <li>Understand the brief</li>
                <li>Review constraints and feasibility</li>
                <li>Confirm scope before delivery</li>
              </ol>
            </section>
          }
          @case ('property') {
            <p class="lead">
              Explore a possible transformation through evidence, feasibility and approvals
              applicable to the site.
            </p>
            <h2>What an assessment can cover</h2>
            <p>
              Existing conditions, constraints, concept options, indicative scope and next steps. It
              does not promise legal unit counts, permission, income or regulated professional
              services.
            </p>
          }
          @case ('services') {
            @for (item of items; track item.id) {
              <article class="card">
                <h2>
                  <a [routerLink]="['/services', item.slug]">{{ item.title }}</a>
                </h2>
                <p>{{ item.summary }}</p>
              </article>
            } @empty {
              <p>No published services are available.</p>
            }
          }
          @case ('service') {
            @if (content) {
              <p class="lead">{{ content.summary }}</p>
              <div class="rich-text" [innerHTML]="content.body_html"></div>
              <p>
                <a class="action" routerLink="/request-quote">Request full board sheets</a>
              </p>
            }
          }
          @case ('projects') {
            @for (item of items; track item.id) {
              <article class="card">
                <p class="tag">Owner-development concept · synthetic</p>
                <h2>
                  <a [routerLink]="['/projects', item.slug]">{{ item.title }}</a>
                </h2>
                <p>{{ item.summary }}</p>
              </article>
            } @empty {
              <p>No published projects are available.</p>
            }
          }
          @case ('project') {
            @if (content) {
              <p class="tag">
                Owner-development concept · not a client commission · not completed work
              </p>
              <p class="lead">{{ content.summary }}</p>
              <div class="rich-text" [innerHTML]="content.body_html"></div>
              <div class="gallery" aria-label="Concept stages">
                @for (stage of stages; track stage.label; let index = $index) {
                  <figure>
                    <button
                      type="button"
                      (click)="openGallery(index, $event.currentTarget)"
                      [attr.aria-label]="'Open ' + stage.label + ' illustration'"
                    >
                      <span
                        class="placeholder"
                        [class]="stage.className"
                        role="img"
                        [attr.aria-label]="stage.alt"
                      ></span>
                    </button>
                    <figcaption>{{ stage.label }}</figcaption>
                  </figure>
                }
              </div>
            }
          }
          @case ('cabinetry') {
            <p class="lead">
              Cabinetry is offered as SUPPLY_ONLY or FIX_AND_SUPPLY after the brief and site
              constraints are confirmed.
            </p>
            <h2>Material-led decisions</h2>
            <p>Layout, hardware, finish and installation responsibility are recorded separately.</p>
          }
          @case ('about') {
            <p>
              No owner biography, credential, accreditation, workshop capacity or trading claim is
              published until evidence is approved.
            </p>
          }
          @case ('contact') {
            <p><strong>Contact details pending confirmation.</strong></p>
            <button disabled>Call unavailable</button> <button disabled>Email unavailable</button>
            <p>No map pin or fabricated phone number is shown.</p>
          }
          @case ('faqs') {
            <details>
              <summary>Is the board catalogue live?</summary>
              <p>
                Yes. Published board specifications can be requested as full sheets; no stock or
                price is claimed.
              </p>
            </details>
            <details>
              <summary>Are the projects completed client work?</summary>
              <p>No. They are synthetic owner-development concepts.</p>
            </details>
            <details>
              <summary>Are approvals guaranteed?</summary>
              <p>No. Requirements depend on verified site facts and relevant authorities.</p>
            </details>
          }
          @case ('privacy') {
            <p>
              This demonstration collects no public contact submission in this phase. A confirmed
              notice must identify the real business, processors, purposes, retention and rights
              process before launch.
            </p>
          }
          @case ('terms') {
            <p>
              Demonstration content is not an offer, price, stock statement, credential or promise
              of approval or return.
            </p>
          }
          @case ('upcoming') {
            <p class="lead">
              This route is intentionally unavailable until its planned phase supplies a working,
              truthful experience.
            </p>
            <a routerLink="/services">Explore available service information</a>
          }
          @default {
            <p>We could not find that published page.</p>
            <a routerLink="/">Return home</a>
          }
        }
      }
    </article>
    <dialog
      #galleryDialog
      class="gallery-dialog"
      aria-labelledby="gallery-title"
      (cancel)="closeGallery()"
    >
      <h2 id="gallery-title">Concept illustration</h2>
      <p aria-live="polite">
        Image {{ activeStage + 1 }} of {{ stages.length }}: {{ stages[activeStage].label }}
      </p>
      <div
        class="placeholder dialog-image"
        [class]="stages[activeStage].className"
        role="img"
        [attr.aria-label]="stages[activeStage].alt"
      ></div>
      <div class="dialog-actions">
        <button type="button" (click)="previous()" aria-label="Previous image">Previous</button
        ><button type="button" (click)="next()" aria-label="Next image">Next</button
        ><button type="button" (click)="closeGallery()">Close</button>
      </div>
    </dialog>
  `,
})
export class PublicPage implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly platform = inject(PLATFORM_ID);
  private readonly siteMode = inject(PUBLIC_SITE_MODE);
  private returnFocus?: HTMLElement;
  @ViewChild('heading') heading?: ElementRef<HTMLElement>;
  @ViewChild('galleryDialog') galleryDialog?: ElementRef<HTMLDialogElement>;
  kind = '';
  pageTitle = '';
  loading = false;
  error: 'not-found' | 'unavailable' | null = null;
  items: PublicContent[] = [];
  content?: PublicContent;
  activeStage = 0;
  readonly stages = [
    {
      label: 'Before concept',
      alt: 'Abstract before-stage placeholder illustration',
      className: '',
    },
    {
      label: 'During concept',
      alt: 'Abstract during-stage placeholder illustration',
      className: 'during',
    },
    {
      label: 'After concept',
      alt: 'Abstract after-stage placeholder illustration',
      className: 'after',
    },
  ];
  readonly nonProduction = isNonProduction(this.siteMode);

  ngOnInit() {
    this.kind = this.route.snapshot.data['kind'];
    this.pageTitle = this.route.snapshot.data['title'];
    const resolved = this.route.snapshot.data['publicContent'] as
      | PublicContentPage
      | PublicContent
      | ResolvedContentError
      | undefined;
    if (resolved && 'error' in resolved) {
      this.error = resolved.error;
      if (resolved.error === 'not-found') this.pageTitle = 'Page not found';
    } else if (resolved && 'items' in resolved) {
      this.items = resolved.items;
    } else if (resolved) {
      this.content = resolved;
      this.pageTitle = resolved.title;
    }
    this.updateMetadata(this.content?.summary);
  }
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platform)) this.heading?.nativeElement.focus();
  }
  private updateMetadata(
    description = `Synthetic demonstration: ${this.pageTitle}. No unverified business claims.`,
  ) {
    this.title.setTitle(`${this.pageTitle} | Example Property Transformation`);
    this.meta.updateTag({ name: 'description', content: description });
    const environment =
      this.document.querySelector<HTMLMetaElement>('meta[name="takura-environment"]') ??
      this.document.head.appendChild(this.document.createElement('meta'));
    environment.name = 'takura-environment';
    environment.content = this.siteMode;
    if (this.nonProduction) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow, noarchive' });
    } else {
      this.meta.removeTag('name="robots"');
    }
    const canonical =
      this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ??
      this.document.head.appendChild(this.document.createElement('link'));
    canonical.rel = 'canonical';
    canonical.href = `https://example.invalid${this.route.snapshot.url.map((segment) => '/' + segment.path).join('')}`;
    let structured = this.document.querySelector<HTMLScriptElement>(
      'script[data-public-structured]',
    );
    if (!structured) {
      structured = this.document.createElement('script');
      structured.type = 'application/ld+json';
      structured.setAttribute('data-public-structured', '');
      this.document.head.appendChild(structured);
    }
    structured.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': this.kind.startsWith('project') ? 'CreativeWork' : 'WebPage',
      name: this.pageTitle,
      description,
    });
  }
  openGallery(index: number, source: EventTarget | null) {
    this.activeStage = index;
    this.returnFocus = source instanceof HTMLElement ? source : undefined;
    this.galleryDialog?.nativeElement.showModal();
  }
  closeGallery() {
    this.galleryDialog?.nativeElement.close();
    this.returnFocus?.focus();
  }
  next() {
    this.activeStage = (this.activeStage + 1) % this.stages.length;
  }
  previous() {
    this.activeStage = (this.activeStage + this.stages.length - 1) % this.stages.length;
  }
}
