
import React, { useEffect, useRef } from 'react';

const ParticleGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width: number;
    let height: number;
    let mouse = { x: -2000, y: -2000 };

    const dots: { x: number; y: number; originX: number; originY: number }[] = [];
    const spacing = 40;
    const mouseRadius = 250;

    const init = () => {
      // Use client dimensions of the canvas which is set to w-full h-full
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      dots.length = 0;
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          dots.push({ x, y, originX: x, originY: y });
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Track mouse position relative to the canvas element
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      dots.forEach((dot) => {
        const dx = mouse.x - dot.originX;
        const dy = mouse.y - dot.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let shiftX = 0;
        let shiftY = 0;
        let scale = 1;

        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          const easedForce = force * force * force;
          shiftX = dx * easedForce * 0.8;
          shiftY = dy * easedForce * 0.8;
          scale = 1 + easedForce * 3.5;
        }

        dot.x = dot.originX + shiftX;
        dot.y = dot.originY + shiftY;

        const alpha = dist < mouseRadius ? 0.4 + (0.4 * (1 - dist / mouseRadius)) : 0.12;
        ctx.fillStyle = `rgba(183, 148, 244, ${alpha})`;
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.4 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', init);
    // Bind mousemove to window but calculate relative to canvas
    window.addEventListener('mousemove', onMouseMove);
    init();
    render();

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ParticleGrid;
