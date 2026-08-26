import TopBar from "@/components/TopBar";

const OSNOVNA = [
  "Ujutru čim ustaneš popij minimalno čašu vode.",
  "Hranu vagaj sirovu, prije kuhanja i pečenja.",
  "Priprema: friteza na vrući zrak, sprej za ulje bez kalorija, ili tava bez ulja uz dodavanje vode. Nikako na ulju.",
  "Zobene i proteinske palačinke uvijek s vodom, nikako s mlijekom. Whey uvijek s vodom.",
  "Minimalno 3 L vode dnevno. Dozvoljeno: Cola Zero, crni nes ili crna kava s Natrenom, čaj bez šećera.",
  "Začini normalno: so, biber, vegeta, crvena paprika, origano, kurkuma, sirće, malo senfa.",
  "Povrće neograničeno i bilo kad: brokula, špinat, zelena salata, gljive, tikvice, krastavac, blitva, prokulice, rukola, luk, bijeli luk.",
  "Redoslijed obroka nije strog — prvi i zadnji možeš zamijeniti, a dva obroka spojiti u jedan kad si u žurbi.",
  "Ne preskakati obroke, ne oduzimati ni dodavati ništa.",
  "Suplementi: whey + kreatin monohidrat 5 g dnevno. Po želji vitamin C, omega 3, cink.",
  "Na trening dane, odmah poslije treninga: 1 mjerica wheya s vodom + 1 banana.",
];

const ZAMJENE = [
  "Proteinske palačinke kao zamjena za prvi obrok: 50 g sitnih zobenih, 2 bjelanjka, 30 g wheya, pola praška za pecivo, 6 smrvljenih Natrena, prstohvat soli, malo vode. Peći na tavi na spreju za ulje — poklopljeno 2–3 min, pa 30-ak sekundi na drugu stranu, da ostanu sočne. Odozgo 50 g bobičastog voća i 30 g kikiriki maslaca.",
  "Meso: pileći fileti ili prsa, puretina, riba, tuna u konzervi (procijedi ulje), juneća šnicla, juneći but, teleće šnicle.",
  "Ako namirnica u danu ne odgovara, zamijeni je ekvivalentom iz iste grupe — meso za meso, riža za krompir po gramaži iz plana. Količine ostaju iste.",
];

export default function PravilaPage() {
  return (
    <>
      <TopBar section="Pravila" />

      <main className="mx-auto max-w-md px-4 pb-6 pt-4">
        <Section title="Osnovna pravila">
          {OSNOVNA.map((t, i) => (
            <Bullet key={i} text={t} />
          ))}
        </Section>

        <Section title="Zamjene">
          {ZAMJENE.map((t, i) => (
            <Bullet key={i} text={t} />
          ))}
        </Section>

        <Section title="Od oktobra">
          <div className="flex gap-3" style={{ background: "var(--panel)", padding: 16 }}>
            <span className="w-1 shrink-0 self-stretch" style={{ background: "var(--ink)" }} />
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
              Plivanje 2× sedmično + 1 trening. Raspored se tada mijenja. Trening
              plan se ubacuje u ovaj raspored čim ga trener pošalje.
            </p>
          </div>
        </Section>
      </main>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-1 text-sm" style={{ color: "var(--ink-2)", letterSpacing: "0.16px" }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--line)" }}>
        {children}
      </div>
    </section>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <div
      className="flex gap-2.5 text-sm leading-relaxed"
      style={{ background: "var(--panel)", padding: 12, color: "var(--ink-2)" }}
    >
      <span
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: "var(--train)" }}
        aria-hidden="true"
      />
      <span>{text}</span>
    </div>
  );
}
