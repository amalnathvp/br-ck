import React from 'react';

interface BallProps {
  position: { x: number; y: number };
}

export const BALL_SIZE = 16; // in pixels

const Ball: React.FC<BallProps> = ({ position }) => {
  return (
    <div
      className="absolute bg-white rounded-full"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${BALL_SIZE}px`,
        height: `${BALL_SIZE}px`,
        boxShadow: '0 0 10px #fff, 0 0 20px #fef08a',
        transform: 'translate(-50%, -50%)' // Center the ball on its coordinates
      }}
      aria-label="Game ball"
    />
  );
};

export default Ball;
