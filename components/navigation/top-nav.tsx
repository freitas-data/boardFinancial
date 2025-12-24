import Link from "next/link";
import { getServerSession } from "next-auth";

import { DashboardActions } from "@/components/dashboard/dashboard-actions";
import { NavLinks } from "@/components/navigation/nav-links";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function TopNav() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const sections = userId
    ? await prisma.investmentSection.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" }
      })
    : [];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/70 bg-[hsl(var(--card))]/90 backdrop-blur">
      <div className="container flex h-16 items-center gap-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-[hsl(var(--secondary))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary))] shadow-sm shadow-black/20"
        >
          Controle<span className="text-[hsl(var(--foreground))]">Invest</span>
        </Link>

        <NavLinks />

        <div className="ml-auto flex items-center gap-3">
          {session?.user ? (
            <DashboardActions initialSections={sections} userName={session.user.name} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/">Entrar</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/register">Criar conta</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
