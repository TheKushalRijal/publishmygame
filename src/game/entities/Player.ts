import Phaser from 'phaser';

type Direction = 'up' | 'down' | 'left' | 'right';

export default class Player {
  private sprite: Phaser.GameObjects.Sprite;
  private currentPlatformIndex: number = 0;

  private textures: Record<Direction, string>;
  private scales: Record<Direction, number>;
  private offsets: Record<Direction, { x: number; y: number }>;

private baseX: number = 0;
private baseY: number = 0;




  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textures: { up: string; down: string; left: string; right: string },
    scales: { up: number; down: number; left: number; right: number },
    offsets: {
      up: { x: number; y: number };
      down: { x: number; y: number };
      left: { x: number; y: number };
      right: { x: number; y: number };
    }
  ) {
    this.textures = textures;
    this.scales = scales;
    this.offsets = offsets;

    // Start with DOWN
    this.sprite = scene.add.sprite(x, y, this.textures.down);
    this.sprite.setScale(this.scales.down);


    this.baseX = x;
this.baseY = y;

  }

  // --- Update sprite based on angle ---
  updateDirection(angle: number) {
    const degree = Phaser.Math.RadToDeg(angle);

    let direction: Direction;

    if (degree >= -45 && degree <= 45) {
      direction = 'right';
    } else if (degree > 45 && degree < 135) {
      direction = 'down';
    } else if (degree >= 135 || degree <= -135) {
      direction = 'left';
    } else {
      direction = 'up';
    }

    this.applyDirection(direction);
  }

  // --- Apply texture, scale, and offset ---
  private applyDirection(direction: Direction) {
  this.sprite.setTexture(this.textures[direction]);
  this.sprite.setScale(this.scales[direction]);

  this.sprite.setPosition(
    this.baseX + this.offsets[direction].x,
    this.baseY + this.offsets[direction].y
  );
}


  // --- Platform teleport ---
  teleportToPlatform(index: number, platforms: Phaser.GameObjects.Rectangle[]): void {
  if (index >= 0 && index < platforms.length) {
    this.currentPlatformIndex = index;
    const platform = platforms[index];

    this.baseX = platform.x;
    this.baseY = platform.y - 20;

    this.sprite.setPosition(this.baseX, this.baseY);
  }
}


  moveUp(platforms: Phaser.GameObjects.Rectangle[]): void {
    if (this.currentPlatformIndex > 0) {
      this.teleportToPlatform(this.currentPlatformIndex - 1, platforms);
      this.applyDirection('up');
    }
  }

  moveDown(platforms: Phaser.GameObjects.Rectangle[]): void {
    if (this.currentPlatformIndex < platforms.length - 1) {
      this.teleportToPlatform(this.currentPlatformIndex + 1, platforms);
      this.applyDirection('down');
    }
  }

  moveLeft(): void {
    this.applyDirection('left');
  }

  moveRight(): void {
    this.applyDirection('right');
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
