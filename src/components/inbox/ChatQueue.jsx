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
      className={`group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-3 px-4 py-4 text-left transition-colors border-b border-subtle ${
        active ? 'bg-elevated border-l-2 border-l-accent' : 'bg-transparent border-l-2 border-l-transparent hover:bg-hover'
      }`}
    >
      <div className="relative">
        <Avatar conversation={conversation} />
        <span className="absolute -bottom-1 -right-1">
          <ChannelBadge platform={conversation.platform} size="sm" />
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className={`truncate text-sm font-semibold ${active ? 'text-primary' : 'text-secondary group-hover:text-primary'}`}>
            {conversation.customerName}
          </p>
          <span className="text-[10px] font-medium text-muted tabular-nums shrink-0">
            {conversation.time}
          </span>
        </div>
        <p className="mt-1 truncate text-xs text-muted leading-relaxed">{latestMessage}</p>
        
        <div className="mt-2.5 flex items-center gap-2">
          {isNeedsHuman && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 border border-amber-500/20">
              <Sparkles className="h-2.5 w-2.5" />
              Action Required
            </span>
          )}
          <span className="truncate text-[9px] font-bold uppercase tracking-widest text-muted/60">{conversation.role}</span>
        </div>
      </div>

      <div className="flex flex-col items-end justify-center">
        {conversation.unread > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-deep">
            {conversation.unread}
          </span>
        ) : (
          <Check className="h-3.5 w-3.5 text-muted/40" />
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
  const waitingCount = (conversations || []).filter((conversation) => !conversation.aiEnabled || (conversation.tags || []).includes("Needs Human")).length;
  
  const filteredConversations = (conversations || []).filter((conversation) => {
    const matchesPlatform = platformFilter === "all" || conversation.platform === platformFilter;
    const conversationTenant = conversation.tenant_id || conversation.tenantId;
    const matchesTenant = tenantFilter === "all" || conversationTenant === tenantFilter;
    return matchesPlatform && matchesTenant;
  });

  return (
    <aside className="flex h-full w-80 flex-col overflow-hidden bg-surface border-r border-subtle">
      <header className="p-4 border-b border-subtle bg-surface">
        <div className="flex items-center gap-2.5 mb-5">
          <Zap className="h-4 w-4 text-primary shrink-0" />
          <h1 className="text-sm font-bold uppercase tracking-widest text-primary">Live Queue</h1>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input 
              className="w-full pl-9 pr-3 py-2 rounded-md bg-deep border border-subtle text-xs font-medium text-primary placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="Search..." 
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <select
              value={platformFilter}
              onChange={(e) => onPlatformFilterChange(e.target.value)}
              className="w-full rounded-md bg-deep border border-subtle px-3 py-2 text-[11px] font-semibold text-secondary focus:outline-none focus:border-accent appearance-none cursor-pointer"
            >
              <option value="all">All Platforms</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="messenger">Messenger</option>
            </select>

            {tenants.length > 0 && (
              <select
                value={tenantFilter}
                onChange={(event) => onTenantFilterChange?.(event.target.value)}
                className="w-full rounded-md bg-deep border border-subtle px-3 py-2 text-[11px] font-semibold text-secondary focus:outline-none focus:border-accent appearance-none cursor-pointer"
              >
                <option value="all">All Tenants</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between px-4 py-2 bg-deep border-b border-subtle">
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted">Active Chats</span>
        {waitingCount > 0 && (
          <span className="text-[9px] font-bold uppercase tracking-tight text-amber-500">
            {waitingCount} Pending
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-surface">
        {filteredConversations.map((conversation) => (
          <QueueItem
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeChatId}
            onSelect={() => onSelect(conversation.id)}
          />
        ))}
        {filteredConversations.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-xs font-medium text-muted">No conversations found</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatQueue;
