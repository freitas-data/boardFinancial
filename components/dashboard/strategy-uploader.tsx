"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";

import { importStrategy, parseStrategy, type ParseState } from "@/app/dashboard/strategy-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SectionOption = { id: number; name: string };

const TYPES = ["Ações", "FIIs", "Renda Fixa", "ETF", "Cripto", "Caixa"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

type LocalRow = { asset: string; percentage: number };

export function StrategyUploader({ sections }: { sections: SectionOption[] }) {
  const [parseState, formAction, pendingParse] = useActionState<ParseState, FormData>(parseStrategy, { rows: [] });
  const [rows, setRows] = useState<LocalRow[]>([]);
  const [assetType, setAssetType] = useState<string>(TYPES[0]);
  const [sectionId, setSectionId] = useState<number>(sections[0]?.id ?? 0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  useEffect(() => {
    if (parseState?.rows?.length) {
      setRows(parseState.rows);
    } else {
      setRows([]);
    }
  }, [parseState]);

  useEffect(() => {
    setError(parseState?.error ?? null);
  }, [parseState?.error]);

  const total = useMemo(() => rows.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0), [rows]);

  function updateRow(index: number, key: keyof LocalRow, value: string | number) {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (key === "percentage") {
          const num = Number(value);
          return { ...row, percentage: Number.isFinite(num) ? num : 0 };
        }
        return { ...row, asset: String(value) };
      })
    );
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleImport() {
    setMessage(null);
    setError(null);
    if (!sectionId || !rows.length) {
      setError("Selecione uma seção e carregue ao menos 1 linha.");
      return;
    }
    startTransition(async () => {
      const result = await importStrategy({
        sectionId,
        type: assetType,
        rows: rows.map((r) => ({ asset: r.asset, percentage: Number(r.percentage) || 0 }))
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.warning ?? "Importação concluída.");
      setRows([]);
    });
  }

  return (
    <Card className="shadow-xl shadow-black/10">
      <CardHeader>
        <CardTitle>Importar estratégia (Excel/PDF)</CardTitle>
        <CardDescription>
          Envie planilha (XLSX/CSV) ou PDF com colunas de Ativo e Percentual. Escolha o tipo antes de salvar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          className="flex flex-col gap-3 md:flex-row md:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setMessage(null);
            const form = e.currentTarget;
            const fileInput = form.elements.namedItem("file") as HTMLInputElement | null;
            const file = fileInput?.files?.[0];
            if (!file) {
              setError("Selecione um arquivo.");
              return;
            }
            if (file.size > MAX_FILE_SIZE) {
              setError("Arquivo acima de 20MB. Envie um arquivo menor.");
              return;
            }
            const fd = new FormData(form);
            startTransition(() => {
              formAction(fd);
            });
          }}
        >
          <Input name="file" type="file" accept=".xlsx,.xls,.csv,.pdf" required className="max-w-md" />
          <Button type="submit" disabled={pendingParse}>
            {pendingParse ? "Lendo arquivo..." : "Ler arquivo"}
          </Button>
        </form>

        {parseState?.error ? (
          <p className="text-sm font-semibold text-[hsl(var(--destructive))]">{parseState.error}</p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Tipo do ativo</Label>
            <select
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Seção</Label>
            <select
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
              value={sectionId}
              onChange={(e) => setSectionId(Number(e.target.value))}
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm font-semibold",
                total !== 100 ? "border-[hsl(var(--amber))] text-[hsl(var(--amber))]" : "border-border text-[hsl(var(--foreground))]"
              )}
            >
              Total: {total}%
            </div>
          </div>
        </div>

        {rows.length ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
              <span>{rows.length} itens importados</span>
              {total !== 100 ? <span className="text-[hsl(var(--amber))]">Aviso: total diferente de 100%</span> : null}
            </div>
            <div className="overflow-hidden rounded-xl border border-border/70">
              <table className="w-full text-left text-sm">
                <thead className="bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
                  <tr>
                    <th className="px-3 py-2">Ativo</th>
                    <th className="px-3 py-2 w-32">%</th>
                    <th className="px-3 py-2 w-20">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-white/70">
                  {rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">
                        <Input
                          value={row.asset}
                          onChange={(e) => updateRow(idx, "asset", e.target.value)}
                          className="h-10"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step="0.01"
                          value={row.percentage}
                          onChange={(e) => updateRow(idx, "percentage", e.target.valueAsNumber)}
                          className="h-10"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(idx)}
                          className="text-[hsl(var(--destructive))]"
                        >
                          Remover
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          {error ? <p className="text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p> : null}
          {message ? <p className="text-sm font-semibold text-[hsl(var(--accent))]">{message}</p> : null}
          <Button onClick={handleImport} disabled={isSaving || !rows.length || !sectionId}>
            {isSaving ? "Importando..." : "Confirmar importação"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
