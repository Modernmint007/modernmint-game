"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getUser, clearSession } from "@/lib/auth";

const AVATAR_KEY = "mm_avatar_image";

interface LobbyNavBarProps {
  title?: string;
}

// ── Profile avatar ────────────────────────────────────────────────────────────
// Figma: ~64px circular photo with teal edit-badge in top-right corner

function ProfileAvatar() {
  const [initials, setInitials] = useState("MM");
  const [image, setImage]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = getUser();
    if (user?.username) {
      const parts = user.username.trim().split(/\s+/);
      setInitials(
        parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : user.username.slice(0, 2).toUpperCase()
      );
    }
    // Restore a previously-uploaded profile image (local only, no backend)
    try {
      const saved = localStorage.getItem(AVATAR_KEY);
      if (saved) setImage(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setImage(dataUrl);                 // immediate preview
      try {
        localStorage.setItem(AVATAR_KEY, dataUrl); // persist across refresh
      } catch {
        /* storage full / unavailable — preview still works */
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // allow re-selecting the same file
  }

  return (
    <div className="relative flex-shrink-0 select-none" style={{ width: 76, height: 76 }}>
      {/* Hidden file input driven by the edit badge */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handlePick}
        className="hidden"
      />

      {/* Avatar — circular photo with white border + green glow ring */}
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-black text-xl overflow-hidden"
        style={{
          background: image
            ? "#04190d"
            : "radial-gradient(circle at 38% 32%, rgba(40,220,110,0.55), rgba(4,26,13,0.96))",
          border: "3px solid #f2f7f3",
          color: "#d6ffe6",
          boxShadow:
            "0 0 22px rgba(43,214,115,0.55), inset 0 0 14px rgba(43,214,115,0.25)",
        }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>

      {/* Edit badge — opens the file picker */}
      <button
        type="button"
        title="Change profile photo"
        onClick={() => fileRef.current?.click()}
        className="absolute -top-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: "#23d3c4",
          border: "2.5px solid #04190d",
          boxShadow: "0 0 8px rgba(35,211,196,0.55)",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path
            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
            stroke="#04190d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Online status dot — bottom-left, matching Figma */}
      <span
        className="absolute bottom-1 left-1.5 w-3.5 h-3.5 rounded-full border-2"
        style={{
          background: "#2bff84",
          borderColor: "#04190d",
          boxShadow: "0 0 8px #2bff84",
        }}
      />
    </div>
  );
}

// ── Nav icon button ───────────────────────────────────────────────────────────

function NavIconButton({
  title,
  onClick,
  hoverColor = "#7dffb0",
  children,
}: {
  title: string;
  onClick?: () => void;
  hoverColor?: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150"
      style={{
        color: hovered ? hoverColor : "#bff0d2",
        background: hovered ? "rgba(43,214,115,0.22)" : "rgba(10,46,26,0.55)",
        border: "1px solid rgba(43,214,115,0.35)",
        boxShadow: hovered ? "0 0 14px rgba(43,214,115,0.35)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

// ── LobbyNavBar ───────────────────────────────────────────────────────────────

export default function LobbyNavBar({ title: _title }: LobbyNavBarProps) {
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <motion.header
      className="flex-shrink-0 relative flex items-center px-7 z-20"
      style={{ height: 112 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Left: profile avatar */}
      <div className="absolute left-7 top-1/2 -translate-y-1/2">
        <ProfileAvatar />
      </div>

      {/* Center: MODERN MINT wordmark — emerald metallic serif, the dominant element */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        <h1
          className="uppercase select-none"
          style={{
            fontFamily: "var(--font-cinzel), Georgia, serif",
            fontWeight: 900,
            fontSize: "clamp(34px, 5.2vw, 64px)",
            letterSpacing: "0.10em",
            backgroundImage:
              "linear-gradient(180deg, #fff3c4 0%, #f4d779 22%, #e7b53e 48%, #b8841f 74%, #8a5e16 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            WebkitTextStroke: "0.6px rgba(122,84,18,0.55)",
            filter:
              "drop-shadow(0 2px 1px rgba(40,24,4,0.55)) drop-shadow(0 0 20px rgba(231,181,62,0.55))",
          }}
        >
          MODERN MINT
        </h1>
      </div>

      {/* Right: action icons — Figma order: logout, then settings */}
      <div className="absolute right-7 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
        {/* Logout / exit */}
        <NavIconButton title="Logout" onClick={handleLogout} hoverColor="#ff8a8a">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
            <polyline
              points="16 17 21 12 16 7"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
            <line
              x1="21" y1="12" x2="9" y2="12"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </NavIconButton>

        {/* Settings */}
        <NavIconButton title="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              stroke="currentColor" strokeWidth="1.8"
            />
          </svg>
        </NavIconButton>
      </div>
    </motion.header>
  );
}
