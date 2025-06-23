import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Workspace, WorkspaceMember, WorkspaceRole, WorkspaceInvitation, WorkspaceStats } from '../models/workspace.model';
import { Project, ProjectRole } from '../models/project.model';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private workspaces = new BehaviorSubject<Workspace[]>([]);
  private currentWorkspace = new BehaviorSubject<Workspace | null>(null);
  private invitations = new BehaviorSubject<WorkspaceInvitation[]>([]);
  projects: any;

  constructor(private projectService: ProjectService) {
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
          }
        ],
        environmentKeys: ['production', 'staging']
      }
    ];
    const mockWorkspaces: Workspace[] = [
      {
        id: 'workspace-1',
        name: 'Acme Corp',
        description: 'Main workspace for Acme Corporation',
        key: 'acme-corp',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-20'),
        createdBy: 'admin@acme.com',
        isDefault: true,
        settings: {
          allowPublicFlags: false,
          requireApproval: true,
          maxFlagsPerProject: 100,
          allowedFlagTypes: ['boolean', 'string', 'number', 'json'],
          customAttributes: ['country', 'subscription', 'userType']
        },
        members: [
          {
            userId: 'user-1',
            email: 'admin@acme.com',
            name: 'Admin User',
            workspaceRole: WorkspaceRole.OWNER,
            joinedAt: new Date('2024-01-01')
          },
          {
            userId: 'user-2',
            email: 'developer@acme.com',
            name: 'Developer User',
            workspaceRole: WorkspaceRole.ADMIN,
            joinedAt: new Date('2024-01-05')
          },
          {
            userId: 'user-3',
            email: 'viewer@acme.com',
            name: 'Viewer User',
            workspaceRole: WorkspaceRole.MEMBER,
            joinedAt: new Date('2024-01-10')
          }
        ],
        environments: ['production', 'staging', 'development'],
        projects: mockProjects
      },
      {
        id: 'workspace-2',
        name: 'Beta Project',
        description: 'Experimental features and testing',
        key: 'beta-project',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-18'),
        createdBy: 'admin@acme.com',
        isDefault: false,
        settings: {
          allowPublicFlags: true,
          requireApproval: false,
          maxFlagsPerProject: 50,
          allowedFlagTypes: ['boolean', 'string'],
          customAttributes: ['betaTester', 'userType']
        },
        members: [
          {
            userId: 'user-1',
            email: 'admin@acme.com',
            name: 'Admin User',
            workspaceRole: WorkspaceRole.OWNER,
            joinedAt: new Date('2024-01-15')
          },
          {
            userId: 'user-4',
            email: 'viewer@acme.com',
            name: 'Viewer User',
            workspaceRole: WorkspaceRole.MEMBER,
            joinedAt: new Date('2024-01-10')
          }
        ],
        environments: ['staging', 'development'],
        projects: []
      }
    ];

    this.workspaces.next(mockWorkspaces);
    this.currentWorkspace.next(mockWorkspaces[0]); // Set default workspace
  }

  // Workspace CRUD operations
  getWorkspaces(): Observable<Workspace[]> {
    return this.workspaces.asObservable();
  }

  getCurrentWorkspace(): Observable<Workspace | null> {
    return this.currentWorkspace.asObservable();
  }

  setCurrentWorkspace(workspace: Workspace): void {
    this.currentWorkspace.next(workspace);
  }

  getWorkspace(id: string): Observable<Workspace | undefined> {
    const workspace = this.workspaces.value.find(w => w.id === id);
    return of(workspace);
  }

  getWorkspaceByKey(key: string): Observable<Workspace | undefined> {
    const workspace = this.workspaces.value.find(w => w.key === key);
    return of(workspace);
  }

  createNewWorkspace(workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Observable<Workspace> {
    const newWorkspace: Workspace = {
      ...workspace,
      id: `workspace-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const currentWorkspaces = this.workspaces.value;
    this.workspaces.next([...currentWorkspaces, newWorkspace]);
    return of(newWorkspace);
  }

  updateWorkspace(id: string, updates: Partial<Workspace>): Observable<Workspace | undefined> {
    const currentWorkspaces = this.workspaces.value;
    const workspaceIndex = currentWorkspaces.findIndex(w => w.id === id);
    
    if (workspaceIndex !== -1) {
      const updatedWorkspace = {
        ...currentWorkspaces[workspaceIndex],
        ...updates,
        updatedAt: new Date()
      };
      
      currentWorkspaces[workspaceIndex] = updatedWorkspace;
      this.workspaces.next([...currentWorkspaces]);
      
      // Update current workspace if it's the one being updated
      if (this.currentWorkspace.value?.id === id) {
        this.currentWorkspace.next(updatedWorkspace);
      }
      
      return of(updatedWorkspace);
    }
    
    return of(undefined);
  }

  deleteWorkspace(id: string): Observable<boolean> {
    const currentWorkspaces = this.workspaces.value;
    const filteredWorkspaces = currentWorkspaces.filter(w => w.id !== id);
    
    if (filteredWorkspaces.length !== currentWorkspaces.length) {
      this.workspaces.next(filteredWorkspaces);
      
      // If deleted workspace was current, set first available as current
      if (this.currentWorkspace.value?.id === id) {
        this.currentWorkspace.next(filteredWorkspaces.length > 0 ? filteredWorkspaces[0] : null);
      }
      
      return of(true);
    }
    
    return of(false);
  }

  // Member management
  addMember(workspaceId: string, member: Omit<WorkspaceMember, 'joinedAt'>): Observable<boolean> {
    const currentWorkspaces = this.workspaces.value;
    const workspaceIndex = currentWorkspaces.findIndex(w => w.id === workspaceId);
    
    if (workspaceIndex !== -1) {
      const workspace = currentWorkspaces[workspaceIndex];
      const newMember: WorkspaceMember = {
        ...member,
        joinedAt: new Date()
      };
      
      workspace.members.push(newMember);
      workspace.updatedAt = new Date();
      
      currentWorkspaces[workspaceIndex] = workspace;
      this.workspaces.next([...currentWorkspaces]);
      
      return of(true);
    }
    
    return of(false);
  }

  removeMember(workspaceId: string, userId: string): Observable<boolean> {
    const currentWorkspaces = this.workspaces.value;
    const workspaceIndex = currentWorkspaces.findIndex(w => w.id === workspaceId);
    
    if (workspaceIndex !== -1) {
      const workspace = currentWorkspaces[workspaceIndex];
      const memberIndex = workspace.members.findIndex(m => m.userId === userId);
      
      if (memberIndex !== -1) {
        workspace.members.splice(memberIndex, 1);
        workspace.updatedAt = new Date();
        
        currentWorkspaces[workspaceIndex] = workspace;
        this.workspaces.next([...currentWorkspaces]);
        
        return of(true);
      }
    }
    
    return of(false);
  }

  updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): Observable<boolean> {
    const currentWorkspaces = this.workspaces.value;
    const workspaceIndex = currentWorkspaces.findIndex(w => w.id === workspaceId);
    
    if (workspaceIndex !== -1) {
      const workspace = currentWorkspaces[workspaceIndex];
      const memberIndex = workspace.members.findIndex(m => m.userId === userId);
      
      if (memberIndex !== -1) {
        workspace.members[memberIndex].workspaceRole = role;
        workspace.updatedAt = new Date();
        
        currentWorkspaces[workspaceIndex] = workspace;
        this.workspaces.next([...currentWorkspaces]);
        
        return of(true);
      }
    }
    
    return of(false);
  }

  // Invitation management
  getProjects(): Observable<Project[]> {
    return this.projects.asObservable();
  }

  // Workspace statistics
  getWorkspaceStats(workspaceId: string): Observable<WorkspaceStats> {
    const workspace = this.workspaces.value.find(w => w.id === workspaceId);
    
    if (workspace) {
      const stats: WorkspaceStats = {
        totalFlags: 0, // This would be calculated from feature flags service
        activeFlags: 0,
        temporaryFlags: 0,
        totalMembers: workspace.members.length,
        totalEnvironments: workspace.environments.length,
        recentActivity: 0
      };
      
      return of(stats);
    }
    
    return of({
      totalFlags: 0,
      activeFlags: 0,
      temporaryFlags: 0,
      totalMembers: 0,
      totalEnvironments: 0,
      recentActivity: 0
    });
  }

  getProjectsByWorkspace(workspaceId: string): Observable<Project[]> {
    const workspace = this.workspaces.value.find(w => w.id === workspaceId);
    return of(workspace?.projects || []);
  }

  addProjectToWorkspace(workspaceId: string, project: Project): Observable<boolean> {
    const currentWorkspaces = this.workspaces.value;
    const workspaceIndex = currentWorkspaces.findIndex(w => w.id === workspaceId);
    if (workspaceIndex !== -1) {
      const workspace = currentWorkspaces[workspaceIndex];
      if (!workspace.projects) workspace.projects = [];
      workspace.projects.push(project);
      workspace.updatedAt = new Date();
      currentWorkspaces[workspaceIndex] = workspace;
      this.workspaces.next([...currentWorkspaces]);
      return of(true);
    }
    return of(false);
  }
} 