import React from 'react';
import { Bot, UserRoundCheck } from 'lucide-react';

const MessageBubble = ({ message, perspective = "admin" }) => {
  const isCustomer = message.from === "customer";
  const isAi = message.from === "ai";
  // In the admin perspective (staff inbox), "Mine" are messages sent by AI or Agent
  const isMine = perspective === "admin" ? !isCustomer : isCustomer;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[86%] rounded-2xl px-4 py-3 shadow-sm ${
          isMine
            ? isCustomer
              ? "rounded-tr-md bg-accent text-deep"
              : "rounded-tr-md bg-elevated border border-subtle text-primary"
            : "rounded-tl-md bg-surface border border-subtle text-primary"
        }`}
      >
        {!isCustomer && perspective === "admin" && (
          <div className={`mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${isAi ? "text-accent" : "text-indigo-400"}`}>
            {isAi ? <Bot className="h-3.5 w-3.5" /> : <UserRoundCheck className="h-3.5 w-3.5" />}
            {isAi ? "Samuhik AI" : "Human Agent"}
          </div>
        )}
        <p className="text-sm leading-6">{message.text}</p>
        <p
          className={`mt-1 text-right text-[11px] ${
            isMine && isCustomer
              ? "text-deep/70"
              : "text-muted"
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
