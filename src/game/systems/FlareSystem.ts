import Phaser from 'phaser';

interface ParticleConfig {
  poolSize: number;
  colors: number[];
  minSize: number;
  maxSize: number;
  lifetime: number;
}

class ParticlePool {
  private scene: Phaser.Scene;
  private pool: Phaser.GameObjects.GameObject[];
  private config: ParticleConfig;
  private activeCount: number;

  constructor(scene: Phaser.Scene, config: ParticleConfig) {
    this.scene = scene;
    this.config = config;
    this.pool = [];
    this.activeCount = 0;
    this.initializePool();
  }

  private initializePool(): void {
    for (let i = 0; i < this.config.poolSize; i++) {
      const particle = this.createParticle();
      particle.setActive(false).setVisible(false);
      this.pool.push(particle);
    }
  }

  private createParticle(): Phaser.GameObjects.Arc {
    const particle = this.scene.add.circle(0, 0, 1, 0xffffff, 1);
    
    if (this.scene.physics && this.scene.physics.world) {
      this.scene.physics.add.existing(particle);
    }
    
    return particle;
  }

  acquire(x: number, y: number, color?: number): Phaser.GameObjects.Arc | null {
    if (this.activeCount >= this.config.poolSize) {
      return null; // Pool exhausted
    }

    const particle = this.pool[this.activeCount] as Phaser.GameObjects.Arc;
    if (!particle) return null;

    this.configureParticle(particle, x, y, color);
    this.activeCount++;
    
    return particle;
  }

  private configureParticle(particle: Phaser.GameObjects.Arc, x: number, y: number, color?: number): void {
    const size = Phaser.Math.Between(this.config.minSize, this.config.maxSize);
    const particleColor = color || this.config.colors[Phaser.Math.Between(0, this.config.colors.length - 1)];
    
    particle.setPosition(x, y);
    particle.setRadius(size);
    particle.setFillStyle(particleColor, 1);
    particle.setAlpha(1);
    particle.setScale(1);
    particle.setActive(true);
    particle.setVisible(true);

    // Reset physics if available
    const body = (particle.body as Phaser.Physics.Arcade.Body);
    if (body) {
      body.setVelocity(0, 0);
      body.setGravity(0, 0);
    }
  }

  release(particle: Phaser.GameObjects.Arc): void {
    particle.setActive(false).setVisible(false);
    
    // Move to end of active pool
    const index = this.pool.indexOf(particle);
    if (index !== -1 && index < this.activeCount) {
      // Swap with last active particle
      const lastActive = this.pool[this.activeCount - 1];
      this.pool[this.activeCount - 1] = particle;
      this.pool[index] = lastActive;
    }
    
    this.activeCount--;
  }

  getActiveCount(): number {
    return this.activeCount;
  }

  cleanup(): void {
    this.pool.forEach(particle => particle.destroy());
    this.pool = [];
    this.activeCount = 0;
  }
}

export default class FlareSystem {
  private scene: Phaser.Scene;
  private explosionPool: ParticlePool;
  private sparkPool: ParticlePool;
  private smokePool: ParticlePool;
  private glowPool: ParticlePool;
  
  // Reusable tween configs
  private readonly tweenConfigs = {
    flash: { alpha: 0, scale: 2, duration: 150, ease: 'Cubic.easeOut' },
    core: { alpha: 0, scale: 1.5, duration: 400, ease: 'Power2' },
    spark: { alpha: 0, scale: 0.3, duration: 700, ease: 'Power2' },
    smoke: { alpha: 0, scale: 2, duration: 1200, ease: 'Sine.easeOut' },
    glow: { alpha: 0, scale: 8, duration: 600, ease: 'Cubic.easeOut' }
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializePools();
  }

  private initializePools(): void {
    this.explosionPool = new ParticlePool(this.scene, {
      poolSize: 20,
      colors: [0xff4500, 0xffa500, 0xffff00, 0xff6347],
      minSize: 2,
      maxSize: 6,
      lifetime: 1000
    });

    this.sparkPool = new ParticlePool(this.scene, {
      poolSize: 15,
      colors: [0xffff00, 0xffd700],
      minSize: 1,
      maxSize: 3,
      lifetime: 700
    });

    this.smokePool = new ParticlePool(this.scene, {
      poolSize: 12,
      colors: [0x888888, 0x666666, 0x444444],
      minSize: 4,
      maxSize: 10,
      lifetime: 1200
    });

    this.glowPool = new ParticlePool(this.scene, {
      poolSize: 5,
      colors: [0xffa500, 0xffff00],
      minSize: 10,
      maxSize: 20,
      lifetime: 600
    });
  }

