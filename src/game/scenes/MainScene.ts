import Phaser from 'phaser';
import { PLATFORM_POSITIONS, getLevelConfig } from '../config';
import Player from '../entities/Player';
import Balloon from '../entities/Balloon';
import ArrowSystem from '../systems/ArrowSystem';
import SonarSystem from '../systems/SonarSystem';
import FlareSystem from '../systems/FlareSystem';
import LevelManager from '../systems/LevelManager';
import BackgroundSystem from '../systems/BackgroundSystem';

export default class MainScene extends Phaser.Scene {
  private player!: Player;
  private platforms: Phaser.GameObjects.Rectangle[] = [];
  private balloons: Balloon[] = [];
  private arrowSystem!: ArrowSystem;
  private sonarSystem!: SonarSystem;
  private flareSystem!: FlareSystem;
  public levelManager!: LevelManager;
  private backgroundSystem!: BackgroundSystem;

  private onUIUpdate?: (data: { balloons: number; arrows: number; level: number; message?: string }) => void;
  private onLevelEnd?: (success: boolean) => void;

  private levelActive: boolean = true;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload(): void {
    this.backgroundSystem = new BackgroundSystem(this);
    this.backgroundSystem.preload();
    this.load.image('balloon', 'images/baloon.png');
  }

  create(): void {
    this.createPlatforms();
    this.player = new Player(this, PLATFORM_POSITIONS[0].x, PLATFORM_POSITIONS[0].y - 20);

    this.arrowSystem = new ArrowSystem(this);
    this.sonarSystem = new SonarSystem(this);
    this.flareSystem = new FlareSystem(this);
    this.levelManager = new LevelManager();

    this.setupInputHandlers();
    this.startLevel();
  }

  private createPlatforms(): void {
    PLATFORM_POSITIONS.forEach(pos => {
      const platform = this.add.rectangle(pos.x, pos.y, 80, 10, 0x8b7355).setAlpha(0.3);
      this.platforms.push(platform);
    });
  }

  private setupInputHandlers(): void {
    for (let i = 1; i <= 6; i++) {
      this.input.keyboard?.on(`keydown-${i}`, () => this.player.teleportToPlatform(i - 1, this.platforms));
    }

    this.input.keyboard?.on('keydown-UP', () => this.player.moveUp(this.platforms));
    this.input.keyboard?.on('keydown-DOWN', () => this.player.moveDown(this.platforms));

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.levelActive) return;
      const config = getLevelConfig(this.levelManager.getCurrentLevel() + 1);
      this.sonarSystem.activate(this.player.getPosition(), this.balloons, this.platforms, config.sonarRadius);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.levelActive) return;
      if (this.levelManager.getArrowsLeft() <= 0) return;

      this.levelManager.arrowShot();
      this.arrowSystem.shoot(this.player.getPosition(), { x: pointer.x, y: pointer.y }, this.handleBalloonHit.bind(this));
      this.updateUI();
    });
  }

  public startLevel(): void {
    this.levelActive = true;
    this.clearLevel();
    this.levelManager.startLevel();
    this.spawnBalloons();
    this.updateUI();
    this.backgroundSystem.setBackground(this.levelManager.getCurrentLevel() + 1);
  }

  private spawnBalloons(): void {
    const config = this.levelManager.getLevelConfig();
    for (let i = 0; i < config.balloonCount; i++) {
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const y = Phaser.Math.Between(50, this.scale.height - 50);
      const balloon = new Balloon(this, x, y);
      this.balloons.push(balloon);
    }
  }

  private handleBalloonHit(balloon: Balloon): void {
    const pos = balloon.getPosition();
    this.flareSystem.createFlare(pos.x, pos.y);
    balloon.destroy();
    this.levelManager.balloonPopped();
    this.updateUI();

    if (this.levelManager.isLevelComplete()) {
      this.handleLevelComplete();
    }
  }

  private handleLevelComplete(): void {
  this.levelActive = false;

  // Show "Room Cleared!" message in React UI
  this.onUIUpdate?.({
    balloons: this.levelManager.getBalloonsRemaining(),
    arrows: this.levelManager.getArrowsLeft(),
    level: this.levelManager.getCurrentLevel() + 1,
    message: "Room Cleared!",
  });

  // Move to next level automatically after 2 seconds
  this.time.delayedCall(2000, () => {
    this.levelManager.nextLevel();

    // Clear message before starting next level
    this.onUIUpdate?.({
      balloons: 0,
      arrows: 0,
      level: this.levelManager.getCurrentLevel() + 1,
      message: "",
    });

    this.startLevel();
  });
}


  private handleLevelFailed(): void {
    this.levelActive = false;
    this.onLevelEnd?.(false); // React overlay: Restart / New Game
  }

  private clearLevel(): void {
    this.balloons.forEach(b => b.destroy());
    this.balloons = [];
    this.arrowSystem.clear();
  }

  private updateUI(): void {
    this.onUIUpdate?.({
      balloons: this.levelManager.getBalloonsRemaining(),
      arrows: this.levelManager.getArrowsLeft(),
      level: this.levelManager.getCurrentLevel() + 1,
    });

    if (this.levelManager.isLevelFailed() && this.levelActive) {
      this.handleLevelFailed();
    }
  }

  update(_time: number, delta: number): void {
    if (this.levelActive) {
      this.arrowSystem.update(delta, this.balloons, this.handleBalloonHit.bind(this));
    }
  }

  setUIUpdateCallback(callback: (data: { balloons: number; arrows: number; level: number; message?: string }) => void): void {
    this.onUIUpdate = callback;
  }

  setLevelEndCallback(callback: (success: boolean) => void): void {
    this.onLevelEnd = callback;
  }
}
