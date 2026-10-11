import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';

export type PublicSiteMode = 'DEMO' | 'STAGING' | 'PRODUCTION';

function modeFromDocument(): PublicSiteMode {
  const value = inject(DOCUMENT)
    .querySelector<HTMLMetaElement>('meta[name="takura-environment"]')
    ?.content.toUpperCase();
  return value === 'PRODUCTION' || value === 'STAGING' ? value : 'DEMO';
}

export const PUBLIC_SITE_MODE = new InjectionToken<PublicSiteMode>('PUBLIC_SITE_MODE', {
  providedIn: 'root',
  factory: modeFromDocument,
});

export const isNonProduction = (mode: PublicSiteMode) => mode !== 'PRODUCTION';
