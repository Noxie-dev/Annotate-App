import { validateFileUpload, SecurityConfig } from '@/config/security';
import { ApiClient } from './api-client';

export interface FileUploadResponse {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface FileMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  isPrivate?: boolean;
  folderId?: string | null;
  accessLevel?: 'private' | 'view' | 'edit' | 'public';
}

export interface FileListResponse {
  files: FileUploadResponse[];
  folders: FolderResponse[];
  totalCount: number;
  hasMore: boolean;
}

export interface FolderResponse {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  itemCount: number;
}

export interface ShareRequest {
  fileId: string;
  email?: string;
  accessLevel: 'view' | 'edit';
  expiresAt?: string;
}

export interface VirusScanResult {
  clean: boolean;
  threats?: string[];
  scanId: string;
}

export class FileStorageService {
  private readonly apiClient: ApiClient;
  private readonly uploadConfig: SecurityConfig['upload'];
  private readonly storageType: string;

  constructor(baseUrl: string, uploadConfig: SecurityConfig['upload']) {
    this.apiClient = new ApiClient(baseUrl);
    this.uploadConfig = uploadConfig;
    this.storageType = import.meta.env.VITE_STORAGE_TYPE || 'local';
  }

  /**
   * Upload a file with metadata
   */
  async uploadFile(file: File, metadata: FileMetadata = {}): Promise<FileUploadResponse> {
    // Validate file against security policy
    const validation = validateFileUpload(file, this.uploadConfig);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    // Add storage configuration
    formData.append('storageType', this.storageType);
    if (metadata.folderId) {
      formData.append('folderId', metadata.folderId);
    }

    try {
      const response = await this.apiClient.upload<FileUploadResponse>('/api/files/upload', formData);
      const result = response.data;

      // Perform virus scan if enabled
      if (this.uploadConfig.scanForMalware) {
        await this.performVirusScan(result.id);
      }

      return result;
    } catch (error) {
      console.error('File upload error:', error);
      throw error instanceof Error ? error : new Error('Upload failed');
    }
  }

  /**
   * Get file list with optional folder filtering
   */
  async getFiles(folderId?: string | null, page = 1, limit = 50): Promise<FileListResponse> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (folderId) {
      params.folderId = folderId;
    }

    try {
      const response = await this.apiClient.get<FileListResponse>('/api/files', params);
      return response.data;
    } catch (error) {
      console.error('Get files error:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch files');
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/api/files/${fileId}`);
    } catch (error) {
      console.error('Delete file error:', error);
      throw error instanceof Error ? error : new Error('Failed to delete file');
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(name: string, parentId?: string | null): Promise<FolderResponse> {
    try {
      const response = await this.apiClient.post<FolderResponse>('/api/folders', {
        name,
        parentId,
      });
      return response.data;
    } catch (error) {
      console.error('Create folder error:', error);
      throw error instanceof Error ? error : new Error('Failed to create folder');
    }
  }

  /**
   * Delete a folder
   */
  async deleteFolder(folderId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/api/folders/${folderId}`);
    } catch (error) {
      console.error('Delete folder error:', error);
      throw error instanceof Error ? error : new Error('Failed to delete folder');
    }
  }

  /**
   * Share a file with another user
   */
  async shareFile(shareRequest: ShareRequest): Promise<void> {
    try {
      await this.apiClient.post('/api/files/share', shareRequest);
    } catch (error) {
      console.error('Share file error:', error);
      throw error instanceof Error ? error : new Error('Failed to share file');
    }
  }

  /**
   * Get download URL for a file
   */
  async getDownloadUrl(fileId: string): Promise<string> {
    try {
      const response = await this.apiClient.get<{ downloadUrl: string }>(`/api/files/${fileId}/download-url`);
      return response.data.downloadUrl;
    } catch (error) {
      console.error('Get download URL error:', error);
      throw error instanceof Error ? error : new Error('Failed to get download URL');
    }
  }

  /**
   * Search files by name or content
   */
  async searchFiles(query: string, folderId?: string | null): Promise<FileListResponse> {
    const params: Record<string, string> = {
      q: query,
    };

    if (folderId) {
      params.folderId = folderId;
    }

    try {
      const response = await this.apiClient.get<FileListResponse>('/api/files/search', params);
      return response.data;
    } catch (error) {
      console.error('Search files error:', error);
      throw error instanceof Error ? error : new Error('Search failed');
    }
  }

  /**
   * Perform virus scan on uploaded file
   */
  private async performVirusScan(fileId: string): Promise<VirusScanResult> {
    try {
      const response = await this.apiClient.post<VirusScanResult>(`/api/files/${fileId}/scan`);
      const result = response.data;

      if (!result.clean) {
        throw new Error(`File contains threats: ${result.threats?.join(', ')}`);
      }

      return result;
    } catch (error) {
      console.error('Virus scan error:', error);
      throw error instanceof Error ? error : new Error('Virus scan failed');
    }
  }
}
