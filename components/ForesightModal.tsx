import React from 'react';

interface ForesightModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  videoUrl: string | null;
  error: string | null;
}

const loadingMessages = [
    "Analyzing agent trajectories...",
    "Extrapolating potential futures...",
    "Engaging Veo foresight model...",
    "Rendering quantum possibilities...",
    "Collapsing waveforms into video...",
    "Decoding temporal stream...",
];

const ForesightModal: React.FC<ForesightModalProps> = ({ isOpen, onClose, isLoading, videoUrl, error }) => {
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-cyan-400/30 rounded-lg shadow-2xl shadow-cyan-500/20 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-cyan-400/20 flex justify-between items-center">
          <h2 className="text-xl font-bold text-cyan-400">Simulation Foresight</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">&times;</button>
        </div>
        <div className="p-6">
          {isLoading && (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-dashed border-pink-500 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-lg text-cyan-400">{loadingMessages[messageIndex]}</p>
              <p className="text-sm text-gray-500 mt-2">(This may take a few minutes)</p>
            </div>
          )}
          {error && (
            <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-md">
              <h3 className="font-bold">Foresight Generation Failed</h3>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {videoUrl && (
            <div>
              <video src={videoUrl} controls autoPlay loop className="w-full rounded-md" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForesightModal;
