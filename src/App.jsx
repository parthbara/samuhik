import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Bot,
  Camera,
  Check,
  ClipboardList,
  Clock3,
  FileSpreadsheet,
  Inbox,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquareText,
  MoreHorizontal,
  PackageCheck,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Truck,
  UserRoundCheck,
  Zap,
} from "lucide-react";
import { generateAutoReply } from "./utils/llmService";

const channels = {
  whatsapp: {
    label: "WhatsApp",
    icon: MessageCircle,
    badge: "bg-[#25D366] text-white",
    tint: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  instagram: {
    label: "Instagram",
    icon: Camera,
    badge: "bg-[#E4405F] text-white",
    tint: "bg-rose-50 text-rose-700 ring-rose-100",
  },
  messenger: {
    label: "Messenger",
    icon: MessageSquareText,
    badge: "bg-[#0084FF] text-white",
    tint: "bg-blue-50 text-blue-700 ring-blue-100",
  },
};

const initialInventory = [
  { id: "lens-blue-156", item: "Blue-cut lenses 1.56", stock: 40, price: 520 },
  { id: "lens-blue-161", item: "Blue-cut lenses 1.61", stock: 24, price: 780 },
  { id: "lens-anti-glare", item: "Anti-glare lenses", stock: 12, price: 430 },
  { id: "lens-progressive", item: "Progressive lenses", stock: 18, price: 1950 },
  { id: "lens-cr", item: "CR single vision lenses", stock: 96, price: 180 },
];

const initialConversations = [
  {
    id: "maya",
    customerName: "Maya Optical Store",
    platform: "whatsapp",
    tags: ["Wholesale", "Optical", "Fast buyer"],
    aiEnabled: true,
    messages: [
      {
        from: "customer",
        time: "10:22 AM",
        text: "Namaste, malai spectacle lens ko price list pathau na. Wholesale rate chahiyo.",
      },
      {
        from: "ai",
        time: "10:23 AM",
        text:
          "Namaste Maya ji. Wholesale lens price list ready cha. Single vision CR Rs. 180/pair, blue-cut Rs. 520/pair, anti-glare Rs. 430/pair, progressive Rs. 1,950/pair bata start huncha. Minimum 20 pair ma wholesale rate apply huncha.",
      },
      {
        from: "customer",
        time: "10:24 AM",
        text: "Blue-cut 1.56 ra 1.61 ko difference kati ho? Kathmandu delivery hunchha?",
      },
      {
        from: "ai",
        time: "10:24 AM",
        text:
          "1.56 blue-cut Rs. 520/pair ho, 1.61 thinner lens Rs. 780/pair ho. Kathmandu valley bhitra same-day delivery possible cha if order 2 PM bhanda agadi confirm bhayo. Kati pair reserve garidim?",
      },
    ],
    initials: "MO",
    role: "Wholesale buyer",
    time: "2m",
    unread: 3,
    color: "from-teal-500 to-cyan-500",
    phone: "+977 984-1234567",
    address: "Putalisadak, Kathmandu",
    lifetimeValue: "Rs. 2,84,500",
    notes: [
      "Usually orders anti-glare and blue-cut lenses in bulk.",
      "Prefers delivery before 5 PM and asks for VAT bill.",
    ],
    activity: [
      { id: "POS-1048", item: "Blue-cut lenses x 40", status: "Packed", amount: "Rs. 46,000" },
      { id: "INV-8871", item: "Anti-glare stock", status: "Low stock", amount: "12 left" },
    ],
  },
  {
    id: "suman",
    customerName: "Suman Fashion Hub",
    platform: "instagram",
    tags: ["Retail", "COD", "Instagram", "Needs Human"],
    aiEnabled: false,
    messages: [
      { from: "customer", time: "10:16 AM", text: "yo kurta ko L size available cha?" },
      { from: "ai", time: "10:17 AM", text: "L size 2 ota stock ma cha. Tapai lai actual photo pathaideu?" },
    ],
    initials: "SF",
    role: "Retail customer",
    time: "9m",
    unread: 1,
    color: "from-fuchsia-500 to-orange-400",
    phone: "+977 980-6677889",
    address: "Bharatpur-10, Chitwan",
    lifetimeValue: "Rs. 38,200",
    notes: ["Asks for real product photos before payment.", "COD accepted after order verification."],
    activity: [
      { id: "ORD-2251", item: "Printed kurta L", status: "Pending payment", amount: "Rs. 2,450" },
      { id: "RET-119", item: "Size exchange", status: "Closed", amount: "Rs. 0" },
    ],
  },
  {
    id: "bikash",
    customerName: "Bikash Electronics",
    platform: "messenger",
    tags: ["Wholesale", "Electronics", "Reseller"],
    aiEnabled: true,
    messages: [
      { from: "customer", time: "10:04 AM", text: "fan ko shipment kaha pugyo?" },
      { from: "ai", time: "10:05 AM", text: "Shipment Muglin cross bhako cha. Pokhara delivery bholi 11 AM dekhi 2 PM samma expected cha." },
    ],
    initials: "BE",
    role: "B2B reseller",
    time: "18m",
    unread: 0,
    color: "from-blue-500 to-indigo-500",
    phone: "+977 981-4455660",
    address: "New Road, Pokhara",
    lifetimeValue: "Rs. 5,12,900",
    notes: ["Monthly reseller account. Keep margin quote private.", "Usually pays by bank transfer."],
    activity: [
      { id: "SHIP-5514", item: "Ceiling fan x 30", status: "In transit", amount: "ETA tomorrow" },
      { id: "POS-1039", item: "Switch boards x 120", status: "Delivered", amount: "Rs. 72,000" },
    ],
  },
  {
    id: "rita",
    customerName: "Rita Grocery",
    platform: "whatsapp",
    tags: ["Grocery", "Bulk", "Repeat"],
    aiEnabled: true,
    messages: [
      { from: "customer", time: "9:55 AM", text: "atta 20 bora ko rate milcha?" },
      { from: "ai", time: "9:56 AM", text: "20 bora ma Rs. 1,420 per bora parcha. Koteshwor delivery free garna sakincha." },
    ],
    initials: "RG",
    role: "Neighborhood shop",
    time: "27m",
    unread: 0,
    color: "from-lime-500 to-teal-500",
    phone: "+977 986-9090901",
    address: "Koteshwor, Kathmandu",
    lifetimeValue: "Rs. 1,18,300",
    notes: ["Sensitive to delivery charges.", "Send bundle offers every Friday."],
    activity: [
      { id: "POS-1051", item: "Rice 25kg x 12", status: "Delivered", amount: "Rs. 31,800" },
      { id: "INV-8988", item: "Atta 20kg", status: "Available", amount: "84 sacks" },
    ],
  },
];

function getCurrentTime() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

function getQueueBadge(conversation) {
  if (!conversation.aiEnabled || conversation.tags.includes("Needs Human")) return "Needs Human";
  if (conversation.tags.includes("Order")) return "Order";
  return "AI Active";
}

function addUniqueTag(tags, tag) {
  return tags.includes(tag) ? tags : [...tags, tag];
}

function ChannelBadge({ platform, size = "md" }) {
  const meta = channels[platform];
  const Icon = meta.icon;
  const classes = size === "sm" ? "h-5 w-5" : "h-7 w-7";

  return (
    <span className={`${classes} ${meta.badge} inline-flex shrink-0 items-center justify-center rounded-full shadow-sm`}>
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} strokeWidth={2.4} />
    </span>
  );
}

