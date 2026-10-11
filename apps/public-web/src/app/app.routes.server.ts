import { RenderMode, ServerRoute } from '@angular/ssr';
const staticPaths = [
  '',
  'property-transformation',
  'cabinetry',
  'about',
  'contact',
  'faqs',
  'privacy',
  'terms',
  'workshop/board-cutting',
  'request-quote',
];
export const serverRoutes: ServerRoute[] = [
  ...staticPaths.map((path) => ({ path, renderMode: RenderMode.Prerender }) as ServerRoute),
  { path: 'services', renderMode: RenderMode.Server },
  { path: 'projects', renderMode: RenderMode.Server },
  { path: 'services/:slug', renderMode: RenderMode.Server },
  { path: 'projects/:slug', renderMode: RenderMode.Server },
  { path: 'boards', renderMode: RenderMode.Server },
  { path: 'boards/:slug', renderMode: RenderMode.Server },
  { path: 'hardware', renderMode: RenderMode.Server },
  { path: 'request-quote', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
