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

  const cardCls = `rounded-[28px] border transition-all duration-300 ${
    isDark 
      ? 'bg-[#0E1720]/80 border-white/[0.08] text-white shadow-2xl shadow-black/40 backdrop-blur-2xl' 
      : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-2xl'
  }`;

  const inflowNodes = graphData.nodes.filter(n => n.type === 'INFLOW_SOURCE');
  const hubNode = graphData.nodes.find(n => n.type === 'CENTRAL_HUB');
  const outflowNodes = graphData.nodes.filter(n => n.type === 'OUTFLOW_DESTINATION');

  return (
    <div className="space-y-6 animate-emergence">
      <div className={`p-5 sm:p-6 ${cardCls} space-y-6`}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-black flex items-center gap-2 font-heading">
              <span>🕸️</span>
              <span>Interactive Money Flow Network (Ingress → Hub → Egress)</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Visualizing how ₹{graphData.totalInflow.toLocaleString('en-IN')} inflow courses through your liquid account to ₹{graphData.totalOutflow.toLocaleString('en-IN')} outflows.
            </p>
          </div>
          {selectedNode && (
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Reset Selection
            </button>
          )}
        </div>

        {/* 3-Column Visual Flow Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative">
          {/* Column 1: Inflow Sources */}
          <div className="space-y-3">
            <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center justify-between">
              <span>1. Inflow Sources</span>
              <span>₹{graphData.totalInflow.toLocaleString('en-IN')}</span>
            </div>
            {inflowNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : (isDark ? 'bg-[#142028] border-white/[0.08] hover:border-emerald-500/40' : 'bg-slate-50 border-slate-200 hover:border-emerald-400')
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{node.icon}</span>
                      <div>
                        <div className="text-xs font-bold">{node.name}</div>
                        <div className="text-[10px] text-slate-400">{node.percentageOfTotal.toFixed(1)}% of total inflow</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-xs text-emerald-400">
                      +₹{node.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  {/* Visual pipeline connector bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800/40 mt-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${Math.max(5, node.percentageOfTotal)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 2: Central Hub Node */}
          <div className="flex flex-col items-center justify-center p-4">
            <div className="w-full text-center space-y-4">
              <div className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                2. Liquid Processing Hub
              </div>
              {hubNode && (
                <div 
                  onClick={() => setSelectedNode(hubNode)}
                  className={`p-6 rounded-3xl border text-center cursor-pointer transition-all duration-300 relative ${
                    selectedNode?.id === hubNode.id
                      ? 'border-indigo-400 bg-indigo-950/40 shadow-2xl shadow-indigo-500/30 scale-105'
                      : (isDark ? 'bg-gradient-to-b from-[#182432] to-[#0E171E] border-indigo-500/30' : 'bg-gradient-to-b from-indigo-50 to-white border-indigo-200 shadow-md')
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 text-white flex items-center justify-center text-2xl mx-auto shadow-lg shadow-indigo-500/30">
                    🏛️
                  </div>
                  <h3 className="font-black text-sm font-heading mt-2">{hubNode.name}</h3>
                  <div className="text-lg font-black font-mono mt-1 text-slate-100">
                    ₹{hubNode.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Reconciled Single Source of Truth</div>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Outflow Destinations */}
          <div className="space-y-3">
            <div className="text-[10px] font-black uppercase text-rose-400 tracking-wider flex items-center justify-between">
              <span>3. Outflow Allocations</span>
              <span>₹{graphData.totalOutflow.toLocaleString('en-IN')}</span>
            </div>
            {outflowNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(isSelected ? null : node)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-rose-400 bg-rose-950/40 shadow-lg shadow-rose-500/20 scale-[1.02]'
                      : (isDark ? 'bg-[#142028] border-white/[0.08] hover:border-rose-500/40' : 'bg-slate-50 border-slate-200 hover:border-rose-400')
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{node.icon}</span>
                      <div>
                        <div className="text-xs font-bold">{node.name}</div>
                        <div className="text-[10px] text-slate-400">{node.percentageOfTotal.toFixed(1)}% of outflows</div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-xs text-rose-400">
                      -₹{node.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  {/* Visual pipeline connector bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800/40 mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${node.category === 'LIFESTYLE' ? 'bg-purple-500' : 'bg-rose-500'}`}
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
          <div className={`p-4 rounded-2xl border animate-fade-in ${
            selectedNode.type === 'INFLOW_SOURCE'
              ? (isDark ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
              : selectedNode.type === 'CENTRAL_HUB'
              ? (isDark ? 'bg-indigo-950/30 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200')
              : (isDark ? 'bg-rose-950/30 border-rose-500/30' : 'bg-rose-50 border-rose-200')
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedNode.icon}</span>
                <div>
                  <h4 className="text-xs font-black">{selectedNode.name}</h4>
                  <p className="text-[10px] opacity-80 font-mono">
                    Total Volume: ₹{selectedNode.amount.toLocaleString('en-IN')} ({selectedNode.percentageOfTotal.toFixed(1)}% share)
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black/20">
                {selectedNode.type.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
