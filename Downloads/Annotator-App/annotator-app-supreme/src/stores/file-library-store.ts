import { create } from 'zustand';
import { FileStorageService, FileUploadResponse, FolderResponse, FileMetadata } from '@/services/file-storage-service';
import { securityConfig } from '@/config/security';

export interface FileLibraryState {
  // File and folder data
  files: FileUploadResponse[];
  folders: FolderResponse[];
  currentFolderId: string | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  selectedItems: Set<string>;
  searchQuery: string;
  
  // Upload state
  uploadProgress: Record<string, number>;
  isUploading: boolean;
  
  // Services
  fileStorageService: FileStorageService;
  
  // Actions
  loadFiles: (folderId?: string | null) => Promise<void>;
  uploadFile: (file: File, metadata: FileMetadata) => Promise<FileUploadResponse>;
  deleteFile: (fileId: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  createFolder: (name: string, parentId?: string | null) => Promise<FolderResponse>;
  shareFile: (fileId: string, email: string, accessLevel: 'view' | 'edit') => Promise<void>;
  searchFiles: (query: string) => Promise<void>;
  downloadFile: (fileId: string) => Promise<void>;
  
  // UI actions
  setCurrentFolder: (folderId: string | null) => void;
  setSelectedItems: (items: Set<string>) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  
  // Bulk operations
  deleteSelectedItems: () => Promise<void>;
  moveFiles: (fileIds: string[], targetFolderId: string | null) => Promise<void>;
}

export const useFileLibraryStore = create<FileLibraryState>((set, get) => ({
  // Initial state
  files: [],
  folders: [],
  currentFolderId: null,
  isLoading: false,
  error: null,
  selectedItems: new Set(),
  searchQuery: '',
  uploadProgress: {},
  isUploading: false,
  
  // Initialize file storage service
  fileStorageService: new FileStorageService(
    import.meta.env.VITE_API_URL || 'http://localhost:3001',
    securityConfig.upload
  ),
  
  // Load files and folders for current directory
  loadFiles: async (folderId = null) => {
    set({ isLoading: true, error: null });
    try {
      const { fileStorageService } = get();
      const response = await fileStorageService.getFiles(folderId);
      
      set({
        files: response.files,
        folders: response.folders,
        currentFolderId: folderId,
        isLoading: false,
        selectedItems: new Set(), // Clear selection when navigating
      });
    } catch (error) {
      console.error('Failed to load files:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load files',
      });
    }
  },
  
  // Upload a file
  uploadFile: async (file, metadata) => {
    const { fileStorageService, currentFolderId } = get();
    const uploadId = `${Date.now()}-${Math.random()}`;
    
    try {
      set(state => ({
        isUploading: true,
        uploadProgress: { ...state.uploadProgress, [uploadId]: 0 },
      }));
      
      // Add current folder to metadata
      const fileMetadata = {
        ...metadata,
        folderId: currentFolderId,
      };
      
      // Simulate upload progress (in real implementation, this would come from the upload request)
      const progressInterval = setInterval(() => {
        set(state => {
          const currentProgress = state.uploadProgress[uploadId] || 0;
          if (currentProgress < 90) {
            return {
              uploadProgress: {
                ...state.uploadProgress,
                [uploadId]: currentProgress + 10,
              },
            };
          }
          return state;
        });
      }, 200);
      
      const response = await fileStorageService.uploadFile(file, fileMetadata);
      
      clearInterval(progressInterval);
      
      // Update progress to 100%
      set(state => ({
        uploadProgress: { ...state.uploadProgress, [uploadId]: 100 },
      }));
      
      // Add file to current list if in the same folder
      if (response.metadata?.folderId === currentFolderId) {
        set(state => ({
          files: [...state.files, response],
        }));
      }
      
      // Clean up progress after a delay
      setTimeout(() => {
        set(state => {
          const newProgress = { ...state.uploadProgress };
          delete newProgress[uploadId];
          return {
            uploadProgress: newProgress,
            isUploading: Object.keys(newProgress).length > 0,
          };
        });
      }, 2000);
      
      return response;
    } catch (error) {
      console.error('Upload failed:', error);
      set(state => {
        const newProgress = { ...state.uploadProgress };
        delete newProgress[uploadId];
        return {
          uploadProgress: newProgress,
          isUploading: Object.keys(newProgress).length > 0,
          error: error instanceof Error ? error.message : 'Upload failed',
        };
      });
      throw error;
    }
  },
  
  // Delete a file
  deleteFile: async (fileId) => {
    try {
      const { fileStorageService } = get();
      await fileStorageService.deleteFile(fileId);
      
      // Remove from local state
      set(state => ({
        files: state.files.filter(file => file.id !== fileId),
        selectedItems: new Set([...state.selectedItems].filter(id => id !== fileId)),
      }));
    } catch (error) {
      console.error('Delete file failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete file',
      });
      throw error;
    }
  },
  
  // Delete a folder
  deleteFolder: async (folderId) => {
    try {
      const { fileStorageService } = get();
      await fileStorageService.deleteFolder(folderId);
      
      // Remove from local state
      set(state => ({
        folders: state.folders.filter(folder => folder.id !== folderId),
        selectedItems: new Set([...state.selectedItems].filter(id => id !== folderId)),
      }));
    } catch (error) {
      console.error('Delete folder failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete folder',
      });
      throw error;
    }
  },
  
