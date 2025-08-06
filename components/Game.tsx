import React, { useState, useEffect, useRef, useCallback } from 'react';
import Brick from './Brick';
import MenuButton from './MenuButton';
import Paddle, { PADDLE_WIDTH, PADDLE_HEIGHT } from './Paddle';
import Ball, { BALL_SIZE } from './Ball';

interface GameProps {
    onBack: () => void;
}

const BRICK_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];
const GRID_ROWS = 8;
const GRID_COLS = 14;
const INITIAL_LIVES = 3;

interface BrickData {
    color: string;
}

const generateBricks = (): (BrickData | null)[][] => {
    const bricks: (BrickData | null)[][] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        bricks[r] = [];
        for (let c = 0; c < GRID_COLS; c++) {
            const probability = 1 - (r / GRID_ROWS) * 0.7; // Bricks are denser at the top
            if (Math.random() < probability) {
                const color = BRICK_COLORS[Math.floor(Math.random() * BRICK_COLORS.length)];
                bricks[r][c] = { color };
            } else {
                bricks[r][c] = null;
            }
        }
    }
    // Ensure there are some bricks to play with
    if (bricks.flat().every(b => b === null)) {
        return generateBricks(); // Recurse if no bricks were generated
    }
    return bricks;
};

type GameState = 'ready' | 'playing' | 'paused' | 'gameOver' | 'win';

