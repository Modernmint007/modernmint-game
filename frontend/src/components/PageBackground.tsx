"use client";

import { motion } from "framer-motion";

/**
 * Cinematic background that matches the Figma board atmosphere:
 * dark teal-black, circuit-board grid, teal corner glows, gold accent orb.
 */
export default function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Base colour — dark teal-black */}
      <div className="absolute inset-0" style={{ background: "var(--bg-deep)" }} />

      {/* Large radial atmosphere — teal top center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(29,233,214,0.09) 0%, transparent 65%)",
        }}
      />

      {/* Board-glow — center warm orb (matches the board centrepiece in Figma) */}
      <motion.div
        className="absolute"
        style={{
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(29,233,214,0.05) 0%, rgba(212,168,67,0.03) 40%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Circuit board grid — matches Figma board texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(var(--circuit) 1px, transparent 1px),
            linear-gradient(90deg, var(--circuit) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
        }}
      />

      {/* Circuit node dots at grid intersections */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(29,233,214,0.35) 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
          backgroundPosition: "26px 26px",
        }}
      />

      {/* Top-right corner glow */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(29,233,214,0.12) 0%, transparent 65%)",
        }}
      />

      {/* Bottom-left gold accent (matches board's warm center tones) */}
      <div
        className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 65%)",
        }}
      />

      {/* Top border chrome — mimics the teal horizontal bar in Figma */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(29,233,214,0.5) 20%, rgba(29,233,214,0.8) 50%, rgba(29,233,214,0.5) 80%, transparent)",
        }}
      />

      {/* Bottom border chrome */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(29,233,214,0.25) 50%, transparent)",
        }}
      />

      {/* Left vertical accent */}
      <div
        className="absolute top-0 left-0 bottom-0 w-px"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(29,233,214,0.3) 30%, rgba(29,233,214,0.3) 70%, transparent)",
        }}
      />

      {/* Right vertical accent */}
      <div
        className="absolute top-0 right-0 bottom-0 w-px"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(29,233,214,0.3) 30%, rgba(29,233,214,0.3) 70%, transparent)",
        }}
      />
    </div>
  );
}
