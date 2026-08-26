"use client";

import { useEffect, useState } from "react";
import { readJSON, writeJSON, K } from "@/lib/storage";
import { useSync } from "./SyncProvider";

const GLASSES = 12; // 12 × 250 ml = 3 L

// Bez sopstvenog panela/border-a — roditelj obezbjeđuje omot (Carbon flat blok).
export default function WaterTracker({ dayN }: { dayN: number }) {
  const [count, setCount] = useState(0);
  const key = K.water(dayN);
  const { locked, openUnlock } = useSync();

  useEffect(() => {
    setCount(readJSON<number>(key, 0));
  }, [key]);

  function save(next: number) {
    const clamped = Math.max(0, Math.min(GLASSES, next));
    setCount(clamped);
    writeJSON(key, clamped);
  }

  // Tap na čašu i: ako je već popunjena i posljednja popunjena → isprazni do i (isključi);
  // inače popuni do i (uključivo). Isti obrazac kao referentni dizajn.
  function tapGlass(i: number) {
    if (locked) {
      openUnlock();
      return;
    }
    save(i < count ? i : i + 1);
  }

  const ml = count * 250;
  const pct = Math.min(100, Math.round((count / GLASSES) * 100));

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-base" style={{ color: "var(--ink)" }}>
          Voda
        </span>
        <span
          className="tabnum text-sm"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}
        >
          {(ml / 1000).toFixed(2).replace(".", ",")} L / 3 L
        </span>
      </div>

      <div className="mt-3 h-1" style={{ background: "var(--line)" }}>
        <div className="h-1" style={{ background: "var(--train)", width: `${pct}%` }} />
      </div>

      <div className="mt-3 grid grid-cols-6 gap-1">
        {Array.from({ length: GLASSES }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tapGlass(i)}
            aria-label={`Čaša vode ${i + 1} (250 ml)`}
            aria-pressed={i < count}
            className="border"
            style={{
              height: 44,
              borderColor: "var(--line-2)",
              background: i < count ? "var(--train)" : "transparent",
              padding: 0,
            }}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs" style={{ color: "var(--ink-3)" }}>
          Jedan dodir = čaša (250 ml).
        </span>
        <button
          type="button"
          onClick={() => (locked ? openUnlock() : save(0))}
          className="h-8 px-3 text-xs"
          style={{ background: "transparent", border: "1px solid var(--train)", color: "var(--train)" }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
