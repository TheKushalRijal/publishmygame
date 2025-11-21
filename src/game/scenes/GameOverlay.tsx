import React from 'react';

interface GameOverlayProps {
  gameOver: { message: string; levelFailed: boolean } | null;
  restartLevel: () => void;
  newGame: () => void;
}

export default function GameOverlay({ gameOver, restartLevel, newGame }: GameOverlayProps) {
  if (!gameOver) return null;

  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-70 z-50">
      <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg flex flex-col items-center">
        <h2 className="text-2xl mb-4">{gameOver.message}</h2>
        {gameOver.levelFailed && (
          <div className="flex space-x-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={restartLevel}
            >
              Restart Level
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              onClick={newGame}
            >
              New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
