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
      className="flex gap-3"
      style={{ background: "var(--flag-soft)", padding: 16 }}
    >
      <span className="w-[3px] shrink-0 self-stretch" style={{ background: "var(--flag)" }} />
      <span className="text-sm" style={{ color: "var(--ink)" }}>
        Plan je završen, javi treneru za novi.
      </span>
    </div>
  );
}
