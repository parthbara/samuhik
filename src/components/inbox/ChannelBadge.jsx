import React from 'react';
import { MessageCircle, Camera, MessageSquareText, Music2 } from 'lucide-react';

export const channels = {
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
  tiktok: {
    label: "TikTok",
    icon: Music2,
    badge: "bg-slate-900 text-white",
    tint: "bg-slate-100 text-slate-800 ring-slate-200",
  },
};

const ChannelBadge = ({ platform, size = "md" }) => {
  const meta = channels[platform] || channels.whatsapp;
  const Icon = meta.icon;
  const classes = size === "sm" ? "h-5 w-5" : "h-7 w-7";

  return (
    <span className={`${classes} ${meta.badge} inline-flex shrink-0 items-center justify-center rounded-full shadow-sm`}>
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} strokeWidth={2.4} />
    </span>
  );
};

export default ChannelBadge;
