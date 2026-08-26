"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { readJSON, writeJSON, K } from "@/lib/storage";

export interface ActiveTimer {
  id: string;
  label: string; // šta se peče
  kosara: string; // A / B / Druga tura
  endsAt: number; // apsolutni cilj (Date.now() ms) — radi i kad je ekran zaključan
  durationSec: number;
  notified: boolean; // da li je već odsviran zvuk
}

interface TimerCtx {
  timers: ActiveTimer[];
  start: (opts: { label: string; kosara: string; minutes: number }) => void;
  dismiss: (id: string) => void;
}

const Ctx = createContext<TimerCtx | null>(null);

export function useTimers(): TimerCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTimers mora biti unutar TimerProvider-a");
  return c;
}

function beep() {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const now = ctx.currentTime;
    // Tri kratka tona.
    [0, 0.28, 0.56].forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now + t);
      gain.gain.setValueAtTime(0.0001, now + t);
      gain.gain.exponentialRampToValueAtTime(0.4, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.24);
    });
    // Zatvori kontekst kad završi.
    setTimeout(() => {
      try {
        ctx.close();
      } catch {
        /* ignoriši */
      }
    }, 1000);
  } catch {
    /* zvuk nije kritičan */
  }
}

function vibrate() {
  try {
    navigator.vibrate?.([200, 100, 200, 100, 400]);
  } catch {
    /* ignoriši */
  }
}

export default function TimerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [timers, setTimers] = useState<ActiveTimer[]>([]);
  const [, setTick] = useState(0);
  const audioPrimed = useRef(false);

  // Rehidracija iz localStorage-a nakon montiranja (izbjegava hydration mismatch).
  useEffect(() => {
    const saved = readJSON<ActiveTimer[]>(K.timers(), []);
    // Odbaci tajmere koji su davno prošli (>1h poslije cilja) da se ne gomilaju.
    const fresh = saved.filter((t) => Date.now() - t.endsAt < 60 * 60 * 1000);
    if (fresh.length) setTimers(fresh);
  }, []);

  // Perzistiraj promjene.
  useEffect(() => {
    writeJSON(K.timers(), timers);
  }, [timers]);

  // Otkucaj svake sekunde dok ima tajmera.
  useEffect(() => {
    if (timers.length === 0) return;
    const iv = window.setInterval(() => setTick((x) => x + 1), 500);
    return () => window.clearInterval(iv);
  }, [timers.length]);

  // Kad se ekran vrati iz pozadine, odmah preračunaj (apsolutni cilj ostaje tačan).
  useEffect(() => {
    const onVis = () => setTick((x) => x + 1);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, []);

  // Provjeri istekle tajmere na svaki render (tick) i obavijesti jednom.
  useEffect(() => {
    let changed = false;
    const next = timers.map((t) => {
      if (!t.notified && Date.now() >= t.endsAt) {
        changed = true;
        return { ...t, notified: true };
      }
      return t;
    });
    if (changed) {
      // Nađi koji su upravo istekli.
      timers.forEach((t) => {
        if (!t.notified && Date.now() >= t.endsAt) {
          beep();
          vibrate();
        }
      });
      setTimers(next);
    }
  });

  const start = useCallback(
    ({
      label,
      kosara,
      minutes,
    }: {
      label: string;
      kosara: string;
      minutes: number;
    }) => {
      // Zagrij AudioContext na korisnički gest (klik) da zvuk kasnije prođe.
      if (!audioPrimed.current) {
        try {
          const AC =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          if (AC) {
            const ctx = new AC();
            ctx.resume?.();
            setTimeout(() => {
              try {
                ctx.close();
              } catch {
                /* ignoriši */
              }
            }, 300);
          }
          audioPrimed.current = true;
        } catch {
          /* ignoriši */
        }
      }
      const durationSec = Math.round(minutes * 60);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setTimers((prev) => [
        ...prev,
        {
          id,
          label,
          kosara,
          endsAt: Date.now() + durationSec * 1000,
          durationSec,
          notified: false,
        },
      ]);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ timers, start, dismiss }}>
      {children}
      <TimerBar timers={timers} dismiss={dismiss} />
    </Ctx.Provider>
  );
}

function fmt(sec: number): string {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function TimerBar({
  timers,
  dismiss,
}: {
  timers: ActiveTimer[];
  dismiss: (id: string) => void;
}) {
  if (timers.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 z-40 px-3"
      style={{
        bottom: "calc(56px + env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto flex max-w-md flex-col gap-2">
        {timers.map((t) => {
          const remaining = Math.round((t.endsAt - Date.now()) / 1000);
          const done = remaining <= 0;
          return (
            <div
              key={t.id}
              className="reveal flex items-center gap-3 rounded-xl border px-3 py-2 shadow-lg"
              style={{
                background: done ? "var(--heat)" : "var(--panel)",
                borderColor: done ? "var(--heat)" : "var(--line-2)",
                color: done ? "#fff" : "var(--ink)",
              }}
            >
              <span
                className="flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-xs font-bold"
                style={{
                  background: done ? "rgba(255,255,255,0.2)" : "var(--panel-2)",
                  color: done ? "#fff" : "var(--heat)",
                }}
              >
                {t.kosara}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold leading-tight">
                  {done ? "GOTOVO — provjeri" : t.label}
                </div>
                <div className="truncate text-[11px] opacity-80 leading-tight">
                  {t.label}
                </div>
              </div>
              <span
                className="tabnum font-mono text-lg font-bold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {fmt(remaining)}
              </span>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Ukloni tajmer"
                className="tap flex items-center justify-center rounded-md"
                style={{ color: done ? "#fff" : "var(--ink-3)" }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
