import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { AddAssetDialog } from "@/components/dashboard/add-asset-dialog";
import { SectionCard } from "@/components/dashboard/section-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StrategyUploader } from "@/components/dashboard/strategy-uploader";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { strategyModules } from "@/app/dashboard/modules";

export default async function AssetsPage() {
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
        <div className="grid gap-6">
          <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
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

          <StrategyUploader
            sections={sections.map((s) => ({ id: s.id, name: s.name }))}
            modules={strategyModules.map((m) => ({
              id: m.id,
              name: m.name,
              supportedExtensions: m.supportedExtensions
            }))}
          />
        </div>

        <div className="text-center text-sm text-[hsl(var(--muted-foreground))]">
          Espaço protegido — bem-vindo, {session.user.name ?? "investidor"}.
        </div>
      </div>
    </main>
  );
}
