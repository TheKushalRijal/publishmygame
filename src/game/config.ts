import Phaser from 'phaser';
import MainScene from './scenes/MainScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,

  /* 🔥 Let Phaser RESIZE dynamically inside iframe */
  scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  width: 800,
  height: 600,
  parent: 'game-container',
},

  backgroundColor: '#1a1a2e',

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },

  scene: [MainScene],
};

export const PLATFORM_POSITIONS = [
  { x: 150, y: 150 },
  { x: 650, y: 150 },
  { x: 250, y: 300 },
  { x: 550, y: 300 },
  { x: 150, y: 450 },
  { x: 650, y: 450 },
];

export interface LevelConfig {
  level: number;
  balloonCount: number;
  arrowCount: number;
  sonarRadius: number;
}

export function getLevelConfig(level: number): LevelConfig {
  const baseBalloons = 3;
  const baseArrows = 500;
  const baseSonar = 200;

  return {
    level,
    balloonCount: baseBalloons + (level - 1),
    arrowCount: baseArrows + (level - 1) * 2,
    sonarRadius: Math.max(50, baseSonar - (level - 1) * 10),
  };
}

export const COLORS = {
  PLAYER: 0xffd700,
  PLATFORM: 0x4a5568,
  BALLOON: 0xff6b9d,
  ARROW: 0xf59e0b,
  SONAR: 0x3b82f6,
  FLARE: 0xfbbf24,
};
