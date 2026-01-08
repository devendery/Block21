"use client";

import { useEffect, useRef } from "react";

export default function InteractiveGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: Particle[] = [];
    let mouse = { x: -1000, y: -1000 };

    // Configuration
    const GRID_SPACING = 50;
    const CONNECTION_DISTANCE = 120;
    const MOUSE_RADIUS = 200;
    const RETURN_SPEED = 0.05;
    const MOUSE_FORCE = 0.15;

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = 0;
        this.vy = 0;
      }

      update() {
        // Distance from mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Mouse interaction (Pull/Distort effect - "Emerging Chain")
        if (distance < MOUSE_RADIUS) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
          const directionX = forceDirectionX * force * MOUSE_FORCE * 50; // Pull towards mouse
          const directionY = forceDirectionY * force * MOUSE_FORCE * 50;

          this.vx += directionX;
          this.vy += directionY;
        }

        // Return to base position (Elasticity)
        const homeDx = this.baseX - this.x;
        const homeDy = this.baseY - this.y;
        
        this.vx += homeDx * RETURN_SPEED;
        this.vy += homeDy * RETURN_SPEED;

        // Friction
        this.vx *= 0.85;
        this.vy *= 0.85;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "rgba(99, 179, 237, 0.18)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      particles = [];
      for (let y = 0; y < height; y += GRID_SPACING) {
        for (let x = 0; x < width; x += GRID_SPACING) {
          particles.push(new Particle(x, y));
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      if (mouse.x > -500 && mouse.y > -500) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS * 0.9);
        g.addColorStop(0, "rgba(99,179,237,0.25)");
        g.addColorStop(1, "rgba(99,179,237,0)");
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
      }

      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      // Draw connections (The "Chain")
      ctx.strokeStyle = "rgba(99, 179, 237, 0.08)";
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Optimization: Only check neighbors roughly
        // For a true grid, we can just connect to right and bottom neighbors mathematically, 
        // but for the "broken" effect when distorted, distance check is better visually.
        
        // Let's connect to nearby particles to form the "web"
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            // Simple distance check is expensive O(N^2), but with grid initialization we can optimize.
            // However, with ~400-800 particles, it might be okay. 
            // Let's optimize by checking index proximity if grid is sorted? 
            // Or just check distance < GRID_SPACING * 1.5
            
            if (Math.abs(dx) < GRID_SPACING * 1.5 && Math.abs(dy) < GRID_SPACING * 1.5) {
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < CONNECTION_DISTANCE) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
      }

      // Mouse lightning lines
      if (mouse.x > -500 && mouse.y > -500) {
        ctx.lineWidth = 0.6;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS) {
            const opacity = 0.25 * (1 - dist / MOUSE_RADIUS);
            ctx.strokeStyle = `rgba(99, 179, 237, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    init();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
