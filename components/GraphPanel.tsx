import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { GraphData, CommunicationEvent } from '../types';
import { Options } from 'vis-network';
import * as d3 from 'd3';

interface GraphPanelProps {
  graphData: GraphData;
  communicationEvents: CommunicationEvent[];
  onNodeClick: (agentId: string) => void;
}

const GraphPanel: React.FC<GraphPanelProps> = ({ graphData, communicationEvents, onNodeClick }) => {
  const visJsRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const animationLayerRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (visJsRef.current) {
      const options: Options = {
        autoResize: true,
        height: '100%',
        width: '100%',
        layout: {
            hierarchical: { enabled: true, levelSeparation: 150, nodeSpacing: 120, treeSpacing: 200, direction: 'UD', sortMethod: 'directed' },
        },
        physics: { enabled: false },
        nodes: {
            shape: 'dot',
            size: 20,
            font: { size: 12, color: '#e5e7eb', face: 'monospace', align: 'bottom' },
            borderWidth: 2,
            shapeProperties: { useImageSize: true },
            color: { background: '#111827', border: '#06b6d4', highlight: { background: '#06b6d4', border: '#67e8f9' } },
        },
        edges: {
            width: 1,
            color: { color: '#ec4899', highlight: '#f9a8d4', opacity: 0.6 },
            arrows: { to: { enabled: true, scaleFactor: 0.5 } },
            smooth: { type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.4 },
        },
        groups: {
            Researcher: { color: { border: '#22d3ee' } },
            Engineer: { color: { border: '#34d399' } },
            Analyst: { color: { border: '#facc15' } },
            Strategist: { color: { border: '#a78bfa' } },
            Ethicist: { color: { border: '#fb7185' } },
        },
        interaction: { dragNodes: true, dragView: true, zoomView: true, tooltipDelay: 200, hover: true },
      };

      const network = new Network(visJsRef.current, graphData, options);
      networkRef.current = network;

      network.on('afterDrawing', (ctx) => {
          if (!animationLayerRef.current) {
              const canvas = visJsRef.current?.getElementsByTagName('canvas')[0];
              if (canvas) {
                  const svg = d3.create('svg')
                      .style('position', 'absolute')
                      .style('top', '0')
                      .style('left', '0')
                      .style('width', '100%')
                      .style('height', '100%')
                      .style('pointer-events', 'none');
                  canvas.parentElement?.appendChild(svg.node()!);
                  animationLayerRef.current = svg.node();
              }
          }
      });
      
      network.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0] as string;
          onNodeClick(nodeId);
        }
      });

      return () => {
        network.destroy();
        networkRef.current = null;
        if (animationLayerRef.current) {
            animationLayerRef.current.remove();
            animationLayerRef.current = null;
        }
      };
    }
  }, [onNodeClick]);

  useEffect(() => {
    if (networkRef.current) {
      networkRef.current.setData(graphData);
    }
  }, [graphData]);

  useEffect(() => {
    const event = communicationEvents[0];
    if (!event || !networkRef.current || !animationLayerRef.current) return;

    const fromNodePos = networkRef.current.getPositions([event.from])[event.from];
    const toNodePos = networkRef.current.getPositions([event.to])[event.to];
    const svg = d3.select(animationLayerRef.current);

    if (fromNodePos && toNodePos) {
      const particle = svg.append("circle")
        .attr("cx", fromNodePos.x)
        .attr("cy", fromNodePos.y)
        .attr("r", 4)
        .style("fill", "#f9a8d4");

      particle.transition()
        .duration(1500)
        .attr("cx", toNodePos.x)
        .attr("cy", toNodePos.y)
        .on("end", () => particle.remove());
    }
  }, [communicationEvents]);

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
