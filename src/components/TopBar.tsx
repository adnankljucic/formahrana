"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSync } from "./SyncProvider";
import { todaysNotifications, type Notifikacija } from "@/lib/notifications";

export default function TopBar({ section }: { section: string }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notifikacija[]>([]);
  const { locked, openUnlock } = useSync();

  useEffect(() => {
    setNotifs(todaysNotifications());
  }, []);

  const live = notifs.filter((n) => n.kind !== "info");
  const hasDot = live.length > 0;

  return (
    <div className="sticky top-0 z-30" style={{ background: "var(--bg)" }}>
      <div
        className="mx-auto flex max-w-md items-center gap-4 border-b px-4"
        style={{
          height: 48,
          borderColor: "var(--line)",
          background: "var(--panel)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="truncate text-sm" style={{ letterSpacing: "0.16px" }}>
          <span className="font-semibold" style={{ color: "var(--ink)" }}>
            Plan ishrane
          </span>
          <span style={{ color: "var(--ink-2)" }}> / {section}</span>
        </div>
        <div className="flex-1" />
        <span
          className="tabnum shrink-0 text-xs"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}
        >
          M1
        </span>

        <button
          type="button"
          onClick={openUnlock}
          aria-label={locked ? "Otključaj izmjene" : "Izmjene uključene"}
          className="tap -mr-2 flex shrink-0 items-center justify-center"
          style={{ color: locked ? "var(--ink-3)" : "var(--train)" }}
        >
          {locked ? <LockIcon /> : <UnlockIcon />}
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Obavještenja"
          className="tap -mr-2 flex shrink-0 items-center justify-center relative"
          style={{ color: "var(--ink)" }}
        >
          <BellIcon />
          {hasDot && (
            <span
              className="absolute rounded-full"
              style={{
                top: 12,
                right: 12,
                width: 8,
                height: 8,
                background: "var(--flag)",
              }}
            />
          )}
        </button>
      </div>

      {open && (
        <div
          className="mx-auto max-w-md border-b"
          style={{
            background: "var(--panel)",
            borderColor: "var(--line)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 pb-2 pt-3"
          >
            <span
              className="text-xs"
              style={{ color: "var(--ink-2)", letterSpacing: "0.32px" }}
            >
              Obavještenja
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs"
              style={{ color: "var(--train)" }}
            >
              Zatvori
            </button>
          </div>
          {notifs.length === 0 ? (
            <div
              className="px-4 pb-4 text-sm"
              style={{ color: "var(--ink-3)" }}
            >
              Nema novih obavještenja.
            </div>
          ) : (
            notifs.map((n, i) => (
              <Link
                key={i}
                href={n.href}
                onClick={() => setOpen(false)}
                className="flex gap-3 border-t px-4 py-3"
                style={{ borderColor: "var(--line)", background: n.bg }}
              >
                <span
                  className="w-[3px] shrink-0 self-stretch"
                  style={{ background: n.accent }}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {n.title}
                  </div>
                  <div
                    className="mt-0.5 text-sm"
                    style={{ color: "var(--ink-2)" }}
                  >
                    {n.body}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M28 22h-2V15a10 10 0 0 0-8-9.8V2h-4v3.2A10 10 0 0 0 6 15v7H4v2h9.1a3 3 0 0 0 5.8 0H28ZM16 28a1 1 0 0 1-1-1h2a1 1 0 0 1-1 1ZM8 22V15a8 8 0 0 1 16 0v7Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" />
      <path d="M8 10V7a4 4 0 018 0v3" />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" />
      <path d="M8 10V7a4 4 0 017.4-2.1" />
    </svg>
  );
}
