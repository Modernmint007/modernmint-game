"use client";

import { motion } from "framer-motion";
import type { GameMode } from "@/lib/lobby/types";

interface ModeCardProps {
  mode:     GameMode;
  selected: boolean;
  onSelect: () => void;
}

const MODE_DATA: Record<GameMode, {
  icon:  string;
  label: string;
  sub:   string;
  color: string;
}> = {
  "60mins": {
    icon:  "⏱",
    label: "60 MINS",
    sub:   "Standard gameplay for 60 minutes",
    color: "#1de9d6",
  },
  short: {
    icon:  "⚡",
    label: "SHORT MODE",
    sub:   "Fast-paced game for quick play",
    color: "#d4a843",
  },
  full: {
    icon:  "👑",
    label: "FULL MODE",
    sub:   "Unlimited time — no time limit",
    color: "#b06aff",
  },
};

export default function ModeCard({ mode, selected, onSelect }: ModeCardProps) {
  const data = MODE_DATA[mode];

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.14 }}
      className="flex flex-col items-center gap-1.5 p-3 rounded-xl flex-1 cursor-pointer text-center"
      style={{
        background: selected
          ? `rgba(${
              mode === "60mins" ? "29,233,214"
              : mode === "short" ? "212,168,67"
              : "176,106,255"
            },0.10)`
          : "rgba(6,20,26,0.65)",
        border: `1.5px solid ${selected ? data.color : "rgba(29,233,214,0.10)"}`,
        boxShadow: selected ? `0 0 24px ${data.color}25` : "none",
        transition: "all 0.18s",
      }}
    >
      {/* Icon */}
      <span className="text-2xl">{data.icon}</span>

      {/* Label */}
      <span
        className="text-[11px] font-black uppercase tracking-[0.15em]"
        style={{ color: selected ? data.color : "var(--text-primary)" }}
      >
        {data.label}
      </span>

      {/* Subtitle */}
      <span
        className="text-[9px] uppercase tracking-wide leading-snug"
        style={{ color: "var(--text-faint)" }}
      >
        {data.sub}
      </span>
    </motion.button>
  );
}
