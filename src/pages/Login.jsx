import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, ChevronRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DEMO_ACCOUNTS = [
  { email: 'admin@demo.com', password: 'demo1234', label: 'Vendor Admin', color: 'bg-blue-700' },
  { email: 'customer@demo.com', password: 'demo1234', label: 'Customer Tab', color: 'bg-sky-500' },
  { email: 'agent@demo.com', password: 'demo1234', label: 'Agent', color: 'bg-slate-500' },
  { email: 'parth@samuhik.ai', password: 'demo1234', label: 'Super Admin', color: 'bg-slate-950' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();
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
    <div className="flex min-h-screen items-center justify-center bg-deep p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-700 text-white">
            <Bot className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-primary">Samuhik AI</h1>
          <p className="mt-2 text-sm font-medium text-secondary">Omnichannel demo control room</p>
          <p className="mt-2 max-w-sm text-center text-xs leading-5 text-muted">
            Use Vendor Admin in one tab and Customer Tab in another tab to watch AI orders reserve stock.
          </p>
        </div>

        <div className="rounded-xl border border-subtle bg-surface p-6">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-subtle bg-elevated px-4 py-3 font-medium text-primary outline-none placeholder:text-muted focus-ring"
                placeholder="admin@demo.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-subtle bg-elevated px-4 py-3 font-medium tracking-widest text-primary outline-none placeholder:text-muted focus-ring"
                placeholder="********"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-700 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ChevronRight className="h-4 w-4" />}
              </span>
            </button>
          </form>

          <div className="mt-7 border-t border-subtle pt-5">
            <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted">
              Demo Accounts
            </p>
            <div className="grid gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleQuickLogin(account)}
                  className="group flex w-full items-center justify-between rounded-lg border border-subtle bg-elevated px-4 py-3 transition-colors hover:border-medium hover:bg-hover"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${account.color}`} />
                    <span className="truncate text-sm font-semibold text-secondary group-hover:text-primary">
                      {account.email}
                    </span>
                  </span>
                  <span className="ml-3 shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted group-hover:text-accent">
                    {account.label}
                  </span>
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