const Game: React.FC<GameProps> = ({ onBack }) => {
    const [gameState, setGameState] = useState<GameState>('ready');
    const [bricks, setBricks] = useState<(BrickData | null)[][]>(generateBricks);
    const [paddleX, setPaddleX] = useState(window.innerWidth / 2);
    const [ball, setBall] = useState({ x: 0, y: 0, dx: 4, dy: -4 });
    const [lives, setLives] = useState(INITIAL_LIVES);
    const [score, setScore] = useState(0);

    const gameContainerRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);
    const animationFrameId = useRef<number>();

    const resetBallAndPaddle = useCallback(() => {
        if (!gameContainerRef.current) return;
        const containerRect = gameContainerRef.current.getBoundingClientRect();
        
        // Set paddle to center, but apply constraints
        const centerX = containerRect.width / 2;
        const halfPaddleWidth = PADDLE_WIDTH / 2;
        const constrainedPaddleX = Math.max(halfPaddleWidth, Math.min(centerX, containerRect.width - halfPaddleWidth));
        setPaddleX(constrainedPaddleX);
        
        const initialDx = (Math.random() > 0.5 ? 1 : -1) * 4;

        setBall({
            x: containerRect.width / 2,
            y: containerRect.height - PADDLE_HEIGHT - 30 - BALL_SIZE,
            dx: initialDx,
            dy: -5
        });
    }, []);
    
    const resetGame = () => {
        setLives(INITIAL_LIVES);
        setScore(0);
        setBricks(_ => generateBricks());
        setGameState('ready');
    };

    const launchBall = () => {
        if (gameState === 'ready') {
            setGameState('playing');
        }
    };
    
    useEffect(() => {
        if (gameState === 'ready') {
            resetBallAndPaddle();
        }
    }, [gameState, resetBallAndPaddle]);

    const updatePaddlePosition = useCallback((clientX: number) => {
        if (gameContainerRef.current) {
            const containerRect = gameContainerRef.current.getBoundingClientRect();
            const rawX = clientX - containerRect.left;
            // Apply the same constraints as in the Paddle component
            const halfPaddleWidth = PADDLE_WIDTH / 2;
            const constrainedX = Math.max(halfPaddleWidth, Math.min(rawX, containerRect.width - halfPaddleWidth));
            setPaddleX(constrainedX);
        }
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            updatePaddlePosition(e.clientX);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [updatePaddlePosition]);

    useEffect(() => {
        const mainEl = mainRef.current;
        if (!mainEl) return;
    
        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            updatePaddlePosition(e.touches[0].clientX);
            setGameState(prev => {
                if (prev === 'ready' || prev === 'paused') {
                    return 'playing';
                }
                return prev;
            });
        };
    
        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            updatePaddlePosition(e.touches[0].clientX);
        };
    
        const handleTouchEnd = () => {
            setGameState(prev => {
                if (prev === 'playing') {
                    return 'paused';
                }
                return prev;
            });
        };
    
        mainEl.addEventListener('touchstart', handleTouchStart, { passive: false });
        mainEl.addEventListener('touchmove', handleTouchMove, { passive: false });
        mainEl.addEventListener('touchend', handleTouchEnd);
        mainEl.addEventListener('touchcancel', handleTouchEnd);
    
        return () => {
            mainEl.removeEventListener('touchstart', handleTouchStart);
            mainEl.removeEventListener('touchmove', handleTouchMove);
            mainEl.removeEventListener('touchend', handleTouchEnd);
            mainEl.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [updatePaddlePosition]);
    
    const gameLoop = useCallback(() => {
        if (gameState !== 'playing') return;

        animationFrameId.current = requestAnimationFrame(gameLoop);

        setBall(prevBall => {
            let { x, y, dx, dy } = prevBall;

            if (!gameContainerRef.current) return prevBall;
            const containerRect = gameContainerRef.current.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const containerHeight = containerRect.height;
            
            x += dx;
            y += dy;

            // Wall collision - use proper ball center calculations
            if (x <= BALL_SIZE / 2 || x >= containerWidth - BALL_SIZE / 2) {
                dx = -dx;
                // Keep ball within bounds
                x = Math.max(BALL_SIZE / 2, Math.min(x, containerWidth - BALL_SIZE / 2));
            }
            if (y <= BALL_SIZE / 2) {
                dy = -dy;
                y = BALL_SIZE / 2;
            }

            // Paddle collision
            const halfPaddleWidth = PADDLE_WIDTH / 2;
            // Use the same constraint logic as the Paddle component
            const constrainedPaddleCenterX = Math.max(halfPaddleWidth, Math.min(paddleX, containerWidth - halfPaddleWidth));
            const paddleLeft = constrainedPaddleCenterX - halfPaddleWidth;
            const paddleRight = constrainedPaddleCenterX + halfPaddleWidth;
            const paddleTop = containerHeight - PADDLE_HEIGHT - 30;

            if (
                y + BALL_SIZE / 2 >= paddleTop &&
                y - BALL_SIZE / 2 <= paddleTop + PADDLE_HEIGHT &&
                x + BALL_SIZE / 2 >= paddleLeft &&
                x - BALL_SIZE / 2 <= paddleRight &&
                dy > 0 // Only bounce if ball is moving downward
            ) {
                dy = -dy;
                const hitPos = (x - constrainedPaddleCenterX) / halfPaddleWidth;
                dx = hitPos * 5; 
                y = paddleTop - BALL_SIZE / 2; // Ensure ball doesn't get stuck in paddle
            }

            // Lose a life
            if (y + BALL_SIZE / 2 > containerHeight) {
                setLives(l => l - 1);
                if (lives - 1 <= 0) {
                    setGameState('gameOver');
                } else {
                    setGameState('ready');
                }
                return prevBall;
            }
            
            // Brick collision
            const gap = 6;
            const brickWidth = (containerWidth - (GRID_COLS - 1) * gap) / GRID_COLS;
            const brickHeight = brickWidth / 2.5;
            let collisionOccurred = false;

            for (let r = 0; r < GRID_ROWS; r++) {
                if (collisionOccurred) break;
                for (let c = 0; c < GRID_COLS; c++) {
                    const brick = bricks[r][c];
                    if (brick) {
                        const brickX = c * (brickWidth + gap);
                        const brickY = r * (brickHeight + gap);

                        if (
                            x + BALL_SIZE / 2 > brickX &&
                            x - BALL_SIZE / 2 < brickX + brickWidth &&
                            y + BALL_SIZE / 2 > brickY &&
                            y - BALL_SIZE / 2 < brickY + brickHeight
                        ) {
                            dy = -dy;
                            setBricks(prevBricks => {
                                const newBricks = prevBricks.map(row => [...row]);
                                newBricks[r][c] = null;
                                return newBricks;
                            });
                            setScore(s => s + 10);
                            collisionOccurred = true;
                            break;
                        }
                    }
                }
            }
            return { x, y, dx, dy };
        });

    }, [gameState, bricks, paddleX, lives]);

    useEffect(() => {
        if (bricks.flat().every(b => b === null)) {
            setGameState('win');
        }
    }, [bricks]);

    useEffect(() => {
        if (gameState === 'playing') {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        } else {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        }
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [gameState, gameLoop]);
    
    useEffect(() => {
        const handleResize = () => {
            if (gameState !== 'playing') {
                resetBallAndPaddle();
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [gameState, resetBallAndPaddle]);

    const renderOverlay = () => {
        if (gameState === 'playing' || gameState === 'paused') return null;

        const isEndState = gameState === 'gameOver' || gameState === 'win';
        const isReadyState = gameState === 'ready';

        let title = '';
        if (isReadyState && lives === INITIAL_LIVES) title = 'GET READY';
        if (isReadyState && lives < INITIAL_LIVES) title = 'TRY AGAIN';
        if (gameState === 'gameOver') title = 'GAME OVER';
        if (gameState === 'win') title = 'YOU WIN!';

        let buttonText = '';
        if (isReadyState) buttonText = 'CLICK OR TOUCH TO LAUNCH';
        if (isEndState) buttonText = 'PLAY AGAIN';

        return (
            <div 
                className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-20 text-center cursor-pointer"
                onClick={isEndState ? resetGame : launchBall}
                role="button"
                tabIndex={0}
                aria-label={buttonText}
            >
                <h2 className="text-white font-extrabold text-5xl md:text-7xl tracking-widest font-mono mb-4">{title}</h2>
                {isEndState &&
                    <p className="text-yellow-400 text-3xl mb-8">Final Score: {score}</p>
                }
                <span className="text-white text-2xl font-bold animate-pulse">{buttonText}</span>
            </div>
        );
    }

    return (
        <main ref={mainRef} className="bg-black w-full min-h-screen flex flex-col items-center justify-center p-4 font-sans overflow-hidden relative">
            {gameState !== 'paused' &&
                <>
                    <div className="flex justify-between w-full max-w-4xl text-white font-bold text-2xl px-4 py-2">
                        <span aria-label={`Current score: ${score}`}>SCORE: {score}</span>
                        <span aria-label={`Lives remaining: ${lives}`}>LIVES: {lives}</span>
                    </div>
                    <div ref={gameContainerRef} className="relative w-full max-w-4xl p-2 bg-gray-900/50 rounded-lg shadow-2xl shadow-blue-500/20 aspect-[14/9]">
                        {renderOverlay()}
                        <div
                            className="grid gap-1.5"
                            style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
                            aria-label="Brick layout"
                        >
                            {bricks.map((row, rowIndex) =>
                                row.map((brick, colIndex) => (
                                    <Brick
                                        key={`${rowIndex}-${colIndex}`}
                                        color={brick?.color}
                                    />
                                ))
                            )}
                        </div>
                        {gameContainerRef.current && 
                            <>
                                <Paddle x={paddleX} containerWidth={gameContainerRef.current.clientWidth} />
                                <Ball position={ball} />
                            </>
                        }
                    </div>
                    <div className="mt-8">
                      <MenuButton label="BACK TO MENU" onClick={onBack} />
                    </div>
                </>
            }
             {gameState === 'paused' && (
                <div className="absolute inset-0 bg-black z-30" aria-label="Game paused"></div>
            )}
        </main>
    );
};

export default Game;