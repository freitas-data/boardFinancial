"use client";

import { useMemo, useState } from "react";

import { deleteAssetAction } from "@/app/dashboard/asset-actions";
import { Input } from "@/components/ui/input";

type AssetRow = {
  id: number;
  ticker: string;
  name: string;
  priceUnit: number;
  averagePrice: number;
  ceilingPrice: number;
  fairPrice: number;
  quantity: number;
  targetPercentage: number;
  type: string;
  action?: "comprar" | "vender" | "manter";
};

type SortKey =
  | "ticker"
  | "name"
  | "averagePrice"
  | "priceUnit"
  | "ceilingPrice"
  | "fairPrice"
  | "quantity"
  | "total"
  | "targetPercentage";

const GRID_COLS =
  "grid-cols-[0.55fr_1.1fr_0.6fr_0.6fr_0.6fr_0.6fr_0.6fr_0.6fr_0.7fr_0.6fr_minmax(160px,0.9fr)]";

export type AssetDraft = {
  priceUnit: string;
  averagePrice: string;
  ceilingPrice: string;
  fairPrice: string;
  quantity: string;
  targetPercentage: string;
  action: "comprar" | "vender" | "manter";
};

function SortableHeader({
  label,
  active,
  direction,
  onClick,
  align = "left"
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "center" | "right";
}) {
  const alignClass =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full ${alignClass} text-xs font-semibold ${
        active ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"
      }`}
    >
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <span>{label}</span>
        {active ? <span>{direction === "asc" ? "↑" : "↓"}</span> : null}
      </span>
    </button>
  );
}

export function AssetList({
  assets,
  isEditing,
  drafts,
  onDraftChange
}: {
  assets: AssetRow[];
  isEditing: boolean;
  drafts: Record<number, AssetDraft>;
  onDraftChange: (assetId: number, patch: Partial<AssetDraft>) => void;
}) {
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
    key: "targetPercentage",
    direction: "desc"
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

  function renderActionLabel(value?: "comprar" | "vender" | "manter") {
    switch (value) {
      case "comprar":
        return "Comprar";
      case "vender":
        return "Vender";
      case "manter":
        return "Manter";
      default:
        return "Comprar";
    }
  }

  return (
    <div className="space-y-2">
      <div className={`grid ${GRID_COLS} items-center gap-2 px-3 text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))]`}>
        <SortableHeader
          label="Código"
          active={sort.key === "ticker"}
          direction={sort.direction}
          onClick={() => toggleSort("ticker")}
        />
        <SortableHeader
          label="Nome"
          active={sort.key === "name"}
          direction={sort.direction}
          onClick={() => toggleSort("name")}
        />
        <span className="w-full text-left text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">
          Ação
        </span>
        <SortableHeader
          label="Preço médio"
          active={sort.key === "averagePrice"}
          direction={sort.direction}
          onClick={() => toggleSort("averagePrice")}
        />
        <SortableHeader
          label="Preço unit."
          active={sort.key === "priceUnit"}
          direction={sort.direction}
          onClick={() => toggleSort("priceUnit")}
        />
        <SortableHeader
          label="Ceiling Price"
          active={sort.key === "ceilingPrice"}
          direction={sort.direction}
          onClick={() => toggleSort("ceilingPrice")}
        />
        <SortableHeader
          label="Fair Price"
          active={sort.key === "fairPrice"}
          direction={sort.direction}
          onClick={() => toggleSort("fairPrice")}
        />
        <SortableHeader
          label="Qtd"
          active={sort.key === "quantity"}
          direction={sort.direction}
          onClick={() => toggleSort("quantity")}
        />
        <SortableHeader
          label="Total"
          active={sort.key === "total"}
          direction={sort.direction}
          onClick={() => toggleSort("total")}
          align="right"
        />
        <SortableHeader
          label="Alvo %"
          active={sort.key === "targetPercentage"}
          direction={sort.direction}
          onClick={() => toggleSort("targetPercentage")}
          align="right"
        />
        <span className="text-right text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">Ações</span>
      </div>

      {sortedAssets.map((asset) => {
        const draft = drafts[asset.id] ?? {
          priceUnit: asset.priceUnit.toFixed(2),
          averagePrice: asset.averagePrice.toFixed(2),
          ceilingPrice: asset.ceilingPrice.toFixed(2),
          fairPrice: asset.fairPrice.toFixed(2),
          quantity: asset.quantity.toFixed(2),
          targetPercentage: asset.targetPercentage.toFixed(2),
          action: asset.action ?? "comprar"
        };
        const totalValue =
          (Number(draft.priceUnit || 0) || 0) * (Number(draft.quantity || 0) || 0);
        const actionValue = isEditing ? draft.action : asset.action ?? "comprar";
        const rowTone =
          actionValue === "manter"
            ? "border-[hsl(var(--amber))]/40 bg-[hsl(var(--amber))]/15"
            : "border-border/60 bg-[hsl(var(--secondary))]";
        return (
        <div
          key={asset.id}
          className={`grid ${GRID_COLS} ${rowTone} items-center gap-2 rounded-lg border px-3 py-2 text-sm text-[hsl(var(--foreground))]`}
        >
          <div className="font-semibold">{asset.ticker}</div>
          <div className="truncate text-[hsl(var(--muted-foreground))]">{asset.name}</div>
          {isEditing ? (
            <>
              <select
                className="h-8 rounded-md border border-border bg-background px-2 text-xs text-[hsl(var(--foreground))]"
                value={draft.action}
                onChange={(e) =>
                  onDraftChange(asset.id, { action: e.target.value as "comprar" | "vender" | "manter" })
                }
              >
                <option value="comprar">Comprar</option>
                <option value="manter">Manter</option>
                <option value="vender">Vender</option>
              </select>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="h-8 text-xs"
                value={draft.averagePrice}
                onChange={(e) => onDraftChange(asset.id, { averagePrice: e.target.value })}
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                className="h-8 text-xs"
                value={draft.priceUnit}
                onChange={(e) => onDraftChange(asset.id, { priceUnit: e.target.value })}
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                className="h-8 text-xs"
                value={draft.ceilingPrice}
                onChange={(e) => onDraftChange(asset.id, { ceilingPrice: e.target.value })}
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                className="h-8 text-xs"
                value={draft.fairPrice}
                onChange={(e) => onDraftChange(asset.id, { fairPrice: e.target.value })}
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                className="h-8 text-xs"
                value={draft.quantity}
                onChange={(e) => onDraftChange(asset.id, { quantity: e.target.value })}
              />
            </>
          ) : (
            <>
              <div className="text-left text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))]">
                {renderActionLabel(asset.action)}
              </div>
              <div className="text-left tabular-nums text-[hsl(var(--muted-foreground))]">
                R${asset.averagePrice.toFixed(2)}
              </div>
              <div className="text-left tabular-nums text-[hsl(var(--muted-foreground))]">
                R${asset.priceUnit.toFixed(2)}
              </div>
              <div className="text-left tabular-nums text-[hsl(var(--muted-foreground))]">
                R${asset.ceilingPrice.toFixed(2)}
              </div>
              <div className="text-left tabular-nums text-[hsl(var(--muted-foreground))]">
                R${asset.fairPrice.toFixed(2)}
              </div>
              <div className="text-left tabular-nums text-[hsl(var(--muted-foreground))]">
                {asset.quantity.toFixed(2)}
              </div>
            </>
          )}
          {isEditing ? (
            <div className="text-right tabular-nums text-[hsl(var(--muted-foreground))]">
              R${totalValue.toFixed(2)}
            </div>
          ) : (
            <div className="text-right tabular-nums text-[hsl(var(--muted-foreground))]">
              R${(asset.priceUnit * asset.quantity).toFixed(2)}
            </div>
          )}
          {isEditing ? (
            <Input
              type="number"
              min={0}
              max={100}
              step="0.01"
              className="h-8 text-xs text-right tabular-nums"
              value={draft.targetPercentage}
              onChange={(e) => onDraftChange(asset.id, { targetPercentage: e.target.value })}
            />
          ) : (
            <div className="text-right tabular-nums font-semibold text-[hsl(var(--primary))]">
              {asset.targetPercentage.toFixed(2)}%
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <form action={deleteAssetAction}>
              <input type="hidden" name="assetId" value={asset.id} />
              <button
                type="submit"
                className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
              >
                Remover
              </button>
            </form>
          </div>
        </div>
        );
      })}
    </div>
  );
}
