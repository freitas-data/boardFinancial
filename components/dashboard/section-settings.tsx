"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { saveSections, type SectionInput } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SectionSettingsProps = {
  initialSections: SectionInput[];
  open: boolean;
  onOpenChange: (value: boolean) => void;
};

const EMPTY_SECTION: SectionInput = { name: "", targetPercentage: 0 };

export function SectionSettings({ initialSections, open, onOpenChange }: SectionSettingsProps) {
  const router = useRouter();
  const [sections, setSections] = useState<SectionInput[]>(initialSections.length ? initialSections : [EMPTY_SECTION]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSections(initialSections.length ? initialSections : [EMPTY_SECTION]);
  }, [initialSections]);

  const total = useMemo(
    () => sections.reduce((acc, item) => acc + (Number(item.targetPercentage) || 0), 0),
    [sections]
  );

  function updateSection(index: number, key: keyof SectionInput, value: string | number) {
    setSections((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [key]: key === "targetPercentage" ? Number(value) || 0 : String(value) } : item
      )
    );
  }

  function addSection() {
    if (sections.length >= 4) return;
    setSections([...sections, EMPTY_SECTION]);
  }

  function removeSection(index: number) {
    const next = sections.filter((_, idx) => idx !== index);
    setSections(next.length ? next : [EMPTY_SECTION]);
  }

  function handleClose() {
    onOpenChange(false);
    setError(null);
  }

  async function handleSave() {
    setError(null);
    startTransition(async () => {
      const payload = sections.map((item) => ({
        ...item,
        targetPercentage: Number(item.targetPercentage) || 0,
        name: item.name.trim()
      }));
      const result = await saveSections({ sections: payload });
      if (result.error) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  if (!open) return null;

  const overLimit = total > 100;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <Card className="w-full max-w-3xl shadow-xl shadow-black/20">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
              Configurar seções
            </p>
            <CardTitle className="mt-1">Defina suas seções iniciais</CardTitle>
            <CardDescription>Máximo de 4 seções. O total não pode ultrapassar 100%.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="grid grid-cols-[1fr_auto_auto] items-end gap-3 rounded-xl border border-border p-3">
                <div className="space-y-2">
                  <Label>Nome da seção</Label>
                  <Input
                    placeholder="Renda variável"
                    value={section.name}
                    onChange={(e) => updateSection(index, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-2 w-32">
                  <Label>Alvo (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={section.targetPercentage}
                    onChange={(e) => updateSection(index, "targetPercentage", e.target.valueAsNumber)}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeSection(index)} aria-label="Remover seção">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" onClick={addSection} disabled={sections.length >= 4}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar seção
              </Button>
              <div className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Total:{" "}
                <span className={overLimit ? "text-[hsl(var(--destructive))]" : "text-[hsl(var(--foreground))]"}>
                  {total}%
                </span>
              </div>
            </div>
            {overLimit ? (
              <p className="text-sm font-semibold text-[hsl(var(--destructive))]">
                A soma não pode ultrapassar 100%.
              </p>
            ) : null}
          </div>

          {error ? <p className="text-sm font-semibold text-[hsl(var(--destructive))]">{error}</p> : null}

          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending || overLimit}>
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar seções"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
