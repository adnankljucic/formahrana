"use client";

import { useState } from "react";
import { useSync, type SyncStatus } from "./SyncProvider";

const LABEL: Record<SyncStatus, string> = {
  off: "Isključeno",
  syncing: "Sinhronizujem…",
  synced: "Sinhronizovano",
  error: "Greška — probaj ponovo",
  offline: "Offline — snima lokalno",
};

export default function SyncCard() {
  const { pin, status, setPin, clearPin, syncNow } = useSync();
  const [input, setInput] = useState("");
  const valid = /^[A-Za-z0-9_-]{4,64}$/.test(input.trim());

  const dot =
    status === "synced"
      ? "var(--train)"
      : status === "syncing"
        ? "var(--rest)"
        : status === "off"
          ? "var(--ink-3)"
          : "var(--heat)";

  return (
    <section
      className="rounded-2xl border p-4"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "var(--ink-3)" }}
        >
          Sinhronizacija
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: dot }}
            aria-hidden="true"
          />
          <span className="text-xs font-semibold" style={{ color: "var(--ink-2)" }}>
            {LABEL[status]}
          </span>
        </span>
      </div>

      {pin ? (
        <>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>
            Podaci se sinhronizuju na svim uređajima s ovim PIN-om. Kilaža,
            obroci, trening i slike su u oblaku i u arhivi.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={syncNow}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold"
              style={{ background: "var(--train)", color: "#fff" }}
            >
              Sinhronizuj sad
            </button>
            <button
              type="button"
              onClick={clearPin}
              className="rounded-xl border px-4 py-2.5 text-sm font-bold"
              style={{ borderColor: "var(--line-2)", color: "var(--ink-2)" }}
            >
              Isključi
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>
            Upiši svoj tajni PIN (min. 4 znaka) i isti taj PIN na telefonu i na
            webu — podaci se onda dijele i čuvaju u oblaku.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="npr. 4821 ili tajna-rijec"
              aria-label="PIN za sinhronizaciju"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 rounded-xl border px-3 py-2.5 text-base outline-none"
              style={{
                background: "var(--panel-2)",
                borderColor: "var(--line-2)",
                color: "var(--ink)",
              }}
            />
            <button
              type="button"
              disabled={!valid}
              onClick={() => setPin(input.trim())}
              className="rounded-xl px-4 py-2.5 text-sm font-bold"
              style={{
                background: valid ? "var(--train)" : "var(--panel-2)",
                color: valid ? "#fff" : "var(--ink-3)",
              }}
            >
              Uključi
            </button>
          </div>
        </>
      )}
    </section>
  );
}
