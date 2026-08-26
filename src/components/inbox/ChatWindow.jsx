import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Bot, Phone, MoreHorizontal, UserRoundCheck, AlertTriangle, Radio } from 'lucide-react';
import MessageBubble from './MessageBubble';
import Avatar from './Avatar';

const ChatWindow = ({ conversation, onHumanReply, onTakeOver, onDemoInbound }) => {
  const [draft, setDraft] = useState("");
  const [aiAutoReplyEnabled, setAiAutoReplyEnabled] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  useEffect(() => {
    setAiAutoReplyEnabled(Boolean(conversation?.aiEnabled));
  }, [conversation?.id, conversation?.aiEnabled]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-deep text-muted p-12 text-center">
        <Bot className="w-12 h-12 mb-4 opacity-10" />
        <p className="text-sm font-medium text-secondary">Select a conversation from the queue to start</p>
      </div>
    );
  }

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onHumanReply(text);
    setDraft("");
  };

  const isAiActive = aiAutoReplyEnabled && conversation.aiEnabled && !conversation.tags.includes("Needs Human");

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-deep border-r border-subtle relative">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-subtle shrink-0 bg-surface sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar conversation={conversation} size="sm" />
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-primary truncate leading-tight">{conversation.customerName}</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-muted font-medium uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDemoInbound}
            className="flex items-center gap-2 rounded-md border border-subtle bg-elevated px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary transition-colors hover:bg-hover hover:text-primary"
          >
            <Radio className="h-3.5 w-3.5" />
            Simulate Inbound
          </button>
          
          <button
            type="button"
            onClick={() => setAiAutoReplyEnabled((current) => !current)}
            className="flex items-center gap-2.5 rounded-md border border-subtle bg-elevated px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary hover:text-primary transition-colors"
          >
            <span>AI Reply</span>
            <div className={`w-8 h-4 rounded-full relative transition-all duration-200 ${aiAutoReplyEnabled ? 'bg-emerald-500' : 'bg-zinc-600'}`}>
              <div className={`absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${aiAutoReplyEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          <div className="h-4 w-[1px] bg-subtle mx-1" />

          <button className="p-2 hover:bg-hover rounded-md text-secondary transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-hover rounded-md text-secondary transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* AI Status Banner */}
      {isAiActive && (
        <div className="px-6 py-2 bg-accent/5 border-b border-accent/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-accent uppercase tracking-tight">
            <Bot className="w-3.5 h-3.5" />
            AI Assistant is managing this chat
          </div>
          <button 
            onClick={onTakeOver}
            className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline underline-offset-4"
          >
            Manual Take Over
          </button>
        </div>
      )}

      {!isAiActive && (
        <div className="px-6 py-2 bg-warm/5 border-b border-warm/10 flex items-center gap-2 text-[11px] font-semibold text-warm uppercase tracking-tight">
          {aiAutoReplyEnabled ? <UserRoundCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {aiAutoReplyEnabled ? 'Human Agent Mode Active' : 'AI Paused'}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth bg-deep">
        <div className="max-w-3xl mx-auto space-y-4">
          {conversation.messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} perspective="admin" />
          ))}
        </div>
      </div>

      {/* Composer */}
      <footer className="p-4 bg-surface border-t border-subtle">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-elevated border border-subtle rounded-lg p-1.5 transition-all focus-within:border-accent">
            <button className="p-2 text-muted hover:text-primary hover:bg-hover rounded-md transition-all">
              <Plus className="w-4 h-4" />
            </button>
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isAiActive ? "AI is active... take over to type" : "Type a message..."}
              disabled={isAiActive}
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2 px-1 resize-none min-h-[38px] max-h-32 text-primary placeholder:text-muted"
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim() || isAiActive}
              className="p-2 bg-accent text-deep rounded-md hover:opacity-90 disabled:opacity-30 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 flex justify-center">
            <p className="text-[10px] text-muted uppercase tracking-widest font-medium">Shift + Enter for new line</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatWindow;
