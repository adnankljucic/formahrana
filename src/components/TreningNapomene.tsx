"use client";

import { useState } from "react";

export default function TreningNapomene({ napomene }: { napomene: string[] }) {
  const [open, setOpen] = useState(false);
  if (napomene.length === 0) return null;

  return (
    <div
      className="el overflow-hidden rounded-xl border"
      style={{ borderColor: "var(--line)", background: "var(--panel)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="tap flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8h.01M11 12h1v5h1" />
          </svg>
          <span
            className="text-sm font-bold uppercase tracking-wide"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            Napomene trenera
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
        <ul className="reveal flex flex-col gap-2 px-4 pb-4">
          {napomene.map((n, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm leading-snug"
              style={{ color: "var(--ink-2)" }}
            >
              <span
                className="mt-2 h-1 w-1 shrink-0 rounded-full"
                style={{ background: "var(--ink-3)" }}
                aria-hidden="true"
              />
              <span>{n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
