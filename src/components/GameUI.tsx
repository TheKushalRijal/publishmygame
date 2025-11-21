import React from 'react';

interface GameUIProps {
  balloons: number;
  arrows: number;
  level: number;
  message?: string; // e.g., "Room Cleared!"
  gameOver?: { message: string; levelFailed: boolean } | null;
  onRestart: () => void;
  onNewGame: () => void;
}

const GameUI: React.FC<GameUIProps> = ({
  balloons,
  arrows,
  level,
  message,
  gameOver,
  onRestart,
  onNewGame,
}) => {
  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-4 left-4 text-white space-y-1 z-50">
        <div>Balloons: {balloons}</div>
        <div>Arrows: {arrows}</div>
        <div>Level: {level}</div>
      </div>

      {/* Center Message for Level Completion */}
      {message && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-black/50 text-yellow-400 text-3xl font-bold px-6 py-4 rounded-lg animate-fadeInOut">
            {message}
          </div>
        </div>
      )}

      {/* Game Over / Restart Overlay */}
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center gap-4">
          <div className="text-white text-2xl">{gameOver.message}</div>
          <div className="flex gap-4">
            <button
              onClick={onRestart}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold"
            >
              Restart Level
            </button>
            <button
              onClick={onNewGame}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold"
            >
              New Game
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GameUI;
