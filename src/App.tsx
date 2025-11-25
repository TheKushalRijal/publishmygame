import React from 'react';
import GameUI from './components/GameUI';
import usePhaser from './hooks/usePhaser';

function App() {
  const { gameState, gameOver, restartLevel, newGame, nextLevel, replayLevel, levelComplete } = usePhaser();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8 relative">
      <div className="max-w-6xl w-full flex-grow relative">
        {/* Game container */}
        <div
          id="game-container"
          className="w-[800px] h-[600px] border-4 border-gray-700 rounded-lg overflow-hidden shadow-2xl"
        ></div>

        {/* UI overlay */}
        <GameUI
          balloons={gameState.balloons}
          arrows={gameState.arrows}
          level={gameState.level}
          levelComplete={levelComplete}   // ← correctly passed
          gameOver={gameOver}
          onReplayLevel={replayLevel}     // ← correctly passed
          onNextLevel={nextLevel}         // ← correctly passed
          onRestart={restartLevel}
          onNewGame={newGame}
        />
      </div>
    </div>
  );
}


export default App;
