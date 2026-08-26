"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import plan from "@/data/plan.json";
import type { Day } from "@/lib/types";
import { dayNumberFor } from "@/lib/dates";
import TopBar from "@/components/TopBar";

const days = plan as Day[];

export default function DaniPage() {
  const [today, setToday] = useState<number>(0);

  useEffect(() => {
    setToday(dayNumberFor());
  }, []);

  return (
    <>
      <TopBar section="Dani" />

      <main className="mx-auto max-w-md px-4 pb-6 pt-4">
        <p className="mb-4 text-sm" style={{ color: "var(--ink-2)" }}>
          27.08. – 25.09.2026. · <span style={{ color: "var(--train)" }}>trening</span>{" "}
          i <span style={{ color: "var(--ink-3)" }}>odmor</span> dani.
        </p>

        <div className="grid grid-cols-3" style={{ gap: 1, background: "var(--line)" }}>
          {days.map((d) => {
            const isToday = d.n === today;
            const hasNote = d.napomene.length > 0;
            return (
              <Link
                key={d.n}
                href={`/dan/${d.n}`}
                className="flex flex-col p-3"
                style={{
                  background: "var(--panel)",
                  borderTop: `3px solid ${isToday ? "var(--train)" : (d.trening ? "var(--train-badge)" : "var(--line)")}`,
                }}
              >
                <div className="flex items-start justify-between">
                  <span
                    className="tabnum leading-none"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 300,
                      fontSize: 22,
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
                  className="tabnum mt-1 text-xs"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}
                >
                  {d.datum.slice(0, 6)}
                </span>
                <span
                  className="mt-0.5 text-[11px]"
                  style={{ letterSpacing: "0.16px", color: d.trening ? "var(--train)" : "var(--ink-3)" }}
                >
                  {d.trening ? "Trening" : "Odmor"}
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
