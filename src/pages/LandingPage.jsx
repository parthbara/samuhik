import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo, { LogoIcon } from '../components/Logo';
import {
  ArrowRight, Zap, MessageSquare, MessageCircle, BarChart3, Shield, Globe,
  Bot, Star, Users, Clock, Play, Inbox, CheckCircle, Instagram,
  TrendingUp, Headphones, Package, Send, Moon, Sun
} from 'lucide-react';
import './landing.css';

/* ───── Floating chat bubbles (decorative) ───── */
const FLOAT_MSGS = [
  { text: 'Yo frame XL ma cha?', from: 'customer', x: '8%', y: '32%', delay: '0s' },
  { text: 'Ji available cha! Rs. 8,500 🔥', from: 'ai', x: '78%', y: '28%', delay: '0.4s' },
  { text: 'Order confirm gardinuhos', from: 'customer', x: '85%', y: '52%', delay: '0.8s' },
  { text: '✅ Order #1042 placed!', from: 'ai', x: '5%', y: '58%', delay: '1.2s' },
];

/* ───── Data ───── */
const FEATURES = [
  { icon: LogoIcon, title: 'AI That Sells', desc: 'Your AI agent handles inquiries, takes orders, and processes payments — in Nepali, English, or both. 24/7.' },
  { icon: Inbox, title: 'One Inbox For Everything', desc: 'WhatsApp, Instagram, Messenger, TikTok — every customer message lands in a single, unified dashboard.' },
  { icon: TrendingUp, title: 'Revenue Analytics', desc: 'Track what sells, which channels convert, and where your customers drop off — in real time.' },
  { icon: Package, title: 'Inventory Sync', desc: 'Connected to your POS. Stock updates instantly. Never oversell or miss a restock again.' },
  { icon: Headphones, title: 'Smart Escalation', desc: 'AI handles 80% automatically. When a human is needed, it routes to the right agent with full context.' },
  { icon: Shield, title: 'Multi-tenant & Secure', desc: 'Each business gets isolated data, custom AI prompts, and role-based access. Enterprise-grade from day one.' },
];

const STATS = [
  { num: '5x', label: 'Faster replies' },
  { num: '80%', label: 'Auto-resolved' },
  { num: '3min', label: 'Setup time' },
  { num: '24/7', label: 'Always on' },
];

const PROOF = [
  { quote: "We cut our response team from 10 to 2 and tripled our monthly volume. Samuhik pays for itself.", author: "Anish Shrestha", role: "Director, RetailNP" },
  { quote: "Customers don't even realize they're talking to an AI. It just works — in Nepali, in context, every time.", author: "Sneha Kapali", role: "Founder, Kapali Eyewear" },
];

const INDUSTRIES = [
  {
    id: 'retail',
    name: 'Retail & Fashion',
    tagline: 'Scale your sales without scaling your staff.',
    desc: 'Automate size inquiries, stock checks, and order confirmation. Our AI understands "kasto size cha?" and "yo color ma available cha?" just like your best sales rep.',
    accent: 'from-emerald-400 to-teal-500',
    icon: Package
  },
  {
    id: 'fnb',
    name: 'Food & Beverage',
    tagline: 'Never miss a reservation or order again.',
    desc: 'From table bookings to delivery orders. AI handles the peak hour rush across all channels, letting your kitchen focus on the food.',
    accent: 'from-orange-400 to-red-500',
    icon: Zap
  },
  {
    id: 'services',
    name: 'Professional Services',
    tagline: 'Lead generation on autopilot.',
    desc: 'Qualify leads, book appointments, and answer FAQs 24/7. Whether you are a clinic, agency, or consultancy, stay responsive even while you sleep.',
    accent: 'from-blue-400 to-indigo-500',
    icon: Globe
  }
];

