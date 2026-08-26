"use client";

import { useEffect, useState } from "react";
import type { TreningPlan } from "@/lib/types";
import { readJSON, writeJSON, K } from "@/lib/storage";
import { useSync } from "./SyncProvider";

export default function TreningChecklist({
  dayN,
  plan,
}: {
  dayN: number;
  plan: TreningPlan;
}) {
  const [done, setDone] = useState<boolean[]>(() =>
    plan.vjezbe.map(() => false)
  );
  const [ready, setReady] = useState(false);
  const { locked, openUnlock } = useSync();

  useEffect(() => {
    setDone(plan.vjezbe.map((_, i) => readJSON<boolean>(K.trening(dayN, i), false)));
    setReady(true);
  }, [dayN, plan.vjezbe]);

  function toggle(i: number) {
    if (locked) {
      openUnlock();
      return;
    }
    setDone((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      writeJSON(K.trening(dayN, i), next[i]);
      return next;
    });
  }

  const doneCount = ready ? done.filter(Boolean).length : 0;
  const total = plan.vjezbe.length;
  const frac = total ? doneCount / total : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Napredak treninga */}
      <div
        className="el rounded-xl border p-4"
        style={{ background: "var(--panel)", borderColor: "var(--line)" }}
      >
        <div className="mb-2 flex items-baseline justify-between">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--ink-3)" }}
          >
            Odrađeno
          </span>
          <span
            className="tabnum text-sm font-bold"
            style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}
          >
            {doneCount} / {total}
          </span>
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full"
          style={{ background: "var(--panel-2)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${frac * 100}%`, background: "var(--train)" }}
          />
        </div>
      </div>

      {/* Vježbe */}
      <div className="flex flex-col gap-2">
        {plan.vjezbe.map((v, i) => {
          const checked = ready && done[i];
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={checked}
              className="flex items-start gap-3 el rounded-xl border p-4 text-left"
              style={{
                background: checked ? "var(--train-soft)" : "var(--panel)",
                borderColor: checked ? "var(--train)" : "var(--line)",
              }}
            >
              <span
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2"
                style={{
                  borderColor: checked ? "var(--train)" : "var(--line-2)",
                  background: checked ? "var(--train)" : "transparent",
                }}
              >
                {checked && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12l5 5L20 6" />
                  </svg>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div
                  className="text-[15px] font-bold leading-tight"
                  style={{
                    color: "var(--ink)",
                    textDecoration: checked ? "line-through" : "none",
                    opacity: checked ? 0.7 : 1,
                  }}
                >
                  {v.naziv}
                </div>
                {(v.serije || v.ponavljanja) && (
                  <div
                    className="tabnum mt-0.5 text-sm font-semibold"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--train)" }}
                  >
                    {v.serije ? `${v.serije} serije` : ""}
                    {v.serije && v.ponavljanja ? " · " : ""}
                    {v.ponavljanja ?? ""}
                  </div>
                )}
                {v.napomena && (
                  <div className="mt-1 text-sm leading-snug" style={{ color: "var(--ink-2)" }}>
                    {v.napomena}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
