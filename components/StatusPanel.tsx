
import React from 'react';

interface StatusPanelProps {
  identity: string;
  agentCount: number;
  policies: {
    min_pas: number;
    max_agents: number;
    approval_threshold: number;
  };
}

const StatusItem: React.FC<{ label: string; value: React.ReactNode; valueColor?: string }> = ({ label, value, valueColor = 'text-cyan-400' }) => (
  <div>
    <span className="text-gray-400">{label}: </span>
    <span className={`font-bold ${valueColor}`}>{value}</span>
  </div>
);

const StatusPanel: React.FC<StatusPanelProps> = ({ identity, agentCount, policies }) => {
  return (
    <div className="bg-gray-900/50 border border-cyan-400/20 p-3 rounded-t-lg text-xs sm:text-sm flex flex-wrap justify-between items-center gap-x-6 gap-y-2">
      <StatusItem label="Identity" value={identity} />
      <StatusItem label="Agents" value={`${agentCount} / ${policies.max_agents}`} valueColor={agentCount >= policies.max_agents ? "text-red-500" : "text-cyan-400"} />
      <StatusItem label="Policies" value={`PAS ≥ ${policies.min_pas} | Approval ≥ ${policies.approval_threshold * 100}%`} valueColor="text-pink-500" />
    </div>
  );
};

export default StatusPanel;
