"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface LobbyNavBarProps {
  title?: string;
}

export default function LobbyNavBar({ title }: LobbyNavBarProps) {
  return (
    <motion.header
      className="flex-shrink-0 flex items-center px-5 h-12 z-20"
      style={{
        background: "rgba(3,9,12,0.88)",
        borderBottom: "1px solid rgba(29,233,214,0.12)",
        backdropFilter: "blur(12px)",
      }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hex icon mark — links back to menu */}
      <Link href="/menu" className="flex-shrink-0 flex items-center">
        <svg width="28" height="28" viewBox="0 0 84 84" fill="none">
          <polygon points="42,8 74,25.5 74,58.5 42,76 10,58.5 10,25.5"
            stroke="#1de9d6" strokeWidth="2" fill="rgba(29,233,214,0.05)" />
          <polygon points="42,16 66,29.5 66,54.5 42,68 18,54.5 18,29.5"
            stroke="#d4a843" strokeWidth="1" strokeOpacity="0.4" fill="rgba(212,168,67,0.04)" />
          <path d="M28 56V30L42 47L56 30V56"
            stroke="#d4a843" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <polygon points="42,36 48,42 42,48 36,42"
            stroke="#1de9d6" strokeWidth="1.5" fill="rgba(29,233,214,0.15)" />
        </svg>
      </Link>

      {/* Wordmark */}
      <div className="flex items-baseline gap-1 ml-3">
        <span
          className="font-black text-sm uppercase tracking-[0.18em]"
          style={{ color: "#d4a843" }}
        >
          MODERN
        </span>
        <span
          className="font-bold text-[9px] uppercase tracking-[0.35em]"
          style={{ color: "#1de9d6" }}
        >
          MINT
        </span>
      </div>

      {/* Vertical divider + optional page title */}
      {title && (
        <>
          <div
            className="w-px h-4 mx-3"
            style={{ background: "rgba(29,233,214,0.2)" }}
          />
          <span
            className="text-[10px] uppercase tracking-[0.35em] font-bold"
            style={{ color: "var(--text-muted)" }}
          >
            {title}
          </span>
        </>
      )}
    </motion.header>
  );
}
