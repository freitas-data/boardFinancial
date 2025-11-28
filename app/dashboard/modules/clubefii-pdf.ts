import pdfParse from "pdf-parse";

import { ParsedRow, StrategyModule } from "./types";

const TICKER_REGEX = /\b[A-Z]{4}\d{1,2}\b/;

export const clubeFiiPdfModule: StrategyModule = {
  id: "clubefii-pdf",
  name: "ClubeFII – PDF",
  supportedExtensions: [".pdf"],
  async extract({ file, options }) {
    const data = await pdfParse(file.buffer);

    const pages = data.text.split(/\f/);
    let pageText: string | null = null;

    const targetPage = Number(options?.page) || null;
    if (targetPage && pages[targetPage - 1]) {
      pageText = pages[targetPage - 1];
    } else {
      pageText = pages.find((p: string) => p.toLowerCase().includes("painel de recomendação da carteira"));
    }

    if (!pageText) {
      throw new Error("Não foi possível localizar a página da tabela.");
    }

    const lines = pageText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const assets: string[] = [];
    for (const line of lines) {
      const match = line.match(TICKER_REGEX);
      if (match) {
        const ticker = match[0];
        if (!assets.includes(ticker)) {
          assets.push(ticker);
        }
      }
    }

    if (!assets.length) {
      throw new Error("Não foi possível extrair tickers na página selecionada.");
    }

    const equalTargets = options?.equalTargets !== false;
    const percentage = equalTargets ? Math.round((100 / assets.length) * 100) / 100 : 0;

    const rows: ParsedRow[] = assets.map((asset) => ({
      asset,
      percentage
    }));

    return rows;
  }
};
