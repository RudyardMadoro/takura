import { Routes } from '@angular/router';
import { anyPermissionGuard, permissionGuard } from './auth/permission.guard';
import {
  AccessDeniedPage,
  DashboardPage,
  NotFoundPage,
  SettingsPage,
  SignInPage,
} from './staff.pages';
import { ContentEditorPage } from './content-editor.page';
import { BoardInboxPage, CatalogueAdminPage } from './board-operations.page';
import { MediaLibraryPage } from './media-library.page';
export const routes: Routes = [
  { path: '', component: SignInPage },
  { path: 'auth/callback', component: SignInPage },
  { path: 'unauthorized', component: SignInPage },
  { path: 'workspace', component: DashboardPage },
  { path: 'access', component: DashboardPage, canActivate: [permissionGuard('staff_access:read')] },
  { path: 'settings', component: SettingsPage, canActivate: [permissionGuard('settings:read')] },
  {
    path: 'content',
    component: ContentEditorPage,
    canActivate: [permissionGuard('content:write')],
  },
  { path: 'media', component: MediaLibraryPage, canActivate: [permissionGuard('content:write')] },
  {
    path: 'catalogue',
    component: CatalogueAdminPage,
    canActivate: [permissionGuard('catalogue:write')],
  },
  {
    path: 'enquiries',
    component: BoardInboxPage,
    canActivate: [
      anyPermissionGuard('enquiry:assigned:read', 'enquiry:all:read', 'record:granted:read'),
    ],
  },
  { path: 'forbidden', component: AccessDeniedPage },
  { path: '**', component: NotFoundPage },
];
