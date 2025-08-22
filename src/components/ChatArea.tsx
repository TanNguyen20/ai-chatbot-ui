import React from "react";
import { cx } from "../utils/common";
import { cls } from "../utils/const";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";
import type { Message } from "../types/chatbot";

type Props = {
  chatRef: React.RefObject<HTMLDivElement | null>;
  messages: Message[];
  isTyping: boolean;
  isExpanded: boolean;
};

const ChatArea: React.FC<Props> = ({ chatRef, messages, isTyping, isExpanded }) => (
  <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f5f5f5] dark:bg-neutral-800">
    {messages.length === 0 ? (
      <div className="text-center py-10">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center dark:from-blue-900/20 dark:to-purple-900/20">
          <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M2 5a2 2 0 012-2h16a2 2 0 012 2v14l-4-3H4a2 2 0 01-2-2V5z"/></svg>
        </div>
        <h4 className={cx("font-medium mb-1", cls.textBase)}>Welcome!</h4>
        <p className={cx("text-sm", cls.textMuted)}>How can I help you today?</p>
      </div>
    ) : (
      <MessageList messages={messages} isExpanded={isExpanded} />
    )}
    {isTyping && <TypingIndicator />}
  </div>
);

export default ChatArea;
