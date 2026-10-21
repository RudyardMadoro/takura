import { Routes } from '@angular/router';
import { PublicPage } from './public.page';
import { publicContentResolver } from './content-api.service';
import { CataloguePage } from './catalogue.page';
import { QuotePage } from './quote.page';
import { catalogueResolver } from './catalogue-api.service';
import { CustomerQuotePage } from './customer-quote.page';
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
  {
    path: 'services',
    component: PublicPage,
    data: { kind: 'services', title: 'Services' },
    resolve: { publicContent: publicContentResolver },
  },
  {
    path: 'services/:slug',
    component: PublicPage,
    data: { kind: 'service', title: 'Service detail' },
    resolve: { publicContent: publicContentResolver },
  },
  {
    path: 'projects',
    component: PublicPage,
    data: { kind: 'projects', title: 'Synthetic owner-development concepts' },
    resolve: { publicContent: publicContentResolver },
  },
  {
    path: 'projects/:slug',
    component: PublicPage,
    data: { kind: 'project', title: 'Owner-development concept' },
    resolve: { publicContent: publicContentResolver },
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
    component: CataloguePage,
    data: { kind: 'boards', title: 'Standalone board catalogue' },
    resolve: { catalogue: catalogueResolver },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
  {
    path: 'boards/:slug',
    component: CataloguePage,
    data: { kind: 'board', title: 'Board detail' },
    resolve: { catalogue: catalogueResolver },
  },
  {
    path: 'workshop/board-cutting',
    component: PublicPage,
    data: { kind: 'upcoming', title: 'Board cutting coming in Phase 05' },
  },
  {
    path: 'hardware',
    component: CataloguePage,
    data: { kind: 'hardware', title: 'Supporting hardware' },
    resolve: { catalogue: catalogueResolver },
  },
  {
    path: 'request-quote',
    component: QuotePage,
    data: { title: 'Request full board sheets' },
  },
  { path: 'quote/view', component: CustomerQuotePage, data: { title: 'Private quotation' } },
  { path: '**', component: PublicPage, data: { kind: 'notfound', title: 'Page not found' } },
];
