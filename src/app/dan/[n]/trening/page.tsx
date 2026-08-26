import Link from "next/link";
import { notFound } from "next/navigation";
import plan from "@/data/plan.json";
import type { Day } from "@/lib/types";
import { treningZaDan } from "@/lib/trening";
import TreningChecklist from "@/components/TreningChecklist";

const days = plan as Day[];

export function generateStaticParams() {
  return days.filter((d) => d.trening).map((d) => ({ n: String(d.n) }));
}

export default async function TreningPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const num = Number(n);
  const day = days.find((d) => d.n === num);
  if (!day) notFound();

  const d = day as Day;
  const trening = treningZaDan(d.n);

  return (
    <>
      <header
        className="sticky top-0 z-30 border-b px-4 pb-3"
        style={{
          background: "var(--bg)",
          borderColor: "var(--line)",
          paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)",
        }}
      >
        <div className="mx-auto flex max-w-md items-center gap-2">
          <Link
            href={`/dan/${d.n}`}
            aria-label="Nazad na dan"
            className="tap flex items-center justify-center rounded-lg border"
            style={{ borderColor: "var(--line)", color: "var(--ink)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <div
              className="truncate text-lg font-extrabold leading-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
            >
              Trening · Dan {d.n}
            </div>
            <div
              className="tabnum text-xs font-semibold"
              style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}
            >
              {day.dan}, {d.datum.slice(0, 6)}
            </div>
          </div>
          <span className="tap" aria-hidden="true" />
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-6 pt-4">
        {trening ? (
          <div className="flex flex-col gap-3">
            <div
              className="overflow-hidden rounded-2xl"
              style={{ background: "var(--train)" }}
            >
              <div className="p-4" style={{ color: "#fff" }}>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-80">
                  Fokus
                </div>
                <h1
                  className="mt-1 text-2xl font-bold leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {trening.naslov}
                </h1>
                {trening.fokus && (
                  <p className="mt-1 text-sm font-semibold opacity-90">
                    {trening.fokus}
                  </p>
                )}
              </div>
            </div>

            <TreningChecklist dayN={d.n} plan={trening} />
          </div>
        ) : (
          <EmptyTrening />
        )}
      </main>
    </>
  );
}

function EmptyTrening() {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl border p-8 text-center"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "var(--train-soft)", color: "var(--train)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />
        </svg>
      </span>
      <div
        className="text-lg font-bold"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Trening plan stiže
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
        Čim trener pošalje vježbe za ovaj dan, pojavit će se ovdje s
        čekiranjem svake vježbe.
      </p>
    </div>
  );
}
