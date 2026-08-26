import React, { useState } from 'react';
import { FinancialEvent, SpendSnapshot } from '../types';

interface AssistantScreenProps {
  snapshot: SpendSnapshot;
  events: FinancialEvent[];
  isDark?: boolean;
  onSelectEvent?: (event: FinancialEvent) => void;
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
    <div className="spatial-card p-6 sm:p-8 flex flex-col h-[75vh] space-y-4 max-w-5xl mx-auto animate-emergence">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-4 sm:p-5 rounded-[20px] max-w-[85%] sm:max-w-[70%] text-xs sm:text-sm leading-relaxed transition ${
                m.sender === 'USER'
                  ? 'bg-jade-500 text-abyss-canvas font-bold rounded-tr-none shadow-solid-sm'
                  : 'bg-abyss-well border border-abyss-border text-abyss-textPrimary rounded-tl-none shadow-solid-card-dark'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Attached Event Cards Grid */}
              {m.data && Array.isArray(m.data) && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-abyss-border">
                  {m.data.map((ev: FinancialEvent) => (
                    <div
                      key={ev.id}
                      onClick={() => onSelectEvent?.(ev)}
                      className="p-3 rounded-[12px] bg-abyss-card border border-abyss-border hover:bg-abyss-elevated cursor-pointer flex items-center justify-between transition text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-abyss-textPrimary truncate">{ev.merchant}</div>
                        <div className="text-[10px] text-abyss-textMuted">{ev.dateFormatted}</div>
                      </div>
                      <div className="font-bold font-mono text-abyss-textPrimary shrink-0">
                        ₹{ev.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[10px] mt-1 px-1 font-mono text-abyss-textMuted">{m.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 text-xs">
        {samplePrompts.map((p) => (
          <button
            key={p}
            onClick={() => handleQuery(p)}
            className="spatial-btn px-4 py-2 whitespace-nowrap text-xs text-abyss-textPrimary"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative pt-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleQuery(inputText)}
          placeholder="Ask Copilot about any spend, payee, loan, cashflow..."
          className="w-full px-6 py-4 pr-24 rounded-full text-sm bg-abyss-well border border-abyss-border text-abyss-textPrimary placeholder:text-abyss-textMuted outline-none focus:border-jade-500 focus:bg-abyss-elevated transition-all duration-200"
        />
        <button
          onClick={() => handleQuery(inputText)}
          className="spatial-btn-selected absolute right-3 top-4.5 px-5 py-2 rounded-full text-xs"
        >
          Send
        </button>
      </div>
    </div>
  );
};
