import treningData from "@/data/trening.json";
import type { TreningPlan, TreningData } from "./types";

const data = treningData as unknown as TreningData;
const dani = (data.dani ?? {}) as Record<string, TreningPlan | { _ref: string }>;

function isRef(x: unknown): x is { _ref: string } {
  return !!x && typeof x === "object" && "_ref" in (x as Record<string, unknown>);
}

export function treningZaDan(n: number): TreningPlan | null {
  let entry = dani[String(n)];
  if (!entry) return null;
  // Rotacija (npr. isti Upper 1 na više dana) — prati _ref do stvarnog plana.
  if (isRef(entry)) entry = dani[entry._ref];
  if (!entry || isRef(entry)) return null;

  const plan = entry as TreningPlan;
  if (!Array.isArray(plan.vjezbe) || plan.vjezbe.length === 0) return null;
  return plan;
}

export function opceNapomeneTreninga(): string[] {
  return Array.isArray(data.opce_napomene) ? data.opce_napomene : [];
}
