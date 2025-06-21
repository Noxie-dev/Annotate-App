import { useEffect, useRef, useState } from 'react';
import { useDocumentStore } from '@/stores/document-store';
import { Annotation } from '@/types';

interface AnnotationLayerProps {
  annotations: Annotation[];
  scale: number;
  pageNumber: number;
}

export function AnnotationLayer({ annotations, scale, pageNumber }: AnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    currentTool, 
    addAnnotation, 
    selectedAnnotation, 
    setSelectedAnnotation,
    users 
  } = useDocumentStore();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render annotations
    annotations.forEach(annotation => {
      renderAnnotation(ctx, annotation, scale);
    });
  }, [annotations, scale]);

  const renderAnnotation = (ctx: CanvasRenderingContext2D, annotation: Annotation, scale: number) => {
    const user = users.find(u => u.id === annotation.userId);
    const color = user?.color || annotation.color;

    ctx.save();
    
    switch (annotation.type) {
      case 'highlight':
        ctx.fillStyle = color + '40'; // Semi-transparent
        ctx.fillRect(
          annotation.x * scale,
          annotation.y * scale,
          (annotation.width || 0) * scale,
          (annotation.height || 0) * scale
        );
        break;

      case 'rectangle':
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(
          annotation.x * scale,
          annotation.y * scale,
          (annotation.width || 0) * scale,
          (annotation.height || 0) * scale
        );
        break;

      case 'drawing':
        if (annotation.path) {
          ctx.strokeStyle = color;
          ctx.lineWidth = (annotation.strokeWidth || 2) * scale;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          const path = new Path2D(annotation.path);
          ctx.stroke(path);
        }
        break;

      case 'text-comment':
        // Render comment pin
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(annotation.x * scale, annotation.y * scale, 8 * scale, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add number or icon in the pin
        ctx.fillStyle = 'white';
        ctx.font = `${10 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💬', annotation.x * scale, annotation.y * scale);
        break;
    }

    // Highlight selected annotation
    if (selectedAnnotation?.id === annotation.id) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        (annotation.x - 5) * scale,
        (annotation.y - 5) * scale,
        ((annotation.width || 20) + 10) * scale,
        ((annotation.height || 20) + 10) * scale
      );
    }

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool.type === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool.type === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setCurrentPath(prev => [...prev, { x, y }]);

    // Draw temporary path
    const ctx = canvas.getContext('2d');
    if (ctx && currentTool.type === 'draw') {
      ctx.strokeStyle = currentTool.color || '#3b82f6';
      ctx.lineWidth = (currentTool.size || 2) * scale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (currentPath.length > 1) {
        const prevPoint = currentPath[currentPath.length - 2];
        ctx.beginPath();
        ctx.moveTo(prevPoint.x * scale, prevPoint.y * scale);
        ctx.lineTo(x * scale, y * scale);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    setIsDrawing(false);

    if (currentPath.length < 2) return;

    const newAnnotation: Annotation = {
      id: `annotation-${Date.now()}`,
      type: currentTool.type as any,
      pageNumber,
      x: currentPath[0].x,
      y: currentPath[0].y,
      color: currentTool.color || '#3b82f6',
      userId: 'user-1', // Current user
      timestamp: new Date().toISOString(),
      strokeWidth: currentTool.size || 2,
    };

    if (currentTool.type === 'draw') {
      // Convert path to SVG path string
      const pathString = currentPath.reduce((acc, point, index) => {
        if (index === 0) return `M${point.x},${point.y}`;
        return acc + ` L${point.x},${point.y}`;
      }, '');
      newAnnotation.path = pathString;
    } else if (currentTool.type === 'rectangle') {
      const endPoint = currentPath[currentPath.length - 1];
      newAnnotation.width = Math.abs(endPoint.x - currentPath[0].x);
      newAnnotation.height = Math.abs(endPoint.y - currentPath[0].y);
    }

    addAnnotation(newAnnotation);
    setCurrentPath([]);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool.type !== 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Find clicked annotation
    const clickedAnnotation = annotations.find(annotation => {
      return (
        x >= annotation.x &&
        x <= annotation.x + (annotation.width || 20) &&
        y >= annotation.y &&
        y <= annotation.y + (annotation.height || 20)
      );
    });

    setSelectedAnnotation(clickedAnnotation || null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800 * scale}
      height={1000 * scale}
      className="absolute top-0 left-0 cursor-crosshair"
      style={{
        width: `${800 * scale}px`,
        height: `${1000 * scale}px`,
        pointerEvents: 'auto'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    />
  );
}
