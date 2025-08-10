import React from "react";
import { ArrowsPointingInIcon, ArrowsPointingOutIcon, MinusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { CpuChipIcon } from "@heroicons/react/24/outline";

type Props = {
  title: string;
  isTyping: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMinimize: () => void;
  onClose: () => void;
};

const Header: React.FC<Props> = ({ title, isTyping, isExpanded, onToggleExpand, onMinimize, onClose }) => (
  <div
    className="flex justify-between items-center p-4 backdrop-blur-sm relative"
    style={{ background: `linear-gradient(135deg, var(--theme), color-mix(in oklab, var(--theme) 90%, black))` }}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><CpuChipIcon className="w-5 h-5 text-white" /></div>
      <div>
        <h3 className="text-white font-semibold text-sm leading-tight">{title}</h3>
        <p className="text-white/80 text-[11px]">{isTyping ? "Typing…" : "Online"}</p>
      </div>
    </div>
    <div className="flex gap-1">
      <button onClick={onToggleExpand} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50" aria-label={isExpanded ? "Minimize chat" : "Expand chat"}>
        {isExpanded ? <ArrowsPointingInIcon className="w-4 h-4 text-white" /> : <ArrowsPointingOutIcon className="w-4 h-4 text-white" />}
      </button>
      <button onClick={onMinimize} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50" aria-label="Minimize chat">
        <MinusIcon className="w-4 h-4 text-white" />
      </button>
      <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50" aria-label="Close chat">
        <XMarkIcon className="w-4 h-4 text-white" />
      </button>
    </div>
  </div>
);

export default Header;