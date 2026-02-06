"use client";

import { useEffect, useRef } from 'react';

export default function PhaserGameInner() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let game: Phaser.Game | null = null;
    let isMounted = true;

    const initGame = async () => {
      if (!containerRef.current || !isMounted) return;

      const Phaser = (await import('phaser')).default;
      const { MainScene } = await import('@/lib/game/client/MainScene');
      
      if (!isMounted) return;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.CANVAS,
        parent: containerRef.current,
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
        render: {
          antialias: false,
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
      isMounted = false;
      if (game) {
        game.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-screen overflow-hidden" />;
}
