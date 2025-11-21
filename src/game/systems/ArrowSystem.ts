import Phaser from 'phaser';
import Balloon from '../entities/Balloon';

interface Arrow {
  sprite: Phaser.GameObjects.Image;

  velocity: { x: number; y: number };
}

export default class ArrowSystem {
  private scene: Phaser.Scene;
  private arrows: Arrow[] = [];
  private readonly ARROW_SPEED = 500;
  private readonly HIT_DISTANCE = 20;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  shoot(
    from: { x: number; y: number },
    to: { x: number; y: number },
    onHit: (balloon: Balloon) => void
  ): void {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const velocity = {
      x: Math.cos(angle) * this.ARROW_SPEED,
      y: Math.sin(angle) * this.ARROW_SPEED,
    };

    const arrowSprite = this.scene.add.image(from.x, from.y, 'arrow');
arrowSprite.setScale(0.05); // adjust size
arrowSprite.setRotation(angle); // point toward target

    this.arrows.push({ sprite: arrowSprite, velocity });


  }

  update(delta: number, balloons: Balloon[], onHit: (balloon: Balloon) => void): void {
    const deltaSeconds = delta / 1000;

    this.arrows = this.arrows.filter((arrow) => {
      arrow.sprite.x += arrow.velocity.x * deltaSeconds;
      arrow.sprite.y += arrow.velocity.y * deltaSeconds;

      if (
        arrow.sprite.x < 0 ||
        arrow.sprite.x > this.scene.scale.width ||
        arrow.sprite.y < 0 ||
        arrow.sprite.y > this.scene.scale.height
      ) {
        arrow.sprite.destroy();
        return false;
      }

      for (const balloon of balloons) {
        if (!balloon.isDestroyed()) {
          const distance = Phaser.Math.Distance.Between(
            arrow.sprite.x,
            arrow.sprite.y,
            balloon.getPosition().x,
            balloon.getPosition().y
          );

          if (distance < this.HIT_DISTANCE) {
            onHit(balloon);
            arrow.sprite.destroy();
            return false;
          }
        }
      }

      return true;
    });
  }

  clear(): void {
    this.arrows.forEach((arrow) => arrow.sprite.destroy());
    this.arrows = [];
  }
}
