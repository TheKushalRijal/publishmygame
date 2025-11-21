import Phaser from 'phaser';

export default class Player {
  private sprite: Phaser.GameObjects.Arc;
  private currentPlatformIndex: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.circle(x, y, 15, 0x4a90e2);
    this.sprite.setStrokeStyle(2, 0xffffff);
  }

  teleportToPlatform(index: number, platforms: Phaser.GameObjects.Rectangle[]): void {
    if (index >= 0 && index < platforms.length) {
      this.currentPlatformIndex = index;
      const platform = platforms[index];
      this.sprite.setPosition(platform.x, platform.y - 20);
    }
  }

  moveUp(platforms: Phaser.GameObjects.Rectangle[]): void {
    if (this.currentPlatformIndex > 0) {
      this.teleportToPlatform(this.currentPlatformIndex - 1, platforms);
    }
  }

  moveDown(platforms: Phaser.GameObjects.Rectangle[]): void {
    if (this.currentPlatformIndex < platforms.length - 1) {
      this.teleportToPlatform(this.currentPlatformIndex + 1, platforms);
    }
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }




  

  destroy(): void {
    this.sprite.destroy();
  }
}
