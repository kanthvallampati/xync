import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceService } from '../modules/workspaces/services/workspace.service';
import { Workspace } from '../modules/workspaces/models/workspace.model';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ProjectService } from '../modules/workspaces/services/project.service';
import { Project } from '../modules/workspaces/models/project.model';

@Component({
  selector: 'app-entry-point',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './entry-point.html',
  styleUrl: './entry-point.scss'
})
export class EntryPoint implements OnInit {
  workspaces$!: Observable<Workspace[]>;
  selectedWorkspace: Workspace | null = null;
  projects$!: Observable<Project[]>;
  selectedProject: Project | null = null;
  showWorkspaceSelection: boolean = true;
  showProjectSelection: boolean = false;

  constructor(
    private router: Router,
    private workspaceService: WorkspaceService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.workspaces$ = this.workspaceService.getWorkspaces();
    this.projects$ = this.projectService.getProjects();
  }

  selectWorkspace(workspace: Workspace) {
    this.selectedWorkspace = workspace;
    this.showWorkspaceSelection = false;
    this.showProjectSelection = true;
  }

  selectProject(project: Project) {
    this.selectedProject = project;
    this.router.navigate(['/dashboard']);
  }

}
