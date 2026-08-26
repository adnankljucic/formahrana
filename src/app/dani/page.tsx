"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import plan from "@/data/plan.json";
import type { Day } from "@/lib/types";
import { dayNumberFor } from "@/lib/dates";

const days = plan as Day[];

export default function DaniPage() {
  const [today, setToday] = useState<number>(0);

  useEffect(() => {
    setToday(dayNumberFor());
  }, []);

  return (
    <main className="mx-auto max-w-md px-3 pb-4 pt-3"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
      <h1
        className="mb-1 text-2xl font-extrabold"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Svih 30 dana
      </h1>
      <p className="mb-4 text-sm" style={{ color: "var(--ink-3)" }}>
        27.08. – 25.09.2026. · <span style={{ color: "var(--train)" }}>trening</span>{" "}
        i <span style={{ color: "var(--rest)" }}>odmor</span> dani.
      </p>

      <div className="grid grid-cols-3 gap-2.5">
        {days.map((d) => {
          const isToday = d.n === today;
          const hasNote = d.napomene.length > 0;
          return (
            <Link
              key={d.n}
              href={`/dan/${d.n}`}
              className="relative flex flex-col overflow-hidden rounded-xl border p-2.5"
              style={{
                background: "var(--panel)",
                borderColor: isToday ? "var(--ink)" : "var(--line)",
                borderWidth: isToday ? 2 : 1,
              }}
            >
              {/* Lijeva traka u boji. */}
              <span
                className="absolute inset-y-0 left-0 w-1.5"
                style={{
                  background: d.trening ? "var(--train)" : "var(--rest)",
                }}
                aria-hidden="true"
              />
              <div className="flex items-start justify-between pl-1.5">
                <span
                  className="text-lg font-extrabold leading-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--ink)",
                  }}
                >
                  {d.n}
                </span>
                {hasNote && (
                  <span
                    className="mt-0.5 h-2 w-2 rounded-full"
                    style={{ background: "var(--flag)" }}
                    aria-label="Ima napomenu"
                  />
                )}
              </div>
              <span
                className="tabnum mt-1 pl-1.5 text-xs font-semibold"
                style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}
              >
                {d.datum.slice(0, 6)}
              </span>
              <span
                className="pl-1.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ color: d.trening ? "var(--train)" : "var(--rest)" }}
              >
                {d.trening ? "Trening" : "Odmor"}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
