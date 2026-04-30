import React from 'react';

const Avatar = ({ conversation, size = "lg" }) => {
  const dimensions = size === "sm" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm";

  return (
    <div className={`${dimensions} relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br ${conversation.color || 'from-slate-500 to-slate-700'} shadow-sm`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.6),transparent_30%)]" />
      <span className="relative flex h-full w-full items-center justify-center font-bold text-white">
        {conversation.initials || conversation.customerName?.charAt(0)}
      </span>
    </div>
  );
};

export default Avatar;
