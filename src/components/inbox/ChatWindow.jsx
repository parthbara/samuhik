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
      <div className="flex-1 flex flex-col items-center justify-center bg-deep text-muted relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-10"></div>
        <Bot className="w-16 h-16 mb-6 opacity-20 filter drop-shadow-[0_0_15px_rgba(0,212,170,0.5)]" />
        <p className="text-lg font-medium text-secondary relative z-10">Select a conversation to start</p>
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
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0"></div>
      
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-subtle shrink-0 bg-surface/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar conversation={conversation} size="sm" />
          <div className="min-w-0">
            <h3 className="font-bold text-primary truncate leading-tight">{conversation.customerName}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></span>
              Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDemoInbound}
            className="flex items-center gap-2 rounded-lg border border-subtle bg-elevated px-3 py-2 text-xs font-bold text-secondary transition-colors hover:bg-hover hover:text-primary"
          >
            <Radio className="h-4 w-4" />
            Simulate Inbound
          </button>
          <button
            type="button"
            onClick={() => setAiAutoReplyEnabled((current) => !current)}
            className="flex items-center gap-2 rounded-full border border-subtle bg-elevated px-3 py-1.5 text-xs font-bold text-secondary hover:text-primary transition-colors"
          >
            <span>AI Auto-Reply</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${aiAutoReplyEnabled ? 'bg-accent/20 border border-accent/30' : 'bg-surface border border-subtle'}`}>
              <div className={`absolute top-[1px] left-[1px] w-[12px] h-[12px] rounded-full transition-transform ${aiAutoReplyEnabled ? 'translate-x-4 bg-accent' : 'bg-secondary'}`} />
            </div>
          </button>
          <button className="p-2 hover:bg-hover rounded-lg text-secondary transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-hover rounded-lg text-secondary transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* AI Status Banner */}
      {isAiActive && (
        <div className="px-6 py-2.5 bg-accent/10 border-b border-accent/20 flex items-center justify-between backdrop-blur-md relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-accent">
            <Bot className="w-4 h-4" />
            AI Assistant is handling this conversation
          </div>
          <button 
            onClick={onTakeOver}
            className="text-[11px] font-bold uppercase tracking-wider text-accent hover:text-white transition-colors underline decoration-2 underline-offset-4"
          >
            Take Over
          </button>
        </div>
      )}

      {!isAiActive && (
        <div className="px-6 py-2.5 bg-warm/10 border-b border-warm/20 flex items-center gap-2 text-xs font-bold text-warm backdrop-blur-md relative z-10">
          {aiAutoReplyEnabled ? <UserRoundCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {aiAutoReplyEnabled ? 'Manual Mode: You are responding as a human agent' : 'AI Paused - Human Routing Active'}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth relative z-10">
        <div className="max-w-3xl mx-auto space-y-2">
          {conversation.messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} perspective="admin" />
          ))}
        </div>
      </div>

      {/* Composer */}
      <footer className="p-4 bg-surface/90 backdrop-blur-xl border-t border-subtle relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-elevated border border-subtle rounded-2xl p-2 transition-all focus-within:border-accent focus-within:shadow-[0_0_15px_rgba(0,212,170,0.1)]">
            <button className="p-2 text-secondary hover:text-primary hover:bg-hover rounded-xl transition-all">
              <Plus className="w-5 h-5" />
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
              placeholder={isAiActive ? "AI is active... take over to type" : "Type your message..."}
              disabled={isAiActive}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 resize-none min-h-[40px] max-h-32 text-primary placeholder:text-muted"
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim() || isAiActive}
              className="p-2.5 bg-accent text-deep rounded-xl hover:bg-accent-dim disabled:bg-surface disabled:text-muted disabled:border disabled:border-subtle transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatWindow;
