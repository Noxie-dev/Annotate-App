import { create } from 'zustand';
import { Document, Annotation, User, ChatMessage, UserPresence, AnnotationTool } from '@/types';
import { FileStorageService } from '@/services/file-storage-service';
import { securityConfig } from '@/config/security';

interface DocumentState {
  // Document data
  currentDocument: Document | null;
  documents: Document[];
  users: User[];

  // PDF viewer state
  currentPage: number;
  totalPages: number;
  scale: number;
  isLoading: boolean;
  error: string | null;

  // Annotations
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  isAnnotating: boolean;
  currentTool: AnnotationTool;

  // Communication
  chatMessages: ChatMessage[];
  isTyping: boolean;
  typingUsers: string[];

  // User presence
  userPresence: UserPresence[];

  // UI state
  sidebarCollapsed: boolean;
  activePanel: 'chat' | 'ai' | 'comments' | 'tools';

  // File storage
  fileStorageService: FileStorageService;
  uploadDocument: (file: File, metadata: any) => Promise<Document>;

  // Actions
  setCurrentDocument: (document: Document) => void;
  setCurrentPage: (page: number) => void;
  setScale: (scale: number) => void;
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  setSelectedAnnotation: (annotation: Annotation | null) => void;
  setCurrentTool: (tool: AnnotationTool) => void;
  addChatMessage: (message: ChatMessage) => void;
  setIsTyping: (isTyping: boolean) => void;
  updateUserPresence: (presence: UserPresence) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActivePanel: (panel: 'chat' | 'ai' | 'comments' | 'tools') => void;
  loadInitialData: () => Promise<void>;
  loadDocument: (documentId: string) => Promise<void>;
  clearError: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  // Initial state
  currentDocument: null,
  documents: [],
  users: [],
  currentPage: 1,
  totalPages: 1,
  scale: 1.0,
  isLoading: false,
  error: null,
  annotations: [],
  selectedAnnotation: null,
  isAnnotating: false,
  currentTool: {
    id: 'select',
    name: 'Select',
    icon: 'MousePointer',
    type: 'select'
  },
  chatMessages: [],
  isTyping: false,
  typingUsers: [],
  userPresence: [],
  sidebarCollapsed: false,
  activePanel: 'chat',
  fileStorageService: new FileStorageService(
    import.meta.env.VITE_API_URL || 'http://localhost:3001',
    securityConfig.upload
  ),

  // Actions
  setCurrentDocument: (document) => set({ currentDocument: document }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setScale: (scale) => set({ scale: Math.max(0.5, Math.min(3.0, scale)) }),
  
  addAnnotation: (annotation) => 
    set((state) => ({ annotations: [...state.annotations, annotation] })),
  
  updateAnnotation: (id, updates) => 
    set((state) => ({
      annotations: state.annotations.map(ann => 
        ann.id === id ? { ...ann, ...updates } : ann
      )
    })),
  
  deleteAnnotation: (id) => 
    set((state) => ({
      annotations: state.annotations.filter(ann => ann.id !== id)
    })),
  
  setSelectedAnnotation: (annotation) => set({ selectedAnnotation: annotation }),
  
  setCurrentTool: (tool) => set({ currentTool: tool }),
  
  addChatMessage: (message) => 
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  
  setIsTyping: (isTyping) => set({ isTyping }),
  
  updateUserPresence: (presence) => 
    set((state) => ({
      userPresence: [
        ...state.userPresence.filter(p => p.userId !== presence.userId),
        presence
      ]
    })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  loadInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Load users
      const usersResponse = await fetch('/data/users.json');
      const users = await usersResponse.json();

      // Load documents
      const documentsResponse = await fetch('/data/documents.json');
      const documents = await documentsResponse.json();

      // Load chat messages
      const chatResponse = await fetch('/data/chat-messages.json');
      const chatMessages = await chatResponse.json();

      // Load annotations
      const annotationsResponse = await fetch('/data/annotations.json');
      const annotations = await annotationsResponse.json();

      set({
        users,
        documents,
        chatMessages,
        annotations,
        currentDocument: documents[0] || null,
        totalPages: documents[0]?.totalPages || 1,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to load initial data:', error);
      set({
        isLoading: false,
        error: 'Failed to load application data. Please refresh the page.'
      });
    }
  },

  loadDocument: async (documentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { documents } = get();

      // First check if document is already loaded
      let document = documents.find(doc => doc.id === documentId);

      if (!document) {
        // Simulate API call to fetch document
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock document data
        document = {
          id: documentId,
          title: `Document ${documentId}`,
          fileName: 'sample-report.pdf',
          filePath: '/documents/sample-report.pdf',
          uploadDate: new Date().toISOString(),
          uploadedBy: 'user-1',
          fileSize: '2.4 MB',
          totalPages: 15,
          status: 'active',
          participants: ['user-1'],
          lastModified: new Date().toISOString(),
          description: 'Sample PDF document for testing',
          tags: ['sample', 'test']
        };
      }

      // Load document-specific data (annotations, chat messages, etc.)
      const annotationsResponse = await fetch(`/data/annotations.json?documentId=${documentId}`);
      const annotations = await annotationsResponse.json();

      const chatResponse = await fetch(`/data/chat-messages.json?documentId=${documentId}`);
      const chatMessages = await chatResponse.json();

      // Debug logging (can be removed in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('Document loaded successfully:', document);
        console.log('Document file path:', document.filePath);
      }

      set({
        currentDocument: document,
        annotations,
        chatMessages,
        totalPages: document.totalPages,
        currentPage: 1,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to load document:', error);
      set({
        isLoading: false,
        error: 'Failed to load document. Please try again.'
      });
    }
  },

  clearError: () => set({ error: null }),

  uploadDocument: async (file, metadata) => {
    set({ isLoading: true, error: null });
    try {
      const { fileStorageService } = get();
      const response = await fileStorageService.uploadFile(file, metadata);
      
      // Create document from response
      const newDocument: Document = {
        id: response.id,
        title: metadata.title || response.name,
        fileName: response.name,
        filePath: response.url,
        uploadDate: response.createdAt,
        uploadedBy: 'current-user', // Should be actual user ID
        fileSize: `${(response.size / 1024 / 1024).toFixed(1)} MB`,
        totalPages: 0, // Will be updated after processing
        status: 'active',
        participants: ['current-user'],
        lastModified: response.createdAt,
        description: metadata.description || '',
        tags: metadata.tags || []
      };
      
      // Add to documents list
      set(state => ({
        documents: [...state.documents, newDocument],
        isLoading: false
      }));
      
      return newDocument;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  }
}));
