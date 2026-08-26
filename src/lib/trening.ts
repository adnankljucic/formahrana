import treningData from "@/data/trening.json";
import type { TreningPlan } from "./types";

// trening.json je mapa: ključ = broj dana ("2","5",...). Ključevi koji počinju
// s "_" su metapodaci/primjeri i ignorišu se.
const raw = treningData as Record<string, unknown>;

export function treningZaDan(n: number): TreningPlan | null {
  const entry = raw[String(n)];
  if (!entry || typeof entry !== "object") return null;
  const plan = entry as TreningPlan;
  if (!Array.isArray(plan.vjezbe) || plan.vjezbe.length === 0) return null;
  return plan;
}
