import { useRef, useEffect, useState } from 'react';
import '../styles/DocumentPreview.css';

const DocumentPreview: React.FC = () => {
  const docRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const docElement = docRef.current;
    if (!docElement) return;

    const rect = docElement.getBoundingClientRect();
    const docCenterX = rect.left + rect.width / 2;
    const docCenterY = rect.top + rect.height / 2;

    // Calculate the angle between cursor and document center
    const deltaX = mousePosition.x - docCenterX;
    const deltaY = mousePosition.y - docCenterY;

    // Calculate distance from cursor to document center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = Math.max(window.innerWidth, window.innerHeight) / 2;
    const distanceFactor = Math.min(distance / maxDistance, 1);

    // Calculate rotation angles based on cursor position
    const rotateY = (deltaX / maxDistance) * 30;
    const rotateX = -(deltaY / maxDistance) * 20;

    // Apply smooth transition
    docElement.style.transform = `
      perspective(1000px)
      rotateY(${rotateY}deg)
      rotateX(${rotateX}deg)
      scale(${1 - distanceFactor * 0.05})
    `;
  }, [mousePosition]);

  return (
    <div className="hero-visual">
      <div className="document-preview" ref={docRef}>
        <div className="doc-header">
          <div className="doc-controls"></div>
          <div className="doc-controls"></div>
          <div className="doc-controls"></div>
        </div>
        <div className="doc-content">
          <div className="doc-line" style={{ width: '80%' }}></div>
          <div className="doc-line" style={{ width: '60%' }}></div>
          <div className="doc-line highlighted" style={{ width: '90%' }}></div>
          <div className="doc-line" style={{ width: '75%' }}></div>
          <div className="doc-line" style={{ width: '85%' }}></div>
          <div className="doc-line" style={{ width: '40%' }}></div>
          <div className="doc-line" style={{ width: '95%' }}></div>
          <div className="doc-line" style={{ width: '70%' }}></div>
          <div className="signature-area">Sign Here</div>
        </div>
      </div>
      
      <div className="floating-cursors">
        <div className="cursor-dot"></div>
        <div className="cursor-dot"></div>
      </div>
    </div>
  );
};

export default DocumentPreview;
