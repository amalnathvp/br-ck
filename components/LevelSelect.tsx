
import React from 'react';
import MenuButton from './MenuButton';

interface LevelSelectProps {
    onBack: () => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({ onBack }) => {
    return (
        <main className="bg-black w-full h-screen flex flex-col items-center justify-center font-sans">
            <h2 className="text-white font-bold text-6xl mb-12 tracking-wider">LEVELS</h2>
            <p className="text-gray-400 mb-12">More levels coming soon!</p>
            <MenuButton label="BACK" onClick={onBack} />
        </main>
    );
};

export default LevelSelect;
