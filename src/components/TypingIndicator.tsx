import React from "react";
import { CpuChipIcon } from "@heroicons/react/24/outline";
import { cx } from "../utils/common";
import { cls } from "../utils/const";

const TypingIndicator: React.FC = () => (
  <div className="flex gap-3 justify-start">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
      <CpuChipIcon className="w-4 h-4 text-white" />
    </div>
    <div className={cx(cls.panel, cls.border, "px-4 py-3 rounded-2xl rounded-bl-md shadow-sm")}>
      <div className="flex gap-1 items-end">
        <div className="w-2 h-2 bg-gray-400 dark:bg-neutral-500 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
        <div className="w-2 h-2 bg-gray-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
      </div>
    </div>
  </div>
);

export default TypingIndicator;