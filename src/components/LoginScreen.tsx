import React, { useState } from 'react';
import { ActiveModule } from '../types';
import { BytLendLogo } from './BytLendLogo';

interface LoginScreenProps {
  isDark?: boolean;
  onLoginSuccess: (user: { name: string; email: string; phone: string }, preferredModule?: ActiveModule) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
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
      <div className="spatial-card w-full max-w-md p-8 sm:p-10 text-center space-y-6">
        {/* Brand Icon Badge */}
        <div className="flex justify-center">
          <BytLendLogo size="lg" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-abyss-textPrimary flex items-center justify-center">
            Byt<span className="text-jade-500 font-black">Lend</span>
          </h1>
          <p className="text-xs text-jade-500 font-bold uppercase tracking-widest">
            Autonomous AI Capital Forensics
          </p>
          <p className="text-[11px] text-abyss-textMuted pt-0.5">
            Sovereign Jade & Synapse Iris Intelligence
          </p>
        </div>

        {/* Auth Mode Tabs Pill */}
        <div className="p-1 rounded-full bg-abyss-well border border-abyss-border flex">
          <button
            type="button"
            onClick={() => { setAuthMode('EMAIL'); setErrorMessage(''); setStep('INPUT'); }}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              authMode === 'EMAIL'
                ? 'spatial-btn-selected'
                : 'text-abyss-textSecondary hover:text-abyss-textPrimary'
            }`}
          >
            📧 Email Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('PHONE'); setErrorMessage(''); setStep('INPUT'); }}
            className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              authMode === 'PHONE'
                ? 'spatial-btn-selected'
                : 'text-abyss-textSecondary hover:text-abyss-textPrimary'
            }`}
          >
            📱 Mobile OTP
          </button>
        </div>

        {/* Email Auth Form */}
        {authMode === 'EMAIL' && (
          <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-abyss-textMuted">
                Work / Personal Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3.5 rounded-[14px] text-xs bg-abyss-well border border-abyss-border text-abyss-textPrimary placeholder:text-abyss-textMuted outline-none focus:border-jade-500 transition"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-abyss-textMuted">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-[14px] text-xs bg-abyss-well border border-abyss-border text-abyss-textPrimary placeholder:text-abyss-textMuted outline-none focus:border-jade-500 transition"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-[12px] bg-pulse-500/15 border border-pulse-500/30 text-pulse-500 text-xs font-bold text-center">
                ⚠️ {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="spatial-btn-selected w-full py-4 rounded-full text-xs font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <span>Sign In to System →</span>
              )}
            </button>
          </form>
        )}

        {/* Phone OTP Auth Form */}
        {authMode === 'PHONE' && (
          <form onSubmit={step === 'INPUT' ? handleSendOtp : handleVerifyOtp} className="space-y-4 text-left">
            {step === 'INPUT' ? (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-abyss-textMuted">
                  Indian Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-3.5 rounded-[14px] text-xs font-bold bg-abyss-well border border-abyss-border text-abyss-textPrimary">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="98765 43210"
                    className="flex-1 px-4 py-3.5 rounded-[14px] text-xs font-mono bg-abyss-well border border-abyss-border text-abyss-textPrimary placeholder:text-abyss-textMuted outline-none focus:border-jade-500 transition"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-abyss-textMuted">
                    Enter 6-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('INPUT')}
                    className="text-[10px] font-bold text-telemetry-500 hover:underline"
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
                  className="w-full px-4 py-3.5 rounded-[14px] text-base font-mono font-bold tracking-widest text-center bg-abyss-well border border-abyss-border text-abyss-textPrimary placeholder:text-abyss-textMuted outline-none focus:border-jade-500 transition"
                />
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-[12px] bg-pulse-500/15 border border-pulse-500/30 text-pulse-500 text-xs font-bold text-center">
                ⚠️ {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="spatial-btn-selected w-full py-4 rounded-full text-xs font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : step === 'INPUT' ? (
                <span>Send Verification OTP →</span>
              ) : (
                <span>Verify & Enter OS →</span>
              )}
            </button>
          </form>
        )}

        {/* Quick Access */}
        <div className="pt-4 border-t border-abyss-border space-y-3">
          <div className="text-[10px] font-bold uppercase text-jade-500 tracking-wider">
            Quick One-Click Access (Authorized Session)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleGuestAccess('BANK_STATEMENTS')}
              className="spatial-btn p-3 text-xs text-abyss-textPrimary border-jade-500/30"
            >
              <div className="font-bold text-jade-500">🏛️ Statement Hub</div>
              <div className="text-[9px] text-abyss-textMuted mt-0.5 font-normal">Forensics Engine</div>
            </button>

            <button
              type="button"
              onClick={() => handleGuestAccess('SMS_INTELLIGENCE')}
              className="spatial-btn p-3 text-xs text-abyss-textPrimary border-synapse-500/30"
            >
              <div className="font-bold text-synapse-400 light:text-synapse-700">📱 SMS Simulator</div>
              <div className="text-[9px] text-abyss-textMuted mt-0.5 font-normal">Android XML Parser</div>
            </button>
          </div>
        </div>
      </div>

      {/* Brand Trust Badges */}
      <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-bold tracking-[0.2em] text-jade-500 uppercase">
        <span className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
          🛡️ TRUSTED
        </span>
        <span className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
          🔒 SECURE
        </span>
        <span className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
          ✨ SMART AI
        </span>
        <span className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition">
          ⚡ FAST
        </span>
      </div>
    </div>
  );
};
