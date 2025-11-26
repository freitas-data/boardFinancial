import { capitalizoExcelModule } from "./capitalizo-excel";
import { StrategyModule } from "./types";

export const strategyModules: StrategyModule[] = [capitalizoExcelModule];

export function getModuleById(id: string | null | undefined): StrategyModule | undefined {
  if (!id) return undefined;
  return strategyModules.find((m) => m.id === id);
}
