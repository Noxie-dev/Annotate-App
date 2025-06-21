import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker - use CDN to avoid bundling the worker
// Note: PDF.js v5.x uses .mjs extension instead of .min.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

console.log('PDF.js version:', pdfjs.version);
console.log('PDF.js worker source:', pdfjs.GlobalWorkerOptions.workerSrc);

export function PDFTestViewer() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerStatus, setWorkerStatus] = useState<string>('checking...');

  const testFilePath = '/documents/sample-report.pdf';

  useEffect(() => {
    // Test worker loading
    const testWorker = async () => {
      try {
        console.log('Testing PDF.js worker...');
        const response = await fetch(pdfjs.GlobalWorkerOptions.workerSrc);
        if (response.ok) {
          setWorkerStatus('loaded');
          console.log('PDF.js worker loaded successfully');
        } else {
          setWorkerStatus(`failed: ${response.status}`);
          console.error('PDF.js worker failed to load:', response.status);
        }
      } catch (error) {
        setWorkerStatus(`error: ${error.message}`);
        console.error('PDF.js worker error:', error);
      }
    };

    testWorker();
  }, []);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully, pages:', numPages);
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    console.error('File path:', testFilePath);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  };

  const handlePageLoadSuccess = () => {
    console.log('Page loaded successfully');
  };

  const handlePageLoadError = (error: Error) => {
    console.error('Page load error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">PDF Test Viewer</h1>
        
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Debug Info</h2>
          <div className="text-sm text-gray-300 space-y-1">
            <p>File Path: {testFilePath}</p>
            <p>PDF.js Version: {pdfjs.version}</p>
            <p>Worker Source: {pdfjs.GlobalWorkerOptions.workerSrc}</p>
            <p>Worker Status: {workerStatus}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
            <p>Total Pages: {numPages}</p>
            <p>Current Page: {pageNumber}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 min-h-96 flex items-center justify-center">
          {loading && (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-semibold">Error Loading PDF</p>
              <p className="text-gray-600 mt-2">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="text-center">
              <Document
                file={testFilePath}
                onLoadSuccess={handleDocumentLoadSuccess}
                onLoadError={handleDocumentLoadError}
                loading={null}
                error={null}
              >
                <Page
                  pageNumber={pageNumber}
                  onLoadSuccess={handlePageLoadSuccess}
                  onLoadError={handlePageLoadError}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
              </Document>
              
              {numPages > 1 && (
                <div className="mt-4 flex items-center justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                    disabled={pageNumber <= 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                    disabled={pageNumber >= numPages}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
