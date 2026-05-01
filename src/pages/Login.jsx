import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Bot, Sparkles, ChevronRight } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { email: 'parth@samuhik.ai', password: 'demo1234', label: 'Super Admin', color: 'bg-accent' },
  { email: 'admin@demo.com', password: 'demo1234', label: 'Store Admin', color: 'bg-indigo-400' },
  { email: 'agent@demo.com', password: 'demo1234', label: 'Agent', color: 'bg-slate-400' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-deep overflow-hidden">
      {/* Cinematic background elements */}
      <div className="absolute inset-0 mesh-gradient opacity-40 animate-gradient-shift"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-float"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

      <div className="relative w-full max-w-md">
        {/* Logo area */}
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-accent filter blur-xl opacity-40 animate-pulse-glow rounded-full"></div>
            <div className="relative w-16 h-16 bg-surface border border-subtle rounded-2xl flex items-center justify-center shadow-2xl glass-card">
              <Bot className="w-8 h-8 text-accent" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-warm animate-bounce" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-primary">
            Samuhik <span className="gradient-text">AI</span>
          </h1>
          <p className="mt-2 text-sm text-secondary font-medium">Omnichannel Commerce Platform</p>
        </div>
        
        {/* Login Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl animate-slide-up relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"></div>
          
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-subtle text-primary px-4 py-3 rounded-xl focus-ring transition-all outline-none font-medium placeholder:text-muted"
                placeholder="admin@samuhik.ai"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted">Password</label>
                <a href="#" className="text-xs font-semibold text-accent hover:text-accent-dim transition-colors">Forgot?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-subtle text-primary px-4 py-3 rounded-xl focus-ring transition-all outline-none font-medium placeholder:text-muted tracking-widest"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-white text-deep font-bold text-sm py-3.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-2">
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          {/* Demo Credentials Quick-Select */}
          <div className="mt-8 pt-6 border-t border-subtle">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-4 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-border-subtle"></span>
              Demo Accounts
              <span className="h-px w-8 bg-border-subtle"></span>
            </p>
            <div className="grid gap-2">
              {DEMO_ACCOUNTS.map((acct) => (
                <button
                  key={acct.email}
                  type="button"
                  onClick={() => handleQuickLogin(acct)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-elevated border border-subtle hover:border-medium rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${acct.color} shadow-[0_0_8px_currentColor] opacity-80 group-hover:opacity-100 transition-opacity`}></span>
                    <span className="text-sm font-semibold text-secondary group-hover:text-primary transition-colors">{acct.email}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted group-hover:text-accent transition-colors">{acct.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
