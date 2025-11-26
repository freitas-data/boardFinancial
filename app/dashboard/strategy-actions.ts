"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import pdfParse from "pdf-parse";
import * as XLSX from "xlsx";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ParsedRow = { asset: string; percentage: number };

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

const ASSET_KEYS = ["asset", "ativo", "papel", "ticker", "codigo", "código", "acao", "ação"];
const PERCENT_KEYS = ["percentage", "percentual", "%", "alvo", "peso", "percent", "percentual alvo"];

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace("%", "").replace(",", ".").trim();
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function pickKey(row: Record<string, any>, keys: string[]): string | null {
  const lowerMap: Record<string, string> = {};
  Object.keys(row).forEach((k) => {
    lowerMap[k.toLowerCase()] = k;
  });
  for (const key of keys) {
    if (lowerMap[key]) return lowerMap[key];
  }
  return null;
}

async function parseExcelOrCsv(buffer: Buffer): Promise<ParsedRow[]> {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];

  // Passo 1: tentar mapear por cabeçalhos
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
  const rows: ParsedRow[] = [];
  for (const row of json) {
    const assetKey = pickKey(row, ASSET_KEYS);
    const percentKey = pickKey(row, PERCENT_KEYS);
    if (!assetKey || !percentKey) continue;
    const asset = String(row[assetKey]).trim();
    const pct = toNumber(row[percentKey]);
    if (!asset || pct === null) continue;
    rows.push({ asset, percentage: pct });
  }
  if (rows.length) return rows;

  // Passo 2: fallback — usar as duas primeiras colunas, linha a linha
  const matrix = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" }) as any[][];
  for (const line of matrix) {
    if (!line || line.length < 2) continue;
    const [a0, a1] = line;
    const asset = String(a0 ?? "").trim();
    const pct = toNumber(a1);
    if (!asset || pct === null) continue;
    rows.push({ asset, percentage: pct });
  }

  return rows;
}

async function parsePdf(buffer: Buffer): Promise<ParsedRow[]> {
  const data = await pdfParse(buffer);
  const lines = data.text
    .split(/\r?\n/)
    .map((l: string) => l.trim())
    .filter(Boolean);

  const rows: ParsedRow[] = [];
  const regex = /^(.+?)\s+(\d+(?:[.,]\d+)?)%?$/;
  for (const line of lines) {
    const match = line.match(regex);
    if (!match) continue;
    const asset = match[1].trim();
    const pct = toNumber(match[2]);
    if (!asset || pct === null) continue;
    rows.push({ asset, percentage: pct });
  }
  return rows;
}

export async function parseStrategy(prevState: ParseState, formData: FormData): Promise<ParseState> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { rows: [], error: "Envie um arquivo XLSX/CSV ou PDF." };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();
    let rows: ParsedRow[] = [];

    if (name.endsWith(".pdf")) {
      rows = await parsePdf(buffer);
      if (!rows.length) {
        return { rows: [], error: "PDF não possui tabela reconhecível." };
      }
    } else if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
      rows = await parseExcelOrCsv(buffer);
      if (!rows.length) {
        return { rows: [], error: "Não foi possível extrair linhas de ativo e percentual." };
      }
    } else {
      return { rows: [], error: "Formato não suportado. Use XLSX, CSV ou PDF." };
    }

    return { rows };
  } catch (error) {
    console.error("Erro ao parsear arquivo", error);
    return { rows: [], error: "Não foi possível ler o arquivo." };
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
