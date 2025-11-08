import React from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-200 font-mono overflow-hidden">
      <div className="absolute inset-0 bg-grid-cyan-500/10 [mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)]"></div>
       <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#38bdf822,transparent)]"></div>

      <div className="text-center z-10 p-4">
        <h1 className="text-3xl md:text-5xl font-bold text-cyan-400 animate-pulse">A.L.I.C.E. 4.0</h1>
        <p className="text-lg md:text-2xl text-pink-500 mt-2">Σ-Ω KERNEL</p>
        <p className="max-w-2xl mx-auto mt-6 text-sm md:text-base text-gray-400">
          You are about to interface with a real-time, interactive multi-agent superintelligence prototype.
          A living digital collective where agents propose, vote, spawn, and evolve.
        </p>
        <button
          onClick={onEnter}
          className="mt-10 px-8 py-3 border-2 border-green-500 text-green-500 rounded-md text-lg font-bold
                     transition-all duration-300 hover:bg-green-500 hover:text-gray-900 hover:shadow-2xl hover:shadow-green-500/50
                     focus:outline-none focus:ring-4 focus:ring-green-500/50"
        >
          INITIATE CONTACT
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
