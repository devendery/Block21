"use client";

import { useEffect, useRef } from 'react';

export default function PhaserGameInner() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let game: Phaser.Game;

    const initGame = async () => {
      if (!containerRef.current) return;

      const Phaser = (await import('phaser')).default;
      const { MainScene } = await import('@/lib/game/client/MainScene');
      
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current, // Use Ref directly
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#000000',
        scene: [MainScene],
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
          },
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };

      game = new Phaser.Game(config);
      gameRef.current = game;
    };

    initGame();

    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-screen overflow-hidden" />;
}