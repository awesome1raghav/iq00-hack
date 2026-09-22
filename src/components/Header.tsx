import React from 'react';
import { Sun, Moon, Radio } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  syncConnected: boolean;
  onTestSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  syncConnected,
  onTestSync,
}) => {
  return (
    <header role="banner">
      <div className="brand">
        <div className="mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3z"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="#DCC790"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="bname">GRAPH</div>
      </div>

      <div className="hright">
        <span className="z impl">
          <i aria-hidden="true"></i>Implemented
        </span>
        <span className="z sim">
          <i aria-hidden="true"></i>Simulated
        </span>
        <span className="z con">
          <i aria-hidden="true"></i>Production concept
        </span>
        <span className="proto">
          <i aria-hidden="true"></i>Concept prototype &middot; iQOO Hackathon 2026
        </span>

        {/* Real-time Data Sync Indicator */}
        <button
          className={`sync-badge ${syncConnected ? 'active' : ''}`}
          onClick={onTestSync}
          title="Multi-tab real-time sync active (click to broadcast a pulse)"
          aria-label="Real-time sync status: Active. Click to send sync beacon."
        >
          <span className="sync-pulse" aria-hidden="true"></span>
          <Radio className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Sync Active</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          className="theme-btn"
          onClick={onToggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
              <span>Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
