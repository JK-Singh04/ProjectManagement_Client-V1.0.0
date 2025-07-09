//app.routes.ts
import { Routes } from '@angular/router';
import { UserComponent } from './components/user/user.component';
import { RegistrationComponent } from './components/user/registration/registration.component';
import { LoginComponent } from './components/user/login/login.component';
import { ProjectDashboardComponent } from './layouts/project-dashboard/project-dashboard.component';
import { DashboardComponent } from './layouts/dashboard/dashboard.component';
import { authGuard } from './shared/auth.guard';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { claimReq } from './shared/utils/claimReq-utils';

import { RolesComponent } from './layouts/dashboard/pages/super-admin/roles/roles.component';
import { SiteUsersComponent } from './layouts/dashboard/pages/super-admin/site-users/site-users.component';
import { AdminSettingsComponent } from './layouts/dashboard/pages/super-admin/admin-settings/admin-settings.component';

import { ProjectsComponent } from './layouts/project-dashboard/pages/projects/projects.component';
import { TimelineComponent } from './layouts/project-dashboard/pages/timeline/timeline.component';
import { SearchComponent } from './layouts/project-dashboard/pages/search/search.component';
import { UsersComponent } from './layouts/project-dashboard/pages/users/users.component';
import { TeamsComponent } from './layouts/project-dashboard/pages/teams/teams.component';
import { UserSettingsComponent } from './layouts/project-dashboard/pages/user-settings/user-settings.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { AcceptInviteComponent } from './components/accept-invite/accept-invite.component';

export const routes: Routes = [
  { path: '', redirectTo: '/signin', pathMatch: 'full' },

  /*{
  path: '',
  loadComponent: () =>
    import('./components/landing-page/landing-page.component').then(m => m.LandingPageComponent),
}, */

  {
    path: '',
    component: UserComponent,
    children: [
      { path: 'signup', component: RegistrationComponent },
      { path: 'signin', component: LoginComponent },
    ],
  },
 {
    path: 'accept-invite',
    component: AcceptInviteComponent
  },

  // Superadmin Routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { claimReq: claimReq.superAdminOnly },
  },
  {
    path: 'roles',
    component: RolesComponent,
    canActivate: [authGuard],
    data: { claimReq: claimReq.superAdminOnly },
  },
  {
    path: 'site-users',
    component: SiteUsersComponent,
    canActivate: [authGuard],
    data: { claimReq: claimReq.superAdminOnly },
  },
  {
    path: 'admin-settings',
    component: AdminSettingsComponent,
    canActivate: [authGuard],
    data: { claimReq: claimReq.superAdminOnly },
  },

  // Global User Routes

  {
    path: 'project-dashboard',
    component: ProjectDashboardComponent,
    canActivate: [authGuard],
    data: { claimReq: claimReq.globalUserOnly },
  },
  {
    path: 'projects',
    component: ProjectsComponent,
    canActivate: [authGuard],
    data: { claimReq: claimReq.globalUserOnly },
  },
  {
    path: 'timeline',
    component: TimelineComponent,
    canActivate: [authGuard],
    data: { claimReq: claimReq.globalUserOnly },
  },
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [authGuard],
    data: { claimReq: claimReq.globalUserOnly },
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [authGuard],
    data: { claimReq: claimReq.globalUserOnly },
  },
  {
    path: 'teams',
    component: TeamsComponent,
    canActivate: [authGuard],
    data: { claimReq: claimReq.globalUserOnly },
  },
  {
    path: 'user-settings',
    component: UserSettingsComponent,
    canActivate: [authGuard],
    data: { claimReq: claimReq.globalUserOnly },
  },

  // Wildcard (404)
  {
    path: '**',
    component: ForbiddenComponent,
  },
];
