import React from 'react';
import { SpendTab } from '../types';

interface NavigationTabsProps {
  activeTab: SpendTab;
  onSelectTab: (tab: SpendTab) => void;
  isDark: boolean;
  counts: {
    transactions: number;
    categories: number;
    merchants: number;
    commitments: number;
  };
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  isDark,
  counts,
}) => {
  const tabs: Array<{ id: SpendTab; label: string; icon: string; badge?: number }> = [
    { id: 'OVERVIEW', label: 'Overview', icon: '📊' },
    { id: 'TRANSACTIONS', label: 'Transactions', icon: '💳', badge: counts.transactions },
    { id: 'CATEGORIES', label: 'Categories', icon: '📁', badge: counts.categories },
    { id: 'MERCHANTS', label: 'Merchants', icon: '🏪', badge: counts.merchants },
    { id: 'COMMITMENTS', label: 'Commitments', icon: '📅', badge: counts.commitments },
    { id: 'TRENDS', label: 'Trends & Analytics', icon: '📈' },
    { id: 'BUDGETS', label: 'Budgets', icon: '🎯' },
    { id: 'SUBSCRIPTIONS', label: 'Subscriptions', icon: '🔄' },
    { id: 'ACCOUNTS', label: 'Accounts', icon: '🏦' },
    { id: 'ASSISTANT', label: 'AI Copilot', icon: '✨' },
  ];

  return (
    <div className="mb-6">
      <div className={`p-1.5 rounded-[22px] border flex items-center gap-1.5 overflow-x-auto no-scrollbar backdrop-blur-xl ${
        isDark ? 'bg-[#0A171D]/90 border-cyan-500/15 shadow-md shadow-cyan-950/20' : 'bg-slate-100 border-slate-200'
      }`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[#00F2FE] via-[#4FACFE] to-[#9B51E0] text-black font-extrabold shadow-[0_0_20px_rgba(0,242,254,0.4)] scale-[1.02]'
                  : isDark
                  ? 'text-[#8A9EA8] hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? 'bg-black/30 text-black' : 'bg-white/10 text-slate-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
