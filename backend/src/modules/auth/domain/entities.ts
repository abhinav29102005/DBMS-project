

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  passwordAlgo: string;
  status: 'pending' | 'active' | 'locked' | 'disabled';
  lastLoginAt?: Date;
  failedLoginCount: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  scopeType?: 'global' | 'department' | 'hostel' | 'library';
  isSystem: boolean;
}

export interface Permission {
  id: string;
  code: string;
  description?: string;
  module: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  scopeId?: string;
  grantedAt: Date;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
  };
}
