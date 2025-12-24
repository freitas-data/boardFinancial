"use client";

import { useState, useTransition } from "react";

import { updateAssetValues } from "@/app/dashboard/asset-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AssetInlineEditorProps = {
  assetId: number;
  priceUnit: number;
  averagePrice: number;
  quantity: number;
  action?: "comprar" | "vender" | "manter";
};

export function AssetInlineEditor({ assetId, priceUnit, averagePrice, quantity, action }: AssetInlineEditorProps) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState<string>(priceUnit ? priceUnit.toString() : "");
  const [avgPrice, setAvgPrice] = useState<string>(averagePrice ? averagePrice.toString() : "");
  const [qty, setQty] = useState<string>(quantity ? quantity.toString() : "");
  const [assetAction, setAssetAction] = useState<"comprar" | "vender" | "manter">(action ?? "comprar");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(() => {
      updateAssetValues(assetId, {
        priceUnit: price === "" ? 0 : Number(price),
        averagePrice: avgPrice === "" ? 0 : Number(avgPrice),
        quantity: qty === "" ? 0 : Number(qty),
        action: assetAction
      }).then((result) => {
        if (result?.error) {
          setError(result.error);
          return;
        }
        setEditing(false);
      });
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
        onClick={() => setEditing((prev) => !prev)}
      >
        {editing ? "Fechar" : "Editar"}
      </button>
      {editing ? (
        <div className="w-full rounded-lg bg-[hsl(var(--muted))]/40 p-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              placeholder="Preço médio"
              className="h-9 text-sm"
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Preço unitário"
              className="h-9 text-sm"
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Qtd"
              className="h-9 text-sm"
            />
            <select
              className="h-9 rounded-md border border-border bg-background px-2 text-sm text-[hsl(var(--foreground))]"
              value={assetAction}
              onChange={(e) => setAssetAction(e.target.value as "comprar" | "vender" | "manter")}
            >
              <option value="comprar">Comprar</option>
              <option value="manter">Manter</option>
              <option value="vender">Vender</option>
            </select>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Salvando..." : "OK"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          </div>
          {error ? <p className="text-xs font-semibold text-[hsl(var(--destructive))]">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
