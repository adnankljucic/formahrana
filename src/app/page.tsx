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
  nextTermin,
  daysUntil,
  VAGANJA,
  SLIKE,
  type WeightSummary,
} from "@/lib/progress";
import { readJSON, writeJSON, K } from "@/lib/storage";
import SyncCard from "@/components/SyncCard";

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
  const [mealsDone, setMealsDone] = useState(0);
  const [water, setWater] = useState(0);
  const [flags, setFlags] = useState({
    vaganje: false,
    slike: false,
    trening: false,
  });

  useEffect(() => {
    const n = dayNumberFor();
    setTodayN(n);
    setFinished(isPlanFinished());
    setNotStarted(isPlanNotStarted());
    setWeights(readWeights());
    setTarget(readTarget());

    // Šta je danas: vaganje / slike / trening (samo ako je danas stvarni dan plana).
    const iso = todayKey();
    const realN = todayDayNumber();
    const realDay = realN != null ? days.find((d) => d.n === realN) : undefined;
    setFlags({
      vaganje: VAGANJA.some((t) => t.iso === iso),
      slike: SLIKE.some((t) => t.iso === iso),
      trening: !!realDay?.trening,
    });

    const day = days.find((d) => d.n === n);
    if (day) {
      let done = 0;
      day.obroci.forEach((_, i) => {
        if (readJSON<boolean>(K.meal(n, i), false)) done++;
      });
      setMealsDone(done);
    }
    setWater(readJSON<number>(K.water(n), 0));
    setReady(true);
  }, []);

  const day = days.find((d) => d.n === todayN) as Day | undefined;

  function saveTarget(val: string) {
    const clean = parseFloat(val.replace(",", "."));
    const t = Number.isFinite(clean) && clean > 0 ? clean : 0;
    setTarget(t);
    writeJSON(K.target(), t);
  }

  const nextVaga = nextTermin(VAGANJA);
  const nextSlikaT = nextTermin(SLIKE);

  return (
    <main
      className="mx-auto max-w-md px-3 pb-4"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
    >
      {/* Zaglavlje */}
      <div className="mb-4">
        <div
          className="text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--train)" }}
        >
          Mjesec 1 · 27.08 – 25.09.2026.
        </div>
        <h1
          className="mt-1 text-[28px] font-bold leading-none"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Pregled
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        {ready && <TodayFlags flags={flags} todayN={todayN} />}

        <WeightCard
          ready={ready}
          weights={weights}
          target={target}
          onTarget={saveTarget}
        />

        <TodayCard
          ready={ready}
          day={day}
          todayN={todayN}
          finished={finished}
          notStarted={notStarted}
          mealsDone={mealsDone}
          water={water}
        />

        <CycleBar todayN={todayN} finished={finished} />

        <div className="grid grid-cols-2 gap-3">
          <TerminCard
            label="Sljedeće vaganje"
            kratko={nextVaga?.kratko ?? "—"}
            dana={nextVaga ? daysUntil(nextVaga.iso) : null}
            href="/napredak"
          />
          <TerminCard
            label="Slike forme"
            kratko={nextSlikaT?.kratko ?? "—"}
            dana={nextSlikaT ? daysUntil(nextSlikaT.iso) : null}
            href="/napredak"
          />
        </div>

        {finished && <MonthTwoNote />}

        {/* Brze akcije */}
        <div className="grid grid-cols-3 gap-2">
          <QuickAction href={`/dan/${todayN}`} label="Danas">
            <PathHome />
          </QuickAction>
          <QuickAction href="/napredak" label="Težina">
            <PathScale />
          </QuickAction>
          <QuickAction href="/friteza" label="Friteza">
            <PathFlame />
          </QuickAction>
        </div>

        <SyncCard />
      </div>
    </main>
  );
}

/* ---------- Danas naglasak ---------- */

function TodayFlags({
  flags,
  todayN,
}: {
  flags: { vaganje: boolean; slike: boolean; trening: boolean };
  todayN: number;
}) {
  const items: { label: string; icon: React.ReactNode }[] = [];
  if (flags.trening)
    items.push({ label: "Danas TRENING", icon: <FlagDumbbell /> });
  if (flags.vaganje)
    items.push({ label: "Danas VAGANJE", icon: <FlagScale /> });
  if (flags.slike)
    items.push({ label: "Danas SLIKANJE", icon: <FlagCamera /> });

  if (items.length === 0) return null;

  return (
    <section
      className="overflow-hidden rounded-2xl"
      style={{ background: "var(--train)" }}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {items.map((it) => (
            <div key={it.label} className="flex items-center gap-2" style={{ color: "#fff" }}>
              {it.icon}
              <span
                className="text-base font-bold uppercase tracking-wide"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {it.label}
              </span>
            </div>
          ))}
        </div>

        {flags.trening && (
          <div
            className="mt-1 flex items-center justify-between rounded-xl px-3 py-2"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
          >
            <span className="text-xs font-semibold opacity-90">
              Trening plan za danas — stiže od trenera
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">
              Uskoro
            </span>
          </div>
        )}

        <Link
          href={`/dan/${todayN}`}
          className="mt-1 inline-flex w-fit items-center gap-1 text-sm font-bold"
          style={{ color: "#fff" }}
        >
          Otvori današnji dan →
        </Link>
      </div>
    </section>
  );
}

