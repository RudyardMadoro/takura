import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render accessible site navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/public/config')
      .flush({
        environment: 'DEMO',
        contact: { email: 'contact@example.invalid', phone: '' },
      });
    expect(compiled.querySelector('.brand-logo-compact')?.getAttribute('alt')).toBe(
      'Takura Muzenda Property Transformation',
    );
    expect(compiled.querySelector('.footer-brand img')?.getAttribute('alt')).toContain(
      'Plan, Transform, Enhance, Create Value',
    );
    expect(compiled.querySelector('nav[aria-label="Main navigation"]')).toBeTruthy();
    expect(compiled.querySelector('nav[aria-label="Business divisions"]')).toBeTruthy();
    expect(compiled.querySelector('.footer-contact')?.textContent).toContain(
      'Verified business contact details are pending',
    );
  });

  it('renders configured verified contact details', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/public/config')
      .flush({
        environment: 'CONFIRMED',
        contact: { email: 'studio@takura.test', phone: '+27110000000' },
      });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[href="mailto:studio@takura.test"]')).toBeTruthy();
    expect(compiled.querySelector('a[href="tel:+27110000000"]')).toBeTruthy();
  });
});
