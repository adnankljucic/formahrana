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
  setPin: (pin: string) => void;
  clearPin: () => void;
  syncNow: () => void;
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
  const lastPushed = useRef<string>("");

  // Inicijalno povlačenje iz oblaka (ako PIN postoji).
  useEffect(() => {
    const savedPin = readString(PIN_KEY, "");
    setPinState(savedPin);
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

  return (
    <Ctx.Provider value={{ pin, status, version, setPin, clearPin, syncNow }}>
      {children}
    </Ctx.Provider>
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
