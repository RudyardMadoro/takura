import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-video',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="home-hero hero-video" role="region" aria-label="Takura Properties introduction">
      <img
        class="hero-media hero-video-poster"
        src="/images/takura-home-hero-concept.png"
        width="1944"
        height="817"
        alt="Synthetic concept of a transformed contemporary home"
        fetchpriority="high"
        decoding="async"
      />
      <video
        #heroVideo
        class="hero-media hero-video-background"
        [class.is-playing]="playing()"
        [class.has-error]="failed()"
        poster="/images/takura-home-hero-concept.png"
        preload="metadata"
        autoplay
        muted
        loop
        playsinline
        aria-hidden="true"
        tabindex="-1"
        (playing)="playing.set(true)"
        (pause)="playing.set(false)"
        (error)="handleVideoError()"
      >
        <source src="/videos/property-transformation-story.webm" type="video/webm" />
        <source src="/videos/property-transformation-story.mp4" type="video/mp4" />
      </video>

      <div class="home-hero-overlay"></div>
      <div class="home-hero-copy hero-video-copy">
        <p class="eyebrow">Takura Properties</p>
        <h1 tabindex="-1">We Transform Spaces.<br />We Create Possibilities.</h1>
        <p>
          From property renovations and construction to custom cabinetry and beautiful interiors, we
          bring your vision to life.
        </p>
        <div class="home-actions">
          <a class="action action-light" routerLink="/" fragment="services">Explore Our Services</a>
          <a class="text-link" routerLink="/request-quote">Start Your Project</a>
        </div>
        <p class="concept-note">Synthetic transformation concept · not completed client work</p>
      </div>
    </section>
  `,
})
export class HeroVideoComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  @ViewChild('heroVideo') private heroVideo?: ElementRef<HTMLVideoElement>;
  private motionQuery?: MediaQueryList;
  private pageHidden = false;
  private reducedMotion = false;

  readonly playing = signal(false);
  readonly failed = signal(false);

  private readonly handleVisibility = () => {
    this.pageHidden = document.hidden;
    this.syncPlayback();
  };

  private readonly handleMotionPreference = (event: MediaQueryListEvent) => {
    this.reducedMotion = event.matches;
    this.syncPlayback();
  };

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.motionQuery.matches;
    this.pageHidden = document.hidden;
    this.motionQuery.addEventListener('change', this.handleMotionPreference);
    document.addEventListener('visibilitychange', this.handleVisibility);
    this.syncPlayback();
  }

  ngOnDestroy() {
    this.motionQuery?.removeEventListener('change', this.handleMotionPreference);
    if (!isPlatformBrowser(this.platformId)) return;
    document.removeEventListener('visibilitychange', this.handleVisibility);
    this.heroVideo?.nativeElement.pause();
  }

  handleVideoError() {
    this.failed.set(true);
    this.playing.set(false);
  }

  private syncPlayback() {
    const video = this.heroVideo?.nativeElement;
    if (!video) return;
    if (this.pageHidden || this.reducedMotion || this.failed()) {
      video.pause();
      return;
    }
    void video.play().catch(() => this.playing.set(false));
  }
}