/* ───── Hooks ───── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('visible'); io.unobserve(el); } }, { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
function Reveal({ className = '', delay = '', children }) {
  const ref = useReveal();
  return <div ref={ref} className={`anim-enter ${delay} ${className}`}>{children}</div>;
}
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return y;
}

/* ───── Live conversation demo ───── */
function LiveDemo() {
  const [step, setStep] = useState(0);
  const msgs = [
    { from: 'customer', text: 'Hi, yo black sneakers size 42 ma cha?' },
    { from: 'ai', text: 'Namaste! Hajur 42 size ma black available cha. Price Rs. 3,500 ho la. Kathmandu bhitra delivery free huncha 🚚' },
    { from: 'customer', text: 'Color haru k k cha aru?' },
    { from: 'ai', text: 'Black, White ani Navy Blue cha. Sabai 42 size ma huncha. Order gardinu ho?' },
    { from: 'customer', text: 'Black wala ekta gardinu. Baneshwor ma delivery.' },
    { from: 'ai', text: 'Hajur huncha, Order #ORD-1088 fixed bhayo la. Black sneakers, size 42 → Baneshwor. Total Rs. 3,500 ho.' },
  ];
  useEffect(() => {
    if (step >= msgs.length) return;
    const t = setTimeout(() => setStep(s => s + 1), step === 0 ? 1500 : 2200);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="live-demo">
      <div className="live-demo-header">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">AG</div>
          <div>
            <p className="text-sm font-semibold text-white">Aarav Gurung</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />Instagram • Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
          AI Active <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        </div>
      </div>
      <div className="live-demo-body">
        {msgs.slice(0, step).map((m, i) => (
          <div key={i} className={`live-msg ${m.from === 'customer' ? 'live-msg-in' : 'live-msg-out'} ${i === step - 1 ? 'live-msg-new' : ''}`}>
            {m.from === 'ai' && <span className="text-[9px] font-bold uppercase text-emerald-400/70 flex items-center gap-1 mb-1"><LogoIcon size={12} />Samuhik AI</span>}
            <p className="text-[13px] leading-relaxed">{m.text}</p>
          </div>
        ))}
        {step < msgs.length && (
          <div className="live-typing">
            <span /><span /><span />
          </div>
        )}
      </div>
      <div className="live-demo-footer">
        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-800 flex-1">
          <span className="text-xs text-zinc-600">Type a message...</span>
        </div>
        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0">
          <Send className="h-3.5 w-3.5 text-black" />
        </div>
      </div>
    </div>
  );
}

/* ───── Channel logos (Infinite Slider) ───── */
function ChannelSlider() {
  const SLIDE_LOGOS = [
    { name: 'WhatsApp', icon: MessageCircle },
    { name: 'Instagram', icon: Instagram },
    { name: 'Messenger', icon: MessageSquare },
    { name: 'TikTok', icon: Bot },
    { name: 'Email', icon: Globe },
    { name: 'POS', icon: Package },
  ];
  
  const doubledLogos = [...SLIDE_LOGOS, ...SLIDE_LOGOS, ...SLIDE_LOGOS, ...SLIDE_LOGOS];

  return (
    <section className="py-10 border-y border-white/5 bg-black/40 backdrop-blur-sm relative z-10 overflow-hidden">
      <div className="infinite-slider-container">
        <div className="infinite-slider-track">
          {doubledLogos.map((l, i) => (
            <div key={i} className="slider-item">
               <div className="flex items-center gap-3 group cursor-default">
                  <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                     <l.icon className="h-4 w-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors">{l.name}</span>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───── Industry Showcase Slider ───── */
function IndustryShowcase() {
  const [active, setActive] = useState(0);
  
  return (
    <section className="py-24 sm:py-32 bg-black relative z-10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4">Enterprise Versatility</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">One platform. <br />Every industry.</h2>
            </Reveal>
            
            <div className="space-y-4">
              {INDUSTRIES.map((ind, i) => (
                <Reveal key={ind.id} delay={`d${i+1}`}>
                  <button 
                    onClick={() => setActive(i)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                      active === i 
                        ? 'bg-zinc-900 border-white/10 shadow-2xl shadow-emerald-500/5' 
                        : 'bg-transparent border-transparent hover:bg-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${ind.accent} text-white shadow-lg`}>
                        <ind.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{ind.name}</h3>
                        <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">{ind.tagline}</p>
                      </div>
                    </div>
                    {active === i && (
                      <p className="mt-4 text-sm text-zinc-400 leading-relaxed animate-fade-in">
                        {ind.desc}
                      </p>
                    )}
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
          
          <div className="relative aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-[100px] opacity-30" />
            <div className="relative w-full max-w-md animate-float">
              {INDUSTRIES.map((ind, i) => (
                <div 
                  key={ind.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                    active === i 
                      ? 'opacity-100 translate-x-0 scale-100 rotate-0' 
                      : 'opacity-0 translate-x-12 scale-95 rotate-3 pointer-events-none'
                  }`}
                >
                  <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl h-full flex flex-col justify-between">
                     <div className="flex justify-between items-start mb-8">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${ind.accent} text-white`}>
                          <ind.icon className="h-7 w-7" />
                        </div>
                        <div className="flex gap-2">
                           <div className="h-2 w-2 rounded-full bg-red-500/50" />
                           <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                           <div className="h-2 w-2 rounded-full bg-green-500/50" />
                        </div>
                     </div>
                     <div className="space-y-4 flex-1">
                        <div className="h-4 w-3/4 bg-white/5 rounded-full" />
                        <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                        <div className="h-24 w-full bg-white/5 rounded-2xl" />
                        <div className="flex gap-3">
                           <div className="h-10 w-10 rounded-full bg-white/5" />
                           <div className="space-y-2 flex-1 pt-1">
                              <div className="h-3 w-1/3 bg-white/10 rounded-full" />
                              <div className="h-3 w-full bg-white/5 rounded-full" />
                           </div>
                        </div>
                     </div>
                     <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Automation</span>
                        <div className="flex items-center gap-2">
                           <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[10px] font-bold text-emerald-500">SAMUHIK AI</span>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════ LANDING PAGE ═══════ */
export default function LandingPage() {
  const scrollY = useScrollY();
  const [scrolled, setScrolled] = useState(false);
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  useEffect(() => setScrolled(scrollY > 60), [scrollY]);

  const heroImgY = scrollY * 0.3;
  const heroImgOpacity = Math.max(0, 0.18 - scrollY * 0.0003);

  return (
    <div className={`landing-page ${isLight ? 'landing-light' : ''}`}>
      {/* ── Hero background: real app screenshot, faded ── */}
      <div className="hero-screenshot-wrap" style={{ transform: `translateY(${heroImgY}px)`, opacity: heroImgOpacity }}>
        <img src="/app-hero.png" alt="" className="hero-screenshot-img" />
      </div>

      {/* ── Floating chat bubbles ── */}
      <div className="floating-bubbles" aria-hidden="true">
        {FLOAT_MSGS.map((m, i) => (
          <div key={i} className={`float-bubble ${m.from}`} style={{ left: m.x, top: m.y, animationDelay: m.delay }}>
            {m.text}
          </div>
        ))}
      </div>

      {/* ── Nav ── */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <Link to="/" className="flex items-center">
            <Logo className="scale-90 origin-left" />
          </Link>
          <div className="hidden items-center gap-10 md:flex">
            {['Features', 'How it Works', 'Pricing'].map(t => (
              <a key={t} href={`#${t.toLowerCase().replace(/\s+/g, '-')}`} className="text-[11px] font-semibold text-zinc-400 transition-colors hover:text-white">{t}</a>
            ))}
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => setIsLight(!isLight)} className="p-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors">
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <Link to="/login" className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors">Log In</Link>
            <Link to="/login?mode=signup" className="btn-hero btn-hero-primary !py-2.5 !px-6 text-[11px]">Sign Up Now</Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="hero-section" id="demo-section">
        <div className="mx-auto max-w-7xl px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Reveal delay="d1">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 mb-8 backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <span className="text-[11px] font-semibold text-zinc-300">AI-powered customer inbox for Nepal</span>
                </div>
              </Reveal>
              <Reveal delay="d2">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-white">
                  Turn every <br />message into <br /><span className="gradient-hero">revenue.</span>
                </h1>
              </Reveal>
              <Reveal delay="d3">
                <p className="mt-7 max-w-lg text-lg leading-relaxed text-zinc-400">
                  Your AI assistant handles customer inquiries, takes orders, and manages follow-ups across WhatsApp, Instagram & Messenger — so your team can focus on growing the business.
                </p>
              </Reveal>
              <Reveal delay="d4" className="mt-10 flex flex-wrap items-center gap-4">
                <Link to="/login?mode=signup" className="btn-hero btn-hero-primary group">
                  Sign Up Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/demo" className="btn-hero btn-hero-ghost">
                   Try Live Demo
                </Link>
              </Reveal>
              <Reveal delay="d5">
                <div className="mt-10 flex items-center gap-6 text-zinc-500">
                  <div className="flex items-center gap-1.5 text-xs font-medium"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> 3-min setup</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Works in Nepali</div>
                </div>
              </Reveal>
            </div>
            {/* Live Demo Panel */}
            <Reveal delay="d3" className="block lg:block">
              <div id="live-demo-section">
                <LiveDemo />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Channel logos (Infinite) ── */}
      <div className="relative mt-24 mb-16">
        <ChannelSlider />
      </div>

      {/* ── App screenshot showcase ── */}
      <section className="py-24 sm:py-32 relative z-10 bg-gradient-to-b from-black via-zinc-950 to-zinc-950">
        <div className="mx-auto max-w-7xl px-8">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4">The Dashboard</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Everything in one place.</h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">A real-time command center where AI handles conversations, you manage orders, and customers get instant responses.</p>
          </Reveal>
          <Reveal delay="d2">
            <div className="app-preview-wrapper mx-auto max-w-6xl" style={{ transform: `perspective(2000px) rotateX(${Math.max(0, 2 - scrollY * 0.003)}deg)` }}>
              <div className="app-preview-bar">
                <span className="dash-dot bg-red-500/70" /><span className="dash-dot bg-yellow-500/70" /><span className="dash-dot bg-green-500/70" />
                <div className="ml-auto text-[10px] font-bold uppercase tracking-widest text-zinc-600">samuhik.ai</div>
              </div>
              <div className="app-preview-body">
                <img src="/app-hero.png" alt="Samuhik AI Dashboard — unified inbox with live conversations" className="w-full h-auto" loading="lazy" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 sm:py-36 bg-zinc-950 relative z-10">
        <div className="mx-auto max-w-7xl px-8">
          <Reveal className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-xl mx-auto">Built for businesses that sell through chat.</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={`d${(i % 3) + 1}`}>
                <div className="feat-card">
                  <div className="feat-icon"><f.icon className="h-5 w-5" /></div>
                  <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-28 sm:py-36 border-t border-white/5 bg-black relative z-10">
        <div className="mx-auto max-w-7xl px-8">
          <Reveal className="mb-16 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Live in three steps.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '01', t: 'Connect your channels', d: 'Link WhatsApp, Instagram, or Messenger. Takes 2 minutes. No code needed.' },
              { n: '02', t: 'Train your AI', d: 'Add your product catalog, set your tone, and customize AI behavior for your brand.' },
              { n: '03', t: 'Watch it sell', d: 'AI handles inquiries, takes orders, and escalates only when needed. You grow.' },
            ].map((s, i) => (
              <Reveal key={i} delay={`d${i + 1}`}>
                <div className="step-card group">
                  <div className="step-num">{s.n}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.t}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-20 border-y border-white/5 bg-zinc-950 relative z-10">
        <div className="mx-auto max-w-5xl px-8">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={i} delay={`d${i + 1}`} className="text-center">
                <p className="stat-num">{s.num}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="py-28 sm:py-36 bg-black relative z-10">
        <div className="mx-auto max-w-7xl px-8">
          <Reveal className="mb-14 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4">Loved by teams</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Don't take our word for it.</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            {PROOF.map((t, i) => (
              <Reveal key={i} delay={`d${i + 1}`}>
                <div className="testimonial-card group">
                  <div className="flex gap-1 mb-5">{[1,2,3,4,5].map(n => <Star key={n} className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />)}</div>
                  <p className="text-lg font-medium leading-relaxed text-white mb-8">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white">{t.author.split(' ').map(w => w[0]).join('')}</div>
                    <div><p className="text-sm font-bold text-white">{t.author}</p><p className="text-[11px] text-zinc-500 mt-0.5">{t.role}</p></div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industry Showcase ── */}
      <IndustryShowcase />

      {/* ── CTA ── */}
      <section className="py-32 sm:py-40 bg-zinc-950 relative z-10">
        <div className="mx-auto max-w-4xl px-8">
          <Reveal>
            <div className="cta-box text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 mb-8">
                <Zap className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[11px] font-semibold text-emerald-400">Scale your business with Samuhik AI</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">Ready to sell smarter?</h2>
              <p className="mx-auto mt-5 max-w-lg text-zinc-400 text-base leading-relaxed">
                Join hundreds of Nepali businesses already using Samuhik to convert chats into revenue. Setup takes minutes.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/login?mode=signup" className="btn-hero btn-hero-cta group">Sign Up Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                <Link to="/demo" className="btn-hero btn-hero-ghost">Try Live Demo</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-16 bg-black relative z-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-8 sm:flex-row">
          <div className="flex items-center">
            <Logo className="scale-75 origin-left" />
          </div>
          <p className="text-[11px] text-zinc-600 font-medium">Built with precision in Kathmandu, Nepal.</p>
          <p className="text-[11px] text-zinc-700">© 2026 Samuhik AI</p>
        </div>
      </footer>
    </div>
  );
}