function FlagDumbbell() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />
    </svg>
  );
}
function FlagScale() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M5 7h14" />
      <path d="M5 7l-2.5 6a3 3 0 005 0L5 7zM19 7l-2.5 6a3 3 0 005 0L19 7z" />
      <path d="M8 21h8" />
    </svg>
  );
}
function FlagCamera() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h3l1.5-2h9L18 8h3v12H3z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

/* ---------- Weight ---------- */

function WeightCard({
  ready,
  weights,
  target,
  onTarget,
}: {
  ready: boolean;
  weights: WeightSummary;
  target: number;
  onTarget: (v: string) => void;
}) {
  const { current, start, history } = weights;
  const toGo = current != null ? current - target : null;
  const reached = toGo != null && toGo <= 0;

  // Napredak od početka prema cilju (0..1).
  let frac = 0;
  if (current != null && start != null && start !== target) {
    frac = (start - current) / (start - target);
    frac = Math.max(0, Math.min(1, frac));
  } else if (reached) {
    frac = 1;
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      <div
        className="h-1 w-full"
        style={{ background: "var(--train)" }}
        aria-hidden="true"
      />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div
              className="text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-3)" }}
            >
              Trenutna težina
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                className="tabnum text-[40px] font-bold leading-none"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
              >
                {ready && current != null
                  ? current.toFixed(1).replace(".", ",")
                  : "—"}
              </span>
              <span
                className="text-lg font-semibold"
                style={{ color: "var(--ink-3)" }}
              >
                kg
              </span>
            </div>
          </div>

          {/* Cilj — uredivo */}
          <div className="text-right">
            <div
              className="text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-3)" }}
            >
              Cilj
            </div>
            <div className="mt-1 flex items-center justify-end gap-1">
              <input
                inputMode="decimal"
                value={ready ? String(target).replace(".", ",") : ""}
                onChange={(e) => onTarget(e.target.value)}
                aria-label="Ciljana težina"
                className="tabnum w-16 rounded-lg border px-2 py-1 text-right text-xl font-bold outline-none"
                style={{
                  fontFamily: "var(--font-display)",
                  background: "var(--panel-2)",
                  borderColor: "var(--line-2)",
                  color: "var(--train)",
                }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--ink-3)" }}
              >
                kg
              </span>
            </div>
          </div>
        </div>

        {/* Traka napretka */}
        <div className="mt-4">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full"
            style={{ background: "var(--panel-2)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${frac * 100}%`, background: "var(--train)" }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span style={{ color: "var(--ink-3)" }}>
              {ready && start != null ? (
                <>
                  Start{" "}
                  <span
                    className="tabnum font-semibold"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}
                  >
                    {start.toFixed(1).replace(".", ",")} kg
                  </span>
                </>
              ) : (
                "Bez podataka"
              )}
            </span>
            <span
              className="font-bold"
              style={{ color: reached ? "var(--train)" : "var(--ink)" }}
            >
              {ready && current != null
                ? reached
                  ? "Cilj postignut 🎯"
                  : `još ${Math.abs(toGo as number)
                      .toFixed(1)
                      .replace(".", ",")} kg`
                : ""}
            </span>
          </div>
        </div>

        <Sparkline history={history} target={target} ready={ready} />

        {ready && current == null && (
          <Link
            href="/napredak"
            className="mt-3 flex items-center justify-center rounded-xl py-2.5 text-sm font-bold"
            style={{ background: "var(--train)", color: "#fff" }}
          >
            Unesi prvo vaganje →
          </Link>
        )}
      </div>
    </section>
  );
}

