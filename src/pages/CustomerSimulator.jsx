import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Camera,
  LogOut,
  MessageCircle,
  MessageSquareText,
  Music2,
  RotateCcw,
  Send,
  Store,
  Sun,
  Moon,
  ArrowLeft,
  Package,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { appendDemoMessage, placeDemoOrder, updateDemoConversation } from '../lib/demoStore';
import { generateAssistantReply } from '../lib/aiAssistant';
import MessageBubble from '../components/inbox/MessageBubble';

const CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-emerald-500/10 text-emerald-500' },
  { id: 'instagram', label: 'Instagram', icon: Camera, color: 'bg-pink-500/10 text-pink-500' },
  { id: 'messenger', label: 'Messenger', icon: MessageSquareText, color: 'bg-blue-500/10 text-blue-500' },
  { id: 'tiktok', label: 'TikTok', icon: Music2, color: 'bg-zinc-800 text-white' },
];

const PROMPT_TEMPLATES = [
  (item) => `${item} price?`,
  (item) => `Order ${item}`,
  (item) => `${item} available?`,
  (item) => `Details on ${item}`,
];
const PROMPT_ICONS = [Package, CheckCircle2, TrendingUp, ShieldCheck];
const FALLBACK_PROMPTS = [
  { text: 'What do you have?', icon: Package },
  { text: 'Price list?', icon: TrendingUp },
  { text: 'Place an order', icon: CheckCircle2 },
  { text: 'Need help', icon: ShieldCheck },
];

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const CustomerSimulator = () => {
  const { profile, logout } = useAuth();
  const { conversations, inventory, orders, vendors, resetDemo, addMessage, updateConversation: updateGlobalConversation } = useData();
  const navigate = useNavigate();

  const tenantId = profile?.tenant_id || null;
  const tenant = vendors?.find(v => v.id === tenantId) || null;
  const simulatorId = `simulator-${tenantId || 'guest'}`;

  // Robustly find the active conversation
  const currentConversation = useMemo(() => {
    const simulatorConv = conversations.find(c => c.id === simulatorId);
    if (simulatorConv) return simulatorConv;
    return conversations[0] || {
      id: simulatorId,
      customerName: 'Guest User',
      messages: [],
      tenant_id: tenantId || 'tenant-001',
      platform: 'whatsapp'
    };
  }, [conversations, simulatorId, tenantId]);

  const dynamicPrompts = useMemo(() => {
    if (!inventory || inventory.length === 0) return FALLBACK_PROMPTS;
    return inventory.slice(0, 4).map((item, i) => ({
      text: PROMPT_TEMPLATES[i](item.item),
      icon: PROMPT_ICONS[i],
    }));
  }, [inventory]);

  const [draft, setDraft] = useState('');
  const [channel, setChannel] = useState(currentConversation.platform || 'whatsapp');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

  // Rate limiting: authenticated users with a tenant are unlimited; guests get 7 messages
  const rateLimitKey = tenantId ? `samuhik_sim_usage_${tenantId}` : 'samuhik_demo_usage';
  const isAuthenticated = !!profile && !!tenantId;
  const [usageCount, setUsageCount] = useState(() => parseInt(localStorage.getItem(rateLimitKey) || '0'));
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const USAGE_LIMIT = isAuthenticated || isLocalhost ? 9999 : 7;
  const isLimitReached = usageCount >= USAGE_LIMIT;

  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('light', isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  const channelMeta = useMemo(
    () => CHANNELS.find((item) => item.id === channel) || CHANNELS[0],
    [channel]
  );
  const ChannelIcon = channelMeta.icon;

  useEffect(() => {
    if (currentConversation.platform) setChannel(currentConversation.platform);
  }, [currentConversation.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [currentConversation.messages, isThinking]);

  const selectChannel = (nextChannel) => {
    setChannel(nextChannel);
    if (currentConversation.id) {
      updateGlobalConversation(currentConversation.id, { platform: nextChannel });
    }
  };

  const sendCustomerMessage = async (text) => {
    if (!text.trim() || isThinking || isLimitReached) return;

    const customerMessage = {
      from: 'customer',
      time: now(),
      text: text.trim(),
    };

    // Fast-path local state update via context — pass tenant_id so new conversations get scoped correctly
    await addMessage(currentConversation.id, customerMessage, { tenant_id: tenantId || 'tenant-001' });
    
    setDraft('');
    setIsThinking(true);

    try {
      const result = await generateAssistantReply({
        conversation: { ...currentConversation, messages: [...currentConversation.messages, customerMessage] },
        inventory,
        orders: orders ? orders.filter((o) => o.customer === currentConversation.customerName) : [],
      });

      // Update usage count
      const nextCount = usageCount + 1;
      setUsageCount(nextCount);
      localStorage.setItem(rateLimitKey, nextCount.toString());

      let placedOrder = null;
      if (result.intent === 'order_confirmed' && result.orderData) {
        placedOrder = placeDemoOrder({
          conversation: currentConversation,
          orderData: result.orderData,
        }).order;
      }

      const aiMessage = {
        from: 'ai',
        time: now(),
        text: result.reply,
      };

      await addMessage(currentConversation.id, aiMessage);

      await updateGlobalConversation(
        currentConversation.id,
        {
          intent: result.intent,
          urgency: result.urgency,
          orderData: result.orderData,
          customerName: result.orderData?.customerName || currentConversation.customerName,
          phone: result.orderData?.phone || currentConversation.phone,
          address: result.orderData?.deliveryAddress || currentConversation.address,
          lastOrderId: placedOrder?.order_id,
          tags: result.intent === 'human_handoff' ? ['Needs Human'] : currentConversation.tags,
          aiEnabled: result.intent !== 'human_handoff',
        }
      );
    } catch (error) {
      console.error("Simulation error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className={`flex h-dvh transition-colors duration-500 ${isLight ? 'bg-zinc-50' : 'bg-deep'} text-primary overflow-hidden`}>
      {/* ── Store & Product Sidebar ── */}
      <aside className={`hidden lg:w-[300px] border-r transition-colors duration-500 ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-surface border-border-subtle'} flex-col md:flex relative z-20`}>
        <div className="p-5 flex flex-col h-full">
          <Link to={profile ? '/inbox' : '/'} className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors mb-6 ${isLight ? 'text-zinc-500 hover:text-black' : 'text-zinc-500 hover:text-white'}`}>
            <ArrowLeft className="h-3.5 w-3.5" /> {profile ? 'Back to Inbox' : 'Back to Site'}
          </Link>

          <div className="mb-8">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg mb-3 shadow-lg shadow-emerald-500/10 ${isLight ? 'bg-black text-white' : 'bg-emerald-500 text-white'}`}>
              <Store className="h-4.5 w-4.5" />
            </div>
            <h1 className={`text-lg font-bold tracking-tight mb-1 ${isLight ? 'text-black' : 'text-white'}`}>{tenant?.name || 'Demo Store'}</h1>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Storefront
            </p>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {!profile && (
              <div className={`p-4 rounded-xl border border-emerald-500/20 ${isLight ? 'bg-emerald-50/50' : 'bg-emerald-500/5'}`}>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Like what you see?</p>
                <Link to="/login" className="block text-center py-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                  Sign Up Now
                </Link>
              </div>
            )}

            <section>
              <h2 className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-3 px-1">Inventory</h2>
              <div className="space-y-2">
                {inventory.slice(0, 5).map((item) => (
                  <div key={item.id} className={`p-2.5 rounded-xl border transition-all ${isLight ? 'bg-zinc-50 border-zinc-100 hover:border-zinc-200' : 'bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-800'}`}>
                    <div className="flex justify-between items-start mb-1">
                       <p className="text-[11px] font-bold truncate pr-2">{item.item}</p>
                       <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>Rs.{item.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-1 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${Math.min(100, (item.stock / 50) * 100)}%` }} 
                          />
                       </div>
                       <span className="text-[8px] font-black text-zinc-600 whitespace-nowrap uppercase tracking-tighter">{item.stock} left</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-3 px-1">Test Prompts</h2>
              <div className="grid grid-cols-2 gap-2">
                {dynamicPrompts.map((prompt) => (
                  <button
                    key={prompt.text}
                    type="button"
                    onClick={() => setDraft(prompt.text)}
                    className={`group rounded-xl border p-2 text-left transition-all flex flex-col gap-2 ${
                      isLight 
                        ? 'border-zinc-200 bg-white hover:border-emerald-500' 
                        : 'border-zinc-800/50 bg-zinc-900/20 hover:border-emerald-500/50 hover:bg-zinc-900/50'
                    }`}
                  >
                    <prompt.icon className={`h-3.5 w-3.5 ${isLight ? 'text-zinc-400' : 'text-zinc-600'} group-hover:text-emerald-500 transition-colors`} />
                    <span className="text-[10px] font-semibold leading-tight line-clamp-2">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className={`pt-5 mt-5 border-t ${isLight ? 'border-zinc-100' : 'border-zinc-900'}`}>
             <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setIsLight(!isLight)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all ${isLight ? 'bg-zinc-50 border-zinc-200 hover:bg-white' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}`}
                >
                  {isLight ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />} Theme
                </button>
                <button
                  onClick={resetDemo}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all ${isLight ? 'bg-zinc-50 border-zinc-200 hover:bg-white' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}`}
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
             </div>
             
             {profile ? (
               <button
                  onClick={logout}
                  className={`w-full flex items-center justify-center gap-2 mt-2 py-2 rounded-lg border border-red-500/20 text-red-500 text-[9px] font-bold uppercase tracking-widest hover:bg-red-500/5 transition-all`}
               >
                 <LogOut className="h-3 w-3" /> Logout
               </button>
             ) : (
               <Link
                  to="/login"
                  className={`w-full flex items-center justify-center gap-2 mt-2 py-2 rounded-lg border border-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-500/5 transition-all`}
               >
                 <Lock className="h-3 w-3" /> Sign In for Full Access
               </Link>
             )}
          </div>
        </div>
      </aside>

      {/* ── Main Experience Area ── */}
      <main className="flex min-w-0 flex-1 flex-col relative bg-transparent">
        {/* Experience Header */}
        <header className={`flex h-16 items-center justify-between border-b px-6 transition-colors duration-500 ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-deep border-zinc-900'}`}>
          <div className="flex items-center gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-inner ${channelMeta.color}`}>
              <ChannelIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                 <h2 className={`font-bold text-sm ${isLight ? 'text-black' : 'text-white'}`}>{channelMeta.label} Live</h2>
                 <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    <span className="h-1 w-1 rounded-full bg-current animate-pulse" /> Active
                 </span>
              </div>
              <p className="text-[10px] font-medium text-zinc-500">Customer interface simulation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 bg-zinc-900/40 p-1 rounded-xl border border-zinc-800/50">
             {CHANNELS.map(c => (
               <button
                key={c.id}
                onClick={() => selectChannel(c.id)}
                title={c.label}
                className={`p-2 rounded-lg transition-all ${channel === c.id ? (isLight ? 'bg-white text-black shadow-sm' : 'bg-zinc-800 text-white shadow-lg') : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 <c.icon className="h-3.5 w-3.5" />
               </button>
             ))}
          </div>
        </header>

        {/* Chat Canvas */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex flex-col items-center mb-10">
               <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold tracking-widest uppercase ${isLight ? 'bg-zinc-100/50 border-zinc-200 text-zinc-500' : 'bg-zinc-900/30 border-zinc-800 text-zinc-500'}`}>
                  <Lock className="h-2.5 w-2.5 text-emerald-500" /> Secure Business Session
               </div>
               <p className="text-[9px] text-zinc-600 mt-2 font-bold uppercase tracking-tighter">Verified by Samuhik Infrastructure</p>
            </div>

            {currentConversation.messages.map((message, index) => (
              <MessageBubble key={`${message.time}-${index}`} message={message} perspective="customer" />
            ))}
            
            {isThinking && (
              <div className="flex justify-start">
                <div className={`rounded-2xl border px-5 py-4 text-[11px] font-bold transition-all shadow-sm ${isLight ? 'bg-white border-zinc-100 text-zinc-600' : 'bg-zinc-950 border-zinc-900 text-zinc-400'}`}>
                   <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                         <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0s' }} />
                         <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                         <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                      AI is formulating response...
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <footer className={`p-6 transition-colors duration-500 ${isLight ? 'bg-zinc-50' : 'bg-deep'}`}>
          <div className={`mx-auto max-w-2xl flex flex-col gap-3`}>
            {isLimitReached && (
              <div className="mb-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center animate-slide-up">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 mx-auto mb-3">
                   <Lock className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                  Experience Limit Reached
                </p>
                <p className="text-[13px] text-zinc-500 mt-2 leading-relaxed">
                  You've reached the 7-message demo limit. To continue testing with your own store data or to get more credits, please <strong className="text-emerald-500">contact us</strong> for a full account.
                </p>
                <Link to="/login" className="inline-block mt-4 px-6 py-2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all">
                  Get Full Access
                </Link>
              </div>
            )}
            <div className={`flex items-end gap-3 rounded-2xl border p-2 shadow-2xl transition-all ${isLimitReached ? 'opacity-50 grayscale pointer-events-none' : ''} ${isLight ? 'bg-white border-zinc-200 shadow-zinc-200/40' : 'bg-surface border-border-subtle shadow-black'}`}>
              <textarea
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendCustomerMessage(draft);
                  }
                }}
                disabled={isLimitReached}
                placeholder={isLimitReached ? "Limit reached..." : `Message on ${channelMeta.label}...`}
                className="min-h-[44px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-primary outline-none placeholder:text-zinc-600 font-medium"
              />
              <button
                type="button"
                disabled={!draft.trim() || isThinking || isLimitReached}
                onClick={() => sendCustomerMessage(draft)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all shadow-lg ${
                  !draft.trim() || isThinking || isLimitReached
                    ? 'bg-zinc-900 text-zinc-700'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20 active:scale-95'
                }`}
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
          <div className="flex justify-center items-center gap-4 mt-4 opacity-40">
             <div className="h-px w-8 bg-zinc-700" />
             <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                Samuhik AI
             </p>
             <div className="h-px w-8 bg-zinc-700" />
          </div>
        </footer>
      </main>
    </div>
  );
};

export default CustomerSimulator;
