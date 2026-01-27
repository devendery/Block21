import * as Phaser from 'phaser';

import { Client, Room } from 'colyseus.js';
import { SnakeRenderer } from './SnakeRenderer';
import { InputManager } from './Input';
import { GameState, Player, Food } from './ClientState';
import { PhysicsConfig } from '../core/Physics';

export class MainScene extends Phaser.Scene {
  private client!: Client;
  private room!: Room<GameState>;

  private snakeRenderers: Map<string, SnakeRenderer> = new Map();

  private mySessionId: string | null = null;

  private inputManager!: InputManager;
  private grid!: Phaser.GameObjects.Grid;
  private debugText!: Phaser.GameObjects.Text;
  
  // UI Elements
  private leaderboardContainer!: Phaser.GameObjects.Container;
  private leaderboardTexts: Phaser.GameObjects.Text[] = [];
  private minimapGraphics!: Phaser.GameObjects.Graphics;
  private minimapBorder!: Phaser.GameObjects.Graphics;
  private foodTexts: Map<string, Phaser.GameObjects.Text> = new Map();

  // Camera proxy (authoritative from STATE)
  private localSnakeProxy = { x: 0, y: 0, width: 0, height: 0 };

  private lastInputSentAt = 0;
  private INPUT_SEND_INTERVAL = 50;

  private roomHandlersBound = false;
private MIN_ZOOM = 0.45;
private MAX_ZOOM = 1.1;
private ZOOM_LERP = 0.04;

  constructor() {
    super('MainScene');
  }
preload() {
  this.textures.generate('particle', {
    data: ['1'],
    pixelWidth: 2,
    pixelHeight: 2
  });
}


  async create() {
    this.createEnvironment();
    this.createUI();
    this.inputManager = new InputManager(this, this.localSnakeProxy as any);

    this.client = new Client("ws://localhost:2567");

    try {
      this.room = await this.client.joinOrCreate<GameState>("block21", { name: "Player" });
      console.log("Joined successfully!", this.room.sessionId);

      this.mySessionId = this.room.sessionId;

      // ✅ Robust Initialization: Listen for state changes until handlers are bound
      const stateListener = (state: GameState) => {
        if (state.players) {
          this.setupRoomHandlers();
          if (this.roomHandlersBound) {
            // Once bound, we can stop listening to every state change for initialization
            this.room.onStateChange.remove(stateListener);
          }
        }
      };
      this.room.onStateChange(stateListener);

      // Initial check immediately
      this.setupRoomHandlers();

      // ✅ cleanup on reload / tab close
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        if (this.room && this.room.connection.isOpen) {
          this.room.leave();
        }
        // Cleanup UI
        this.foodTexts.forEach(txt => txt.destroy());
        this.foodTexts.clear();
      });

    } catch (e) {
      console.error("Join error", e);
      this.add.text(100, 100, "Connection Failed", { color: '#ff0000' });
    }
  }

  createEnvironment() {
    // Worms Zone style blue background
    this.cameras.main.setBackgroundColor('#1a5276');

    // Subtle texture grid
    this.grid = this.add.grid(
      0, 0, 20000, 20000, 100, 100,
      0x154360, 0.5, 0x1b4f72, 0.3
    );
    this.grid.setDepth(-1);

    // World Border
    const border = this.add.graphics();
    border.setDepth(0);
    border.lineStyle(15, 0xffffff, 0.2); // Soft white border
    border.strokeCircle(0, 0, PhysicsConfig.MAP_SIZE / 2);

    this.debugText = this.add.text(
      10, 10, 'Phase 3: Multiplayer',
      { color: '#ffffff', fontSize: '20px' }
    ).setScrollFactor(0).setDepth(100).setVisible(false);
  }

  createUI() {
    // 1. Leaderboard (Top Left)
    this.leaderboardContainer = this.add.container(20, 20).setScrollFactor(0).setDepth(1000);
    const lbBg = this.add.graphics();
    lbBg.fillStyle(0x000000, 0.5);
    lbBg.fillRoundedRect(-10, -10, 220, 280, 10);
    this.leaderboardContainer.add(lbBg);

    const title = this.add.text(0, 0, "TOP PLAYERS", {
       fontSize: "18px",
       fontStyle: "bold",
       color: "#ffcc00"
     });
    this.leaderboardContainer.add(title);

    for (let i = 0; i < 10; i++) {
      const txt = this.add.text(0, 30 + i * 22, "", {
        fontSize: "14px",
        color: "#ffffff"
      });
      this.leaderboardTexts.push(txt);
      this.leaderboardContainer.add(txt);
    }

    // 2. Minimap (Top Right)
    const mapSize = 180;
    const margin = 20;
    const x = this.cameras.main.width - mapSize - margin;
    const y = margin;

    this.minimapBorder = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.minimapBorder.lineStyle(2, 0xffffff, 0.5);
    this.minimapBorder.strokeRect(x, y, mapSize, mapSize);
    this.minimapBorder.fillStyle(0x000000, 0.3);
    this.minimapBorder.fillRect(x, y, mapSize, mapSize);

    this.minimapGraphics = this.add.graphics().setScrollFactor(0).setDepth(1001);
  }

  // ===============================
  // PLAYER LIFECYCLE
  // ===============================
  setupRoomHandlers() {
    if (this.roomHandlersBound) return;
    if (!this.room || !this.room.state) return;

    const players = this.room.state.players;
    if (!players) {
      console.warn("State exists but 'players' is missing. Waiting for sync...");
      return;
    }

    // ✅ LOCK ONLY AFTER VALIDATION
    this.roomHandlersBound = true;

    console.log("Setting up room handlers. Players in state:", players.size);

    // 1️⃣ HYDRATE EXISTING
    players.forEach((player: Player, sessionId: string) => {
      console.log("Hydrating existing player:", sessionId);
      this.handlePlayerAdd(player, sessionId);
    });

    // 2️⃣ LISTEN FOR NEW
    (players as any).onAdd = (player: Player, sessionId: string) => {
      console.log("onAdd player:", sessionId);
      this.handlePlayerAdd(player, sessionId);
    };

    (players as any).onRemove = (player: Player, sessionId: string) => {
      console.log("onRemove player:", sessionId);
      this.handlePlayerRemove(player, sessionId);
    };
  }
  
