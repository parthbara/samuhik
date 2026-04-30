import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Bot } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { email: 'parth@samuhik.ai', password: 'demo1234', label: 'Super Admin', color: 'bg-purple-500' },
  { email: 'admin@demo.com', password: 'demo1234', label: 'Store Admin', color: 'bg-indigo-500' },
  { email: 'agent@demo.com', password: 'demo1234', label: 'Agent', color: 'bg-slate-500' },
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
            <Bot className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Samuhik AI</h1>
        <p className="text-slate-500 text-center mb-8">Sign in to manage your conversations</p>
        
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="admin@samuhik.ai"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg shadow-lg shadow-indigo-100 transition-all transform active:scale-[0.98] mt-4 disabled:bg-slate-400"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Quick-Select */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">Demo Accounts</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                key={acct.email}
                type="button"
                onClick={() => handleQuickLogin(acct)}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all group text-left"
              >
                <span className={`w-2 h-2 rounded-full ${acct.color}`}></span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700">{acct.email}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-500">{acct.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-3">Password for all: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">demo1234</code></p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Secure Authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
