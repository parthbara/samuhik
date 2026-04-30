import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import ChatQueue from '../components/inbox/ChatQueue';
import ChatWindow from '../components/inbox/ChatWindow';
import ContextPanel from '../components/inbox/ContextPanel';

const Inbox = () => {
  const { conversations, addMessage, updateConversation } = useData();
  const [activeChatId, setActiveChatId] = useState(null);
  const [platformFilter, setPlatformFilter] = useState("all");

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
    <div className="flex-1 flex overflow-hidden">
      <ChatQueue 
        conversations={conversations}
        activeChatId={activeChatId}
        onSelect={selectConversation}
        platformFilter={platformFilter}
        onPlatformFilterChange={setPlatformFilter}
      />
      
      <ChatWindow 
        conversation={activeConversation}
        onHumanReply={handleHumanReply}
        onTakeOver={handleTakeOver}
      />
      
      <ContextPanel 
        conversation={activeConversation}
      />
    </div>
  );
};

export default Inbox;
