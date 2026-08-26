import fryer from "@/data/fryer.json";
import type { FryerRow } from "@/lib/types";

const rows = fryer as FryerRow[];
const KATEGORIJE = ["Meso i riba", "Prilozi", "Povrće", "Jaja"] as const;

export default function FritezaPage() {
  return (
    <main
      className="mx-auto max-w-md px-4 pb-6"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 2.25rem)" }}
    >
      <h1
        className="mb-1 text-2xl font-extrabold"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Friteza — postavke
      </h1>
      <p className="mb-3 text-sm" style={{ color: "var(--ink-3)" }}>
        Tesla AF900BSD · 2400 W · dvije nezavisne košare 4,5 L + 4,5 L · 40–200 °C
        · Smart SYNC. Vremena su polazna tačka.
      </p>

      {/* Sigurnosne temperature u sredini komada. */}
      <div
        className="mb-4 rounded-xl border p-3"
        style={{ background: "var(--panel)", borderColor: "var(--heat)" }}
      >
        <h2
          className="mb-2 text-sm font-bold uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display)", color: "var(--heat)" }}
        >
          Temperatura u sredini komada
        </h2>
        <ul className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--ink)" }}>
          <li className="flex justify-between gap-3">
            <span>Piletina i puretina</span>
            <strong className="tabnum" style={{ fontFamily: "var(--font-mono)" }}>
              74 °C
            </strong>
          </li>
          <li className="flex justify-between gap-3">
            <span>Junetina i teletina (po želji, medium)</span>
            <strong className="tabnum" style={{ fontFamily: "var(--font-mono)" }}>
              ~57 °C
            </strong>
          </li>
          <li className="flex justify-between gap-3">
            <span>Riba</span>
            <strong className="tabnum" style={{ fontFamily: "var(--font-mono)" }}>
              63 °C
            </strong>
          </li>
        </ul>
        <p className="mt-2 text-xs" style={{ color: "var(--ink-2)" }}>
          Preporuka: ubodni termometar. Zagrij fritezu 3–5 min, ne puni košaru
          preko 2/3, protresi prilog i povrće bar jednom na pola.
        </p>
      </div>

      {KATEGORIJE.map((kat) => {
        const catRows = rows.filter((r) => r.kat === kat);
        if (catRows.length === 0) return null;
        return (
          <section key={kat} className="mb-5">
            <h2
              className="mb-2 text-sm font-bold uppercase tracking-wide"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink-2)" }}
            >
              {kat}
            </h2>
            <div className="flex flex-col gap-2">
              {catRows.map((r, i) => (
                <FryerCard key={i} row={r} />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}

function FryerCard({ row }: { row: FryerRow }) {
  const nePece = row.temp === 0;
  return (
    <div
      className="rounded-xl border p-3"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className="text-[15px] font-bold leading-tight"
            style={{ color: "var(--ink)" }}
          >
            {row.namirnica}
          </h3>
          {row.g !== "—" && (
            <span
              className="tabnum text-xs font-semibold"
              style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}
            >
              {row.g}
            </span>
          )}
        </div>
        {!nePece && (
          <span
            className="inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-bold"
            style={{ background: "var(--panel-2)", color: "var(--heat)" }}
          >
            {row.program}
          </span>
        )}
      </div>

      {!nePece ? (
        <div className="mt-2 flex gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>
              Temp
            </div>
            <div className="tabnum text-base font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--heat)" }}>
              {row.temp} °C
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--ink-3)" }}>
              Vrijeme
            </div>
            <div className="tabnum text-base font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}>
              {row.vrijeme}
            </div>
          </div>
        </div>
      ) : null}

      <p className="mt-2 text-sm leading-snug" style={{ color: "var(--ink-2)" }}>
        {row.napomena}
      </p>
    </div>
  );
}
