// Iz teksta friteze izvuci temperaturu i minute.
// Primjeri: "190 °C · 20–24 min", "140 °C, 15–16 min", "Ako uzmeš ribu: 180 °C, 12–15 min".
// Neki unosi nemaju vrijeme (riža, tuna) → vrati null za minute (nema tajmera).

export interface ParsedFryer {
  temp: number | null; // °C
  minMinutes: number | null; // donja granica
  maxMinutes: number | null; // gornja granica
  timerMinutes: number | null; // minute za tajmer (donja granica — provjeri rano)
  rangeLabel: string | null; // npr. "20–24 min"
}

export function parseFryer(tekst: string): ParsedFryer {
  // Temperatura: prvi broj ispred °C.
  const tempMatch = tekst.match(/(\d{2,3})\s*°C/);
  const temp = tempMatch ? Number(tempMatch[1]) : null;

  // Vrijeme: broj ili raspon prije "min". Podrži crtice – — - .
  const timeMatch = tekst.match(/(\d+)\s*(?:[–—-]\s*(\d+))?\s*min/);
  let minMinutes: number | null = null;
  let maxMinutes: number | null = null;
  let rangeLabel: string | null = null;

  if (timeMatch) {
    minMinutes = Number(timeMatch[1]);
    maxMinutes = timeMatch[2] ? Number(timeMatch[2]) : minMinutes;
    rangeLabel = timeMatch[2]
      ? `${minMinutes}–${maxMinutes} min`
      : `${minMinutes} min`;
  }

  return {
    temp,
    minMinutes,
    maxMinutes,
    // Tajmer na donju granicu — provjeri rano, plan više puta upozorava „radije kraće".
    timerMinutes: minMinutes,
    rangeLabel,
  };
}
