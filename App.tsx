import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import StatusPanel from './components/StatusPanel';
import GraphPanel from './components/GraphPanel';
import SpawnPanel from './components/SpawnPanel';
import LogsPanel from './components/LogsPanel';
import ChatPanel from './components/ChatPanel';
import LandingPage from './components/LandingPage';
import LoadingScreen from './components/LoadingScreen';
import IntelPanel from './components/IntelPanel';
import CommsLogPanel from './components/CommsLogPanel';
import ForesightModal from './components/ForesightModal';
import AgentDetailModal from './components/AgentDetailModal';
import MobileNav, { MobileView } from './components/MobileNav';
import { KernelService, KernelState } from './services/kernelService';
import { Agent, AgentType } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'loading' | 'main'>('landing');
  const [mobileView, setMobileView] = useState<MobileView>('main');
  const [kernelState, setKernelState] = useState<KernelState>(KernelService.getInitialState());
  const [isForesightModalOpen, setIsForesightModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const kernelServiceRef = useRef<KernelService | null>(null);

  useEffect(() => {
    if (view === 'main' && !kernelServiceRef.current) {
      const kernel = new KernelService(
        (newState) => setKernelState(newState)
      );
      kernelServiceRef.current = kernel;
      kernel.initOnboarding();
    }
    return () => {
      kernelServiceRef.current?.stop();
    };
  }, [view]);

  const handleEnter = () => setView('loading');
  const handleLoadingComplete = () => setView('main');

  const handleInit = useCallback(() => kernelServiceRef.current?.init(), []);
  const handleStop = useCallback(() => kernelServiceRef.current?.stop(), []);
  const handleStep = useCallback(() => kernelServiceRef.current?.step(), []);
  const handleSaveState = useCallback(() => kernelServiceRef.current?.saveState(), []);
  const handleLoadState = useCallback(() => kernelServiceRef.current?.loadState(), []);
  const handleSpawn = useCallback((agentType: AgentType, role: string, config: string) => {
    kernelServiceRef.current?.proposeSpawnAgent(agentType, role, config);
  }, []);
  const handleSendMessage = useCallback((message: string) => {
    kernelServiceRef.current?.handleUserMessage(message);
  }, []);
  const handleGenerateForesight = useCallback(async () => {
    setIsForesightModalOpen(true);
    await kernelServiceRef.current?.generateForesight();
  }, []);

  const handleSelectAgent = useCallback((agentId: string) => {
      const agent = kernelState.agents.find(a => a.id === agentId);
      if (agent) {
          setSelectedAgent(agent);
      }
  }, [kernelState.agents]);

  if (view === 'landing') return <LandingPage onEnter={handleEnter} />;
  if (view === 'loading') return <LoadingScreen onComplete={handleLoadingComplete} />;

  const LeftColumn = () => (
    <div className="lg:col-span-3 flex flex-col gap-2 sm:gap-4 min-h-0 h-full">
      <SpawnPanel 
        onSpawn={handleSpawn} 
        isRunning={kernelState.isRunning}
        maxAgents={kernelState.policies.max_agents}
        currentAgents={kernelState.agents.length}
      />
      <LogsPanel logs={kernelState.logs} />
    </div>
  );

  const CenterColumn = () => (
    <div className="lg:col-span-6 flex flex-col gap-0 min-h-0 h-full">
      <StatusPanel 
        identity={kernelState.identity}
        agentCount={kernelState.agents.length}
        policies={kernelState.policies}
        averagePas={kernelState.averagePas}
        onGenerateForesight={handleGenerateForesight}
        isGeneratingForesight={kernelState.isGeneratingForesight}
      />
      <GraphPanel 
        graphData={kernelState.graphData} 
        communicationEvents={kernelState.communicationEvents}
        onNodeClick={handleSelectAgent}
      />
    </div>
  );
  
  const RightColumn = () => (
     <div className="lg:col-span-3 flex flex-col gap-2 sm:gap-4 min-h-0 h-full">
        <div className="h-3/5 flex flex-col min-h-0">
            <ChatPanel 
                messages={kernelState.messages}
                onSendMessage={handleSendMessage}
                isRunning={kernelState.isRunning}
                isThinking={kernelState.isThinking}
            />
        </div>
        <div className="h-2/5 flex flex-col min-h-0 gap-2 sm:gap-4">
           <CommsLogPanel messages={kernelState.agentCommunications} />
           <IntelPanel threats={kernelState.threats} />
        </div>
     </div>
  );

  const CommsAndIntelColumn = () => (
      <div className="h-full flex flex-col gap-4">
        <CommsLogPanel messages={kernelState.agentCommunications} />
        <IntelPanel threats={kernelState.threats} />
      </div>
  );


  return (
    <div className="h-screen bg-gray-900 text-gray-200 font-mono p-2 sm:p-4 flex flex-col gap-2 sm:gap-4">
      <div className="absolute inset-0 bg-grid-cyan-500/10 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)] -z-10"></div>
      <Header 
        onInit={handleInit} 
        onStop={handleStop} 
        onStep={handleStep} 
        isRunning={kernelState.isRunning}
        onSave={handleSaveState}
        onLoad={handleLoadState}
      />
      <MobileNav activeView={mobileView} setActiveView={setMobileView} />

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4 flex-grow min-h-0">
        {/* Desktop View */}
        <div className="hidden lg:col-span-3 lg:flex flex-col gap-2 sm:gap-4 min-h-0">
          <LeftColumn />
        </div>
        <div className="hidden lg:col-span-6 lg:flex flex-col gap-0 min-h-0">
          <CenterColumn />
        </div>
        <div className="hidden lg:col-span-3 lg:flex flex-col gap-2 sm:gap-4 min-h-0">
          <RightColumn />
        </div>

        {/* Mobile View */}
        <div className="lg:hidden col-span-1 min-h-0 h-full">
          {mobileView === 'main' && <div className="h-full flex flex-col gap-4"><CenterColumn /></div>}
          {mobileView === 'chat' && <div className="h-full"><ChatPanel messages={kernelState.messages} onSendMessage={handleSendMessage} isRunning={kernelState.isRunning} isThinking={kernelState.isThinking} /></div>}
          {mobileView === 'logs' && <LeftColumn />}
          {mobileView === 'comms' && <CommsAndIntelColumn />}
        </div>
      </main>
      
      <ForesightModal 
        isOpen={isForesightModalOpen}
        onClose={() => setIsForesightModalOpen(false)}
        isLoading={kernelState.isGeneratingForesight}
        videoUrl={kernelState.foresightVideoUrl}
        error={kernelState.foresightError}
      />
      <AgentDetailModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </div>
  );
};

export default App;
