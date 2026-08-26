import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { Bot, ChevronRight, ShieldCheck, ArrowLeft, Sparkles, User, Lock, Moon, Sun, Facebook, Mail, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialIsLogin = queryParams.get('mode') !== 'signup';

  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');
  const [isLogin, setIsLogin] = useState(initialIsLogin);

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 ${isLight ? 'bg-zinc-50' : 'bg-black'}`}>
      {/* Dynamic Background Accents */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 pointer-events-none bg-emerald-500`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 pointer-events-none bg-blue-500`} />
      
      <div className="absolute top-8 right-8 z-20">
        <button onClick={() => setIsLight(!isLight)} className={`p-2 rounded-full border transition-all duration-200 ${isLight ? 'bg-white border-zinc-300 text-zinc-600 hover:text-black hover:shadow-md hover:-translate-y-0.5' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:-translate-y-0.5'}`}>
          {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        <Link to="/" className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors mb-12 ${isLight ? 'text-zinc-500 hover:text-black' : 'text-zinc-500 hover:text-white'}`}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Site
        </Link>

        <div className="mb-10">
          <div className="mb-8">
            <Logo className="scale-110 origin-left" />
          </div>
          <h1 className={`text-3xl font-bold tracking-tight mb-2 ${isLight ? 'text-black' : 'text-white'}`}>
            {isLogin ? 'Access Samuhik.' : 'Join the Platform.'}
          </h1>
          <p className="text-sm text-zinc-500">
            {isLogin ? 'Professional management console for conversational commerce.' : 'Scale your customer engagement with AI-powered tools.'}
          </p>
        </div>

        {error && (
          <div className={`mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 text-[11px] font-medium animate-shake ${isLight ? 'border-red-500/30 bg-red-50 text-red-600' : 'border-red-500/20 bg-red-500/5 text-red-400'}`}>
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1 animate-slide-up">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Full Name</label>
              <div className="relative">
                <Globe className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`} />
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={`w-full border rounded-lg px-10 py-3 text-sm focus:outline-none transition-all ${
                    isLight 
                      ? 'bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10' 
                      : 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5'
                  }`}
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Business Email</label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`w-full border rounded-lg px-10 py-3 text-sm focus:outline-none transition-all ${
                  isLight 
                    ? 'bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10' 
                    : 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5'
                }`}
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Security Key</label>
              {isLogin && <button type="button" className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest">Forgot?</button>}
            </div>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`w-full border rounded-lg px-10 py-3 text-sm focus:outline-none transition-all ${
                  isLight 
                    ? 'bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10' 
                    : 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5'
                }`}
                placeholder="********"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg py-3.5 text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg ${
              isLight 
                ? 'bg-black text-white hover:bg-zinc-800 shadow-black/10' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Processing
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isLogin ? 'Establish Session' : 'Create Account'} <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4">
          <div className="relative flex items-center">
            <div className={`flex-grow border-t ${isLight ? 'border-zinc-200' : 'border-zinc-900'}`}></div>
            <span className={`flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>Or continue with</span>
            <div className={`flex-grow border-t ${isLight ? 'border-zinc-200' : 'border-zinc-900'}`}></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className={`flex items-center justify-center gap-2 py-2.5 border rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${isLight ? 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-black hover:border-zinc-400 shadow-sm' : 'border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white'}`}>
              <Mail className="h-3.5 w-3.5" /> Google
            </button>
            <button className={`flex items-center justify-center gap-2 py-2.5 border rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${isLight ? 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-black hover:border-zinc-400 shadow-sm' : 'border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white'}`}>
              <Facebook className="h-3.5 w-3.5" /> Facebook
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className={`text-xs font-semibold ${isLight ? 'text-zinc-500 hover:text-black' : 'text-zinc-500 hover:text-white'} transition-colors underline underline-offset-4 decoration-emerald-500/30`}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
      
      <div className={`mt-12 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isLight ? 'text-zinc-400' : 'text-zinc-700'}`}>
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Security Protected by Samuhik Infrastructure
      </div>
    </div>
  );
};

export default Login;
