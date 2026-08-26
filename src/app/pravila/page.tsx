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
    <main
      className="mx-auto max-w-md px-4 pb-6"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 2.25rem)" }}
    >
      <h1
        className="mb-4 text-2xl font-extrabold"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Pravila i zamjene
      </h1>

      <Section title="Osnovna pravila">
        <ul className="flex flex-col gap-2.5">
          {OSNOVNA.map((t, i) => (
            <Bullet key={i} text={t} />
          ))}
        </ul>
      </Section>

      <Section title="Zamjene">
        <ul className="flex flex-col gap-2.5">
          {ZAMJENE.map((t, i) => (
            <Bullet key={i} text={t} />
          ))}
        </ul>
      </Section>

      <Section title="Od oktobra">
        <div
          className="rounded-xl border p-3 text-sm leading-relaxed"
          style={{
            background: "var(--rest-soft)",
            borderColor: "var(--rest)",
            color: "var(--ink)",
          }}
        >
          Plivanje 2× sedmično + 1 trening. Raspored se tada mijenja. Trening
          plan se ubacuje u ovaj raspored čim ga trener pošalje.
        </div>
      </Section>
    </main>
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
      <h2
        className="mb-2.5 text-sm font-bold uppercase tracking-wide"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink-2)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <li
      className="flex gap-2.5 rounded-xl border p-3 text-[15px] leading-relaxed"
      style={{
        background: "var(--panel)",
        borderColor: "var(--line)",
        color: "var(--ink-2)",
      }}
    >
      <span
        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: "var(--train)" }}
        aria-hidden="true"
      />
      <span>{text}</span>
    </li>
  );
}
