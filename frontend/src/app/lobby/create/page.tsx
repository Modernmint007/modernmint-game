"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageBackground  from "@/components/PageBackground";
import LobbyNavBar     from "@/components/lobby/LobbyNavBar";
import SlotCard        from "@/components/lobby/SlotCard";
import ModeCard        from "@/components/lobby/ModeCard";
import PrivacyOption   from "@/components/lobby/PrivacyOption";
import Button          from "@/components/ui/Button";
import Input           from "@/components/ui/Input";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { getUser }     from "@/lib/auth";
import { createRoom }  from "@/lib/lobby/api";
import { ApiError }    from "@/lib/api";
import type {
  AIDifficulty,
  GameMode,
  RoomPrivacy,
  SlotDropdown,
  CreateSlot,
} from "@/lib/lobby/types";

// ── Initial slots ─────────────────────────────────────────────────────────

function makeFounderSlots(username: string): CreateSlot[] {
  return [
    { dropdown: "You",    avatarId: 2, name: username },  // always "You"
    { dropdown: "Open",   avatarId: 5, name: "" },
    { dropdown: "Open",   avatarId: 5, name: "" },
    { dropdown: "AI",     avatarId: 1, name: "" },
  ];
}

function makeInvestorSlots(): CreateSlot[] {
  return [
    { dropdown: "Open",   avatarId: 5, name: "" },
    { dropdown: "Open",   avatarId: 5, name: "" },
  ];
}

// ── Difficulty radio item ─────────────────────────────────────────────────

const DIFFICULTIES: AIDifficulty[] = [
  "easy", "medium", "hard", "unfair", "expert", "legendary",
];

function DifficultyRadio({
  value,
  selected,
  onSelect,
}: {
  value: AIDifficulty;
  selected: AIDifficulty;
  onSelect: (v: AIDifficulty) => void;
}) {
  const active = selected === value;
  const colorMap: Partial<Record<AIDifficulty, string>> = {
    easy:      "#2aff7a",
    medium:    "#1de9d6",
    hard:      "#d4a843",
    unfair:    "#ff7a2a",
    expert:    "#ff4a8a",
    legendary: "#b06aff",
  };
  const color = colorMap[value] ?? "#1de9d6";

  return (
    <button
      onClick={() => onSelect(value)}
      className="flex items-center gap-2.5 py-1.5 w-full cursor-pointer transition-all rounded px-2"
      style={{
        background: active ? `${color}0e` : "transparent",
      }}
    >
      {/* Radio dot */}
      <div
        className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ border: `1.5px solid ${active ? color : "rgba(29,233,214,0.22)"}` }}
      >
        {active && (
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: color }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          />
        )}
      </div>
      <span
        className="text-[11px] font-bold uppercase tracking-wider capitalize"
        style={{ color: active ? color : "var(--text-muted)" }}
      >
        {value}
      </span>
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────

