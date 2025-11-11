import React from 'react';

export type MobileView = 'main' | 'chat' | 'logs' | 'comms';

interface MobileNavProps {
  activeView: MobileView;
  setActiveView: (view: MobileView) => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 text-sm font-bold transition-all duration-200 border-b-2 ${
      isActive
        ? 'text-cyan-400 border-cyan-400'
        : 'text-gray-500 border-transparent hover:text-cyan-500'
    }`}
  >
    {label}
  </button>
);

const MobileNav: React.FC<MobileNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="lg:hidden flex bg-gray-900/50 border border-cyan-400/20 rounded-lg">
      <NavButton label="Main" isActive={activeView === 'main'} onClick={() => setActiveView('main')} />
      <NavButton label="Chat" isActive={activeView === 'chat'} onClick={() => setActiveView('chat')} />
      <NavButton label="Logs" isActive={activeView === 'logs'} onClick={() => setActiveView('logs')} />
      <NavButton label="Comms" isActive={activeView === 'comms'} onClick={() => setActiveView('comms')} />
    </nav>
  );
};

export default MobileNav;