  createFlare(x: number, y: number): void {
    this.createMainFlash(x, y);
    this.createExplosionParticles(x, y);
    this.createSecondaryParticles(x, y);
    this.createSmokeEffect(x, y);
    this.createLightGlow(x, y);
  }

  private createMainFlash(x: number, y: void): void {
    const flash = this.glowPool.acquire(x, y, 0xffffff);
    if (!flash) return;

    flash.setRadius(5);
    flash.setAlpha(1);

    this.scene.tweens.add({
      targets: flash,
      radius: 40,
      alpha: 0,
      duration: 150,
      ease: 'Cubic.easeOut',
      onComplete: () => this.glowPool.release(flash)
    });

    const core = this.glowPool.acquire(x, y, 0xffa500);
    if (!core) return;

    core.setRadius(20);
    core.setAlpha(0.9);

    this.scene.tweens.add({
      targets: core,
      radius: 60,
      alpha: 0,
      scale: 1.5,
      duration: 400,
      ease: 'Power2',
      onComplete: () => this.glowPool.release(core)
    });
  }

  private createExplosionParticles(x: number, y: number): void {
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.explosionPool.acquire(x, y);
      if (!particle) continue;

      const angle = (i * Math.PI * 2) / particleCount;
      const distance = Phaser.Math.Between(40, 120);
      const speed = Phaser.Math.Between(400, 800);
      const variedAngle = angle + Phaser.Math.FloatBetween(-0.3, 0.3);
      
      // Set physics velocity
      const body = particle.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocity(
          Math.cos(variedAngle) * speed,
          Math.sin(variedAngle) * speed
        );
        
        // Add gravity with delay
        this.scene.time.delayedCall(100, () => {
          if (body && body.world) {
            body.setGravityY(200);
          }
        });
      }

      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        scale: 0.5,
        duration: Phaser.Math.Between(600, 1000),
        ease: 'Power2',
        onComplete: () => this.explosionPool.release(particle)
      });
    }
  }

  private createSecondaryParticles(x: number, y: number): void {
    const secondaryCount = 8;
    
    for (let i = 0; i < secondaryCount; i++) {
      const particle = this.sparkPool.acquire(x, y);
      if (!particle) continue;

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(200, 500);
      
      const body = particle.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );
      }

      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        scale: 0.3,
        duration: Phaser.Math.Between(400, 700),
        ease: 'Power2',
        onComplete: () => this.sparkPool.release(particle)
      });
    }
  }

  private createSmokeEffect(x: number, y: number): void {
    const smokeCount = 6;
    
    for (let i = 0; i < smokeCount; i++) {
      const smoke = this.smokePool.acquire(x, y);
      if (!smoke) continue;

      const delay = Phaser.Math.Between(50, 200);

      this.scene.tweens.add({
        targets: smoke,
        y: y - Phaser.Math.Between(30, 80),
        x: x + Phaser.Math.FloatBetween(-40, 40),
        alpha: 0,
        scale: 2,
        duration: Phaser.Math.Between(800, 1200),
        delay: delay,
        ease: 'Sine.easeOut',
        onComplete: () => this.smokePool.release(smoke)
      });
    }
  }

  private createLightGlow(x: number, y: number): void {
    const glow = this.glowPool.acquire(x, y);
    if (!glow) return;

    glow.setRadius(10);
    glow.setAlpha(0.3);

    this.scene.tweens.add({
      targets: glow,
      radius: 80,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => this.glowPool.release(glow)
    });
  }

  // Performance monitoring
  getPoolStatistics(): { [key: string]: number } {
    return {
      explosionActive: this.explosionPool.getActiveCount(),
      sparkActive: this.sparkPool.getActiveCount(),
      smokeActive: this.smokePool.getActiveCount(),
      glowActive: this.glowPool.getActiveCount()
    };
  }

  // Cleanup method for scene transitions
  destroy(): void {
    this.explosionPool.cleanup();
    this.sparkPool.cleanup();
    this.smokePool.cleanup();
    this.glowPool.cleanup();
  }

  addScreenShake(intensity: number = 0.005): void {
    this.scene.cameras.main.shake(300, intensity);
  }
}