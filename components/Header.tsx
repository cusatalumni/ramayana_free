
import React from 'react';

interface HeaderProps {
  showChangeModeButton?: boolean;
  onModeChange?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showChangeModeButton = false, onModeChange }) => {
  return (
    <header className="text-center relative">
      <h1 className="text-4xl sm:text-5xl font-bold text-amber-800 tracking-wider">
        Ramayana Daily Post
      </h1>
      <p className="mt-3 text-lg text-stone-600">
        Generate divine wisdom and sacred art for your daily inspiration.
      </p>
      {showChangeModeButton && (
        <div className="absolute top-0 right-0">
          <button
            onClick={onModeChange}
            className="bg-amber-100 text-amber-800 text-sm font-semibold py-2 px-4 rounded-full border border-amber-300 hover:bg-amber-200 transition-colors"
            title="Go back to select mode"
          >
            Change Mode
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;