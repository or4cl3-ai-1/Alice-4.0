
import React, { useState } from 'react';
// FIX: Corrected import path for types
import { AgentType } from '../types';

interface SpawnPanelProps {
  onSpawn: (agentType: AgentType, role: string, config: string) => void;
  isRunning: boolean;
  maxAgents: number;
  currentAgents: number;
}

const SpawnPanel: React.FC<SpawnPanelProps> = ({ onSpawn, isRunning, maxAgents, currentAgents }) => {
  const [role, setRole] = useState('Seeker');
  const [agentClass, setAgentClass] = useState<AgentType>(AgentType.Researcher);
  const [config, setConfig] = useState('{}');
  const isAtMaxAgents = currentAgents >= maxAgents;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRunning && !isAtMaxAgents) {
      onSpawn(agentClass, role, config);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-cyan-400/20 p-4 rounded-lg flex flex-col">
      <h2 className="text-lg font-bold text-cyan-400 mb-3">Spawn Panel</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm">
        <div>
          <label htmlFor="role" className="block text-gray-400 mb-1">Role</label>
          <input
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={!isRunning}
          />
        </div>
        <div>
          <label htmlFor="class" className="block text-gray-400 mb-1">Class</label>
          <select
            id="class"
            value={agentClass}
            onChange={(e) => setAgentClass(e.target.value as AgentType)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={!isRunning}
          >
            {Object.values(AgentType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="config" className="block text-gray-400 mb-1">Config (JSON)</label>
          <textarea
            id="config"
            rows={2}
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={!isRunning}
          />
        </div>
        <button
          type="submit"
          disabled={!isRunning || isAtMaxAgents}
          className="w-full bg-cyan-500 text-gray-900 font-bold py-2 rounded transition-all duration-200 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isAtMaxAgents ? 'Agent Limit Reached' : 'Submit Proposal'}
        </button>
      </form>
    </div>
  );
};

export default SpawnPanel;
