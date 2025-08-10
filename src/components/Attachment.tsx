import type { Attachment } from "../types/chatbot";
import { cx, formatFileSize } from "../utils/common";
import { cls } from "../utils/const";

import {
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export const AttachmentChip: React.FC<{
  att: Attachment;
  sender: "user" | "bot";
  nameWidthClass: string;
}> = ({ att, sender, nameWidthClass }) => (
  <a
    href={att.url}
    target="_blank"
    rel="noreferrer"
    className={cx(
      "group flex items-center gap-2 px-3 py-2 rounded-lg border text-xs min-w-0 overflow-hidden",
      sender === "user"
        ? "border-white/20 bg-white/10"
        : cx(cls.border, cls.chipBg)
    )}
  >
    <DocumentTextIcon className={cx("w-4 h-4 flex-shrink-0", cls.icon)} />
    <span className={cx("truncate", cls.textBase, nameWidthClass)} title={att.name}>
      {att.name}
    </span>
    <span className={cx("flex-shrink-0", cls.textSubtle)}>({formatFileSize(att.size)})</span>
  </a>
);