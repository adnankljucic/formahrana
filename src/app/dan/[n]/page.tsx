import { notFound } from "next/navigation";
import plan from "@/data/plan.json";
import type { Day } from "@/lib/types";
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

  return (
    <>
      <DayHeader n={d.n} dan={d.dan} datum={d.datum} trening={d.trening} />

      <main className="mx-auto max-w-md px-3 pb-4 pt-3">
        <div className="flex flex-col gap-3">
          {d.n === 30 && <FinishedBanner />}

          {/* Gramaže su sirovo — vidljivo, ne fusnota. */}
          <div
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold"
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
              className="flex flex-col gap-2 rounded-xl border p-3"
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
