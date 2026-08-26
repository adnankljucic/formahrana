import fryer from "@/data/fryer.json";
import type { FryerRow } from "@/lib/types";
import TopBar from "@/components/TopBar";

const rows = fryer as FryerRow[];
const KATEGORIJE = ["Meso i riba", "Prilozi", "Povrće", "Jaja"] as const;

export default function FritezaPage() {
  return (
    <>
      <TopBar section="Friteza" />

      <main className="mx-auto max-w-md px-4 pb-6 pt-4">
        <p className="mb-4 text-sm" style={{ color: "var(--ink-2)" }}>
          Tesla AF900BSD · 2400 W · dvije nezavisne košare 4,5 L + 4,5 L · 40–200 °C
          · Smart SYNC. Vremena su polazna tačka.
        </p>

        {/* Sigurnosne temperature u sredini komada. */}
        <div className="mb-5 flex gap-3" style={{ background: "var(--panel)", padding: 16 }}>
          <span className="w-1 shrink-0 self-stretch" style={{ background: "var(--heat)" }} />
          <div className="min-w-0 flex-1">
            <div className="mb-2 text-sm" style={{ color: "var(--heat)" }}>
              Temperatura u sredini komada
            </div>
            <ul className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--ink)" }}>
              <li className="flex justify-between gap-3">
                <span>Piletina i puretina</span>
                <span className="tabnum" style={{ fontFamily: "var(--font-mono)" }}>74 °C</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Junetina i teletina (po želji, medium)</span>
                <span className="tabnum" style={{ fontFamily: "var(--font-mono)" }}>~57 °C</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Riba</span>
                <span className="tabnum" style={{ fontFamily: "var(--font-mono)" }}>63 °C</span>
              </li>
            </ul>
            <p className="mt-2 text-xs" style={{ color: "var(--ink-2)" }}>
              Preporuka: ubodni termometar. Zagrij fritezu 3–5 min, ne puni košaru
              preko 2/3, protresi prilog i povrće bar jednom na pola.
            </p>
          </div>
        </div>

        {KATEGORIJE.map((kat) => {
          const catRows = rows.filter((r) => r.kat === kat);
          if (catRows.length === 0) return null;
          return (
            <section key={kat} className="mb-5">
              <div className="mb-1 text-sm" style={{ color: "var(--ink-2)", letterSpacing: "0.16px" }}>
                {kat}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--line)" }}>
                {catRows.map((r, i) => (
                  <FryerCard key={i} row={r} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}

function FryerCard({ row }: { row: FryerRow }) {
  const nePece = row.temp === 0;
  return (
    <div style={{ background: "var(--panel)", padding: 12 }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm" style={{ color: "var(--ink)" }}>
            {row.namirnica}
          </h3>
          {row.g !== "—" && (
            <span
              className="tabnum text-xs"
              style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}
            >
              {row.g}
            </span>
          )}
        </div>
        {!nePece && (
          <span
            className="inline-flex shrink-0 items-center px-2 py-0.5 text-xs"
            style={{ background: "var(--heat-soft)", color: "var(--heat)" }}
          >
            {row.program}
          </span>
        )}
      </div>

      {!nePece ? (
        <div className="mt-2 flex gap-4">
          <div>
            <div className="text-[10px]" style={{ letterSpacing: "0.32px", color: "var(--ink-3)" }}>
              Temp
            </div>
            <div className="tabnum text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--heat)" }}>
              {row.temp} °C
            </div>
          </div>
          <div>
            <div className="text-[10px]" style={{ letterSpacing: "0.32px", color: "var(--ink-3)" }}>
              Vrijeme
            </div>
            <div className="tabnum text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}>
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
