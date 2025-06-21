import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useDocumentStore } from '@/stores/document-store';
import { Button } from '@/components/ui/button';
import { AnnotationLayer } from '@/components/annotation/AnnotationLayer';
import { PDFControls } from './PDFControls';
import { UserCursors } from '@/components/communication/UserCursors';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  Maximize
} from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker - use CDN to avoid bundling the worker
// Note: PDF.js v5.x uses .mjs extension instead of .min.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

export function PDFViewer() {
  const {
    currentDocument,
    currentPage,
    totalPages,
    scale,
    setScale,
    setCurrentPage,
    annotations
  } = useDocumentStore();

  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up loading timeout
  useEffect(() => {
    if (loading && currentDocument) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      // Set a 30-second timeout for PDF loading
      loadingTimeoutRef.current = setTimeout(() => {
        if (loading) {
          setError('PDF loading timed out. Please check your connection and try again.');
          setLoading(false);
        }
      }, 30000);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loading, currentDocument]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully, pages:', numPages);

    // Clear loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    console.error('Document file path:', currentDocument?.filePath);

    // Clear loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    setError(`Failed to load PDF document: ${error.message}`);
    setLoading(false);
  };

  const handleZoomIn = () => {
    setScale(scale + 0.2);
  };

  const handleZoomOut = () => {
    setScale(scale - 0.2);
  };

  const handleDownload = () => {
    if (currentDocument) {
      const link = document.createElement('a');
      link.href = currentDocument.filePath;
      link.download = currentDocument.fileName;
      link.click();
    }
  };

  const pageAnnotations = annotations.filter(ann => ann.pageNumber === currentPage);

  if (!currentDocument) {
    return null;
  }

  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('PDFViewer - Current document:', currentDocument);
    console.log('PDFViewer - File path:', currentDocument.filePath);
    console.log('PDFViewer - Loading state:', loading);
    console.log('PDFViewer - Error state:', error);
  }

  return (
    <div className="relative h-full flex flex-col bg-[#0f1419]">
      {/* PDF Controls */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-[#1a1f2e] rounded-lg border border-gray-700 p-2 flex items-center space-x-2 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="text-gray-400 hover:text-gray-200"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <div className="text-sm text-gray-300 px-2">
            {Math.round(scale * 100)}%
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
            className="text-gray-400 hover:text-gray-200"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <div className="h-4 w-px bg-gray-700" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-gray-400 hover:text-gray-200"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-200"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* PDF Document Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center relative"
      >
        {loading && (
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading document...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-400 mb-2">Error Loading Document</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Force re-render to retry loading
                  window.location.reload();
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Retry Loading
              </Button>
              <div className="text-xs text-gray-500 bg-gray-800/50 p-3 rounded-lg">
                <p className="font-medium mb-2">Troubleshooting tips:</p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Check your internet connection</li>
                  <li>Ensure the PDF file exists and is accessible</li>
                  <li>Verify PDF.js worker is loading correctly</li>
                  <li>Try refreshing the page</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="relative">
            <Document
              file={currentDocument.filePath}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              loading={null}
              error={null}
              className="relative"
            >
              <div className="relative bg-white shadow-2xl">
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                  className="relative"
                />
                
                {/* Annotation Layer */}
                <AnnotationLayer 
                  annotations={pageAnnotations}
                  scale={scale}
                  pageNumber={currentPage}
                />
                
                {/* User Cursors */}
                <UserCursors 
                  pageNumber={currentPage}
                  scale={scale}
                />
              </div>
            </Document>
          </div>
        )}
      </div>

      {/* PDF Navigation */}
      <PDFControls />
    </div>
  );
}
