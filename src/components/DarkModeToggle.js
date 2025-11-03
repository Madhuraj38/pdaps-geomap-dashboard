import React from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="dark-mode-toggle">
      <div 
        className={`toggle-switch ${isDarkMode ? 'active' : ''}`}
        onClick={toggleDarkMode}
      >
        <div className="toggle-slider">
          {isDarkMode ? (
            <Brightness4Icon style={{ fontSize: '16px', color: 'gray' }} />
          ) : (
            <Brightness7Icon style={{ fontSize: '16px', color: 'orange' }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DarkModeToggle;
