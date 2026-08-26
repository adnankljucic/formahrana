import plan from "@/data/plan.json";
import type { Day } from "./types";
import { todayDayNumber, todayKey } from "./dates";
import { VAGANJA, SLIKE } from "./progress";
import { readJSON, K } from "./storage";

const days = plan as Day[];

export interface Notifikacija {
  kind: "vaganje" | "slike" | "trening" | "info";
  title: string;
  body: string;
  cta: string;
  href: string;
  accent: string; // CSS var
  bg: string; // CSS var
}

// Šta je danas relevantno — vaganje/slike/trening koji još nisu odrađeni,
// plus, ako ništa od toga, kad je sljedeće vaganje. Čisto localStorage čitanje,
// pozvati samo na klijentu (unutar useEffect).
export function todaysNotifications(): Notifikacija[] {
  const iso = todayKey();
  const realN = todayDayNumber();
  const day = realN != null ? days.find((d) => d.n === realN) : undefined;
  const list: Notifikacija[] = [];

  const isVaganjeDan = VAGANJA.some((t) => t.iso === iso);
  const isSlikeDan = SLIKE.some((t) => t.iso === iso);

  if (isVaganjeDan) {
    const weights = readJSON<Record<string, string>>(K.weight(), {});
    const entered = VAGANJA.find((t) => t.iso === iso)?.datum;
    const done = entered ? !!weights[entered] : false;
    if (!done) {
      list.push({
        kind: "vaganje",
        title: "Danas je vaganje",
        body: "Ujutru, natašte, poslije WC-a, prije vode i hrane. Upiši kg i javi treneru.",
        cta: "Upiši težinu",
        href: "/napredak",
        accent: "var(--train)",
        bg: "var(--train-soft)",
      });
    }
  }

  if (isSlikeDan) {
    const photos = readJSON<Record<string, boolean>>(K.photos(), {});
    const entered = SLIKE.find((t) => t.iso === iso)?.datum;
    const done = entered ? !!photos[entered] : false;
    if (!done) {
      list.push({
        kind: "slike",
        title: "Danas su slike forme",
        body: "Sprijeda, bočno i straga — isto svjetlo i isti ugao kao prošli put. Pošalji treneru.",
        cta: "Otvori napredak",
        href: "/napredak",
        accent: "var(--violet)",
        bg: "var(--violet-soft)",
      });
    }
  }

  if (day?.trening) {
    let mealsDone = 0;
    day.obroci.forEach((_, i) => {
      if (readJSON<boolean>(K.meal(day.n, i), false)) mealsDone++;
    });
    if (mealsDone < day.obroci.length) {
      list.push({
        kind: "trening",
        title: "Danas je trening",
        body: "Pogledaj vježbe za danas i čekiraj ih kako radiš.",
        cta: "Otvori trening",
        href: `/dan/${day.n}/trening`,
        accent: "var(--train)",
        bg: "var(--train-soft)",
      });
    }
  }

  if (list.length === 0 && realN != null) {
    const nextW = VAGANJA.find((t) => t.iso > iso);
    if (nextW) {
      list.push({
        kind: "info",
        title: "Sljedeće vaganje",
        body: `${nextW.kratko}`,
        cta: "Napredak",
        href: "/napredak",
        accent: "var(--ink-3)",
        bg: "var(--panel)",
      });
    }
  }

  return list;
}
