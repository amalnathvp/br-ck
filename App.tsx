
import React, { useState } from 'react';
import MenuButton from './components/MenuButton';
import Game from './components/Game';
import LevelSelect from './components/LevelSelect';

const App: React.FC = () => {
  const [view, setView] = useState<'menu' | 'game' | 'level'>('menu');

  const handleStart = () => {
    setView('game');
  };

  const handleLevelSelect = () => {
    setView('level');
  };

  const handleExit = () => {
    alert('Thanks for playing!');
  };

  const handleBackToMenu = () => {
    setView('menu');
  };

  if (view === 'game') {
    return <Game onBack={handleBackToMenu} />;
  }

  if (view === 'level') {
    return <LevelSelect onBack={handleBackToMenu} />;
  }

  return (
    <main className="bg-black w-full h-screen flex flex-col items-center justify-center font-sans">
      <div className="text-center">
        <h1 className="text-white font-extrabold text-9xl tracking-widest font-mono">
          BR!CK
        </h1>
      </div>

      <div className="mt-24 flex flex-col space-y-6">
        <MenuButton label="START" onClick={handleStart} />
        <MenuButton label="LEVEL" onClick={handleLevelSelect} />
        <MenuButton label="EXIT" onClick={handleExit} />
      </div>
    </main>
  );
};

export default App;
