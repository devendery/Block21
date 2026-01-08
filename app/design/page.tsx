'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function DesignPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTheme, setActiveTheme] = useState<'neon' | 'crypto' | 'cute'>('neon');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Snake configuration
    const snake = {
      length: 12,
      segments: [] as { x: number; y: number; angle: number }[],
      headX: canvas.width / 2,
      headY: canvas.height / 2,
      angle: 0,
      targetAngle: 0,
    };

    // Initialize segments
    for (let i = 0; i < snake.length; i++) {
      snake.segments.push({ x: canvas.width / 2 - i * 30, y: canvas.height / 2, angle: 0 });
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      snake.headX = canvas.width / 2;
      snake.headY = canvas.height / 2;
    };
    window.addEventListener('resize', resize);
    resize();

    const drawSnake = (t: number) => {
      // Movement logic
      snake.angle = Math.sin(t * 0.002) * 0.5; // Gentle weaving
      
      const speed = 2;
      const vx = Math.cos(snake.angle) * speed;
      const vy = Math.sin(snake.angle) * speed;

      // Update head position (float in place roughly)
      snake.headX = canvas.width / 2 + Math.cos(t * 0.001) * 100;
      snake.headY = canvas.height / 2 + Math.sin(t * 0.0013) * 50;

      // Inverse Kinematics / Follow logic for segments
      let targetX = snake.headX;
      let targetY = snake.headY;

      snake.segments.forEach((segment, i) => {
        const dx = targetX - segment.x;
        const dy = targetY - segment.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        const spacing = i === 0 ? 35 : 25; // Distance between segments

        if (dist > spacing) {
          const moveX = dx - Math.cos(angle) * spacing;
          const moveY = dy - Math.sin(angle) * spacing;
          segment.x += moveX * 0.1; // Smooth follow
          segment.y += moveY * 0.1;
          segment.angle = angle;
        }
        
        targetX = segment.x;
        targetY = segment.y;
      });
    };

    const render = (t: number) => {
      time = t;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      bgGradient.addColorStop(0, '#1a202c');
      bgGradient.addColorStop(1, '#000000');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid for "Cyber" feel
      if (activeTheme === 'crypto' || activeTheme === 'neon') {
        ctx.strokeStyle = activeTheme === 'crypto' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(99, 179, 237, 0.1)';
        ctx.lineWidth = 1;
        const gridSize = 50;
        const offsetX = (t * 0.02) % gridSize;
        const offsetY = (t * 0.02) % gridSize;
        
        for (let x = -gridSize; x < canvas.width + gridSize; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x + offsetX, 0);
          ctx.lineTo(x + offsetX, canvas.height);
          ctx.stroke();
        }
        for (let y = -gridSize; y < canvas.height + gridSize; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y + offsetY);
          ctx.lineTo(canvas.width, y + offsetY);
          ctx.stroke();
        }
      }

      drawSnake(t);

      // Draw Segments (Reverse order so head is on top)
      for (let i = snake.segments.length - 1; i >= 0; i--) {
        const segment = snake.segments[i];
        const isHead = i === 0;
        const size = isHead ? 40 : 30 - (i * 1.5); // Tapering body

        ctx.save();
        ctx.translate(segment.x, segment.y);
        ctx.rotate(segment.angle);

        // Body Gradient
        const grad = ctx.createRadialGradient(-5, -5, 0, 0, 0, size);
        
        if (activeTheme === 'neon') {
          grad.addColorStop(0, '#A3BFFA'); // Highlight
          grad.addColorStop(0.3, '#63B3ED'); // Main Blue
          grad.addColorStop(1, '#1A365D'); // Dark Shadow
        } else if (activeTheme === 'crypto') {
          grad.addColorStop(0, '#FFF5C2'); // Gold Highlight
          grad.addColorStop(0.3, '#D69E2E'); // Main Gold
          grad.addColorStop(1, '#744210'); // Dark Gold
        } else { // Cute
          grad.addColorStop(0, '#FFD1F9'); // Pink Highlight
          grad.addColorStop(0.3, '#D53F8C'); // Main Pink
          grad.addColorStop(1, '#702459'); // Dark Pink
        }

        ctx.fillStyle = grad;
        
        // Shadow
        ctx.shadowColor = activeTheme === 'neon' ? '#63B3ED' : (activeTheme === 'crypto' ? '#D69E2E' : '#D53F8C');
        ctx.shadowBlur = 20;
        
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (only on head)
        if (isHead) {
          ctx.shadowBlur = 0;
          // Left Eye
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.ellipse(15, -12, 12, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Right Eye
          ctx.beginPath();
          ctx.ellipse(15, 12, 12, 12, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pupils
          ctx.fillStyle = '#000';
          const lookX = Math.cos(t * 0.003) * 3;
          
          ctx.beginPath();
          ctx.ellipse(18 + lookX, -12, 5, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.beginPath();
          ctx.ellipse(18 + lookX, 12, 5, 5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Eye Highlights
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(20 + lookX, -14, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(20 + lookX, 10, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(() => render(performance.now()));
    };

    animationFrameId = requestAnimationFrame(() => render(performance.now()));

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeTheme]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      <nav className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-black/50 backdrop-blur-sm border-b border-white/10">
        <Link href="/" className="text-xl font-bold hover:text-blue-400 transition-colors">
          ← Back to Home
        </Link>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTheme('neon')}
            className={`px-4 py-2 rounded-full border transition-all ${activeTheme === 'neon' ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(99,179,237,0.5)]' : 'border-white/20 hover:border-blue-400/50'}`}
          >
            Neon Cyber
          </button>
          <button 
            onClick={() => setActiveTheme('crypto')}
            className={`px-4 py-2 rounded-full border transition-all ${activeTheme === 'crypto' ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_15px_rgba(214,158,46,0.5)]' : 'border-white/20 hover:border-yellow-400/50'}`}
          >
            Crypto Gold
          </button>
          <button 
            onClick={() => setActiveTheme('cute')}
            className={`px-4 py-2 rounded-full border transition-all ${activeTheme === 'cute' ? 'bg-pink-500 border-pink-400 text-white shadow-[0_0_15px_rgba(213,63,140,0.5)]' : 'border-white/20 hover:border-pink-400/50'}`}
          >
            Cute Style
          </button>
        </div>
      </nav>

      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
      />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-10">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Character Design Prompt Implemented
          </h2>
          <div className="space-y-4 text-sm text-gray-300 font-mono">
            <p>
              <span className="text-blue-400">Prompt:</span> "Create a smooth, segmented snake/worm with a rounded head, large expressive eyes... slightly glossy, jelly-like appearance."
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wider">Features</span>
                <ul className="list-disc list-inside text-gray-400">
                  <li>Soft 3D Segments</li>
                  <li>Gradient Coloring</li>
                  <li>Interactive Tracking</li>
                </ul>
              </div>
              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wider">Tech Stack</span>
                <ul className="list-disc list-inside text-gray-400">
                  <li>HTML5 Canvas API</li>
                  <li>Procedural Animation</li>
                  <li>React Hooks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
