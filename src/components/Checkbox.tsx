"use client";

import { useEffect, useState } from "react";
import { readJSON, writeJSON } from "@/lib/storage";
import { useSync } from "./SyncProvider";

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
  const { locked, openUnlock } = useSync();

  useEffect(() => {
    setChecked(readJSON<boolean>(storageKey, false));
    setReady(true);
  }, [storageKey]);

  function toggle() {
    if (locked) {
      openUnlock();
      return;
    }
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
      className="tap flex items-center justify-center rounded-none"
      style={{
        // Prije hidracije prikaži nečekiran izgled da nema skoka.
        opacity: ready ? 1 : 0.9,
      }}
    >
      <span
        className="flex items-center justify-center border transition-colors"
        style={{
          width: 18,
          height: 18,
          borderColor: checked ? "var(--train)" : "var(--ink)",
          background: checked ? "var(--train)" : "transparent",
        }}
      >
        {checked && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="3.5"
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
