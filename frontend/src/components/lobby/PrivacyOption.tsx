"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { RoomPrivacy } from "@/lib/lobby/types";

interface PrivacyOptionProps {
  value:    RoomPrivacy;
  selected: RoomPrivacy;
  onSelect: (v: RoomPrivacy) => void;
  password: string;
  onPasswordChange: (pw: string) => void;
}

const OPTIONS: Array<{ value: RoomPrivacy; label: string; sub: string }> = [
  { value: "open",     label: "Open",             sub: "Anyone can join"       },
  { value: "closed",   label: "Closed",           sub: "Invite only"           },
  { value: "password", label: "Lock with Password", sub: "Players need password" },
];

function RadioDot({ active }: { active: boolean }) {
  return (
    <div
      className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
      style={{
        border: `1.5px solid ${active ? "#1de9d6" : "rgba(29,233,214,0.22)"}`,
        background: "transparent",
      }}
    >
      {active && (
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: "#1de9d6" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        />
      )}
    </div>
  );
}

export default function PrivacyOption({
  value,
  selected,
  onSelect,
  password,
  onPasswordChange,
}: PrivacyOptionProps) {
  const opt    = OPTIONS.find((o) => o.value === value)!;
  const active = selected === value;

  return (
    <div>
      <button
        onClick={() => onSelect(value)}
        className="flex items-center gap-3 w-full py-2 rounded px-2 transition-all cursor-pointer"
        style={{
          background: active ? "rgba(29,233,214,0.05)" : "transparent",
          border: "1px solid transparent",
          borderColor: active ? "rgba(29,233,214,0.15)" : "transparent",
        }}
      >
        <RadioDot active={active} />
        <div className="text-left">
          <div
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: active ? "var(--text-primary)" : "var(--text-muted)" }}
          >
            {opt.label}
          </div>
          <div
            className="text-[9px] uppercase tracking-wider"
            style={{ color: "var(--text-faint)" }}
          >
            {opt.sub}
          </div>
        </div>
      </button>

      {/* Password field — only for 'password' option when selected */}
      <AnimatePresence>
        {value === "password" && selected === "password" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-2 pb-1"
          >
            <div className="relative mt-1.5">
              {/* Corner notch */}
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l pointer-events-none z-10"
                style={{ borderColor: "rgba(29,233,214,0.45)" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="••••••"
                className="w-full px-3 py-2 text-xs rounded focus:outline-none"
                style={{
                  background: "rgba(6,20,26,0.80)",
                  border: "1px solid rgba(29,233,214,0.22)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
