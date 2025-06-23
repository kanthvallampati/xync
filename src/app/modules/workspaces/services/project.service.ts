import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Project, ProjectMember, ProjectRole } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects = new BehaviorSubject<Project[]>([]);
  private currentProject = new BehaviorSubject<Project | null>(null);

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockProjects: Project[] = [
      {
        id: 'project-1',
        name: 'Core Platform',
        description: 'Main platform project',
        key: 'core-platform',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-20'),
        createdBy: 'admin@acme.com',
        members: [
          {
            userId: 'user-1',
            email: 'admin@acme.com',
            name: 'Admin User',
            role: ProjectRole.EDITOR,
            joinedAt: new Date('2024-01-01'),
            permissions: ['read', 'write', 'delete', 'admin']
          },
          {
            userId: 'user-2',
            email: 'developer@acme.com',
            name: 'Developer User',
            role: ProjectRole.EDITOR,
            joinedAt: new Date('2024-01-05'),
            permissions: ['read', 'write']
          }
        ],
        environmentKeys: ['production', 'staging']
      }
    ];
    this.projects.next(mockProjects);
    this.currentProject.next(mockProjects[0]);
  }

  getProjects(): Observable<Project[]> {
    return this.projects.asObservable();
  }

  getCurrentProject(): Observable<Project | null> {
    return this.currentProject.asObservable();
  }

  setCurrentProject(project: Project): void {
    this.currentProject.next(project);
  }

  getProject(id: string): Observable<Project | undefined> {
    const project = this.projects.value.find(p => p.id === id);
    return of(project);
  }

  createNewProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Observable<Project> {
    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const currentProjects = this.projects.value;
    this.projects.next([...currentProjects, newProject]);
    return of(newProject);
  }

  updateProject(id: string, updates: Partial<Project>): Observable<Project | undefined> {
    const currentProjects = this.projects.value;
    const projectIndex = currentProjects.findIndex(p => p.id === id);
    if (projectIndex !== -1) {
      const updatedProject = {
        ...currentProjects[projectIndex],
        ...updates,
        updatedAt: new Date()
      };
      currentProjects[projectIndex] = updatedProject;
      this.projects.next([...currentProjects]);
      if (this.currentProject.value?.id === id) {
        this.currentProject.next(updatedProject);
      }
      return of(updatedProject);
    }
    return of(undefined);
  }

  deleteProject(id: string): Observable<boolean> {
    const currentProjects = this.projects.value;
    const filteredProjects = currentProjects.filter(p => p.id !== id);
    if (filteredProjects.length !== currentProjects.length) {
      this.projects.next(filteredProjects);
      if (this.currentProject.value?.id === id) {
        this.currentProject.next(filteredProjects.length > 0 ? filteredProjects[0] : null);
      }
      return of(true);
    }
    return of(false);
  }

  addMember(projectId: string, member: Omit<ProjectMember, 'joinedAt'>): Observable<boolean> {
    const currentProjects = this.projects.value;
    const projectIndex = currentProjects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      const project = currentProjects[projectIndex];
      const newMember: ProjectMember = {
        ...member,
        joinedAt: new Date()
      };
      project.members.push(newMember);
      project.updatedAt = new Date();
      currentProjects[projectIndex] = project;
      this.projects.next([...currentProjects]);
      return of(true);
    }
    return of(false);
  }
} 