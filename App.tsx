
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import StatusPanel from './components/StatusPanel';
import GraphPanel from './components/GraphPanel';
import SpawnPanel from './components/SpawnPanel';
import LogsPanel from './components/LogsPanel';
import ChatPanel from './components/ChatPanel';
import LandingPage from './components/LandingPage';
import LoadingScreen from './components/LoadingScreen';
import { KernelService, KernelState } from './services/kernelService';
import { AgentType } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'loading' | 'main'>('landing');
  const [kernelState, setKernelState] = useState<KernelState>(KernelService.getInitialState());
  const kernelServiceRef = useRef<KernelService | null>(null);

  useEffect(() => {
    if (view === 'main' && !kernelServiceRef.current) {
      const kernel = new KernelService(
        (newState) => setKernelState(newState)
      );
      kernelServiceRef.current = kernel;
    }
    return () => {
      kernelServiceRef.current?.stop();
    };
  }, [view]);

  const handleEnter = () => setView('loading');
  const handleLoadingComplete = () => setView('main');

  const handleInit = useCallback(() => {
    kernelServiceRef.current?.init();
  }, []);

  const handleStop = useCallback(() => {
    kernelServiceRef.current?.stop();
  }, []);

  const handleStep = useCallback(() => {
    kernelServiceRef.current?.step();
  }, []);

  const handleSpawn = useCallback((agentType: AgentType, role: string, config: string) => {
    kernelServiceRef.current?.proposeSpawnAgent(agentType, role, config);
  }, []);
  
  const handleSendMessage = useCallback((message: string) => {
    kernelServiceRef.current?.handleUserMessage(message);
  }, []);

  if (view === 'landing') {
    return <LandingPage onEnter={handleEnter} />;
  }

  if (view === 'loading') {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="h-screen bg-gray-900 text-gray-200 font-mono p-2 sm:p-4 flex flex-col gap-2 sm:gap-4">
      <div className="absolute inset-0 bg-grid-cyan-500/10 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)] -z-10"></div>
      <Header onInit={handleInit} onStop={handleStop} onStep={handleStep} isRunning={kernelState.isRunning} />

      <main className="grid grid-cols-1 lg:grid-cols-10 gap-2 sm:gap-4 flex-grow min-h-0">
        
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-2 sm:gap-4 min-h-0">
          <SpawnPanel 
            onSpawn={handleSpawn} 
            isRunning={kernelState.isRunning}
            maxAgents={kernelState.policies.max_agents}
            currentAgents={kernelState.agents.length}
          />
          <LogsPanel logs={kernelState.logs} />
        </div>

        {/* Center Column */}
        <div className="lg:col-span-5 flex flex-col gap-0 min-h-0">
          <StatusPanel 
            identity={kernelState.identity}
            agentCount={kernelState.agents.length}
            policies={kernelState.policies}
          />
          <GraphPanel graphData={kernelState.graphData} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <ChatPanel 
            messages={kernelState.messages}
            onSendMessage={handleSendMessage}
            isRunning={kernelState.isRunning}
            isThinking={kernelState.isThinking}
            maxAgents={kernelState.policies.max_agents}
            currentAgents={kernelState.agents.length}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