function Avatar({ conversation, size = "lg" }) {
  const dimensions = size === "sm" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm";

  return (
    <div className={`${dimensions} relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br ${conversation.color} shadow-sm`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.6),transparent_30%)]" />
      <span className="relative flex h-full w-full items-center justify-center font-bold text-white">
        {conversation.initials}
      </span>
    </div>
  );
}

function QueueItem({ conversation, active, onSelect, typing }) {
  const meta = channels[conversation.platform];
  const latestMessage = conversation.messages.at(-1)?.text ?? "";
  const queueBadge = typing ? "Typing..." : getQueueBadge(conversation);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-b border-slate-100 px-4 py-4 text-left transition ${
        active ? "bg-teal-50" : "bg-white hover:bg-slate-50"
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
        <p className="mt-1 truncate text-sm text-slate-600">{typing ? "Samuhik AI is drafting a reply..." : latestMessage}</p>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              queueBadge === "Needs Human" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            {queueBadge}
          </span>
          <span className="truncate text-[11px] text-slate-400">{conversation.role}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="text-xs font-medium text-slate-500">{conversation.time}</span>
        {conversation.unread > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1.5 text-[11px] font-bold text-white">
            {conversation.unread}
          </span>
        ) : (
          <Check className="h-4 w-4 text-slate-300" />
        )}
      </div>
    </button>
  );
}