function Section({
  label,
  badge,
  children,
}: {
  label:    string;
  badge?:   string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "rgba(6,20,26,0.85)",
        border: "1px solid rgba(29,233,214,0.12)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className="text-[9px] font-black uppercase tracking-[0.4em]"
          style={{ color: "var(--gold)" }}
        >
          {label}
        </span>
        {badge && (
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{
              background: "rgba(29,233,214,0.08)",
              border: "1px solid rgba(29,233,214,0.18)",
              color: "rgba(29,233,214,0.7)",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function CreateGamePage() {
  const ready   = useAuthGuard();
  const router  = useRouter();

  // getUser() uses localStorage — must be client-side only.
  // Declare state before the effect so the effect can reference the setter.
  const [username,     setUsername]     = useState("You");
  const [roomName,     setRoomName]     = useState("");
  const [founderSlots, setFounderSlots] = useState<CreateSlot[]>(() => makeFounderSlots("You"));

  useEffect(() => {
    const user = getUser();
    if (user?.username) {
      startTransition(() => {
        setUsername(user.username);
        setFounderSlots(makeFounderSlots(user.username));
      });
    }
  }, []);
  const [investorSlots, setInvestorSlots] = useState<CreateSlot[]>(makeInvestorSlots);
  const [difficulty,    setDifficulty]    = useState<AIDifficulty>("easy");
  const [mode,          setMode]          = useState<GameMode>("60mins");
  const [privacy,       setPrivacy]       = useState<RoomPrivacy>("open");
  const [password,      setPassword]      = useState("");
  const [starting,      setStarting]      = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  // Update founder slot dropdown
  function updateFounder(i: number, dropdown: SlotDropdown) {
    setFounderSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, dropdown } : s));
  }

  // Update investor slot dropdown
  function updateInvestor(i: number, dropdown: SlotDropdown) {
    setInvestorSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, dropdown } : s));
  }

  async function handleStart() {
    if (!roomName.trim()) {
      setError("Please enter a room name.");
      return;
    }
    setError(null);
    setStarting(true);

    try {
      // Count AI slots from the UI config
      const aiFounders  = founderSlots.filter((s, i) => i !== 0 && s.dropdown === "AI").length;
      const aiInvestors = investorSlots.filter((s) => s.dropdown === "AI").length;

      const room = await createRoom({
        name:          roomName.trim(),
        mode,
        privacy,
        password:      privacy === "password" ? password : undefined,
        ai_difficulty: difficulty,
        max_founders:  4,
        max_investors: 2,
        ai_founders:   aiFounders,
        ai_investors:  aiInvestors,
        avatar_id:     founderSlots[0].avatarId,
        display_name:  username,
      });

      router.push(`/lobby/join/${room.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create room.");
      setStarting(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      <PageBackground />
      <LobbyNavBar title="Create New Game" />

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Room Name ── */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "rgba(6,20,26,0.85)",
              border: "1px solid rgba(29,233,214,0.12)",
              backdropFilter: "blur(16px)",
            }}
          >
            <Input
              label="Room Name"
              placeholder="e.g. Global Leaders Summit"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              hint="Up to 80 characters"
              maxLength={80}
            />
          </div>

          {/* ── Founders ── */}
          <Section label="Founders" badge="Max 4">
            <div className="flex gap-3">
              {founderSlots.map((slot, i) => (
                <SlotCard
                  key={i}
                  index={i}
                  dropdown={slot.dropdown}
                  avatarId={slot.avatarId}
                  name={slot.name}
                  onChange={(d) => updateFounder(i, d)}
                  isYou={i === 0}
                />
              ))}
            </div>
          </Section>

          {/* ── Investors ── */}
          <Section label="Investors" badge="Max 2">
            <div className="flex gap-3">
              {investorSlots.map((slot, i) => (
                <SlotCard
                  key={i}
                  index={i}
                  dropdown={slot.dropdown}
                  avatarId={slot.avatarId}
                  name={slot.name}
                  onChange={(d) => updateInvestor(i, d)}
                />
              ))}
              {/* Spacer to keep layout consistent */}
              <div className="flex-1 invisible" />
              <div className="flex-1 invisible" />
            </div>
          </Section>

          {/* ── Options row: difficulty | mode | privacy ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* AI Difficulty */}
            <Section label="AI Difficulty">
              <div className="flex flex-col gap-0.5">
                {DIFFICULTIES.map((d) => (
                  <DifficultyRadio
                    key={d}
                    value={d}
                    selected={difficulty}
                    onSelect={setDifficulty}
                  />
                ))}
              </div>
            </Section>

            {/* Mode */}
            <Section label="Mode">
              <div className="flex flex-col gap-3">
                {(["60mins", "short", "full"] as GameMode[]).map((m) => (
                  <ModeCard
                    key={m}
                    mode={m}
                    selected={mode === m}
                    onSelect={() => setMode(m)}
                  />
                ))}
              </div>
            </Section>

            {/* Privacy */}
            <Section label="Game Privacy">
              <div className="flex flex-col gap-1">
                {(["open", "closed", "password"] as RoomPrivacy[]).map((v) => (
                  <PrivacyOption
                    key={v}
                    value={v}
                    selected={privacy}
                    onSelect={setPrivacy}
                    password={password}
                    onPasswordChange={setPassword}
                  />
                ))}
              </div>
            </Section>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-4 py-3 text-xs rounded-lg"
              style={{
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#ef4444",
              }}
            >
              ▲ {error}
            </motion.div>
          )}

          {/* ── Bottom bar ── */}
          <div className="flex items-center gap-4 pt-1 pb-2">
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
              disabled={!roomName.trim()}
              onClick={handleStart}
            >
              ▶ Start Game
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
