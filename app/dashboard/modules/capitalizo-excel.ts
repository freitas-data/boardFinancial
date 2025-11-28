import * as XLSX from "xlsx";

import { ParsedRow, StrategyModule } from "./types";

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

export const capitalizoExcelModule: StrategyModule = {
  id: "capitalizo-excel",
  name: "Capitalizo Investimentos – Excel",
  supportedExtensions: [".xlsx", ".xls", ".csv"],
  async extract({ file }) {
    const name = file.filename.toLowerCase();
    let rows: ParsedRow[] = [];

    if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
      rows = await parseExcelOrCsv(file.buffer);
      if (!rows.length) {
        throw new Error("Não foi possível extrair linhas de ativo e percentual.");
      }
    } else {
      throw new Error("Formato não suportado. Use XLSX ou CSV.");
    }

    return rows;
  }
};
