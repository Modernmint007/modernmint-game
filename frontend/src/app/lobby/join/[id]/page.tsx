"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageBackground from "@/components/PageBackground";
import LobbyNavBar   from "@/components/lobby/LobbyNavBar";
import RoleCard       from "@/components/lobby/RoleCard";
import AvatarGrid     from "@/components/lobby/AvatarGrid";
import Button         from "@/components/ui/Button";
import Input          from "@/components/ui/Input";
import { fetchRoom, joinRoom, joinRoomWithPassword } from "@/lib/lobby/api";
import { ApiError } from "@/lib/api";
import type { GameRoom, GameMode, PlayerRole } from "@/lib/lobby/types";
import { useAuthGuard } from "@/lib/useAuthGuard";

// ── Divider ───────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="h-px my-5"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(29,233,214,0.3) 30%, rgba(212,168,67,0.2) 70%, transparent)",
      }}
    />
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function JoinGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ready    = useAuthGuard();
  const { id }   = use(params);
  const router   = useRouter();

  const [room,      setRoom]      = useState<GameRoom | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [roomPassword, setRoomPassword]   = useState("");

  const [role,      setRole]      = useState<PlayerRole>("founder");
  const [name,      setName]      = useState("");
  const [avatarId,  setAvatarId]  = useState<number | null>(1);
  const [starting,  setStarting]  = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Fetch the room on mount
  useEffect(() => {
    if (!ready) return;

    async function load() {
      try {
        const result = await fetchRoom(id);
        setRoom(result);
        // If password-protected, flag it so we can show the password input
        if (result.privacy === "password") {
          setNeedsPassword(true);
        }
      } catch (err) {
        setFetchError(
          err instanceof ApiError ? err.message : "Failed to load room."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [ready, id]);

  const modeLabel: Record<GameMode, string> = {
    "60mins": "60 Mins",
    short:    "Short Mode",
    full:     "Full Mode",
  };

  async function handleStart() {
    if (!name.trim() || !avatarId) return;
    setJoinError(null);
    setStarting(true);

    try {
      if (needsPassword) {
        await joinRoomWithPassword(id, {
          role,
          avatar_id:    avatarId,
          display_name: name.trim(),
          password:     roomPassword,
        });
      } else {
        await joinRoom(id, {
          role,
          avatar_id:    avatarId,
          display_name: name.trim(),
        });
      }
      // In production: navigate to game scene / Unity bridge
      router.push("/menu");
    } catch (err) {
      setJoinError(
        err instanceof ApiError ? err.message : "Failed to join room."
      );
      setStarting(false);
    }
  }

  if (!ready) return null;

  // ── Loading state ──
  if (loading) {
    return (
      <div className="relative flex flex-col h-screen overflow-hidden">
        <PageBackground />
        <LobbyNavBar title="Join Game" />
        <div className="flex-1 flex items-center justify-center">
          <span
            className="text-[11px] font-black uppercase tracking-[0.35em] animate-pulse"
            style={{ color: "var(--text-muted)" }}
          >
            Loading room...
          </span>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (fetchError || !room) {
    return (
      <div className="relative flex flex-col h-screen overflow-hidden">
        <PageBackground />
        <LobbyNavBar title="Join Game" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p
            className="text-[11px] font-black uppercase tracking-[0.3em]"
            style={{ color: "#ef4444" }}
          >
            ▲ {fetchError ?? "Room not found."}
          </p>
          <Button variant="ghost" size="md" onClick={() => router.push("/lobby")}>
            ◀ Back to Lobby
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      <PageBackground />
      <LobbyNavBar title="Join Game" />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center px-4 py-6">
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Game info header ── */}
          <div
            className="rounded-xl p-5 mb-6"
            style={{
              background: "rgba(6,20,26,0.85)",
              border: "1px solid rgba(29,233,214,0.18)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p
              className="text-[9px] font-black uppercase tracking-[0.45em] mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              You Are Joining
            </p>
            <h1
              className="text-xl font-black uppercase tracking-[0.12em] mb-3"
              style={{ color: "#1de9d6" }}
            >
              {room.name}
            </h1>

            {/* Meta pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                style={{
                  background: "rgba(29,233,214,0.08)",
                  border: "1px solid rgba(29,233,214,0.20)",
                  color: "#1de9d6",
                }}
              >
                ⏱ {modeLabel[room.mode]}
              </span>
              {room.privacy === "password" && (
                <span
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(212,168,67,0.08)",
                    border: "1px solid rgba(212,168,67,0.25)",
                    color: "#d4a843",
                  }}
                >
                  🔒 Password protected
                </span>
              )}
              {room.privacy === "open" && (
                <span
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(42,255,122,0.06)",
                    border: "1px solid rgba(42,255,122,0.20)",
                    color: "#2aff7a",
                  }}
                >
                  ✓ Open Room
                </span>
              )}
            </div>
          </div>

          {/* ── Main content grid ── */}
          <div
            className="rounded-xl p-6"
            style={{
              background: "rgba(6,20,26,0.85)",
              border: "1px solid rgba(29,233,214,0.14)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Section label */}
            <p
              className="text-[9px] font-black uppercase tracking-[0.4em] mb-4"
              style={{ color: "var(--gold)" }}
            >
              ◈ Choose Your Role
            </p>

            <div className="flex flex-col md:flex-row gap-6">
              {/* ── Left: role cards ── */}
              <div className="flex gap-4 flex-1">
                <RoleCard role="founder"  selected={role === "founder"}  onSelect={() => setRole("founder")}  />
                <RoleCard role="investor" selected={role === "investor"} onSelect={() => setRole("investor")} />
              </div>

              {/* ── Right: name + avatar ── */}
              <div className="flex flex-col gap-5 md:w-56">
                <Input
                  label="Name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                {/* Password field for password-protected rooms */}
                {needsPassword && (
                  <Input
                    label="Room Password"
                    type="password"
                    placeholder="Enter room password"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                  />
                )}

                <div>
                  <p
                    className="text-[9px] font-black uppercase tracking-[0.35em] mb-3"
                    style={{ color: "var(--gold)" }}
                  >
                    Choose Your Avatar
                  </p>
                  <AvatarGrid
                    selected={avatarId}
                    onSelect={setAvatarId}
                  />
                </div>
              </div>
            </div>

            {/* Error banner */}
            {joinError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 px-4 py-3 text-xs rounded-lg"
                style={{
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#ef4444",
                }}
              >
                ▲ {joinError}
              </motion.div>
            )}

            <Divider />

            {/* ── Actions ── */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/lobby")}
                className="text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-2 cursor-pointer transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--teal)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
              >
                ◀ BACK
              </button>

              <div className="flex-1" />

              <Button
                size="lg"
                loading={starting}
                disabled={
                  !name.trim() ||
                  (needsPassword && !roomPassword.trim())
                }
                onClick={handleStart}
              >
                ▶ Start Game
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
