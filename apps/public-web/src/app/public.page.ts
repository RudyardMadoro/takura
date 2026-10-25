import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
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
  imports: [RouterLink, NgTemplateOutlet],
  selector: 'app-public-page',
  template: `
    <article
      class="page"
      [class.home-page]="kind === 'home'"
      [class.service-page]="kind === 'service' || kind === 'service-overview'"
      [class.portfolio-page]="kind === 'projects' || kind === 'project'"
      [class.cabinetry-page]="kind === 'cabinetry'"
      [attr.aria-busy]="loading"
    >
      @if (
        error ||
        ![
          'home',
          'services',
          'service',
          'service-overview',
          'projects',
          'project',
          'cabinetry',
        ].includes(kind)
      ) {
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
                decoding="async"
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
                <a class="text-link" routerLink="/request-quote">Build a project brief</a>
              </div>
              <div class="service-index-grid home-service-grid">
                @for (service of topLevelServices; track service.path; let index = $index) {
                  <a [routerLink]="service.path">
                    <span>{{ (index + 1).toString().padStart(2, '0') }}</span>
                    <div
                      class="service-index-art"
                      [class]="'service-index-art art-' + ((index % 4) + 1)"
                      aria-hidden="true"
                    ></div>
                    <h3>{{ service.title }}</h3>
                    <p>{{ service.summary }}</p>
                    <strong>Explore offering</strong>
                  </a>
                }
              </div>
            </section>

            <section class="cabinetry-feature reveal" aria-labelledby="cabinetry-heading">
              <figure>
                <img
                  src="/images/takura-cabinetry-concept.png"
                  width="1536"
                  height="1024"
                  loading="lazy"
                  decoding="async"
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
          @case ('service') {
            <ng-container *ngTemplateOutlet="serviceDetail"></ng-container>
          }
          @case ('service-overview') {
            <ng-container *ngTemplateOutlet="serviceDetail"></ng-container>
          }
          @case ('projects') {
            <header class="portfolio-hero">
              <div>
                <p class="eyebrow">Published concepts</p>
                <h1 #heading tabindex="-1">
                  Property ideas presented with their status made clear.
                </h1>
              </div>
              <p class="lead">
                Browse published owner-development concepts and material studies. Every entry is
                labelled honestly and contains no availability, price or completed-client-work
                claim.
              </p>
            </header>
            <section class="portfolio-grid" aria-label="Published project concepts">
              @for (item of items; track item.id; let index = $index) {
                <article [class.featured]="item.featured">
                  <a
                    class="portfolio-image-link"
                    [routerLink]="['/projects', item.slug]"
                    [attr.aria-label]="'View ' + item.title"
                  >
                    <span
                      class="portfolio-art"
                      [class]="'portfolio-art portfolio-art-' + ((index % 3) + 1)"
                      role="img"
                      [attr.aria-label]="'Synthetic architectural study for ' + item.title"
                    ></span>
                  </a>
                  <div class="portfolio-card-copy">
                    <div class="portfolio-meta">
                      <span>Owner-development concept</span><span>{{ projectLocation(item) }}</span>
                    </div>
                    <h2>
                      <a [routerLink]="['/projects', item.slug]">{{ item.title }}</a>
                    </h2>
                    <p>{{ item.summary }}</p>
                    <a class="text-link" [routerLink]="['/projects', item.slug]">View concept</a>
                  </div>
                </article>
              } @empty {
                <p>No published projects are available.</p>
              }
            </section>
            <section class="portfolio-note">
              <p class="eyebrow">Publication standard</p>
              <h2>Only cleared, published concepts appear here.</h2>
              <p>
                Draft, archived, private and uncleared media remain excluded by the existing
                publication workflow.
              </p>
            </section>
          }
          @case ('project') {
            @if (content) {
              <header class="project-detail-hero">
                <div>
                  <p class="eyebrow">Owner-development concept</p>
                  <h1 #heading tabindex="-1">{{ content.title }}</h1>
                  <p class="lead">{{ content.summary }}</p>
                  <dl>
                    <div>
                      <dt>Status</dt>
                      <dd>Synthetic concept</dd>
                    </div>
                    <div>
                      <dt>Approximate context</dt>
                      <dd>{{ projectLocation(content) }}</dd>
                    </div>
                    <div>
                      <dt>Publication</dt>
                      <dd>Published revision {{ content.revision }}</dd>
                    </div>
                  </dl>
                </div>
                <div
                  class="project-hero-art portfolio-art portfolio-art-1"
                  role="img"
                  [attr.aria-label]="'Synthetic architectural study for ' + content.title"
                ></div>
              </header>
              <section class="project-narrative">
                <div>
                  <p class="eyebrow">Concept narrative</p>
                  <h2>Exploring an idea without presenting it as completed work.</h2>
                </div>
                <div>
                  <div class="rich-text" [innerHTML]="content.body_html"></div>
                  <p class="project-disclaimer">
                    This is not a client commission, completed project, property listing or
                    statement of availability.
                  </p>
                </div>
              </section>
              <section class="project-gallery-section" aria-labelledby="gallery-heading">
                <div class="section-heading">
                  <div>
                    <p class="eyebrow">Concept sequence</p>
                    <h2 id="gallery-heading">Before, during and after studies.</h2>
                  </div>
                  <p>
                    Static synthetic illustrations communicate stages without implying verified
                    construction photography.
                  </p>
                </div>
                <div class="gallery portfolio-gallery" aria-label="Concept stages">
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
              </section>
              <section class="project-enquiry-cta">
                <div>
                  <p class="eyebrow">Discuss your own property</p>
                  <h2>Use this concept as a starting point, not a promised solution.</h2>
                </div>
                <a
                  class="action"
                  routerLink="/request-quote"
                  [queryParams]="{ service: 'PROPERTY_TRANSFORMATION' }"
                  >Discuss a related property brief</a
                >
              </section>
              @if (relatedProjects().length) {
                <section class="related-projects" aria-labelledby="related-projects-heading">
                  <div class="section-heading">
                    <div>
                      <p class="eyebrow">Continue exploring</p>
                      <h2 id="related-projects-heading">Other published concepts.</h2>
                    </div>
                    <a class="text-link" routerLink="/projects">View portfolio</a>
                  </div>
                  <div>
                    @for (item of relatedProjects(); track item.id; let index = $index) {
                      <article>
                        <span
                          class="portfolio-art"
                          [class]="'portfolio-art portfolio-art-' + ((index % 3) + 1)"
                          aria-hidden="true"
                        ></span>
                        <h3>
                          <a [routerLink]="['/projects', item.slug]">{{ item.title }}</a>
                        </h3>
                        <p>{{ projectLocation(item) }}</p>
                      </article>
                    }
                  </div>
                </section>
              }
            }
          }
          @case ('cabinetry') {
            <header class="cabinetry-hero">
              <img
                src="/images/takura-cabinetry-concept.png"
                width="1536"
                height="1024"
                alt="Synthetic cabinetry concept with timber veneer doors and charcoal stone surfaces"
                fetchpriority="high"
                decoding="async"
              />
              <div class="cabinetry-hero-shade"></div>
              <div>
                <p class="eyebrow">Custom cabinetry</p>
                <h1 #heading tabindex="-1">
                  Joinery shaped around the room, material and responsibility.
                </h1>
                <p>
                  Explore briefing routes for kitchens, wardrobes, vanities, TV units and custom
                  storage. Every concept remains subject to verified measurements, scope and
                  material selection.
                </p>
                <a
                  class="action action-light"
                  routerLink="/request-quote"
                  [queryParams]="{ service: 'CABINETRY' }"
                  >Start a cabinetry brief</a
                ><small>Synthetic design concept · not completed client work</small>
              </div>
            </header>
            <section class="cabinetry-intro">
              <div>
                <p class="eyebrow">A considered fit</p>
                <h2>From a useful brief to an agreed fabrication scope.</h2>
              </div>
              <div>
                @if (content) {
                  <div class="rich-text" [innerHTML]="content.body_html"></div>
                }
                <p>
                  Choose SUPPLY_ONLY, FIX_AND_SUPPLY or UNDECIDED. Plumbing, wiring, structural
                  work, appliances and countertops are not silently included.
                </p>
              </div>
            </section>
            <section class="cabinetry-offers" aria-labelledby="cabinetry-offers-heading">
              <div class="section-heading">
                <div>
                  <p class="eyebrow">Cabinetry categories</p>
                  <h2 id="cabinetry-offers-heading">Describe the furniture the space needs.</h2>
                </div>
                <p>These are briefing categories, not stocked products or completed commissions.</p>
              </div>
              <div class="cabinetry-offer-grid">
                @for (offer of cabinetryOffers; track offer.title; let index = $index) {
                  <article>
                    <div
                      class="cabinetry-offer-art"
                      [class]="'cabinetry-offer-art cabinetry-offer-art-' + ((index % 3) + 1)"
                      aria-hidden="true"
                    ></div>
                    <span>{{ (index + 1).toString().padStart(2, '0') }}</span>
                    <h3>{{ offer.title }}</h3>
                    <p>{{ offer.description }}</p>
                    <a
                      class="text-link"
                      routerLink="/request-quote"
                      [queryParams]="{ service: 'CABINETRY' }"
                      >Include in a brief</a
                    >
                  </article>
                }
              </div>
            </section>
            <section class="cabinetry-materials">
              <div>
                <p class="eyebrow">Material direction</p>
                <h2>Record preferences without presenting samples as guaranteed stock.</h2>
                <p>
                  Material, finish, hardware and edge details can be discussed as preferences. Final
                  selections depend on confirmation, suitability and sourcing.
                </p>
              </div>
              <div class="material-swatch-grid" aria-label="Synthetic material direction studies">
                <figure>
                  <span
                    class="swatch swatch-timber"
                    role="img"
                    aria-label="Synthetic warm timber material study"
                  ></span>
                  <figcaption>Warm timber direction</figcaption>
                </figure>
                <figure>
                  <span
                    class="swatch swatch-charcoal"
                    role="img"
                    aria-label="Synthetic charcoal material study"
                  ></span>
                  <figcaption>Charcoal direction</figcaption>
                </figure>
                <figure>
                  <span
                    class="swatch swatch-neutral"
                    role="img"
                    aria-label="Synthetic neutral material study"
                  ></span>
                  <figcaption>Neutral direction</figcaption>
                </figure>
              </div>
            </section>
            <section class="cabinetry-gallery-section" aria-labelledby="cabinetry-gallery-heading">
              <div class="section-heading">
                <div>
                  <p class="eyebrow">Design studies</p>
                  <h2 id="cabinetry-gallery-heading">Details viewed at a useful scale.</h2>
                </div>
                <p>Open each synthetic study for keyboard-accessible inspection.</p>
              </div>
              <div class="cabinetry-gallery">
                @for (study of cabinetryStages; track study.label; let index = $index) {
                  <figure>
                    <button
                      type="button"
                      (click)="openCabinetryGallery(index, $event.currentTarget)"
                      [attr.aria-label]="'Open ' + study.label"
                    >
                      <span
                        class="cabinetry-study"
                        [class]="'cabinetry-study cabinetry-study-' + (index + 1)"
                        role="img"
                        [attr.aria-label]="study.alt"
                      ></span>
                    </button>
                    <figcaption>{{ study.label }}</figcaption>
                  </figure>
                }
              </div>
            </section>
            <section class="cabinetry-process">
              <div>
                <p class="eyebrow">What the brief records</p>
                <h2>Useful information, with uncertainty kept visible.</h2>
              </div>
              <ol>
                <li>
                  <span>01</span>
                  <div>
                    <strong>Category and fulfilment</strong>
                    <p>
                      Kitchen, wardrobe, vanity, TV unit or other; supply-only, fix-and-supply or
                      undecided.
                    </p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <strong>Approximate dimensions</strong>
                    <p>Early measurements remain UNVERIFIED until an agreed measurement review.</p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <strong>Materials and exclusions</strong>
                    <p>
                      Capture preferences, installation responsibility and work that remains outside
                      scope.
                    </p>
                  </div>
                </li>
              </ol>
            </section>
            <section class="cabinetry-cta">
              <div>
                <p class="eyebrow">Begin with what you know</p>
                <h2>Bring the room, intended use and material ideas into one brief.</h2>
              </div>
              <a
                class="action action-light"
                routerLink="/request-quote"
                [queryParams]="{ service: 'CABINETRY' }"
                >Request cabinetry</a
              >
            </section>
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
            <a routerLink="/">Explore available service information</a>
          }
          @default {
            <p>We could not find that published page.</p>
            <a routerLink="/">Return home</a>
          }
        }
      }
    </article>
    <ng-template #serviceDetail>
      <header class="service-detail-hero">
        <div>
          <p class="eyebrow">Service overview</p>
          <h1 #heading tabindex="-1">{{ pageTitle }}</h1>
          <p class="lead">{{ serviceSummary }}</p>
          <a
            class="action action-light"
            routerLink="/request-quote"
            [queryParams]="{ service: currentServiceCode }"
            >Discuss this service</a
          >
        </div>
        <div
          class="service-visual"
          [class]="'service-visual service-visual-' + serviceVisual"
          role="img"
          [attr.aria-label]="'Abstract synthetic material study for ' + pageTitle"
        ></div>
      </header>
      <section class="service-detail-intro">
        <div>
          <p class="eyebrow">Start with clarity</p>
          <h2>What the first conversation can establish.</h2>
        </div>
        <div>
          @if (content) {
            <div class="rich-text" [innerHTML]="content.body_html"></div>
          }
          <p>{{ serviceNote }}</p>
        </div>
      </section>
      <section class="service-scope" aria-labelledby="scope-heading">
        <p class="eyebrow">Briefing framework</p>
        <h2 id="scope-heading">Useful information to bring into scope.</h2>
        <div>
          @for (scope of serviceScope; track scope; let index = $index) {
            <article>
              <span>{{ (index + 1).toString().padStart(2, '0') }}</span>
              <h3>{{ scope }}</h3>
              <p>Record what is known now; unknown details can be clarified before quotation.</p>
            </article>
          }
        </div>
      </section>
      @if (currentServiceCode === 'PROPERTY_TRANSFORMATION') {
        <section class="service-capabilities" aria-labelledby="capabilities-heading">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Transformation capabilities</p>
              <h2 id="capabilities-heading">
                One service, shaped around the property requirement.
              </h2>
            </div>
            <p>
              Select the closest starting point. A combined requirement can retain more than one
              capability in a single quotation brief.
            </p>
          </div>
          <div class="service-index-grid">
            @for (capability of propertyCapabilities; track capability.code; let index = $index) {
              <article [attr.id]="capability.anchor">
                <span>{{ (index + 1).toString().padStart(2, '0') }}</span>
                <div
                  class="service-index-art"
                  [class]="'service-index-art art-' + ((index % 4) + 1)"
                  aria-hidden="true"
                ></div>
                <h3>{{ capability.title }}</h3>
                <p>{{ capability.summary }}</p>
                <a
                  class="text-link"
                  routerLink="/request-quote"
                  [queryParams]="{ service: capability.code }"
                  >Request {{ capability.title.toLowerCase() }}</a
                >
              </article>
            }
          </div>
        </section>
      }
      <section class="service-gallery" aria-label="Synthetic service material studies">
        <figure>
          <div
            class="service-study study-1"
            role="img"
            [attr.aria-label]="'Abstract structural study for ' + pageTitle"
          ></div>
          <figcaption>Structure and existing conditions · synthetic study</figcaption>
        </figure>
        <figure>
          <div
            class="service-study study-2"
            role="img"
            [attr.aria-label]="'Abstract spatial study for ' + pageTitle"
          ></div>
          <figcaption>Space, material and junctions · synthetic study</figcaption>
        </figure>
        <figure>
          <div
            class="service-study study-3"
            role="img"
            [attr.aria-label]="'Abstract detail study for ' + pageTitle"
          ></div>
          <figcaption>Scope and detail coordination · synthetic study</figcaption>
        </figure>
      </section>
      <section class="related-services" aria-labelledby="related-heading">
        <div>
          <p class="eyebrow">Related routes</p>
          <h2 id="related-heading">Build a connected brief.</h2>
        </div>
        <nav aria-label="Related services">
          @for (service of relatedServices(); track service.path) {
            <a [routerLink]="service.path">{{ service.title }}<span aria-hidden="true">→</span></a>
          }
        </nav>
      </section>
      <section class="service-final-cta">
        <p class="eyebrow">Next step</p>
        <h2>Describe the requirement without committing to an unverified solution.</h2>
        <a
          class="action action-light"
          routerLink="/request-quote"
          [queryParams]="{ service: currentServiceCode }"
          >Start the service brief</a
        >
      </section>
    </ng-template>
    <dialog
      #galleryDialog
      class="gallery-dialog"
      aria-labelledby="gallery-title"
      (cancel)="closeGallery()"
    >
      <h2 id="gallery-title">Concept illustration</h2>
      <p aria-live="polite">
        Image {{ activeStage + 1 }} of {{ activeGalleryStages.length }}:
        {{ activeGalleryStages[activeStage].label }}
      </p>
      <div
        class="placeholder dialog-image"
        [class]="activeGalleryStages[activeStage].className"
        role="img"
        [attr.aria-label]="activeGalleryStages[activeStage].alt"
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
  projectItems: PublicContent[] = [];
  content?: PublicContent;
  serviceSummary = '';
  currentServiceCode = 'PROPERTY_TRANSFORMATION';
  serviceVisual = 'property';
  serviceNote = '';
  serviceScope: string[] = [];
  readonly topLevelServices = [
    {
      title: 'Property transformation',
      path: '/services/property-transformation',
      summary:
        'Develop, construct, renovate, extend, convert and maintain property through one coordinated, evidence-led service.',
    },
    {
      title: 'Cabinetry & custom interiors',
      path: '/cabinetry',
      summary:
        'Plan kitchens, wardrobes, vanities and fitted storage through clear supply-only or fix-and-supply routes.',
    },
    {
      title: 'Board supply & cutting',
      path: '/boards',
      summary:
        'Browse published full-sheet specifications or request qualified cut-to-size assistance without inventory claims.',
    },
    {
      title: 'Supporting hardware',
      path: '/hardware',
      summary:
        'Include compatible hardware and material supplies in a considered quotation request without creating a cart.',
    },
  ];
  readonly propertyCapabilities = [
    {
      title: 'Construction',
      code: 'CONSTRUCTION',
      anchor: 'construction',
      summary:
        'Define intended building work, site constraints, plans and qualification needs before scope is agreed.',
    },
    {
      title: 'Renovations',
      code: 'RENOVATION',
      anchor: 'renovations',
      summary:
        'Clarify affected spaces, retained elements, priorities and existing conditions before committing to an outcome.',
    },
    {
      title: 'Extensions',
      code: 'EXTENSION',
      anchor: 'extensions',
      summary:
        'Explore additional space with early attention to the existing structure, access, approvals and dependencies.',
    },
    {
      title: 'Property conversions',
      code: 'PROPERTY_TRANSFORMATION',
      anchor: 'conversions',
      summary:
        'Frame a change-of-use or spatial transformation discussion without assuming feasibility or approval.',
    },
    {
      title: 'Maintenance',
      code: 'MAINTENANCE',
      anchor: 'maintenance',
      summary:
        'Record repair and upkeep requirements with honest service-area, access and timing qualification.',
    },
    {
      title: 'Interiors',
      code: 'INTERIORS',
      anchor: 'interiors',
      summary:
        'Coordinate internal spatial and finish requirements where they form part of the broader transformation brief.',
    },
  ];
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
  readonly cabinetryStages = [
    {
      label: 'Kitchen composition study',
      alt: 'Synthetic study of cabinetry proportions and work-surface relationships',
      className: 'cabinetry-dialog-1',
    },
    {
      label: 'Wardrobe storage study',
      alt: 'Synthetic study of full-height wardrobe storage divisions',
      className: 'cabinetry-dialog-2',
    },
    {
      label: 'Joinery detail study',
      alt: 'Synthetic study of timber, charcoal and neutral joinery details',
      className: 'cabinetry-dialog-3',
    },
  ];
  activeGalleryStages = this.stages;
  readonly cabinetryOffers = [
    {
      title: 'Kitchens',
      description:
        'Brief storage, preparation zones, appliance interfaces and fulfilment responsibility.',
    },
    {
      title: 'Wardrobes',
      description:
        'Describe room constraints, internal storage priorities, door direction and finish ideas.',
    },
    {
      title: 'Vanities',
      description:
        'Record intended storage and basin context while keeping plumbing outside unagreed scope.',
    },
    {
      title: 'TV units',
      description:
        'Explore display, storage and cable-management requirements without including wiring work.',
    },
    {
      title: 'Custom storage',
      description:
        'Use an OTHER explanation for fitted furniture that does not belong to a standard category.',
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
    const relatedProjects = this.route.snapshot.data['relatedProjects'] as
      | PublicContentPage
      | undefined;
    if (relatedProjects) this.projectItems = relatedProjects.items;
    if (this.kind === 'service-overview') {
      this.configureService(
        this.route.snapshot.data['serviceCode'],
        this.route.snapshot.data['summary'],
        this.route.snapshot.data['scope'],
        this.route.snapshot.data['note'],
      );
    } else if (this.kind === 'service' && this.content) {
      const code = this.serviceCode(this.content.slug);
      this.configureService(code, this.content.summary);
    }
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
  relatedServices() {
    const currentPath = '/' + this.route.snapshot.url.map((segment) => segment.path).join('/');
    return this.topLevelServices.filter((service) => service.path !== currentPath);
  }
  relatedProjects() {
    return this.projectItems.filter((item) => item.id !== this.content?.id).slice(0, 2);
  }
  projectLocation(item: PublicContent) {
    try {
      const metadata = JSON.parse(item.metadata_json) as Record<string, unknown>;
      const location = metadata['approximate_location'];
      return typeof location === 'string' && location.trim() ? location : 'Concept context';
    } catch {
      return 'Concept context';
    }
  }
  private configureService(code: string, summary?: string, scope?: string[], note?: string) {
    this.currentServiceCode = code || 'PROPERTY_TRANSFORMATION';
    this.serviceSummary =
      summary || 'Begin with a clear, evidence-led brief before scope is agreed.';
    this.serviceVisual = this.serviceVisualFor(this.currentServiceCode);
    this.serviceScope = scope?.length ? scope : this.defaultServiceScope(this.currentServiceCode);
    this.serviceNote =
      note ||
      'Final scope, programme and responsibilities depend on verified requirements, existing conditions and any applicable approvals.';
  }
  private serviceVisualFor(code: string) {
    if (code === 'CABINETRY') return 'cabinetry';
    if (code === 'BOARD_SALES' || code === 'BOARD_CUTTING') return 'boards';
    if (code === 'RENOVATION' || code === 'MAINTENANCE') return 'renovation';
    if (code === 'CONSTRUCTION' || code === 'EXTENSION') return 'construction';
    return 'property';
  }
  private defaultServiceScope(code: string) {
    const scopes: Record<string, string[]> = {
      CONSTRUCTION: [
        'Intended work and current site',
        'Access, timing and known constraints',
        'Available drawings and approval status',
      ],
      RENOVATION: [
        'Affected rooms and existing condition',
        'Priorities, finishes and retained elements',
        'Access, occupancy and desired timing',
      ],
      EXTENSION: [
        'Additional space and intended use',
        'Existing structure and site access',
        'Plans, approvals and service connections',
      ],
      MAINTENANCE: [
        'Affected area and observed issue',
        'Urgency without emergency assumptions',
        'Access and preferred contact route',
      ],
      CABINETRY: [
        'Product category and fulfilment route',
        'Approximate dimensions and material ideas',
        'Installation scope and explicit exclusions',
      ],
      BOARD_SALES: [
        'Material, finish and thickness',
        'Sheet size, quantity and collection intent',
        'Substitute preference and availability wording',
      ],
      PROPERTY_TRANSFORMATION: [
        'Property status and intended use',
        'Existing buildings and available land',
        'Known plans, constraints and approval status',
      ],
    };
    return (
      scopes[code] ?? [
        'Requirement and intended outcome',
        'Known constraints and dependencies',
        'Timing, location and available evidence',
      ]
    );
  }
  private updateMetadata(
    description = `Synthetic demonstration: ${this.pageTitle}. No unverified business claims.`,
  ) {
    const title = `${this.pageTitle} | Takura Muzenda Property Transformation`;
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
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
    this.meta.updateTag({ property: 'og:url', content: canonical.href });
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
    this.activeGalleryStages = this.stages;
    this.activeStage = index;
    this.returnFocus = source instanceof HTMLElement ? source : undefined;
    this.galleryDialog?.nativeElement.showModal();
  }
  openCabinetryGallery(index: number, source: EventTarget | null) {
    this.activeGalleryStages = this.cabinetryStages;
    this.activeStage = index;
    this.returnFocus = source instanceof HTMLElement ? source : undefined;
    this.galleryDialog?.nativeElement.showModal();
  }
  closeGallery() {
    this.galleryDialog?.nativeElement.close();
    this.returnFocus?.focus();
  }
  next() {
    this.activeStage = (this.activeStage + 1) % this.activeGalleryStages.length;
  }
  previous() {
    this.activeStage =
      (this.activeStage + this.activeGalleryStages.length - 1) % this.activeGalleryStages.length;
  }
}
