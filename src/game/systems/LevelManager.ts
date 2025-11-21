// LevelManager.ts
import { LevelConfig, getLevelConfig } from "../config";

export default class LevelManager {
  private currentLevel: number = 0;
  private balloonsRemaining: number = 0;
  private arrowsLeft: number = 0;

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  getLevelConfig(): LevelConfig {
    return getLevelConfig(this.currentLevel + 1);
  }

  startLevel(): void {
    const config = this.getLevelConfig();
    this.balloonsRemaining = config.balloonCount;
    this.arrowsLeft = config.arrowCount;
  }

  balloonPopped(): void {
    this.balloonsRemaining = Math.max(0, this.balloonsRemaining - 1);
  }

  arrowShot(): void {
    this.arrowsLeft = Math.max(0, this.arrowsLeft - 1);
  }

  getBalloonsRemaining(): number {
    return this.balloonsRemaining;
  }

  getArrowsLeft(): number {
    return this.arrowsLeft;
  }

  isLevelComplete(): boolean {
    return this.balloonsRemaining === 0;
  }

  isLevelFailed(): boolean {
    return this.arrowsLeft === 0 && this.balloonsRemaining > 0;
  }

  nextLevel(): void {
    this.currentLevel++;
    this.startLevel();
  }

  resetLevel(): void {
    this.startLevel();
  }

  resetGame(): void {
    this.currentLevel = 0;
    this.startLevel();
  }
}
