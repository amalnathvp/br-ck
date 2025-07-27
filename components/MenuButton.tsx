
import React from 'react';

interface MenuButtonProps {
  label: string;
  onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white text-black font-bold text-2xl w-64 py-4 px-8 rounded-md
                 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-400
                 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
    >
      {label}
    </button>
  );
};

export default MenuButton;
