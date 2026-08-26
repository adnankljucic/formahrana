"use client";

import { useEffect, useState } from "react";
import { readJSON, writeJSON, K } from "@/lib/storage";
import { VAGANJA, SLIKE } from "@/lib/progress";
import { useSync } from "@/components/SyncProvider";

export default function NapredakPage() {
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  const { locked, openUnlock } = useSync();

  useEffect(() => {
    setWeights(readJSON<Record<string, string>>(K.weight(), {}));
    setPhotos(readJSON<Record<string, boolean>>(K.photos(), {}));
    setReady(true);
  }, []);

  function setWeight(datum: string, val: string) {
    if (locked) {
      openUnlock();
      return;
    }
    // Dozvoli samo brojeve i jedan decimalni znak.
    const clean = val.replace(",", ".").replace(/[^0-9.]/g, "");
    const next = { ...weights, [datum]: clean };
    setWeights(next);
    writeJSON(K.weight(), next);
  }

  function togglePhoto(datum: string) {
    if (locked) {
      openUnlock();
      return;
    }
    const next = { ...photos, [datum]: !photos[datum] };
    setPhotos(next);
    writeJSON(K.photos(), next);
  }

  return (
    <main
      className="mx-auto max-w-md px-4 pb-6"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 2.25rem)" }}
    >
      <h1
        className="mb-4 text-2xl font-extrabold"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Napredak
      </h1>

      {/* Vaganje */}
      <section className="mb-6">
        <h2
          className="mb-2.5 text-sm font-bold uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink-2)" }}
        >
          Vaganje
        </h2>

        <div className="flex flex-col gap-2">
          {VAGANJA.map((v) => (
            <div
              key={v.datum}
              className="flex items-center justify-between gap-3 rounded-xl border p-3"
              style={{ background: "var(--panel)", borderColor: "var(--line)" }}
            >
              <span
                className="tabnum text-sm font-semibold"
                style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}
              >
                {v.kratko}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  inputMode="decimal"
                  placeholder="—"
                  readOnly={locked}
                  value={ready ? weights[v.datum] ?? "" : ""}
                  onChange={(e) => setWeight(v.datum, e.target.value)}
                  onFocus={() => locked && openUnlock()}
                  aria-label={`Težina ${v.kratko}`}
                  className="tabnum w-24 rounded-lg border px-3 py-2 text-right text-base font-bold outline-none"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "var(--panel-2)",
                    borderColor: "var(--line-2)",
                    color: "var(--ink)",
                  }}
                />
                <span className="text-sm font-semibold" style={{ color: "var(--ink-3)" }}>
                  kg
                </span>
              </div>
            </div>
          ))}
        </div>

        <WeightChart weights={weights} ready={ready} />
      </section>

      {/* Slike forme */}
      <section className="mb-6">
        <h2
          className="mb-2.5 text-sm font-bold uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink-2)" }}
        >
          Slike forme
        </h2>
        <div className="flex flex-col gap-2">
          {SLIKE.map((s) => {
            const done = ready && !!photos[s.datum];
            return (
              <button
                key={s.datum}
                type="button"
                onClick={() => togglePhoto(s.datum)}
                aria-pressed={done}
                className="flex items-center justify-between gap-3 rounded-xl border p-3 text-left"
                style={{
                  background: done ? "var(--train-soft)" : "var(--panel)",
                  borderColor: done ? "var(--train)" : "var(--line)",
                }}
              >
                <span className="flex flex-col">
                  <span
                    className="tabnum text-sm font-bold"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}
                  >
                    {s.kratko}
                  </span>
                  <span className="text-xs" style={{ color: "var(--ink-3)" }}>
                    Poslano treneru
                  </span>
                </span>
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md border-2"
                  style={{
                    borderColor: done ? "var(--train)" : "var(--line-2)",
                    background: done ? "var(--train)" : "transparent",
                  }}
                >
                  {done && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12l5 5L20 6" />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Podsjetnik */}
      <div
        className="rounded-xl border p-3 text-sm leading-relaxed"
        style={{
          background: "var(--panel-2)",
          borderColor: "var(--line-2)",
          color: "var(--ink-2)",
        }}
      >
        Vaganje ujutru natašte, poslije WC-a, prije vode i hrane. Slike u istom
        svjetlu i pod istim uglom (sprijeda, bočno, straga).
      </div>
    </main>
  );
}

function WeightChart({
  weights,
  ready,
}: {
  weights: Record<string, string>;
  ready: boolean;
}) {
  // Sakupi unesene tačke (redoslijed = redoslijed termina).
  const points = VAGANJA.map((v, i) => {
    const raw = weights[v.datum];
    const num = raw != null && raw !== "" ? parseFloat(raw) : null;
    return { i, label: v.kratko, value: Number.isFinite(num) ? (num as number) : null };
  });

  const entered = points.filter((p) => p.value != null) as {
    i: number;
    label: string;
    value: number;
  }[];

  if (!ready || entered.length < 1) {
    return (
      <p className="mt-3 text-xs" style={{ color: "var(--ink-3)" }}>
        Unesi bar jedno vaganje za graf promjene.
      </p>
    );
  }

  const W = 320;
  const H = 140;
  const padX = 28;
  const padY = 18;
  const n = VAGANJA.length;

  const values = entered.map((p) => p.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const span = max - min;

  const x = (i: number) => padX + (i * (W - 2 * padX)) / (n - 1);
  const y = (v: number) => padY + (1 - (v - min) / span) * (H - 2 * padY);

  const line = entered
    .map((p, k) => `${k === 0 ? "M" : "L"} ${x(p.i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(" ");

  const first = entered[0].value;
  const last = entered[entered.length - 1].value;
  const delta = last - first;

  return (
    <div
      className="mt-3 rounded-xl border p-3"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>
          Promjena
        </span>
        {entered.length >= 2 && (
          <span
            className="tabnum text-sm font-bold"
            style={{
              fontFamily: "var(--font-mono)",
              color: delta <= 0 ? "var(--train)" : "var(--rest)",
            }}
          >
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1).replace(".", ",")} kg
          </span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="Graf promjene težine"
        style={{ display: "block" }}
      >
        {/* Osne linije */}
        <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="var(--line-2)" strokeWidth="1" />
        {/* Linija */}
        {entered.length >= 2 && (
          <path d={line} fill="none" stroke="var(--train)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* Tačke + oznake termina */}
        {points.map((p) => (
          <g key={p.i}>
            <text
              x={x(p.i)}
              y={H - 4}
              textAnchor="middle"
              fontSize="9"
              fill="var(--ink-3)"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {p.label}
            </text>
            {p.value != null && (
              <>
                <circle cx={x(p.i)} cy={y(p.value)} r="4" fill="var(--train)" />
                <text
                  x={x(p.i)}
                  y={y(p.value) - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill="var(--ink)"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {p.value.toFixed(1).replace(".", ",")}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
