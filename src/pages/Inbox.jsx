import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ALL_TENANTS } from '../lib/mockData';
import ChatQueue from '../components/inbox/ChatQueue';
import ChatWindow from '../components/inbox/ChatWindow';
import ContextPanel from '../components/inbox/ContextPanel';

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
    <div className="flex min-h-0 flex-1 overflow-hidden bg-deep relative">
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
  );
};

export default Inbox;
