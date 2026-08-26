"use client";

import { useState } from "react";
import type { FryerStep } from "@/lib/types";
import { parseFryer } from "@/lib/fryer";
import { useTimers } from "./TimerProvider";

export default function FryerBlock({
  friteza,
  mealLabel,
}: {
  friteza: FryerStep[];
  mealLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const { start } = useTimers();

  return (
    <div
      className="mt-3 overflow-hidden rounded-none border"
      style={{ borderColor: "var(--line)", background: "var(--panel-2)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="tap flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2">
          <FlameIcon />
          <span className="text-sm" style={{ color: "var(--heat)" }}>
            Friteza
          </span>
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease-out",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="reveal px-3 pb-3">
          {/* Podsjetnik iznad prve košare. */}
          <div
            className="mb-3 rounded-none border p-2.5 text-xs leading-snug"
            style={{
              borderColor: "var(--line-2)",
              background: "var(--panel)",
              color: "var(--ink-2)",
            }}
          >
            Zagrij fritezu <strong>3–5 min</strong> na ciljnoj temperaturi.
            Košara A i B rade nezavisno — koristi <strong>SYNC</strong> da završe
            istovremeno. Ne puni košaru preko <strong>2/3</strong>, inače se
            hrana kuha umjesto da se peče.
          </div>

          <div className="flex flex-col gap-2">
            {friteza.map((step, i) => {
              const p = parseFryer(step.tekst);
              return (
                <div
                  key={i}
                  className="rounded-none border p-2.5"
                  style={{
                    borderColor: "var(--line)",
                    background: "var(--panel)",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-0.5 inline-flex shrink-0 items-center px-2 py-0.5 text-xs"
                      style={{
                        background: "var(--heat)",
                        color: "#fff",
                      }}
                    >
                      {step.kosara}
                    </span>
                    <p
                      className="text-sm leading-snug"
                      style={{ color: "var(--ink)" }}
                    >
                      {step.tekst}
                    </p>
                  </div>

                  {p.timerMinutes != null && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          start({
                            label: `${mealLabel} · ${step.kosara}`,
                            kosara: step.kosara.replace(/\s*—.*$/, "").trim(),
                            minutes: p.timerMinutes as number,
                          })
                        }
                        className="tap inline-flex items-center gap-1.5 px-3 py-1.5 text-sm"
                        style={{ background: "var(--heat)", color: "#fff" }}
                      >
                        <TimerIcon />
                        Pokreni tajmer
                        {p.timerMinutes ? ` · ${p.timerMinutes} min` : ""}
                      </button>
                      {p.temp != null && (
                        <span
                          className="tabnum text-xs font-semibold"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--ink-3)",
                          }}
                        >
                          {p.temp} °C · {p.rangeLabel}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FlameIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="var(--heat)"
      aria-hidden="true"
    >
      <path d="M12 2c1 3-1 4-2 6-1 2 0 4 2 4 1 0 2-1 2-3 2 2 3 4 3 6a5 5 0 01-10 0c0-3 2-5 3-7 1-2 2-3 2-6z" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="13" r="8" />
      <path d="M12 13V9M9 2h6" />
    </svg>
  );
}
