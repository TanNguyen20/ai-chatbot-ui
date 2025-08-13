import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CpuChipIcon, UserIcon } from "@heroicons/react/24/outline";
import { cx } from "../utils/common";
import { cls } from "../utils/const";
import { mdComponents } from "../components/markdown";
import { AttachmentChip } from "../components/Attachment";
import type { Message } from "../types/chatbot";

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

type Props = { messages: Message[]; isExpanded: boolean };

const MessageList: React.FC<Props> = ({ messages, isExpanded }) => {
  const nameWidthClass = isExpanded ? "max-w-[200px]" : "max-w-[110px]";
  return (
    <>
      {messages.map((msg) => (
        <div key={msg.id} className={cx("flex gap-3", msg.sender === "user" ? "justify-end" : "justify-start")}>
          {msg.sender === "bot" && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0"><CpuChipIcon className="w-4 h-4 text-white" /></div>
          )}
          <div className={cx("max-w-[85%]", msg.sender === "user" && "order-1")}>
            <div className={cx(
              "px-3 py-2 rounded-2xl shadow-sm text-sm leading-relaxed space-y-2",
              "break-words",
              msg.sender === "user"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 rounded-br-md"
                : cx(cls.panel, cls.border, "rounded-bl-md")
            )}>
              {msg.text && (
                <div className={cx("prose prose-sm dark:prose-invert max-w-none break-words prose-pre:my-0 prose-p:my-2",
                  msg.sender === "user" ? "text-white" : "text-gray-800 dark:text-neutral-100"
                )}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{msg.text}</ReactMarkdown>
                </div>
              )}
              {msg.attachments?.length ? (
                <div className="flex flex-wrap gap-2">
                  {msg.attachments.map((att, i) => att.isImage ? (
                    <a key={i} href={att.url} target="_blank" rel="noreferrer" className="block">
                      <img src={att.url} alt={att.name} className="h-24 w-24 object-cover rounded-lg border border-black/10 dark:border-white/10" />
                    </a>
                  ) : (
                    <AttachmentChip key={i} att={att} sender={msg.sender} nameWidthClass={nameWidthClass} />
                  ))}
                </div>
              ) : null}
            </div>
            <div className={cx("text-[11px] mt-1 flex items-center gap-2", cls.textSubtle, msg.sender === "user" ? "justify-end" : "justify-start")} aria-label={formatTime(msg.timestamp)}>
              {formatTime(msg.timestamp)}
              {msg.status === "sending" && <span className="italic opacity-70">uploading…</span>}
              {msg.status === "error" && <span className="text-red-500">failed</span>}
            </div>
          </div>
          {msg.sender === "user" && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0"><UserIcon className="w-4 h-4 text-white" /></div>
          )}
        </div>
      ))}
    </>
  );
};

export default MessageList;