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

export interface FryerRow {
  kat: string;
  namirnica: string;
  g: string;
  temp: number;
  vrijeme: string;
  program: string;
  napomena: string;
}
