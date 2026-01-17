"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./snake.module.css";
import { UserProfile } from "@/types/game";

type SkinType = "classic" | "neon" | "magma" | "toxic" | "void" | "cyber" | "crimson" | "shadow";

interface AnimatedSnakeProps {
  skin?: string;
  length?: number;
  interactive?: boolean; // If true, follows mouse (CSS Variables mode)
  animated?: boolean;    // If true, auto-slithers (Pure CSS mode)
  size?: number;
}

export default function AnimatedSnake({
  skin = "classic",
  length = 20,
  interactive = true,
  animated = false,
  size = 40,
}: AnimatedSnakeProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const snakeRef = useRef<HTMLDivElement>(null);

  // Segment references for JS-driven animation (CSS Variables mode)
  const segmentsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Physics state for JS mode
  const historyRef = useRef<{ x: number; y: number }[]>([]);

  // Initialize history
  useEffect(() => {
    // Fill history with 0,0
    historyRef.current = Array(length).fill({ x: 0, y: 0 });
  }, [length]);

  // Handle Mouse Move for Interactive Mode
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (container) container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [interactive]);

  // Animation Loop for Interactive Mode (Slithering towards mouse)
  useEffect(() => {
    if (!interactive) return;

    let animationFrameId: number;
    const SEGMENT_DIST = size * 0.4;
    const SPEED = 0.15; // Lerp factor

    const loop = () => {
      // Move head towards mouse
      const head = historyRef.current[0];
      const targetX = mousePos.x;
      const targetY = mousePos.y;

      // Simple Lerp for head
      const newHeadX = head.x + (targetX - head.x) * SPEED;
      const newHeadY = head.y + (targetY - head.y) * SPEED;
      
      // Update head position in history (shift array logic simulated)
      // Actually for a snake, we need a chain constraint or a history buffer.
      // Let's use a history buffer approach where head moves and body follows path.
      
      const newHistory = [...historyRef.current];
      newHistory[0] = { x: newHeadX, y: newHeadY };

      // IK-like Follow Logic (Constrain distance)
      for (let i = 1; i < newHistory.length; i++) {
        const prev = newHistory[i - 1];
        const curr = newHistory[i];
        
        const dx = prev.x - curr.x;
        const dy = prev.y - curr.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > SEGMENT_DIST) {
           const angle = Math.atan2(dy, dx);
           const tx = prev.x - Math.cos(angle) * SEGMENT_DIST;
           const ty = prev.y - Math.sin(angle) * SEGMENT_DIST;
           newHistory[i] = { x: tx, y: ty };
        }
      }

      historyRef.current = newHistory;

      // Apply to DOM via transforms
      segmentsRef.current.forEach((el, i) => {
        if (el) {
          const pos = historyRef.current[i];
          // Calculate angle for rotation
          let angle = 0;
          if (i === 0 && historyRef.current[1]) {
             const dx = historyRef.current[0].x - historyRef.current[1].x;
             const dy = historyRef.current[0].y - historyRef.current[1].y;
             angle = Math.atan2(dy, dx) * (180 / Math.PI);
          } else if (i > 0) {
             const prev = historyRef.current[i-1];
             const curr = historyRef.current[i];
             const dx = prev.x - curr.x;
             const dy = prev.y - curr.y;
             angle = Math.atan2(dy, dx) * (180 / Math.PI);
          }
          
          el.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${angle}deg)`;
        }
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [interactive, mousePos, size]);

  // Skin Resolution Logic
  const getSkinClass = (s: string) => {
     if (["classic", "neon", "magma", "toxic", "void"].includes(s)) {
        return styles[`snake--skin-${s}`];
     }
     // Fallback for custom skins not in CSS classes yet (could use style prop)
     return styles[`snake--skin-classic`];
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[400px] overflow-hidden bg-slate-950/50 rounded-xl border border-slate-800 cursor-crosshair group"
    >
      <div 
        ref={snakeRef}
        className={`${styles.snake} ${getSkinClass(skin)} ${animated ? styles['snake--animated'] : ''}`}
        style={{ 
            '--snake-size': `${size}px` 
        } as React.CSSProperties}
      >
        {/* Render Body Segments (Reverse order so head is on top in DOM if using z-index, but actually head needs to be last for z-index unless managed) */}
        {/* Wait, for z-index, later elements are on top. So Tail -> Head order. */}
        {Array.from({ length }).map((_, i) => {
           const isHead = i === 0;
           // We render head LAST in the array map to be on top visually if position absolute
           // But our logic above (history[0] is head). 
           // Let's render segments 1..N-1, then Head.
           return null; 
        })}
        
        {/* Actually, let's map history index to DOM elements. 
            index 0 = Head. index N = Tail.
            Head needs highest z-index.
        */}
        
        {Array.from({ length }).reverse().map((_, revIndex) => {
           const index = length - 1 - revIndex; // Convert back to 0..N
           const isHead = index === 0;
           
           if (isHead) {
               return (
                   <div 
                     key="head"
                     ref={(el) => { segmentsRef.current[0] = el; }}
                     className={`${styles.snake__head}`}
                     style={{ zIndex: length + 1 }}
                   >
                       <div className={`${styles.snake__eye} ${styles['snake__eye--left']}`}>
                           <div className={styles.snake__pupil} />
                       </div>
                       <div className={`${styles.snake__eye} ${styles['snake__eye--right']}`}>
                           <div className={styles.snake__pupil} />
                       </div>
                       <div className={styles.snake__mouth}>
                           <div className={styles.snake__tongue} />
                       </div>
                   </div>
               );
           }
           
           return (
               <div
                 key={index}
                 ref={(el) => { segmentsRef.current[index] = el; }}
                 className={styles.snake__segment}
                 style={{ zIndex: length - index }}
               />
           );
        })}
      </div>
      
      {/* Interactive Hint */}
      {interactive && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-500 text-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            Move your mouse to guide the snake
        </div>
      )}
    </div>
  );
}
