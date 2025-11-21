import Phaser from 'phaser';
import { COLORS } from '../config';
import Balloon from '../entities/Balloon';
import { Platform } from '../entities/Platform';

export default class SonarSystem {
  private scene: Phaser.Scene;
  private sonarCircle: Phaser.GameObjects.Arc | null = null;
  private activeTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  activate(
    position: { x: number; y: number },
    balloons: Balloon[],
    platforms: Platform[],
    radius: number
  ): void {
    // Destroy previous sonar if exists
    if (this.sonarCircle) {
      this.sonarCircle.destroy();
      this.sonarCircle = null;
    }

    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    // Create sonar pulse at radius 1 (never 0)
    this.sonarCircle = this.scene.add.circle(position.x, position.y, 1, COLORS.SONAR, 0.3);
    this.sonarCircle.setStrokeStyle(3, COLORS.SONAR, 0.8);

    // Animate the sonar expanding
    this.activeTween = this.scene.tweens.add({
      targets: this.sonarCircle,
      radius: radius,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.sonarCircle?.destroy();
        this.sonarCircle = null;
        this.activeTween = null;
      }
    });

    // Reveal balloons within radius
    balloons.forEach((balloon) => {
      if (!balloon.isDestroyed()) {
        const pos = balloon.getPosition();
        const distance = Phaser.Math.Distance.Between(position.x, position.y, pos.x, pos.y);
        if (distance <= radius) {
          balloon.show();
          // Use one delayedCall per balloon, cancel any previous
          this.scene.time.delayedCall(1800, () => {
            if (!balloon.isDestroyed()) balloon.hide();
          });
        }
      }
    });

    // Reveal platforms safely
    platforms.forEach((platform) => {
      const dx = platform.getX() - position.x;
      const dy = platform.getY() - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        platform.show();
        this.scene.time.delayedCall(2000, () => {
          platform.hide();
        });
      }
    });
  }

  cleanup(): void {
    if (this.sonarCircle) {
      this.sonarCircle.destroy();
      this.sonarCircle = null;
    }
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }
  }
}
