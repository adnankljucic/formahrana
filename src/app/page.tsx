"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { dayNumberFor } from "@/lib/dates";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dan/${dayNumberFor()}`);
  }, [router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ color: "var(--ink-3)" }}
    >
      <span
        className="text-sm font-semibold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Učitavam današnji dan…
      </span>
    </div>
  );
}
