import { Routes } from '@angular/router';
import { PublicPage } from './public.page';
import {
  homeProjectsResolver,
  cabinetryContentResolver,
  publicContentResolver,
  relatedProjectsResolver,
} from './content-api.service';
import { CataloguePage } from './catalogue.page';
import { QuotePage } from './quote.page';
import { catalogueResolver } from './catalogue-api.service';
import { CustomerQuotePage } from './customer-quote.page';
export const routes: Routes = [
  {
    path: '',
    component: PublicPage,
    data: { kind: 'home', title: 'Property transformation, cabinetry and board supply' },
    resolve: { homeProjects: homeProjectsResolver },
  },
  {
    path: 'property-transformation',
    redirectTo: 'services/property-transformation',
    pathMatch: 'full',
  },
  {
    path: 'services',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'services/construction',
    component: PublicPage,
    data: {
      kind: 'service-overview',
      title: 'Construction',
      serviceCode: 'CONSTRUCTION',
      summary:
        'Start with the intended work, known constraints and the information needed to define a responsible construction scope.',
      scope: [
        'Project intent and work type',
        'Known site and access constraints',
        'Plans, approvals and information still required',
      ],
      note: 'A submitted brief is not a construction commitment, programme or approval confirmation.',
    },
  },
  {
    path: 'services/renovations',
    component: PublicPage,
    data: {
      kind: 'service-overview',
      title: 'Renovations',
      serviceCode: 'RENOVATION',
      summary:
        'Describe the spaces to be renewed, the desired outcome and the existing conditions that need review.',
      scope: [
        'Affected rooms or areas',
        'Existing-condition information',
        'Priorities, desired timing and dependencies',
      ],
      note: 'Existing conditions and hidden work must be verified before scope can be agreed.',
    },
  },
  {
    path: 'services/extensions',
    component: PublicPage,
    data: {
      kind: 'service-overview',
      title: 'Extensions',
      serviceCode: 'EXTENSION',
      summary:
        'Explore additional space through an approval-aware brief grounded in the existing property and intended use.',
      scope: [
        'Intended additional space',
        'Relationship to the existing building',
        'Plans, approvals and site facts to verify',
      ],
      note: 'No permissible area, approval outcome or construction solution is promised before assessment.',
    },
  },
  {
    path: 'services/conversions',
    component: PublicPage,
    data: {
      kind: 'service-overview',
      title: 'Property conversions',
      serviceCode: 'PROPERTY_TRANSFORMATION',
      summary:
        'Frame a possible change of use or spatial transformation without assuming feasibility, unit counts or approval.',
      scope: [
        'Current and intended use',
        'Existing-house or additional-land context',
        'Authorisation, occupancy and approval status',
      ],
      note: 'Feasibility depends on verified property facts, applicable rules and relevant professional input.',
    },
  },
  {
    path: 'services/maintenance',
    component: PublicPage,
    data: {
      kind: 'service-overview',
      title: 'Maintenance',
      serviceCode: 'MAINTENANCE',
      summary:
        'Record the affected area, observed issue and urgency so the request can be qualified by the appropriate team.',
      scope: [
        'Affected area and observed condition',
        'Access and timing preferences',
        'Photos or supporting information where available',
      ],
      note: 'Urgency information supports triage and does not promise emergency attendance.',
    },
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
    resolve: {
      publicContent: publicContentResolver,
      relatedProjects: relatedProjectsResolver,
    },
  },
  {
    path: 'cabinetry',
    component: PublicPage,
    data: { kind: 'cabinetry', title: 'Custom cabinetry' },
    resolve: { publicContent: cabinetryContentResolver },
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
