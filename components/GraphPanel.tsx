import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { GraphData } from '../types';
import { Options } from 'vis-network';

interface GraphPanelProps {
  graphData: GraphData;
}

const GraphPanel: React.FC<GraphPanelProps> = ({ graphData }) => {
  const visJsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let network: Network | null = null;
    if (visJsRef.current && graphData.nodes.length > 0) {
      const options: Options = {
        autoResize: true,
        height: '100%',
        width: '100%',
        layout: {
          hierarchical: {
            enabled: true,
            levelSeparation: 150,
            nodeSpacing: 120,
            treeSpacing: 200,
            direction: 'UD',
            sortMethod: 'directed',
          },
        },
        physics: {
          enabled: false,
        },
        nodes: {
          shape: 'dot',
          size: 10,
          font: {
            size: 12,
            color: '#e5e7eb', // gray-200
            face: 'monospace',
          },
          borderWidth: 2,
          color: {
            background: '#111827', // gray-900
            border: '#06b6d4', // cyan-500
            highlight: {
              background: '#06b6d4',
              border: '#67e8f9',
            },
          },
          scaling: {
            label: {
              enabled: true,
            },
          },
        },
        edges: {
          width: 1,
          color: {
            color: '#ec4899', // pink-500
            highlight: '#f9a8d4',
            opacity: 0.6,
          },
          arrows: {
            to: { enabled: true, scaleFactor: 0.5 },
          },
          smooth: {
            type: 'cubicBezier',
            forceDirection: 'vertical',
            roundness: 0.4,
          },
        },
        groups: {
            Researcher: { color: { border: '#22d3ee' } }, // cyan-400
            Engineer: { color: { border: '#34d399' } }, // emerald-400
            Analyst: { color: { border: '#facc15' } }, // yellow-400
            Strategist: { color: { border: '#a78bfa' } }, // violet-400
            Ethicist: { color: { border: '#fb7185' } }, // rose-400
        },
        interaction: {
          dragNodes: true,
          dragView: true,
          zoomView: true,
          tooltipDelay: 200,
          hover: true,
        },
      };

      network = new Network(visJsRef.current, graphData, options);
    }
    return () => {
      network?.destroy();
    };
  }, [graphData]);

  return (
    <div className="bg-gray-900/50 border border-cyan-400/20 rounded-b-lg flex-grow relative -mt-px">
      {graphData.nodes.length === 0 && (
         <div className="absolute inset-0 flex items-center justify-center text-gray-500">
             <p>Awaiting Kernel Initialization...</p>
         </div>
      )}
      <div ref={visJsRef} className="w-full h-full" />
    </div>
  );
};

export default GraphPanel;