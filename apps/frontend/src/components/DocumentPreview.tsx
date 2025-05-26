import React, { useEffect, useRef, useState } from 'react';

const DocumentPreview: React.FC = () => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (previewRef.current) {
        const rect = previewRef.current.getBoundingClientRect();

        // Calculate document center
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate mouse position relative to document center
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Calculate rotation angles to make document "look at" the mouse
        // Normalize the deltas and apply rotation limits
        const maxRotationY = 25; // Maximum Y rotation in degrees
        const maxRotationX = 15; // Maximum X rotation in degrees

        // Calculate rotation based on distance from center
        const rotateY = (deltaX / (rect.width / 2)) * maxRotationY;
        const rotateX = -(deltaY / (rect.height / 2)) * maxRotationX;

        // Clamp rotation values to prevent extreme angles
        const clampedRotateY = Math.max(-maxRotationY, Math.min(maxRotationY, rotateY));
        const clampedRotateX = Math.max(-maxRotationX, Math.min(maxRotationX, rotateX));

        setMousePosition({
          x: clampedRotateY,
          y: clampedRotateX,
        });
      }
    };

    // Listen to mouse movement on the entire window for better tracking
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={previewRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Document container with exact 350px × 500px dimensions */}
      <div
        className="document-preview relative mx-auto transition-all duration-300 ease-out"
        style={{
          width: '350px',
          height: '500px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${mousePosition.y}deg) ${isHovered ? 'scale(1.05)' : 'scale(1)'}`,
        }}
      >
        {/* Document Header with macOS-style controls */}
        <div className="doc-header">
          <div className="doc-controls doc-controls-red"></div>  {/* Red dot */}
          <div className="doc-controls doc-controls-yellow"></div>  {/* Yellow dot */}
          <div className="doc-controls doc-controls-green"></div>  {/* Green dot */}
        </div>

        {/* Document content */}
        <div className="doc-content">
          {/* Document lines with exact specifications */}
          <div className="doc-line" style={{width: '80%'}}></div>  {/* 229px */}
          <div className="doc-line" style={{width: '60%'}}></div>  {/* 172px */}
          <div className="doc-line highlighted" style={{width: '90%'}}></div>  {/* 257px - highlighted */}
          <div className="doc-line" style={{width: '75%'}}></div>  {/* 215px */}
          <div className="doc-line" style={{width: '85%'}}></div>  {/* 243px */}
          <div className="doc-line" style={{width: '40%'}}></div>  {/* 114px */}
          <div className="doc-line" style={{width: '95%'}}></div>  {/* 272px */}
          <div className="doc-line" style={{width: '70%'}}></div>  {/* 200px */}

          {/* Signature area with exact positioning */}
          <div className="signature-area">
            Sign Here
          </div>
        </div>

        {/* Floating cursors positioned at 60% from left, 50% from top */}
        <div className="floating-cursors">
          <div className="cursor-dot cursor-dot-cyan"></div>
          <div className="cursor-dot cursor-dot-gold"></div>
        </div>
      </div>

      {/* Glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-lg blur-xl transition-opacity duration-300 -z-10 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${mousePosition.y}deg) scale(1.1)`,
        }}
      />
    </div>
  );
};

export default DocumentPreview;