private updateCameraZoom() {
  if (!this.mySessionId) return;

  const player = this.room.state.players.get(this.mySessionId);
  if (!player) return;

  // Use segments OR score
  const size = player.segments?.length ?? 10;

  // Bigger snake → smaller zoom
  let targetZoom = Phaser.Math.Clamp(
    1.2 - size * 0.01,
    this.MIN_ZOOM,
    this.MAX_ZOOM
  );

  const cam = this.cameras.main;
  cam.setZoom(
    Phaser.Math.Linear(cam.zoom, targetZoom, this.ZOOM_LERP)
  );
}


  handlePlayerAdd(player: Player, sessionId: string) {
   // 🚫 Block duplicate OR post-death recreation
if (this.snakeRenderers.has(sessionId)) {
  console.warn("Duplicate snake blocked:", sessionId);
  return;
}


    console.log("Player joined:", sessionId);

    const renderer = new SnakeRenderer(this, player);
    this.snakeRenderers.set(sessionId, renderer);

    if (sessionId === this.mySessionId) {
      this.cameras.main.startFollow(
        this.localSnakeProxy as any,
        true, 0.1, 0.1
      );
    }
  } 


handlePlayerRemove(_player: Player, sessionId: string) {
  console.log("Player left:", sessionId);

  const renderer = this.snakeRenderers.get(sessionId);

  if (renderer) {
    const x = renderer.displayX;
    const y = renderer.displayY;

    // 💥 Explosion FIRST
    this.playDeathExplosion(x, y);

    // 🧹 Then destroy renderer
    renderer.destroy();
    this.snakeRenderers.delete(sessionId);
  }

  // ☠️ IF THIS WAS MY SNAKE
  if (sessionId === this.mySessionId) {
    console.warn("💀 YOU DIED — Respawning...");
    // Optional: Add a brief visual indicator that you died
  }
}