function QueuePanel({ conversations, activeChatId, onSelect, typingByChatId, platformFilter, onPlatformFilterChange }) {
  const waitingCount = conversations.filter((conversation) => !conversation.aiEnabled || conversation.tags.includes("Needs Human")).length;
  const filteredConversations =
    platformFilter === "all"
      ? conversations
      : conversations.filter((conversation) => conversation.platform === platformFilter);

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-white">
      <header className="border-b border-slate-200 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+14px)] md:pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-5 text-slate-950">Samuhik</h1>
                <p className="text-xs font-medium text-slate-500">Unified AI Inbox</p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        <label className="mt-4 flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-500 focus-within:border-teal-500 focus-within:bg-white">
          <Search className="h-4 w-4" />
          <input className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" placeholder="Search customers" />
        </label>

        <label className="mt-3 block">
          <span className="sr-only">Filter by platform</span>
          <select
            value={platformFilter}
            onChange={(event) => onPlatformFilterChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-teal-500"
          >
            <option value="all">All platforms</option>
            <option value="whatsapp">WhatsApp only</option>
            <option value="instagram">Instagram only</option>
            <option value="messenger">Messenger only</option>
          </select>
        </label>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {["All", "AI Active", "Needs Human", "Orders"].map((item, index) => (
            <button
              key={item}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                index === 0 ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Active Queue</span>
        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">{waitingCount} need human</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <QueueItem
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeChatId}
            typing={typingByChatId[conversation.id]}
            onSelect={() => onSelect(conversation.id)}
          />
        ))}
        {filteredConversations.length === 0 && (
          <div className="px-4 py-8 text-center text-sm font-medium text-slate-500">
            No conversations for this platform.
          </div>
        )}
      </div>
    </aside>
  );
}

function MessageBubble({ message, perspective = "admin" }) {
  const isCustomer = message.from === "customer";
  const isAi = message.from === "ai";
  const isMine = perspective === "customer" ? isCustomer : !isCustomer;
  const isAiLabelVisible = perspective === "admin" ? isAi : isAi;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-2xl px-4 py-3 shadow-sm ${
          isMine
            ? isCustomer
              ? "rounded-tr-md bg-teal-700 text-white"
              : "rounded-tr-md bg-slate-900 text-white"
            : isAi
              ? "rounded-tl-md bg-white text-slate-900 ring-1 ring-slate-200"
              : "rounded-tl-md bg-white text-slate-900 ring-1 ring-slate-200"
        }`}
      >
        {!isCustomer && perspective === "admin" && (
          <div className={`mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${isAi ? "text-teal-100" : "text-slate-200"}`}>
            {isAi ? <Bot className="h-3.5 w-3.5" /> : <UserRoundCheck className="h-3.5 w-3.5" />}
            {isAi ? "Samuhik AI" : "Human Agent"}
          </div>
        )}
        {isAiLabelVisible && perspective === "customer" && (
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <Bot className="h-3.5 w-3.5" />
            Samuhik AI
          </div>
        )}
        <p className="text-sm leading-6">{message.text}</p>
        <p
          className={`mt-1 text-right text-[11px] ${
            isMine
              ? isCustomer
                ? "text-teal-100"
                : "text-slate-300"
              : "text-slate-400"
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-end">
      <div className="rounded-2xl rounded-tr-md bg-teal-700 px-4 py-3 text-white shadow-sm">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-teal-100">
          <Bot className="h-3.5 w-3.5" />
          Samuhik AI
        </div>
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/90" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/90 [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-white/90 [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
}

function Composer({ aiEnabled, typing, onCustomerMessage, onHumanReply }) {
  const [draft, setDraft] = useState("");
  const placeholder = aiEnabled
    ? "Simulate customer webhook: e.g. blue-cut 1.56 ko 10 pair confirm garum"
    : "Type a manual reply as the human agent";

  const send = () => {
    const text = draft.trim();
    if (!text || typing) return;
    setDraft("");
    if (aiEnabled) {
      onCustomerMessage(text);
    } else {
      onHumanReply(text);
    }
  };

  return (
    <div className="flex items-end gap-2">
      <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200" aria-label="Add attachment">
        <Plus className="h-5 w-5" />
      </button>
      <textarea
        rows={1}
        value={draft}
        disabled={typing}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            send();
          }
        }}
        className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={send}
        disabled={!draft.trim() || typing}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        aria-label={aiEnabled ? "Send simulated customer message" : "Send human reply"}
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}

