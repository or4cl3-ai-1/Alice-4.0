import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const loadingSteps = [
  { text: 'Booting Σ-Ω Kernel...', duration: 1500 },
  { text: 'Calibrating ethical sub-agents...', duration: 1500 },
  { text: 'Establishing quantum link...', duration: 1800 },
  { text: 'A.L.I.C.E. is online.', duration: 1000 },
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < loadingSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, loadingSteps[currentStep].duration);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [currentStep, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-cyan-400 font-mono">
      <div className="w-full max-w-md p-4">
        {loadingSteps.map((step, index) => (
          <div key={index} className={`flex items-center transition-opacity duration-500 ${index <= currentStep ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-green-500 mr-2">{'>'}</span>
            <p className="text-lg">{step.text}</p>
            {index === currentStep && <span className="ml-2 w-2 h-5 bg-cyan-400 animate-pulse"></span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
