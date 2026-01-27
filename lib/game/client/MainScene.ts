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
  private foodGraphics!: Phaser.GameObjects.Graphics;

  private mySessionId: string | null = null;

  private inputManager!: InputManager;
  private grid!: Phaser.GameObjects.Grid;
  private debugText!: Phaser.GameObjects.Text;

  // Camera proxy (authoritative from STATE)
  private localSnakeProxy = { x: 0, y: 0, width: 0, height: 0 };

  private lastInputSentAt = 0;
  private INPUT_SEND_INTERVAL = 50;

  private roomHandlersBound = false;

  constructor() {
    super('MainScene');
  }

  async create() {
    this.createEnvironment();

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
      });

    } catch (e) {
      console.error("Join error", e);
      this.add.text(100, 100, "Connection Failed", { color: '#ff0000' });
    }
  }

  createEnvironment() {
    this.cameras.main.setBackgroundColor('#111111');

    this.grid = this.add.grid(
      0, 0, 20000, 20000, 50, 50,
      0x1a1a1a, 1, 0x333333, 0.2
    );
    this.grid.setDepth(-1);

    // World Border
    const border = this.add.graphics();
    border.setDepth(0);
    border.lineStyle(10, 0xff0033, 0.8);
    border.strokeCircle(0, 0, PhysicsConfig.MAP_SIZE / 2);

    this.foodGraphics = this.add.graphics();
    this.foodGraphics.setDepth(1);

    this.debugText = this.add.text(
      10, 10, 'Phase 3: Multiplayer',
      { color: '#ffffff', fontSize: '20px' }
    ).setScrollFactor(0).setDepth(100).setVisible(false);
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


  handlePlayerAdd(player: Player, sessionId: string) {
    if (this.snakeRenderers.has(sessionId)) return;

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
    renderer.destroy();
    this.snakeRenderers.delete(sessionId);
  }

  // If this was MY snake, stop camera follow
  if (sessionId === this.mySessionId) {
    this.mySessionId = null;
    this.cameras.main.stopFollow();
  }
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

  // 5. Render food
  this.foodGraphics.clear();
  this.foodGraphics.fillStyle(0xff0000, 1);
  this.foodGraphics.lineStyle(2, 0xffcccc, 1);

  this.room.state.food.forEach((food) => {
    this.foodGraphics.fillCircle(food.x, food.y, 6);
    this.foodGraphics.strokeCircle(food.x, food.y, 6);
  });
}

}
