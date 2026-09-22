import React from 'react';
import { Play, Square } from 'lucide-react';
import { SCENARIOS } from '../data/scenarios.ts';

interface ControlsProps {
  running: boolean;
  activeScenarioKey: string;
  onStart: () => void;
  onStop: () => void;
  onSelectScenario: (key: string) => void;
  statusText: string;
}

export const Controls: React.FC<ControlsProps> = ({
  running,
  activeScenarioKey,
  onStart,
  onStop,
  onSelectScenario,
  statusText,
}) => {
  return (
    <nav className="controls" aria-label="Simulation controls">
      <button
        id="run-btn"
        className="primary"
        onClick={running ? onStop : onStart}
        aria-pressed={running}
      >
        {running ? (
          <>
            <Square className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>Stop / Reset</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>Start live attack</span>
          </>
        )}
      </button>

      <span className="sep" aria-hidden="true"></span>

      <span className="scn-label">Scenario</span>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Attack scenarios">
        {Object.values(SCENARIOS).map((s) => {
          const isSelected = activeScenarioKey === s.key;
          return (
            <button
              key={s.key}
              className={`scn ${isSelected ? 'on' : ''}`}
              onClick={() => onSelectScenario(s.key)}
              aria-pressed={isSelected}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div
        className={`status ${running ? 'live' : ''}`}
        role="status"
        aria-live="polite"
      >
        <span className="d" aria-hidden="true"></span>
        <span>{statusText}</span>
      </div>
    </nav>
  );
};
