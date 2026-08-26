import React, { useState } from 'react';
import { ActiveModule } from '../types';

interface LoginScreenProps {
  isDark: boolean;
  onLoginSuccess: (user: { name: string; email: string; phone: string }, preferredModule?: ActiveModule) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  isDark,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'INPUT' | 'OTP'>('INPUT');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Helper to derive a clean display name from email
  const deriveNameFromEmail = (rawEmail: string): string => {
    if (!rawEmail) return 'Authorized User';
    const localPart = rawEmail.split('@')[0];
    return localPart
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ') || 'Authorized User';
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        name: deriveNameFromEmail(email),
        email: email.trim().toLowerCase(),
        phone: '+91 ••••• ••••',
      });
    }, 350);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!phone || phone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
    }, 350);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!otp || otp.length < 4) {
      setErrorMessage('Please enter a valid 4 to 6-digit verification code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        name: `User *${phone.slice(-4)}`,
        email: `user.${phone.slice(-4)}@bytlend.local`,
        phone: `+91 ${phone}`,
      });
    }, 350);
  };

  const handleGuestAccess = (preferredModule?: ActiveModule) => {
    onLoginSuccess(
      {
        name: 'Deepankar Gautam',
        email: 'deepankar.gautam@bytlend.local',
        phone: '+91 84008 69600',
      },
      preferredModule
    );
  };

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className={`w-full max-w-md p-8 sm:p-10 rounded-[32px] border text-center transition-all duration-200 ${
        isDark 
          ? 'bg-[#10181E]/95 border-white/[0.08] text-[#FFFFFF] shadow-2xl shadow-black/80' 
          : 'bg-white border-slate-200/90 text-slate-900 shadow-xl shadow-slate-900/5'
      }`}>
        {/* Brand Icon Badge */}
        <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg transition-all ${
          isDark 
            ? 'bg-brand-viridian text-slate-950 shadow-brand-viridian/25' 
            : 'bg-brand-600 text-white shadow-brand-600/25'
        }`}>
          <span className="font-black text-2xl tracking-tight">BF</span>
        </div>

        <h2 className={`text-2xl sm:text-3xl font-black tracking-tight mb-1.5 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          BytFloww Intelligence
        </h2>
        <p className={`text-xs sm:text-sm max-w-xs mx-auto mb-6 leading-relaxed ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Analyze bank SMS messages, track recurring commitments, and inspect cashflow velocity.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-bold text-left flex items-center gap-2 animate-fade-in">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Email / Phone Toggle Switcher */}
        <div className={`p-1 rounded-2xl flex gap-1 mb-5 border transition-all ${
          isDark ? 'bg-[#142027] border-white/[0.08]' : 'bg-slate-100 border-slate-200/80'
        }`}>
          <button
            type="button"
            onClick={() => { setAuthMode('EMAIL'); setStep('INPUT'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all duration-150 ${
              authMode === 'EMAIL'
                ? isDark 
                  ? 'bg-brand-viridian text-slate-950 shadow-sm font-black' 
                  : 'bg-white text-slate-900 shadow-sm font-black border border-slate-200/80'
                : isDark 
                ? 'text-slate-400 hover:text-white' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✉️ Email Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('PHONE'); setStep('INPUT'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all duration-150 ${
              authMode === 'PHONE'
                ? isDark 
                  ? 'bg-brand-viridian text-slate-950 shadow-sm font-black' 
                  : 'bg-white text-slate-900 shadow-sm font-black border border-slate-200/80'
                : isDark 
                ? 'text-slate-400 hover:text-white' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📱 Mobile OTP
          </button>
        </div>

        {/* ── EMAIL FLOW ─────────────────────────────────────────────── */}
        {authMode === 'EMAIL' && (
          <form onSubmit={handleEmailLogin} className="space-y-3.5 text-left">
            <div>
              <label className={`text-[11px] font-bold block mb-1 uppercase tracking-wider ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition-all ${
                  isDark 
                    ? 'bg-[#18242D] border-white/[0.08] text-white placeholder-slate-500 focus:border-brand-viridian focus:ring-2 focus:ring-brand-viridian/20' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] font-bold block mb-1 uppercase tracking-wider ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                required
                autoComplete="current-password"
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition-all ${
                  isDark 
                    ? 'bg-[#18242D] border-white/[0.08] text-white placeholder-slate-500 focus:border-brand-viridian focus:ring-2 focus:ring-brand-viridian/20' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3.5 rounded-2xl font-black text-xs transition-all duration-150 active:scale-[0.99] shadow-md ${
                isDark 
                  ? 'bg-brand-viridian hover:bg-brand-viridianDark text-slate-950 shadow-brand-viridian/20' 
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/25'
              }`}
            >
              {loading ? 'Authenticating Securely...' : 'Sign In with Email →'}
            </button>
          </form>
        )}

        {/* ── MOBILE OTP FLOW ────────────────────────────────────────── */}
        {authMode === 'PHONE' && (
          <div>
            {step === 'INPUT' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="text-left">
                  <label className={`text-[11px] font-bold block mb-1.5 uppercase tracking-wider ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      required
                      autoComplete="tel"
                      className={`w-full px-4 py-3 pl-12 rounded-2xl text-xs sm:text-sm font-mono font-bold outline-none border transition-all ${
                        isDark 
                          ? 'bg-[#18242D] border-white/[0.08] text-white placeholder-slate-500 focus:border-brand-viridian focus:ring-2 focus:ring-brand-viridian/20' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all duration-150 active:scale-[0.99] shadow-md disabled:opacity-50 ${
                    isDark 
                      ? 'bg-brand-viridian hover:bg-brand-viridianDark text-slate-950 shadow-brand-viridian/20' 
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/25'
                  }`}
                >
                  {loading ? 'Sending OTP...' : 'Get OTP on Mobile →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-left">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={`text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      Enter Verification OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('INPUT')}
                      className={`text-[11px] font-bold hover:underline ${isDark ? 'text-brand-viridian' : 'text-brand-700'}`}
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 4-6 digit OTP"
                    autoFocus
                    required
                    className={`w-full px-4 py-3 rounded-2xl text-center text-base tracking-widest font-mono font-bold outline-none border transition-all ${
                      isDark 
                        ? 'bg-[#18242D] border-white/[0.08] text-white placeholder-slate-500 focus:border-brand-viridian' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-brand-600'
                    }`}
                  />
                  <span className={`text-[10px] block mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Local verification active (enter any 4-6 digits)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all duration-150 active:scale-[0.99] shadow-md ${
                    isDark 
                      ? 'bg-brand-viridian hover:bg-brand-viridianDark text-slate-950 shadow-brand-viridian/20' 
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/25'
                  }`}
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Enter App ✓'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── 1-CLICK INSTANT DEMO EXPLORER ───────────────────────── */}
        <div className="relative my-6">
          <div className={`absolute inset-0 flex items-center ${isDark ? 'border-t border-white/[0.08]' : 'border-t border-slate-200'}`} />
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className={`px-3 font-bold ${isDark ? 'bg-[#10181E] text-slate-400' : 'bg-white text-slate-500'}`}>
              or 1-click instant demo
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleGuestAccess('SMS_INTELLIGENCE')}
            className={`py-3 px-3.5 rounded-2xl border text-xs font-black transition-all duration-150 flex items-center justify-center gap-2 active:scale-95 ${
              isDark
                ? 'bg-[#142027] hover:bg-[#1a2832] text-white border-white/[0.08]'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-200/90 shadow-sm'
            }`}
          >
            <span>📱</span>
            <span>SMS Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => handleGuestAccess('BANK_STATEMENTS')}
            className={`py-3 px-3.5 rounded-2xl border text-xs font-black transition-all duration-150 flex items-center justify-center gap-2 active:scale-95 ${
              isDark
                ? 'bg-brand-viridian/10 hover:bg-brand-viridian/20 text-brand-viridian border-brand-viridian/30'
                : 'bg-emerald-50 hover:bg-emerald-100 text-brand-800 border-brand-200 shadow-sm'
            }`}
          >
            <span>🏛️</span>
            <span>Statement Hub</span>
          </button>
        </div>

        <div className={`mt-6 pt-4 border-t text-[11px] flex items-center justify-center gap-1.5 ${
          isDark ? 'border-white/[0.06] text-slate-500' : 'border-slate-100 text-slate-500'
        }`}>
          <span>🔒</span>
          <span>100% Client-Side Privacy • In-Memory Ingestion • Zero Cloud Storage</span>
        </div>
      </div>
    </div>
  );
};

