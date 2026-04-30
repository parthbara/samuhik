import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ALL_TENANTS } from '../lib/mockData';
import ChatQueue from '../components/inbox/ChatQueue';
import ChatWindow from '../components/inbox/ChatWindow';
import ContextPanel from '../components/inbox/ContextPanel';

const RECENT_ORDERS = [
  {
    id: 'ORD-1007',
    customer: 'Walk-in Optical Lead',
    item: 'BlueCut Single Vision Lens',
    status: 'Reserved',
    order_source: 'ai_generated',
  },
  {
    id: 'ORD-1008',
    customer: 'Wholesale Quote',
    item: 'Reading Glasses Bulk Pack',
    status: 'Quoted',
    order_source: 'human_agent',
  },
];

const OrderSourceBadge = ({ source }) => {
  const isAi = source === 'ai_generated';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
      isAi ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
    }`}>
      Source: {isAi ? 'AI Generated' : 'Human Agent'}
    </span>
  );
};

const RecentOrdersPanel = () => (
  <section className="border-t border-slate-200 bg-white px-5 py-4">
    <div className="mb-3 flex items-center justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Recent Orders & Tickets</h3>
        <p className="text-xs text-slate-500">Tracks whether AI or a human resolved the commercial action.</p>
      </div>
    </div>
    <div className="grid gap-3 lg:grid-cols-2">
      {RECENT_ORDERS.map((order) => (
        <div key={order.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-bold text-slate-400">{order.id}</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-900">{order.item}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{order.customer} · {order.status}</p>
            </div>
            <OrderSourceBadge source={order.order_source} />
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Inbox = () => {
  const { conversations, addMessage, updateConversation } = useData();
  const { profile } = useAuth();
  const [activeChatId, setActiveChatId] = useState(null);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [tenantFilter, setTenantFilter] = useState("all");
  const tenants = profile?.role === 'super_admin' ? ALL_TENANTS : [];

  const activeConversation = conversations.find(c => c.id === activeChatId);

  const handleHumanReply = (text) => {
    if (!activeChatId) return;
    
    const newMessage = {
      from: "agent",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    };

    addMessage(activeChatId, newMessage);
    
    // Clear unread count when agent replies
    updateConversation(activeChatId, { unread: 0 });
  };

  const handleTakeOver = () => {
    if (!activeChatId) return;
    
    // Remove "Needs Human" tag and disable AI if take over is clicked
    const newTags = activeConversation.tags.filter(t => t !== "Needs Human");
    updateConversation(activeChatId, { 
      aiEnabled: false, 
      tags: newTags 
    });
  };

  const selectConversation = (id) => {
    setActiveChatId(id);
    // Mark as read when selecting
    updateConversation(id, { unread: 0 });
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <ChatQueue 
        conversations={conversations}
        activeChatId={activeChatId}
        onSelect={selectConversation}
        platformFilter={platformFilter}
        onPlatformFilterChange={setPlatformFilter}
        tenants={tenants}
        tenantFilter={tenantFilter}
        onTenantFilterChange={setTenantFilter}
      />
      
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ChatWindow 
          conversation={activeConversation}
          onHumanReply={handleHumanReply}
          onTakeOver={handleTakeOver}
        />
        <RecentOrdersPanel />
      </div>
      
      <ContextPanel 
        conversation={activeConversation}
      />
    </div>
  );
};

export default Inbox;
