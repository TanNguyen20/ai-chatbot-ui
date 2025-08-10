import { useCallback, useEffect, useRef, useState } from "react";
import type { APIResponse, Attachment, Message } from "../types/chatbot";
import { STREAM_URL } from "../utils/const";

type Args = {
  uploadEndpoint?: string;
  maxFiles: number;
  maxFileSizeMB: number;
  onBotReply?: () => void; // called when a bot message arrives while widget closed
};

export default function useChat({ uploadEndpoint, maxFiles, maxFileSizeMB, onBotReply }: Args) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const chatRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const botIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = chatRef.current; if (!el) return; el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const formatTime = useCallback((date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), []);

  // ---- File helpers ----
  const bytesToMB = (b: number) => b / (1024 * 1024);
  const fileToAttachment = (file: File): Attachment => ({
    name: file.name,
    url: URL.createObjectURL(file),
    mime: file.type || "application/octet-stream",
    size: file.size,
    isImage: (file.type || "").startsWith("image/"),
  });

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const current = pendingFiles.length;
    const remaining = Math.max(0, maxFiles - current);

    if (arr.length > maxFiles) {
      setUiError(`You can attach up to ${maxFiles} files per selection.`);
      setTimeout(() => setUiError(null), 3000);
      return;
    }

    const trimmed = arr.slice(0, remaining);
    const tooManyOverall = arr.length + current > maxFiles;
    const tooBig = trimmed.find((f) => bytesToMB(f.size) > maxFileSizeMB);

    if (tooManyOverall) {
      setUiError(`You can attach up to ${maxFiles} files total.`);
      setTimeout(() => setUiError(null), 3000);
    }
    if (tooBig) {
      setUiError(`Each file must be ≤ ${maxFileSizeMB} MB.`);
      setTimeout(() => setUiError(null), 3000);
      return;
    }

    if (trimmed.length) setPendingFiles((prev) => [...prev, ...trimmed]);
  };

  const removePendingFile = (idx: number) => setPendingFiles((prev) => prev.filter((_, i) => i !== idx));

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault(); e.stopPropagation(); const files = e.dataTransfer.files; if (!files?.length) return;
    if (files.length > maxFiles) {
      setUiError(`You can attach up to ${maxFiles} files per selection.`);
      setTimeout(() => setUiError(null), 3000);
      return;
    }
    addFiles(files);
  };
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => e.preventDefault();

  const uploadFiles = async (files: File[]): Promise<Attachment[]> => {
    if (!files.length) return [];
    if (uploadEndpoint) {
      const form = new FormData(); files.forEach((f) => form.append("files", f));
      const res = await fetch(uploadEndpoint, { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const uploaded: Attachment[] = await res.json();
      return uploaded.map((a) => ({ ...a, isImage: a.mime?.startsWith("image/") }));
    }
    return files.map(fileToAttachment);
  };

  async function streamAsk(
    question: string,
    onDelta: (txt: string) => void,
    onStart?: (meta: { id: string; model: string; created: number }) => void,
    onDone?: () => void,
    onError?: (msg: string) => void
  ) {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const res = await fetch(STREAM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_question: question }),
      signal: ac.signal,
    });

    if (!res.ok || !res.body) {
      onError?.(`Stream failed: ${res.status} ${res.statusText}`);
      onDone?.();
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const flush = (chunk: string) => {
      buffer += chunk;
      const parts = buffer.split(/\r?\n\r?\n/);
      buffer = parts.pop() ?? "";
      for (const raw of parts) {
        if (raw.startsWith(":")) continue;
        const lines = raw.split(/\r?\n/);
        let eventType = "message"; let dataLine = "";
        for (const line of lines) {
          if (line.startsWith("event:")) eventType = line.slice(6).trim();
          else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
        }
        if (!dataLine) continue;
        let payload; try { payload = JSON.parse(dataLine); } catch {
            // empty catch
        }
        if (eventType === "start") onStart?.(payload);
        else if (eventType === "delta") onDelta(payload?.content ?? "");
        else if (eventType === "error") onError?.(payload?.message ?? "Unknown error");
        else if (eventType === "end") onDone?.();
      }
    };

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break; flush(decoder.decode(value, { stream: true }));
      }
    } catch (err: unknown) {
      if (!(err instanceof DOMException && err.name === "AbortError")) onError?.(err instanceof Error ? err.message : String(err));
    } finally { onDone?.(); }
  }

  const handleSendMessage = Object.assign(async () => {
    const clean = input.trim();
    if (!clean && pendingFiles.length === 0) return;

    const tempAttachments = pendingFiles.map(fileToAttachment);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: clean,
      timestamp: new Date(),
      status: pendingFiles.length ? "sending" : "sent",
      attachments: tempAttachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const uploaded = await uploadFiles(pendingFiles);
      setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? { ...m, status: "sent", attachments: uploaded } : m)));

      const botId = crypto.randomUUID();
      botIdRef.current = botId;
      setPendingFiles([]);
      setIsTyping(true);

      await streamAsk(
        clean || "(no text)",
        (delta) => {
          const id = botIdRef.current!;
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === id);
            if (!exists) {
              setIsTyping(false);
              onBotReply?.();
              return [
                ...prev,
                { id, sender: "bot", text: delta || "", timestamp: new Date(), status: "sent", attachments: [] },
              ];
            }
            return prev.map((m) => (m.id === id ? { ...m, text: m.text + (delta || "") } : m));
          });
        },
        undefined,
        () => { setIsTyping(false); botIdRef.current = null; },
        (msg) => {
          const id = botIdRef.current; setIsTyping(false);
          setMessages((prev) => {
            if (id && !prev.some((m) => m.id === id)) {
              return [...prev, { id, sender: "bot", text: "[Error]", timestamp: new Date(), status: "error", attachments: [] }];
            }
            return prev.map((m) => (id && m.id === id ? { ...m, status: "error" } : m));
          });
          botIdRef.current = null; setUiError(msg); setTimeout(() => setUiError(null), 3000);
        }
      );
    } catch (e) {
      setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? { ...m, status: "error" } : m)));
      setUiError((e as unknown as APIResponse<null>)?.message || "Failed to send message");
      setTimeout(() => setUiError(null), 3000);
      setIsTyping(false); botIdRef.current = null;
    }
  }, { abort: () => abortRef.current?.abort() });

  return {
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
    formatTime,
  } as const;
}