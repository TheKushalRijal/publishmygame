import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config';
import MainScene from '../game/scenes/MainScene';

interface GameState {
  balloons: number;
  arrows: number;
  level: number;
  message?: string;
}

export default function usePhaser() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    balloons: 0,
    arrows: 0,
    level: 1,
    message: '',
  });

  const [gameOver, setGameOver] = useState<{ message: string; levelFailed: boolean } | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(gameConfig);

      gameRef.current.events.on('ready', () => {
        const scene = gameRef.current?.scene.getScene('MainScene') as MainScene;
        if (!scene) return;

        // Update UI
        scene.setUIUpdateCallback((data) => setGameState(data));

        // Level end callback
        scene.setLevelEndCallback((success) => {
          if (success) {
            // Room cleared message
            setGameState((prev) => ({ ...prev, message: 'Room Cleared!' }));
            setTimeout(() => {
              setGameState((prev) => ({ ...prev, message: '' }));
              scene.levelManager.nextLevel();
              scene.startLevel();
            }, 1500); // show message 1.5s
          } else {
            // Out of arrows
            setGameOver({ message: 'Out of Arrows! Try Again?', levelFailed: true });
          }
        });
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const restartLevel = () => {
    const scene = gameRef.current?.scene.getScene('MainScene') as MainScene;
    if (!scene) return;

    scene.startLevel();
    setGameOver(null);
  };

  const newGame = () => {
    const scene = gameRef.current?.scene.getScene('MainScene') as MainScene;
    if (!scene) return;

    scene.levelManager.resetGame();
    scene.startLevel();
    setGameOver(null);
  };

  return { gameState, gameOver, restartLevel, newGame };
}
