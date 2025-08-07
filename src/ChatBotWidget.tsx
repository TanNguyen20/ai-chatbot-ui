import React, { useEffect, useState, useRef } from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  MinusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

interface ChatbotConfig {
  uuid: string;
  name: string;
  themeColor: string;
}

interface ChatbotWidgetProps {
  apiKey: string;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ apiKey }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [turnedOff, setTurnedOff] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/v1/chatbot/info", {
          headers: {
            "X-Api-Key": apiKey,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        } else {
          console.warn("Unauthorized or invalid API key");
        }
      } catch (error) {
        console.error("Error fetching chatbot config:", error);
      }
    };

    fetchConfig();
  }, [apiKey]);

  const handleSendMessage = () => {
    if (input.trim()) {
      const userMessage = { sender: "user", text: input.trim() };
      const botMessage = { sender: "bot", text: `Echo - ${input.trim()}` };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
      }, 500);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  if (!config || turnedOff) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:scale-110 transition-transform border-2 border-white ring-2 ring-offset-2 ring-blue-400"
          style={{ backgroundColor: config.themeColor }}
        >
          <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-white" />
        </button>
      )}

      {isVisible && (
        <div
          className={`flex flex-col transition-all fade-in-up duration-300 ease-in-out bg-white rounded-lg shadow-xl overflow-hidden ${isExpanded ? "w-160 h-[700px]" : "w-90 h-[460px]"
            } ${isAnimating ? "fade-out-down" : "fade-in-up"}`}
        >
          {/* Header */}
          <div
            className="flex justify-between items-center p-3 border-b"
            style={{ backgroundColor: config.themeColor }}
          >
            <strong className="text-gray-800">{config.name}</strong>
            <div className="flex gap-2">
              <button
                onClick={() => setTurnedOff(true)}
                className="hover:scale-105 focus:outline-none focus:ring-0"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="hover:scale-105 focus:outline-none focus:ring-0"
              >
                {isExpanded ? (
                  <ArrowsPointingInIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setIsAnimating(false);
                    setIsVisible(false);
                  }, 300); // match animation duration
                }}
                className="hover:scale-105 focus:outline-none focus:ring-0"
              >
                <MinusIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800"
          >
            {messages.length === 0 ? (
              <div>Welcome to {config.name}!</div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex mb-2 ${msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm text-sm ${msg.sender === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="p-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
