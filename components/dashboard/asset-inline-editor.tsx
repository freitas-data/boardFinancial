"use client";

import { useState, useTransition } from "react";

import { updateAssetValues } from "@/app/dashboard/asset-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AssetInlineEditorProps = {
  assetId: number;
  priceUnit: number;
  quantity: number;
};

export function AssetInlineEditor({ assetId, priceUnit, quantity }: AssetInlineEditorProps) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState<string>(priceUnit ? priceUnit.toString() : "");
  const [qty, setQty] = useState<string>(quantity ? quantity.toString() : "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateAssetValues(assetId, {
        priceUnit: price === "" ? 0 : Number(price),
        quantity: qty === "" ? 0 : Number(qty)
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
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
