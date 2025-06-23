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
  role: WorkspaceRole;
  joinedAt: Date;
  permissions: string[];
}

export enum WorkspaceRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
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