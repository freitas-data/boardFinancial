import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { ReportCharts } from "@/components/report/report-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ReportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/");
  }

  const userId = Number(session.user.id);
  const sections = await prisma.investmentSection.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      assets: {
        select: {
          id: true,
          name: true,
          ticker: true,
          priceUnit: true,
          averagePrice: true,
          fairPrice: true,
          ceilingPrice: true,
          quantity: true,
          targetPercentage: true
        }
      }
    }
  });

  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  const sectionTotals = new Map<number, number>();
  let portfolioTotal = 0;
  let totalAssets = 0;

  for (const section of sections) {
    const value = section.assets.reduce((sum, asset) => sum + asset.priceUnit * asset.quantity, 0);
    sectionTotals.set(section.id, value);
    portfolioTotal += value;
    totalAssets += section.assets.length;
  }

  const sectionSummary = sections.map((section) => {
    const totalValue = sectionTotals.get(section.id) ?? 0;
    const actualPct = portfolioTotal > 0 ? (totalValue / portfolioTotal) * 100 : 0;
    const targetPct = section.targetPercentage;
    const coveragePct = targetPct > 0 ? (actualPct / targetPct) * 100 : 0;
    const gapPct = actualPct - targetPct;
    return {
      id: section.id,
      name: section.name,
      totalValue,
      assetCount: section.assets.length,
      actualPct,
      targetPct,
      coveragePct,
      gapPct
    };
  });

  const assetInsights = sections.flatMap((section) => {
    const sectionValue = sectionTotals.get(section.id) ?? 0;
    return section.assets.map((asset) => {
      const value = asset.priceUnit * asset.quantity;
      const actualSectionPct = sectionValue > 0 ? (value / sectionValue) * 100 : 0;
      const overPct = actualSectionPct - asset.targetPercentage;
      const fairGap = asset.fairPrice > 0 ? asset.fairPrice - asset.priceUnit : 0;
      const fairGapPct = asset.fairPrice > 0 ? (fairGap / asset.fairPrice) * 100 : 0;
      const ceilingGap = asset.ceilingPrice > 0 ? asset.priceUnit - asset.ceilingPrice : 0;
      const ceilingGapPct = asset.ceilingPrice > 0 ? (ceilingGap / asset.ceilingPrice) * 100 : 0;
      return {
        id: asset.id,
        ticker: asset.ticker,
        name: asset.name,
        sectionName: section.name,
        value,
        priceUnit: asset.priceUnit,
        quantity: asset.quantity,
        targetPct: asset.targetPercentage,
        actualSectionPct,
        overPct,
        fairPrice: asset.fairPrice,
        fairGap,
        fairGapPct,
        ceilingPrice: asset.ceilingPrice,
        ceilingGap,
        ceilingGapPct
      };
    });
  });

  const overTargetAssets = assetInsights
    .filter((asset) => asset.overPct > 0)
    .sort((a, b) => b.overPct - a.overPct)
    .slice(0, 12);

  const nearFair = assetInsights
    .filter((asset) => asset.fairPrice > 0 && asset.priceUnit > 0 && asset.priceUnit <= asset.fairPrice)
    .sort((a, b) => a.fairGap - b.fairGap)
    .slice(0, 10);

  const discountToFair = assetInsights
    .filter((asset) => asset.fairPrice > 0 && asset.priceUnit > 0 && asset.priceUnit < asset.fairPrice)
    .sort((a, b) => b.fairGapPct - a.fairGapPct)
    .slice(0, 10);

  const aboveCeiling = assetInsights
    .filter((asset) => asset.ceilingPrice > 0 && asset.priceUnit > 0 && asset.priceUnit > asset.ceilingPrice)
    .sort((a, b) => b.ceilingGapPct - a.ceilingGapPct)
    .slice(0, 10);

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="container flex min-h-screen flex-col gap-8 py-10">
        <div className="grid gap-6">
          <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
            <CardHeader>
              <CardTitle>Relatório executivo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[hsl(var(--muted-foreground))]">
              Panorama consolidado das suas seções, principais desvios e oportunidades detectadas.
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                  Valor total
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                {currency.format(portfolioTotal)}
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                  Seções ativas
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                {sectionSummary.length}
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                  Ativos
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                {totalAssets}
              </CardContent>
            </Card>
            <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                  Acima do alvo
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                {assetInsights.filter((asset) => asset.overPct > 0).length}
              </CardContent>
            </Card>
          </div>

          <ReportCharts
            sections={sectionSummary.map((section) => ({
              name: section.name,
              actualPct: Number(section.actualPct.toFixed(2)),
              targetPct: Number(section.targetPct.toFixed(2)),
              totalValue: section.totalValue
            }))}
          />

          <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
            <CardHeader>
              <CardTitle>Cobertura da meta por seção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionSummary.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhuma seção cadastrada.</p>
              ) : (
                sectionSummary.map((section) => {
                  const coverage = Number.isFinite(section.coveragePct) ? section.coveragePct : 0;
                  const barWidth = Math.min(coverage, 100);
                  const statusTone =
                    section.gapPct >= 0 ? "text-[hsl(var(--amber))]" : "text-[hsl(var(--accent))]";
                  return (
                    <div
                      key={section.id}
                      className="rounded-lg border border-border/70 bg-[hsl(var(--secondary))] px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{section.name}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {section.assetCount} ativo{section.assetCount === 1 ? "" : "s"} •{" "}
                            {currency.format(section.totalValue)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            Atual {section.actualPct.toFixed(2)}% • Meta {section.targetPct.toFixed(2)}%
                          </p>
                          <p className={`text-xs font-semibold ${statusTone}`}>
                            Cobertura {coverage.toFixed(1)}% ({section.gapPct >= 0 ? "+" : ""}
                            {section.gapPct.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-[hsl(var(--border))]/40">
                        <div
                          className={`h-2 rounded-full ${
                            section.gapPct >= 0 ? "bg-[hsl(var(--amber))]" : "bg-[hsl(var(--accent))]"
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
              <CardHeader>
                <CardTitle>Acima do recomendado (top 12)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overTargetAssets.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Nenhum ativo acima do recomendado.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1.2fr_0.9fr_0.5fr_0.5fr_0.5fr] gap-2 text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      <span>Ativo</span>
                      <span>Seção</span>
                      <span className="text-right">Alvo</span>
                      <span className="text-right">Atual</span>
                      <span className="text-right">Excesso</span>
                    </div>
                    {overTargetAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="grid grid-cols-[1.2fr_0.9fr_0.5fr_0.5fr_0.5fr] items-center gap-2 rounded-lg border border-border/70 bg-[hsl(var(--secondary))] px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-[hsl(var(--foreground))]">{asset.ticker}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{asset.name}</p>
                        </div>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{asset.sectionName}</span>
                        <span className="text-right text-xs text-[hsl(var(--muted-foreground))]">
                          {asset.targetPct.toFixed(2)}%
                        </span>
                        <span className="text-right text-xs text-[hsl(var(--muted-foreground))]">
                          {asset.actualSectionPct.toFixed(2)}%
                        </span>
                        <span className="text-right text-xs font-semibold text-[hsl(var(--amber))]">
                          +{asset.overPct.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
              <CardHeader>
                <CardTitle>Mais próximos do Fair Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nearFair.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Nenhum ativo com Fair Price definido.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1.1fr_0.6fr_0.6fr_0.6fr] gap-2 text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      <span>Ativo</span>
                      <span className="text-right">Preço</span>
                      <span className="text-right">Fair</span>
                      <span className="text-right">Distância</span>
                    </div>
                    {nearFair.map((asset) => (
                      <div
                        key={asset.id}
                        className="grid grid-cols-[1.1fr_0.6fr_0.6fr_0.6fr] items-center gap-2 rounded-lg border border-border/70 bg-[hsl(var(--secondary))] px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-[hsl(var(--foreground))]">{asset.ticker}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{asset.sectionName}</p>
                        </div>
                        <span className="text-right text-xs text-[hsl(var(--muted-foreground))]">
                          {currency.format(asset.priceUnit)}
                        </span>
                        <span className="text-right text-xs text-[hsl(var(--muted-foreground))]">
                          {currency.format(asset.fairPrice)}
                        </span>
                        <span className="text-right text-xs font-semibold text-[hsl(var(--accent))]">
                          {currency.format(asset.fairGap)} ({asset.fairGapPct.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
              <CardHeader>
                <CardTitle>Descontos vs. Fair Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {discountToFair.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Nenhum desconto relevante encontrado.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1.1fr_0.6fr_0.6fr_0.6fr] gap-2 text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      <span>Ativo</span>
                      <span className="text-right">Preço</span>
                      <span className="text-right">Fair</span>
                      <span className="text-right">Desconto</span>
                    </div>
                    {discountToFair.map((asset) => (
                      <div
                        key={asset.id}
                        className="grid grid-cols-[1.1fr_0.6fr_0.6fr_0.6fr] items-center gap-2 rounded-lg border border-border/70 bg-[hsl(var(--secondary))] px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-[hsl(var(--foreground))]">{asset.ticker}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{asset.sectionName}</p>
                        </div>
                        <span className="text-right text-xs text-[hsl(var(--muted-foreground))]">
                          {currency.format(asset.priceUnit)}
                        </span>
                        <span className="text-right text-xs text-[hsl(var(--muted-foreground))]">
                          {currency.format(asset.fairPrice)}
                        </span>
                        <span className="text-right text-xs font-semibold text-[hsl(var(--accent))]">
                          {asset.fairGapPct.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[hsl(var(--card))] shadow-xl shadow-black/25">
              <CardHeader>
                <CardTitle>Acima do Ceiling Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aboveCeiling.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Nenhum ativo acima do preço limite.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1.1fr_0.6fr_0.6fr_0.6fr] gap-2 text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                      <span>Ativo</span>
                      <span className="text-right">Preço</span>
                      <span className="text-right">Ceiling</span>
                      <span className="text-right">Excesso</span>
                    </div>
                    {aboveCeiling.map((asset) => (
                      <div
                        key={asset.id}
                        className="grid grid-cols-[1.1fr_0.6fr_0.6fr_0.6fr] items-center gap-2 rounded-lg border border-border/70 bg-[hsl(var(--secondary))] px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-[hsl(var(--foreground))]">{asset.ticker}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{asset.sectionName}</p>
                        </div>
                        <span className="text-right text-xs text-[hsl(var(--muted-foreground))]">
                          {currency.format(asset.priceUnit)}
                        </span>
                        <span className="text-right text-xs text-[hsl(var(--muted-foreground))]">
                          {currency.format(asset.ceilingPrice)}
                        </span>
                        <span className="text-right text-xs font-semibold text-[hsl(var(--amber))]">
                          +{asset.ceilingGapPct.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center text-sm text-[hsl(var(--muted-foreground))]">
          Espaço protegido — bem-vindo, {session.user.name ?? "investidor"}.
        </div>
      </div>
    </main>
  );
}
