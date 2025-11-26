"use client";

import { useMemo, useState } from "react";

import { deleteAssetAction } from "@/app/dashboard/asset-actions";
import { AssetInlineEditor } from "@/components/dashboard/asset-inline-editor";

type AssetRow = {
  id: number;
  ticker: string;
  name: string;
  priceUnit: number;
  quantity: number;
  targetPercentage: number;
  type: string;
};

type SortKey = "ticker" | "name" | "priceUnit" | "quantity" | "total" | "targetPercentage";

function SortableHeader({
  label,
  active,
  direction,
  onClick
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-semibold ${active ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"}`}
    >
      {label} {active ? (direction === "asc" ? "↑" : "↓") : ""}
    </button>
  );
}

export function AssetList({ assets }: { assets: AssetRow[] }) {
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "ticker",
    direction: "asc"
  });

  const sortedAssets = useMemo(() => {
    const copy = [...assets];
    copy.sort((a, b) => {
      const totalA = a.priceUnit * a.quantity;
      const totalB = b.priceUnit * b.quantity;
      const valA =
        sort.key === "total" ? totalA : (a as Record<string, any>)[sort.key];
      const valB =
        sort.key === "total" ? totalB : (b as Record<string, any>)[sort.key];
      if (typeof valA === "string" && typeof valB === "string") {
        return sort.direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;
      return sort.direction === "asc" ? numA - numB : numB - numA;
    });
    return copy;
  }, [assets, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[0.5fr_1fr_0.8fr_0.6fr_0.6fr_0.8fr_auto] items-center gap-2 px-3 text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        <SortableHeader label="Código" active={sort.key === "ticker"} direction={sort.direction} onClick={() => toggleSort("ticker")} />
        <SortableHeader label="Nome" active={sort.key === "name"} direction={sort.direction} onClick={() => toggleSort("name")} />
        <SortableHeader label="Preço" active={sort.key === "priceUnit"} direction={sort.direction} onClick={() => toggleSort("priceUnit")} />
        <SortableHeader label="Qtd" active={sort.key === "quantity"} direction={sort.direction} onClick={() => toggleSort("quantity")} />
        <SortableHeader label="Total" active={sort.key === "total"} direction={sort.direction} onClick={() => toggleSort("total")} />
        <SortableHeader label="Alvo %" active={sort.key === "targetPercentage"} direction={sort.direction} onClick={() => toggleSort("targetPercentage")} />
        <span className="text-right text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">Ações</span>
      </div>

      {sortedAssets.map((asset) => (
        <div
          key={asset.id}
          className="grid grid-cols-[0.5fr_1fr_0.8fr_0.6fr_0.6fr_0.8fr_auto] items-center gap-2 rounded-lg border border-border/60 bg-[hsl(var(--secondary))] px-3 py-2 text-sm text-[hsl(var(--foreground))]"
        >
          <div className="font-semibold">{asset.ticker}</div>
          <div className="truncate text-[hsl(var(--muted-foreground))]">{asset.name}</div>
          <div className="text-[hsl(var(--muted-foreground))]">R${asset.priceUnit.toFixed(2)}</div>
          <div className="text-[hsl(var(--muted-foreground))]">{asset.quantity.toFixed(2)}</div>
          <div className="text-[hsl(var(--muted-foreground))]">
            R${(asset.priceUnit * asset.quantity).toFixed(2)}
          </div>
          <div className="text-[hsl(var(--primary))] font-semibold">{asset.targetPercentage.toFixed(2)}%</div>
          <div className="flex items-center gap-2 justify-end">
            <form action={deleteAssetAction}>
              <input type="hidden" name="assetId" value={asset.id} />
              <button
                type="submit"
                className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
              >
                Remover
              </button>
            </form>
            <AssetInlineEditor assetId={asset.id} priceUnit={asset.priceUnit} quantity={asset.quantity} />
          </div>
        </div>
      ))}
    </div>
  );
}
