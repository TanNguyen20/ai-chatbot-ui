export const AI_CHAT_SERVICE_BASE_URL = import.meta.env.VITE_AI_CHAT_SERVICE_BASE_URL;
export const AI_CORE_SERVICE_BASE_URL = import.meta.env.VITE_AI_CORE_SERVICE_BASE_URL;

export const CONFIG_URL = `${AI_CHAT_SERVICE_BASE_URL}/api/v1/chatbot/info`;
export const STREAM_URL = `${AI_CORE_SERVICE_BASE_URL}/stream/ask-question`;

export const cls = {
  textBase: "text-gray-800 dark:text-neutral-100",
  textMuted: "text-gray-600 dark:text-neutral-300",
  textSubtle: "text-gray-500 dark:text-neutral-400",
  icon: "text-gray-700 dark:text-neutral-200",
  iconSubtle: "text-gray-500 dark:text-neutral-400",
  border: "border-gray-200 dark:border-neutral-700",
  panel: "bg-white dark:bg-[#373737]",
  chipBg: "bg-gray-50 dark:bg-neutral-900",
};