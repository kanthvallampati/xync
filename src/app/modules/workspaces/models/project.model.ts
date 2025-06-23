export interface Project {
  id: string;
  name: string;
  description?: string;
  key: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  members: ProjectMember[];
  environmentKeys: string[]; // Environment keys that belong to this project
}

export interface ProjectMember {
  userId: string;
  email: string;
  name: string;
  role: ProjectRole;
  joinedAt: Date;
  permissions: string[];
}

export enum ProjectRole {
  MAINTAINER = 'maintainer',
  EDITOR = 'editor',
  VIEWER = 'viewer'
} 