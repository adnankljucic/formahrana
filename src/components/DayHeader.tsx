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
    <header
      className="sticky top-0 z-30 border-b px-3 pb-3 pt-3"
      style={{
        background: "var(--bg)",
        borderColor: "var(--line)",
        paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)",
      }}
    >
      <div className="mx-auto flex max-w-md items-center gap-2">
        <NavArrow to={prev} dir="prev" />

        <div className="min-w-0 flex-1 text-center">
          <div
            className="truncate text-lg font-extrabold leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            Dan {n} · {short} {dm}
          </div>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
              style={{
                background: trening ? "var(--train-soft)" : "var(--rest-soft)",
                color: trening ? "var(--train)" : "var(--rest)",
              }}
            >
              {trening ? "Trening" : "Odmor"}
            </span>
            {showToday && (
              <Link
                href={`/dan/${today}`}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                style={{ borderColor: "var(--line-2)", color: "var(--ink-2)" }}
              >
                Danas →
              </Link>
            )}
          </div>
        </div>

        <NavArrow to={next} dir="next" />
      </div>
    </header>
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
        className="tap flex items-center justify-center rounded-lg"
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
      className="tap flex items-center justify-center rounded-lg border"
      style={{ borderColor: "var(--line)", color: "var(--ink)" }}
    >
      {icon}
    </Link>
  );
}
