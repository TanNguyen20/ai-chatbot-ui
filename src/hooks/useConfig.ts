import { useEffect, useState } from "react";
import type { ChatbotConfig, APIResponse } from "../types/chatbot";
import { CONFIG_URL } from "../utils/const";

type Args = { apiKey: string; endpoint?: string };

export default function useConfig({ apiKey, endpoint = CONFIG_URL }: Args) {
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch(endpoint, { headers: { "X-Api-Key": apiKey } });
        if (!res.ok) throw new Error(res.status === 401 ? "Unauthorized or invalid API key" : "Failed to load chatbot config");
        const data = await res.json();
        if (!alive) return;
        setConfig(data.result);
        setError(null);
      } catch (err) {
        if (!alive) return;
        setError((err as unknown as APIResponse<null>)?.message || "Failed to connect to chatbot service");
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [apiKey, endpoint]);

  return { config, isLoading, error };
}