import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ALL_TENANTS } from '../lib/mockData';
import ChatQueue from '../components/inbox/ChatQueue';
import ChatWindow from '../components/inbox/ChatWindow';
import ContextPanel from '../components/inbox/ContextPanel';

const Inbox = () => {
  const { conversations, addMessage, updateConversation, vendors, selectedVendorId, setSelectedVendorId } = useData();
  const { profile } = useAuth();
  const [activeChatId, setActiveChatId] = useState(null);
  const [platformFilter, setPlatformFilter] = useState("all");
  const isHigherAdmin = ['platform_owner', 'super_admin'].includes(profile?.role);

  const activeConversation = (conversations || []).find(c => c.id === activeChatId);

  // Filter conversations locally if needed (though DataContext already handles it)
  const filteredConversations = (conversations || []).filter(c => {
    if (platformFilter !== "all" && c.platform !== platformFilter) return false;
    return true;
  });

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

  const handleDemoInbound = () => {
    if (!activeChatId) return;

    const samples = [
      "Can someone call me? I need help before ordering.",
      "Yo product ko wholesale rate kati ho?",
      "Please send the payment link again.",
      "Instagram bata order confirm garna milcha?",
    ];
    const text = samples[Math.floor(Math.random() * samples.length)];

    addMessage(activeChatId, {
      from: "customer",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    });
    updateConversation(activeChatId, {
      unread: (activeConversation?.unread || 0) + 1,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleTakeOver = () => {
    if (!activeChatId || !activeConversation) return;
    
    // Remove "Needs Human" tag and disable AI if take over is clicked
    const newTags = (activeConversation.tags || []).filter(t => t !== "Needs Human");
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
    <div className="flex flex-col h-full bg-deep overflow-hidden">
      {/* Inbox Switcher Bar */}
      {isHigherAdmin && (
        <div className="shrink-0 flex items-center justify-between px-6 py-3 bg-surface/30 border-b border-subtle">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Platform Context:</span>
             </div>
             <select
               value={selectedVendorId || ''}
               onChange={(e) => setSelectedVendorId(e.target.value || null)}
               className="bg-surface border border-subtle rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary outline-none focus:border-accent transition-all cursor-pointer"
             >
               <option value="">All Vendors (Global)</option>
               {(vendors || []).map(v => (
                 <option key={v.id} value={v.id}>{v.name}</option>
               ))}
             </select>
          </div>
          <div className="hidden md:block text-[9px] font-bold text-muted uppercase tracking-[0.2em]">
            Managing {(vendors || []).length} Business Nodes
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        <ChatQueue 
          conversations={filteredConversations}
          activeChatId={activeChatId}
          onSelect={selectConversation}
          platformFilter={platformFilter}
          onPlatformFilterChange={setPlatformFilter}
          tenants={[]} 
          tenantFilter="all"
          onTenantFilterChange={() => {}}
        />
        
        <ChatWindow 
          conversation={activeConversation}
          onHumanReply={handleHumanReply}
          onTakeOver={handleTakeOver}
          onDemoInbound={handleDemoInbound}
        />
        
        <ContextPanel 
          conversation={activeConversation}
        />
      </div>
    </div>
  );
};

export default Inbox;
