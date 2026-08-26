import React from 'react';
import { Bot, UserRoundCheck } from 'lucide-react';
import { LogoIcon } from '../Logo';

const MessageBubble = ({ message, perspective = "admin" }) => {
  const isCustomer = message.from === "customer";
  const isAi = message.from === "ai";
  // In the admin perspective (staff inbox), "Mine" are messages sent by AI or Agent
  const isMine = perspective === "admin" ? !isCustomer : isCustomer;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 ${
          isMine
            ? isCustomer
              ? "bg-accent text-deep"   /* accent bg → uses deep (white in dark, black in light) for text */
              : "bg-elevated border border-subtle text-primary"
            : "msg-bubble-inbound"
        }`}
      >
        {!isCustomer && perspective === "admin" && (
          <div className={`mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${isAi ? "text-accent" : "text-secondary"}`}>
            {isAi ? <LogoIcon className="h-3 w-3" /> : <UserRoundCheck className="h-3 w-3" />}
            {isAi ? "System AI" : "Agent"}
          </div>
        )}
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
        <div className={`mt-1 flex items-center justify-end gap-1.5`}>
          <span className={`text-[9px] font-medium uppercase ${isMine && isCustomer ? "opacity-60" : "text-muted"}`}>
            {message.time}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
