import type { Metadata } from "next";
import "./globals.css";

import { TopNav } from "@/components/navigation/top-nav";

export const metadata: Metadata = {
  title: "BoardFinancial | Investment Analysis SaaS",
  description: "XP-inspired investment analysis platform for allocations and insights."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans min-h-screen bg-[hsl(var(--background))] text-foreground antialiased"
      >
        <TopNav />
        <div className="pt-20">{children}</div>
      </body>
    </html>
  );
}
