import React, { useState } from 'react';

interface LoginScreenProps {
  isDark: boolean;
  onLoginSuccess: (user: { name: string; email: string; phone: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  isDark,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [phone, setPhone] = useState('8400869600');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('mannumad.007@gmail.com');
  const [password, setPassword] = useState('Cody@2026');
  const [step, setStep] = useState<'INPUT' | 'OTP'>('INPUT');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
    }, 300);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        name: email === 'mannumad.007@gmail.com' ? 'Mannu Mad' : 'Deepankar Gautam',
        email: email || 'mannumad.007@gmail.com',
        phone: '+91 ' + (phone || '8400869600'),
      });
    }, 300);
  };

  const handleQuickDemoLogin = () => {
    onLoginSuccess({
      name: 'Mannu Mad',
      email: 'mannumad.007@gmail.com',
      phone: '+91 8400869600',
    });
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8">
      <div className={`w-full max-w-md p-8 sm:p-10 rounded-[36px] border text-center transition-all ${
        isDark 
          ? 'bg-[#0E1C23] border-cyan-500/20 text-[#E2ECEF] shadow-2xl shadow-cyan-950/30' 
          : 'bg-white border-slate-200 text-[#0F172A] shadow-xl'
      }`}>
        {/* Brand Logo */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#00BFA5] via-[#00F2FE] to-[#9B51E0] p-1 mx-auto mb-4 shadow-lg shadow-[#00BFA5]/25">
          <div className={`w-full h-full rounded-[22px] flex items-center justify-center text-xl font-black ${
            isDark ? 'bg-[#0A171D] text-[#00F2FE]' : 'bg-white text-[#00BFA5]'
          }`}>
            BF
          </div>
        </div>

        <h2 className={`text-2xl font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
          BytFloww Spend Intelligence
        </h2>
        <p className={`text-xs max-w-xs mx-auto mb-6 ${isDark ? 'text-[#8A9EA8]' : 'text-slate-500'}`}>
          Sign in to analyze Indian bank SMS messages, track recurring commitments, and inspect spend velocity.
        </p>

        {/* Email / Phone Toggle */}
        <div className={`p-1 rounded-2xl flex gap-1 mb-5 border ${
          isDark ? 'bg-[#12232B] border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => { setAuthMode('EMAIL'); setStep('INPUT'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              authMode === 'EMAIL'
                ? 'bg-[#00BFA5] text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✉️ Email Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('PHONE'); setStep('INPUT'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              authMode === 'PHONE'
                ? 'bg-[#00BFA5] text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📱 Mobile OTP
          </button>
        </div>

        {/* ── EMAIL FLOW ─────────────────────────────────────────────── */}
        {authMode === 'EMAIL' && (
          <form onSubmit={handleVerifyOtp} className="space-y-3 text-left">
            <div>
              <label className={`text-[11px] font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mannumad.007@gmail.com"
                required
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition ${
                  isDark 
                    ? 'bg-[#12232B] border-cyan-500/20 text-white placeholder-slate-500 focus:border-[#00BFA5]' 
                    : 'bg-slate-50 border-slate-200 text-[#0F172A] placeholder-slate-400 focus:border-[#00BFA5]'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Cody@2026"
                required
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold outline-none border transition ${
                  isDark 
                    ? 'bg-[#12232B] border-cyan-500/20 text-white placeholder-slate-500 focus:border-[#00BFA5]' 
                    : 'bg-slate-50 border-slate-200 text-[#0F172A] placeholder-slate-400 focus:border-[#00BFA5]'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#00BFA5] to-[#00F2FE] text-black font-extrabold text-xs shadow-lg shadow-[#00BFA5]/25 transition hover:scale-[1.01]"
            >
              {loading ? 'Authenticating...' : 'Sign In with Email →'}
            </button>
          </form>
        )}

        {/* ── MOBILE OTP FLOW ────────────────────────────────────────── */}
        {authMode === 'PHONE' && (
          <div>
            {step === 'INPUT' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="text-left">
                  <label className={`text-[11px] font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                      required
                      className={`w-full px-4 py-3 pl-12 rounded-2xl text-xs sm:text-sm font-mono font-bold outline-none border transition ${
                        isDark 
                          ? 'bg-[#12232B] border-cyan-500/20 text-white placeholder-slate-500 focus:border-[#00BFA5]' 
                          : 'bg-slate-50 border-slate-200 text-[#0F172A] placeholder-slate-400 focus:border-[#00BFA5]'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00BFA5] to-[#00F2FE] text-black font-extrabold text-xs shadow-lg shadow-[#00BFA5]/25 transition hover:scale-[1.01] disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : 'Get OTP on Mobile →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-left">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Enter 4-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep('INPUT')}
                      className="text-[11px] font-bold text-[#00BFA5] hover:underline"
                    >
                      Change Number
                    </button>
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter any 4-6 digits (e.g. 1234)"
                    autoFocus
                    required
                    className={`w-full px-4 py-3 rounded-2xl text-center text-base tracking-widest font-mono font-bold outline-none border transition ${
                      isDark 
                        ? 'bg-[#12232B] border-cyan-500/20 text-white placeholder-slate-500 focus:border-[#00BFA5]' 
                        : 'bg-slate-50 border-slate-200 text-[#0F172A] placeholder-slate-400 focus:border-[#00BFA5]'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">Demo sandbox mode: any 4 digits will verify</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00BFA5] to-[#00F2FE] text-black font-extrabold text-xs shadow-lg shadow-[#00BFA5]/25 transition hover:scale-[1.01]"
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Enter App ✓'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── QUICK 1-CLICK DEMO LOGIN ───────────────────────────────── */}
        <div className="relative my-5">
          <div className={`absolute inset-0 flex items-center ${isDark ? 'border-t border-white/10' : 'border-t border-slate-200'}`} />
          <div className="relative flex justify-center text-xs uppercase">
            <span className={`px-3 font-semibold ${isDark ? 'bg-[#0E1C23] text-slate-400' : 'bg-white text-slate-500'}`}>
              or fast access
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickDemoLogin}
          className={`w-full py-3 px-4 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
            isDark
              ? 'bg-[#12232B] hover:bg-[#152a35] text-slate-200 border-white/10'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
          }`}
        >
          <span>⚡</span>
          <span>Instant Login as mannumad.007@gmail.com</span>
        </button>

        <div className="mt-5 text-[10px] text-slate-400">
          🔒 Secure Client Session • Local Privacy Guaranteed
        </div>
      </div>
    </div>
  );
};
