import { RenderMode, ServerRoute } from '@angular/ssr';
const staticPaths = [
  '',
  'property-transformation',
  'services',
  'projects',
  'cabinetry',
  'about',
  'contact',
  'faqs',
  'privacy',
  'terms',
  'boards',
  'workshop/board-cutting',
  'hardware',
  'request-quote',
];
export const serverRoutes: ServerRoute[] = [
  ...staticPaths.map((path) => ({ path, renderMode: RenderMode.Prerender }) as ServerRoute),
  { path: 'services/:slug', renderMode: RenderMode.Server },
  { path: 'projects/:slug', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
