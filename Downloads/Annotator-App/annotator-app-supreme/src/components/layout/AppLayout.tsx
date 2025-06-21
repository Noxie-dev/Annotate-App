import { lazy, Suspense } from 'react';
import { useDocumentStore } from '@/stores/document-store';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { LoadingScreen } from './LoadingScreen';

// Lazy load the PDF viewer to reduce initial bundle size
const PDFViewer = lazy(() => import('@/components/pdf/PDFViewer').then(module => ({ default: module.PDFViewer })));

export function AppLayout() {
  const { isLoading, currentDocument, sidebarCollapsed } = useDocumentStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1419]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />
        
        {/* Content Area */}
        <div className="flex-1 flex">
          {/* PDF Viewer */}
          <div className="flex-1 bg-[#0f1419] relative">
            {currentDocument ? (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading PDF viewer...</p>
                  </div>
                </div>
              }>
                <PDFViewer />
              </Suspense>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 bg-[#1a1f2e] rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg 
                      className="w-12 h-12 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">
                    No Document Selected
                  </h3>
                  <p className="text-gray-400">
                    Select a document to start collaborating
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
