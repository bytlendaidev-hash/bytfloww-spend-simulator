import React, { useState } from 'react';
import { ActiveModule } from '../types';
import { BytLendLogo } from './BytLendLogo';
import { THEME_TEMPLATES, ThemeTemplateId, getActiveThemeId, setActiveThemeId } from '../theme/themes';

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
  const [activeTheme, setActiveTheme] = useState<ThemeTemplateId>(getActiveThemeId());

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

  const handleSelectTheme = (id: ThemeTemplateId) => {
    setActiveTheme(id);
    setActiveThemeId(id);
  };

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 animate-emergence">
      <div className="spatial-card w-full max-w-md p-8 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-jade-500/20 blur-3xl pointer-events-none" />

        {/* Brand Icon Badge */}
        <div className="flex justify-center relative z-10">
          <BytLendLogo size="lg" />
        </div>

        <div className="space-y-1 relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-abyss-textPrimary flex items-center justify-center">
            Byt<span className="text-jade-500 font-black ml-0.5">Floww</span>
          </h1>
          <p className="text-xs text-jade-500 font-bold uppercase tracking-widest">
            Autonomous AI Capital Forensics
          </p>
          <p className="text-[11px] text-abyss-textMuted pt-0.5">
            Billion-Dollar Multi-Theme Financial Intelligence OS
          </p>
        </div>

        {/* Theme Quick Selector Swatches */}
        <div className="p-3 rounded-2xl bg-abyss-well border border-abyss-border space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-abyss-textMuted px-1">
            <span>Choose Startup Theme</span>
            <span className="text-jade-500">{THEME_TEMPLATES[activeTheme]?.name}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            {Object.values(THEME_TEMPLATES).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTheme(t.id)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all duration-200 border ${
                  activeTheme === t.id
                    ? 'border-jade-500 bg-jade-500/20 scale-110 shadow-sm'
                    : 'border-abyss-border bg-abyss-card hover:scale-105'
                }`}
                title={t.name}
              >
                {t.icon}
              </button>
            ))}
          </div>
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
              <label className="block text-xs font-semibold text-abyss-textSecondary mb-1.5">
                Corporate or Personal Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3 rounded-xl bg-abyss-well border border-abyss-border text-sm text-abyss-textPrimary placeholder-abyss-textMuted outline-none focus:border-jade-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-abyss-textSecondary mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-abyss-well border border-abyss-border text-sm text-abyss-textPrimary placeholder-abyss-textMuted outline-none focus:border-jade-500"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-pulse-500 font-semibold">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full spatial-btn-selected text-xs font-bold transition flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In Securely →'}
            </button>
          </form>
        )}

        {/* Phone Auth Form */}
        {authMode === 'PHONE' && (
          <div className="space-y-4 text-left">
            {step === 'INPUT' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-abyss-textSecondary mb-1.5">
                    10-Digit Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <span className="px-3.5 py-3 rounded-xl bg-abyss-well border border-abyss-border text-sm font-mono text-abyss-textMuted flex items-center">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="84008 69600"
                      className="flex-1 px-4 py-3 rounded-xl bg-abyss-well border border-abyss-border text-sm text-abyss-textPrimary placeholder-abyss-textMuted outline-none focus:border-jade-500 font-mono"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs text-pulse-500 font-semibold">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full spatial-btn-selected text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending OTP...' : 'Send Verification OTP →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-abyss-textSecondary mb-1.5">
                    Enter Verification Code (OTP sent to +91 {phone})
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-xl bg-abyss-well border border-abyss-border text-center text-lg font-mono tracking-widest text-abyss-textPrimary placeholder-abyss-textMuted outline-none focus:border-jade-500"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-pulse-500 font-semibold">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full spatial-btn-selected text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Verify & Enter Workspace →'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 1-Click Fast Access Buttons */}
        <div className="pt-2 border-t border-abyss-border space-y-2">
          <span className="text-[10px] text-abyss-textMuted uppercase font-bold tracking-wider block">
            Instant 1-Click Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleGuestAccess('SMS_INTELLIGENCE')}
              className="py-2.5 px-3 rounded-xl bg-abyss-well hover:bg-abyss-elevated border border-abyss-border text-xs font-semibold text-abyss-textPrimary transition text-center"
            >
              📱 SMS Simulator
            </button>
            <button
              type="button"
              onClick={() => handleGuestAccess('BANK_STATEMENTS')}
              className="py-2.5 px-3 rounded-xl bg-abyss-well hover:bg-abyss-elevated border border-abyss-border text-xs font-semibold text-abyss-textPrimary transition text-center"
            >
              📊 Bank Forensics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
