import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Bot, Phone, MoreHorizontal, UserRoundCheck, AlertTriangle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import Avatar from './Avatar';

const ChatWindow = ({ conversation, onHumanReply, onTakeOver }) => {
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
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <Bot className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">Select a conversation to start</p>
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
    <div className="flex-1 flex flex-col min-w-0 bg-white shadow-sm border-r border-slate-200">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar conversation={conversation} size="sm" />
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 truncate leading-tight">{conversation.customerName}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
            <span>AI Auto-Reply</span>
            <button
              type="button"
              onClick={() => setAiAutoReplyEnabled((current) => !current)}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                aiAutoReplyEnabled ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
              aria-pressed={aiAutoReplyEnabled}
              aria-label="Toggle AI Auto-Reply"
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  aiAutoReplyEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* AI Status Banner */}
      {isAiActive && (
        <div className="px-6 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
            <Bot className="w-4 h-4" />
            AI Assistant is currently handling this conversation
          </div>
          <button 
            onClick={onTakeOver}
            className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 underline decoration-2 underline-offset-4"
          >
            Take Over
          </button>
        </div>
      )}

      {!isAiActive && (
        <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs font-semibold text-amber-700">
          {aiAutoReplyEnabled ? <UserRoundCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {aiAutoReplyEnabled ? 'Manual Mode: You are responding as a human agent' : 'AI Paused - Human Routing Active'}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <div className="max-w-3xl mx-auto space-y-2">
          {conversation.messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} perspective="admin" />
          ))}
        </div>
      </div>

      {/* Composer */}
      <footer className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 focus-within:bg-white">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
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
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 resize-none min-h-[40px] max-h-32 text-slate-900 placeholder:text-slate-400"
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim() || isAiActive}
              className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none transition-all"
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
