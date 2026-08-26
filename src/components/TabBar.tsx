"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dayNumberFor } from "@/lib/dates";

type Item = {
  key: string;
  label: string;
  href: string;
  match: (path: string) => boolean;
  icon: (active: boolean) => React.ReactNode;
};

export default function TabBar() {
  const pathname = usePathname();
  const [todayN, setTodayN] = useState(1);

  useEffect(() => {
    setTodayN(dayNumberFor());
  }, []);

  const items: Item[] = [
    {
      key: "pregled",
      label: "Pregled",
      href: "/",
      match: (p) => p === "/",
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--train)" : "var(--ink-3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      ),
    },
    {
      key: "danas",
      label: "Danas",
      href: `/dan/${todayN}`,
      match: (p) => p.startsWith("/dan/"),
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--train)" : "var(--ink-3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5L12 3l9 7.5" />
          <path d="M5 9.5V20h14V9.5" />
        </svg>
      ),
    },
    {
      key: "dani",
      label: "Dani",
      href: "/dani",
      match: (p) => p === "/dani",
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--train)" : "var(--ink-3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M3 9h18M8 2v4M16 2v4" />
        </svg>
      ),
    },
    {
      key: "friteza",
      label: "Friteza",
      href: "/friteza",
      match: (p) => p === "/friteza",
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--train)" : "var(--ink-3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c1 3-1 4-2 6-1 2 0 4 2 4 1 0 2-1 2-3 2 2 3 4 3 6a5 5 0 01-10 0c0-3 2-5 3-7" />
        </svg>
      ),
    },
    {
      key: "napredak",
      label: "Napredak",
      href: "/napredak",
      match: (p) => p === "/napredak",
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--train)" : "var(--ink-3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17l6-6 4 4 7-8" />
          <path d="M17 4h4v4" />
        </svg>
      ),
    },
    {
      key: "pravila",
      label: "Pravila",
      href: "/pravila",
      match: (p) => p === "/pravila",
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? "var(--train)" : "var(--ink-3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M9 9h6M9 13h6M9 17h4" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t"
      style={{
        background: "var(--panel)",
        borderColor: "var(--line)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-label="Glavna navigacija"
    >
      <div className="mx-auto flex max-w-md items-stretch">
        {items.map((it) => {
          const active = it.match(pathname);
          return (
            <Link
              key={it.key}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 px-0.5"
              style={{ height: 56 }}
            >
              {it.icon(active)}
              <span
                className="whitespace-nowrap text-[9px] font-semibold"
                style={{ color: active ? "var(--train)" : "var(--ink-3)" }}
              >
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
