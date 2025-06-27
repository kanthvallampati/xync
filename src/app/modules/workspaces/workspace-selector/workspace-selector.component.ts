// Core Libraries
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// Lucide Icons
import { LucideAngularModule, Building2, ChevronDown, Check, Plus, Settings } from 'lucide-angular';

// Third Party Libraries
import { Subject, takeUntil } from 'rxjs';

// Models & Services
import { Workspace } from '../models/workspace.model';
import { WorkspaceService } from '../services/workspace.service';

@Component({
  selector: 'app-workspace-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    LucideAngularModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './workspace-selector.component.html',
  styleUrls: ['./workspace-selector.component.scss']
})
export class WorkspaceSelectorComponent implements OnInit, OnDestroy {
  workspaces: Workspace[] = [];
  currentWorkspace: Workspace | null = null;
  private destroy$ = new Subject<void>();

  // Lucide icons
  readonly Building2Icon = Building2;
  readonly ChevronDownIcon = ChevronDown;
  readonly CheckIcon = Check;
  readonly PlusIcon = Plus;
  readonly SettingsIcon = Settings;

  constructor(
    private workspaceService: WorkspaceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.workspaceService.getWorkspaces()
      .pipe(takeUntil(this.destroy$))
      .subscribe(workspaces => {
        this.workspaces = workspaces;
      });

    this.workspaceService.getCurrentWorkspace()
      .pipe(takeUntil(this.destroy$))
      .subscribe(workspace => {
        this.currentWorkspace = workspace;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onWorkspaceChange(workspace: Workspace): void {
    this.workspaceService.setCurrentWorkspace(workspace);
    // Optionally refresh the current page or navigate to workspace-specific route
    this.router.navigate(['/']);
  }

  createNewWorkspace(): void {
    // Navigate to workspace creation page
    this.router.navigate(['/workspaces/new']);
  }

  manageWorkspaces(): void {
    // Navigate to workspace management page
    this.router.navigate(['/workspaces']);
  }

  getWorkspaceDisplayName(workspace: Workspace): string {
    return workspace.name || workspace.key;
  }

  getWorkspaceDescription(workspace: Workspace): string {
    return workspace.description || `${workspace.members.length} members`;
  }
} 