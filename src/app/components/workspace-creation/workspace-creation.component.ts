import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-workspace-creation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
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

  onCreateWorkspace(): void {
    if (this.workspaceForm.valid) {
      const workspaceData = this.workspaceForm.value;
      this.workspaceService.createWorkspace({
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