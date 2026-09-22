import React from 'react';
import { PHASES } from '../data/scenarios.ts';

interface StepperProps {
  currentPhaseIndex: number; // 0 to 5, or -1 when idle
}

export const Stepper: React.FC<StepperProps> = ({ currentPhaseIndex }) => {
  return (
    <ol className="stepper" aria-label="Incident response phases">
      {PHASES.map((label, idx) => {
        let cls = 'ph';
        if (currentPhaseIndex === idx) cls += ' cur';
        else if (currentPhaseIndex > idx) cls += ' done';

        return (
          <li
            key={label}
            className={cls}
            aria-current={currentPhaseIndex === idx ? 'step' : undefined}
          >
            <span className="n" aria-hidden="true">
              0{idx + 1}
            </span>
            <span className="l">{label}</span>
          </li>
        );
      })}
    </ol>
  );
};
