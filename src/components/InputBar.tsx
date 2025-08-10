import React, { useRef } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { DocumentTextIcon, PaperClipIcon, XMarkIcon as XIcon } from "@heroicons/react/24/outline";
import { cx, formatFileSize } from "../utils/common";
import { cls } from "../utils/const";

type Props = {
  accept: string;
  maxFiles: number;
  maxFileSizeMB: number;
  uiError: string | null;
  input: string;
  setInput: (v: string) => void;
  pendingFiles: File[];
  removePendingFile: (idx: number) => void;
  addFiles: (files: FileList | File[]) => void;
  onDrop: React.DragEventHandler<HTMLDivElement>;
  onDragOver: React.DragEventHandler<HTMLDivElement>;
  onSend: () => Promise<void> & { abort?: () => void };
  sendEnabled: boolean | string;
};

const InputBar: React.FC<Props> = ({ accept, maxFiles, maxFileSizeMB, uiError, input, setInput, pendingFiles, removePendingFile, addFiles, onDrop, onDragOver, onSend, sendEnabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onPickFiles = () => fileInputRef.current?.click();

  return (
    <div className="p-3 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-sm border-t border-gray-200/60 dark:border-neutral-800">
      {uiError && (
        <div className="mb-2 text-[12px] text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-md px-3 py-2">{uiError}</div>
      )}

      {pendingFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {pendingFiles.map((f, idx) => {
            const isImage = (f.type || "").startsWith("image/");
            const url = URL.createObjectURL(f);
            return (
              <div key={idx} className="relative group">
                {isImage ? (
                  <img src={url} alt={f.name} className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-neutral-700" />
                ) : (
                  <div className={cx("h-8 min-w-40 max-w-52 px-3 py-2 rounded-lg border text-xs flex items-center gap-2 overflow-hidden", cls.border, cls.chipBg)}>
                    <DocumentTextIcon className={cx("w-4 h-4 flex-shrink-0", cls.icon)} />
                    <span className={cx("truncate", cls.textBase)} title={f.name}>{f.name}</span>
                    <span className={cx("flex-shrink-0", cls.textSubtle)}>{formatFileSize(f.size)}</span>
                  </div>
                )}
                <button onClick={() => removePendingFile(idx)} className="absolute -top-2 -right-2 bg-black/70 dark:bg-white/20 text-white dark:text-neutral-900 rounded-full p-1 opacity-0 group-hover:opacity-100 transition" aria-label={`Remove ${f.name}`}>
                  <XIcon className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 items-end" onDrop={onDrop} onDragOver={onDragOver}>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={accept}
          onChange={(e) => { const selected = e.target.files; if (!selected) return; addFiles(selected); e.currentTarget.value = ""; }}
        />

        <button type="button" onClick={onPickFiles} className={cx("h-11 w-11 shrink-0 flex items-center justify-center rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_oklab,var(--theme)_40%,white_0%)] hover:bg-gray-100 dark:hover:bg-neutral-800 border", cls.border)} title="Attach files" aria-label="Attach files">
          <PaperClipIcon className={cx("w-5 h-5", cls.iconSubtle)} />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Type your message… (drag & drop files here)"
            maxLength={500}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSend(); } }}
            className={cx(
              "w-full px-4 py-3 pr-12 rounded-xl shadow-sm focus:outline-none text-sm bg-white/90 dark:bg-neutral-800/90",
              "focus:ring-2 focus:ring-[color:color-mix(in_oklab,var(--theme)_45%,white_0%)] focus:border-transparent",
              "placeholder:text-gray-400 dark:placeholder:text-neutral-500 border",
              cls.border,
              cls.textBase
            )}
            aria-label="Message input"
            disabled={!sendEnabled && !!input}
          />
          <div className={cx("absolute right-3 top-1/2 -translate-y-1/2 text-[11px] select-none", cls.textSubtle)}>{input.length}/500</div>
        </div>

        <button onClick={onSend} disabled={!sendEnabled} className={cx(
          "w-12 h-12 flex items-center justify-center rounded-xl shadow-sm transition-transform duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_oklab,var(--theme)_40%,white_0%)]",
          sendEnabled ? "hover:scale-105 active:scale-95" : "opacity-50 cursor-not-allowed",
          !sendEnabled && "bg-gray-200 dark:bg-neutral-700"
        )} style={sendEnabled ? { background: `linear-gradient(135deg, var(--theme), color-mix(in oklab, var(--theme) 87%, white))` } : undefined} aria-label="Send message">
          <PaperAirplaneIcon className={cx("w-5 h-5", sendEnabled ? "text-white" : cls.iconSubtle)} />
        </button>
      </div>

      <p className={cx("mt-2 text-[11px]", cls.textSubtle)}>Attach up to {maxFiles} files • Max size {maxFileSizeMB}MB each</p>
    </div>
  );
};

export default InputBar;