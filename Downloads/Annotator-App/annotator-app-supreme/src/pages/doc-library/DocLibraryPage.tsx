import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Upload,
  File,
  Folder,
  MoreVertical,
  Trash2,
  Share2,
  Download,
  Search,
  Plus,
  FolderPlus,
  ArrowLeft,
  Eye,
  Users,
  Lock,
  Globe,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useFileLibraryStore } from '@/stores/file-library-store';
import { toast } from 'sonner';

export default function DocLibraryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // File library store
  const {
    files,
    folders,
    currentFolderId,
    isLoading,
    error,
    selectedItems,
    searchQuery,
    uploadProgress,
    isUploading,
    loadFiles,
    uploadFile,
    deleteFile,
    deleteFolder,
    createFolder,
    shareFile,
    searchFiles,
    downloadFile,
    setCurrentFolder,
    setSelectedItems,
    setSearchQuery,
    clearError,
    deleteSelectedItems,
  } = useFileLibraryStore();

  // Local UI state
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load files on mount and when folder changes
  useEffect(() => {
    loadFiles(currentFolderId);
  }, [currentFolderId, loadFiles]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Get current folder path for breadcrumbs
  const getFolderPath = useCallback((folderId) => {
    if (!folderId) return [];
    const path = [];
    let currentId = folderId;

    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return path;
  }, [folders]);

  // Filter and search logic (files and folders are already filtered by the store)
  const filteredContent = useMemo(() => {
    if (searchQuery) {
      // If searching, files and folders are already filtered by the store
      return { folders, files };
    }

    // Filter by current folder
    const filteredFolders = folders.filter(folder =>
      folder.parentId === currentFolderId
    );

    const filteredFiles = files.filter(file =>
      file.metadata?.folderId === currentFolderId
    );

    return { folders: filteredFolders, files: filteredFiles };
  }, [folders, files, currentFolderId, searchQuery]);

  // File upload handling
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      try {
        await uploadFile(file as File, {
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          description: '',
          tags: [],
          isPrivate: true,
          accessLevel: 'private',
        });

        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [uploadFile]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Create new folder
  const handleCreateFolder = useCallback(async () => {
    if (newFolderName.trim()) {
      try {
        await createFolder(newFolderName.trim(), currentFolderId);
        setNewFolderName('');
        setShowCreateFolder(false);
        toast.success('Folder created successfully');
      } catch (error) {
        console.error('Create folder failed:', error);
        toast.error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [newFolderName, currentFolderId, createFolder]);

  // Delete items
  const handleDeleteItems = useCallback(async () => {
    try {
      await deleteSelectedItems();
      toast.success('Items deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(`Failed to delete items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [deleteSelectedItems]);

  // Share functionality
  const openShareModal = useCallback((item) => {
    setShareTarget(item);
    setShowShareModal(true);
  }, []);

  // Handle file double-click to open document
  const handleFileDoubleClick = useCallback((file) => {
    // Navigate to document viewer with the file ID
    navigate(`/document/${file.id}`);
  }, [navigate]);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchFiles(query);
    } else {
      // If search is cleared, reload current folder
      await loadFiles(currentFolderId);
    }
  }, [searchFiles, loadFiles, currentFolderId, setSearchQuery]);

  // Handle download
  const handleDownload = useCallback(async (fileId: string) => {
    try {
      await downloadFile(fileId);
      toast.success('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [downloadFile]);

  const getAccessIcon = (accessLevel) => {
    switch (accessLevel) {
      case 'private': return <Lock className="w-4 h-4 text-gray-400" />;
      case 'view': return <Eye className="w-4 h-4 text-blue-400" />;
      case 'edit': return <Users className="w-4 h-4 text-green-400" />;
      default: return <Globe className="w-4 h-4 text-orange-400" />;
    }
  };

  const currentPath = getFolderPath(currentFolderId);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-screen bg-[#0f1419] flex flex-col">
      {/* Header */}
      <div className="bg-[#1a1f2e] border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <h1 className="text-2xl font-semibold text-gray-200">Document Library</h1>
            </div>
            
            {/* Navigation Links */}
            <nav className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="text-gray-400 hover:text-white px-3 py-2 rounded-md text-sm font-medium border-b-2 border-transparent hover:border-gray-600"
              >
                Dashboard
              </Link>
              <Link 
                to="/doc-library" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium border-b-2 border-blue-500"
              >
                Doc Library
              </Link>
            </nav>
            
            {/* Breadcrumbs */}
            {currentPath.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <button
                  type="button"
                  onClick={() => setCurrentFolder(null)}
                  className="hover:text-gray-200 transition-colors"
                  aria-label="Navigate to root folder"
                >
                  Root
                </button>
                {currentPath.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <span>/</span>
                    <button
                      type="button"
                      onClick={() => setCurrentFolder(folder.id)}
                      className="hover:text-gray-200 transition-colors"
                      aria-label={`Navigate to ${folder.name} folder`}
                    >
                      {folder.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gray-600 text-gray-200">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-[#1a1f2e] border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {currentFolderId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const currentFolder = folders.find(f => f.id === currentFolderId);
                  setCurrentFolder(currentFolder?.parentId || null);
                }}
                className="text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 bg-[#0f1419] border-gray-600 text-gray-200 placeholder-gray-500"
              />
            </div>
            
            {selectedItems.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteItems}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedItems.size})
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateFolder(true)}
              className="bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            
            <label className="cursor-pointer">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 p-6 overflow-auto ${isDragOver ? 'bg-blue-900/20 border-2 border-dashed border-blue-400' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="fixed inset-0 bg-blue-900/50 flex items-center justify-center z-10">
            <div className="bg-[#1a1f2e] p-8 rounded-lg shadow-lg border-2 border-dashed border-blue-400">
              <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-blue-400">Drop PDF files here to upload</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-400">Loading...</span>
          </div>
        ) : (
          <>
            {filteredContent.folders.length === 0 && filteredContent.files.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  {searchQuery ? 'No results found' : 'This folder is empty'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Upload some PDF files or create folders to get started'
                  }
                </p>
                {!searchQuery && (
                  <label className="cursor-pointer">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload your first file
                    </Button>
                    <input
                      type="file"
                      multiple
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {/* Folders */}
                {filteredContent.folders.map(folder => (
            <div
              key={folder.id}
              className={`group relative p-4 bg-[#1a1f2e] rounded-lg border-2 transition-all cursor-pointer hover:shadow-md hover:border-gray-600 ${
                selectedItems.has(folder.id) ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'
              }`}
              onClick={() => {
                if (selectedItems.size > 0) {
                  const newSelected = new Set(selectedItems);
                  if (newSelected.has(folder.id)) {
                    newSelected.delete(folder.id);
                  } else {
                    newSelected.add(folder.id);
                  }
                  setSelectedItems(newSelected);
                } else {
                  setCurrentFolder(folder.id);
                }
              }}
            >
              <input
                type="checkbox"
                checked={selectedItems.has(folder.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  const newSelected = new Set(selectedItems);
                  if (e.target.checked) {
                    newSelected.add(folder.id);
                  } else {
                    newSelected.delete(folder.id);
                  }
                  setSelectedItems(newSelected);
                }}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
              />

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Show context menu
                  }}
                  className="p-1 text-gray-400 hover:text-gray-200 rounded w-6 h-6"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-center">
                <Folder className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-200 truncate">{folder.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{folder.itemCount} items</p>
                <p className="text-xs text-gray-500 mt-1">{folder.createdAt}</p>
              </div>
            </div>
          ))}

          {/* Files */}
          {filteredContent.files.map(file => (
            <div
              key={file.id}
              className={`group relative p-4 bg-[#1a1f2e] rounded-lg border-2 transition-all cursor-pointer hover:shadow-md hover:border-gray-600 ${
                selectedItems.has(file.id) ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'
              }`}
              onClick={() => {
                const newSelected = new Set(selectedItems);
                if (newSelected.has(file.id)) {
                  newSelected.delete(file.id);
                } else {
                  newSelected.add(file.id);
                }
                setSelectedItems(newSelected);
              }}
              onDoubleClick={() => handleFileDoubleClick(file)}
            >
              <input
                type="checkbox"
                checked={selectedItems.has(file.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  const newSelected = new Set(selectedItems);
                  if (e.target.checked) {
                    newSelected.add(file.id);
                  } else {
                    newSelected.delete(file.id);
                  }
                  setSelectedItems(newSelected);
                }}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
              />

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openShareModal(file);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-200 rounded w-6 h-6"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file.id);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-200 rounded w-6 h-6"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-center">
                <File className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-200 truncate" title={file.name}>
                  {file.name}
                </h3>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  {getAccessIcon(file.metadata?.accessLevel || 'private')}
                  <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{new Date(file.createdAt).toLocaleDateString()}</p>
                {file.metadata?.sharedWith && file.metadata.sharedWith.length > 0 && (
                  <div className="flex items-center justify-center mt-1">
                    <Users className="w-3 h-3 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-500">
                      {file.metadata.sharedWith.length === 1 && file.metadata.sharedWith[0] === 'public'
                        ? 'Public'
                        : `${file.metadata.sharedWith.length} users`}
                    </span>
                  </div>
                )}
              </div>
            </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1f2e] rounded-lg p-6 w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Create New Folder</h3>
            <Input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="w-full bg-[#0f1419] border-gray-600 text-gray-200 placeholder-gray-500"
              autoFocus
            />
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="flex-1 bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1f2e] rounded-lg p-6 w-96 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Share "{shareTarget.name}"</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Access Level</label>
                <select
                  className="w-full px-3 py-2 bg-[#0f1419] border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Select access level"
                >
                  <option value="view">View Only</option>
                  <option value="edit">Can Edit</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Share with</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full bg-[#0f1419] border-gray-600 text-gray-200 placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowShareModal(false);
                  setShareTarget(null);
                }}
                className="flex-1 bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                Share
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
