import React, { useEffect, useRef } from 'react';

const CursorFollower: React.FC = () => {
  const followerRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    let trailX = 0;
    let trailY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animateCursor = () => {
      // Main follower with smooth lag
      const speed = 0.15;
      followerX += (mouseX - followerX) * speed;
      followerY += (mouseY - followerY) * speed;

      // Trail with more lag
      const trailSpeed = 0.08;
      trailX += (mouseX - trailX) * trailSpeed;
      trailY += (mouseY - trailY) * trailSpeed;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate(${followerX - 12}px, ${followerY - 12}px)`;
      }

      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trailX - 8}px, ${trailY - 8}px)`;
      }

      requestAnimationFrame(animateCursor);
    };

    document.addEventListener('mousemove', handleMouseMove);
    const animationId = requestAnimationFrame(animateCursor);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      {/* Trail cursor */}
      <div
        ref={trailRef}
        className="fixed w-4 h-4 bg-cyan-400/30 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{ transition: 'transform 0.1s ease-out' }}
        aria-hidden="true"
      />
      
      {/* Main cursor follower */}
      <div
        ref={followerRef}
        className="fixed w-6 h-6 border-2 border-cyan-400/60 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{ transition: 'transform 0.1s ease-out' }}
        aria-hidden="true"
      />
    </>
  );
};

export default CursorFollower;
