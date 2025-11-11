import React from 'react';

interface HeaderProps {
  onInit: () => void;
  onStop: () => void;
  onStep: () => void;
  isRunning: boolean;
  onSave: () => void;
  onLoad: () => void;
}

const ControlButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode; className?: string }> = ({ onClick, disabled, children, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 border-2 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const Header: React.FC<HeaderProps> = ({ onInit, onStop, onStep, isRunning, onSave, onLoad }) => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border border-cyan-400/20 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-center sm:text-left">
        <h1 className="text-xl lg:text-2xl font-bold text-cyan-400">A.L.I.C.E. 4.0 — Σ-Ω Kernel</h1>
        <p className="text-xs text-pink-500">Autonomous R&D Division | Multi-Agent Superintelligence Prototype</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <ControlButton onClick={onSave} className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-gray-900">
          Save
        </ControlButton>
        <ControlButton onClick={onLoad} disabled={isRunning} className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-gray-900">
          Load
        </ControlButton>
        <div className="w-px h-8 bg-cyan-400/20"></div>
        <ControlButton onClick={onInit} disabled={isRunning} className="border-green-500 text-green-500 hover:bg-green-500 hover:text-gray-900">
          Init
        </ControlButton>
        <ControlButton onClick={onStop} disabled={!isRunning} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-gray-900">
          Stop
        </ControlButton>
        <ControlButton onClick={onStep} disabled={!isRunning} className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-900">
          Step
        </ControlButton>
      </div>
    </header>
  );
};

export default Header;