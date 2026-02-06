
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
  private worldLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  private inputManager!: InputManager;
  private grid!: Phaser.GameObjects.Grid;
  private debugText!: Phaser.GameObjects.Text;
  private debugDraw: boolean = false;
  
  // UI Elements
  private leaderboardContainer!: Phaser.GameObjects.Container;
  private leaderboardTexts: Phaser.GameObjects.Text[] = [];
  private minimapContainer!: Phaser.GameObjects.Container;
  private minimapGraphics!: Phaser.GameObjects.Graphics;
  private minimapBorder!: Phaser.GameObjects.Graphics;
  private foodTexts: Map<string, Phaser.GameObjects.Text> = new Map();
  private readonly HUD_MARGIN = 20;
  private readonly MINIMAP_SIZE = 180;

  // Camera proxy
  private localSnakeProxy = { x: 0, y: 0, width: 0, height: 0 };

  // Viewport responsive scaling - FIXED
  private baseViewportSize = 1200;
  private currentViewportScale = 1;
  private scaledRenderRadius = VisualConfig.RENDER_RADIUS; // Store scaled value

  private lastInputSentAt = 0;
  private INPUT_SEND_INTERVAL = 33; // ~30Hz to match server

  private inputSeq = 0;
  private lastAckInputSeq = 0;
  private pendingInputs: { seq: number; vector: Vector2; boost: boolean }[] = [];
  private predictedLocal: { x: number; y: number; angle: number; dirX: number; dirY: number } | null = null;

  private roomHandlersBound = false;
  private MIN_ZOOM = 0.45;
  private MAX_ZOOM = 1.1;
  private ZOOM_LERP = 0.04;

  // ⚠️ CRITICAL FIX: Frame rate throttling
  private lastUpdateTime = 0;
  private readonly TARGET_FPS = 60; // Cap client FPS
  private readonly FRAME_TIME_MS = 1000 / this.TARGET_FPS;
  private frameCount = 0;
  private lastFpsUpdate = 0;
  private fpsText!: Phaser.GameObjects.Text;

  constructor() {
    super('MainScene');
  }

  private layoutHud() {
    const cam = this.cameras.main;
    if (this.leaderboardContainer) {
      this.leaderboardContainer.setPosition(this.HUD_MARGIN, this.HUD_MARGIN);
    }
    if (this.minimapContainer) {
      const mapSize = this.MINIMAP_SIZE;
      const margin = this.HUD_MARGIN;
      this.minimapContainer.setPosition(cam.width - margin - mapSize, margin);
    }
    if (this.uiCamera) {
      this.uiCamera.setSize(cam.width, cam.height);
    }
  }

  // FIXED: Don't modify VisualConfig directly
  private updateViewportScaling() {
    const viewportWidth = this.cameras.main.width;
    const viewportHeight = this.cameras.main.height;
    const minDimension = Math.min(viewportWidth, viewportHeight);
    
    this.currentViewportScale = Math.max(0.5, Math.min(2.0, minDimension / this.baseViewportSize));
    this.scaledRenderRadius = VisualConfig.RENDER_RADIUS * this.currentViewportScale;
    
    this.layoutHud();
  }

  preload() {
    this.textures.generate('particle', {
      data: ['1'],
      pixelWidth: 2,
      pixelHeight: 2
    });
  }

  async create() {
    this.worldLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0);

    this.createEnvironment();
    this.createUI();
    this.inputManager = new InputManager(this, this.localSnakeProxy as any);

    const cam = this.cameras.main;
    this.uiCamera = this.cameras.add(0, 0, cam.width, cam.height);
    this.uiCamera.setScroll(0, 0);
    this.uiCamera.setZoom(1);
    this.uiCamera.ignore(this.worldLayer);
    cam.ignore(this.uiLayer);
    
    // FPS counter for debugging
    this.fpsText = this.add.text(10, 40, 'FPS: 0', { 
      color: '#00ff00', 
      fontSize: '16px',
      backgroundColor: '#00000080'
    }).setDepth(1000);
    this.uiLayer.add(this.fpsText);

    this.input.keyboard?.on('keydown-D', () => {
      this.debugDraw = !this.debugDraw;
      this.snakeRenderers.forEach((r) => r.setDebugDraw(this.debugDraw));
    });

    // Handle window resize
    const handleResize = () => {
      if (this.scene.isActive()) {
        this.updateViewportScaling();
      }
    };
    
    window.addEventListener('resize', handleResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('resize', handleResize);
    });

    const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";
    this.client = new Client(`${wsProtocol}://${hostname}:2567`);

    try {
      this.room = await this.client.joinOrCreate<GameState>("block21", { name: "Player" });
      console.log("Joined successfully!", this.room.sessionId);
      this.mySessionId = this.room.sessionId;

      const stateListener = (state: GameState) => {
        if (state.players) {
          this.setupRoomHandlers();
          if (this.roomHandlersBound) {
            this.room.onStateChange.remove(stateListener);
          }
        }
      };
      this.room.onStateChange(stateListener);
      this.setupRoomHandlers();

      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        if (this.room && this.room.connection.isOpen) {
          this.room.leave();
        }
        this.foodTexts.forEach(txt => txt.destroy());
        this.foodTexts.clear();
      });

    } catch (e) {
      console.error("Join error", e);
      this.add.text(100, 100, "Connection Failed", { color: '#ff0000' });
    }
  }

  createEnvironment() {
    this.updateViewportScaling();
    this.cameras.main.setBackgroundColor('#1a5276');

    // ⚠️ OPTIMIZATION: Use simpler grid for large world
    this.grid = this.add.grid(
      0, 0, 20000, 20000, 200, 200, // Increased grid spacing
      0x154360, 0.3, 0x1b4f72, 0.1  // Reduced alpha
    );
    this.grid.setDepth(-1);
    this.worldLayer.add(this.grid);

    this.debugText = this.add.text(
      10, 10, 'Phase 3: Multiplayer',
      { color: '#ffffff', fontSize: '20px' }
    ).setDepth(100).setVisible(false);
    this.uiLayer.add(this.debugText);
  }

  createUI() {
    this.leaderboardContainer = this.add.container(0, 0).setDepth(1000);
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

    const mapSize = this.MINIMAP_SIZE;
    this.minimapContainer = this.add.container(0, 0);
    this.minimapBorder = this.add.graphics();
    this.minimapBorder.lineStyle(2, 0xffffff, 0.5);
    this.minimapBorder.strokeRect(0, 0, mapSize, mapSize);
    this.minimapBorder.fillStyle(0x000000, 0.3);
    this.minimapBorder.fillRect(0, 0, mapSize, mapSize);
    this.minimapGraphics = this.add.graphics();
    this.minimapContainer.add(this.minimapBorder);
    this.minimapContainer.add(this.minimapGraphics);

    this.uiLayer.add(this.leaderboardContainer);
    this.uiLayer.add(this.minimapContainer);
    this.layoutHud();
  }

  setupRoomHandlers() {
    if (this.roomHandlersBound) return;
    if (!this.room || !this.room.state) return;
    const players = this.room.state.players;
    if (!players) return;

    this.roomHandlersBound = true;
    console.log("Setting up room handlers. Players in state:", players.size);

    players.forEach((player: Player, sessionId: string) => {
      this.handlePlayerAdd(player, sessionId);
    });

    (players as any).onAdd = (player: Player, sessionId: string) => {
      this.handlePlayerAdd(player, sessionId);
    };

    (players as any).onRemove = (player: Player, sessionId: string) => {
      this.handlePlayerRemove(player, sessionId);
    };
  }
  
  private updateCameraZoom() {
    if (!this.mySessionId) return;
    const player = this.room.state.players.get(this.mySessionId);
    if (!player) return;
    const realLength = (player.length ?? 10) || 10;

    const MIN_ZOOM = 0.7;
    const MAX_ZOOM = 2.0;
    const ZOOM_FACTOR = 0.005;

    const zoom = Math.max(
      MIN_ZOOM,
      2.0 - Math.log10(realLength + 1) * ZOOM_FACTOR
    );

    const targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
    const cam = this.cameras.main;
    const newZoom = Phaser.Math.Linear(cam.zoom, targetZoom, this.ZOOM_LERP);
    cam.setZoom(Phaser.Math.Clamp(newZoom, MIN_ZOOM, MAX_ZOOM));

    if ((process as any)?.env?.DEBUG_CAMERA) {
      console.log(`Camera zoom: ${cam.zoom.toFixed(2)}, snake length: ${realLength}`);
    }
  }

  handlePlayerAdd(player: Player, sessionId: string) {
    if (this.snakeRenderers.has(sessionId)) {
      console.warn("Duplicate snake blocked:", sessionId);
      return;
    }

    console.log("Player joined:", sessionId);
    const renderer = new SnakeRenderer(this, player, sessionId === this.mySessionId);
    renderer.attachTo(this.worldLayer);
    renderer.setDebugDraw(this.debugDraw);
    renderer.setScaledRenderRadius(this.scaledRenderRadius); // Pass scaled radius
    this.snakeRenderers.set(sessionId, renderer);

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
        true, 0.05, 0.05
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
      if (_player.alive) {
        this.playDeathExplosion(x, y);
      }
      renderer.destroy();
      this.snakeRenderers.delete(sessionId);
    }

    if (sessionId === this.mySessionId) {
      console.warn("💀 YOU DIED — Respawning...");
    }
  }

  private playDeathExplosion(x: number, y: number) {
    const emitter = this.add.particles(
      x,
      y,
      'particle',
      {
        speed: { min: 80, max: 320 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.2, end: 0 },
        lifespan: 700,
        quantity: 30, // Reduced from 50
        tint: [0xff0033, 0xff6600, 0xffcc00],
        blendMode: Phaser.BlendModes.ADD
      }
    );

    this.time.delayedCall(750, () => {
      emitter.destroy();
    });
  }

  // ⚠️ CRITICAL FIX: Throttled game loop
  update(time: number, delta: number) {
    // FPS throttling
    const now = time;
    if (now - this.lastUpdateTime < this.FRAME_TIME_MS) {
      return;
    }
    this.lastUpdateTime = now;
    
    // Update FPS counter every second
    this.frameCount++;
    if (now - this.lastFpsUpdate >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.fpsText.setText(`FPS: ${fps}`);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }

    // Early exits
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

    // Update only visible snake renderers
    this.snakeRenderers.forEach((renderer) => {
      if (renderer.isVisible()) {
        renderer.update();
      }
    });

    if (this.mySessionId && this.snakeRenderers.has(this.mySessionId)) {
      const renderer = this.snakeRenderers.get(this.mySessionId)!;
      const player = this.room.state.players.get(this.mySessionId);
      
      if (player) {
        const lookAhead = 40;
        const targetX = renderer.displayX + Math.cos(renderer.displayAngle) * lookAhead;
        const targetY = renderer.displayY + Math.sin(renderer.displayAngle) * lookAhead;
        
        this.localSnakeProxy.x = Phaser.Math.Linear(this.localSnakeProxy.x, targetX, 0.12);
        this.localSnakeProxy.y = Phaser.Math.Linear(this.localSnakeProxy.y, targetY, 0.12);
      }
    }

    // Update food (only if in viewport)
    this.updateFood();
    this.updateCameraZoom();
    this.layoutHud();
    this.updateLeaderboard();
    this.updateMinimap();
  }

  private readonly FOOD_EMOJIS = ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌽", "🥕", "🫑", "🥔", "🍠"];

  private updateFood() {
    const currentFoodIds = new Set<string>();
    const cameraView = this.cameras.main.worldView;
    
    this.room.state.food.forEach((food, id) => {
      // Only render food in camera view
      if (food.x < cameraView.x - 100 || food.x > cameraView.x + cameraView.width + 100 ||
          food.y < cameraView.y - 100 || food.y > cameraView.y + cameraView.height + 100) {
        if (this.foodTexts.has(id)) {
          this.foodTexts.get(id)!.setVisible(false);
        }
        return;
      }
      
      currentFoodIds.add(id);
      if (!this.foodTexts.has(id)) {
        const kind = (food as any).kind ?? 0;

        let hash = 0;
        for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
        const fruit = this.FOOD_EMOJIS[Math.abs(hash) % this.FOOD_EMOJIS.length];

        const emoji = kind === 2 ? "⭐" : kind === 3 ? "💎" : fruit;
        const fontSize = kind === 2 ? "52px" : kind === 3 ? "48px" : kind === 1 ? "48px" : "42px";
        const txt = this.add.text(food.x, food.y, emoji, { fontSize })
          .setOrigin(0.5)
          .setDepth(1);
        this.worldLayer.add(txt);
        this.foodTexts.set(id, txt);
      } else {
        const txt = this.foodTexts.get(id)!;
        txt.setPosition(food.x, food.y);
        txt.setVisible(true);
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
    const mapSize = this.MINIMAP_SIZE;
    this.minimapGraphics.clear();
    
    const worldSize = 30000;
    const scale = mapSize / worldSize;

    this.minimapGraphics.lineStyle(1, 0xffffff, 0.2);
    this.minimapGraphics.strokeCircle(mapSize / 2, mapSize / 2, (worldSize / 2) * scale);

    this.room.state.players.forEach((player) => {
      if (!player.alive) return;

      const relX = player.x * scale;
      const relY = player.y * scale;
      const px = mapSize / 2 + relX;
      const py = mapSize / 2 + relY;

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
