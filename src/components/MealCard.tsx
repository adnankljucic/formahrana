import type { Meal } from "@/lib/types";
import { K } from "@/lib/storage";
import Checkbox from "./Checkbox";
import FryerBlock from "./FryerBlock";

// Istakni gramaže/količine unutar teksta stavke.
function highlight(text: string, keyBase: string) {
  const parts = text.split(/(\d+(?:[.,]\d+)?\s?(?:g|kg|ml|L|kom)\b)/gi);
  return parts.map((part, i) => {
    if (/^\d+(?:[.,]\d+)?\s?(?:g|kg|ml|L|kom)\b$/i.test(part)) {
      return (
        <strong
          key={`${keyBase}-${i}`}
          className="tabnum font-bold"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}
        >
          {part}
        </strong>
      );
    }
    return <span key={`${keyBase}-${i}`}>{part}</span>;
  });
}

export default function MealCard({
  meal,
  dayN,
  mealIdx,
}: {
  meal: Meal;
  dayN: number;
  mealIdx: number;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: "var(--panel)", borderColor: "var(--line)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className="text-base font-bold leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
        >
          {meal.naslov}
        </h3>
        <Checkbox
          storageKey={K.meal(dayN, mealIdx)}
          label={`Pojedeno: ${meal.naslov}`}
        />
      </div>

      <ul className="mt-2 flex flex-col gap-1.5">
        {meal.stavke.map((stavka, i) => (
          <li
            key={i}
            className="flex gap-2 text-[15px] leading-snug"
            style={{ color: "var(--ink-2)" }}
          >
            <span
              className="mt-2 h-1 w-1 shrink-0 rounded-full"
              style={{ background: "var(--ink-3)" }}
              aria-hidden="true"
            />
            <span>{highlight(stavka, `m${mealIdx}-${i}`)}</span>
          </li>
        ))}
      </ul>

      {meal.friteza.length > 0 && (
        <FryerBlock friteza={meal.friteza} mealLabel={meal.naslov} />
      )}
    </div>
  );
}
