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
      className={`group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-b border-slate-100 px-4 py-4 text-left transition ${
        active ? "bg-indigo-50" : "bg-white hover:bg-slate-50"
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
          <p className="truncate text-sm font-semibold text-slate-950">{conversation.customerName}</p>
          <span className={`hidden rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 sm:inline-flex ${meta.tint}`}>
            {meta.label}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-slate-600">{latestMessage}</p>
        <div className="mt-2 flex items-center gap-2">
          {isNeedsHuman && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-700">
              <Sparkles className="h-3 w-3" />
              Needs Human
            </span>
          )}
          <span className="truncate text-[11px] text-slate-400">{conversation.role}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="text-xs font-medium text-slate-500">{conversation.time}</span>
        {conversation.unread > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-bold text-white">
            {conversation.unread}
          </span>
        ) : (
          <Check className="h-4 w-4 text-slate-300" />
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
    <aside className="flex h-full w-80 flex-col border-r border-slate-200 bg-white">
      <header className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Zap className="h-4 w-4 fill-current" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Queue</h1>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
            placeholder="Search customers..." 
          />
        </div>

        <select
          value={platformFilter}
          onChange={(e) => onPlatformFilterChange(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
            className="mt-3 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="all">All tenants</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
            ))}
          </select>
        )}
      </header>

      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Conversations</span>
        {waitingCount > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">{waitingCount} Action Required</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <QueueItem
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeChatId}
            onSelect={() => onSelect(conversation.id)}
          />
        ))}
        {filteredConversations.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-400">
            No active conversations.
          </div>
        )}
      </div>
    </aside>
  );
};

export default ChatQueue;
