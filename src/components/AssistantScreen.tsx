import React, { useState } from 'react';
import { FinancialEvent, SpendSnapshot } from '../types';

interface AssistantScreenProps {
  snapshot: SpendSnapshot;
  events: FinancialEvent[];
  isDark: boolean;
  onSelectEvent: (event: FinancialEvent) => void;
}

interface Message {
  sender: 'USER' | 'COPILOT';
  text: string;
  timestamp: string;
  data?: any;
}

export const AssistantScreen: React.FC<AssistantScreenProps> = ({
  snapshot,
  events,
  isDark,
  onSelectEvent,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'COPILOT',
      text: `Hello! I am your BytFloww AI Spend Copilot. I have indexed all **${events.length.toLocaleString('en-IN')} real transactions** from your SMS dataset. Ask me anything about your spend habits, specific payees, loan commitments, or accounts!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleQuery = (query: string) => {
    if (!query.trim()) return;

    const userMsg: Message = {
      sender: 'USER',
      text: query,
      timestamp: 'Just now',
    };

    const q = query.toLowerCase();
    let responseText = '';
    let responseData: any = null;

    if (q.includes('swiggy') || q.includes('zomato') || q.includes('food')) {
      const foodTxns = events.filter(e => e.category === 'Food & Drinks' || e.merchant.toLowerCase().includes('swiggy') || e.merchant.toLowerCase().includes('zomato'));
      const sum = foodTxns.reduce((s, e) => s + e.amount, 0);
      responseText = `You have spent **₹${Math.round(sum).toLocaleString('en-IN')}** on Food & Dining across **${foodTxns.length} transactions**. Your top food merchant is **${foodTxns[0]?.merchant || 'Swiggy'}**.`;
      responseData = foodTxns.slice(0, 6);
    } else if (q.includes('top') || q.includes('biggest') || q.includes('highest') || q.includes('max')) {
      const sorted = [...events].filter(e => e.direction === 'OUTFLOW').sort((a, b) => b.amount - a.amount);
      const top5 = sorted.slice(0, 5);
      responseText = `Here are your **Top 5 biggest single expenses** from your SMS feed:`;
      responseData = top5;
    } else if (q.includes('loan') || q.includes('emi') || q.includes('mpokket') || q.includes('commitment')) {
      responseText = `Your total active loan/EMI commitment is **₹${Math.round(snapshot.totalEmis).toLocaleString('en-IN')}/month** across **${snapshot.commitments.length} detected obligations** (including mPokket QuickPay and auto-debit mandates).`;
    } else if (q.includes('hdfc') || q.includes('bank') || q.includes('account')) {
      const hdfcTxns = events.filter(e => e.resolvedInstitution.includes('HDFC') || e.sender.includes('HDFC'));
      const hdfcSpend = hdfcTxns.filter(e => e.direction === 'OUTFLOW').reduce((s, e) => s + e.amount, 0);
      responseText = `On your **HDFC Bank Account (*9082)**, you have **${hdfcTxns.length} transactions** totaling **₹${Math.round(hdfcSpend).toLocaleString('en-IN')}** in debits.`;
    } else if (q.includes('cashflow') || q.includes('net') || q.includes('income') || q.includes('saved')) {
      responseText = `For the selected period (**${snapshot.periodLabel}**):\n• Total Inflow (Income): **₹${Math.round(snapshot.totalIncome).toLocaleString('en-IN')}**\n• Total Outflow (Spend): **₹${Math.round(snapshot.totalSpend).toLocaleString('en-IN')}**\n• Net Cashflow: **₹${Math.round(snapshot.netCashflow).toLocaleString('en-IN')}**`;
    } else {
      const matches = events.filter(e => e.merchant.toLowerCase().includes(q) || e.notes.toLowerCase().includes(q));
      if (matches.length > 0) {
        const sum = matches.reduce((s, e) => s + (e.direction === 'OUTFLOW' ? e.amount : 0), 0);
        responseText = `Found **${matches.length} matching transactions** for "${query}" totaling **₹${Math.round(sum).toLocaleString('en-IN')}**.`;
        responseData = matches.slice(0, 6);
      } else {
        responseText = `I analyzed your SMS transactions for "${query}". No direct matches found. Try asking about a specific merchant (e.g. Swiggy, Trends, mPokket) or category (Food, Travel, EMIs).`;
      }
    }

    const aiMsg: Message = {
      sender: 'COPILOT',
      text: responseText,
      timestamp: 'Just now',
      data: responseData,
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputText('');
  };

  const samplePrompts = [
    'How much did I spend on food?',
    'Show top 5 biggest expenses',
    'What are my total loan commitments?',
    'Show HDFC Bank transactions',
    'What is my net cashflow?',
  ];

  return (
    <div className={`p-6 sm:p-8 rounded-[32px] border flex flex-col h-[75vh] transition-all duration-300 backdrop-blur-2xl animate-emergence ${
      isDark ? 'bg-[#0E1720]/80 border-white/[0.08] shadow-2xl shadow-black/60' : 'bg-white/85 border-slate-200/90 shadow-sm'
    }`}>
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-4 sm:p-5 rounded-[24px] max-w-[85%] sm:max-w-[70%] text-xs sm:text-sm leading-relaxed transition backdrop-blur-xl ${
                m.sender === 'USER'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-tr-none shadow-md shadow-indigo-500/25'
                  : isDark
                  ? 'bg-white/[0.04] text-white border border-white/[0.08] rounded-tl-none shadow-sm'
                  : 'bg-white text-slate-900 border border-slate-200/80 shadow-sm rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Attached Event Cards Grid */}
              {m.data && Array.isArray(m.data) && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-white/10 dark:border-white/10 border-slate-200">
                  {m.data.map((ev: FinancialEvent) => (
                    <div
                      key={ev.id}
                      onClick={() => onSelectEvent(ev)}
                      className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between transition text-xs border backdrop-blur-md ${
                        isDark 
                          ? 'bg-[#0E1720]/90 border-white/[0.06] hover:border-emerald-400/40 hover:bg-white/[0.06]' 
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-500 shadow-sm'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className={`font-black font-heading truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{ev.merchant}</div>
                        <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{ev.dateFormatted}</div>
                      </div>
                      <div className="font-black font-mono text-rose-500 dark:text-rose-400 flex-shrink-0">
                        ₹{ev.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className={`text-[10px] mt-1 px-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{m.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2.5 text-xs">
        {samplePrompts.map((p) => (
          <button
            key={p}
            onClick={() => handleQuery(p)}
            className={`px-3.5 py-1.5 rounded-2xl whitespace-nowrap transition-all duration-150 border flex-shrink-0 font-bold active:scale-95 backdrop-blur-md ${
              isDark 
                ? 'bg-white/[0.04] border-white/[0.08] text-slate-200 hover:border-indigo-400 hover:text-white hover:bg-white/[0.08]' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 shadow-sm'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box with Radiant Glow Button */}
      <div className="relative pt-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleQuery(inputText)}
          placeholder="Ask Copilot about any spend, payee, loan, cashflow..."
          className={`w-full px-5 py-4 pr-24 rounded-2xl text-xs sm:text-sm outline-none border transition-all duration-200 backdrop-blur-xl ${
            isDark 
              ? 'bg-[#0E1720]/90 border-white/[0.1] text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 shadow-inner' 
              : 'bg-white border-slate-200/90 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm'
          }`}
        />
        <button
          onClick={() => handleQuery(inputText)}
          className="absolute right-3 top-5 px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:brightness-110 text-white font-black text-xs rounded-xl transition-all duration-150 shadow-md shadow-indigo-500/30 hover:scale-105 active:scale-95"
        >
          Send
        </button>
      </div>
    </div>
  );
};


