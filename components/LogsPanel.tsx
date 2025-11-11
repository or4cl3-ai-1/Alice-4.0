import React, { useEffect, useRef } from 'react';
import { Log, LogType } from '../types';
import { playText } from '../services/ttsService';

interface LogsPanelProps {
  logs: Log[];
}

const getLogColor = (type: LogType): string => {
    switch(type) {
        case LogType.Success: return 'text-green-400';
        case LogType.Warning: return 'text-yellow-400';
        case LogType.Error: return 'text-red-500 font-bold';
        case LogType.Proposal: return 'text-purple-400';
        case LogType.Spawn: return 'text-green-400';
        case LogType.Intel: return 'text-blue-400';
        case LogType.Comm: return 'text-cyan-400';
        default: return 'text-gray-400';
    }
}

const SpeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 3.167a1.667 1.667 0 00-1.667 1.666v8.334a1.667 1.667 0 103.334 0V4.833A1.667 1.667 0 0010 3.167z" />
        <path fillRule="evenodd" d="M15.833 8.333a5.833 5.833 0 11-11.666 0 5.833 5.833 0 0111.666 0zM10 16.667a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" clipRule="evenodd" />
    </svg>
);


const LogsPanel: React.FC<LogsPanelProps> = ({ logs }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  const handlePlay = (e: React.MouseEvent, log: Log) => {
      e.stopPropagation();
      const cleanMessage = log.message.replace(/\[.*?\]\s*/, '');
      playText(cleanMessage);
  }

  return (
    <div className="bg-gray-900/50 border border-cyan-400/20 p-4 rounded-lg flex flex-col flex-grow min-h-0 h-full">
      <h2 className="text-lg font-bold text-cyan-400 mb-2 flex-shrink-0">Logs</h2>
      <div ref={logContainerRef} className="text-xs overflow-y-auto flex-grow pr-2">
        {logs.map((log) => (
          <div key={log.id} className={`whitespace-pre-wrap ${getLogColor(log.type)} flex items-center`}>
              <span>{log.message}</span>
              {log.isAudible && (
                  <button onClick={(e) => handlePlay(e, log)} className="text-pink-400 hover:text-pink-300 transition-colors">
                      <SpeakerIcon />
                  </button>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogsPanel;
