# Chatbot Widget (React) — README

A production‑ready, file‑uploading, SSE‑streaming chat widget built with React and Heroicons, split into small components and hooks for clean code and easy maintenance.

This README is updated to match **your current project structure** (see screenshot) and clarifies **imports** and any files not mentioned previously.

---

## Features

* 🔌 **Config fetch** with API key (unauthorized handling).
* 🗣️ **Server‑Sent Events (SSE) streaming** for bot replies.
* 📎 **File attachments** with size/count validation and optional upload API.
* 🖼️ **Attachment preview** (images) + chips for non‑images.
* 🧭 **Unread badge**, **expand/minimize/close**, and graceful **close animation**.
* ✍️ **Markdown** rendering with GitHub extras (tables, task lists).
* ♿ **Accessible**: ARIA labels, focus management.
* 🎨 **Theming** via a single CSS variable (`--theme`).

---

## Folder structure (CURRENT)

```
src/
  assets/
  components/
    Attachment.tsx
    ChatArea.tsx
    FAB.tsx
    Header.tsx
    InputBar.tsx
    markdown.tsx
    MessageList.tsx
    TypingIndicator.tsx
  hooks/
    useChat.ts
    useConfig.ts
  services/
    chat.ts
  types/
    chatbot.ts
  utils/
    common.ts
    const.ts
  index.css
  index.tsx
  main.tsx
  vite-env.d.ts
```

> If you previously saw a `widgets/chatbot/` folder, that was an example layout. Your project already places **components**, **hooks**, and **services** at the top‑level `src/` — which is perfectly fine. The README below uses **your** paths.

---

## How things map

* **`src/index.tsx`** → Exports the main `ChatbotWidget` component (container). Import **from here** when using inside this repo/app.
* **`src/components/*`** → Pure UI pieces used by the container.
* **`src/hooks/useConfig.ts`** → Fetches chatbot config (uses `X-Api-Key`).
* **`src/hooks/useChat.ts`** → Handles messages, SSE streaming, uploads, drag\&drop, input state.
* **`src/services/chat.ts`** → (If present in your code) Houses service helpers. If you later move streaming/upload logic here, keep hooks lean.
* **`src/types/chatbot.ts`** → Shared TS types (`Message`, `Attachment`, `ChatbotConfig`, ...).
* **`src/utils/const.ts`** → Constants like `CONFIG_URL`, `STREAM_URL`, and CSS class helpers (`cls`).
* **`src/utils/common.ts`** → Helpers like `cx` (classnames) and `formatFileSize`.
* **`src/components/markdown.tsx`** → `mdComponents` for `react-markdown` customization.
* **`src/components/Attachment.tsx`** → `AttachmentChip` renderer for non‑image files.

---

## Installation

1. Install runtime dependencies:

```bash
yarn or npm install
```

2. (Optional) If you plan to publish this as a package, keep `react` and `react-dom` as **peerDependencies**.

---

## Environment & constants

You can configure endpoints via **`src/utils/const.ts`** or environment variables.
A typical setup for Vite:

```ts
// src/utils/const.ts
export const CONFIG_URL = import.meta.env.VITE_CONFIG_URL ?? "/api/chatbot/config";
export const STREAM_URL = import.meta.env.VITE_STREAM_URL ?? "/api/chatbot/stream";

// Optional style helpers used by components
export const cls = {
  textBase: "text-gray-900 dark:text-neutral-100",
  textMuted: "text-gray-600 dark:text-neutral-400",
  textSubtle: "text-gray-500 dark:text-neutral-500",
  panel: "bg-white/90 dark:bg-neutral-800/90",
  border: "border border-gray-200/60 dark:border-neutral-800",
  chipBg: "bg-gray-50 dark:bg-neutral-800/70",
  icon: "text-gray-700 dark:text-neutral-300",
  iconSubtle: "text-gray-400 dark:text-neutral-500",
};
```

`.env` example:

```env
# Backend endpoints
VITE_CONFIG_URL=/api/chatbot/config
VITE_STREAM_URL=/api/chatbot/stream
# Optional uploads path if you use your own uploader
VITE_UPLOAD_URL=/api/uploads
```

---

## Usage

### Inside this project

Import the widget from `src/index.tsx` (it should export default `ChatbotWidget`).

