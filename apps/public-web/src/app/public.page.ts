import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-public-page',
  template: ` <article class="page">
    <p class="eyebrow">Demonstration content</p>
    <h1 tabindex="-1">{{ heading }}</h1>
    @switch (kind) {
      @case ('home') {
        <p class="lead">
          Three clear offers: property transformation, custom cabinetry and standalone board supply.
        </p>
        <section class="cards">
          <a routerLink="/property-transformation"
            ><h2>Property transformation</h2>
            <p>
              Assessment-led feasibility and delivery planning without approval or return promises.
            </p></a
          ><a routerLink="/cabinetry"
            ><h2>Custom cabinetry</h2>
            <p>Supply-only or fix-and-supply routes.</p></a
          ><a class="timber" routerLink="/boards"
            ><h2>Standalone board supply</h2>
            <p>
              A prominent quotation-only proposition. Live catalogue data arrives in Phase 04.
            </p></a
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
          Explore a possible transformation through evidence, feasibility and the approvals
          applicable to the site.
        </p>
        <h2>What an assessment can cover</h2>
        <p>
          Existing conditions, constraints, concept options, indicative scope and next steps. It
          does not promise legal unit counts, permission, income or regulated professional services.
        </p>
      }
      @case ('services') {
        @for (card of services; track card.slug) {
          <section class="card">
            <h2>
              <a [routerLink]="['/services', card.slug]">{{ card.title }}</a>
            </h2>
            <p>{{ card.text }}</p>
          </section>
        }
      }
      @case ('service') {
        <p class="lead">{{ serviceText }}</p>
        <h2>Process</h2>
        <p>Brief, constraints, scoped proposal and confirmed next step.</p>
      }
      @case ('projects') {
        @for (project of projects; track project.slug) {
          <article class="card">
            <p class="tag">Owner-development concept · synthetic</p>
            <h2>
              <a [routerLink]="['/projects', project.slug]">{{ project.title }}</a>
            </h2>
            <p>{{ project.text }}</p>
          </article>
        }
      }
      @case ('project') {
        <p class="tag">Owner-development concept · not a client commission · not completed work</p>
        <p class="lead">{{ projectText }}</p>
        <div class="gallery" aria-label="Concept stages">
          <figure>
            <div
              class="placeholder"
              role="img"
              aria-label="Abstract before-stage placeholder illustration"
            ></div>
            <figcaption>Before concept</figcaption>
          </figure>
          <figure>
            <div
              class="placeholder during"
              role="img"
              aria-label="Abstract during-stage placeholder illustration"
            ></div>
            <figcaption>During concept</figcaption>
          </figure>
          <figure>
            <div
              class="placeholder after"
              role="img"
              aria-label="Abstract after-stage placeholder illustration"
            ></div>
            <figcaption>After concept</figcaption>
          </figure>
        </div>
      }
      @case ('cabinetry') {
        <p class="lead">
          Cabinetry is offered as SUPPLY_ONLY or FIX_AND_SUPPLY after the brief and site constraints
          are confirmed.
        </p>
        <h2>Material-led decisions</h2>
        <p>Layout, hardware, finish and installation responsibility are recorded separately.</p>
      }
      @case ('about') {
        <p>
          No owner biography, team credential, accreditation, workshop capacity or trading claim is
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
          <p>No. The commercial route is visible, but catalogue records arrive in Phase 04.</p>
        </details>
        <details>
          <summary>Are the projects completed client work?</summary>
          <p>No. They are visibly synthetic owner-development concepts.</p>
        </details>
        <details>
          <summary>Are approvals guaranteed?</summary>
          <p>
            No. Feasibility and approval requirements depend on verified site facts and relevant
            authorities.
          </p>
        </details>
      }
      @case ('privacy') {
        <p>
          This demonstration collects no public contact submission in this phase. A confirmed
          privacy notice must identify the real business, processors, purposes, retention and rights
          process before launch.
        </p>
      }
      @case ('terms') {
        <p>
          Demonstration content is not an offer, price, stock statement, professional credential or
          promise of approval or return.
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
  </article>`,
})
export class PublicPage {
  private route = inject(ActivatedRoute);
  private title = inject(Title);
  private meta = inject(Meta);
  kind = '';
  heading = '';
  services = [
    {
      slug: 'property-transformation',
      title: 'Property transformation',
      text: 'Feasibility and assessment-led planning.',
    },
    {
      slug: 'custom-cabinetry',
      title: 'Custom cabinetry',
      text: 'Supply-only and fix-and-supply options.',
    },
    {
      slug: 'standalone-board-supply',
      title: 'Standalone board supply',
      text: 'Quotation-only positioning; catalogue pending.',
    },
  ];
  projects = [
    {
      slug: 'compact-home-concept',
      title: 'Compact home concept',
      text: 'Approximate Gauteng concept area.',
    },
    {
      slug: 'storage-renewal-concept',
      title: 'Storage renewal concept',
      text: 'Synthetic cabinetry narrative.',
    },
    {
      slug: 'workshop-material-concept',
      title: 'Workshop material concept',
      text: 'No stock or capacity claims.',
    },
  ];
  constructor() {
    this.route.data.subscribe((d) => {
      this.kind = d['kind'];
      this.heading = d['title'];
      this.title.setTitle(`${this.heading} | Example Property Transformation`);
      this.meta.updateTag({
        name: 'description',
        content: `Synthetic demonstration: ${this.heading}. No unverified business claims.`,
      });
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow, noarchive' });
      this.meta.updateTag({
        rel: 'canonical',
        content:
          'https://example.invalid' + this.route.snapshot.url.map((x) => '/' + x.path).join(''),
      } as any);
    });
  }
  get serviceText() {
    return (
      this.services.find((x) => x.slug === this.route.snapshot.paramMap.get('slug'))?.text ??
      'Published service unavailable.'
    );
  }
  get projectText() {
    return (
      this.projects.find((x) => x.slug === this.route.snapshot.paramMap.get('slug'))?.text ??
      'Published project unavailable.'
    );
  }
}
