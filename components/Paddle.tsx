import React from 'react';

interface PaddleProps {
  x: number;
  containerWidth: number;
}

export const PADDLE_WIDTH = 120; // in pixels
export const PADDLE_HEIGHT = 20; // in pixels

const Paddle: React.FC<PaddleProps> = ({ x, containerWidth }) => {
  const halfPaddleWidth = PADDLE_WIDTH / 2;
  // Constrain paddle center within the game container bounds
  const constrainedCenterX = Math.max(halfPaddleWidth, Math.min(x, containerWidth - halfPaddleWidth));
  // Calculate left position from the constrained center
  const leftPosition = constrainedCenterX - halfPaddleWidth;

  return (
    <div
      className="absolute bg-white rounded-md shadow-lg"
      style={{
        left: `${leftPosition}px`,
        bottom: '30px', // Position from the bottom
        width: `${PADDLE_WIDTH}px`,
        height: `${PADDLE_HEIGHT}px`,
        boxShadow: '0 0 15px #fff, 0 0 25px #fff, 0 0 35px #06b6d4',
      }}
      aria-label="Player paddle"
    />
  );
};

export default Paddle;
