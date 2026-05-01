import React from 'react';
import { Search, Zap, Sparkles, Check } from 'lucide-react';
import Avatar from './Avatar';
import ChannelBadge, { channels } from './ChannelBadge';

const QueueItem = ({ conversation, active, onSelect }) => {
  const meta = channels[conversation.platform] || channels.whatsapp;
  const latestMessage = conversation.messages.at(-1)?.text ?? "";
  const isNeedsHuman = !conversation.aiEnabled || conversation.tags.includes("Needs Human");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-b border-subtle px-4 py-4 text-left transition-all ${
        active ? "bg-accent/5" : "bg-transparent hover:bg-hover"
      }`}
    >
      <div className="relative">
        <Avatar conversation={conversation} />
        <span className="absolute -bottom-1 -right-1">
          <ChannelBadge platform={conversation.platform} size="sm" />
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className={`truncate text-sm font-semibold ${active ? 'text-accent' : 'text-primary group-hover:text-white'}`}>{conversation.customerName}</p>
          <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 sm:inline-flex ${meta.tint}`}>
            {meta.label}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-secondary">{latestMessage}</p>
        <div className="mt-2 flex items-center gap-2">
          {isNeedsHuman && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-warm/20 text-warm ring-1 ring-warm/30">
              <Sparkles className="h-3 w-3" />
              Needs Human
            </span>
          )}
          <span className="truncate text-[11px] text-muted font-mono">{conversation.role}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="text-xs font-medium text-muted">{conversation.time}</span>
        {conversation.unread > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-deep shadow-[0_0_10px_rgba(0,212,170,0.4)]">
            {conversation.unread}
          </span>
        ) : (
          <Check className="h-4 w-4 text-muted" />
        )}
      </div>
    </button>
  );
};

const ChatQueue = ({
  conversations,
  activeChatId,
  onSelect,
  platformFilter,
  onPlatformFilterChange,
  tenants = [],
  tenantFilter = 'all',
  onTenantFilterChange,
}) => {
  const waitingCount = conversations.filter((conversation) => !conversation.aiEnabled || conversation.tags.includes("Needs Human")).length;
  
  const filteredConversations = conversations.filter((conversation) => {
    const matchesPlatform = platformFilter === "all" || conversation.platform === platformFilter;
    const conversationTenant = conversation.tenant_id || conversation.tenantId;
    const matchesTenant = tenantFilter === "all" || conversationTenant === tenantFilter;
    return matchesPlatform && matchesTenant;
  });

  return (
    <aside className="flex h-full w-80 flex-col border-r border-subtle bg-elevated relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none z-0"></div>
      <header className="p-4 border-b border-subtle relative z-10 bg-surface/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 border border-accent/30 text-accent glow-accent">
            <Zap className="h-4 w-4" />
          </div>
          <h1 className="text-lg font-extrabold text-primary">Queue</h1>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input 
            className="w-full pl-9 pr-3 py-2 bg-surface border border-subtle rounded-lg text-sm text-primary placeholder:text-muted outline-none focus-ring transition-all" 
            placeholder="Search customers..." 
          />
        </div>

        <select
          value={platformFilter}
          onChange={(e) => onPlatformFilterChange(e.target.value)}
          className="w-full bg-surface border border-subtle rounded-lg px-3 py-2 text-sm font-medium text-primary outline-none focus-ring transition-all"
        >
          <option value="all">All platforms</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="messenger">Messenger</option>
        </select>

        {tenants.length > 0 && (
          <select
            value={tenantFilter}
            onChange={(event) => onTenantFilterChange?.(event.target.value)}
            className="mt-3 w-full bg-surface border border-subtle rounded-lg px-3 py-2 text-sm font-medium text-primary outline-none focus-ring transition-all"
          >
            <option value="all">All tenants</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
            ))}
          </select>
        )}
      </header>

      <div className="flex items-center justify-between px-4 py-2.5 bg-surface/80 border-b border-subtle relative z-10 backdrop-blur-md">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Conversations</span>
        {waitingCount > 0 && (
          <span className="rounded-full bg-warm/20 px-2 py-0.5 text-[10px] font-bold text-warm border border-warm/30">{waitingCount} Action Required</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto relative z-10">
        {filteredConversations.map((conversation) => (
          <QueueItem
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeChatId}
            onSelect={() => onSelect(conversation.id)}
          />
        ))}
        {filteredConversations.length === 0 && (
          <div className="p-8 text-center text-sm text-muted font-medium">
            No active conversations.
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatQueue;
