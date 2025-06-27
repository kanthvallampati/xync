// Core Libraries
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';

// Lucide Icons
import { LucideAngularModule, Plus } from 'lucide-angular';

// Services
import { WorkspaceService } from '../services/workspace.service';

@Component({
  selector: 'app-workspace-creation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    LucideAngularModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './workspace-creation.component.html',
  styleUrls: ['./workspace-creation.component.scss']
})
export class WorkspaceCreationComponent {
  workspaceForm: FormGroup;

  // Lucide icons
  readonly PlusIcon = Plus;

  constructor(
    private fb: FormBuilder,
    private workspaceService: WorkspaceService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.workspaceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      key: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      allowPublicFlags: [false],
      requireApproval: [true],
      maxFlagsPerProject: [100, [Validators.required, Validators.min(1)]]
    });
  }

  createWorkspaceAction(): void {
    if (this.workspaceForm.valid) {
      const workspaceData = this.workspaceForm.value;
      this.workspaceService.createNewWorkspace({
        ...workspaceData,
        createdBy: 'current-user@example.com',
        isDefault: false,
        settings: {
          allowPublicFlags: workspaceData.allowPublicFlags,
          requireApproval: workspaceData.requireApproval,
          maxFlagsPerProject: workspaceData.maxFlagsPerProject,
          allowedFlagTypes: ['boolean', 'string', 'number', 'json'],
          customAttributes: []
        },
        members: [],
        environments: []
      }).subscribe(workspace => {
        this.snackBar.open('Workspace created successfully', 'Close', { duration: 3000 });
        this.workspaceService.setCurrentWorkspace(workspace);
        this.router.navigate(['/']);
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/workspaces']);
  }
} 