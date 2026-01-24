import { Vector2, normalize } from '../core/Physics';
import { Snake } from '../core/Snake';

export class InputManager {
  private scene: Phaser.Scene;
  private snake: Snake;
  private inputVector: Vector2 = { x: 1, y: 0 }; // Default forward
  private isBoosting: boolean = false;

  constructor(scene: Phaser.Scene, snake: Snake) {
    this.scene = scene;
    this.snake = snake;
  }

  update(): { vector: Vector2, boost: boolean } {
    const pointer = this.scene.input.activePointer;
    
    // Check Boost Input (Left Click or Spacebar)
    // Note: In Phaser, activePointer.isDown captures left click/touch.
    // For spacebar, we need to check keyboard.
    const spaceKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.isBoosting = pointer.isDown || (spaceKey?.isDown ?? false);

    // GOLDEN RULE: Steering is delta-based, not position-based.
    // Use movementX / movementY to calculate intent.
    // This is robust against camera movement.
    
    // Check if pointer is locked or just moving
    // Note: Phaser's pointer.movementX/Y might need pointer lock to be reliable in some browsers,
    // but for standard mouse movement it usually works if the pointer is active.
    // However, in a non-locked shooter/agar.io style, we usually compare screen positions.
    // BUT since the camera moves, we must NOT use world coordinates relative to head.
    
    // Correct approach for "Agar.io / Slither" style where mouse is a "joystick":
    // The "center" of the joystick is the CENTER OF THE SCREEN, not the snake's world position.
    // Because the camera is locked to the snake, the snake is ALWAYS at the center of the screen.
    // So Screen Center = Snake Head (visually).
    // Therefore, Mouse Screen Position relative to Screen Center = Relative Direction.
    
    // Let's implement the Screen Space vector.
    const camera = this.scene.cameras.main;
    const centerX = camera.width / 2;
    const centerY = camera.height / 2;
    
    // pointer.x/y is Screen Space (in Phaser)
    // pointer.worldX/worldY is World Space
    
    const dx = pointer.x - centerX;
    const dy = pointer.y - centerY;

    // Only update if pointer is active or moved significantly
    const deadZone = 40; 
    if (Math.abs(dx) > deadZone || Math.abs(dy) > deadZone) {
       this.inputVector = normalize({ x: dx, y: dy });
    } else {
        // If inside deadzone, keep previous vector (don't update) -> snake keeps moving straight
        // Wait, if we return (0,0), Snake.ts ignores it. 
        // So we just return (0,0).
        this.inputVector = { x: 0, y: 0 };
    }

    return { vector: this.inputVector, boost: this.isBoosting };
  }
}