function ChatPanel({ conversation, onBack, onTakeOver, onCustomerMessage, onHumanReply, typing }) {
  const meta = channels[conversation.platform];
  const ChannelIcon = meta.icon;

  return (
    <main className="flex h-full min-h-0 flex-col bg-[#f7faf8]">
      <header className="flex min-h-[74px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 pt-[env(safe-area-inset-top)] shadow-sm md:px-5 md:pt-0">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Back to queue"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Avatar conversation={conversation} size="sm" />
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-950">{conversation.customerName}</h2>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ring-1 ${meta.tint}`}>
                <ChannelIcon className="h-3 w-3" />
                {meta.label}
              </span>
              <span className="hidden sm:inline">{conversation.aiEnabled ? "AI confidence 96%" : "Assigned to you"}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onTakeOver}
            className="hidden h-9 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 sm:flex"
          >
            <UserRoundCheck className="h-4 w-4" />
            Assign
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="More actions">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <div className="mx-auto flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            <Clock3 className="h-3.5 w-3.5" />
            {conversation.aiEnabled ? "Automated support is active" : "Human takeover active"}
          </div>
          {conversation.messages.map((message, index) => (
            <MessageBubble key={`${message.time}-${index}-${message.text}`} message={message} />
          ))}
          {typing && <TypingIndicator />}

          {conversation.aiEnabled && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Simulator is live: type a customer message below. Try "blue-cut 1.56 ko 10 pair confirm garum" to test order extraction.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 md:px-5">
        {conversation.aiEnabled ? (
          <div className="mb-3 flex flex-col gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-teal-950">Samuhik AI is currently handling this conversation</p>
                <p className="text-xs text-teal-700">Romanized Nepali intent detection and POS order extraction are active</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onTakeOver}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800"
            >
              <UserRoundCheck className="h-4 w-4" />
              Take Over (Assign to Me)
            </button>
          </div>
        ) : (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
            AI is off for this conversation. Manual agent replies are enabled.
          </div>
        )}

        <Composer
          aiEnabled={conversation.aiEnabled}
          typing={typing}
          onCustomerMessage={onCustomerMessage}
          onHumanReply={onHumanReply}
        />
      </div>
    </main>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function ContextPanel({ conversation, posInventory }) {
  return (
    <aside className="hidden h-full min-h-0 flex-col border-l border-slate-200 bg-white md:flex">
      <header className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Customer Context</h2>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Context menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <section className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar conversation={conversation} />
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-950">{conversation.customerName}</h3>
              <p className="text-sm text-slate-500">{conversation.role}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <DetailRow icon={Phone} label="Phone" value={conversation.phone} />
            <DetailRow icon={MapPin} label="Delivery Address" value={conversation.address} />
            <DetailRow icon={ShoppingBag} label="Lifetime Value" value={conversation.lifetimeValue} />
          </div>
        </section>

        <section className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-950">Tags</h3>
            <Tag className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {conversation.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  tag === "Needs Human" ? "bg-amber-100 text-amber-700" : tag === "Order" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-950">Internal Notes</h3>
            <ClipboardList className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-2">
            {conversation.notes.map((note) => (
              <p key={note} className="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-5 text-slate-600">
                {note}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-slate-950">Inventory / POS</h3>
              <p className="text-xs text-slate-500">Live LM Studio order extraction updates stock</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {posInventory.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-950">{item.item}</p>
                    <p className="mt-1 text-sm text-slate-600">Rs. {item.price.toLocaleString("en-IN")} / pair</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${
                      item.stock <= 12 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.stock} left
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <PackageCheck className="h-4 w-4" />
                  {item.stock > 0 ? "Available" : "Out of stock"}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-slate-200">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-950">Recent POS Activity</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {conversation.activity.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-950">{order.id}</p>
                    <p className="mt-1 text-sm text-slate-600">{order.item}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                    {order.amount}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  {order.status.includes("transit") ? <Truck className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
                  {order.status}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

function DemoNavigation({ activeView, onChange }) {
  const views = [
    { id: "admin", label: "Admin Inbox", icon: Inbox },
    { id: "customer", label: "Customer Demo", icon: Store },
    { id: "spreadsheet", label: "Spreadsheet", icon: FileSpreadsheet },
  ];

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
          <Zap className="h-5 w-5 fill-current" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-950">Samuhik Live Demo</p>
          <p className="truncate text-xs text-slate-500">Admin, customer, and spreadsheet views share one state</p>
        </div>
      </div>
      <nav className="flex shrink-0 gap-1 rounded-xl bg-slate-100 p-1">
        {views.map((view) => {
          const Icon = view.icon;
          const active = activeView === view.id;

          return (
            <button
              key={view.id}
              type="button"
              onClick={() => onChange(view.id)}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold transition sm:px-4 sm:text-sm ${
                active ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:bg-white/70"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{view.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}

function CustomerDemo({ conversation, posInventory, typing, onCustomerMessage }) {
  const [draft, setDraft] = useState("");
  const featuredInventory = posInventory.slice(0, 3);

  const send = () => {
    const text = draft.trim();
    if (!text || typing) return;
    setDraft("");
    onCustomerMessage(text);
  };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-[#eef3f0] px-3 py-4 md:px-6">
      <div className="mx-auto grid h-full max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="flex min-h-[620px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <header className="flex items-center justify-between border-b border-slate-200 bg-teal-700 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <Avatar conversation={conversation} size="sm" />
              <div>
                <h1 className="text-base font-bold">Samuhik Optical Wholesale</h1>
                <p className="text-xs text-teal-100">{typing ? "typing..." : "Usually replies instantly"}</p>
              </div>
            </div>
            <ChannelBadge platform="whatsapp" />
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7faf8] px-3 py-4">
            <div className="mx-auto flex max-w-2xl flex-col gap-4">
              <div className="mx-auto rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                Customer-facing WhatsApp-style demo
              </div>
              {conversation.messages.map((message, index) => (
                <MessageBubble key={`customer-${index}-${message.text}`} message={message} perspective="customer" />
              ))}
              {typing && <TypingIndicator />}
            </div>
          </div>

          <footer className="border-t border-slate-200 bg-white p-3">
            <div className="mb-3 grid gap-2 sm:grid-cols-3">
              {[
                "malai spectacle lens ko price list pathau na",
                "blue-cut 1.56 ko 10 pair confirm garum",
                "human sanga kura garna paryo",
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setDraft(sample)}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  {sample}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={draft}
                disabled={typing}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:bg-white"
                placeholder="Ask price, confirm order, or request human support"
              />
              <button
                type="button"
                onClick={send}
                disabled={!draft.trim() || typing}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Send customer message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </footer>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Customer Demo Controls</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This side simulates the buyer. Every message is also written into the Admin Inbox, where the AI can be
              taken over by a human agent.
            </p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-950">Visible Stock</h2>
              <PackageCheck className="h-4 w-4 text-teal-700" />
            </div>
            <div className="mt-3 space-y-3">
              {featuredInventory.map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">{item.item}</p>
                    <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                      {item.stock} left
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Rs. {item.price.toLocaleString("en-IN")} / pair</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function SpreadsheetView({ conversations, posInventory }) {
  const rows = conversations.flatMap((conversation) =>
    conversation.activity.map((activity) => ({
      customer: conversation.customerName,
      platform: channels[conversation.platform].label,
      aiStatus: conversation.aiEnabled ? "AI Active" : "Human",
      tags: conversation.tags.join(", "),
      ...activity,
    }))
  );

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-slate-100 p-3 md:p-5">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h1 className="text-base font-bold text-slate-950">Inventory Spreadsheet</h1>
              <p className="text-xs text-slate-500">Live stock table updated by extracted AI orders</p>
            </div>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700">POS sync</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3">SKU</th>
                  <th className="border-b border-slate-200 px-4 py-3">Item</th>
                  <th className="border-b border-slate-200 px-4 py-3">Stock</th>
                  <th className="border-b border-slate-200 px-4 py-3">Price</th>
                  <th className="border-b border-slate-200 px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {posInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="border-b border-slate-100 px-4 py-3 font-mono text-xs text-slate-500">{item.id}</td>
                    <td className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">{item.item}</td>
                    <td className="border-b border-slate-100 px-4 py-3">{item.stock}</td>
                    <td className="border-b border-slate-100 px-4 py-3">Rs. {item.price.toLocaleString("en-IN")}</td>
                    <td className="border-b border-slate-100 px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.stock <= 12 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {item.stock <= 12 ? "Low stock" : "Available"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-bold text-slate-950">Orders / Conversation Log</h2>
            <p className="text-xs text-slate-500">Spreadsheet-style admin export preview</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-3">Customer</th>
                  <th className="border-b border-slate-200 px-4 py-3">Platform</th>
                  <th className="border-b border-slate-200 px-4 py-3">AI Status</th>
                  <th className="border-b border-slate-200 px-4 py-3">Record ID</th>
                  <th className="border-b border-slate-200 px-4 py-3">Item</th>
                  <th className="border-b border-slate-200 px-4 py-3">Status</th>
                  <th className="border-b border-slate-200 px-4 py-3">Amount</th>
                  <th className="border-b border-slate-200 px-4 py-3">Tags</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.customer}-${row.id}`} className="hover:bg-slate-50">
                    <td className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">{row.customer}</td>
                    <td className="border-b border-slate-100 px-4 py-3">{row.platform}</td>
                    <td className="border-b border-slate-100 px-4 py-3">{row.aiStatus}</td>
                    <td className="border-b border-slate-100 px-4 py-3 font-mono text-xs text-slate-500">{row.id}</td>
                    <td className="border-b border-slate-100 px-4 py-3">{row.item}</td>
                    <td className="border-b border-slate-100 px-4 py-3">{row.status}</td>
                    <td className="border-b border-slate-100 px-4 py-3">{row.amount}</td>
                    <td className="border-b border-slate-100 px-4 py-3 text-xs text-slate-500">{row.tags}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState("admin");
  const [activeChatId, setActiveChatId] = useState("maya");
  const [mobileView, setMobileView] = useState("queue");
  const [conversations, setConversations] = useState(initialConversations);
  const [posInventory, setPosInventory] = useState(initialInventory);
  const [typingByChatId, setTypingByChatId] = useState({});
  const [platformFilter, setPlatformFilter] = useState("all");

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeChatId) ?? conversations[0],
    [activeChatId, conversations]
  );

  const selectConversation = (id) => {
    setActiveChatId(id);
    setMobileView("chat");
  };

  const setTyping = (chatId, value) => {
    setTypingByChatId((current) => ({ ...current, [chatId]: value }));
  };

  const appendMessage = (chatId, message) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === chatId
          ? {
              ...conversation,
              time: "now",
              messages: [...conversation.messages, message],
            }
          : conversation
      )
    );
  };

  const disableAiForChat = (chatId, needsHuman = true) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === chatId
          ? {
              ...conversation,
              aiEnabled: false,
              tags: needsHuman ? addUniqueTag(conversation.tags, "Needs Human") : conversation.tags,
            }
          : conversation
      )
    );
  };

  const processOrder = (chatId, orderData) => {
    const quantity = Math.max(0, Number(orderData?.quantity) || 0);
    const requestedItem = String(orderData?.item ?? "").toLowerCase();
    if (!quantity || !requestedItem) return;

    setPosInventory((current) => {
      const bestMatch = current
        .map((item) => {
          const stockItem = item.item.toLowerCase();
          const itemTokens = stockItem.split(/\s+/);
          const score =
            stockItem === requestedItem
              ? 100
              : stockItem.includes(requestedItem)
                ? 80
                : requestedItem.includes(stockItem)
                  ? 70
                  : itemTokens.filter((token) => requestedItem.includes(token)).length;

          return { id: item.id, score };
        })
        .sort((a, b) => b.score - a.score)[0];

      if (!bestMatch || bestMatch.score <= 0) return current;

      return current.map((item) =>
        item.id === bestMatch.id ? { ...item, stock: Math.max(0, item.stock - quantity) } : item
      );
    });

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === chatId
          ? {
              ...conversation,
              tags: addUniqueTag(conversation.tags, "Order"),
              activity: [
                {
                  id: `AI-ORD-${Date.now().toString().slice(-5)}`,
                  item: `${orderData.item} x ${quantity}`,
                  status: "Reserved by AI",
                  amount: "Stock deducted",
                },
                ...conversation.activity,
              ],
            }
          : conversation
      )
    );
  };

  const handleCustomerMessage = async (chatId, text) => {
    const conversation = conversations.find((item) => item.id === chatId);
    if (!conversation) return;

    const customerMessage = { from: "customer", time: getCurrentTime(), text };
    const nextMessages = [...conversation.messages, customerMessage];
    appendMessage(chatId, customerMessage);

    if (!conversation.aiEnabled) return;

    setTyping(chatId, true);
    try {
      const response = await generateAutoReply({
        messages: nextMessages,
        posInventory,
      });

      appendMessage(chatId, {
        from: "ai",
        time: getCurrentTime(),
        text: response.reply || "Maile bujhe. Ekchin ma confirm garera pathauchu.",
      });

      if (response.intent === "order") {
        processOrder(chatId, response.orderData);
      }

      if (response.intent === "escalate") {
        disableAiForChat(chatId, true);
      }
    } catch (error) {
      appendMessage(chatId, {
        from: "ai",
        time: getCurrentTime(),
        text: "AI service connect bhayena. Hold on, ma human agent lai assign gardai chu.",
      });
      disableAiForChat(chatId, true);
    } finally {
      setTyping(chatId, false);
    }
  };

  const handleHumanReply = (text) => {
    appendMessage(activeChatId, { from: "agent", time: getCurrentTime(), text });
  };

  const handleTakeOver = () => {
    disableAiForChat(activeChatId, false);
  };

  return (
    <div className="flex h-screen min-h-0 flex-col bg-slate-200 text-slate-950">
      <DemoNavigation activeView={activeView} onChange={setActiveView} />

      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 overflow-hidden bg-white shadow-soft">
        {activeView === "admin" && (
          <div className="grid h-full min-h-0 w-full md:grid-cols-[260px_minmax(0,1fr)_260px] lg:grid-cols-[320px_minmax(0,1fr)_340px]">
            <div className={mobileView === "queue" ? "block min-h-0" : "hidden min-h-0 md:block"}>
              <QueuePanel
                conversations={conversations}
                activeChatId={activeChatId}
                typingByChatId={typingByChatId}
                platformFilter={platformFilter}
                onPlatformFilterChange={setPlatformFilter}
                onSelect={selectConversation}
              />
            </div>
            <div className={mobileView === "chat" ? "block min-h-0" : "hidden min-h-0 md:block"}>
              <ChatPanel
                conversation={activeConversation}
                typing={Boolean(typingByChatId[activeConversation.id])}
                onBack={() => setMobileView("queue")}
                onTakeOver={handleTakeOver}
                onCustomerMessage={(text) => handleCustomerMessage(activeChatId, text)}
                onHumanReply={handleHumanReply}
              />
            </div>
            <ContextPanel conversation={activeConversation} posInventory={posInventory} />
          </div>
        )}

        {activeView === "customer" && (
          <CustomerDemo
            conversation={conversations.find((conversation) => conversation.id === "maya") ?? activeConversation}
            posInventory={posInventory}
            typing={Boolean(typingByChatId.maya)}
            onCustomerMessage={(text) => handleCustomerMessage("maya", text)}
          />
        )}

        {activeView === "spreadsheet" && (
          <SpreadsheetView conversations={conversations} posInventory={posInventory} />
        )}
      </div>
    </div>
  );
}
