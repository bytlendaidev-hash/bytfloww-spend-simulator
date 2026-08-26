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
    { id: 'OVERVIEW', label: 'Overview', icon: '⚡' },
    { id: 'TRANSACTIONS', label: 'Transactions', icon: '📋', badge: counts.transactions },
    { id: 'CATEGORIES', label: 'Categories', icon: '📁', badge: counts.categories },
    { id: 'MERCHANTS', label: 'Merchants', icon: '🏪', badge: counts.merchants },
    { id: 'COMMITMENTS', label: 'Commitments', icon: '💳', badge: counts.commitments },
    { id: 'TRENDS', label: 'Trends & Analytics', icon: '📈' },
    { id: 'BUDGETS', label: 'Budgets', icon: '🎯' },
    { id: 'SUBSCRIPTIONS', label: 'Subscriptions', icon: '🔄' },
    { id: 'ACCOUNTS', label: 'Accounts', icon: '🏦' },
    { id: 'ASSISTANT', label: 'AI Copilot', icon: '✨' },
  ];

  return (
    <div className="mb-6">
      <div className={`p-1.5 rounded-[22px] border flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
        isDark ? 'bg-abyss-card border-abyss-border shadow-solid-sm' : 'bg-white border-alabaster-border shadow-solid-sm'
      }`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                isActive
                  ? 'spatial-btn-selected font-black shadow-solid-sm'
                  : isDark
                  ? 'text-abyss-textSecondary hover:text-abyss-textPrimary hover:bg-abyss-well'
                  : 'text-alabaster-textSecondary hover:text-alabaster-textPrimary hover:bg-alabaster-well'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive 
                    ? 'bg-black/20 text-black' 
                    : isDark 
                    ? 'bg-abyss-well text-abyss-textSecondary' 
                    : 'bg-alabaster-well text-alabaster-textSecondary'
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
