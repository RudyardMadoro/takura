import { Routes } from '@angular/router';
import { permissionGuard } from './auth/permission.guard';
import {
  AccessDeniedPage,
  DashboardPage,
  NotFoundPage,
  SettingsPage,
  SignInPage,
} from './staff.pages';
import { ContentEditorPage } from './content-editor.page';
export const routes: Routes = [
  { path: '', component: SignInPage },
  { path: 'auth/callback', component: SignInPage },
  { path: 'workspace', component: DashboardPage },
  { path: 'access', component: DashboardPage, canActivate: [permissionGuard('staff_access:read')] },
  { path: 'settings', component: SettingsPage, canActivate: [permissionGuard('settings:read')] },
  {
    path: 'content',
    component: ContentEditorPage,
    canActivate: [permissionGuard('content:write')],
  },
  { path: 'forbidden', component: AccessDeniedPage },
  { path: '**', component: NotFoundPage },
];
