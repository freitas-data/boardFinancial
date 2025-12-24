import pdfParse from "pdf-parse";

import { ParsedRow, StrategyModule } from "./types";

type TextItem = { str: string; x: number; y: number };

const TICKER_REGEX = /\b[A-Z]{4}\d{1,2}\b/;
const ACTION_WORDS = {
  comprar: ["comprar", "compra", "buy"],
  vender: ["vender", "venda", "sell"],
  manter: ["manter", "manutenção", "manutencao", "hold", "manter posição", "manter posicao"]
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function detectAction(text: string): "comprar" | "vender" | "manter" | undefined {
  const lower = normalizeText(text);
  if (ACTION_WORDS.comprar.some((w) => lower.includes(w))) return "comprar";
  if (ACTION_WORDS.vender.some((w) => lower.includes(w))) return "vender";
  if (ACTION_WORDS.manter.some((w) => lower.includes(w))) return "manter";
  return undefined;
}

function groupRows(items: TextItem[]) {
  const rows: Array<{ y: number; items: TextItem[] }> = [];
  const threshold = 2;
  const filtered = items.filter((item) => item.str && item.str.trim());
  filtered.sort((a, b) => b.y - a.y || a.x - b.x);

  for (const item of filtered) {
    const row = rows.find((r) => Math.abs(r.y - item.y) <= threshold);
    if (row) {
      row.items.push(item);
    } else {
      rows.push({ y: item.y, items: [item] });
    }
  }

  const columns = rows.map((row) => {
    const sorted = row.items.sort((a, b) => a.x - b.x);
    const cells: Array<{ x: number; text: string }> = [];
    const gap = 12;
    for (const item of sorted) {
      const value = item.str.trim();
      if (!value) continue;
      const last = cells[cells.length - 1];
      if (!last || Math.abs(item.x - last.x) > gap) {
        cells.push({ x: item.x, text: value });
      } else {
        last.text = `${last.text} ${value}`.trim();
      }
    }
    return cells.map((cell) => cell.text);
  });

  return columns.filter((row) => row.length > 0);
}

export const clubeFiiPdfModule: StrategyModule = {
  id: "clubefii-pdf",
  name: "ClubeFII – PDF",
  supportedExtensions: [".pdf"],
  async extract({ file, options }) {
    const pagesText: string[] = [];
    const pageItems: TextItem[][] = [];
    const data = await pdfParse(file.buffer, {
      pagerender: async (pageData: any) => {
        const textContent = await pageData.getTextContent();
        const items = textContent.items.map((item: any) => ({
          str: String(item.str ?? ""),
          x: Number(item.transform?.[4] ?? 0),
          y: Number(item.transform?.[5] ?? 0)
        }));
        pageItems.push(items);
        const pageText = items.map((item) => item.str).join(" ");
        pagesText.push(pageText);
        return pageText;
      }
    });

    const resolvedPages = pagesText.length ? pagesText : data.text ? [data.text] : [];
    const targetPage = Number(options?.page) || null;

    const targetNeedle = normalizeText("Painel de Recomendação da Carteira");
    const pageByNameIndex = resolvedPages.findIndex((p) => normalizeText(p).includes(targetNeedle));

    let pageIndex = -1;
    if (targetPage && resolvedPages[targetPage - 1]) {
      pageIndex = targetPage - 1;
    } else if (pageByNameIndex >= 0) {
      pageIndex = pageByNameIndex;
    }

    if (pageIndex < 0) {
      throw new Error("Não foi possível localizar a página da tabela.");
    }

    const items = pageItems[pageIndex] ?? [];
    const tableRows = items.length ? groupRows(items) : [];

    const parsed: ParsedRow[] = [];
    for (const row of tableRows) {
      const ticker = row[0]?.toUpperCase();
      if (!ticker || !TICKER_REGEX.test(ticker)) continue;
      const action =
        detectAction(row[3] ?? "") ??
        detectAction(row.join(" "));
      parsed.push({ asset: ticker, percentage: 0, action });
    }

    if (!parsed.length) {
      throw new Error("Não foi possível extrair tickers na página selecionada.");
    }

    const equalTargets = options?.equalTargets !== false;
    const percentage = equalTargets ? Math.round((100 / parsed.length) * 100) / 100 : 0;

    return parsed.map((row) => ({
      ...row,
      percentage
    }));
  }
};
