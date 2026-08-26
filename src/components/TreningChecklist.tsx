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
    <>
      {/* Napredak treninga */}
      <div style={{ background: "var(--panel)", padding: 16 }}>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs" style={{ color: "var(--ink-2)", letterSpacing: "0.32px" }}>
            Odrađeno
          </span>
          <span
            className="tabnum text-sm"
            style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}
          >
            {doneCount} / {total}
          </span>
        </div>
        <div className="h-1" style={{ background: "var(--line)" }}>
          <div style={{ width: `${frac * 100}%`, background: "var(--train)", height: 4 }} />
        </div>
      </div>

      {/* Vježbe */}
      {plan.vjezbe.map((v, i) => {
        const checked = ready && done[i];
        return (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            aria-pressed={checked}
            className="flex items-start gap-3 text-left"
            style={{
              background: checked ? "var(--train-soft)" : "var(--panel)",
              padding: 16,
            }}
          >
            <span
              className="mt-0.5 flex shrink-0 items-center justify-center border"
              style={{
                width: 18,
                height: 18,
                borderColor: checked ? "var(--train)" : "var(--ink)",
                background: checked ? "var(--train)" : "transparent",
              }}
            >
              {checked && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12l5 5L20 6" />
                </svg>
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div
                className="text-sm leading-tight"
                style={{
                  color: checked ? "var(--ink-3)" : "var(--ink)",
                  textDecoration: checked ? "line-through" : "none",
                }}
              >
                {v.naziv}
              </div>
              {(v.serije || v.ponavljanja) && (
                <div
                  className="tabnum mt-1 text-sm"
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
    </>
  );
}
