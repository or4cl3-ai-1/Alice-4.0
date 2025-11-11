import React from 'react';
import { AgentMessage } from '../types';

interface CommsLogPanelProps {
  messages: AgentMessage[];
}

const CommsLogPanel: React.FC<CommsLogPanelProps> = ({ messages }) => {
  return (
    <div className="bg-gray-900/50 border border-cyan-400/20 p-4 rounded-lg flex flex-col flex-grow min-h-0 h-full">
      <h2 className="text-lg font-bold text-cyan-400 mb-2 flex-shrink-0">Agent Comms Log</h2>
      <div className="text-xs overflow-y-auto flex-grow pr-2 space-y-2">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>No agent-to-agent messages yet...</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="bg-gray-800/60 p-2 rounded-md">
            <div className="flex justify-between items-center text-gray-500 mb-1">
                <span className="truncate w-2/5">FROM: {msg.from}</span>
                <span className="text-cyan-400">&rarr;</span>
                <span className="truncate w-2/5 text-right">TO: {msg.to}</span>
            </div>
            <p className="text-gray-200 whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommsLogPanel;
