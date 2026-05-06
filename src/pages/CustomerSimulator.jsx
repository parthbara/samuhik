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
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { appendDemoMessage, placeDemoOrder, updateDemoConversation } from '../lib/demoStore';
import { generateAssistantReply } from '../lib/aiAssistant';
import MessageBubble from '../components/inbox/MessageBubble';

const CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'instagram', label: 'Instagram', icon: Camera },
  { id: 'messenger', label: 'Messenger', icon: MessageSquareText },
  { id: 'tiktok', label: 'TikTok', icon: Music2 },
];

const PROMPTS = [
  'BlueCut lens ko price kati ho?',
  '10 pair confirm gardinu, delivery Baluwatar ma ho.',
  'Payment link pathaidinu na.',
  'Yo frame available chha ki chaina?',
  'Refund chahiyo, product damage aayo.',
];

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const CustomerSimulator = () => {
  const { profile, logout } = useAuth();
  const { conversations, inventory, orders, resetDemo } = useData();
  const conversation = conversations[0];
  const [draft, setDraft] = useState('');
  const [channel, setChannel] = useState(conversation?.platform || 'whatsapp');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef(null);

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
    if (conversation?.platform) setChannel(conversation.platform);
  }, [conversation?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [conversation?.messages, isThinking]);

  const selectChannel = (nextChannel) => {
    setChannel(nextChannel);
    if (conversation) {
      updateDemoConversation(conversation.id, { platform: nextChannel });
    }
  };

  const sendCustomerMessage = async (text) => {
    if (!conversation || !text.trim() || isThinking) return;

    const customerMessage = {
      from: 'customer',
      time: now(),
      text: text.trim(),
    };

    const updatedConversations = appendDemoMessage(conversation.id, customerMessage, {
      platform: channel,
      unread: (conversation.unread || 0) + 1,
    });
    const updatedConversation =
      updatedConversations.find((item) => item.id === conversation.id) || {
        ...conversation,
        messages: [...conversation.messages, customerMessage],
      };

    setDraft('');
    setIsThinking(true);

    const result = await generateAssistantReply({
      conversation: updatedConversation,
      inventory,
      orders: orders ? orders.filter((o) => o.customer === conversation.customerName) : [],
    });

    let placedOrder = null;
    if (result.intent === 'order_confirmed' && result.orderData) {
      placedOrder = placeDemoOrder({
        conversation: updatedConversation,
        orderData: result.orderData,
      }).order;
    }

    appendDemoMessage(
      conversation.id,
      {
        from: 'ai',
        time: now(),
        text: result.reply,
      },
      {
        intent: result.intent,
        urgency: result.urgency,
        orderData: result.orderData,
        customerName: result.orderData?.customerName || conversation.customerName,
        phone: result.orderData?.phone || conversation.phone,
        address: result.orderData?.deliveryAddress || conversation.address,
        lastOrderId: placedOrder?.order_id,
        tags: result.intent === 'human_handoff' ? ['Needs Human'] : conversation.tags,
        aiEnabled: result.intent !== 'human_handoff',
      }
    );
    setIsThinking(false);
  };

  if (!conversation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep p-6">
        <div className="rounded-xl border border-subtle bg-surface p-6 text-center">
          <p className="text-sm font-semibold text-primary">No customer demo conversation found.</p>
          <button
            type="button"
            onClick={resetDemo}
            className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white"
          >
            Reset Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-deep text-primary">
      <aside className="hidden w-72 border-r border-subtle bg-surface p-5 md:block">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold">Customer Demo</p>
            <p className="text-xs text-muted">{profile.email}</p>
          </div>
        </div>

        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Channel</p>
        <div className="space-y-2">
          {CHANNELS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectChannel(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
                channel === item.id
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-subtle bg-elevated text-secondary hover:border-medium hover:text-primary'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        <p className="mb-2 mt-6 text-[10px] font-bold uppercase tracking-wider text-muted">Try these</p>
        <p className="mb-2 text-[11px] leading-4 text-muted">
          Use the confirm prompt to create an AI order, then check Vendor Admin Orders and Inventory.
        </p>
        <div className="space-y-2">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setDraft(prompt)}
              className="w-full rounded-lg border border-subtle bg-elevated px-3 py-2 text-left text-xs font-medium text-secondary hover:border-medium hover:text-primary"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsLight(!isLight)}
            className="flex items-center justify-center gap-2 rounded-lg border border-subtle px-3 py-2 text-xs font-bold text-secondary hover:bg-hover"
          >
            {isLight ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            Theme
          </button>
          <button
            type="button"
            onClick={resetDemo}
            className="flex items-center justify-center gap-2 rounded-lg border border-subtle px-3 py-2 text-xs font-bold text-secondary hover:bg-hover"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={logout}
            className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-subtle px-3 py-2 text-xs font-bold text-secondary hover:bg-hover"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-subtle bg-surface px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
              <ChannelIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold">Parth Optical House</h1>
              <p className="truncate text-xs font-medium text-muted">
                Simulating {channelMeta.label} customer chat
              </p>
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-3xl space-y-2">
            {conversation.messages.map((message, index) => (
              <MessageBubble key={`${message.time}-${index}`} message={message} perspective="customer" />
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-subtle bg-surface px-4 py-3 text-sm font-semibold text-secondary">
                  Samuhik AI is replying...
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="border-t border-subtle bg-surface p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-subtle bg-elevated p-2">
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
              placeholder="Type as the customer..."
              className="min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-primary outline-none placeholder:text-muted"
            />
            <button
              type="button"
              disabled={!draft.trim() || isThinking}
              onClick={() => sendCustomerMessage(draft)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:bg-elevated disabled:text-muted"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default CustomerSimulator;
