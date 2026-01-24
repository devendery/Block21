import Phaser from 'phaser';
import { Client, Room } from 'colyseus.js';
import { SnakeRenderer, ISnakeState } from './SnakeRenderer';
import { InputManager } from './Input';

export class MainScene extends Phaser.Scene {
  private client!: Client;
  private room!: Room;
  
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
        this.room = await this.client.joinOrCreate("block21", { name: "Player" });
        console.log("Joined successfully!", this.room.sessionId);
        this.mySessionId = this.room.sessionId;
        
        this.setupRoomHandlers();
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
    // Players (Snakes)
    this.room.state.players.onAdd((player: any, sessionId: string) => {
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
        
        // Listen for changes (Colyseus schema updates automatically, 
        // but if we need specific events we can listen to .onChange)
    });

    this.room.state.players.onRemove((player: any, sessionId: string) => {
        console.log("Player left:", sessionId);
        const renderer = this.snakeRenderers.get(sessionId);
        if (renderer) {
            renderer.destroy();
            this.snakeRenderers.delete(sessionId);
        }
    });
    
    // Food
    // We'll just re-draw all food when any food changes? 
    // Or we can maintain a map of food sprites?
    // Drawing 50 circles in one Graphics object is efficient.
    // But we need to know where they are.
    // Let's just listen to add/remove and trigger a redraw flag?
    // Or just redraw every frame from the state? Redrawing 50 circles is cheap.
  }

  update(time: number, delta: number) {
    if (!this.room) return;
    
    const dt = delta / 1000;

    // 1. Process Input
    // We need the camera to follow the local player proxy
    // Update proxy from room state
    if (this.mySessionId && this.room.state.players.get(this.mySessionId)) {
        const myPlayer = this.room.state.players.get(this.mySessionId);
        this.localSnakeProxy.x = myPlayer.x;
        this.localSnakeProxy.y = myPlayer.y;
        
        // Debug Info
        // this.debugText.setText(`...`); 
    }

    const inputVector = this.inputManager.update();
    
    // Debug: Force camera follow update every frame just in case
    if (this.mySessionId) {
        // this.cameras.main.startFollow(this.localSnakeProxy as any, true, 0.1, 0.1);
    }
    
    // Send Input to Server
    // Limit send rate? Colyseus handles some batching, but we should be careful.
    // Sending every frame is okay for 60fps local, but maybe throttle to 20fps (server tick)?
    // For now, send every frame for smoothness testing.
    this.room.send("input", { vector: inputVector, boost: false }); // TODO: Add boost input

    // 2. Render Snakes
    this.snakeRenderers.forEach(renderer => {
        renderer.update();
    });
    
    // 3. Render Food
    this.foodGraphics.clear();
    this.foodGraphics.fillStyle(0xff0000, 1);
    this.foodGraphics.lineStyle(2, 0xffcccc, 1); // Glowy outline
    
    this.room.state.food.forEach((food: any) => {
        this.foodGraphics.fillCircle(food.x, food.y, 6); // Physics radius is 10, visual can be smaller/different
        this.foodGraphics.strokeCircle(food.x, food.y, 6);
    });
  }
}
