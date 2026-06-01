"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PlayerAvatar from "./PlayerAvatar";
import type { GameRoom } from "@/lib/lobby/types";

// ── Mode badge ────────────────────────────────────────────────────────────

function ModeBadge({ mode }: { mode: GameRoom["mode"] }) {
  const cfg = {
    "60mins": { icon: "⏱", label: "60 mins",    color: "#1de9d6" },
    short:    { icon: "⚡", label: "Short Mode", color: "#d4a843" },
    full:     { icon: "👑", label: "Full Mode",  color: "#b06aff" },
  }[mode];

  return (
    <div className="flex items-center gap-1.5 w-28">
      <span className="text-sm">{cfg.icon}</span>
      <span
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: cfg.color }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

// ── Slot group ────────────────────────────────────────────────────────────

function SlotGroup({ slots }: { slots: GameRoom["founders"] }) {
  return (
    <div className="flex items-center gap-1">
      {slots.map((slot, i) => (
        <PlayerAvatar
          key={i}
          kind={slot.kind}
          avatarId={slot.avatarId}
          size="sm"
          showStatus={slot.status === "online"}
        />
      ))}
    </div>
  );
}

// ── Password unlock panel ─────────────────────────────────────────────────

function PasswordPanel({
  onSubmit,
  onCancel,
}: {
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const [pw, setPw] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0.85 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0.85 }}
      className="flex items-center gap-2 mt-2 origin-top"
    >
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && pw.trim() && onSubmit()}
        placeholder="Enter password"
        className="flex-1 px-3 py-1.5 text-xs rounded border focus:outline-none"
        style={{
          background: "rgba(6,20,26,0.85)",
          border: "1px solid rgba(29,233,214,0.25)",
          color: "var(--text-primary)",
          maxWidth: 140,
        }}
        autoFocus
      />
      <button
        onClick={() => pw.trim() && onSubmit()}
        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-all"
        style={{
          background: "rgba(29,233,214,0.12)",
          border: "1px solid rgba(29,233,214,0.4)",
          color: "#1de9d6",
        }}
      >
        JOIN
      </button>
      <button
        onClick={onCancel}
        className="text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
        style={{ color: "var(--text-faint)" }}
      >
        Cancel
      </button>
    </motion.div>
  );
}

// ── RoomRow ───────────────────────────────────────────────────────────────

interface RoomRowProps {
  room:  GameRoom;
  index: number;
}

export default function RoomRow({ room, index }: RoomRowProps) {
  const router     = useRouter();
  const [showPw, setShowPw] = useState(false);
  const isPassword = room.privacy === "password";

  function handleJoin() {
    if (isPassword) {
      setShowPw((v) => !v);
    } else {
      router.push(`/lobby/join/${room.id}`);
    }
  }

  function handlePwSubmit() {
    router.push(`/lobby/join/${room.id}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <div
        className="group relative transition-all duration-150"
        style={{
          borderBottom: "1px solid rgba(29,233,214,0.06)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "rgba(29,233,214,0.03)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
      >
        {/* Main row */}
        <div className="flex items-center gap-4 px-4 py-3 min-h-[56px]">
          {/* Game name */}
          <div className="flex-1 min-w-0">
            <span
              className="text-[11px] font-bold uppercase tracking-widest truncate block"
              style={{ color: "var(--text-primary)" }}
            >
              {room.name}
            </span>
          </div>

          {/* Mode */}
          <div className="w-28 flex-shrink-0">
            <ModeBadge mode={room.mode} />
          </div>

          {/* Founders */}
          <div className="w-[120px] flex-shrink-0">
            <SlotGroup slots={room.founders} />
          </div>

          {/* Investors */}
          <div className="w-[70px] flex-shrink-0">
            <SlotGroup slots={room.investors} />
          </div>

          {/* Join button */}
          <div className="w-[100px] flex-shrink-0 flex justify-end">
            {isPassword ? (
              <button
                onClick={handleJoin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                style={{
                  background: showPw
                    ? "rgba(29,233,214,0.10)"
                    : "rgba(255,255,255,0.04)",
                  border: showPw
                    ? "1px solid rgba(29,233,214,0.45)"
                    : "1px solid rgba(255,255,255,0.10)",
                  color: showPw ? "#1de9d6" : "var(--text-muted)",
                }}
              >
                <span>🔒</span> PASSWORD
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                style={{
                  background: "rgba(29,233,214,0.14)",
                  border: "1px solid rgba(29,233,214,0.55)",
                  color: "#1de9d6",
                  boxShadow: "0 0 16px rgba(29,233,214,0.15)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "rgba(29,233,214,0.24)";
                  el.style.boxShadow = "0 0 24px rgba(29,233,214,0.30)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.background = "rgba(29,233,214,0.14)";
                  el.style.boxShadow = "0 0 16px rgba(29,233,214,0.15)";
                }}
              >
                JOIN
              </button>
            )}
          </div>
        </div>

        {/* Inline password panel */}
        <AnimatePresence>
          {showPw && (
            <div className="px-4 pb-3">
              <PasswordPanel
                onSubmit={handlePwSubmit}
                onCancel={() => setShowPw(false)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
