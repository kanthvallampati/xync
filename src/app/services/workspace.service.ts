import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Workspace, WorkspaceMember, WorkspaceRole, WorkspaceInvitation, WorkspaceStats } from '../models/workspace.model';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private workspaces = new BehaviorSubject<Workspace[]>([]);
  private currentWorkspace = new BehaviorSubject<Workspace | null>(null);
  private invitations = new BehaviorSubject<WorkspaceInvitation[]>([]);

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
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
            role: WorkspaceRole.OWNER,
            joinedAt: new Date('2024-01-01'),
            permissions: ['read', 'write', 'delete', 'admin']
          },
          {
            userId: 'user-2',
            email: 'developer@acme.com',
            name: 'Developer User',
            role: WorkspaceRole.EDITOR,
            joinedAt: new Date('2024-01-05'),
            permissions: ['read', 'write']
          },
          {
            userId: 'user-3',
            email: 'viewer@acme.com',
            name: 'Viewer User',
            role: WorkspaceRole.VIEWER,
            joinedAt: new Date('2024-01-10'),
            permissions: ['read']
          }
        ],
        environments: ['production', 'staging', 'development']
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
            role: WorkspaceRole.ADMIN,
            joinedAt: new Date('2024-01-15'),
            permissions: ['read', 'write', 'delete', 'admin']
          },
          {
            userId: 'user-4',
            email: 'beta@acme.com',
            name: 'Beta Tester',
            role: WorkspaceRole.EDITOR,
            joinedAt: new Date('2024-01-16'),
            permissions: ['read', 'write']
          }
        ],
        environments: ['staging', 'development']
      }
    ];

    const mockInvitations: WorkspaceInvitation[] = [
      {
        id: 'inv-1',
        workspaceId: 'workspace-1',
        email: 'newuser@acme.com',
        role: WorkspaceRole.EDITOR,
        invitedBy: 'admin@acme.com',
        invitedAt: new Date('2024-01-19'),
        expiresAt: new Date('2024-01-26'),
        status: 'pending'
      }
    ];

    this.workspaces.next(mockWorkspaces);
    this.currentWorkspace.next(mockWorkspaces[0]); // Set default workspace
    this.invitations.next(mockInvitations);
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

  createWorkspace(workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Observable<Workspace> {
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
        workspace.members[memberIndex].role = role;
        workspace.updatedAt = new Date();
        
        currentWorkspaces[workspaceIndex] = workspace;
        this.workspaces.next([...currentWorkspaces]);
        
        return of(true);
      }
    }
    
    return of(false);
  }

  // Invitation management
  getInvitations(): Observable<WorkspaceInvitation[]> {
    return this.invitations.asObservable();
  }

  createInvitation(invitation: Omit<WorkspaceInvitation, 'id' | 'invitedAt' | 'expiresAt' | 'status'>): Observable<WorkspaceInvitation> {
    const newInvitation: WorkspaceInvitation = {
      ...invitation,
      id: `inv-${Date.now()}`,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending'
    };
    
    const currentInvitations = this.invitations.value;
    this.invitations.next([...currentInvitations, newInvitation]);
    return of(newInvitation);
  }

  acceptInvitation(invitationId: string): Observable<boolean> {
    const currentInvitations = this.invitations.value;
    const invitationIndex = currentInvitations.findIndex(inv => inv.id === invitationId);
    
    if (invitationIndex !== -1) {
      currentInvitations[invitationIndex].status = 'accepted';
      this.invitations.next([...currentInvitations]);
      return of(true);
    }
    
    return of(false);
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
} 