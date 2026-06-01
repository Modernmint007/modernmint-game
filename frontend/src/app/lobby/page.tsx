"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageBackground from "@/components/PageBackground";
import LobbyNavBar   from "@/components/lobby/LobbyNavBar";
import RoomRow        from "@/components/lobby/RoomRow";
import GlobalChat     from "@/components/lobby/GlobalChat";
import Button         from "@/components/ui/Button";
import { fetchRooms } from "@/lib/lobby/api";
import { useAuthGuard } from "@/lib/useAuthGuard";
import type { GameRoom } from "@/lib/lobby/types";

// ── Join-with-Password modal ──────────────────────────────────────────────

function JoinWithPasswordModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pw,   setPw]   = useState("");

  function handleSubmit() {
    if (!code.trim()) return;
    // In production: validate code + password against backend
    router.push(`/lobby/join/${code.trim()}`);
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl p-7"
        style={{
          background: "rgba(6,20,26,0.97)",
          border: "1px solid rgba(29,233,214,0.25)",
          boxShadow: "0 0 60px rgba(29,233,214,0.10)",
          backdropFilter: "blur(24px)",
        }}
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        {/* Header */}
        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.35em]"
            style={{ color: "var(--gold)" }}>
            🔒 Join with Password
          </span>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            Enter the room code and password to join a private game.
          </p>
        </div>

        {/* Room code */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-[10px] font-black uppercase tracking-[0.28em]"
            style={{ color: "var(--gold)" }}>
            Room Code
          </label>
          <div className="relative">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l z-10"
              style={{ borderColor: "rgba(29,233,214,0.45)" }} />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. MINT-4729"
              className="w-full px-4 py-2.5 text-sm rounded focus:outline-none"
              style={{
                background: "rgba(6,20,26,0.80)",
                border: "1px solid rgba(29,233,214,0.18)",
                color: "var(--text-primary)",
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-[10px] font-black uppercase tracking-[0.28em]"
            style={{ color: "var(--gold)" }}>
            Password
          </label>
          <div className="relative">
            <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l z-10"
              style={{ borderColor: "rgba(29,233,214,0.45)" }} />
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm rounded focus:outline-none"
              style={{
                background: "rgba(6,20,26,0.80)",
                border: "1px solid rgba(29,233,214,0.18)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button size="md" className="flex-1" onClick={handleSubmit}>
            Join Room
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Table header row ──────────────────────────────────────────────────────

function TableHeader() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-2"
      style={{ borderBottom: "1px solid rgba(29,233,214,0.12)" }}
    >
      <div className="flex-1">
        <span className="text-[9px] font-black uppercase tracking-[0.35em]"
          style={{ color: "var(--gold)" }}>
          Game Name
        </span>
      </div>
      <div className="w-28 flex-shrink-0">
        <span className="text-[9px] font-black uppercase tracking-[0.35em]"
          style={{ color: "var(--gold)" }}>
          Mode
        </span>
      </div>
      <div className="w-[120px] flex-shrink-0">
        <span className="text-[9px] font-black uppercase tracking-[0.3em]"
          style={{ color: "var(--gold)" }}>
          Founders (Max 4)
        </span>
      </div>
      <div className="w-[70px] flex-shrink-0">
        <span className="text-[9px] font-black uppercase tracking-[0.3em]"
          style={{ color: "var(--gold)" }}>
          Investors (Max 2)
        </span>
      </div>
      <div className="w-[100px] flex-shrink-0 flex justify-end">
        <span className="text-[9px] font-black uppercase tracking-[0.35em]"
          style={{ color: "var(--gold)" }}>
          Join
        </span>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <span className="text-3xl opacity-30">🎮</span>
      <p
        className="text-[11px] font-black uppercase tracking-[0.35em]"
        style={{ color: "var(--text-muted)" }}
      >
        No rooms available
      </p>
      <p
        className="text-[10px] uppercase tracking-widest"
        style={{ color: "var(--text-faint)" }}
      >
        Be the first — create a game!
      </p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function LobbyPage() {
  const ready     = useAuthGuard();
  const router    = useRouter();
  const [showPwModal, setShowPwModal] = useState(false);
  const [rooms,    setRooms]    = useState<GameRoom[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchRooms();
      setRooms(data);
    } catch (err) {
      setError((err as Error).message ?? "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    startTransition(() => { loadRooms(); });
  }, [ready, loadRooms]);

  if (!ready) return null;

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      <PageBackground />

      {/* Nav bar */}
      <LobbyNavBar />

      {/* Body: table + chat */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: game list ── */}
        <motion.div
          className="flex flex-col flex-1 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          {/* Header strip */}
          <div
            className="flex-shrink-0 px-4 py-2.5 flex items-center gap-3"
            style={{ borderBottom: "1px solid rgba(29,233,214,0.08)" }}
          >
            <span
              className="text-[9px] font-black uppercase tracking-[0.4em]"
              style={{ color: "var(--gold)" }}
            >
              ◈ Live Rooms
            </span>
            {!loading && (
              <span
                className="px-2 py-0.5 rounded text-[9px] font-bold"
                style={{
                  background: "rgba(29,233,214,0.10)",
                  border: "1px solid rgba(29,233,214,0.25)",
                  color: "#1de9d6",
                }}
              >
                {rooms.length} online
              </span>
            )}
            {/* Refresh button */}
            <button
              onClick={loadRooms}
              disabled={loading}
              className="ml-auto text-[9px] uppercase tracking-widest font-bold transition-colors duration-150 cursor-pointer disabled:opacity-40"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--teal)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              ↻ Refresh
            </button>
          </div>

          {/* Column headers */}
          <TableHeader />

          {/* Scrollable room list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <span
                  className="text-[11px] font-black uppercase tracking-[0.35em] animate-pulse"
                  style={{ color: "var(--text-muted)" }}
                >
                  Loading rooms...
                </span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <p
                  className="text-[11px] font-black uppercase tracking-[0.3em]"
                  style={{ color: "#ef4444" }}
                >
                  ▲ {error}
                </p>
                <Button size="sm" variant="ghost" onClick={loadRooms}>
                  Retry
                </Button>
              </div>
            ) : rooms.length === 0 ? (
              <EmptyState />
            ) : (
              rooms.map((room, i) => (
                <RoomRow key={room.id} room={room} index={i} />
              ))
            )}
          </div>

          {/* Bottom action bar */}
          <motion.div
            className="flex-shrink-0 flex items-center gap-4 px-4 py-3"
            style={{
              borderTop: "1px solid rgba(29,233,214,0.08)",
              background: "rgba(3,9,12,0.60)",
              backdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {/* Back link */}
            <button
              onClick={() => router.push("/menu")}
              className="text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-2 cursor-pointer transition-colors duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--teal)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              ◀ BACK
            </button>

            <div className="flex-1" />

            {/* Create own game */}
            <Button
              size="md"
              onClick={() => router.push("/lobby/create")}
            >
              🎮 Create Own Game
            </Button>

            {/* Join with password */}
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowPwModal(true)}
            >
              🔒 Join with Password
            </Button>
          </motion.div>
        </motion.div>

        {/* ── Right: global chat ── */}
        <GlobalChat />
      </div>

      {/* Modal overlay */}
      <AnimatePresence>
        {showPwModal && (
          <JoinWithPasswordModal onClose={() => setShowPwModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
