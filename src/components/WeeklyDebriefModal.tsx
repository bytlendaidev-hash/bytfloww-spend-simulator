import React, { useState } from 'react';
import { WeeklyDebriefSummary } from '../types';

interface WeeklyDebriefModalProps {
  summary: WeeklyDebriefSummary;
  isDark: boolean;
  onClose: () => void;
}

export const WeeklyDebriefModal: React.FC<WeeklyDebriefModalProps> = ({
  summary,
  isDark,
  onClose,
}) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: 'Week-over-Week Trajectory',
      subtitle: summary.weekDateRangeLabel,
      content: (
        <div className="space-y-4 text-center py-4">
          <div className={`text-4xl font-black font-mono ${
            summary.isSpendingDown ? 'text-jade-500' : 'text-pulse-500'
          }`}>
            {summary.wowVariancePct > 0 ? `+${summary.wowVariancePct}%` : `${summary.wowVariancePct}%`}
          </div>
          <p className="text-sm font-medium text-abyss-textSecondary">
            {summary.isSpendingDown ? 'Great job! Your spending is lower than last week.' : 'Heads up! Spending increased compared to last week.'}
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-abyss-well border border-abyss-border">
              <span className="block text-[10px] font-bold uppercase text-abyss-textMuted">This Week</span>
              <span className="font-mono font-black text-sm text-abyss-textPrimary">₹{summary.thisWeekSpend.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-2xl bg-abyss-well border border-abyss-border">
              <span className="block text-[10px] font-bold uppercase text-abyss-textMuted">Last Week</span>
              <span className="font-mono font-black text-sm text-abyss-textPrimary">₹{summary.lastWeekSpend.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Top Category & Merchant',
      subtitle: 'Where most of your outflows went this week',
      content: (
        <div className="space-y-3 py-3">
          <div className="p-4 rounded-2xl border bg-abyss-well border-abyss-border">
            <span className="text-[10px] uppercase font-bold text-abyss-textMuted">Primary Category</span>
            <div className="text-base font-black text-abyss-textPrimary">{summary.topCategory}</div>
            <div className="text-xs font-mono font-black mt-0.5 text-jade-500">₹{summary.topCategoryAmount.toLocaleString('en-IN')}</div>
          </div>

          <div className="p-4 rounded-2xl border bg-abyss-well border-abyss-border">
            <span className="text-[10px] uppercase font-bold text-abyss-textMuted">Top Payee / Merchant</span>
            <div className="text-base font-black text-abyss-textPrimary">{summary.topMerchant}</div>
            <div className="text-xs font-mono font-black mt-0.5 text-synapse-400 light:text-synapse-700">₹{summary.topMerchantAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'AI Copilot Recommendation',
      subtitle: 'Actionable intelligence from your SMS stream',
      content: (
        <div className="space-y-4 py-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-2xl border shadow-sm bg-synapse-500/20 border-synapse-500/30 text-synapse-400 light:text-synapse-700">
            ✨
          </div>
          <div className="p-4 rounded-2xl border text-xs leading-relaxed bg-abyss-well border-abyss-border text-abyss-textSecondary">
            {summary.actionableTip}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-abyss-textMuted">Discipline Rating:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-jade-500/20 text-jade-500 font-black text-xs font-mono">
              {summary.disciplineRating}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-emergence">
      <div className="spatial-modal w-full max-w-md p-6 sm:p-7 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-abyss-border">
            <div>
              <h3 className="text-base font-black tracking-tight text-abyss-textPrimary">{slides[slide].title}</h3>
              <p className="text-xs font-medium text-abyss-textMuted">{slides[slide].subtitle}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-abyss-border hover:bg-abyss-elevated text-abyss-textMuted transition"
            >
              ✕
            </button>
          </div>

          {/* Carousel Slide Content */}
          <div className="min-h-[220px] flex items-center justify-center">
            {slides[slide].content}
          </div>
        </div>

        {/* Carousel Indicators & Next Button */}
        <div className="pt-4 border-t border-abyss-border flex items-center justify-between">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div 
                key={i}
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  slide === i ? 'w-6 bg-jade-500' : 'w-2 bg-abyss-border'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {slide > 0 && (
              <button
                onClick={() => setSlide(s => s - 1)}
                className="spatial-btn px-4 py-2 text-xs font-bold text-abyss-textPrimary"
              >
                Prev
              </button>
            )}
            <button
              onClick={() => {
                if (slide < slides.length - 1) setSlide(s => s + 1);
                else onClose();
              }}
              className="spatial-btn-selected px-5 py-2 rounded-full font-black text-xs transition-all duration-150"
            >
              {slide === slides.length - 1 ? 'Done' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
