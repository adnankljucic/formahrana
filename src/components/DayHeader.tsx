"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PLAN_DAYS } from "@/lib/dates";
import { todayDayNumber } from "@/lib/dates";

const SHORT: Record<string, string> = {
  Ponedjeljak: "Pon",
  Utorak: "Uto",
  Srijeda: "Sri",
  Četvrtak: "Čet",
  Petak: "Pet",
  Subota: "Sub",
  Nedjelja: "Ned",
};

export default function DayHeader({
  n,
  dan,
  datum,
  trening,
}: {
  n: number;
  dan: string;
  datum: string;
  trening: boolean;
}) {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    setToday(todayDayNumber());
  }, []);

  const short = SHORT[dan] ?? dan.slice(0, 3);
  const dm = datum.slice(0, 6); // "07.09."
  const prev = n > 1 ? n - 1 : null;
  const next = n < PLAN_DAYS ? n + 1 : null;
  const showToday = today != null && today !== n;

  return (
    <div className="sticky top-0 z-30" style={{ background: "var(--bg)" }}>
      <header
        className="mx-auto flex max-w-md items-center gap-2 border-b px-2"
        style={{
          height: 48,
          background: "var(--panel)",
          borderColor: "var(--line)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <NavArrow to={prev} dir="prev" />

        <div className="min-w-0 flex-1 text-center">
          <div
            className="truncate text-sm"
            style={{ letterSpacing: "0.16px", color: "var(--ink)" }}
          >
            <span className="font-semibold">Dan {n}</span>
            <span style={{ color: "var(--ink-2)" }}>
              {" "}
              · {short} {dm}
            </span>
          </div>
        </div>

        <span
          className="inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs"
          style={{
            letterSpacing: "0.32px",
            background: trening ? "var(--train-badge)" : "var(--rest-soft)",
            color: trening ? "var(--train-badge-ink)" : "var(--rest)",
          }}
        >
          {trening ? "Trening" : "Odmor"}
        </span>

        <NavArrow to={next} dir="next" />
      </header>

      {showToday && (
        <div
          className="mx-auto max-w-md border-b px-4 py-1.5 text-right"
          style={{ background: "var(--panel)", borderColor: "var(--line)" }}
        >
          <Link href={`/dan/${today}`} className="text-xs" style={{ color: "var(--train)" }}>
            Danas →
          </Link>
        </div>
      )}
    </div>
  );
}

function NavArrow({ to, dir }: { to: number | null; dir: "prev" | "next" }) {
  const path = dir === "prev" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6";
  const label = dir === "prev" ? "Prethodni dan" : "Sljedeći dan";

  const icon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );

  if (to == null) {
    return (
      <span
        className="tap flex shrink-0 items-center justify-center"
        style={{ color: "var(--line-2)" }}
        aria-hidden="true"
      >
        {icon}
      </span>
    );
  }

  return (
    <Link
      href={`/dan/${to}`}
      aria-label={label}
      className="tap flex shrink-0 items-center justify-center"
      style={{ color: "var(--ink)" }}
    >
      {icon}
    </Link>
  );
}
