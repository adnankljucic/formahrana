"use client";

import { useEffect, useState } from "react";
import { dayNumberFor, isPlanFinished, PLAN_DAYS } from "@/lib/dates";

// Tanka full-width traka napretka ciklusa (30 dana), odmah iznad menija.
export default function CycleStrip() {
  const [todayN, setTodayN] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setTodayN(dayNumberFor());
    setFinished(isPlanFinished());
  }, []);

  return (
    <div
      className="fixed inset-x-0 z-40 flex gap-[2px] px-1.5 py-1"
      style={{
        bottom: "calc(56px + env(safe-area-inset-bottom))",
        background: "var(--bg)",
      }}
      aria-hidden="true"
    >
      {Array.from({ length: PLAN_DAYS }).map((_, i) => {
        const n = i + 1;
        const passed = finished || n < todayN;
        const isToday = !finished && n === todayN;
        return (
          <span
            key={n}
            className="h-2 flex-1 rounded-[2px]"
            style={{
              background: isToday
                ? "var(--train)"
                : passed
                  ? "var(--ink)"
                  : "var(--panel-2)",
            }}
          />
        );
      })}
    </div>
  );
}
