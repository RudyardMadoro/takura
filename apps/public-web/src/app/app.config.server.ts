import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { PUBLIC_API_ORIGIN } from './content-api.service';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: PUBLIC_API_ORIGIN,
      useValue: process.env['TAKURA_API_ORIGIN'] ?? 'http://127.0.0.1:8080',
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
