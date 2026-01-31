import * as Phaser from 'phaser';

import { Client, Room } from 'colyseus.js';
import { SnakeRenderer } from './SnakeRenderer';
import { InputManager } from './Input';
import { GameState, Player, Food } from './ClientState';
import { PhysicsConfig, VisualConfig, Vector2, angleDifference } from '../core/Physics';

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

  // Viewport responsive scaling
  private baseViewportSize = 1200; // Reference viewport width for scaling
  private currentViewportScale = 1;

  private lastInputSentAt = 0;
  private INPUT_SEND_INTERVAL = 16;

  private inputSeq = 0;
  private lastAckInputSeq = 0;
  private pendingInputs: { seq: number; vector: Vector2; boost: boolean }[] = [];
  private predictedLocal: { x: number; y: number; angle: number; dirX: number; dirY: number } | null = null;

  private roomHandlersBound = false;
private MIN_ZOOM = 0.45;
private MAX_ZOOM = 1.1;
private ZOOM_LERP = 0.04;

  constructor() {
    super('MainScene');
  }

  // Update viewport scaling based on window size
  private updateViewportScaling() {
    const viewportWidth = this.cameras.main.width;
    const viewportHeight = this.cameras.main.height;
    
    // Use the smaller dimension for consistent scaling
    const minDimension = Math.min(viewportWidth, viewportHeight);
    
    // Calculate scale factor based on reference size (1200px)
    this.currentViewportScale = Math.max(0.5, Math.min(2.0, minDimension / this.baseViewportSize));
    
    // Update VisualConfig with scaled render radius
    // We need to modify the imported object directly
    VisualConfig.RENDER_RADIUS = VisualConfig.BASE_RENDER_RADIUS * this.currentViewportScale;
    
    console.log(`Viewport scaling updated: ${this.currentViewportScale.toFixed(2)}x (${viewportWidth}x${viewportHeight})`);
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

    // Handle window resize for responsive scaling
    const handleResize = () => {
      if (this.scene.isActive()) {
        this.updateViewportScaling();
      }
    };
    
    window.addEventListener('resize', handleResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('resize', handleResize);
    });

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

    // Handle window resize for responsive scaling
    const handleResize = () => {
      if (this.scene.isActive()) {
        this.updateViewportScaling();
      }
    };
    
    window.addEventListener('resize', handleResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('resize', handleResize);
    });

    } catch (e) {
      console.error("Join error", e);
      this.add.text(100, 100, "Connection Failed", { color: '#ff0000' });
    }
  }

  createEnvironment() {
    // Update viewport scaling
    this.updateViewportScaling();
    
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

    // Worms Zone Style Zoom
    // Base zoom starts high (0.9) and decreases slowly as you grow.
    // Logarithmic falloff prevents it from becoming a tiny dot too quickly.
    // 500 segments (start) -> ~0.6
    // 5000 segments -> ~0.3
    
    // Formula: Base - (Size * Factor)
    // Let's use a gentle curve.
    // 500 * 0.0004 = 0.2. 1.0 - 0.2 = 0.8.
    // 5000 * 0.0004 = 2.0. Too much.
    
    // Let's use 1 / (1 + size * k)
    // size 500 -> 1 / (1 + 0.5) = 0.66
    // size 5000 -> 1 / (1 + 5) = 0.16 (Too small)
    
    // Custom Curve:
    // Max Zoom (Small snake): 0.9
    // Min Zoom (Giant snake): 0.3
    
    const progress = Math.min(size / 10000, 1); // 0 to 1 scaling up to 10k length
    const targetZoom = Phaser.Math.Linear(0.9, 0.35, Math.sqrt(progress));

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

    const renderer = new SnakeRenderer(this, player, sessionId === this.mySessionId);
    this.snakeRenderers.set(sessionId, renderer);

    // ✅ Listen for Death (Immediate Explosion)
    (player as any).onChange = (changes: any[]) => {
        try {
            changes.forEach(change => {
                if (change.field === "alive" && change.value === false) {
                     const r = this.snakeRenderers.get(sessionId);
                     if (r) {
                         this.playDeathExplosion(r.displayX, r.displayY);
                     }
                }
            });
        } catch (e) {
            console.error("Death FX Error:", e);
        }
    };

    if (sessionId === this.mySessionId) {
      this.predictedLocal = {
        x: player.x,
        y: player.y,
        angle: player.angle,
        dirX: Math.cos(player.angle),
        dirY: Math.sin(player.angle),
      };
      this.pendingInputs = [];
      this.lastAckInputSeq = player.lastAckInputSeq ?? 0;
      this.cameras.main.startFollow(
        this.localSnakeProxy as any,
        true, 0.05, 0.05  // Faster lerp for better centering
      );
    }
  } 

  private applyPredictionStep(
    state: { x: number; y: number; angle: number; dirX: number; dirY: number },
    input: { vector: Vector2; boost: boolean },
    dt: number,
    segmentCount: number
  ) {
    const canBoost = input.boost && segmentCount > 10;
    const speed = canBoost ? PhysicsConfig.BOOST_SPEED : PhysicsConfig.BASE_SPEED;

    const inputVector = input.vector;
    const lenSq = inputVector.x * inputVector.x + inputVector.y * inputVector.y;

    if (lenSq > 0.0001) {
      const targetAngle = Math.atan2(inputVector.y, inputVector.x);
      const currentAngle = Math.atan2(state.dirY, state.dirX);
      const diff = angleDifference(currentAngle, targetAngle);
      const maxTurn = PhysicsConfig.TURN_SPEED * dt;

      let newAngle = currentAngle;
      if (Math.abs(diff) < maxTurn) {
        newAngle = targetAngle;
      } else {
        newAngle += Math.sign(diff) * maxTurn;
      }

      state.dirX = Math.cos(newAngle);
      state.dirY = Math.sin(newAngle);
      state.angle = newAngle;
    }

    state.x += state.dirX * speed * dt;
    state.y += state.dirY * speed * dt;
  }


