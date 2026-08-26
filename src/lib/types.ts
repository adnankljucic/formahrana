export interface FryerStep {
  kosara: string;
  tekst: string;
}

export interface Meal {
  naslov: string;
  stavke: string[];
  friteza: FryerStep[];
}

export interface Day {
  n: number;
  date: string; // ISO yyyy-mm-dd
  dan: string;
  datum: string; // dd.mm.yyyy.
  trening: boolean;
  obroci: Meal[];
  napomene: string[];
}

export interface Vjezba {
  naziv: string;
  serije?: string; // npr. "4"
  ponavljanja?: string; // npr. "8–12" ili "30 sek"
  napomena?: string;
  youtube?: string; // YouTube URL
}

export interface TreningPlan {
  naslov: string; // npr. "Gornji dio tijela"
  fokus?: string; // npr. "Grudi, ramena, triceps"
  vjezbe: Vjezba[];
}

export interface TreningData {
  opce_napomene?: string[];
  dani: Record<string, TreningPlan>; // ključ = broj dana plana ("2","5",...)
}

export interface FryerRow {
  kat: string;
  namirnica: string;
  g: string;
  temp: number;
  vrijeme: string;
  program: string;
  napomena: string;
}
