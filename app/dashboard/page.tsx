import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AddAssetDialog } from "@/components/dashboard/add-asset-dialog";
import { DashboardActions } from "@/components/dashboard/dashboard-actions";
import { SectionCard } from "@/components/dashboard/section-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StrategyUploader } from "@/components/dashboard/strategy-uploader";
import { deleteAssetAction } from "@/app/dashboard/asset-actions";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/");
  }

  const userId = Number(session.user.id);
  const sections = await prisma.investmentSection.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { assets: { orderBy: { createdAt: "asc" } } }
  });

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="container flex min-h-screen flex-col gap-8 py-10">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary))] bg-[hsl(var(--secondary))] shadow-sm shadow-black/20">
            Controle<span className="text-[hsl(var(--foreground))]">Invest</span>
          </div>
          <DashboardActions initialSections={sections} userName={session.user.name} />
        </div>

        <div className="grid gap-6">
          <Card className="shadow-xl shadow-black/25 bg-[hsl(var(--card))]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Suas seções</CardTitle>
                <AddAssetDialog sections={sections.map((s) => ({ id: s.id, name: s.name }))} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sections.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Nenhuma seção cadastrada. Clique em &ldquo;Configurar seções&rdquo; para criar.
                </p>
              ) : (
                sections.map((section) => <SectionCard key={section.id} section={section} />)
              )}
            </CardContent>
          </Card>

          <StrategyUploader sections={sections.map((s) => ({ id: s.id, name: s.name }))} />
        </div>

        <div className="text-center text-sm text-[hsl(var(--muted-foreground))]">
          Espaço protegido — bem-vindo, {session.user.name ?? "investidor"}.
        </div>
      </div>
    </main>
  );
}
