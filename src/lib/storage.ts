// Tanki omotač oko localStorage-a. Sve u try/catch — ako je blokiran, aplikacija radi dalje.

export function readJSON<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage blokiran ili pun — tiho ignoriši.
  }
}

export function readString(key: string, fallback = ""): string {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : raw;
  } catch {
    return fallback;
  }
}

export function writeString(key: string, value: string): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
    // ignoriši
  }
}

// Ključevi vezani za datum (dd.mm ili n dana) — čekiranje obroka, voda.
export const K = {
  meal: (dayN: number, mealIdx: number) => `pi:meal:${dayN}:${mealIdx}`,
  trening: (dayN: number, exIdx: number) => `pi:trening:${dayN}:${exIdx}`,
  water: (dayN: number) => `pi:water:${dayN}`,
  weight: () => `pi:weight`,
  target: () => `pi:target`,
  photos: () => `pi:photos`,
  timers: () => `pi:timers`,
};