```tsx
// e.g. src/main.tsx or wherever you render your app
import ChatbotWidget from "./index"; // resolves to src/index.tsx

export default function App() {
  return (
    <>
      {/* ...your app... */}
      <ChatbotWidget
        apiKey={import.meta.env.VITE_CHATBOT_KEY}
        endpoint={import.meta.env.VITE_CONFIG_URL}
        uploadEndpoint={import.meta.env.VITE_UPLOAD_URL}
        maxFiles={5}
        maxFileSizeMB={10}
        accept="image/*,.pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx,.ppt,.pptx,.json"
      />
    </>
  );
}
```

### Consuming as a package (if you publish)

```tsx
import ChatbotWidget from "ai-chat-ui"; // your package name
```

> If your bundler doesn’t support the above path, import directly from the built entry (e.g., `dist/index.js`).

---

## Props

| Prop             | Type      | Default                | Description                                                                                |
| ---------------- | --------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| `apiKey`         | `string`  | —                      | Sent as `X-Api-Key` when fetching config.                                                  |
| `endpoint`       | `string`  | `CONFIG_URL`           | HTTP endpoint to fetch chatbot config.                                                     |
| `uploadEndpoint` | `string?` | —                      | If provided, files are POSTed here; else, files are kept as local object URLs for preview. |
| `maxFiles`       | `number`  | `5`                    | Max number of attachments per message.                                                     |
| `maxFileSizeMB`  | `number`  | `10`                   | Max file size per attachment.                                                              |
| `accept`         | `string`  | common office + images | HTML input accept filter.                                                                  |

---

## Backend contracts

### 1) Config (`CONFIG_URL`)

**Request**: `GET` with header `X-Api-Key: <apiKey>`

**Response (200)**

```jsonc
{
  "result": {
    "name": "Acme Assistant",
    "themeColor": "#4f46e5"
  }
}
```

### 2) Streaming (`STREAM_URL`)

**Request**: `POST` JSON `{ "user_question": string }`

**Response**: **SSE** stream. Events supported:

* `start` → `data: { id, model, created }`
* `delta` → `data: { content }` (append to bot bubble)
* `error` → `data: { message }`
* `end` → `data: {}`

**Example SSE**

```
event: delta
data: {"content":"Hello"}

```

### 3) Uploads (`uploadEndpoint`, optional)

**Request**: `POST multipart/form-data` with `files`

**Response (200)**

```jsonc
[
  { "name": "a.png", "url": "https://cdn/...", "mime": "image/png", "size": 12345 },
  { "name": "b.pdf", "url": "https://cdn/...", "mime": "application/pdf", "size": 654321 }
]
```

---

## Import paths used in code (quick reference)

* Components import each other from `src/components/*`:

  ```ts
  import FAB from "./components/FAB";
  import Header from "./components/Header";
  import ChatArea from "./components/ChatArea";
  ```
* Hooks are referenced as:

  ```ts
  import useChat from "./hooks/useChat";
  import useConfig from "./hooks/useConfig";
  ```
* Shared utilities and types:

  ```ts
  import { cx, formatFileSize } from "./utils/common";
  import { cls, CONFIG_URL, STREAM_URL } from "./utils/const";
  import type { Message, Attachment, ChatbotConfig } from "./types/chatbot";
  ```
* Markdown and attachment UI:

  ```ts
  import { mdComponents } from "./components/markdown";
  import { AttachmentChip } from "./components/Attachment";
  ```

> If you move files, update these relative imports accordingly or configure a TS path alias in `tsconfig.json` (e.g., `"@/*": ["src/*"]`).

---

## Styling & theming

* The widget uses Tailwind‑style utility classes. If you don’t use Tailwind, replace class names with your CSS.
* A single CSS custom property `--theme` controls the accent color. It’s set from `config.themeColor`.

---

## Accessibility

* FAB and dialog have descriptive `aria-label`.
* Closing the widget returns focus to the FAB.
* Inline errors use polite messaging.

---

## Troubleshooting

* **Red error icon only** → Check config fetch. Ensure `X-Api-Key` header and `CONFIG_URL` are correct.
* **No stream text** → Confirm `STREAM_URL` serves proper SSE with blank‑line message separation.
* **Uploads fail** → Ensure your server returns an array as documented and supports multiple `files` form field.
* **Theme not applied** → Confirm `themeColor` is present in config and CSS custom properties aren’t blocked by CSP.

---

## License

MIT
