import React, { useState, useEffect } from 'react';
import { AgentType } from '../types';

interface SpawnPanelProps {
  onSpawn: (agentType: AgentType, role: string, config: string) => void;
  isRunning: boolean;
  maxAgents: number;
  currentAgents: number;
}

const predefinedRoles = ['Mediator', 'Guardian', 'Innovator'];
const CUSTOM_ROLE_VALUE = '__custom__';

const ConfigInput: React.FC<{ label: string; name: string; value: string; onChange: (name: string, value: string) => void; placeholder?: string }> = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-gray-400 mb-1 text-xs">{label}</label>
        <input
            id={name}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
    </div>
);

const ConfigSelect: React.FC<{ label: string; name: string; value: string; onChange: (name: string, value: string) => void; children: React.ReactNode }> = ({ label, name, value, onChange, children }) => (
    <div>
        <label htmlFor={name} className="block text-gray-400 mb-1 text-xs">{label}</label>
        <select
            id={name}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
            {children}
        </select>
    </div>
);

const SpawnPanel: React.FC<SpawnPanelProps> = ({ onSpawn, isRunning, maxAgents, currentAgents }) => {
  const [selectedRole, setSelectedRole] = useState(predefinedRoles[0]);
  const [customRole, setCustomRole] = useState('');
  const [agentClass, setAgentClass] = useState<AgentType>(AgentType.Researcher);
  const [config, setConfig] = useState('{}');
  const [configMode, setConfigMode] = useState<'guided' | 'raw'>('guided');
  const [guidedConfig, setGuidedConfig] = useState<Record<string, string>>({});
  
  const isAtMaxAgents = currentAgents >= maxAgents;

  useEffect(() => {
    if (configMode === 'guided') {
      const cleanConfig = Object.entries(guidedConfig).reduce((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {} as Record<string, any>);
      setConfig(Object.keys(cleanConfig).length > 0 ? JSON.stringify(cleanConfig, null, 2) : '{}');
    }
  }, [guidedConfig, configMode]);

  useEffect(() => {
    setGuidedConfig({});
  }, [agentClass]);

  const handleGuidedConfigChange = (key: string, value: string) => {
    setGuidedConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = selectedRole === CUSTOM_ROLE_VALUE ? customRole : selectedRole;
    if (isRunning && !isAtMaxAgents && finalRole.trim()) {
      onSpawn(agentClass, finalRole, config);
      if (selectedRole === CUSTOM_ROLE_VALUE) {
        setCustomRole('');
      }
    }
  };

  const renderGuidedConfigFields = () => {
    const agentSpecificField = () => {
        switch(agentClass) {
            case AgentType.Researcher:
                return <ConfigInput label="Research Topics" name="topics" value={guidedConfig.topics || ''} onChange={handleGuidedConfigChange} placeholder="e.g., AI Ethics, Quantum Computing" />;
            case AgentType.Engineer:
                return <ConfigInput label="Preferred Tech Stack" name="stack" value={guidedConfig.stack || ''} onChange={handleGuidedConfigChange} placeholder="e.g., Python, JAX, Rust" />;
            case AgentType.Analyst:
                return <ConfigInput label="Threat Focus Areas" name="focus" value={guidedConfig.focus || ''} onChange={handleGuidedConfigChange} placeholder="e.g., System Integrity, Misinformation" />;
            case AgentType.Strategist:
                return <ConfigInput label="Primary Goal" name="goal" value={guidedConfig.goal || ''} onChange={handleGuidedConfigChange} placeholder="e.g., Maximize Collective PAS" />;
            case AgentType.Ethicist:
                return <ConfigInput label="Ethical Framework" name="framework" value={guidedConfig.framework || ''} onChange={handleGuidedConfigChange} placeholder="e.g., Deontology, Utilitarianism" />;
            default:
                return null;
        }
    };
    
    return (
        <div className="space-y-3">
            {agentSpecificField()}
            <div className="pt-3 mt-3 border-t border-gray-700">
                <p className="text-gray-400 text-xs font-bold mb-2">Collaboration Preferences</p>
                <div className="space-y-3">
                    <ConfigSelect
                        label="Communication Style"
                        name="preferred_communication_style"
                        value={guidedConfig.preferred_communication_style || 'concise'}
                        onChange={handleGuidedConfigChange}
                    >
                        <option value="concise">Concise</option>
                        <option value="verbose">Verbose</option>
                    </ConfigSelect>
                    <ConfigSelect
                        label="Coordination Strategy"
                        name="coordination_strategy"
                        value={guidedConfig.coordination_strategy || 'direct_messaging'}
                        onChange={handleGuidedConfigChange}
                    >
                        <option value="direct_messaging">Direct Messaging</option>
                        <option value="shared_task_list">Shared Task List</option>
                    </ConfigSelect>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="bg-gray-900/50 border border-cyan-400/20 p-4 rounded-lg flex flex-col h-full">
      <h2 className="text-lg font-bold text-cyan-400 mb-3">Spawn Panel</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm flex-grow">
        <div>
          <label htmlFor="role" className="block text-gray-400 mb-1">Role</label>
          <select id="role" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500" disabled={!isRunning}>
            {predefinedRoles.map(r => <option key={r} value={r}>{r}</option>)}
            <option value={CUSTOM_ROLE_VALUE}>Custom...</option>
          </select>
          {selectedRole === CUSTOM_ROLE_VALUE && (
            <input type="text" placeholder="Enter custom role..." value={customRole} onChange={(e) => setCustomRole(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 mt-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" disabled={!isRunning} required />
          )}
        </div>
        <div>
          <label htmlFor="class" className="block text-gray-400 mb-1">Class</label>
          <select id="class" value={agentClass} onChange={(e) => setAgentClass(e.target.value as AgentType)} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500" disabled={!isRunning}>
            {Object.values(AgentType).map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
            <div className="flex justify-between items-center mb-1">
                 <label className="block text-gray-400">Config</label>
                 <div className="text-xs border border-gray-600 rounded-md p-0.5 flex">
                     <button type="button" onClick={() => setConfigMode('guided')} className={`px-2 py-0.5 rounded ${configMode === 'guided' ? 'bg-cyan-500 text-gray-900' : 'text-gray-400'}`}>Guided</button>
                     <button type="button" onClick={() => setConfigMode('raw')} className={`px-2 py-0.5 rounded ${configMode === 'raw' ? 'bg-cyan-500 text-gray-900' : 'text-gray-400'}`}>Raw JSON</button>
                 </div>
            </div>
          {configMode === 'guided' ? (
            renderGuidedConfigFields()
          ) : (
            <textarea id="config" rows={3} value={config} onChange={(e) => setConfig(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500" disabled={!isRunning} />
          )}
        </div>
        <div className="mt-auto">
          <button type="submit" disabled={!isRunning || isAtMaxAgents || (selectedRole === CUSTOM_ROLE_VALUE && !customRole.trim())} className="w-full bg-cyan-500 text-gray-900 font-bold py-2 rounded transition-all duration-200 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed">
            {isAtMaxAgents ? 'Agent Limit Reached' : 'Submit Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpawnPanel;