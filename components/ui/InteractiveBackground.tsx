"use client";

import { useEffect, useRef } from "react";

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Config
    const gridSize = 50; // Larger grid = fewer points = better performance
    let cols = 0;
    let rows = 0;
    const points: { x: number; y: number; originX: number; originY: number }[] = [];

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      cols = Math.ceil(width / gridSize) + 1;
      rows = Math.ceil(height / gridSize) + 1;
      
      points.length = 0;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;
          points.push({ x, y, originX: x, originY: y });
        }
      }
    };
    
    window.addEventListener("resize", init);
    init();

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update points
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const dx = mouse.x - p.originX;
        const dy = mouse.y - p.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 300; // Radius of effect

        if (dist < maxDist) {
          const angle = Math.atan2(dy, dx);
          const force = (maxDist - dist) / maxDist;
          // Move points gently towards mouse (attraction) but with some noise/float
          const moveDist = force * 40;
          p.x = p.originX + Math.cos(angle) * moveDist * 0.5;
          p.y = p.originY + Math.sin(angle) * moveDist * 0.5;
        } else {
          // Return to origin with easing
          p.x += (p.originX - p.x) * 0.05;
          p.y += (p.originY - p.y) * 0.05;
        }
      }

      // Draw Grid Lines (Dynamic Network)
      ctx.lineWidth = 1;

      // Draw horizontal lines
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const index = i * rows + j;
          const p = points[index];

          // Check neighbors for connections
          // Right
          if (i < cols - 1) {
            const rightIndex = (i + 1) * rows + j;
            const rightP = points[rightIndex];
            const dist = Math.hypot(p.x - rightP.x, p.y - rightP.y);
            // Opacity based on distance deviation from grid size
            const opacity = Math.max(0.02, 0.1 - (dist - gridSize) * 0.002);
            ctx.strokeStyle = `rgba(99, 179, 237, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(rightP.x, rightP.y);
            ctx.stroke();
          }
          // Bottom
          if (j < rows - 1) {
            const bottomIndex = i * rows + (j + 1);
            const bottomP = points[bottomIndex];
            const dist = Math.hypot(p.x - bottomP.x, p.y - bottomP.y);
            const opacity = Math.max(0.02, 0.1 - (dist - gridSize) * 0.002);
            ctx.strokeStyle = `rgba(99, 179, 237, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(bottomP.x, bottomP.y);
            ctx.stroke();
          }

          // Draw mouse connections (dynamic "lightning" or lines to mouse)
          const distToMouse = Math.hypot(mouse.x - p.x, mouse.y - p.y);
          if (distToMouse < 200) {
            ctx.strokeStyle = `rgba(99, 179, 237, ${0.2 * (1 - distToMouse / 200)})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
          
          // Draw little dots at intersections near mouse
          if (distToMouse < 250) {
             ctx.fillStyle = `rgba(99, 179, 237, ${0.5 * (1 - distToMouse / 250)})`;
             ctx.beginPath();
             ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
             ctx.fill();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", init);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[0]" 
      style={{ mixBlendMode: "screen" }} 
    />
  );
}
