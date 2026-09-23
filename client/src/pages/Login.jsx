import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appName';
import { Tractor, Phone, Lock, LogIn, AlertCircle, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [loginMode, setLoginMode] = useState('user'); // 'user' | 'admin'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const userObj = await login(phone, password);
      if (loginMode === 'admin' && userObj?.role !== 'admin') {
        setError('This account does not have Admin privileges. Switching to standard user session.');
      }
      if (userObj?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userObj?.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/marketplace');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (demoPhone, demoPass, mode = 'user') => {
    setLoginMode(mode);
    setPhone(demoPhone);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md">
        
        {/* Main Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden backdrop-blur-sm">
          
          {/* Header Banner - Emerald Agricultural Theme */}
          <div className={`p-8 text-white text-center relative overflow-hidden transition-colors duration-300 ${
            loginMode === 'admin' 
              ? 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-800'
              : 'bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900'
          }`}>
            <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
              <Tractor className="w-48 h-48 text-white" />
            </div>

            <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-100 border border-white/20 mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{loginMode === 'admin' ? 'Admin Escrow Portal' : `${APP_CONFIG.primaryName} Platform`}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {loginMode === 'admin' ? 'Admin Portal Sign In' : 'Welcome Back'}
            </h2>
            <p className="text-emerald-100 text-xs mt-1 font-normal max-w-xs mx-auto">
              {loginMode === 'admin' 
                ? 'Platform Owner portal for verifying client payments & releasing provider payouts'
                : APP_CONFIG.tagline}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-extrabold">
            <button
              type="button"
              onClick={() => {
                setLoginMode('user');
                setError('');
              }}
              className={`py-2.5 rounded-2xl flex items-center justify-center space-x-1.5 transition-all ${
                loginMode === 'user'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>User / Seeker Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('admin');
                setPhone('9030585591');
                setPassword('AgriAdmin#2026');
                setError('');
              }}
              className={`py-2.5 rounded-2xl flex items-center justify-center space-x-1.5 transition-all ${
                loginMode === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Admin Portal</span>
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-5">

            {/* Quick Demo Fill Buttons */}
            {loginMode === 'user' ? (
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Quick Demo Credentials
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('9876543210', 'AgriPass#2026', 'user')}
                    className="bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-950 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all text-left flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Farmer Demo</div>
                      <div className="text-[10px] text-slate-400 font-mono">9876543210</div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">Fill</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFillDemo('9876543211', 'AgriPass#2026', 'user')}
                    className="bg-white hover:bg-emerald-50 border border-slate-200 text-emerald-950 py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all text-left flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Provider Demo</div>
                      <div className="text-[10px] text-slate-400 font-mono">9876543211</div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">Fill</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Platform Owner Credentials
                  </span>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('9030585591', 'AgriAdmin#2026', 'admin')}
                    className="text-[10px] bg-emerald-600 text-white px-3 py-1 rounded-md font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Auto Fill Admin
                  </button>
                </div>
                <p className="text-[11px] text-emerald-800 font-medium">
                  Admin Login Phone: <strong className="font-mono text-emerald-950">9030585591</strong> | Pass: <strong className="font-mono text-emerald-950">AgriAdmin#2026</strong>
                </p>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {loginMode === 'admin' ? 'Admin Phone Number' : 'Phone Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="Enter registered 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-100 transition-all font-medium"
                    data-testid="login-phone-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-100 transition-all font-medium"
                    data-testid="login-password-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 ${
                  loginMode === 'admin'
                    ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
                data-testid="login-submit-btn"
              >
                {submitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{loginMode === 'admin' ? 'Access Admin Dashboard' : 'Sign In to Account'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-500">
              New to {APP_CONFIG.primaryName}?{' '}
              <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                Create an account
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
