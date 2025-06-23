import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FlagEditorComponent } from './modules/flags/flag-editor/flag-editor.component';
import { AnalyticsComponent } from './modules/flags/analytics/analytics.component';
import { FlagTesterComponent } from './modules/flags/flag-tester/flag-tester.component';
import { WorkspaceManagementComponent } from './modules/workspaces/workspace-management/workspace-management.component';
import { WorkspaceCreationComponent } from './modules/workspaces/workspace-creation/workspace-creation.component';
import { BillingComponent } from './modules/billing/billing.component';
import { billingOwnerGuard } from './modules/billing/billing-owner.guard';
import { EntryPoint } from './entry-point/entry-point';

export const routes: Routes = [
  { path: '', component: EntryPoint },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'flags/new', component: FlagEditorComponent },
  { path: 'flags/:key', component: FlagEditorComponent },
  { path: 'flags/:key/analytics', component: AnalyticsComponent },
  { path: 'flags/:key/test', component: FlagTesterComponent },
  { path: 'workspaces', component: WorkspaceManagementComponent },
  { path: 'workspaces/new', component: WorkspaceCreationComponent },
  { path: 'billing', component: BillingComponent, canActivate: [billingOwnerGuard] },
  { path: '**', redirectTo: '' }
];
