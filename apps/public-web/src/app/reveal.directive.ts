import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';

@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const host = this.element.nativeElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      host.classList.add('reveal-visible');
      return;
    }

    host.classList.add('reveal-ready');
    if (!('IntersectionObserver' in window)) {
      host.classList.add('reveal-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        host.classList.add('reveal-visible');
        this.observer?.unobserve(host);
      },
      { rootMargin: '0px 0px 12% 0px', threshold: 0.01 },
    );
    this.observer.observe(host);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
