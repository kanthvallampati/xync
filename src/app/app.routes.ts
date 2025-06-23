import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FlagEditorComponent } from './components/flag-editor/flag-editor.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { FlagTesterComponent } from './components/flag-tester/flag-tester.component';
import { WorkspaceManagementComponent } from './components/workspace-management/workspace-management.component';
import { WorkspaceCreationComponent } from './components/workspace-creation/workspace-creation.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'flags/new', component: FlagEditorComponent },
  { path: 'flags/:key', component: FlagEditorComponent },
  { path: 'flags/:key/analytics', component: AnalyticsComponent },
  { path: 'flags/:key/test', component: FlagTesterComponent },
  { path: 'workspaces', component: WorkspaceManagementComponent },
  { path: 'workspaces/new', component: WorkspaceCreationComponent },
  { path: '**', redirectTo: '' }
];
