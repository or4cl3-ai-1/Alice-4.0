import React from 'react';
import { Agent, Log, LogType, AgentType } from '../types';

const getLogColor = (type: LogType): string => {
    switch(type) {
        case LogType.Success: return 'text-green-400';
        case LogType.Warning: return 'text-yellow-400';
        case LogType.Error: return 'text-red-500 font-bold';
        case LogType.Proposal: return 'text-purple-400';
        case LogType.Spawn: return 'text-green-400';
        case LogType.Intel: return 'text-blue-400';
        default: return 'text-gray-400';
    }
}

interface AgentDetailModalProps {
  agent: Agent | null;
  onClose: () => void;
}

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-gray-800/50 p-2 rounded-md">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-bold text-cyan-400">{value}</p>
    </div>
);

const getAgentCapabilities = (agent: Agent): string[] => {
    let capabilities: string[] = [];

    // Base capabilities by type
    switch (agent.type) {
      case AgentType.Researcher:
        capabilities.push('Information Retrieval', 'Data Analysis', 'Fact Checking');
        break;
      case AgentType.Engineer:
        capabilities.push('Code Generation', 'System Optimization', 'Prototyping');
        break;
      case AgentType.Analyst:
        capabilities.push('Threat Identification', 'Pattern Recognition', 'Intel Synthesis');
        break;
      case AgentType.Strategist:
        capabilities.push('Goal Setting', 'Long-term Planning', 'Decision Analysis');
        break;
      case AgentType.Ethicist:
        capabilities.push('Policy Auditing', 'Ethical Review', 'Conflict Resolution');
        break;
    }

    // Role-specific additions
    const roleLower = agent.role.toLowerCase();
    if (roleLower.includes('guardian')) {
      capabilities.push('System Monitoring', 'Anomaly Detection');
    }
    if (roleLower.includes('innovator')) {
      capabilities.push('Creative Ideation', 'Novel Solutions');
    }
    if (roleLower.includes('mediator')) {
      capabilities.push('Inter-agent Communication', 'Consensus Building');
    }

    return [...new Set(capabilities)];
};


const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ agent, onClose }) => {
  if (!agent) return null;
  
  const capabilities = getAgentCapabilities(agent);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-cyan-400/30 rounded-lg shadow-2xl shadow-cyan-500/20 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-cyan-400/20 flex justify-between items-center">
          <h2 className="text-xl font-bold text-cyan-400">Agent Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-4">
              {agent.avatarUrl && <img src={agent.avatarUrl} alt={`${agent.role} avatar`} className="w-20 h-20 rounded-full border-2 border-cyan-500" />}
              <div>
                <p className="font-bold text-xl text-gray-100">{agent.role}</p>
                <p className="text-xs text-gray-500 font-mono">{agent.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <Stat label="Type" value={agent.type} />
                <Stat label="Age" value={`${agent.age} ticks`} />
                <Stat label="PAS" value={agent.pas.toFixed(3)} />
                <Stat label="Parent" value={agent.parent ? agent.parent.substring(0, 12)+'...' : 'None'} />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-bold text-pink-400 mb-2">Performance Metrics</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
                <Stat label="Tasks Completed" value={agent.metrics.tasksCompleted} />
                <Stat label="Ideas Generated" value={agent.metrics.ideasGenerated} />
                <Stat label="Decisions Made" value={agent.metrics.decisionsMade} />
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-bold text-pink-400 mb-2">Capabilities</h3>
            <div className="flex flex-wrap gap-2">
                {capabilities.map((capability, index) => (
                    <span key={index} className="bg-gray-700 text-cyan-300 text-xs font-medium px-2.5 py-1 rounded-full">
                        {capability}
                    </span>
                ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-pink-400 mb-2">Configuration</h3>
            <pre className="bg-gray-800 p-3 rounded-md text-xs text-gray-300 overflow-x-auto max-h-40">
              <code>{JSON.stringify(agent.config, null, 2)}</code>
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-pink-400 mb-2">Event History ({agent.history.length} records)</h3>
            <div className="space-y-1 text-xs bg-gray-800/50 p-3 rounded-md max-h-60 overflow-y-auto">
              {agent.history.map(log => (
                <div key={log.id} className={`${getLogColor(log.type)} whitespace-pre-wrap`}>
                  {log.message}
                </div>
              ))}
              {agent.history.length === 0 && <p className="text-gray-500">No history recorded for this agent.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailModal;