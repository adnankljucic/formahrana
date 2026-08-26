"use client";

import { useEffect, useRef, useState } from "react";
import { readJSON, writeJSON, K } from "@/lib/storage";
import { useSync } from "./SyncProvider";

const GLASSES = 12; // 12 × 250 ml = 3 L

export default function WaterTracker({ dayN }: { dayN: number }) {
  const [count, setCount] = useState(0);
  const key = K.water(dayN);
  const longPressed = useRef(false);
  const timer = useRef<number | null>(null);
  const { locked, openUnlock } = useSync();

  useEffect(() => {
    setCount(readJSON<number>(key, 0));
  }, [key]);

  function save(next: number) {
    const clamped = Math.max(0, Math.min(GLASSES, next));
    setCount(clamped);
    writeJSON(key, clamped);
  }

  function onPointerDown() {
    if (locked) {
      openUnlock();
      return;
    }
    longPressed.current = false;
    timer.current = window.setTimeout(() => {
      longPressed.current = true;
      // Long-press briše zadnju čašu.
      save(readJSON<number>(key, count) - 1);
    }, 500);
  }

  function onPointerUp() {
    if (locked) return;
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (!longPressed.current) {
      // Tap dodaje čašu.
      save(count + 1);
    }
  }

  function onPointerLeave() {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }

  const ml = count * 250;

  return (
    <div
      className="el rounded-xl border p-4"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      <div className="mb-2 flex items-baseline justify-between">
        <h3
          className="text-sm font-bold uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink-2)" }}
        >
          Voda
        </h3>
        <span
          className="tabnum text-sm font-semibold"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}
        >
          {(ml / 1000).toFixed(2).replace(".", ",")} L / 3 L
        </span>
      </div>

      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={`Voda: ${count} od ${GLASSES} čaša. Tap dodaje, dugi pritisak briše.`}
        className="grid w-full touch-none grid-cols-12 gap-1.5"
        style={{ touchAction: "manipulation" }}
      >
        {Array.from({ length: GLASSES }).map((_, i) => (
          <span
            key={i}
            className="h-9 rounded-md border transition-colors"
            style={{
              background: i < count ? "var(--ink)" : "var(--panel-2)",
              borderColor: i < count ? "var(--ink)" : "var(--line)",
            }}
          />
        ))}
      </button>
      <p className="mt-2 text-xs" style={{ color: "var(--ink-3)" }}>
        Tap dodaje čašu (250 ml) · dugi pritisak briše.
      </p>
    </div>
  );
}
