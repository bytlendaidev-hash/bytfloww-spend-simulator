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
            summary.isSpendingDown ? (isDark ? 'text-brand-viridian' : 'text-brand-700') : 'text-rose-600 dark:text-rose-400'
          }`}>
            {summary.wowVariancePct > 0 ? `+${summary.wowVariancePct}%` : `${summary.wowVariancePct}%`}
          </div>
          <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {summary.isSpendingDown ? 'Great job! Your spending is lower than last week.' : 'Heads up! Spending increased compared to last week.'}
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-[#142027] border border-white/[0.06]' : 'bg-slate-50 border border-slate-200'}`}>
              <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>This Week</span>
              <span className={`font-mono font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{summary.thisWeekSpend.toLocaleString('en-IN')}</span>
            </div>
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-[#142027] border border-white/[0.06]' : 'bg-slate-50 border border-slate-200'}`}>
              <span className={`block text-[10px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Last Week</span>
              <span className={`font-mono font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{summary.lastWeekSpend.toLocaleString('en-IN')}</span>
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
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Primary Category</span>
            <div className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{summary.topCategory}</div>
            <div className={`text-xs font-mono font-black mt-0.5 ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}>₹{summary.topCategoryAmount.toLocaleString('en-IN')}</div>
          </div>

          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#142027] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Top Payee / Merchant</span>
            <div className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{summary.topMerchant}</div>
            <div className={`text-xs font-mono font-black mt-0.5 ${isDark ? 'text-selvex-300' : 'text-selvex-700'}`}>₹{summary.topMerchantAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'AI Copilot Recommendation',
      subtitle: 'Actionable intelligence from your SMS stream',
      content: (
        <div className="space-y-4 py-4 text-center">
          <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-2xl border shadow-sm ${
            isDark ? 'bg-brand-viridian/20 border-brand-viridian/30 text-brand-viridian' : 'bg-emerald-100 border-emerald-300 text-brand-700'
          }`}>
            ✨
          </div>
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            isDark ? 'bg-[#142027] border-white/[0.06] text-slate-200' : 'bg-emerald-50/60 border-emerald-200 text-slate-900'
          }`}>
            {summary.actionableTip}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Discipline Rating:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-black text-xs font-mono">
              {summary.disciplineRating}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-emergence">
      <div className={`w-full max-w-md rounded-[32px] border p-6 sm:p-7 shadow-2xl flex flex-col justify-between transition-all duration-300 backdrop-blur-2xl ${
        isDark ? 'bg-[#0E1720]/95 border-emerald-500/30 text-white shadow-2xl shadow-black/80' : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-2xl'
      }`}>
        <div>
          {/* Header */}
          <div className={`flex items-center justify-between pb-4 border-b ${
            isDark ? 'border-white/[0.06]' : 'border-slate-100'
          }`}>
            <div>
              <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{slides[slide].title}</h3>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{slides[slide].subtitle}</p>
            </div>
            <button 
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
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
        <div className={`pt-4 border-t flex items-center justify-between ${
          isDark ? 'border-white/[0.06]' : 'border-slate-100'
        }`}>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div 
                key={i}
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  slide === i ? 'w-6 bg-brand-500' : 'w-2 bg-slate-400/40'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {slide > 0 && (
              <button
                onClick={() => setSlide(s => s - 1)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                Prev
              </button>
            )}
            <button
              onClick={() => {
                if (slide < slides.length - 1) setSlide(s => s + 1);
                else onClose();
              }}
              className={`px-5 py-2 rounded-2xl font-black text-xs transition-all duration-150 active:scale-95 shadow-md ${
                isDark 
                  ? 'bg-brand-viridian text-slate-950 hover:bg-brand-viridianDark shadow-brand-viridian/25' 
                  : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/20'
              }`}
            >
              {slide === slides.length - 1 ? 'Done' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

