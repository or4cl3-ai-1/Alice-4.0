import React from 'react';
import { Threat, ThreatLevel } from '../types';

interface IntelPanelProps {
  threats: Threat[];
}

const getThreatColor = (level: ThreatLevel): string => {
  switch (level) {
    case ThreatLevel.Low:
      return 'border-l-blue-400';
    case ThreatLevel.Medium:
      return 'border-l-yellow-400';
    case ThreatLevel.High:
      return 'border-l-orange-500';
    case ThreatLevel.Critical:
      return 'border-l-red-600';
    default:
      return 'border-l-gray-500';
  }
};

const IntelPanel: React.FC<IntelPanelProps> = ({ threats }) => {
  return (
    <div className="bg-gray-900/50 border border-cyan-400/20 p-4 rounded-lg flex flex-col h-full">
      <h2 className="text-lg font-bold text-cyan-400 mb-3 flex-shrink-0">Intel Feed</h2>
      <div className="overflow-y-auto flex-grow pr-2 text-sm space-y-3">
        {threats.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-500">
                <p>No intel from Analyst agents yet...</p>
            </div>
        )}
        {threats.map((threat) => (
          <div key={threat.id} className={`bg-gray-800/60 p-3 border-l-4 ${getThreatColor(threat.level)} rounded-r-md`}>
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
              <span>LEVEL: {threat.level}</span>
              <span>SRC: {threat.source}</span>
            </div>
            <p className="text-gray-200">{threat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntelPanel;
