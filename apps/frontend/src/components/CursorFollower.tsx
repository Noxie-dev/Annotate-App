import { useEffect, useState, useRef } from 'react';
import '../styles/CursorFollower.css';

const CursorFollower: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [followerPosition, setFollowerPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  useEffect(() => {
    const animateCursor = () => {
      const speed = 0.1;
      const x = followerPosition.x + (mousePosition.x - followerPosition.x) * speed;
      const y = followerPosition.y + (mousePosition.y - followerPosition.y) * speed;
      
      setFollowerPosition({ x, y });
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${x - 10}px, ${y - 10}px)`;
      }
      
      requestAnimationFrame(animateCursor);
    };
    
    const animationId = requestAnimationFrame(animateCursor);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [mousePosition, followerPosition]);
  
  return <div className="cursor-follower" ref={cursorRef}></div>;
};

export default CursorFollower;

