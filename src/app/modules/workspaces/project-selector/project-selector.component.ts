// Core Libraries
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Third Party Libraries
import { Subject, takeUntil } from 'rxjs';

// Models & Services
import { Project } from '../models/project.model';
import { ProjectService } from '../services/project.service';
import { Workspace } from '../models/workspace.model';
import { WorkspaceService } from '../services/workspace.service';

@Component({
  selector: 'app-project-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './project-selector.component.html',
  styleUrls: ['./project-selector.component.scss']
})
export class ProjectSelectorComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  currentProject: Project | null = null;
  currentWorkspace: Workspace | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private workspaceService: WorkspaceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.workspaceService.getCurrentWorkspace()
      .pipe(takeUntil(this.destroy$))
      .subscribe(workspace => {
        this.currentWorkspace = workspace;
        if (workspace) {
          this.workspaceService.getProjectsByWorkspace(workspace.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(projects => {
              this.projects = projects;
              if (projects.length > 0 && !this.currentProject) {
                this.currentProject = projects[0];
              }
            });
        } else {
          this.projects = [];
          this.currentProject = null;
        }
      });
    this.projectService.getCurrentProject()
      .pipe(takeUntil(this.destroy$))
      .subscribe(project => {
        this.currentProject = project;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onProjectChange(project: Project): void {
    this.projectService.setCurrentProject(project);
    this.router.navigate(['/']);
  }

  createNewProject(): void {
    this.router.navigate(['/projects/new']);
  }

  manageProjects(): void {
    this.router.navigate(['/projects']);
  }

  getProjectDisplayName(project: Project): string {
    return project.name || project.key;
  }

  getProjectDescription(project: Project): string {
    return project.description || `${project.members.length} members`;
  }
} 