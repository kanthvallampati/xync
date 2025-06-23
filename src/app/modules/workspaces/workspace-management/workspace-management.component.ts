// Core Libraries
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';

// Third Party Libraries
import { Subject, takeUntil } from 'rxjs';

// Models & Services
import { Workspace, WorkspaceMember, WorkspaceRole, WorkspaceInvitation, WorkspaceStats } from '../models/workspace.model';
import { WorkspaceService } from '../services/workspace.service';


@Component({
  selector: 'app-workspace-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule,
    MatBadgeModule
  ],
  templateUrl: './workspace-management.component.html',
  styleUrls: ['./workspace-management.component.scss']
})
export class WorkspaceManagementComponent implements OnInit, OnDestroy {
  workspaces: Workspace[] = [];
  currentWorkspace: Workspace | null = null;
  invitations: WorkspaceInvitation[] = [];
  workspaceStats: WorkspaceStats | null = null;
  workspaceForm: FormGroup;
  memberForm: FormGroup;
  invitationForm: FormGroup;
  selectedTab = 0;
  displayedColumns = ['name', 'role', 'email', 'joinedAt', 'actions'];
  WorkspaceRole = WorkspaceRole; // Make enum available in template
  private destroy$ = new Subject<void>();

  constructor(
    private workspaceService: WorkspaceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.workspaceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      key: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      allowPublicFlags: [false],
      requireApproval: [true],
      maxFlagsPerProject: [100, [Validators.required, Validators.min(1)]]
    });

    this.memberForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      role: [WorkspaceRole.EDITOR, Validators.required]
    });

    this.invitationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: [WorkspaceRole.EDITOR, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.workspaceService.getWorkspaces()
      .pipe(takeUntil(this.destroy$))
      .subscribe(workspaces => {
        this.workspaces = workspaces;
      });

    this.workspaceService.getCurrentWorkspace()
      .pipe(takeUntil(this.destroy$))
      .subscribe(workspace => {
        this.currentWorkspace = workspace;
        if (workspace) {
          this.loadWorkspaceStats(workspace.id);
        }
      });

    this.workspaceService.getInvitations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(invitations => {
        this.invitations = invitations;
      });
  }

  private loadWorkspaceStats(workspaceId: string): void {
    this.workspaceService.getWorkspaceStats(workspaceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.workspaceStats = stats;
      });
  }

  onUpdateWorkspace(): void {
    if (this.workspaceForm.valid && this.currentWorkspace) {
      const updates = this.workspaceForm.value;
      this.workspaceService.updateWorkspace(this.currentWorkspace.id, {
        ...updates,
        settings: {
          ...this.currentWorkspace.settings,
          allowPublicFlags: updates.allowPublicFlags,
          requireApproval: updates.requireApproval,
          maxFlagsPerProject: updates.maxFlagsPerProject
        }
      }).subscribe(workspace => {
        if (workspace) {
          this.snackBar.open('Workspace updated successfully', 'Close', { duration: 3000 });
          this.loadData();
        }
      });
    }
  }

  onAddMember(): void {
    if (this.memberForm.valid && this.currentWorkspace) {
      const memberData = this.memberForm.value;
      this.workspaceService.addMember(this.currentWorkspace.id, {
        userId: `user-${Date.now()}`,
        email: memberData.email,
        name: memberData.name,
        role: memberData.role,
        permissions: this.getPermissionsForRole(memberData.role)
      }).subscribe(success => {
        if (success) {
          this.snackBar.open('Member added successfully', 'Close', { duration: 3000 });
          this.memberForm.reset();
          this.loadData();
        }
      });
    }
  }

  onRemoveMember(userId: string): void {
    if (this.currentWorkspace) {
      this.workspaceService.removeMember(this.currentWorkspace.id, userId)
        .subscribe(success => {
          if (success) {
            this.snackBar.open('Member removed successfully', 'Close', { duration: 3000 });
            this.loadData();
          }
        });
    }
  }

  onUpdateMemberRole(userId: string, role: WorkspaceRole): void {
    if (this.currentWorkspace) {
      this.workspaceService.updateMemberRole(this.currentWorkspace.id, userId, role)
        .subscribe(success => {
          if (success) {
            this.snackBar.open('Member role updated successfully', 'Close', { duration: 3000 });
            this.loadData();
          }
        });
    }
  }

  onDeleteWorkspace(workspaceId: string): void {
    if (confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      this.workspaceService.deleteWorkspace(workspaceId)
        .subscribe(success => {
          if (success) {
            this.snackBar.open('Workspace deleted successfully', 'Close', { duration: 3000 });
            this.loadData();
          }
        });
    }
  }

  onSwitchWorkspace(workspace: Workspace): void {
    this.workspaceService.setCurrentWorkspace(workspace);
    this.router.navigate(['/']);
  }

  getPermissionsForRole(role: WorkspaceRole): string[] {
    switch (role) {
      case WorkspaceRole.OWNER:
        return ['read', 'write', 'delete', 'admin'];
      case WorkspaceRole.ADMIN:
        return ['read', 'write', 'delete', 'admin'];
      case WorkspaceRole.EDITOR:
        return ['read', 'write'];
      case WorkspaceRole.VIEWER:
        return ['read'];
      default:
        return ['read'];
    }
  }

  getRoleDisplayName(role: WorkspaceRole): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  getRoleColor(role: WorkspaceRole): string {
    switch (role) {
      case WorkspaceRole.OWNER:
        return 'primary';
      case WorkspaceRole.ADMIN:
        return 'accent';
      case WorkspaceRole.EDITOR:
        return 'warn';
      case WorkspaceRole.VIEWER:
        return 'default';
      default:
        return 'default';
    }
  }

  goToCreateWorkspace(): void {
    this.router.navigate(['/workspaces/new']);
  }
} 