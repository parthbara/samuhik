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
              ? "rounded-tr-md bg-indigo-600 text-white"
              : "rounded-tr-md bg-slate-900 text-white"
            : "rounded-tl-md bg-white text-slate-900 ring-1 ring-slate-200"
        }`}
      >
        {!isCustomer && perspective === "admin" && (
          <div className={`mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${isAi ? "text-indigo-200" : "text-slate-300"}`}>
            {isAi ? <Bot className="h-3.5 w-3.5" /> : <UserRoundCheck className="h-3.5 w-3.5" />}
            {isAi ? "Samuhik AI" : "Human Agent"}
          </div>
        )}
        <p className="text-sm leading-6">{message.text}</p>
        <p
          className={`mt-1 text-right text-[11px] ${
            isMine
              ? "text-indigo-100"
              : "text-slate-400"
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
