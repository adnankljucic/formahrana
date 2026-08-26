"use client";

import { useEffect, useState } from "react";
import { isPlanFinished } from "@/lib/dates";

// Traka „Plan je završen" — vidljiva samo kad je današnji datum poslije kraja plana.
export default function FinishedBanner() {
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setFinished(isPlanFinished());
  }, []);

  if (!finished) return null;

  return (
    <div
      className="rounded-xl border p-3 text-sm font-semibold"
      style={{
        background: "var(--flag-soft)",
        borderColor: "var(--flag)",
        color: "var(--flag)",
      }}
    >
      Plan je završen, javi treneru za novi.
    </div>
  );
}
