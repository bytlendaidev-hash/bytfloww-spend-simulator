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
    <div className="min-h-[82vh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 animate-emergence">
      <div className={`w-full max-w-md p-8 sm:p-10 rounded-[36px] border text-center transition-all duration-300 backdrop-blur-2xl ${
        isDark 
          ? 'bg-[#0E1720]/80 border-white/[0.1] text-[#F8FAFC] shadow-2xl shadow-black/80' 
          : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-2xl shadow-slate-900/10'
      }`}>
        {/* Brand Icon Badge with glowing ambient halo */}
        <div className="relative mx-auto mb-5 w-16 h-16">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl transition-all ${
            isDark 
              ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 shadow-emerald-500/30' 
              : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-600/25'
          }`}>
            BF
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0E1720] animate-pulse" />
        </div>

        <div className="space-y-1.5 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
            BytFloww Spatial OS
          </h1>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Personal Financial Forensics & Multi-Statement Intelligence
          </p>
        </div>

        {/* Auth Mode Tabs Pill */}
        <div className={`p-1 rounded-2xl border flex mb-6 backdrop-blur-xl ${
          isDark ? 'bg-black/40 border-white/[0.08]' : 'bg-slate-100/90 border-slate-200/90'
        }`}>
          <button
            type="button"
            onClick={() => { setAuthMode('EMAIL'); setErrorMessage(''); setStep('INPUT'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all duration-150 ${
              authMode === 'EMAIL'
                ? (isDark ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20')
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            📧 Email Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('PHONE'); setErrorMessage(''); setStep('INPUT'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all duration-150 ${
              authMode === 'PHONE'
                ? (isDark ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20')
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            📱 Mobile OTP
          </button>
        </div>

        {/* Email Auth Form */}
        {authMode === 'EMAIL' && (
          <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
            <div>
              <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Work / Personal Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className={`w-full px-4 py-3 rounded-2xl text-xs border outline-none transition-all duration-150 ${
                  isDark 
                    ? 'bg-[#142028]/80 border-white/10 text-white focus:border-emerald-400 placeholder:text-slate-500 shadow-inner' 
                    : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500 placeholder:text-slate-400 shadow-sm'
                }`}
              />
            </div>

            <div>
              <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-2xl text-xs border outline-none transition-all duration-150 ${
                  isDark 
                    ? 'bg-[#142028]/80 border-white/10 text-white focus:border-emerald-400 placeholder:text-slate-500 shadow-inner' 
                    : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500 placeholder:text-slate-400 shadow-sm'
                }`}
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
                ⚠️ {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all duration-150 flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                isDark 
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 hover:brightness-110 shadow-emerald-500/20' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-105 shadow-emerald-600/20'
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Spatial OS →</span>
              )}
            </button>
          </form>
        )}

        {/* Phone OTP Auth Form */}
        {authMode === 'PHONE' && (
          <form onSubmit={step === 'INPUT' ? handleSendOtp : handleVerifyOtp} className="space-y-4 text-left">
            {step === 'INPUT' ? (
              <div>
                <label className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Indian Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-3 rounded-2xl text-xs font-bold border ${
                    isDark ? 'bg-[#142028]/80 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="98765 43210"
                    className={`flex-1 px-4 py-3 rounded-2xl text-xs font-mono border outline-none transition-all duration-150 ${
                      isDark 
                        ? 'bg-[#142028]/80 border-white/10 text-white focus:border-emerald-400 placeholder:text-slate-500 shadow-inner' 
                        : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500 placeholder:text-slate-400 shadow-sm'
                    }`}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Enter 6-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('INPUT')}
                    className="text-[10px] font-bold text-emerald-400 hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className={`w-full px-4 py-3 rounded-2xl text-base font-mono font-bold tracking-widest text-center border outline-none transition-all duration-150 ${
                    isDark 
                      ? 'bg-[#142028]/80 border-white/10 text-white focus:border-emerald-400 placeholder:text-slate-500 shadow-inner' 
                      : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500 placeholder:text-slate-400 shadow-sm'
                  }`}
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
                ⚠️ {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all duration-150 flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                isDark 
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 hover:brightness-110 shadow-emerald-500/20' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-105 shadow-emerald-600/20'
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  <span>Processing...</span>
                </>
              ) : step === 'INPUT' ? (
                <span>Send Verification OTP →</span>
              ) : (
                <span>Verify & Enter OS →</span>
              )}
            </button>
          </form>
        )}

        {/* Quick Demo / Guest Bypass Actions */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] space-y-3">
          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Quick One-Click Access (Authorized Session)
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleGuestAccess('BANK_STATEMENTS')}
              className={`p-3 rounded-2xl border text-xs font-black text-center transition-all duration-150 active:scale-95 ${
                isDark 
                  ? 'bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-300 shadow-sm' 
                  : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-800 shadow-sm'
              }`}
            >
              <div>🏛️ Bank Forensics</div>
              <div className="text-[9px] font-normal opacity-80 mt-0.5">Direct Statement Mode</div>
            </button>

            <button
              type="button"
              onClick={() => handleGuestAccess('SMS_INTELLIGENCE')}
              className={`p-3 rounded-2xl border text-xs font-black text-center transition-all duration-150 active:scale-95 ${
                isDark 
                  ? 'bg-indigo-500/10 border-indigo-500/25 hover:bg-indigo-500/20 text-indigo-300 shadow-sm' 
                  : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-800 shadow-sm'
              }`}
            >
              <div>📱 SMS Simulator</div>
              <div className="text-[9px] font-normal opacity-80 mt-0.5">Android XML Ingestion</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