private playDeathExplosion(x: number, y: number) {
  const emitter = this.add.particles(
    x,
    y,
    'particle', // ✅ SAME KEY AS preload
    {
      speed: { min: 80, max: 320 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      lifespan: 700,
      quantity: 50,
      tint: [0xff0033, 0xff6600, 0xffcc00],
      blendMode: Phaser.BlendModes.ADD
    }
  );

  this.time.delayedCall(750, () => {
    emitter.destroy();
  });
}








  // ===============================
  // GAME LOOP
  // ===============================
  update(time: number, delta: number) {
  

  // 🛑 HARD GUARDS — VERY IMPORTANT
  if (!this.room) return;
  if (!this.room.connection || this.room.connection.isOpen !== true) return;
  if (!this.room.state) return;
  if (!this.room.state.players) return;

  // 1. Update all snake renderers
  this.snakeRenderers.forEach(renderer => {
    renderer.update();
  });

  // 2. Update local camera proxy ONLY if my snake exists
  if (this.mySessionId && this.snakeRenderers.has(this.mySessionId)) {
    const renderer = this.snakeRenderers.get(this.mySessionId)!;
    this.localSnakeProxy.x = renderer.displayX;
    this.localSnakeProxy.y = renderer.displayY;
  }

  // 3. Process input
  const inputVector = this.inputManager.update();

  // 4. Send input to server (throttled)
  if (time - this.lastInputSentAt > this.INPUT_SEND_INTERVAL) {
    this.room.send("input", inputVector);
    this.lastInputSentAt = time;
  }

  // 5. Render food (Emoji Style)
  this.updateFood();

  // 6. Update UI
  this.updateLeaderboard();
  this.updateMinimap();
  this.updateCameraZoom();

}

private readonly FOOD_EMOJIS = ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌽", "🥕", "🫑", "🥔", "🍠"];

private updateFood() {
  const currentFoodIds = new Set<string>();
  
  this.room.state.food.forEach((food, id) => {
    currentFoodIds.add(id);
    if (!this.foodTexts.has(id)) {
      // Pick emoji based on id hash
      let hash = 0;
      for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
      const emoji = this.FOOD_EMOJIS[Math.abs(hash) % this.FOOD_EMOJIS.length];
      
      const txt = this.add.text(food.x, food.y, emoji, { fontSize: "24px" })
        .setOrigin(0.5)
        .setDepth(1);
      this.foodTexts.set(id, txt);
    } else {
      const txt = this.foodTexts.get(id)!;
      txt.setPosition(food.x, food.y);
    }
  });

  // Cleanup eaten food
  this.foodTexts.forEach((txt, id) => {
    if (!currentFoodIds.has(id)) {
      txt.destroy();
      this.foodTexts.delete(id);
    }
  });
}


private updateLeaderboard() {
  const players = Array.from(this.room.state.players.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  this.leaderboardTexts.forEach((txt, i) => {
    const p = players[i];
    if (p) {
      const name = p.name || "Anonymous";
      const isMe = p.id === this.mySessionId ? "> " : "  ";
      txt.setText(`${isMe}${i + 1}. ${name.padEnd(12)} ${Math.floor(p.score)}`);
      txt.setColor(p.id === this.mySessionId ? "#00ff00" : "#ffffff");
      txt.setVisible(true);
    } else {
      txt.setVisible(false);
    }
  });
}

private updateMinimap() {
  const mapSize = 180;
  const margin = 20;
  const x = this.cameras.main.width - mapSize - margin;
  const y = margin;

  // Update border position (in case of resize)
  this.minimapBorder.clear();
  this.minimapBorder.lineStyle(2, 0xffffff, 0.5);
  this.minimapBorder.strokeRect(x, y, mapSize, mapSize);
  this.minimapBorder.fillStyle(0x000000, 0.3);
  this.minimapBorder.fillRect(x, y, mapSize, mapSize);

  this.minimapGraphics.clear();
  
  const worldSize = PhysicsConfig.MAP_SIZE;
  const scale = mapSize / worldSize;

  // Draw border circle on minimap
  this.minimapGraphics.lineStyle(1, 0xffffff, 0.2);
  this.minimapGraphics.strokeCircle(x + mapSize/2, y + mapSize/2, (worldSize/2) * scale);

  this.room.state.players.forEach((player) => {
    if (!player.alive) return;

    // Relative to center (0,0)
    const relX = player.x * scale;
    const relY = player.y * scale;

    // Screen position
    const px = x + mapSize / 2 + relX;
    const py = y + mapSize / 2 + relY;

    if (player.id === this.mySessionId) {
      this.minimapGraphics.fillStyle(0x00ff00, 1);
      this.minimapGraphics.fillCircle(px, py, 3);
    } else {
      this.minimapGraphics.fillStyle(0xffffff, 0.6);
      this.minimapGraphics.fillCircle(px, py, 2);
    }
  });
}

}
