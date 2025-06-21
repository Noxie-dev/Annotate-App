import { User } from '@/types';

export interface CollaboratorInvite {
  id: string;
  documentId: string;
  email: string;
  permission: CollaboratorPermission;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
}

export interface DocumentCollaborator {
  id: string;
  user: User;
  permission: CollaboratorPermission;
  addedAt: string;
  addedBy: string;
  lastActiveAt: string;
  status: 'active' | 'inactive' | 'removed';
}

export type CollaboratorPermission = 'view' | 'comment' | 'edit' | 'admin';

export interface PermissionLevel {
  id: CollaboratorPermission;
  name: string;
  description: string;
  capabilities: string[];
  color: string;
}

export interface CollaborationSettings {
  allowPublicSharing: boolean;
  requireApprovalForNewCollaborators: boolean;
  defaultPermission: CollaboratorPermission;
  maxCollaborators: number;
  allowExternalCollaborators: boolean;
}

class CollaborationService {
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  /**
   * Permission levels configuration
   */
  readonly permissionLevels: PermissionLevel[] = [
    {
      id: 'view',
      name: 'Viewer',
      description: 'Can view the document and read comments',
      capabilities: ['view_document', 'read_comments'],
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    },
    {
      id: 'comment',
      name: 'Commenter',
      description: 'Can view, add comments, and create annotations',
      capabilities: ['view_document', 'read_comments', 'add_comments', 'create_annotations'],
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    {
      id: 'edit',
      name: 'Editor',
      description: 'Can view, comment, edit annotations, and manage document content',
      capabilities: [
        'view_document', 
        'read_comments', 
        'add_comments', 
        'create_annotations', 
        'edit_annotations',
        'delete_own_annotations'
      ],
      color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full access including managing collaborators and document settings',
      capabilities: [
        'view_document',
        'read_comments',
        'add_comments',
        'create_annotations',
        'edit_annotations',
        'delete_annotations',
        'manage_collaborators',
        'manage_document_settings',
        'delete_document'
      ],
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
  ];

  /**
   * Get permission level by ID
   */
  getPermissionLevel(permission: CollaboratorPermission): PermissionLevel {
    return this.permissionLevels.find(level => level.id === permission) || this.permissionLevels[0];
  }

  /**
   * Check if user has specific capability
   */
  hasCapability(permission: CollaboratorPermission, capability: string): boolean {
    const level = this.getPermissionLevel(permission);
    return level.capabilities.includes(capability);
  }

  /**
   * Invite collaborators to a document
   */
  async inviteCollaborators(
    documentId: string, 
    invites: Array<{ email: string; permission: CollaboratorPermission; message?: string }>
  ): Promise<CollaboratorInvite[]> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${documentId}/collaborators/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ invites })
      });

      if (!response.ok) {
        throw new Error('Failed to send invitations');
      }

      const data = await response.json();
      return data.invites.map(this.mapInviteResponse);
    } catch (error) {
      console.error('Invite collaborators error:', error);
      
      // Return mock invites for development
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockInvites(documentId, invites);
      }
      
      throw new Error('Failed to send invitations');
    }
  }

  /**
   * Get document collaborators
   */
  async getDocumentCollaborators(documentId: string): Promise<DocumentCollaborator[]> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${documentId}/collaborators`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch collaborators');
      }

      const data = await response.json();
      return data.collaborators.map(this.mapCollaboratorResponse);
    } catch (error) {
      console.error('Get collaborators error:', error);
      
      // Return mock collaborators for development
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockCollaborators(documentId);
      }
      
      throw new Error('Failed to fetch collaborators');
    }
  }

  /**
   * Update collaborator permission
   */
  async updateCollaboratorPermission(
    documentId: string, 
    collaboratorId: string, 
    permission: CollaboratorPermission
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/documents/${documentId}/collaborators/${collaboratorId}`, 
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ permission })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update collaborator permission');
      }
    } catch (error) {
      console.error('Update collaborator permission error:', error);
      
      // Mock success for development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
      }
      
      throw new Error('Failed to update collaborator permission');
    }
  }

  /**
   * Remove collaborator from document
   */
  async removeCollaborator(documentId: string, collaboratorId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/documents/${documentId}/collaborators/${collaboratorId}`, 
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove collaborator');
      }
    } catch (error) {
      console.error('Remove collaborator error:', error);
      
      // Mock success for development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
      }
      
      throw new Error('Failed to remove collaborator');
    }
  }

  /**
   * Get pending invitations for a document
   */
  async getPendingInvitations(documentId: string): Promise<CollaboratorInvite[]> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${documentId}/invitations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }

      const data = await response.json();
      return data.invitations.map(this.mapInviteResponse);
    } catch (error) {
      console.error('Get invitations error:', error);
      
      // Return mock invitations for development
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockPendingInvites(documentId);
      }
      
      throw new Error('Failed to fetch invitations');
    }
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(invitationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel invitation');
      }
    } catch (error) {
      console.error('Cancel invitation error:', error);
      
      // Mock success for development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        return;
      }
      
      throw new Error('Failed to cancel invitation');
    }
  }

  /**
   * Generate mock invites for development
   */
  private generateMockInvites(
    documentId: string, 
    invites: Array<{ email: string; permission: CollaboratorPermission; message?: string }>
  ): CollaboratorInvite[] {
    return invites.map((invite, index) => ({
      id: `invite-${Date.now()}-${index}`,
      documentId,
      email: invite.email,
      permission: invite.permission,
      invitedBy: 'current-user',
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      message: invite.message
    }));
  }

  /**
   * Generate mock collaborators for development
   */
  private generateMockCollaborators(documentId: string): DocumentCollaborator[] {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Alex Chen',
        email: 'alex@example.com',
        avatar: '/images/avatar-1.jpg',
        role: 'Team Member',
        status: 'online',
        color: '#3b82f6',
        department: 'Engineering',
        joinDate: '2024-01-01',
        timezone: 'UTC',
        isFirstTimeUser: false,
        lastLoginAt: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        avatar: '/images/avatar-2.jpg',
        role: 'Team Lead',
        status: 'online',
        color: '#10b981',
        department: 'Product',
        joinDate: '2024-01-01',
        timezone: 'UTC',
        isFirstTimeUser: false,
        lastLoginAt: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      }
    ];

    return mockUsers.map((user, index) => ({
      id: `collab-${user.id}`,
      user,
      permission: index === 0 ? 'admin' : 'edit',
      addedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      addedBy: 'current-user',
      lastActiveAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      status: 'active'
    }));
  }

  /**
   * Generate mock pending invites for development
   */
  private generateMockPendingInvites(documentId: string): CollaboratorInvite[] {
    return [
      {
        id: 'pending-1',
        documentId,
        email: 'john@example.com',
        permission: 'comment',
        invitedBy: 'current-user',
        invitedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        message: 'Please review this document and provide your feedback.'
      }
    ];
  }

  /**
   * Map API responses
   */
  private mapInviteResponse = (invite: any): CollaboratorInvite => ({
    id: invite.id,
    documentId: invite.document_id,
    email: invite.email,
    permission: invite.permission,
    invitedBy: invite.invited_by,
    invitedAt: invite.invited_at,
    expiresAt: invite.expires_at,
    status: invite.status,
    message: invite.message
  });

  private mapCollaboratorResponse = (collaborator: any): DocumentCollaborator => ({
    id: collaborator.id,
    user: collaborator.user,
    permission: collaborator.permission,
    addedAt: collaborator.added_at,
    addedBy: collaborator.added_by,
    lastActiveAt: collaborator.last_active_at,
    status: collaborator.status
  });

  /**
   * Get current auth token
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const collaborationService = new CollaborationService();