handlePlayerRemove(_player: Player, sessionId: string) {
  console.log("Player left:", sessionId);

  const renderer = this.snakeRenderers.get(sessionId);

  if (renderer) {
    const x = renderer.displayX;
    const y = renderer.displayY;

    // 💥 Explosion ONLY if not already dead (Disconnect or instant removal)
    // If they died (alive=false), we already exploded via onChange.
    if (_player.alive) {
        this.playDeathExplosion(x, y);
    }

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

  const input = this.inputManager.update();

  if (this.mySessionId) {
    const player = this.room.state.players.get(this.mySessionId);
    const renderer = this.snakeRenderers.get(this.mySessionId);

    if (player && renderer && player.alive) {
      if (!this.predictedLocal) {
        this.predictedLocal = {
          x: player.x,
          y: player.y,
          angle: player.angle,
          dirX: Math.cos(player.angle),
          dirY: Math.sin(player.angle),
        };
        this.pendingInputs = [];
        this.lastAckInputSeq = player.lastAckInputSeq ?? 0;
      }

      const ack = player.lastAckInputSeq ?? 0;
      if (ack !== this.lastAckInputSeq && this.predictedLocal) {
        this.lastAckInputSeq = ack;
        this.pendingInputs = this.pendingInputs.filter((p) => p.seq > ack);

        const rebuilt = {
          x: player.x,
          y: player.y,
          angle: player.angle,
          dirX: Math.cos(player.angle),
          dirY: Math.sin(player.angle),
        };

        const segmentCount = player.segments?.length ?? 0;
        const dtStep = this.INPUT_SEND_INTERVAL / 1000;
        for (const p of this.pendingInputs) {
          this.applyPredictionStep(rebuilt, p, dtStep, segmentCount);
        }

        this.predictedLocal = rebuilt;
      }

      if (time - this.lastInputSentAt > this.INPUT_SEND_INTERVAL && this.predictedLocal) {
        const seq = ++this.inputSeq;
        const msg = { ...input, seq };
        this.room.send("input", msg);
        this.pendingInputs.push({ seq, vector: input.vector, boost: input.boost });

        const segmentCount = player.segments?.length ?? 0;
        const dtStep = this.INPUT_SEND_INTERVAL / 1000;
        this.applyPredictionStep(this.predictedLocal, input, dtStep, segmentCount);

        this.lastInputSentAt = time;
      }

      renderer.setPredictedPose({
        x: this.predictedLocal?.x ?? player.x,
        y: this.predictedLocal?.y ?? player.y,
        angle: this.predictedLocal?.angle ?? player.angle,
      });
    } else if (renderer) {
      renderer.setPredictedPose(null);
    }
  }

  this.snakeRenderers.forEach((renderer) => {
    renderer.update();
  });

  if (this.mySessionId && this.snakeRenderers.has(this.mySessionId)) {
    const renderer = this.snakeRenderers.get(this.mySessionId)!;
    const player = this.room.state.players.get(this.mySessionId);
    
    if (player) {
      // Look-ahead logic
      const lookAhead = 40;
      const targetX = renderer.displayX + Math.cos(renderer.displayAngle) * lookAhead;
      const targetY = renderer.displayY + Math.sin(renderer.displayAngle) * lookAhead;
      
      // Lerp the proxy for smooth camera follow
      this.localSnakeProxy.x = Phaser.Math.Linear(this.localSnakeProxy.x, targetX, 0.12);
      this.localSnakeProxy.y = Phaser.Math.Linear(this.localSnakeProxy.y, targetY, 0.12);
    }
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
      
      // Make icon bigger (User Request: "icon little big")
      const txt = this.add.text(food.x, food.y, emoji, { fontSize: "42px" })
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
