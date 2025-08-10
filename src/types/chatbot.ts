export interface APIResponse<T> {
    "timestamp": string,
    "code": string,
    "status": string,
    "message": string,
    "description": string,
    "result": Array<T> | T
}

export interface ChatbotConfig {
  uuid: string;
  name: string;
  themeColor: string;
}

export interface Attachment {
  name: string;
  url: string;
  mime: string;
  size: number;
  isImage?: boolean;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
  attachments?: Attachment[];
}

export interface ChatbotWidgetProps {
  apiKey: string;
  endpoint?: string;
  uploadEndpoint?: string; 
  maxFiles?: number;
  maxFileSizeMB?: number;
  accept?: string;
}
