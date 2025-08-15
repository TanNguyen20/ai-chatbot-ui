import React, { useMemo, useRef, useState } from "react";
import {
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

import type { ChatbotWidgetProps } from "./types/chatbot";
import { cls } from "./utils/const";
import { cx } from "./utils/common";

import useConfig from "./hooks/useConfig";
import useChat from "./hooks/useChat";

import FAB from "./components/FAB";
import Header from "./components/Header";
import ChatArea from "./components/ChatArea";
import InputBar from "./components/InputBar";

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  apiKey,
  endpoint,
  uploadEndpoint,
  maxFiles = 5,
  maxFileSizeMB = 10,
  accept = "image/*,.pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx,.ppt,.pptx,.json",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [turnedOff, setTurnedOff] = useState(false);
  const [isClosingAnim, setIsClosingAnim] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const fabRef = useRef<HTMLButtonElement>(null);

  const { config, isLoading, error } = useConfig({ apiKey, endpoint });

  const {
    chatRef,
    messages,
    isTyping,
    uiError,
    input,
    setInput,
    pendingFiles,
    addFiles,
    removePendingFile,
    onDrop,
    onDragOver,
    handleSendMessage,
  } = useChat({ uploadEndpoint, maxFiles, maxFileSizeMB, onBotReply: () => { if (!isVisible) setUnreadCount((u) => u + 1); } });

  const themeStyles: Record<string, string> = useMemo(
    () => ({ ["--theme"]: config?.themeColor || "#4f46e5" }),
    [config?.themeColor]
  );

  const handleToggleVisibility = () => {
    if (!isVisible) {
      setIsVisible(true);
      setUnreadCount(0);
    } else {
      // tell the hook to abort any in-flight stream
      handleSendMessage.abort?.();
      setIsClosingAnim(true);
      setTimeout(() => {
        setIsClosingAnim(false);
        setIsVisible(false);
        fabRef.current?.focus();
      }, 180);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-5 right-5 z-[9999]">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800 shadow-lg animate-pulse">
          <div className="w-6 h-6 bg-gray-300 dark:bg-neutral-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !config || turnedOff) {
    if (error) {
      return (
        <div className="fixed bottom-5 right-5 z-[9999]">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500 shadow-lg" aria-live="polite">
            <ExclamationTriangleIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      );
    }
    return null;
  }

  const sendEnabled = (input.trim() || pendingFiles.length > 0) && !isTyping;

  return (
    <div className={cx("fixed bottom-5 right-5 z-[9999] font-sans", cls.textBase)} style={themeStyles}>
      {!isVisible && (
        <FAB
          ref={fabRef}
          ariaLabel={`Open ${config.name} chat`}
          unreadCount={unreadCount}
          onClick={handleToggleVisibility}
        />
      )}

      {isVisible && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${config.name} chat`}
          className={cx(
            "flex flex-col bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20",
            "transition-all duration-300 ease-out",
            isExpanded ? "w-140 h-[700px]" : "w-90 h-[500px]",
            isClosingAnim ? "opacity-0 scale-95 translate-y-3" : "opacity-100 scale-100 translate-y-0"
          )}
          style={{
            boxShadow: `0 25px 50px -12px color-mix(in oklab, var(--theme) 20%, transparent), 0 0 0 1px color-mix(in oklab, var(--theme) 6%, transparent)`,
          }}
        >
          <Header
            title={config.name}
            isTyping={isTyping}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((v) => !v)}
            onMinimize={handleToggleVisibility}
            onClose={() => setTurnedOff(true)}
          />

          <ChatArea
            chatRef={chatRef}
            messages={messages}
            isTyping={isTyping}
            isExpanded={isExpanded}
          />

          <InputBar
            accept={accept}
            maxFiles={maxFiles}
            maxFileSizeMB={maxFileSizeMB}
            uiError={uiError}
            input={input}
            setInput={setInput}
            pendingFiles={pendingFiles}
            removePendingFile={removePendingFile}
            addFiles={addFiles}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onSend={handleSendMessage}
            sendEnabled={sendEnabled}
          />
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
