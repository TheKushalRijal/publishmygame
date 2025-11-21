import React from 'react';
import GameUI from './components/GameUI';
import ControlsPanel from './components/ControlsPanel';
import usePhaser from './hooks/usePhaser';

function App() {
  const { gameState, message, gameOver, restartLevel, newGame } = usePhaser();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8 relative">
      <div className="max-w-6xl w-full flex gap-8 items-start">
        {/* Optional controls panel */}
        <div className="flex-shrink-0">
          <ControlsPanel
            onRestart={restartLevel}
            onNewGame={newGame}
            gameOver={gameOver}
          />
        </div>

        {/* Game container */}
        <div className="flex-grow relative">
          <div
            id="game-container"
            className="border-4 border-gray-700 rounded-lg overflow-hidden shadow-2xl"
          />

          {/* UI overlay */}
          <GameUI
            balloons={gameState.balloons}
            arrows={gameState.arrows}
            level={gameState.level}
            message={message}
            gameOver={gameOver}
            onRestart={restartLevel}
            onNewGame={newGame}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
