"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { readString, writeString } from "@/lib/storage";
import {
  snapshotLocal,
  applyState,
  fingerprint,
  pullState,
  pushState,
} from "@/lib/sync";

const PIN_KEY = "pi:pin";

export type SyncStatus = "off" | "syncing" | "synced" | "error" | "offline";

interface SyncCtx {
  pin: string;
  status: SyncStatus;
  version: number; // raste nakon povlačenja iz oblaka → remount sadržaja
  locked: boolean; // true = samo pregled (nema koda)
  setPin: (pin: string) => void;
  clearPin: () => void;
  syncNow: () => void;
  openUnlock: () => void; // otvori popup za unos koda
}

const Ctx = createContext<SyncCtx | null>(null);

export function useSync(): SyncCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSync mora biti unutar SyncProvider-a");
  return c;
}

export default function SyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pin, setPinState] = useState("");
  const [status, setStatus] = useState<SyncStatus>("off");
  const [version, setVersion] = useState(0);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastPushed = useRef<string>("");

  // Inicijalno povlačenje iz oblaka (ako PIN postoji).
  useEffect(() => {
    const savedPin = readString(PIN_KEY, "");
    setPinState(savedPin);
    setMounted(true);
    if (!savedPin) {
      setStatus("off");
      return;
    }
    let cancelled = false;
    setStatus("syncing");
    (async () => {
      try {
        const cloud = await pullState(savedPin);
        if (cancelled) return;
        if (cloud) {
          const changed = applyState(cloud);
          if (changed) setVersion((v) => v + 1);
        } else {
          // Oblak prazan → pošalji lokalno gore.
          await pushState(savedPin, snapshotLocal());
        }
        lastPushed.current = fingerprint(snapshotLocal());
        setStatus("synced");
      } catch {
        if (!cancelled) setStatus(navigator.onLine ? "error" : "offline");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Periodično slanje promjena u oblak.
  useEffect(() => {
    if (!pin || status === "off") return;

    async function maybePush() {
      const snap = snapshotLocal();
      const fp = fingerprint(snap);
      if (fp === lastPushed.current) return;
      try {
        await pushState(pin, snap);
        lastPushed.current = fp;
        setStatus("synced");
      } catch {
        setStatus(navigator.onLine ? "error" : "offline");
      }
    }

    const iv = window.setInterval(maybePush, 3000);
    const onHide = () => {
      if (document.visibilityState === "hidden") maybePush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      window.clearInterval(iv);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [pin, status]);

  const setPin = useCallback((next: string) => {
    writeString(PIN_KEY, next.trim());
    // Reload da se čisto povuče iz oblaka i remountuje sve.
    window.location.reload();
  }, []);

  const clearPin = useCallback(() => {
    try {
      localStorage.removeItem(PIN_KEY);
    } catch {
      /* ignoriši */
    }
    window.location.reload();
  }, []);

  const syncNow = useCallback(() => {
    if (!pin) return;
    setStatus("syncing");
    (async () => {
      try {
        const cloud = await pullState(pin);
        if (cloud && applyState(cloud)) setVersion((v) => v + 1);
        await pushState(pin, snapshotLocal());
        lastPushed.current = fingerprint(snapshotLocal());
        setStatus("synced");
      } catch {
        setStatus(navigator.onLine ? "error" : "offline");
      }
    })();
  }, [pin]);

  const openUnlock = useCallback(() => setUnlockOpen(true), []);
  const locked = mounted ? !pin : false;

  return (
    <Ctx.Provider
      value={{ pin, status, version, locked, setPin, clearPin, syncNow, openUnlock }}
    >
      {children}
      {unlockOpen && (
        <UnlockModal
          onClose={() => setUnlockOpen(false)}
          onUnlock={(code) => setPin(code)}
        />
      )}
    </Ctx.Provider>
  );
}

// Popup za unos koda — otvara izmjene i sinhronizaciju.
function UnlockModal({
  onClose,
  onUnlock,
}: {
  onClose: () => void;
  onUnlock: (code: string) => void;
}) {
  const [code, setCode] = useState("");
  const valid = /^[A-Za-z0-9_-]{4,64}$/.test(code.trim());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Unesi kod za izmjene"
    >
      <div
        className="modal-backdrop absolute inset-0"
        onClick={onClose}
        style={{ background: "rgba(8,9,11,0.55)", backdropFilter: "blur(6px)" }}
      />
      <div
        className="modal-sheet relative w-full max-w-md rounded-t-3xl p-6 sm:mb-0 sm:rounded-3xl"
        style={{
          background: "var(--panel)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.28)",
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
        }}
      >
        <div
          className="mx-auto mb-5 h-1.5 w-10 rounded-full sm:hidden"
          style={{ background: "var(--line-2)" }}
        />

        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "var(--train-soft)", color: "var(--train)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10" width="16" height="11" rx="2.5" />
            <path d="M8 10V7a4 4 0 018 0v3" />
          </svg>
        </div>

        <h2
          className="text-xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Unesi kod za izmjene
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
          Bez koda je sve vidljivo, ali samo za pregled. Upiši svoj kod da
          uključiš čekiranje, kilažu i trening — isti kod na svim uređajima
          drži podatke sinhronizovane.
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && valid) onUnlock(code.trim());
          }}
          placeholder="kod (min. 4 znaka)"
          aria-label="Kod"
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="mt-5 w-full rounded-2xl border px-4 py-3.5 text-base outline-none"
          style={{
            background: "var(--panel-2)",
            borderColor: "var(--line-2)",
            color: "var(--ink)",
          }}
        />

        <button
          type="button"
          disabled={!valid}
          onClick={() => onUnlock(code.trim())}
          className="mt-3 w-full rounded-2xl py-3.5 text-base font-bold transition-opacity"
          style={{
            background: "var(--train)",
            color: "#fff",
            opacity: valid ? 1 : 0.4,
          }}
        >
          Otključaj izmjene
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-2xl py-3 text-sm font-semibold"
          style={{ color: "var(--ink-3)" }}
        >
          Nastavi samo za pregled
        </button>
      </div>
    </div>
  );
}

// Omotač oko sadržaja stranice: remountuje se kad stigne novo stanje iz oblaka,
// tako da sve komponente ponovo pročitaju localStorage.
export function SyncedContent({ children }: { children: React.ReactNode }) {
  const { version } = useSync();
  return (
    <div
      key={version}
      style={{
        paddingBottom: "calc(56px + env(safe-area-inset-bottom) + 8px)",
      }}
    >
      {children}
    </div>
  );
}
