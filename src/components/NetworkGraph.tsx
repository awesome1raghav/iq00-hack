import React from 'react';
import { GRAPH_NODES, GRAPH_EDGES, GRAPH_PATH } from '../data/scenarios.ts';

interface NetworkGraphProps {
  activePath: boolean;
  graphRiskScore?: number;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  activePath,
  graphRiskScore = 89,
}) => {
  return (
    <div className="graph-wrap">
      <svg
        viewBox="0 0 660 280"
        className="w-full h-auto"
        style={{ minWidth: 480 }}
        aria-label="Connected mule network graph showing entity relationship from phone to mule accounts"
      >
        <defs>
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--line-2)" />
            <stop offset="100%" stopColor="var(--line)" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#C2392C" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Edges */}
        {GRAPH_EDGES.map(([src, dst]) => {
          const from = GRAPH_NODES[src];
          const to = GRAPH_NODES[dst];
          if (!from || !to) return null;
          const edgeKey = `${src}-${dst}`;
          const isScamPath = activePath && GRAPH_PATH.includes(edgeKey);

          return (
            <line
              key={edgeKey}
              x1={from[0]}
              y1={from[1]}
              x2={to[0]}
              y2={to[1]}
              stroke={isScamPath ? 'var(--red)' : 'var(--line-2)'}
              strokeWidth={isScamPath ? 2.8 : 1.5}
              strokeDasharray={isScamPath ? '6 4' : undefined}
              filter={isScamPath ? 'url(#glow)' : undefined}
              className={isScamPath ? 'transition-all duration-300' : ''}
            >
              {isScamPath && (
                <animate
                  attributeName="stroke-dashoffset"
                  from="20"
                  to="0"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              )}
            </line>
          );
        })}

        {/* Nodes */}
        {Object.entries(GRAPH_NODES).map(([id, [x, y, label]]) => {
          const isMule = id === 'mule' || id === 'ay' || id === 'az';
          const isHighlighted = activePath && isMule;
          const isSource = id === 'user' || id === 'acct';

          let fill = 'var(--paper)';
          let stroke = 'var(--line-2)';
          let textFill = 'var(--ink-2)';

          if (activePath) {
            if (isHighlighted) {
              fill = 'var(--red-bg)';
              stroke = 'var(--red)';
              textFill = 'var(--red)';
            } else if (isSource) {
              fill = 'var(--teal-bg)';
              stroke = 'var(--teal)';
              textFill = 'var(--teal)';
            }
          }

          return (
            <g key={id} transform={`translate(${x}, ${y})`}>
              <circle
                r={isHighlighted ? 15 : 13}
                fill={fill}
                stroke={stroke}
                strokeWidth={isHighlighted ? 2.5 : 1.6}
                filter={isHighlighted ? 'url(#glow)' : undefined}
              />
              <text
                textAnchor="middle"
                dy="24"
                fontSize="10"
                fontFamily="var(--sans)"
                fontWeight={isHighlighted ? '700' : '500'}
                fill={textFill}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="graph-cap flex justify-between items-center text-xs">
        <span>
          Cross-institutional entity graph &bull; 11 nodes correlated &bull; Zero PII exchanged
        </span>
        {activePath && (
          <span className="font-semibold text-red-600 dark:text-red-400">
            Mule network correlation risk: {graphRiskScore}%
          </span>
        )}
      </div>
    </div>
  );
};
