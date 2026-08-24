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
    }, 400);
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
    }, 400);
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
    }, 400);
  };

  const handleGuestAccess = (preferredModule?: ActiveModule) => {
    onLoginSuccess(
      {
        name: 'Guest Explorer',
        email: 'guest@bytlend.local',
        phone: '+91 ••••• ••••',
      },
      preferredModule
    );
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8">
      <div className={`w-full max-w-md p-8 sm:p-10 rounded-[32px] border text-center transition-all shadow-md ${
        isDark 
          ? 'bg-[#121B22] border-[#22323D] text-[#E2ECEF]' 
          : 'bg-white border-slate-200 text-[#0F172A]'
      }`}>
        {/* Solid Brand Logo (No Gradients) */}
        <div className="w-16 h-16 rounded-3xl bg-[#00BFA5] mx-auto mb-4 flex items-center justify-center shadow-md">
          <span className="text-slate-950 font-black text-xl">BF</span>
        </div>

        <h2 className={`text-2xl font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          BytFloww Spend Intelligence
        </h2>
        <p className={`text-xs max-w-xs mx-auto mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Sign in to analyze Indian bank SMS messages, track recurring commitments, and inspect spend velocity.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold text-left">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Email / Phone Toggle */}
        <div className={`p-1 rounded-2xl flex gap-1 mb-5 border ${
          isDark ? 'bg-[#152028] border-[#273B49]' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => { setAuthMode('EMAIL'); setStep('INPUT'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
              authMode === 'EMAIL'
                ? isDark ? 'bg-[#00BFA5] text-slate-950 shadow-sm' : 'bg-[#0D9488] text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✉️ Email Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('PHONE'); setStep('INPUT'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
              authMode === 'PHONE'
                ? isDark ? 'bg-[#00BFA5] text-slate-950 shadow-sm' : 'bg-[#0D9488] text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📱 Mobile OTP
          </button>
        </div>

        {/* ── EMAIL FLOW ─────────────────────────────────────────────── */}
        {authMode === 'EMAIL' && (
          <form onSubmit={handleEmailLogin} className="space-y-3.5 text-left">
            <div>
              <label className={`text-[11px] font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                autoComplete="email"
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition ${
                  isDark 
                    ? 'bg-[#152028] border-[#273B49] text-white placeholder-slate-500 focus:border-[#00BFA5]' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0D9488]'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] font-bold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                required
                autoComplete="current-password"
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition ${
                  isDark 
                    ? 'bg-[#152028] border-[#273B49] text-white placeholder-slate-500 focus:border-[#00BFA5]' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0D9488]'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3.5 rounded-2xl font-black text-xs transition active:scale-[0.99] shadow-md ${
                isDark 
                  ? 'bg-[#00BFA5] hover:bg-[#00A892] text-slate-950' 
                  : 'bg-[#0D9488] hover:bg-[#0F766E] text-white'
              }`}
            >
              {loading ? 'Authenticating Securely...' : 'Sign In →'}
            </button>
          </form>
        )}

        {/* ── MOBILE OTP FLOW ────────────────────────────────────────── */}
        {authMode === 'PHONE' && (
          <div>
            {step === 'INPUT' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="text-left">
                  <label className={`text-[11px] font-bold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
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
                      className={`w-full px-4 py-3 pl-12 rounded-2xl text-xs sm:text-sm font-mono font-bold outline-none border transition ${
                        isDark 
                          ? 'bg-[#152028] border-[#273B49] text-white placeholder-slate-500 focus:border-[#00BFA5]' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0D9488]'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs transition active:scale-[0.99] shadow-md disabled:opacity-50 ${
                    isDark 
                      ? 'bg-[#00BFA5] hover:bg-[#00A892] text-slate-950' 
                      : 'bg-[#0D9488] hover:bg-[#0F766E] text-white'
                  }`}
                >
                  {loading ? 'Sending OTP...' : 'Get OTP on Mobile →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-left">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={`text-[11px] font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Enter Verification OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('INPUT')}
                      className={`text-[11px] font-bold hover:underline ${isDark ? 'text-[#00F2FE]' : 'text-teal-700'}`}
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
                    className={`w-full px-4 py-3 rounded-2xl text-center text-base tracking-widest font-mono font-bold outline-none border transition ${
                      isDark 
                        ? 'bg-[#152028] border-[#273B49] text-white placeholder-slate-500 focus:border-[#00BFA5]' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0D9488]'
                    }`}
                  />
                  <span className={`text-[10px] block mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Local sandbox verification active
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs transition active:scale-[0.99] shadow-md ${
                    isDark 
                      ? 'bg-[#00BFA5] hover:bg-[#00A892] text-slate-950' 
                      : 'bg-[#0D9488] hover:bg-[#0F766E] text-white'
                  }`}
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Enter App ✓'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── MODULE DIRECT ACCESS ───────────────────────────────── */}
        <div className="relative my-5">
          <div className={`absolute inset-0 flex items-center ${isDark ? 'border-t border-[#22323D]' : 'border-t border-slate-200'}`} />
          <div className="relative flex justify-center text-xs uppercase">
            <span className={`px-3 font-bold ${isDark ? 'bg-[#121B22] text-slate-400' : 'bg-white text-slate-500'}`}>
              or direct module launch
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleGuestAccess('SMS_INTELLIGENCE')}
            className={`py-3 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              isDark
                ? 'bg-[#152028] hover:bg-[#1C2C38] text-slate-200 border-[#273B49]'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
            }`}
          >
            <span>📱</span>
            <span>SMS Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => handleGuestAccess('BANK_STATEMENTS')}
            className={`py-3 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              isDark
                ? 'bg-teal-500/10 hover:bg-teal-500/20 text-[#00F2FE] border-teal-500/30'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-200 shadow-sm'
            }`}
          >
            <span>🏛️</span>
            <span>Statement Hub</span>
          </button>
        </div>

        <div className={`mt-5 text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          🔒 End-to-End Client Encryption • Zero Secret Tracking • Local In-Memory Parsing
        </div>
      </div>
    </div>
  );
};
