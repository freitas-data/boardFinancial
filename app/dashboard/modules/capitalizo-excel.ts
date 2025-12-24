import * as XLSX from "xlsx";

import { ActionType, ParsedRow, StrategyModule } from "./types";

const ASSET_KEYS = ["asset", "ativo", "papel", "ticker", "codigo", "código", "acao", "ação", "ticker/código"];
const PERCENT_KEYS = ["percentage", "percentual", "%", "alvo", "peso", "percent", "percentual alvo"];
const ACTION_KEYS = [
  "acao",
  "ação",
  "estrategia",
  "estratégia",
  "recomendacao",
  "recomendação",
  "movimento",
  "movimentacao",
  "movimentação",
  "indicacao",
  "indicação",
  "acao recomendada",
  "recomendacao ação",
  "opinião",
  "opiniao"
];

// Capitalizo planilhas trazem tickers com pelo menos um número (ex: WEGE3, BERK34)
const TICKER_REGEX = /^[A-Z]{3,7}\d{1,2}[A-Z]{0,2}$/;

const ACTION_WORDS = {
  comprar: ["comprar", "compra", "buy"],
  vender: ["vender", "venda", "sell"],
  manter: ["manter", "hold", "manter posição", "manter posicao"]
};

function normalizeAction(value: string | null | undefined): ActionType | undefined {
  if (!value) return undefined;
  const v = value.toLowerCase().trim();
  if (["comprar", "compra", "buy"].includes(v)) return "comprar";
  if (["vender", "venda", "sell"].includes(v)) return "vender";
  if (["manter", "hold", "manter posição", "manter posicao"].includes(v)) return "manter";
  if (ACTION_WORDS.comprar.some((w) => v.includes(w))) return "comprar";
  if (ACTION_WORDS.vender.some((w) => v.includes(w))) return "vender";
  if (ACTION_WORDS.manter.some((w) => v.includes(w))) return "manter";
  return undefined;
}

function findActionInRow(row: Record<string, any>): ActionType | undefined {
  for (const value of Object.values(row)) {
    if (typeof value === "string") {
      const action = normalizeAction(value);
      if (action) return action;
    }
  }
  return undefined;
}

function findTickerInRow(row: Record<string, any>): string | null {
  for (const value of Object.values(row)) {
    if (typeof value === "string") {
      const trimmed = value.trim().toUpperCase();
      if (TICKER_REGEX.test(trimmed)) return trimmed;
    }
  }
  return null;
}

function findPercentInRow(row: Record<string, any>): number | null {
  // Prioriza valores com símbolo de %; se não houver, pega o primeiro número plausível (0-100)
  for (const value of Object.values(row)) {
    if (typeof value === "string" && value.includes("%")) {
      const pct = toNumber(value);
      if (pct !== null) return pct;
    }
  }
  for (const value of Object.values(row)) {
    const pct = toNumber(value);
    if (pct !== null && pct >= 0 && pct <= 100) return pct;
  }
  return null;
}

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
    const actionKey = pickKey(row, ACTION_KEYS);
    if (!assetKey && !percentKey) continue;

    const rawAsset = assetKey ? String(row[assetKey]).trim() : "";
    const ticker = findTickerInRow(row);
    const pct = percentKey ? toNumber(row[percentKey]) : findPercentInRow(row);

    let action =
      normalizeAction(actionKey ? String(row[actionKey]) : undefined) ??
      normalizeAction(rawAsset) ??
      findActionInRow(row);

    let asset = rawAsset;
    const assetLooksLikeAction = !!normalizeAction(asset) && !TICKER_REGEX.test(asset.toUpperCase());
    if (assetLooksLikeAction && ticker) {
      action = action ?? normalizeAction(asset);
      asset = ticker;
    } else if ((!asset || !TICKER_REGEX.test(asset.toUpperCase())) && ticker) {
      asset = ticker;
    } else {
      asset = asset.toUpperCase();
    }

    if (!asset || pct === null) continue;
    rows.push({ asset, percentage: pct, action });
  }
  if (rows.length) return rows;

  const matrix = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" }) as any[][];
  for (let index = 0; index < matrix.length; index++) {
    const line = matrix[index];
    // Primeira linha costuma ser cabeçalho; pular se não contém dados numéricos
    if (index === 0) continue;
    if (!line) continue;
    let asset: string | null = null;
    let pct: number | null = null;
    let action: ActionType | undefined;

    for (const cell of line) {
      const value = typeof cell === "string" ? cell.trim() : cell;
      if (typeof value === "string") {
        if (!action) action = normalizeAction(value);
        const upper = value.toUpperCase();
        if (!asset && TICKER_REGEX.test(upper)) {
          asset = value.toUpperCase();
        }
        if (pct === null && value.includes("%")) {
          const num = toNumber(value);
          if (num !== null) pct = num;
        }
      } else if (typeof value === "number") {
        if (pct === null && value >= 0 && value <= 100) pct = value;
      }
    }
    // Se ainda não achou percentual, procure números plausíveis ou strings numéricas
    if (pct === null) {
      for (const cell of line) {
        const num = toNumber(cell);
        if (num !== null && num >= 0 && num <= 100) {
          pct = num;
          break;
        }
      }
    }
    if (!asset || pct === null) continue;
    rows.push({ asset, percentage: pct, action });
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
