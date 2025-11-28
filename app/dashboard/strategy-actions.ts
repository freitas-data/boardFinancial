"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getModuleById } from "@/app/dashboard/modules";
import type { ParsedRow } from "@/app/dashboard/modules/types";

export type ParseState = {
  rows: ParsedRow[];
  error?: string | null;
};

const importSchema = z.object({
  sectionId: z.number(),
  type: z.string().min(1),
  rows: z
    .array(
      z.object({
        asset: z.string().trim().min(1),
        percentage: z.number().min(0).max(100)
      })
    )
    .min(1)
    .max(200)
});

export async function parseStrategy(prevState: ParseState, formData: FormData): Promise<ParseState> {
  try {
    const moduleId = formData.get("moduleId") as string | null;
    const module = getModuleById(moduleId);
    if (!module) {
      return { rows: [], error: "Selecione um módulo para importar." };
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { rows: [], error: "Envie um arquivo XLSX ou CSV." };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();

    const options: Record<string, any> = {};
    const page = formData.get("modulePage");
    if (page) options.page = Number(page);
    const equalTargets = formData.get("moduleEqualTargets");
    if (equalTargets) options.equalTargets = equalTargets === "true";

    const rows = await module.extract({ file: { buffer, filename: name }, options });

    return { rows };
  } catch (error) {
    console.error("Erro ao parsear arquivo", error);
    return { rows: [], error: error instanceof Error ? error.message : "Não foi possível ler o arquivo." };
  }
}

export type ImportResult = {
  success?: boolean;
  warning?: string | null;
  error?: string | null;
};

export async function importStrategy(data: z.infer<typeof importSchema>): Promise<ImportResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Usuário não autenticado." };
  }

  try {
    const parsed = importSchema.parse(data);

    // Normaliza percentuais para inteiros (0-100)
    const normalizedRows = parsed.rows.map((r) => {
      const pctRaw = Number(r.percentage);
      if (!Number.isFinite(pctRaw)) return { asset: r.asset, percentage: 0 };
      // Se o valor for <= 1, tratar como fração (ex: 0,0062 = 0,62%)
      const scaled = pctRaw <= 1 ? pctRaw * 100 : pctRaw;
      const pct = Math.max(0, Math.min(100, Math.round(scaled * 100) / 100));
      return { asset: r.asset, percentage: pct };
    });

    const section = await prisma.investmentSection.findFirst({
      where: { id: parsed.sectionId, userId: Number(session.user.id) }
    });
    if (!section) {
      return { error: "Seção não encontrada para este usuário." };
    }

    await prisma.$transaction(async (tx) => {
      for (const row of normalizedRows) {
        await tx.asset.create({
          data: {
            sectionId: parsed.sectionId,
            name: row.asset,
            ticker: row.asset,
            type: parsed.type,
            targetPercentage: row.percentage,
            currentValue: Math.random() * 100,
            priceUnit: 0,
            quantity: 0
          }
        });
      }
    });

    const total = normalizedRows.reduce((sum, r) => sum + r.percentage, 0);
    const warning = total !== 100 ? `Total importado: ${total}%. Não soma 100%.` : null;
    revalidatePath("/dashboard");
    return { success: true, warning };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message ?? "Dados inválidos." };
    }
    console.error("Erro ao importar estratégia", error);
    return { error: "Não foi possível importar no momento." };
  }
}
