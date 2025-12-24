"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

import { updateAssetsBulk } from "@/app/dashboard/asset-actions";
import { AssetList, type AssetDraft } from "@/components/dashboard/asset-list";

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
      averagePrice: number;
      ceilingPrice: number;
      fairPrice: number;
      quantity: number;
      targetPercentage: number;
      type: string;
      action?: string;
    }[];
  };
};

export function SectionCard({ section }: SectionCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, AssetDraft>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function normalizeAction(value?: string): "comprar" | "vender" | "manter" {
    if (value === "comprar" || value === "vender" || value === "manter") return value;
    return "comprar";
  }

  const normalizedAssets = section.assets.map((asset) => ({
    ...asset,
    action: normalizeAction(asset.action)
  }));

  function buildDrafts() {
    const next: Record<number, AssetDraft> = {};
    for (const asset of normalizedAssets) {
      next[asset.id] = {
        priceUnit: asset.priceUnit.toFixed(2),
        averagePrice: asset.averagePrice.toFixed(2),
        ceilingPrice: asset.ceilingPrice.toFixed(2),
        fairPrice: asset.fairPrice.toFixed(2),
        quantity: asset.quantity.toFixed(2),
        targetPercentage: asset.targetPercentage.toFixed(2),
        action: asset.action ?? "comprar"
      };
    }
    return next;
  }

  function handleDraftChange(assetId: number, patch: Partial<AssetDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [assetId]: {
        ...(prev[assetId] ?? buildDrafts()[assetId]),
        ...patch
      }
    }));
  }

  function toggleEdit() {
    if (!isEditing) {
      setDrafts(buildDrafts());
      setIsEditing(true);
      return;
    }

    setError(null);
    const payload = {
      sectionId: section.id,
      assets: normalizedAssets.map((asset) => {
        const draft = drafts[asset.id] ?? buildDrafts()[asset.id];
        return {
          id: asset.id,
          priceUnit: Number(draft.priceUnit) || 0,
          averagePrice: Number(draft.averagePrice) || 0,
          ceilingPrice: Number(draft.ceilingPrice) || 0,
          fairPrice: Number(draft.fairPrice) || 0,
          quantity: Number(draft.quantity) || 0,
          targetPercentage: Number(draft.targetPercentage) || 0,
          action: draft.action
        };
      })
    };

    startTransition(() => {
      updateAssetsBulk(payload).then((result) => {
        if (result.error) {
          setError(result.error);
          return;
        }
        setIsEditing(false);
        setDrafts({});
        router.refresh();
      });
    });
  }

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
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-[hsl(var(--primary))]">
            {section.targetPercentage.toFixed(2)}%
          </span>
          <button
            type="button"
            onClick={toggleEdit}
            className="min-w-[84px] rounded-md border border-border px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
            disabled={isPending || normalizedAssets.length === 0}
          >
            {isPending ? "Salvando..." : isEditing ? "Salvar" : "Editar"}
          </button>
        </div>
      </div>
      {error ? <p className="text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p> : null}

      {!collapsed ? (
        normalizedAssets.length ? (
          <AssetList
            assets={normalizedAssets}
            isEditing={isEditing}
            drafts={drafts}
            onDraftChange={handleDraftChange}
          />
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhum ativo nesta seção.</p>
        )
      ) : null}
    </div>
  );
}
