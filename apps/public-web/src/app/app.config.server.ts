import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { PUBLIC_API_ORIGIN } from './content-api.service';
import { PUBLIC_SITE_MODE, PublicSiteMode } from './site-mode';

const configuredMode = (process.env['TAKURA_PUBLIC_SITE_MODE'] ?? 'DEMO').toUpperCase();
const publicSiteMode: PublicSiteMode =
  configuredMode === 'PRODUCTION' || configuredMode === 'STAGING' ? configuredMode : 'DEMO';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: PUBLIC_API_ORIGIN,
      useValue: process.env['TAKURA_API_ORIGIN'] ?? 'http://127.0.0.1:8080',
    },
    { provide: PUBLIC_SITE_MODE, useValue: publicSiteMode },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
