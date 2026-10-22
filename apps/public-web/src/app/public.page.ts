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
    <article class="page" [class.home-page]="kind === 'home'" [attr.aria-busy]="loading">
      @if (kind !== 'home') {
        <p class="eyebrow">Demonstration content</p>
        <h1 #heading tabindex="-1">{{ pageTitle }}</h1>
      }
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
            <section class="home-hero" aria-labelledby="home-title">
              <img
                src="/images/takura-home-hero-concept.png"
                width="1944"
                height="817"
                alt="Synthetic concept of a contemporary home with charcoal walls, timber screening and indigenous landscaping"
                fetchpriority="high"
              />
              <div class="home-hero-overlay"></div>
              <div class="home-hero-copy">
                <p class="eyebrow">Property · interiors · materials</p>
                <h1 #heading id="home-title" tabindex="-1">
                  Thoughtful spaces, shaped around real constraints.
                </h1>
                <p>
                  Explore property transformation, construction, cabinetry and standalone board
                  supply through one considered enquiry process.
                </p>
                <div class="home-actions">
                  <a class="action action-light" routerLink="/request-quote"
                    >Start a project brief</a
                  >
                  <a class="text-link" routerLink="/projects">Explore concepts</a>
                </div>
                <p class="concept-note">
                  Synthetic architectural concept · not completed client work
                </p>
              </div>
            </section>

            <section class="home-intro home-section reveal">
              <p class="section-index" aria-hidden="true">01</p>
              <div>
                <p class="eyebrow">A connected approach</p>
                <h2>From property potential to the details that make a space work.</h2>
              </div>
              <div class="home-intro-copy">
                <p>
                  Takura's demonstration experience brings property assessment, building work,
                  fitted cabinetry and material supply into one clear path—without making promises
                  before facts, approvals and scope are verified.
                </p>
                <a class="text-link" routerLink="/about">How the approach is presented</a>
              </div>
            </section>

            <section class="home-section reveal" aria-labelledby="services-heading">
              <div class="section-heading">
                <div>
                  <p class="eyebrow">What we can explore</p>
                  <h2 id="services-heading">One brief. Distinct specialist routes.</h2>
                </div>
                <a class="text-link" routerLink="/services">View all services</a>
              </div>
              <div class="service-editorial-grid">
                <a routerLink="/property-transformation"
                  ><span>01</span>
                  <h3>Property development</h3>
                  <p>Evidence-led feasibility, constraints and approval-aware next steps.</p></a
                >
                <a routerLink="/services"
                  ><span>02</span>
                  <h3>Construction & extensions</h3>
                  <p>Define the intended work and qualification needs before scope is agreed.</p></a
                >
                <a routerLink="/services"
                  ><span>03</span>
                  <h3>Renovations & maintenance</h3>
                  <p>
                    Describe affected areas, priorities and timing without emergency promises.
                  </p></a
                >
                <a routerLink="/cabinetry"
                  ><span>04</span>
                  <h3>Custom cabinetry</h3>
                  <p>
                    Supply-only and fix-and-supply routes with responsibilities made explicit.
                  </p></a
                >
                <a routerLink="/boards"
                  ><span>05</span>
                  <h3>Board supply</h3>
                  <p>
                    Published full-sheet specifications, sourced on request without stock claims.
                  </p></a
                >
              </div>
            </section>

            <section class="cabinetry-feature reveal" aria-labelledby="cabinetry-heading">
              <figure>
                <img
                  src="/images/takura-cabinetry-concept.png"
                  width="1536"
                  height="1024"
                  loading="lazy"
                  alt="Synthetic cabinetry concept with timber veneer doors and charcoal stone surfaces"
                />
                <figcaption>Synthetic cabinetry concept · design direction only</figcaption>
              </figure>
              <div>
                <p class="eyebrow">Cabinetry</p>
                <h2 id="cabinetry-heading">Material-led joinery, with scope made clear.</h2>
                <p>
                  Explore kitchens, wardrobes and fitted storage through supply-only, fix-and-supply
                  or undecided qualification routes. Measurements remain unverified until an agreed
                  review takes place.
                </p>
                <a
                  class="action"
                  routerLink="/request-quote"
                  [queryParams]="{ service: 'CABINETRY' }"
                  >Discuss cabinetry</a
                >
              </div>
            </section>

            <section class="board-feature reveal" aria-labelledby="boards-heading">
              <div>
                <p class="eyebrow">Boards & workshop</p>
                <h2 id="boards-heading">Full sheets or a cut-to-size conversation.</h2>
                <p>
                  Browse published board specifications, request full sheets, or ask for help
                  preparing a cutting brief. No cart, stock reservation or automatic manufacturing
                  instruction is created.
                </p>
                <div class="home-actions">
                  <a class="action action-light" routerLink="/boards">Browse boards</a>
                  <a
                    class="text-link light"
                    routerLink="/request-quote"
                    [queryParams]="{ service: 'BOARD_CUTTING' }"
                    >Request cutting help</a
                  >
                </div>
              </div>
              <div class="material-stack" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </div>
            </section>

            <section class="home-section reveal" aria-labelledby="projects-heading">
              <div class="section-heading">
                <div>
                  <p class="eyebrow">Published concepts</p>
                  <h2 id="projects-heading">Ideas developed to test possibilities.</h2>
                </div>
                <a class="text-link" routerLink="/projects">See all concepts</a>
              </div>
              <div class="project-showcase">
                @for (item of items.slice(0, 3); track item.id; let index = $index) {
                  <article>
                    <div
                      class="project-art"
                      [class]="'project-art project-art-' + (index + 1)"
                      aria-hidden="true"
                    ></div>
                    <p class="tag">Owner-development concept · synthetic</p>
                    <h3>
                      <a [routerLink]="['/projects', item.slug]">{{ item.title }}</a>
                    </h3>
                    <p>{{ item.summary }}</p>
                  </article>
                } @empty {
                  <p>Published owner-development concepts will appear here when available.</p>
                }
              </div>
            </section>

            <section class="process-feature reveal" aria-labelledby="process-heading">
              <div>
                <p class="eyebrow">A careful process</p>
                <h2 id="process-heading">Clarity before commitment.</h2>
              </div>
              <ol>
                <li>
                  <span>01</span>
                  <div>
                    <strong>Share the brief</strong>
                    <p>Choose one or several services and describe what you know.</p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <strong>Review constraints</strong>
                    <p>Relevant teams clarify facts, files, scope and dependencies.</p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <strong>Agree the next step</strong>
                    <p>Only reviewed scope and evidence move into quotation or assessment.</p>
                  </div>
                </li>
              </ol>
            </section>

            <section class="home-cta reveal" aria-labelledby="home-cta-heading">
              <p class="eyebrow">Begin with what you know</p>
              <h2 id="home-cta-heading">
                Bring property, cabinetry and materials into one considered brief.
              </h2>
              <a class="action action-light" routerLink="/request-quote"
                >Request a quotation discussion</a
              >
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
            <p>
              <a
                class="action"
                routerLink="/request-quote"
                [queryParams]="{ service: 'PROPERTY_TRANSFORMATION' }"
                >Request a property discussion</a
              >
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
                <a
                  class="action"
                  routerLink="/request-quote"
                  [queryParams]="{ service: serviceCode(content.slug) }"
                  >Request this service</a
                >
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
              <p>
                <a
                  class="action"
                  routerLink="/request-quote"
                  [queryParams]="{ service: 'PROPERTY_TRANSFORMATION' }"
                  >Discuss a related property brief</a
                >
              </p>
            }
          }
          @case ('cabinetry') {
            <p class="lead">
              Cabinetry is offered as SUPPLY_ONLY or FIX_AND_SUPPLY after the brief and site
              constraints are confirmed.
            </p>
            <h2>Material-led decisions</h2>
            <p>Layout, hardware, finish and installation responsibility are recorded separately.</p>
            <p>
              <a class="action" routerLink="/request-quote" [queryParams]="{ service: 'CABINETRY' }"
                >Request cabinetry</a
              >
            </p>
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
              This demonstration quotation form stores synthetic contact and qualification details
              under the labelled demo notice. A confirmed notice must identify the real business,
              processors, purposes, retention and rights process before launch.
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
    const homeProjects = this.route.snapshot.data['homeProjects'] as PublicContentPage | undefined;
    if (homeProjects) this.items = homeProjects.items;
    this.updateMetadata(this.content?.summary);
  }
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platform)) this.heading?.nativeElement.focus();
  }
  serviceCode(slug: string) {
    const normalised = slug.toLowerCase();
    if (normalised.includes('cabinet')) return 'CABINETRY';
    if (normalised.includes('board') && normalised.includes('cut')) return 'BOARD_CUTTING';
    if (normalised.includes('board')) return 'BOARD_SALES';
    if (normalised.includes('construct')) return 'CONSTRUCTION';
    if (normalised.includes('renovat')) return 'RENOVATION';
    if (normalised.includes('extension')) return 'EXTENSION';
    if (normalised.includes('maintenance')) return 'MAINTENANCE';
    if (normalised.includes('interior')) return 'INTERIORS';
    if (normalised.includes('hardware')) return 'HARDWARE';
    return 'PROPERTY_TRANSFORMATION';
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
