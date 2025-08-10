import React from "react";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid";
import { cx } from "../utils/common";

type Props = {
  onClick: () => void;
  unreadCount: number;
  ariaLabel: string;
};

const FAB = React.forwardRef<HTMLButtonElement, Props>(function FAB({ onClick, unreadCount, ariaLabel }, ref) {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cx(
        "relative w-16 h-16 flex items-center justify-center rounded-full shadow-2xl border-2 border-white/20 backdrop-blur-sm group",
        "transition-transform duration-200 will-change-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:color-mix(in_oklab,var(--theme)_40%,white_0%)]"
      )}
      style={{
        background: `linear-gradient(135deg, var(--theme), color-mix(in oklab, var(--theme) 87%, white))`,
        boxShadow: `0 12px 35px 0 color-mix(in oklab, var(--theme) 25%, transparent)`,
      }}
      aria-label={ariaLabel}
    >
      <ChatBubbleBottomCenterTextIcon className="w-7 h-7 text-white transition-transform group-hover:scale-110" />
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 min-w-6 h-6 px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-bounce">
          {unreadCount > 9 ? "9+" : unreadCount}
        </div>
      )}
      <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "var(--theme)" }} />
    </button>
  );
});

export default FAB;