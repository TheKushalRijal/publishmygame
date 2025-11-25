import { useState, useEffect, useRef } from 'react';

import MainScene from '../game/scenes/MainScene';
import Phaser from 'phaser';

const usePhaser = () => {
  const [gameState, setGameState] = useState({
    balloons: 0,
    arrows: 0,
    level: 1,
    message: '',
  });

  const [gameOver, setGameOver] = useState<null | { message: string; levelFailed: boolean }>(null);
  const [levelComplete, setLevelComplete] = useState(false);

  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const phaserSceneRef = useRef<MainScene | null>(null); // ← store your scene here

  // Initialize Phaser once
  useEffect(() => {
    if (!phaserGameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        scene: MainScene,
      };

      const game = new Phaser.Game(config);
      phaserGameRef.current = game;

      // Wait until scene is created to get reference
      game.events.on('ready', () => {
        const scene = game.scene.keys['MainScene'] as MainScene;
        phaserSceneRef.current = scene;

        // Set callbacks
        scene.setUIUpdateCallback((data) => {
          setGameState(prev => ({ ...prev, ...data }));
        });

        scene.setLevelEndCallback(() => setGameOver({ message: 'Game Over', levelFailed: true }));

        scene.setLevelCompleteUICallback(() => setLevelComplete(true));
      });
    }
  }, []);

  // Phaser functions
  const nextLevel = () => {
    setLevelComplete(false);
    phaserSceneRef.current?.levelManager.nextLevel();
    phaserSceneRef.current?.startLevel();
  };

  const replayLevel = () => {
    setLevelComplete(false);
    phaserSceneRef.current?.restartLevel();
  };

  const restartLevel = () => {
    setGameOver(null);
    phaserSceneRef.current?.restartLevel();
  };

  const newGame = () => {
    setGameOver(null);
    phaserSceneRef.current?.levelManager.resetLevel();
    phaserSceneRef.current?.startLevel();
  };

  return {
    gameState,
    gameOver,
    levelComplete,
    nextLevel,
    replayLevel,
    restartLevel,
    newGame,
  };
};

export default usePhaser;
