// Sinhronizacija localStorage-a s oblakom (Neon) preko /api/state.
// Sinhronizuju se svi "pi:" ključevi OSIM pina i tajmera (tajmeri su lokalni/prolazni).

const PREFIX = "pi:";
const EXCLUDE = new Set(["pi:pin", "pi:timers"]);

export type Snapshot = Record<string, string>;

// Skupi sve relevantne ključeve u objekt { ključ: sirova string vrijednost }.
export function snapshotLocal(): Snapshot {
  const out: Snapshot = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(PREFIX) || EXCLUDE.has(key)) continue;
      const val = localStorage.getItem(key);
      if (val != null) out[key] = val;
    }
  } catch {
    /* localStorage blokiran */
  }
  return out;
}

// Upiši stanje iz oblaka u localStorage (aditivno, ključ po ključ).
export function applyState(state: Snapshot): boolean {
  let changed = false;
  try {
    for (const [key, val] of Object.entries(state)) {
      if (!key.startsWith(PREFIX) || EXCLUDE.has(key)) continue;
      if (localStorage.getItem(key) !== val) {
        localStorage.setItem(key, val);
        changed = true;
      }
    }
  } catch {
    /* ignoriši */
  }
  return changed;
}

// Stabilan potpis snapshota za detekciju promjene.
export function fingerprint(s: Snapshot): string {
  return Object.keys(s)
    .sort()
    .map((k) => `${k}=${s[k]}`)
    .join("\n");
}

export async function pullState(pin: string): Promise<Snapshot | null> {
  const res = await fetch(`/api/state?pin=${encodeURIComponent(pin)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`pull ${res.status}`);
  const json = (await res.json()) as { data: Snapshot | null };
  return json.data ?? null;
}

export async function pushState(pin: string, data: Snapshot): Promise<void> {
  const res = await fetch(`/api/state`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pin, data }),
  });
  if (!res.ok) throw new Error(`push ${res.status}`);
}
