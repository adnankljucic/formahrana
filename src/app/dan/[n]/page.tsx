import Link from "next/link";
import { notFound } from "next/navigation";
import plan from "@/data/plan.json";
import type { Day } from "@/lib/types";
import { treningZaDan } from "@/lib/trening";
import DayHeader from "@/components/DayHeader";
import MealCard from "@/components/MealCard";
import WaterTracker from "@/components/WaterTracker";
import FinishedBanner from "@/components/FinishedBanner";

const days = plan as Day[];

export function generateStaticParams() {
  return days.map((d) => ({ n: String(d.n) }));
}

export default async function DanPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const num = Number(n);
  const day = days.find((d) => d.n === num);
  if (!day || !Number.isInteger(num)) notFound();

  const d = day as Day;
  const trening = d.trening ? treningZaDan(d.n) : null;

  return (
    <>
      <DayHeader n={d.n} dan={d.dan} datum={d.datum} trening={d.trening} />

      <main className="mx-auto max-w-md px-4 pb-6 pt-4">
        <div className="flex flex-col gap-3.5">
          {d.n === 30 && <FinishedBanner />}

          {/* Gramaže su sirovo — vidljivo, ne fusnota. */}
          <div
            className="flex items-center gap-2 el rounded-xl border px-3 py-2 text-sm font-bold"
            style={{
              background: "var(--panel-2)",
              borderColor: "var(--line-2)",
              color: "var(--ink)",
            }}
          >
            <ScaleIcon />
            Sve gramaže su sirovo — izmjereno prije pripreme.
          </div>

          {/* Traka napomene — vaganje, slike forme. Ne smije se propustiti. */}
          {d.napomene.length > 0 && (
            <div
              className="flex flex-col gap-2 el rounded-xl border p-3"
              style={{
                background: "var(--flag-soft)",
                borderColor: "var(--flag)",
              }}
            >
              {d.napomene.map((nap, i) => (
                <p
                  key={i}
                  className="flex gap-2 text-sm font-semibold leading-snug"
                  style={{ color: "var(--flag)" }}
                >
                  <BellIcon />
                  <span>{nap}</span>
                </p>
              ))}
            </div>
          )}

          {/* Trening — otvara zaseban ekran s vježbama i čekiranjem. */}
          {d.trening && (
            <Link
              href={`/dan/${d.n}/trening`}
              className="el flex items-center gap-3 rounded-xl p-4"
              style={{ background: "var(--train)", color: "#fff" }}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(255,255,255,0.16)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className="text-base font-bold leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {trening ? trening.naslov : "Trening"}
                </div>
                <div className="text-sm font-semibold opacity-90">
                  {trening
                    ? `${trening.vjezbe.length} vježbi · otvori i čekiraj`
                    : "Plan stiže od trenera"}
                </div>
              </div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          )}

          {d.obroci.map((meal, i) => (
            <MealCard key={i} meal={meal} dayN={d.n} mealIdx={i} />
          ))}

          <WaterTracker dayN={d.n} />
        </div>
      </main>
    </>
  );
}

function ScaleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M12 3v18M5 7h14" />
      <path d="M5 7l-2.5 6a3 3 0 005 0L5 7zM19 7l-2.5 6a3 3 0 005 0L19 7z" />
      <path d="M8 21h8" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0"
      aria-hidden="true"
    >
      <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  );
}
