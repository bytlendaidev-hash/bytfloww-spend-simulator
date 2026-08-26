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
            <h2 className="text-base font-bold flex items-center gap-2 text-abyss-textPrimary">
              <span>🕸️</span>
              <span>Interactive Money Flow Network (Ingress → Hub → Egress)</span>
            </h2>
            <p className="text-xs text-abyss-textMuted mt-0.5">
              Visualizing how ₹{graphData.totalInflow.toLocaleString('en-IN')} inflow courses through your liquid account to ₹{graphData.totalOutflow.toLocaleString('en-IN')} outflows.
            </p>
          </div>
          {selectedNode && (
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-abyss-textMuted hover:text-abyss-textPrimary underline transition"
            >
              Reset Selection
            </button>
          )}
        </div>

        {/* 3-Column Visual Flow Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative">
          {/* Column 1: Inflow Sources (Solid Sovereign Jade) */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase text-jade-500 tracking-wider flex items-center justify-between">
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
                      ? 'border-jade-500 bg-jade-500/20 shadow-solid-sm scale-[1.02]'
                      : 'bg-abyss-well border-abyss-border hover:bg-abyss-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{node.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-abyss-textPrimary">{node.name}</div>
                        <div className="text-[10px] text-abyss-textMuted">{node.percentageOfTotal.toFixed(1)}% of total inflow</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-xs text-jade-500">
                      +₹{node.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  {/* Visual pipeline connector bar */}
                  <div className="w-full h-1.5 rounded-full bg-abyss-canvas mt-2.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-jade-500"
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
              <div className="text-[10px] font-bold uppercase text-abyss-textMuted tracking-wider">
                2. Liquid Processing Hub
              </div>
              {hubNode && (
                <div 
                  onClick={() => setSelectedNode(hubNode)}
                  className={`p-6 rounded-[20px] border text-center cursor-pointer transition-all duration-200 relative ${
                    selectedNode?.id === hubNode.id
                      ? 'border-jade-500 bg-abyss-elevated shadow-solid-md scale-105'
                      : 'bg-abyss-well border-abyss-border hover:border-jade-500/40 hover:scale-[1.02]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-jade-500/20 border border-jade-500/40 text-jade-500 flex items-center justify-center text-2xl mx-auto">
                    🏛️
                  </div>
                  <h3 className="font-bold text-sm text-abyss-textPrimary mt-2.5">{hubNode.name}</h3>
                  <div className="text-lg font-bold font-mono mt-1 text-abyss-textPrimary">
                    ₹{hubNode.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-abyss-textMuted mt-1">Reconciled Single Source of Truth</div>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Outflow Destinations (Solid Crimson Pulse) */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold uppercase text-pulse-500 tracking-wider flex items-center justify-between">
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
                      ? 'border-pulse-500 bg-pulse-500/20 shadow-solid-sm scale-[1.02]'
                      : 'bg-abyss-well border-abyss-border hover:bg-abyss-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{node.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-abyss-textPrimary">{node.name}</div>
                        <div className="text-[10px] text-abyss-textMuted">{node.percentageOfTotal.toFixed(1)}% of outflows</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-xs text-pulse-500">
                      -₹{node.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  {/* Visual pipeline connector bar */}
                  <div className="w-full h-1.5 rounded-full bg-abyss-canvas mt-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${node.category === 'LIFESTYLE' ? 'bg-synapse-500' : 'bg-pulse-500'}`}
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
              ? 'bg-jade-500/15 border-jade-500/30 text-abyss-textPrimary'
              : selectedNode.type === 'CENTRAL_HUB'
              ? 'bg-abyss-well border-abyss-border text-abyss-textPrimary'
              : 'bg-pulse-500/15 border-pulse-500/30 text-abyss-textPrimary'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{selectedNode.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-abyss-textPrimary">{selectedNode.name}</h4>
                  <p className="text-[10px] text-abyss-textMuted font-mono">
                    Total Volume: ₹{selectedNode.amount.toLocaleString('en-IN')} ({selectedNode.percentageOfTotal.toFixed(1)}% share)
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-abyss-canvas border border-abyss-border text-abyss-textSecondary">
                {selectedNode.type.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
