"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { AssetList } from "@/components/dashboard/asset-list";

type SectionCardProps = {
  section: {
    id: number;
    name: string;
    targetPercentage: number;
    assets: {
      id: number;
      ticker: string;
      name: string;
      priceUnit: number;
      quantity: number;
      targetPercentage: number;
      type: string;
    }[];
  };
};

export function SectionCard({ section }: SectionCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-[hsl(var(--card))] px-4 py-3 shadow-sm shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/30"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {collapsed ? "Mostrar" : "Ocultar"}
          </button>
          <div className="flex flex-col">
            <span className="text-[hsl(var(--foreground))] font-semibold">{section.name}</span>
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              Meta: {section.targetPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
        <span className="text-lg font-semibold text-[hsl(var(--primary))]">
          {section.targetPercentage.toFixed(2)}%
        </span>
      </div>

      {!collapsed ? (
        section.assets.length ? (
          <AssetList assets={section.assets} />
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhum ativo nesta seção.</p>
        )
      ) : null}
    </div>
  );
}
