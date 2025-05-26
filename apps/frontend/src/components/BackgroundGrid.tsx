import React, { useEffect, useRef } from 'react';

const BackgroundGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;
    let time = 0;

    const drawEnhancedEffects = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add subtle floating particles for depth
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(time * 0.001 + i) * 100 + canvas.width / 2 + i * 20) % canvas.width;
        const y = (Math.cos(time * 0.0015 + i) * 50 + canvas.height / 2 + i * 15) % canvas.height;
        const pulse = Math.sin(time * 0.002 + i) * 0.5 + 0.5;
        const radius = 1 + pulse * 2;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add subtle glow effects at corners
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.2, 0,
        canvas.width * 0.8, canvas.height * 0.2, 300
      );
      gradient.addColorStop(0, 'rgba(60, 166, 229, 0.1)');
      gradient.addColorStop(1, 'rgba(60, 166, 229, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add data flow lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const progress = (time * 0.001 + i * 0.2) % 1;
        const startX = -100;
        const endX = canvas.width + 100;
        const y = (canvas.height / 6) * (i + 1);

        ctx.beginPath();
        ctx.moveTo(startX + progress * (endX - startX), y);
        ctx.lineTo(startX + progress * (endX - startX) + 100, y);
        ctx.stroke();
      }

      time += 1;
      animationId = requestAnimationFrame(drawEnhancedEffects);
    };

    drawEnhancedEffects();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-40"
      aria-hidden="true"
    />
  );
};

export default BackgroundGrid;
