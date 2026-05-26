import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modern Mint — Strategy Awaits",
  description:
    "High Interaction Simulation of Leadership, Negotiation & Psychology",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
