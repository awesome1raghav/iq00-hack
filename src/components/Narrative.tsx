import React from 'react';

interface NarrativeProps {
  text: string;
  fade?: boolean;
}

export const Narrative: React.FC<NarrativeProps> = ({ text, fade }) => {
  return (
    <div
      className={`narr ${fade ? 'fade' : ''}`}
      role="region"
      aria-live="polite"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};
