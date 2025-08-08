import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  MinusIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { UserIcon, CpuChipIcon } from "@heroicons/react/24/outline";

interface ChatbotConfig {
  uuid: string;
  name: string;
  themeColor: string; // any valid CSS color
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

interface ChatbotWidgetProps {
  apiKey: string;
  endpoint?: string; // allow override for prod
}

// Small util to join class strings safely
function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ apiKey, endpoint = "https://ai-chat-service-dqme.onrender.com/api/v1/chatbot/info" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [turnedOff, setTurnedOff] = useState(false);
  const [isClosingAnim, setIsClosingAnim] = useState(false);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // Make it easy to style everything off a CSS variable
  const themeStyles = useMemo(() => ({
    ["--theme" as any]: config?.themeColor || "#4f46e5",
  }), [config?.themeColor]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(endpoint, {
          headers: { "X-Api-Key": apiKey },
        });
        if (!res.ok) throw new Error(res.status === 401 ? "Unauthorized or invalid API key" : "Failed to load chatbot config");
        const data = await res.json();
        setConfig(data.result);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching chatbot config:", err);
        setError(err?.message || "Failed to connect to chatbot service");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [apiKey, endpoint]);

  const scrollToBottom = () => {
    const el = chatRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSendMessage = async () => {
    const clean = input.trim();
    if (!clean) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: clean,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Demo bot response (replace with your API call)
    setTimeout(() => {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        sender: "bot",
        text: `I received your message: "${userMessage.text}". This is a demo response.`,
        timestamp: new Date(),
        status: "sent",
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      if (!isVisible) setUnreadCount((u) => u + 1);
    }, 700 + Math.random() * 700);
  };

  const handleToggleVisibility = () => {
    if (!isVisible) {
      setIsVisible(true);
      setUnreadCount(0);
      // Focus input when opening
      setTimeout(() => inputRef.current?.focus(), 250);
    } else {
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
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 shadow-lg animate-pulse">
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
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

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans" style={themeStyles}>
      {/* Floating Action Button */}
      {!isVisible && (
        <button
          ref={fabRef}
          onClick={handleToggleVisibility}
          className={cx(
            "relative w-16 h-16 flex items-center justify-center rounded-full shadow-2xl border-2 border-white/20 backdrop-blur-sm group",
            "transition-transform duration-200 will-change-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:color-mix(in_oklab,var(--theme)_40%,white_0%)]"
          )}
          style={{
            background: `linear-gradient(135deg, var(--theme), color-mix(in oklab, var(--theme) 87%, white))`,
            boxShadow: `0 12px 35px 0 color-mix(in oklab, var(--theme) 25%, transparent)`,
          }}
          aria-label={`Open ${config.name} chat`}
        >
          <ChatBubbleBottomCenterTextIcon className="w-7 h-7 text-white transition-transform group-hover:scale-110" />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 min-w-6 h-6 px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-bounce">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}

          {/* Pulse */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "var(--theme)" }} />
        </button>
      )}

      {/* Chat Widget */}
      {isVisible && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${config.name} chat`}
          className={cx(
            "flex flex-col bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20",
            "transition-all duration-300 ease-out",
            isExpanded ? "w-96 h-[620px]" : "w-80 h-[520px]",
            isClosingAnim ? "opacity-0 scale-95 translate-y-3" : "opacity-100 scale-100 translate-y-0"
          )}
          style={{
            boxShadow: `0 25px 50px -12px color-mix(in oklab, var(--theme) 20%, transparent), 0 0 0 1px color-mix(in oklab, var(--theme) 6%, transparent)`
          }}
        >
          {/* Header */}
          <div
            className="flex justify-between items-center p-4 backdrop-blur-sm relative"
            style={{ background: `linear-gradient(135deg, var(--theme), color-mix(in oklab, var(--theme) 90%, black))` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <CpuChipIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm leading-tight">{config.name}</h3>
                <p className="text-white/80 text-[11px]">{isTyping ? "Typing…" : "Online"}</p>
              </div>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => setIsExpanded((v) => !v)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label={isExpanded ? "Minimize chat" : "Expand chat"}
              >
                {isExpanded ? (
                  <ArrowsPointingInIcon className="w-4 h-4 text-white" />
                ) : (
                  <ArrowsPointingOutIcon className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={handleToggleVisibility}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Minimize chat"
              >
                <MinusIcon className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setTurnedOff(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Close chat"
              >
                <XMarkIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/70 to-white/60 dark:from-neutral-900/60 dark:to-neutral-900"
          >
            {messages.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-blue-500" />
                </div>
                <h4 className="text-gray-800 dark:text-neutral-100 font-medium mb-1">Welcome to {config.name}!</h4>
                <p className="text-gray-600 dark:text-neutral-300 text-sm">How can I help you today?</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={cx("flex gap-3", msg.sender === "user" ? "justify-end" : "justify-start")}>                  
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <CpuChipIcon className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={cx("max-w-[75%]", msg.sender === "user" && "order-1")}>
                    <div
                      className={cx(
                        "px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed",
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md"
                          : "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-neutral-100 rounded-bl-md"
                      )}
                    >
                      {msg.text}
                    </div>
                    <div className={cx("text-[11px] text-gray-500 dark:text-neutral-400 mt-1", msg.sender === "user" ? "text-right" : "text-left")}
                         aria-label={formatTime(msg.timestamp)}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <CpuChipIcon className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1 items-end">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-sm border-t border-gray-200/60 dark:border-neutral-800">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message…"
                  maxLength={500}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-neutral-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--theme)_45%,white_0%)] focus:border-transparent text-sm bg-white/90 dark:bg-neutral-800/90 placeholder:text-gray-400 dark:placeholder:text-neutral-500"
                  aria-label="Message input"
                  disabled={isTyping}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 select-none">
                  {input.length}/500
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className={cx(
                  "w-12 h-12 flex items-center justify-center rounded-xl shadow-sm transition-transform duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_oklab,var(--theme)_40%,white_0%)]",
                  !input.trim() || isTyping ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
                )}
                style={{
                  background: input.trim() && !isTyping
                    ? `linear-gradient(135deg, var(--theme), color-mix(in oklab, var(--theme) 87%, white))`
                    : "#e5e7eb",
                }}
                aria-label="Send message"
              >
                <PaperAirplaneIcon className={cx("w-5 h-5", input.trim() && !isTyping ? "text-white" : "text-gray-500")} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
