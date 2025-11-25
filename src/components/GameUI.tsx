import React from 'react';

interface GameUIProps {
  balloons: number;
  arrows: number;
  level: number;
  levelComplete?: boolean; // new flag for level complete overlay
  gameOver?: { message: string; levelFailed: boolean } | null;
  onReplayLevel: () => void;
  onNextLevel: () => void;
  onRestart: () => void;
  onNewGame: () => void;
}

const GameUI: React.FC<GameUIProps> = ({
  balloons,
  arrows,
  level,
  levelComplete,
  gameOver,
  onReplayLevel,
  onNextLevel,
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

<div className="absolute top-4 right-0 text-white text-xs leading-tight space-y-0.5 z-50 opacity-80">
  <div>Space → Sonar</div>
  <div>E → Super Sonar</div>
  <div>W → Move Up</div>
  <div>S → Move Down</div>
  <div>Mouse → Shoot</div>
</div>




      {/* Level Complete Overlay */}
      {levelComplete && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center gap-6">
          <div className="text-yellow-400 text-4xl font-bold">Room Cleared!</div>
          <div className="text-white text-lg">Level {level} Complete</div>
          <div className="flex gap-4">
            <button
              onClick={onNextLevel}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold"
            >
              Next Level
            </button>
            <button
              onClick={onReplayLevel}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold"
            >
              Replay Level
            </button>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
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
