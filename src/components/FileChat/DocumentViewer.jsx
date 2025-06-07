import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Zap, ZoomIn, ZoomOut, Plus } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { fabric } from 'fabric';
import useMousePosition from '../../hooks/useMousePosition';
import { useWebSocket } from './hooks/useWebSocket';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

const DocumentViewer = ({ documentUrl, onAnnotationAdd }) => {
  const viewerRef = useRef(null);
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const { x, y } = useMousePosition();
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { send: sendToWebSocket } = useWebSocket('ws://localhost:3001/ws');

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        const loadingTask = pdfjsLib.getDocument(documentUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        await renderPage(1, pdf);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load document. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [documentUrl]);

  const renderPage = async (pageNum, doc = pdfDoc) => {
    if (!doc) return;

    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoom });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Initialize or update Fabric.js canvas
      if (!fabricRef.current) {
        fabricRef.current = new fabric.Canvas('annotationLayer', {
          isDrawingMode: false,
          width: viewport.width,
          height: viewport.height
        });

        // Setup fabric event listeners
        fabricRef.current.on('object:added', handleAnnotationAdded);
        fabricRef.current.on('object:modified', handleAnnotationModified);
      } else {
        fabricRef.current.setDimensions({
          width: viewport.width,
          height: viewport.height
        });
      }

      setCurrentPage(pageNum);
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Failed to render page. Please try again.');
    }
  };

  const handleAnnotationAdded = (e) => {
    if (!e.target) return;

    const annotation = {
      type: e.target.type,
      left: e.target.left,
      top: e.target.top,
      width: e.target.width,
      height: e.target.height,
      page: currentPage,
      color: e.target.stroke || e.target.fill,
      text: e.target.type === 'textbox' ? e.target.text : ''
    };

    onAnnotationAdd?.(annotation);
    sendToWebSocket('annotation', { type: 'add', data: annotation });
  };

  const handleAnnotationModified = (e) => {
    if (!e.target) return;
    
    const annotation = {
      id: e.target.id,
      type: e.target.type,
      left: e.target.left,
      top: e.target.top,
      width: e.target.width,
      height: e.target.height,
      page: currentPage,
      color: e.target.stroke || e.target.fill,
      text: e.target.type === 'textbox' ? e.target.text : ''
    };

    sendToWebSocket('annotation', { type: 'modify', data: annotation });
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
    setZoom(newZoom);
    renderPage(currentPage);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
    setZoom(newZoom);
    renderPage(currentPage);
  };

  const toggleAnnotationMode = () => {
    setIsAnnotating(!isAnnotating);
    if (fabricRef.current) {
      fabricRef.current.isDrawingMode = !isAnnotating;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-700 m-4 rounded-xl border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10"></div>
        
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-black/40 backdrop-blur-lg hover:bg-black/60 transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-black/40 backdrop-blur-lg hover:bg-black/60 transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={toggleAnnotationMode}
            className={`p-2 rounded-lg backdrop-blur-lg transition-colors ${
              isAnnotating ? 'bg-cyan-500/40 text-cyan-200' : 'bg-black/40 hover:bg-black/60'
            }`}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Document Viewer */}
        <div 
          ref={viewerRef}
          className="relative w-full h-full flex items-center justify-center p-8"
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
              <div className="loading-spinner"></div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
              <div className="text-red-400 text-center">
                <p className="mb-2">{error}</p>
                <button 
                  onClick={() => renderPage(currentPage)}
                  className="px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="relative inline-block">
            <canvas
              ref={canvasRef}
              className="shadow-2xl rounded-lg"
            />
            <canvas
              id="annotationLayer"
              className="absolute inset-0 pointer-events-auto"
            />
          </div>
        </div>

        <CollaborationIndicators />
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-center space-x-4 mb-4 text-sm text-gray-400">
        <button
          onClick={() => currentPage > 1 && renderPage(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <span>Page {currentPage} of {numPages}</span>
        <button
          onClick={() => currentPage < numPages && renderPage(currentPage + 1)}
          disabled={currentPage >= numPages || loading}
          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const CollaborationIndicators = () => (
  <div className="absolute top-4 right-4 space-y-2">
    <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-lg px-3 py-2 rounded-full">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span className="text-xs text-white">Live Session</span>
    </div>
    <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-lg px-3 py-2 rounded-full">
      <Zap size={12} className="text-yellow-400" />
      <span className="text-xs text-white">Real-time Sync</span>
    </div>
  </div>
);

export default DocumentViewer;