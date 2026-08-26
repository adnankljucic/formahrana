// Plan traje 30 dana: 27.08.2026. – 25.09.2026.
export const PLAN_START = "2026-08-27";
export const PLAN_DAYS = 30;

// Ključ dana u lokalnom vremenu, bez UTC pomaka.
function localKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Broj cijelih dana između dva datumska ključa (b - a), po ponoći lokalno.
function daysBetween(aKey: string, bKey: string): number {
  const [ay, am, ad] = aKey.split("-").map(Number);
  const [by, bm, bd] = bKey.split("-").map(Number);
  const a = new Date(ay, am - 1, ad);
  const b = new Date(by, bm - 1, bd);
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / MS);
}

// Broj dana plana (1..30) za dati trenutak. Prije početka → 1, poslije kraja → 30.
export function dayNumberFor(now: Date = new Date()): number {
  const diff = daysBetween(PLAN_START, localKey(now));
  const n = diff + 1;
  if (n < 1) return 1;
  if (n > PLAN_DAYS) return PLAN_DAYS;
  return n;
}

// Da li je plan završen (poslije zadnjeg dana).
export function isPlanFinished(now: Date = new Date()): boolean {
  const diff = daysBetween(PLAN_START, localKey(now));
  return diff + 1 > PLAN_DAYS;
}

// Da li je plan još počeo.
export function isPlanNotStarted(now: Date = new Date()): boolean {
  const diff = daysBetween(PLAN_START, localKey(now));
  return diff + 1 < 1;
}

// Današnji dan plana ako smo unutar raspona, inače null (za dugme „Danas").
export function todayDayNumber(now: Date = new Date()): number | null {
  const diff = daysBetween(PLAN_START, localKey(now));
  const n = diff + 1;
  if (n < 1 || n > PLAN_DAYS) return null;
  return n;
}

// Datumski ključ (yyyy-mm-dd) za današnji lokalni dan.
export function todayKey(now: Date = new Date()): string {
  return localKey(now);
}
