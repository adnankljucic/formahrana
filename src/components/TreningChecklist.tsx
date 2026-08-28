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
  const [weights, setWeights] = useState<string[]>(() =>
    plan.vjezbe.map(() => "")
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const { locked, openUnlock } = useSync();

  useEffect(() => {
    setDone(plan.vjezbe.map((_, i) => readJSON<boolean>(K.trening(dayN, i), false)));
    setWeights(plan.vjezbe.map((v, i) => {
      const weightByName = readJSON<string>(K.treningWeightByName(v.naziv), "");
      return weightByName || readJSON<string>(K.treningWeight(dayN, i), "");
    }));
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

  function handleWeightChange(i: number, value: string) {
    setWeights((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
    setEditingIndex(i);
  }

  function saveWeight(i: number) {
    if (locked) {
      openUnlock();
      return;
    }
    writeJSON(K.treningWeight(dayN, i), weights[i]);
    writeJSON(K.treningWeightByName(plan.vjezbe[i].naziv), weights[i]);
    setEditingIndex(null);
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
        const youtubeUrl = v.youtube;
        return (
          <div
            key={i}
            style={{
              background: checked ? "var(--train-soft)" : "var(--panel)",
              padding: 16,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={checked}
              className="flex flex-1 items-start gap-3 text-left"
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
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="kg"
                    value={weights[i]}
                    onChange={(e) => handleWeightChange(i, e.target.value)}
                    onFocus={() => setEditingIndex(i)}
                    readOnly={locked}
                    className="h-8 w-20 rounded border px-2 text-sm outline-none"
                    style={{
                      borderColor: editingIndex === i ? "#0066cc" : "var(--line)",
                      background: editingIndex === i ? "#e8f0f7" : "var(--panel-2)",
                      color: editingIndex === i ? "#0066cc" : "var(--ink)",
                    }}
                  />
                  {editingIndex === i && weights[i] && (
                    <button
                      type="button"
                      onClick={() => saveWeight(i)}
                      className="h-8 px-2.5 text-xs font-medium rounded"
                      style={{ background: "#FF0000", color: "#fff" }}
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </button>

            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded text-xs font-medium"
                style={{ background: "#FF0000", color: "#ffffff" }}
                aria-label="Pogledaj na YouTube-u"
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>Video</span>
              </a>
            )}
          </div>
        );
      })}
    </>
  );
}
