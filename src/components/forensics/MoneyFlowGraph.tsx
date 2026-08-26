import React, { useState, useMemo } from 'react';
import { ForensicDataset } from '../../engine/statementForensicsData';
import { buildMoneyFlowGraph, MoneyFlowNode } from '../../engine/forensicsAdvancedEngine';

interface MoneyFlowGraphProps {
  dataset: ForensicDataset;
  isDark: boolean;
}

export const MoneyFlowGraph: React.FC<MoneyFlowGraphProps> = ({ dataset, isDark }) => {
  const [selectedNode, setSelectedNode] = useState<MoneyFlowNode | null>(null);

  const graphData = useMemo(() => {
    return buildMoneyFlowGraph(dataset);
  }, [dataset]);

  const inflowNodes = graphData.nodes.filter(n => n.type === 'INFLOW_SOURCE');
  const hubNode = graphData.nodes.find(n => n.type === 'CENTRAL_HUB');
  const outflowNodes = graphData.nodes.filter(n => n.type === 'OUTFLOW_DESTINATION');

  return (
    <div className="space-y-6 animate-emergence">
      <div className="spatial-card p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2 text-white">
              <span>🕸️</span>
              <span>Interactive Money Flow Network (Ingress → Hub → Egress)</span>
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Visualizing how ₹{graphData.totalInflow.toLocaleString('en-IN')} inflow courses through your liquid account to ₹{graphData.totalOutflow.toLocaleString('en-IN')} outflows.
            </p>
          </div>
          {selectedNode && (
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-white/60 hover:text-white underline transition"
            >
              Reset Selection
            </button>
          )}
        </div>

        {/* 3-Column Visual Flow Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative">
          {/* Column 1: Inflow Sources */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase text-[#30D158] tracking-wider flex items-center justify-between">
              <span>1. Inflow Sources</span>
              <span>₹{graphData.totalInflow.toLocaleString('en-IN')}</span>
            </div>
            {inflowNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  className={`p-4 rounded-[16px] border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-[#30D158] bg-[#30D158]/20 shadow-lg shadow-[#30D158]/20 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{node.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{node.name}</div>
                        <div className="text-[10px] text-white/40">{node.percentageOfTotal.toFixed(1)}% of total inflow</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-xs text-[#30D158]">
                      +₹{node.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  {/* Visual pipeline connector bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 mt-2.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#30D158] to-teal-400"
                      style={{ width: `${Math.max(5, node.percentageOfTotal)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 2: Central Hub Node */}
          <div className="flex flex-col items-center justify-center p-2">
            <div className="w-full text-center space-y-3">
              <div className="text-[10px] font-bold uppercase text-white/50 tracking-wider">
                2. Liquid Processing Hub
              </div>
              {hubNode && (
                <div 
                  onClick={() => setSelectedNode(hubNode)}
                  className={`p-6 rounded-[20px] border text-center cursor-pointer transition-all duration-300 relative ${
                    selectedNode?.id === hubNode.id
                      ? 'border-white bg-white/20 shadow-2xl scale-105'
                      : 'bg-white/10 border-white/20 hover:border-white/30 hover:scale-[1.02]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center text-2xl mx-auto">
                    🏛️
                  </div>
                  <h3 className="font-bold text-sm text-white mt-2.5">{hubNode.name}</h3>
                  <div className="text-lg font-bold font-mono mt-1 text-white">
                    ₹{hubNode.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-white/40 mt-1">Reconciled Single Source of Truth</div>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Outflow Destinations */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase text-[#FF453A] tracking-wider flex items-center justify-between">
              <span>3. Outflow Allocations</span>
              <span>₹{graphData.totalOutflow.toLocaleString('en-IN')}</span>
            </div>
            {outflowNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  className={`p-4 rounded-[16px] border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-[#FF453A] bg-[#FF453A]/20 shadow-lg shadow-[#FF453A]/20 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{node.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{node.name}</div>
                        <div className="text-[10px] text-white/40">{node.percentageOfTotal.toFixed(1)}% of outflows</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-xs text-[#FF453A]">
                      -₹{node.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  {/* Visual pipeline connector bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 mt-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${node.category === 'LIFESTYLE' ? 'bg-[#AF52DE]' : 'bg-[#FF453A]'}`}
                      style={{ width: `${Math.max(5, node.percentageOfTotal)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Detail Spotlight Drawer */}
        {selectedNode && (
          <div className={`p-4 rounded-[16px] border animate-fade-in ${
            selectedNode.type === 'INFLOW_SOURCE'
              ? 'bg-[#30D158]/15 border-[#30D158]/30 text-white'
              : selectedNode.type === 'CENTRAL_HUB'
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-[#FF453A]/15 border-[#FF453A]/30 text-white'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{selectedNode.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-white">{selectedNode.name}</h4>
                  <p className="text-[10px] text-white/60 font-mono">
                    Total Volume: ₹{selectedNode.amount.toLocaleString('en-IN')} ({selectedNode.percentageOfTotal.toFixed(1)}% share)
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/80">
                {selectedNode.type.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
