import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentStore } from '@/stores/document-store';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DocumentViewerPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { 
    currentDocument, 
    isLoading, 
    error, 
    loadDocument,
    clearError 
  } = useDocumentStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login', { 
        state: { redirect: `/document/${documentId}` },
        replace: true 
      });
      return;
    }

    if (documentId && documentId !== currentDocument?.id) {
      loadDocument(documentId);
    }
  }, [documentId, isAuthenticated, currentDocument?.id, loadDocument, navigate]);

  // Check permissions
  const hasViewPermission = user?.permissions.includes('view_documents');
  
  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  if (!hasViewPermission) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-200 mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You don't have permission to view this document.
          </p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Alert className="bg-red-900/20 border-red-800 mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
          <div className="space-x-4">
            <Button 
              onClick={() => {
                clearError();
                if (documentId) {
                  loadDocument(documentId);
                }
              }}
              variant="outline"
              className="bg-[#1a1f2e] border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-200 mb-2">Document Not Found</h1>
          <p className="text-gray-400 mb-6">
            The document you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Render the existing AppLayout which contains the PDF viewer and collaboration features
  return <AppLayout />;
}
