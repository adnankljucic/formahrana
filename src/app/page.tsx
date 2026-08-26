"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import plan from "@/data/plan.json";
import type { Day } from "@/lib/types";
import {
  dayNumberFor,
  isPlanFinished,
  isPlanNotStarted,
  todayDayNumber,
  todayKey,
  PLAN_DAYS,
} from "@/lib/dates";
import {
  readWeights,
  readTarget,
  daysUntil,
  VAGANJA,
  SLIKE,
  type WeightSummary,
} from "@/lib/progress";
import { treningZaDan } from "@/lib/trening";
import { readJSON, writeJSON, K } from "@/lib/storage";
import { useSync } from "@/components/SyncProvider";
import TopBar from "@/components/TopBar";
import WaterTracker from "@/components/WaterTracker";
import { todaysNotifications, type Notifikacija } from "@/lib/notifications";

const days = plan as Day[];

export default function Dashboard() {
  const [ready, setReady] = useState(false);
  const [todayN, setTodayN] = useState(1);
  const [finished, setFinished] = useState(false);
  const [notStarted, setNotStarted] = useState(false);
  const [weights, setWeights] = useState<WeightSummary>({
    history: [],
    current: null,
    start: null,
  });
  const [target, setTarget] = useState(80);
  const [meals, setMeals] = useState<boolean[]>([]);
  const [exercises, setExercises] = useState<boolean[]>([]);
  const [weighToday, setWeighToday] = useState<string | null>(null); // datum ako je danas vaganje
  const [weightInput, setWeightInput] = useState("");
  const [notifs, setNotifs] = useState<Notifikacija[]>([]);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [expandedMeals, setExpandedMeals] = useState<Set<number>>(new Set());
  const { locked, openUnlock } = useSync();

  function refreshMealsExercises(n: number, d: Day | undefined) {
    if (!d) return;
    setMeals(d.obroci.map((_, i) => readJSON<boolean>(K.meal(n, i), false)));
    const tr = d.trening ? treningZaDan(n) : null;
    setExercises(
      tr ? tr.vjezbe.map((_, i) => readJSON<boolean>(K.trening(n, i), false)) : []
    );
  }

  useEffect(() => {
    const n = dayNumberFor();
    setTodayN(n);
    setFinished(isPlanFinished());
    setNotStarted(isPlanNotStarted());
    setTarget(readTarget());
    setNotifs(todaysNotifications());

    const iso = todayKey();
    const vaganjeDatum = VAGANJA.find((t) => t.iso === iso)?.datum ?? null;
    setWeighToday(vaganjeDatum);
    if (vaganjeDatum) {
      const w = readJSON<Record<string, string>>(K.weight(), {});
      setWeightInput(w[vaganjeDatum] ?? "");
    }

    const day = days.find((d) => d.n === n);
    refreshMealsExercises(n, day);
    setWeights(readWeights());
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const day = days.find((d) => d.n === todayN) as Day | undefined;
  const trening = day?.trening ? treningZaDan(todayN) : null;

  function saveTarget(val: string) {
    if (locked) {
      openUnlock();
      return;
    }
    const clean = parseFloat(val.replace(",", "."));
    const t = Number.isFinite(clean) && clean > 0 ? clean : 0;
    setTarget(t);
    writeJSON(K.target(), t);
  }

  function saveWeighIn() {
    if (locked) {
      openUnlock();
      return;
    }
    if (!weighToday) return;
    const v = parseFloat(weightInput.replace(",", "."));
    if (!Number.isFinite(v)) return;
    const w = readJSON<Record<string, string>>(K.weight(), {});
    w[weighToday] = String(v);
    writeJSON(K.weight(), w);
    setWeights(readWeights());
  }

  function toggleMeal(i: number) {
    if (locked) {
      openUnlock();
      return;
    }
    const next = !meals[i];
    const copy = meals.slice();
    copy[i] = next;
    setMeals(copy);
    writeJSON(K.meal(todayN, i), next);
  }

  function toggleExercise(i: number) {
    if (locked) {
      openUnlock();
      return;
    }
    const next = !exercises[i];
    const copy = exercises.slice();
    copy[i] = next;
    setExercises(copy);
    writeJSON(K.trening(todayN, i), next);
  }

  // Sljedeći termin = prvi nadolazeći koji JOŠ NIJE unesen/odrađen.
  const [photosDone, setPhotosDoneState] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setPhotosDoneState(readJSON<Record<string, boolean>>(K.photos(), {}));
  }, []);
  const enteredVaga = new Set(weights.history.map((h) => h.termin.iso));
  const nextVaga =
    VAGANJA.find((t) => daysUntil(t.iso) >= 0 && !enteredVaga.has(t.iso)) ?? null;
  const nextSlika =
    SLIKE.find((t) => daysUntil(t.iso) >= 0 && !photosDone[t.datum]) ?? null;

  const liveAlert = notifs.find((n) => n.kind !== "info");
  const showAlert = ready && !!liveAlert && !alertDismissed;

  const dayPct = Math.round((todayN / PLAN_DAYS) * 100);
  const daysLeft = PLAN_DAYS - todayN;
  const realN = todayDayNumber();

  function toggleMealExpand(i: number) {
    const next = new Set(expandedMeals);
    if (next.has(i)) {
      next.delete(i);
    } else {
      next.add(i);
    }
    setExpandedMeals(next);
  }

  return (
    <>
      <TopBar section="Pregled" />

      {/* Greeting Header */}
      <div
        className="mx-auto w-full max-w-md px-4 py-6"
        style={{ background: "#e8f0f7" }}
      >
        <h1 className="text-3xl font-bold" style={{ color: "#0066cc", letterSpacing: "-0.5px" }}>
          POZDRAV ADNANE
        </h1>
      </div>

      {showAlert && liveAlert && (
        <div
          className="mx-auto flex max-w-md items-start gap-3 px-4 py-3.5"
          style={{ background: liveAlert.bg }}
        >
          <span
            className="w-[3px] shrink-0 self-stretch"
            style={{ background: liveAlert.accent }}
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {liveAlert.title}
            </div>
            <div
              className="mt-0.5 text-sm"
              style={{ color: "var(--ink-2)", textWrap: "pretty" }}
            >
              {liveAlert.body}
            </div>
            <Link
              href={liveAlert.href}
              className="mt-2 inline-block text-sm"
              style={{ color: "var(--train)" }}
            >
              {liveAlert.cta} →
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setAlertDismissed(true)}
            aria-label="Zatvori"
            className="tap flex items-center justify-center"
            style={{ color: "var(--ink)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}

      <main className="mx-auto flex max-w-md flex-col" style={{ gap: 1, background: "#f5f5f5" }}>
        {/* Hero dan */}
        <div style={{ background: "#0066cc", padding: 16, color: "#ffffff" }}>
          <div className="text-xs" style={{ color: "#b3d9ff", letterSpacing: "0.32px" }}>
            Mjesec 1 · 27.08 – 25.09.2026.
          </div>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span
                className="tabnum leading-none"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 300,
                  fontSize: 42,
                  letterSpacing: "-0.64px",
                  color: "#ffffff",
                }}
              >
                {ready ? String(todayN).padStart(2, "0") : "—"}
              </span>
              <span
                className="text-sm"
                style={{ fontFamily: "var(--font-mono)", color: "#b3d9ff" }}
              >
                / {PLAN_DAYS} dana
              </span>
            </div>
            {day && (
              <span
                className="inline-flex h-6 items-center px-3 text-xs"
                style={{
                  letterSpacing: "0.32px",
                  background: "#ffffff",
                  color: "#0066cc",
                  fontWeight: 600,
                }}
              >
                {day.trening ? "Trening" : "Odmor"}
              </span>
            )}
          </div>
          <div className="mt-4 h-1" style={{ background: "#004080" }}>
            <div
              className="h-1"
              style={{ background: "#ffffff", width: `${ready ? dayPct : 0}%` }}
            />
          </div>
          <div
            className="mt-2 flex justify-between text-xs"
            style={{ color: "#b3d9ff" }}
          >
            <span>{day ? `${day.dan}, ${day.datum.slice(0, 6)}` : ""}</span>
            <span>{finished ? "Plan završen" : `Ostalo ${daysLeft} dana`}</span>
          </div>
        </div>

        {/* Težina — 3 kolone */}
        <div className="grid grid-cols-3" style={{ gap: 1 }}>
          <StatCell label="Trenutno" blue>
            <span
              className="tabnum"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: 24, color: "#0066cc" }}
            >
              {ready && weights.current != null
                ? weights.current.toFixed(1).replace(".", ",")
                : "—"}
            </span>
          </StatCell>
          <StatCell label="Cilj" blue>
            <input
              inputMode="decimal"
              readOnly={locked}
              value={ready ? String(target).replace(".", ",") : ""}
              onChange={(e) => saveTarget(e.target.value)}
              onFocus={() => locked && openUnlock()}
              aria-label="Ciljana težina"
              className="tabnum w-full border-0 bg-transparent p-0 outline-none"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 300, fontSize: 24, color: "#0066cc" }}
            />
          </StatCell>
          <StatCell label="Razlika" blue>
            <span
              className="tabnum"
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 300,
                fontSize: 24,
                color:
                  weights.current == null
                    ? "#0066cc"
                    : weights.current - target > 0
                      ? "#d63031"
                      : "#27ae60",
              }}
            >
              {ready && weights.current != null
                ? (weights.current - target > 0 ? "+" : "") +
                  (weights.current - target).toFixed(1).replace(".", ",")
                : "—"}
            </span>
          </StatCell>
        </div>

        {/* Jutarnja težina — samo na dan vaganja */}
        {ready && weighToday && (
          <div style={{ background: "var(--panel)", padding: 16 }}>
            <label
              htmlFor="kg"
              className="block text-xs"
              style={{ color: "var(--ink-2)", letterSpacing: "0.32px" }}
            >
              Jutarnja težina (kg)
            </label>
            <div className="mt-2 flex">
              <input
                id="kg"
                inputMode="decimal"
                readOnly={locked}
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                onFocus={() => locked && openUnlock()}
                onKeyDown={(e) => e.key === "Enter" && saveWeighIn()}
                placeholder="npr. 92,4"
                className="h-12 min-w-0 flex-1 border-0 border-b px-4 text-sm outline-none"
                style={{ background: "var(--panel-2)", borderColor: "var(--line-2)", color: "var(--ink)" }}
              />
              <button
                type="button"
                onClick={saveWeighIn}
                className="h-12 shrink-0 px-4 text-sm font-medium"
                style={{ background: "var(--train)", color: "#fff", letterSpacing: "0.16px" }}
              >
                Sačuvaj
              </button>
            </div>
            <div className="mt-2 text-xs" style={{ color: "var(--ink-3)" }}>
              Natašte, poslije WC-a, prije vode i hrane.
            </div>
          </div>
        )}

        {/* Trening */}
        {day?.trening && trening && (
          <div style={{ background: "var(--panel)" }}>
            <div className="flex items-center justify-between px-4 pb-3 pt-4">
              <div>
                <div className="text-base font-semibold" style={{ color: "var(--ink)", letterSpacing: "0.5px" }}>TRENING</div>
                <div className="mt-0.5 text-xs" style={{ color: "var(--ink-3)" }}>
                  {trening.naslov}
                </div>
              </div>
              <span
                className="tabnum text-xs"
                style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}
              >
                {ready ? exercises.filter(Boolean).length : 0} / {trening.vjezbe.length}
              </span>
            </div>
            {trening.vjezbe.map((v, i) => {
              const on = ready && exercises[i];
              const youtubeUrl = v.youtube;
              return (
                <div
                  key={i}
                  className="flex w-full items-center gap-3 border-t px-4 py-3"
                  style={{ borderColor: "var(--line)", minHeight: 48 }}
                >
                  <button
                    type="button"
                    onClick={() => toggleExercise(i)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <RowCheckbox on={!!on} />
                    <span
                      className="min-w-0 flex-1 text-sm"
                      style={{
                        letterSpacing: "0.16px",
                        color: on ? "var(--ink-3)" : "var(--ink)",
                        textDecoration: on ? "line-through" : "none",
                      }}
                    >
                      {v.naziv}
                    </span>
                  </button>
                  <span
                    className="tabnum shrink-0 text-sm"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}
                  >
                    {v.serije ? `${v.serije}×${v.ponavljanja ?? ""}` : v.ponavljanja ?? ""}
                  </span>
                  {youtubeUrl && (
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 items-center gap-1 shrink-0 px-2 py-1 rounded text-xs font-medium"
                      style={{ background: "#FF0000", color: "#ffffff" }}
                      aria-label="Pogledaj na YouTube-u"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>Video</span>
                    </a>
                  )}
                </div>
              );
            })}
            <div
              className="flex gap-3 border-t px-4 py-3.5"
              style={{ borderColor: "var(--line)", background: "var(--train-soft)" }}
            >
              <span className="w-1 shrink-0 self-stretch" style={{ background: "var(--train)" }} />
              <div className="text-sm" style={{ color: "var(--ink)" }}>
                Odmah poslije treninga: 1 mjerica wheya s vodom + 1 banana.
              </div>
            </div>
          </div>
        )}

        {/* Obroci */}
        {day && (
          <div style={{ background: "var(--panel)" }}>
            <div className="flex items-center justify-between px-4 pb-3 pt-4">
              <div className="text-base font-semibold" style={{ color: "var(--ink)", letterSpacing: "0.5px" }}>OBROCI</div>
              <span
                className="tabnum text-xs"
                style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}
              >
                {ready ? meals.filter(Boolean).length : 0} / {day.obroci.length}
              </span>
            </div>
            {day.obroci.map((m, i) => {
              const on = ready && meals[i];
              const isExpanded = expandedMeals.has(i);
              return (
                <div key={i} style={{ borderTop: "1px solid var(--line)" }}>
                  <div className="flex w-full items-start gap-3 px-4 py-3" style={{ minHeight: 48 }}>
                    <button
                      type="button"
                      onClick={() => toggleMeal(i)}
                      className="mt-0.5 shrink-0"
                      aria-label={`${on ? "Odjavi" : "Prijavi"}: ${m.naslov}`}
                    >
                      <RowCheckbox on={!!on} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <span
                        className="text-sm"
                        style={{
                          letterSpacing: "0.16px",
                          color: on ? "var(--ink-3)" : "var(--ink)",
                          textDecoration: on ? "line-through" : "none",
                        }}
                      >
                        {m.naslov}
                      </span>
                      {isExpanded && (
                        <div
                          className="mt-0.5 text-sm"
                          style={{ color: "var(--ink-2)", textWrap: "pretty" }}
                        >
                          {m.stavke.join(" · ")}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleMealExpand(i)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                      style={{ background: "#e8f0f7", color: "#0066cc", fontWeight: "bold", fontSize: 18, marginTop: "2px" }}
                      aria-label={isExpanded ? "Sakrij" : "Prikaži"}
                    >
                      {isExpanded ? "−" : "+"}
                    </button>
                  </div>
                </div>
              );
            })}
            <Link
              href={`/dan/${todayN}`}
              className="flex items-center justify-between border-t px-4 py-3.5 text-sm font-semibold"
              style={{ borderColor: "var(--line)", letterSpacing: "0.16px", color: "var(--ink)" }}
            >
              <span>Cijeli dan i gramaže</span>
              <span style={{ color: "var(--train)" }}>→</span>
            </Link>
          </div>
        )}

        {/* Voda */}
        {ready && !finished && realN != null && (
          <div style={{ background: "var(--panel)", padding: 16 }}>
            <WaterTracker dayN={todayN} />
          </div>
        )}

        {/* Sljedeće */}
        {(nextVaga || nextSlika) && (
          <div style={{ background: "var(--panel)" }}>
            <div className="px-4 pb-2 pt-4 text-base font-semibold" style={{ color: "var(--ink)", letterSpacing: "0.5px" }}>
              SLJEDEĆE
            </div>
            {[
              nextVaga && { t: nextVaga, title: "Vaganje", note: "javi kg treneru" },
              nextSlika && { t: nextSlika, title: "Slike forme", note: "isto svjetlo, isti ugao" },
            ]
              .filter((x): x is { t: (typeof VAGANJA)[number]; title: string; note: string } => !!x)
              .map((x, i) => {
                const dana = daysUntil(x.t.iso);
                const meta = dana === 0 ? "Danas" : dana === 1 ? "Sutra" : `Za ${dana} dana`;
                return (
                  <Link
                    key={i}
                    href="/napredak"
                    className="flex items-center gap-4 border-t px-4 py-3.5"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <span
                      className="tabnum shrink-0 text-sm"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--train)", minWidth: 56 }}
                    >
                      {x.t.kratko}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm" style={{ letterSpacing: "0.16px", color: "var(--ink)" }}>
                        {x.title}
                      </div>
                      <div className="mt-0.5 text-xs" style={{ color: "var(--ink-3)" }}>
                        {meta} · {x.note}
                      </div>
                    </div>
                    <span style={{ color: "var(--train)" }}>→</span>
                  </Link>
                );
              })}
          </div>
        )}

        {finished && <MonthTwoNote />}

        {/* Podnožje */}
        <div
          className="flex items-start gap-3"
          style={{ background: "var(--panel)", padding: 16 }}
        >
          <span className="w-1 shrink-0 self-stretch" style={{ background: "var(--ink)" }} />
          <div>
            <div className="text-sm" style={{ letterSpacing: "0.16px", color: "var(--ink)" }}>
              Sve gramaže su sirovo — izmjereno prije pripreme.
            </div>
            <Link href="/pravila" className="mt-2 inline-block text-sm" style={{ color: "var(--train)" }}>
              Sva pravila i zamjene →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCell({ label, children, blue }: { label: string; children: React.ReactNode; blue?: boolean }) {
  return (
    <div style={{ background: blue ? "#e8f0f7" : "var(--panel)", padding: "16px 12px" }}>
      <div className="text-xs" style={{ color: blue ? "#0066cc" : "var(--ink-2)", letterSpacing: "0.32px" }}>
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function RowCheckbox({ on }: { on: boolean }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center border"
      style={{
        width: 16,
        height: 16,
        borderColor: "var(--ink)",
        background: on ? "var(--train)" : "transparent",
        color: "#fff",
      }}
    >
      {on && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12l5 5L20 6" />
        </svg>
      )}
    </span>
  );
}

function MonthTwoNote() {
  return (
    <div style={{ background: "var(--panel)", padding: 16 }}>
      <div className="text-xs" style={{ color: "var(--ink-2)", letterSpacing: "0.32px" }}>
        Mjesec 2
      </div>
      <p className="mt-1 text-sm" style={{ color: "var(--ink)" }}>
        Mjesec 1 je završen. Novi plan se ubacuje čim ga trener pošalje —
        prethodni mjesec ide u arhivu profila.
      </p>
    </div>
  );
}
