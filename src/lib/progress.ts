import { readJSON, K } from "./storage";

export const TARGET_DEFAULT = 80; // ciljana težina, kg

export interface Termin {
  datum: string; // "27.08.2026."
  kratko: string; // "27.08."
  iso: string; // "2026-08-27"
}

export const VAGANJA: Termin[] = [
  { datum: "27.08.2026.", kratko: "27.08.", iso: "2026-08-27" },
  { datum: "03.09.2026.", kratko: "03.09.", iso: "2026-09-03" },
  { datum: "10.09.2026.", kratko: "10.09.", iso: "2026-09-10" },
  { datum: "17.09.2026.", kratko: "17.09.", iso: "2026-09-17" },
  { datum: "24.09.2026.", kratko: "24.09.", iso: "2026-09-24" },
];

export const SLIKE: Termin[] = [
  { datum: "10.09.2026.", kratko: "10.09.", iso: "2026-09-10" },
  { datum: "24.09.2026.", kratko: "24.09.", iso: "2026-09-24" },
];

export interface WeightSummary {
  history: { termin: Termin; value: number }[]; // samo uneseni, redom
  current: number | null; // zadnje uneseno vaganje
  start: number | null; // prvo uneseno vaganje
}

// Pročitaj unesena vaganja iz localStorage-a i izvedi trenutnu/početnu.
export function readWeights(): WeightSummary {
  const raw = readJSON<Record<string, string>>(K.weight(), {});
  const history: { termin: Termin; value: number }[] = [];
  for (const t of VAGANJA) {
    const v = raw[t.datum];
    const num = v != null && v !== "" ? parseFloat(v.replace(",", ".")) : NaN;
    if (Number.isFinite(num)) history.push({ termin: t, value: num });
  }
  return {
    history,
    current: history.length ? history[history.length - 1].value : null,
    start: history.length ? history[0].value : null,
  };
}

export function readTarget(): number {
  const raw = readJSON<number>(K.target(), TARGET_DEFAULT);
  return Number.isFinite(raw) && raw > 0 ? raw : TARGET_DEFAULT;
}

// Broj dana od danas do datuma (lokalno, po ponoći). Prošlost = negativno.
export function daysUntil(iso: string, now: Date = new Date()): number {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((target.getTime() - today.getTime()) / MS);
}

// Sljedeći nadolazeći termin (danas ili u budućnosti), inače null.
export function nextTermin(list: Termin[], now: Date = new Date()): Termin | null {
  for (const t of list) {
    if (daysUntil(t.iso, now) >= 0) return t;
  }
  return null;
}
