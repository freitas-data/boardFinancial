export type ActionType = "comprar" | "vender" | "manter";

export type ParsedRow = { asset: string; percentage: number; action?: ActionType };

export interface StrategyModule {
  id: string;
  name: string;
  supportedExtensions: string[];
  extract: (params: { file: { buffer: Buffer; filename: string }; options?: Record<string, any> }) => Promise<ParsedRow[]>;
}
