
import React from 'react';

interface BrickProps {
    color?: string;
}

const Brick: React.FC<BrickProps> = ({ color }) => {
    const isVisible = !!color;
    const visibilityClass = isVisible ? 'visible' : 'invisible';

    return (
        <div
            className={`w-full aspect-[2.5/1] rounded-[2px] ${visibilityClass} transition-all duration-300`}
            style={{
                backgroundColor: color,
                boxShadow: isVisible ? `0 0 5px ${color}, 0 0 10px ${color}33` : 'none'
            }}
            aria-hidden={!isVisible}
        />
    );
};

export default Brick;
