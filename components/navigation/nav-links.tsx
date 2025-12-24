"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Resumo" },
  { href: "/assets", label: "Ativos" },
  { href: "/report", label: "Relatórios" }
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-semibold transition",
              "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
              active && "bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