function Sparkline({
  history,
  target,
  ready,
}: {
  history: { value: number }[];
  target: number;
  ready: boolean;
}) {
  if (!ready || history.length < 2) return null;

  const W = 300;
  const H = 44;
  const pad = 4;
  const vals = history.map((h) => h.value).concat(target);
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const span = max - min;
  const x = (i: number) => pad + (i * (W - 2 * pad)) / (history.length - 1);
  const y = (v: number) => pad + (1 - (v - min) / span) * (H - 2 * pad);
  const line = history
    .map((h, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(h.value).toFixed(1)}`)
    .join(" ");
  const targetY = y(target);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      className="mt-3"
      role="img"
      aria-label="Kretanje težine"
      style={{ display: "block" }}
    >
      {/* ciljna linija */}
      <line
        x1={pad}
        y1={targetY}
        x2={W - pad}
        y2={targetY}
        stroke="var(--line-2)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <path
        d={line}
        fill="none"
        stroke="var(--train)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {history.map((h, i) => (
        <circle key={i} cx={x(i)} cy={y(h.value)} r="3" fill="var(--train)" />
      ))}
    </svg>
  );
}

/* ---------- Today ---------- */

function TodayCard({
  ready,
  day,
  todayN,
  finished,
  notStarted,
  mealsDone,
  water,
}: {
  ready: boolean;
  day: Day | undefined;
  todayN: number;
  finished: boolean;
  notStarted: boolean;
  mealsDone: number;
  water: number;
}) {
  if (!day) return null;
  const totalMeals = day.obroci.length;
  const waterL = (water * 0.25).toFixed(2).replace(".", ",");

  return (
    <Link
      href={`/dan/${todayN}`}
      className="block rounded-2xl border p-4"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      <div className="flex items-center justify-between">
        <div
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "var(--ink-3)" }}
        >
          {notStarted ? "Plan kreće" : "Danas"}
        </div>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
          style={{
            background: day.trening ? "var(--train-soft)" : "var(--rest-soft)",
            color: day.trening ? "var(--train)" : "var(--rest)",
          }}
        >
          {day.trening ? "Trening" : "Odmor"}
        </span>
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <span
          className="text-2xl font-bold leading-none"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          Dan {day.n}
        </span>
        <span
          className="tabnum text-sm font-semibold"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}
        >
          {day.dan}, {day.datum.slice(0, 6)}
        </span>
      </div>

      {finished ? (
        <p className="mt-2 text-sm font-semibold" style={{ color: "var(--train)" }}>
          Plan je završen — javi treneru za novi.
        </p>
      ) : (
        <div className="mt-3 flex items-center gap-4">
          <Stat label="Obroci" value={ready ? `${mealsDone}/${totalMeals}` : "—"} />
          <Stat label="Voda" value={ready ? `${waterL} L` : "—"} />
          {day.napomene.length > 0 && (
            <span
              className="ml-auto inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase"
              style={{ background: "var(--flag-soft)", color: "var(--flag)" }}
            >
              Napomena
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: "var(--ink-3)" }}
      >
        {label}
      </div>
      <div
        className="tabnum text-base font-bold"
        style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------- Cycle ---------- */

function CycleBar({ todayN, finished }: { todayN: number; finished: boolean }) {
  return (
    <section
      className="rounded-2xl border p-4"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      <div className="mb-2 flex items-baseline justify-between">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "var(--ink-3)" }}
        >
          Ciklus
        </span>
        <span
          className="tabnum text-sm font-bold"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}
        >
          Dan {todayN} / {PLAN_DAYS}
        </span>
      </div>
      <div className="flex gap-[3px]">
        {Array.from({ length: PLAN_DAYS }).map((_, i) => {
          const n = i + 1;
          const passed = finished || n < todayN;
          const isToday = !finished && n === todayN;
          return (
            <span
              key={n}
              className="h-6 flex-1 rounded-[3px]"
              style={{
                background: isToday
                  ? "var(--train)"
                  : passed
                    ? "var(--ink)"
                    : "var(--panel-2)",
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Termini ---------- */

function TerminCard({
  label,
  kratko,
  dana,
  href,
}: {
  label: string;
  kratko: string;
  dana: number | null;
  href: string;
}) {
  let sub = "završeno";
  if (dana != null) {
    if (dana === 0) sub = "danas";
    else if (dana > 0) sub = `za ${dana} ${dana === 1 ? "dan" : "dana"}`;
  }
  return (
    <Link
      href={href}
      className="rounded-2xl border p-3.5"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: "var(--ink-3)" }}
      >
        {label}
      </div>
      <div
        className="tabnum mt-1 text-xl font-bold leading-none"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        {kratko}
      </div>
      <div className="mt-1 text-xs font-semibold" style={{ color: "var(--train)" }}>
        {sub}
      </div>
    </Link>
  );
}

/* ---------- Month 2 ---------- */

function MonthTwoNote() {
  return (
    <section
      className="rounded-2xl border p-4"
      style={{ background: "var(--flag-soft)", borderColor: "var(--flag-soft)" }}
    >
      <div
        className="text-[11px] font-bold uppercase tracking-[0.14em]"
        style={{ color: "var(--flag)", opacity: 0.7 }}
      >
        Mjesec 2
      </div>
      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--flag)" }}>
        Mjesec 1 je završen. Novi plan se ubacuje čim ga trener pošalje —
        prethodni mjesec ide u arhivu profila.
      </p>
    </section>
  );
}

/* ---------- Quick actions ---------- */

function QuickAction({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      <span style={{ color: "var(--ink)" }}>{children}</span>
      <span className="text-xs font-semibold" style={{ color: "var(--ink-2)" }}>
        {label}
      </span>
    </Link>
  );
}

function PathHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  );
}
function PathScale() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M5 7h14" />
      <path d="M5 7l-2.5 6a3 3 0 005 0L5 7zM19 7l-2.5 6a3 3 0 005 0L19 7z" />
      <path d="M8 21h8" />
    </svg>
  );
}
function PathFlame() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c1 3-1 4-2 6-1 2 0 4 2 4 1 0 2-1 2-3 2 2 3 4 3 6a5 5 0 01-10 0c0-3 2-5 3-7" />
    </svg>
  );
}
