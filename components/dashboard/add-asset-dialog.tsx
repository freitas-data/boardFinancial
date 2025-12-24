"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Save, X } from "lucide-react";

import { createAsset, type CreateAssetInput } from "@/app/dashboard/asset-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SectionOption = {
  id: number;
  name: string;
};

type AddAssetDialogProps = {
  sections: SectionOption[];
};

const SUGGESTIONS: Array<{ name: string; ticker: string; type: string }> = [
  { name: "PETROBRAS PN", ticker: "PETR4", type: "Ações" },
  { name: "VALE ON", ticker: "VALE3", type: "Ações" },
  { name: "ITAUUNIBANCO PN", ticker: "ITUB4", type: "Ações" },
  { name: "B3 SA ON", ticker: "B3SA3", type: "Ações" },
  { name: "TESOURO SELIC", ticker: "LFT", type: "Renda Fixa" },
  { name: "TESOURO IPCA+", ticker: "NTNB", type: "Renda Fixa" },
  { name: "KNRI11", ticker: "KNRI11", type: "FIIs" },
  { name: "HGLG11", ticker: "HGLG11", type: "FIIs" },
  { name: "IVVB11", ticker: "IVVB11", type: "ETF" },
  { name: "BOVA11", ticker: "BOVA11", type: "ETF" }
];

const TYPES = ["Ações", "FIIs", "Renda Fixa", "ETF", "Cripto", "Caixa"];

type AddAssetForm = {
  sectionId: number;
  name: string;
  ticker: string;
  type: string;
  description?: string;
  targetPercentage: number | "";
  priceUnit: number | "";
  averagePrice: number | "";
  ceilingPrice: number | "";
  fairPrice: number | "";
  quantity: number | "";
  action: "comprar" | "vender" | "manter";
};

export function AddAssetDialog({ sections }: AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AddAssetForm>({
    sectionId: sections[0]?.id ?? 0,
    name: "",
    ticker: "",
    type: TYPES[0],
    description: "",
    targetPercentage: "",
    priceUnit: "",
    averagePrice: "",
    ceilingPrice: "",
    fairPrice: "",
    quantity: "",
    action: "comprar"
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredSuggestions = useMemo(() => {
    const query = form.name || form.ticker;
    if (!query) return SUGGESTIONS.slice(0, 5);
    const q = query.toLowerCase();
    return SUGGESTIONS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.ticker.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [form.name, form.ticker]);

  function applySuggestion(s: { name: string; ticker: string; type: string }) {
    setForm((prev) => ({
      ...prev,
      name: s.name,
      ticker: s.ticker,
      type: s.type
    }));
  }

  function updateField<K extends keyof AddAssetForm>(key: K, value: AddAssetForm[K]) {
    if (key === "targetPercentage") {
      const pct = typeof value === "number" ? value : Number(value);
      setForm((prev) => ({ ...prev, targetPercentage: Number.isFinite(pct) ? pct : "" }));
      return;
    }
    if (key === "sectionId") {
      const id = Number(value);
      setForm((prev) => ({ ...prev, sectionId: Number.isFinite(id) ? id : 0 }));
      return;
    }
    if (key === "priceUnit" || key === "quantity" || key === "averagePrice" || key === "ceilingPrice" || key === "fairPrice") {
      const num = typeof value === "number" ? value : Number(value);
      setForm((prev) => ({ ...prev, [key]: Number.isFinite(num) ? num : "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    startTransition(() => {
      createAsset({
        ...form,
        targetPercentage: Number(form.targetPercentage) || 0,
        priceUnit: Number(form.priceUnit) || 0,
        averagePrice: Number(form.averagePrice) || 0,
        ceilingPrice: Number(form.ceilingPrice) || 0,
        fairPrice: Number(form.fairPrice) || 0,
        quantity: Number(form.quantity) || 0,
        sectionId: Number(form.sectionId)
      }).then((result) => {
        if (result.error) {
          setError(result.error);
          return;
        }
        setOpen(false);
        setForm({
          sectionId: sections[0]?.id ?? 0,
          name: "",
          ticker: "",
          type: TYPES[0],
          description: "",
          targetPercentage: "",
          priceUnit: "",
          averagePrice: "",
          ceilingPrice: "",
          fairPrice: "",
          quantity: "",
          action: "comprar"
        });
      });
    });
  }

  const disabled = sections.length === 0;

  return (
    <>
      <Button variant="secondary" onClick={() => !disabled && setOpen(true)} disabled={disabled}>
        <Plus className="mr-2 h-4 w-4" />
        Adicionar ativo
      </Button>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-3xl shadow-xl shadow-black/20">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                  Novo ativo
                </p>
                <CardTitle className="mt-1">Adicionar ativo rapidamente</CardTitle>
                <CardDescription>
                  Preencha os campos ou escolha uma sugestão para agilizar.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Seção</Label>
                  <select
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    value={form.sectionId}
                    onChange={(e) => updateField("sectionId", Number(e.target.value))}
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <select
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    value={form.type}
                    onChange={(e) => updateField("type", e.target.value)}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Ação</Label>
                  <select
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    value={form.action}
                    onChange={(e) => updateField("action", e.target.value as AddAssetForm["action"])}
                  >
                    <option value="comprar">Comprar</option>
                    <option value="manter">Manter</option>
                    <option value="vender">Vender</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr_0.6fr_0.6fr_0.6fr_0.5fr]">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="PETROBRAS PN"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ticker</Label>
                  <Input
                    placeholder="PETR4"
                    value={form.ticker}
                    onChange={(e) => updateField("ticker", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço médio</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.averagePrice === "" ? "" : form.averagePrice}
                    onChange={(e) => updateField("averagePrice", e.target.valueAsNumber)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço unitário</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.priceUnit === "" ? "" : form.priceUnit}
                    onChange={(e) => updateField("priceUnit", e.target.valueAsNumber)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Qtd</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.quantity === "" ? "" : form.quantity}
                    onChange={(e) => updateField("quantity", e.target.valueAsNumber)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ceiling Price</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.ceilingPrice === "" ? "" : form.ceilingPrice}
                    onChange={(e) => updateField("ceilingPrice", e.target.valueAsNumber)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fair Price</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.fairPrice === "" ? "" : form.fairPrice}
                    onChange={(e) => updateField("fairPrice", e.target.valueAsNumber)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alvo (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={form.targetPercentage === "" ? "" : form.targetPercentage}
                    onChange={(e) => updateField("targetPercentage", e.target.valueAsNumber)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  placeholder="Observações rápidas"
                  value={form.description ?? ""}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Sugestões rápidas</p>
                <div className="flex flex-wrap gap-2">
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s.ticker}
                      type="button"
                      onClick={() => applySuggestion(s)}
                      className={cn(
                        "rounded-lg border border-border px-3 py-2 text-left text-sm shadow-sm transition",
                        "hover:border-[hsl(var(--ring))] hover:shadow"
                      )}
                    >
                      <div className="font-semibold text-[hsl(var(--foreground))]">{s.name}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {s.ticker} • {s.type}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {error ? <p className="text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p> : null}

              <div className="flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {isPending ? "Salvando..." : "Salvar ativo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
