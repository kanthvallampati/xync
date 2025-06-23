import { Project } from './project.model';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  key: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isDefault: boolean;
  settings: WorkspaceSettings;
  members: WorkspaceMember[];
  environments: string[]; // Environment keys that belong to this workspace
  projects?: Project[]; // Projects under this workspace
}

export interface WorkspaceSettings {
  allowPublicFlags: boolean;
  requireApproval: boolean;
  maxFlagsPerProject: number;
  allowedFlagTypes: string[];
  customAttributes: string[];
}

export interface WorkspaceMember {
  userId: string;
  email: string;
  name: string;
  workspaceRole: WorkspaceRole;
  joinedAt: Date;
}

/**
 * WorkspaceRole defines the level of control and responsibility a member has within a workspace.
 *
 * OWNER: Project Maintainer on all projects in the workspace. Has full control and can override anything.
 * ADMIN: Admin of one or more workspaces. Project Maintainer on all projects under those workspaces. Has full control over projects under those workspaces.
 * MEMBER: Standard member with limited permissions.
 */
export enum WorkspaceRole {
  OWNER = 'owner', // Full control, override anything, maintainer on all projects
  ADMIN = 'admin', // Full control over projects in assigned workspaces, maintainer on those projects
  MEMBER = 'member' // Standard member
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired';
}

export interface WorkspaceStats {
  totalFlags: number;
  activeFlags: number;
  temporaryFlags: number;
  totalMembers: number;
  totalEnvironments: number;
  recentActivity: number;
} 