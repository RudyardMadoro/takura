import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface HeroSlide {
  readonly image: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly eyebrow: string;
  readonly headline: string;
  readonly description: string;
  readonly primary: { readonly label: string; readonly path: string; readonly service?: string };
  readonly secondary: { readonly label: string; readonly path: string; readonly service?: string };
}

const AUTOPLAY_INTERVAL_MS = 7_000;

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section
      class="home-hero hero-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Takura Muzenda services"
      (pointerdown)="markPointerInteraction()"
      (focusin)="pauseForFocus()"
      (focusout)="resumeAfterFocus($event)"
    >
      @for (slide of slides; track slide.image; let index = $index) {
        <article
          class="hero-slide"
          [class.is-active]="activeIndex() === index"
          [attr.data-slide-index]="index"
          role="group"
          aria-roledescription="slide"
          [attr.aria-label]="index + 1 + ' of ' + slides.length"
          [attr.aria-hidden]="activeIndex() === index ? null : 'true'"
          [attr.inert]="activeIndex() === index ? null : ''"
        >
          <img
            class="hero-slide-image"
            [src]="slide.image"
            [attr.width]="slide.width"
            [attr.height]="slide.height"
            [alt]="slide.alt"
            [attr.fetchpriority]="index === 0 ? 'high' : 'low'"
            loading="eager"
            decoding="async"
          />
          <div class="home-hero-overlay"></div>
          <div class="home-hero-copy hero-slide-copy">
            <p class="eyebrow">{{ slide.eyebrow }}</p>
            @if (index === 0) {
              <h1 tabindex="-1">{{ slide.headline }}</h1>
            } @else {
              <h2 class="hero-heading">{{ slide.headline }}</h2>
            }
            <p>{{ slide.description }}</p>
            <div class="home-actions">
              <a
                class="action action-light"
                [routerLink]="slide.primary.path"
                [queryParams]="slide.primary.service ? { service: slide.primary.service } : null"
                [attr.tabindex]="activeIndex() === index ? null : -1"
                >{{ slide.primary.label }}</a
              >
              <a
                class="text-link"
                [routerLink]="slide.secondary.path"
                [queryParams]="
                  slide.secondary.service ? { service: slide.secondary.service } : null
                "
                [attr.tabindex]="activeIndex() === index ? null : -1"
                >{{ slide.secondary.label }}</a
              >
            </div>
            <p class="concept-note">Synthetic architectural concept · not completed client work</p>
          </div>
        </article>
      }

      <div class="hero-carousel-indicators" aria-label="Choose hero slide">
        @for (slide of slides; track slide.image; let index = $index) {
          <button
            type="button"
            [class.active]="activeIndex() === index"
            [attr.aria-label]="'Show slide ' + (index + 1) + ': ' + slide.headline"
            [attr.aria-pressed]="activeIndex() === index"
            (click)="select(index)"
          >
            <span aria-hidden="true"></span>
          </button>
        }
      </div>
    </section>
  `,
})
export class HeroCarouselComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private timer?: number;
  private pointerResetTimer?: number;
  private pointerInteraction = false;
  private focusPaused = false;
  private pageHidden = false;
  private reducedMotion = false;
  private motionQuery?: MediaQueryList;

  readonly activeIndex = signal(0);
  readonly slides: readonly HeroSlide[] = [
    {
      image: '/images/takura-home-hero-concept.png',
      width: 1944,
      height: 817,
      alt: 'Synthetic concept of a contemporary home with charcoal walls, timber screening and indigenous landscaping',
      eyebrow: 'Property · interiors · materials',
      headline: 'Thoughtful spaces, shaped around real constraints.',
      description:
        'Explore property transformation, construction, cabinetry and standalone board supply through one considered enquiry process.',
      primary: { label: 'Start a project brief', path: '/request-quote' },
      secondary: { label: 'Explore concepts', path: '/projects' },
    },
    {
      image: '/images/hero-property-transformation.webp',
      width: 1680,
      height: 945,
      alt: 'Synthetic concept of a contemporary transformed property in warm evening light',
      eyebrow: 'Property transformation · construction',
      headline: 'Transforming properties. Creating possibilities.',
      description:
        'From renovations and extensions to complete property conversions, we turn existing spaces into functional, modern and valuable properties.',
      primary: {
        label: 'Explore property transformation',
        path: '/services/property-transformation',
      },
      secondary: {
        label: 'Request a quote',
        path: '/request-quote',
        service: 'PROPERTY_TRANSFORMATION',
      },
    },
    {
      image: '/images/hero-custom-cabinetry.webp',
      width: 1680,
      height: 945,
      alt: 'Synthetic concept of a premium timber kitchen with stone island and warm natural light',
      eyebrow: 'Custom cabinetry · interior solutions',
      headline: 'Beautifully crafted spaces. Built around you.',
      description:
        'Discover custom kitchens, wardrobes, vanities and cabinetry designed to combine craftsmanship, functionality and timeless appeal.',
      primary: { label: 'Explore cabinetry', path: '/cabinetry' },
      secondary: { label: 'Request a quote', path: '/request-quote', service: 'CABINETRY' },
    },
  ];

  private readonly handleVisibility = () => {
    this.pageHidden = document.hidden;
    this.restartAutoplay();
  };

  private readonly handleMotionPreference = (event: MediaQueryListEvent) => {
    this.reducedMotion = event.matches;
    this.restartAutoplay();
  };

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.motionQuery.matches;
    this.motionQuery.addEventListener('change', this.handleMotionPreference);
    document.addEventListener('visibilitychange', this.handleVisibility);
    this.restartAutoplay();
  }

  ngOnDestroy() {
    this.clearTimer();
    if (this.pointerResetTimer !== undefined) window.clearTimeout(this.pointerResetTimer);
    this.motionQuery?.removeEventListener('change', this.handleMotionPreference);
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('visibilitychange', this.handleVisibility);
    }
  }

  select(index: number) {
    this.show(index);
  }

  markPointerInteraction() {
    this.pointerInteraction = true;
    if (this.pointerResetTimer !== undefined) window.clearTimeout(this.pointerResetTimer);
    this.pointerResetTimer = window.setTimeout(() => {
      this.pointerInteraction = false;
      this.pointerResetTimer = undefined;
    }, 0);
  }

  pauseForFocus() {
    if (this.pointerInteraction) {
      this.pointerInteraction = false;
      return;
    }
    this.focusPaused = true;
    this.clearTimer();
  }

  resumeAfterFocus(event: FocusEvent) {
    const carousel = event.currentTarget as HTMLElement;
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && carousel.contains(nextTarget)) return;
    this.focusPaused = false;
    this.restartAutoplay();
  }

  private show(index: number) {
    this.activeIndex.set(index);
    this.restartAutoplay();
  }

  private restartAutoplay() {
    this.clearTimer();
    if (
      !isPlatformBrowser(this.platformId) ||
      this.focusPaused ||
      this.pageHidden ||
      this.reducedMotion
    ) {
      return;
    }
    this.timer = window.setTimeout(() => {
      this.activeIndex.update((index) => (index + 1) % this.slides.length);
      this.restartAutoplay();
    }, AUTOPLAY_INTERVAL_MS);
  }

  private clearTimer() {
    if (this.timer === undefined) return;
    window.clearTimeout(this.timer);
    this.timer = undefined;
  }
}
