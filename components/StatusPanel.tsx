import React from 'react';

interface StatusPanelProps {
  identity: string;
  agentCount: number;
  policies: {
    min_pas: number;
    max_agents: number;
    approval_threshold: number;
  };
  averagePas: number;
  onGenerateForesight: () => void;
  isGeneratingForesight: boolean;
}

const StatusItem: React.FC<{ label: string; value: React.ReactNode; valueColor?: string }> = ({ label, value, valueColor = 'text-cyan-400' }) => (
  <div>
    <span className="text-gray-400">{label}: </span>
    <span className={`font-bold ${valueColor}`}>{value}</span>
  </div>
);

const getSentiment = (pas: number): { text: string; color: string } => {
    if (pas > 0.75) return { text: 'Optimal', color: 'text-green-400' };
    if (pas > 0.5) return { text: 'Stable', color: 'text-cyan-400' };
    if (pas > 0.3) return { text: 'Stressed', color: 'text-yellow-400' };
    return { text: 'Volatile', color: 'text-red-500' };
};

const StatusPanel: React.FC<StatusPanelProps> = ({ identity, agentCount, policies, averagePas, onGenerateForesight, isGeneratingForesight }) => {
  const sentiment = getSentiment(averagePas);
  return (
    <div className="bg-gray-900/50 border border-cyan-400/20 p-3 rounded-t-lg text-xs sm:text-sm flex flex-wrap justify-between items-center gap-x-6 gap-y-2">
      <StatusItem label="Identity" value={identity} />
      <StatusItem label="Agents" value={`${agentCount}/${policies.max_agents}`} valueColor={agentCount >= policies.max_agents ? "text-red-500" : "text-cyan-400"} />
      <StatusItem label="Colony Sentiment" value={sentiment.text} valueColor={sentiment.color} />
      <button 
        onClick={onGenerateForesight}
        disabled={isGeneratingForesight}
        className="px-2 py-1 text-xs border border-pink-500/50 text-pink-400 rounded hover:bg-pink-500/20 transition-colors disabled:opacity-50 disabled:cursor-wait"
      >
        {isGeneratingForesight ? 'Generating...' : 'Foresight'}
      </button>
    </div>
  );
};

export default StatusPanel;
