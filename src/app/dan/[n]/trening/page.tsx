import Link from "next/link";
import { notFound } from "next/navigation";
import plan from "@/data/plan.json";
import type { Day } from "@/lib/types";
import { treningZaDan, opceNapomeneTreninga } from "@/lib/trening";
import TreningChecklist from "@/components/TreningChecklist";
import TreningNapomene from "@/components/TreningNapomene";

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
      <div className="sticky top-0 z-30" style={{ background: "var(--bg)" }}>
        <header
          className="mx-auto flex max-w-md items-center gap-2 border-b px-2"
          style={{
            height: 48,
            background: "var(--panel)",
            borderColor: "var(--line)",
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          <Link
            href={`/dan/${d.n}`}
            aria-label="Nazad na dan"
            className="tap flex shrink-0 items-center justify-center"
            style={{ color: "var(--ink)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1 text-center text-sm" style={{ letterSpacing: "0.16px" }}>
            <span className="font-semibold" style={{ color: "var(--ink)" }}>
              Trening · Dan {d.n}
            </span>
            <span style={{ color: "var(--ink-2)" }}>
              {" "}
              · {day.dan}, {d.datum.slice(0, 6)}
            </span>
          </div>
          <span className="tap shrink-0" aria-hidden="true" />
        </header>
      </div>

      <main className="mx-auto flex max-w-md flex-col" style={{ gap: 1, background: "var(--line)" }}>
        {trening ? (
          <>
            <div style={{ background: "var(--train)", color: "#fff", padding: 16 }}>
              <div className="text-xs opacity-80" style={{ letterSpacing: "0.32px" }}>
                Fokus
              </div>
              <h1 className="mt-1 text-xl leading-tight">{trening.naslov}</h1>
              {trening.fokus && (
                <p className="mt-1 text-sm opacity-90">{trening.fokus}</p>
              )}
            </div>

            <TreningChecklist dayN={d.n} plan={trening} />

            <TreningNapomene napomene={opceNapomeneTreninga()} />
          </>
        ) : (
          <div style={{ background: "var(--panel)" }}>
            <EmptyTrening />
          </div>
        )}
      </main>
    </>
  );
}

function EmptyTrening() {
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: "var(--train-soft)", color: "var(--train)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />
        </svg>
      </span>
      <div className="text-base" style={{ color: "var(--ink)" }}>
        Trening plan stiže
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
        Čim trener pošalje vježbe za ovaj dan, pojavit će se ovdje s
        čekiranjem svake vježbe.
      </p>
    </div>
  );
}
