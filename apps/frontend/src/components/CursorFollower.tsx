import React, { useEffect, useRef } from 'react';

const CursorFollower: React.FC = () => {
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mathematical Implementation with Linear Interpolation (lerp)
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animateCursor = () => {
      // Linear interpolation with exponential decay effect
      // Mathematical Formula: newPosition = currentPosition + (targetPosition - currentPosition) × speed
      const speed = 0.1; // Speed factor creates exponential decay

      followerX += (mouseX - followerX) * speed;
      followerY += (mouseY - followerY) * speed;

      if (followerRef.current) {
        // The -10px offset centers the 20px dot on the cursor position
        followerRef.current.style.transform = `translate(${followerX - 10}px, ${followerY - 10}px)`;
      }

      // requestAnimationFrame ensures 60fps smooth animation
      requestAnimationFrame(animateCursor);
    };

    // Check if device supports hover (not touch-only)
    const supportsHover = window.matchMedia('(hover: hover)').matches;

    if (supportsHover) {
      document.addEventListener('mousemove', handleMouseMove);
      animateCursor();
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Hide on mobile for performance (touch-only devices)
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  if (isMobile) return null;

  return (
    <div
      ref={followerRef}
      className="cursor-follower"
      style={{
        position: 'fixed',
        width: '20px',
        height: '20px',
        background: 'var(--sky-blue)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.6,
        transition: 'transform 0.1s ease-out',
        mixBlendMode: 'difference'
      }}
      aria-hidden="true"
    />
  );
};

export default CursorFollower;
