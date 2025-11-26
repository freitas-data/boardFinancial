export type ParsedRow = { asset: string; percentage: number };

export interface StrategyModule {
  id: string;
  name: string;
  supportedExtensions: string[];
  extract: (file: { buffer: Buffer; filename: string }) => Promise<ParsedRow[]>;
}
