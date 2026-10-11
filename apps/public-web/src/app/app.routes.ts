import { Routes } from '@angular/router';
import { PublicPage } from './public.page';
export const routes: Routes = [
  {
    path: '',
    component: PublicPage,
    data: { kind: 'home', title: 'Property transformation, cabinetry and board supply' },
  },
  {
    path: 'property-transformation',
    component: PublicPage,
    data: { kind: 'property', title: 'Property transformation' },
  },
  { path: 'services', component: PublicPage, data: { kind: 'services', title: 'Services' } },
  {
    path: 'services/:slug',
    component: PublicPage,
    data: { kind: 'service', title: 'Service detail' },
  },
  {
    path: 'projects',
    component: PublicPage,
    data: { kind: 'projects', title: 'Synthetic owner-development concepts' },
  },
  {
    path: 'projects/:slug',
    component: PublicPage,
    data: { kind: 'project', title: 'Owner-development concept' },
  },
  {
    path: 'cabinetry',
    component: PublicPage,
    data: { kind: 'cabinetry', title: 'Custom cabinetry' },
  },
  {
    path: 'about',
    component: PublicPage,
    data: { kind: 'about', title: 'About this demonstration' },
  },
  { path: 'contact', component: PublicPage, data: { kind: 'contact', title: 'Contact' } },
  {
    path: 'faqs',
    component: PublicPage,
    data: { kind: 'faqs', title: 'Frequently asked questions' },
  },
  { path: 'privacy', component: PublicPage, data: { kind: 'privacy', title: 'Privacy notice' } },
  { path: 'terms', component: PublicPage, data: { kind: 'terms', title: 'Terms' } },
  {
    path: 'boards',
    component: PublicPage,
    data: { kind: 'upcoming', title: 'Board catalogue coming in Phase 04' },
  },
  {
    path: 'workshop/board-cutting',
    component: PublicPage,
    data: { kind: 'upcoming', title: 'Board cutting coming in Phase 05' },
  },
  {
    path: 'hardware',
    component: PublicPage,
    data: { kind: 'upcoming', title: 'Hardware catalogue unavailable' },
  },
  {
    path: 'request-quote',
    component: PublicPage,
    data: { kind: 'upcoming', title: 'Quote requests coming in Phase 05' },
  },
  { path: '**', component: PublicPage, data: { kind: 'notfound', title: 'Page not found' } },
];
