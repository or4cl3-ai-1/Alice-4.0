
import React, { useEffect, useRef } from 'react';

interface LogsPanelProps {
  logs: string[];
}

const LogsPanel: React.FC<LogsPanelProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  const formatLog = (log: string) => {
    let colorClass = 'text-gray-400';
    if (log.includes('[SPAWNED]') || log.includes('[VOTE] PASSED')) colorClass = 'text-green-400';
    else if (log.includes('[VOTE] FAILED')) colorClass = 'text-red-400';
    else if (log.includes('[EVOLVED]')) colorClass = 'text-yellow-400';
    else if (log.includes('[PROPOSAL]')) colorClass = 'text-purple-400';
    else if (log.includes('[ERROR]')) colorClass = 'text-red-500 font-bold';
    return <p className={`whitespace-pre-wrap ${colorClass}`}>{log}</p>;
  };

  return (
    <div className="bg-gray-900/50 border border-cyan-400/20 p-4 rounded-lg flex flex-col flex-grow min-h-0">
      <h2 className="text-lg font-bold text-cyan-400 mb-2 flex-shrink-0">Logs</h2>
      <div ref={logContainerRef} className="text-xs overflow-y-auto flex-grow pr-2">
        {logs.map((log, index) => (
          <div key={index}>{formatLog(log)}</div>
        ))}
      </div>
    </div>
  );
};

export default LogsPanel;
