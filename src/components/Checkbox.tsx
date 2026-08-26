"use client";

import { useEffect, useState } from "react";
import { readJSON, writeJSON } from "@/lib/storage";

// Checkbox čije stanje se čuva u localStorage-u pod datim ključem.
export default function Checkbox({
  storageKey,
  label,
}: {
  storageKey: string;
  label: string;
}) {
  const [checked, setChecked] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChecked(readJSON<boolean>(storageKey, false));
    setReady(true);
  }, [storageKey]);

  function toggle() {
    const next = !checked;
    setChecked(next);
    writeJSON(storageKey, next);
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={toggle}
      className="tap flex items-center justify-center rounded-lg"
      style={{
        // Prije hidracije prikaži nečekiran izgled da nema skoka.
        opacity: ready ? 1 : 0.9,
      }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-md border-2 transition-colors"
        style={{
          borderColor: checked ? "var(--train)" : "var(--line-2)",
          background: checked ? "var(--train)" : "transparent",
        }}
      >
        {checked && (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12l5 5L20 6" />
          </svg>
        )}
      </span>
    </button>
  );
}
