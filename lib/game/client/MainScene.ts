import Phaser from 'phaser';

import { Client, Room } from 'colyseus.js';
import { SnakeRenderer } from './SnakeRenderer';
import { InputManager } from './Input';
import { GameState, Player, Food } from './ClientState';

export class MainScene extends Phaser.Scene {
  private client!: Client;
  private room!: Room<GameState>; // Typed Room
  
  private snakeRenderers: Map<string, SnakeRenderer> = new Map();
  private foodGraphics!: Phaser.GameObjects.Graphics;
  
  // Local Player ID
  private mySessionId: string | null = null;
  
  private inputManager!: InputManager;
  private grid!: Phaser.GameObjects.Grid;
  private debugText!: Phaser.GameObjects.Text;
  
  // Fake snake for input manager (it needs x/y to calculate delta)
  // We'll update this from the server state
  private localSnakeProxy: { x: number, y: number, width: number, height: number } = { x: 0, y: 0, width: 0, height: 0 };
  
  // Input throttling
  private lastInputSentAt = 0;
  private INPUT_SEND_INTERVAL = 50; // ms (20Hz)
  
  private roomHandlersBound = false;

  constructor() {
    super('MainScene');
  }

  async create() {
    // 1. Setup Environment
    this.createEnvironment();
    
    // 2. Setup Input (We pass a proxy object that we'll update with server data)
    // InputManager expects a Snake object, but mainly needs x/y. 
    // We'll cast our proxy.
    this.inputManager = new InputManager(this, this.localSnakeProxy as any);

    // 3. Connect to Server
    this.client = new Client("ws://localhost:2567");
    
    try {
        // Verify Schema is loaded
        console.log("CLIENT GameState class:", GameState);

        this.room = await this.client.joinOrCreate<GameState>("block21", { name: "Player" });
        console.log("Joined successfully!", this.room.sessionId);
        this.mySessionId = this.room.sessionId;
        
        // 🔒 WAIT for initial state
        this.room.onStateChange.once((state) => {
            console.log("CLIENT GameState fields:", Object.keys(state));
            this.setupRoomHandlers();
        });

        // 🧹 Cleanup on Scene Shutdown
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this.room && this.room.connection.isOpen) {
                this.room.leave();
            }
        });
    } catch (e) {
        console.error("Join error", e);
        this.add.text(100, 100, "Connection Failed: " + e, { color: '#ff0000' });
    }
  }
  
  createEnvironment() {
    this.cameras.main.setBackgroundColor('#111111');
    this.grid = this.add.grid(0, 0, 20000, 20000, 50, 50, 0x1a1a1a, 1, 0x333333, 0.2);
    this.grid.setDepth(-1);
    
    this.foodGraphics = this.add.graphics();
    this.foodGraphics.setDepth(1);
    
    this.debugText = this.add.text(10, 10, 'Phase 3: Multiplayer', { color: '#ffffff', fontSize: '20px' }).setScrollFactor(0);
        this.debugText.setDepth(100);
        this.debugText.setVisible(false); // Hide debug text
    }

  setupRoomHandlers() {
    if (this.roomHandlersBound) return;
    this.roomHandlersBound = true;

    const players = this.room.state.players;
    if (!players) return;

    // � 1. HYDRATE EXISTING PLAYERS (ONCE)
    players.forEach((player: Player, sessionId: string) => {
        if (!this.snakeRenderers.has(sessionId)) {
            this.handlePlayerAdd(player, sessionId);
        }
    });

    // � 2. LISTEN FOR FUTURE JOINS
    (players as any).onAdd = (player: Player, sessionId: string) => {
        if (this.snakeRenderers.has(sessionId)) {
            console.error("❌ DUPLICATE onAdd blocked:", sessionId);
            return;
        }
        this.handlePlayerAdd(player, sessionId);
    };

    // 🔹 3. LISTEN FOR LEAVES
    (players as any).onRemove = (player: Player, sessionId: string) => {
        this.handlePlayerRemove(player, sessionId);
    };

    // Food
    // We'll just re-draw all food when any food changes? 
    // Or we can maintain a map of food sprites?
    // Drawing 50 circles in one Graphics object is efficient.
    // But we need to know where they are.
    // Let's just listen to add/remove and trigger a redraw flag?
    // Or just redraw every frame from the state? Redrawing 50 circles is cheap.
  }

  handlePlayerAdd(player: Player, sessionId: string) {
    // Safety Net: Prevent duplicate renderers
    if (this.snakeRenderers.has(sessionId)) {
        console.error("DUPLICATE SNAKE RENDER PREVENTED:", sessionId);
        return;
    }

    console.log("Player joined:", sessionId);
    
    // Create Renderer
    const renderer = new SnakeRenderer(this, player);
    this.snakeRenderers.set(sessionId, renderer);
    
    // If it's me, follow with camera
    if (sessionId === this.mySessionId) {
        this.localSnakeProxy.x = player.x;
        this.localSnakeProxy.y = player.y;
        this.cameras.main.startFollow(this.localSnakeProxy as any, true, 0.1, 0.1);
        console.log("Camera following:", sessionId);
    }
  }

  handlePlayerRemove(player: Player, sessionId: string) {
    console.log("Player left:", sessionId);
    const renderer = this.snakeRenderers.get(sessionId);
    if (renderer) {
        renderer.destroy();
        this.snakeRenderers.delete(sessionId);
    }

    if (sessionId === this.mySessionId) {
        this.mySessionId = null;
    }
  }

  update(time: number, delta: number) {
    if (!this.room || !this.room.state || !this.room.state.players) return;
    
    // 🛡️ Guard against closed socket
    if (this.room.connection.isOpen !== true) {
        return;
    }
    
    const dt = delta / 1000;

    // 1. Render Snakes (Update Interpolation first)
    this.snakeRenderers.forEach(renderer => {
        renderer.update();
    });

    // 2. Update Local Proxy from Interpolated Renderer
    // We need the camera to follow the local player proxy
    if (this.mySessionId) {
        const renderer = this.snakeRenderers.get(this.mySessionId);
        if (renderer) {
            this.localSnakeProxy.x = renderer.displayX;
            this.localSnakeProxy.y = renderer.displayY;
        }
    }

    // 3. Process Input
    const inputVector = this.inputManager.update();
    
    // Debug: Force camera follow update every frame just in case
    if (this.mySessionId) {
        // this.cameras.main.startFollow(this.localSnakeProxy as any, true, 0.1, 0.1);
    }
    
    // Send Input to Server (Throttled)
    if (time - this.lastInputSentAt > this.INPUT_SEND_INTERVAL) {
        this.room.send("input", inputVector); 
        this.lastInputSentAt = time;
    }
    
    // 4. Render Food
    this.foodGraphics.clear();
    this.foodGraphics.fillStyle(0xff0000, 1);
    this.foodGraphics.lineStyle(2, 0xffcccc, 1); // Glowy outline
    
    this.room.state.food.forEach((food: Food) => {
        this.foodGraphics.fillCircle(food.x, food.y, 6); // Physics radius is 10, visual can be smaller/different
        this.foodGraphics.strokeCircle(food.x, food.y, 6);
    });
  }
}