  // Create a new folder
  createFolder: async (name, parentId = null) => {
    try {
      const { fileStorageService, currentFolderId } = get();
      const response = await fileStorageService.createFolder(name, parentId || currentFolderId);
      
      // Add to local state if in current directory
      if (response.parentId === currentFolderId) {
        set(state => ({
          folders: [...state.folders, response],
        }));
      }
      
      return response;
    } catch (error) {
      console.error('Create folder failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create folder',
      });
      throw error;
    }
  },
  
  // Share a file
  shareFile: async (fileId, email, accessLevel) => {
    try {
      const { fileStorageService } = get();
      await fileStorageService.shareFile({
        fileId,
        email,
        accessLevel,
      });
    } catch (error) {
      console.error('Share file failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to share file',
      });
      throw error;
    }
  },
  
  // Search files
  searchFiles: async (query) => {
    set({ isLoading: true, error: null, searchQuery: query });
    try {
      const { fileStorageService, currentFolderId } = get();
      const response = await fileStorageService.searchFiles(query, currentFolderId);
      
      set({
        files: response.files,
        folders: response.folders,
        isLoading: false,
      });
    } catch (error) {
      console.error('Search failed:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed',
      });
    }
  },
  
  // Download a file
  downloadFile: async (fileId) => {
    try {
      const { fileStorageService } = get();
      const downloadUrl = await fileStorageService.getDownloadUrl(fileId);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Download failed',
      });
      throw error;
    }
  },
  
  // UI actions
  setCurrentFolder: (folderId) => {
    set({ currentFolderId: folderId });
  },
  
  setSelectedItems: (items) => {
    set({ selectedItems: items });
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  // Delete selected items
  deleteSelectedItems: async () => {
    const { selectedItems, deleteFile, deleteFolder, files, folders } = get();
    const errors: string[] = [];
    
    for (const itemId of selectedItems) {
      try {
        // Check if it's a file or folder
        const isFile = files.some(file => file.id === itemId);
        const isFolder = folders.some(folder => folder.id === itemId);
        
        if (isFile) {
          await deleteFile(itemId);
        } else if (isFolder) {
          await deleteFolder(itemId);
        }
      } catch (error) {
        errors.push(`Failed to delete item ${itemId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    if (errors.length > 0) {
      set({ error: errors.join('\n') });
    }
  },
  
  // Move files to a different folder
  moveFiles: async (fileIds, targetFolderId) => {
    try {
      // This would be implemented with a backend API call
      // For now, we'll just simulate the operation
      console.log('Moving files:', fileIds, 'to folder:', targetFolderId);
      
      // In a real implementation, you would call:
      // await fileStorageService.moveFiles(fileIds, targetFolderId);
      
      // Then refresh the current view
      const { loadFiles, currentFolderId } = get();
      await loadFiles(currentFolderId);
    } catch (error) {
      console.error('Move files failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to move files',
      });
      throw error;
    }
  },
}));
