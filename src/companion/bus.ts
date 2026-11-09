/**
 * Kleiner Ereignisbus für den Companion („Hoodie“).
 * Seiten melden nur, was passiert ist – ob und was der Hoodie dazu sagt, entscheidet src/companion/logik.ts.
 */

export type Ereignis =
  | 'start'
  | 'richtig'
  | 'falsch'
  | 'runde'
  | 'simulation'
  | 'ampel-gruen'
  | 'ampel-gelb'
  | 'ampel-rot'
  | 'zusatz'
  | 'bericht'
  | 'abgezeichnet'
  | 'pause'
  | 'klick';

export interface Meldung {
  art: Ereignis;
  /** Anteil richtiger Antworten 0–1 (bei 'runde' und 'simulation') */
  quote?: number;
}

type Hoerer = (m: Meldung) => void;
const hoerer = new Set<Hoerer>();

export function melde(art: Ereignis, extra: Omit<Meldung, 'art'> = {}): void {
  for (const h of hoerer) h({ art, ...extra });
}

export function hoere(h: Hoerer): () => void {
  hoerer.add(h);
  return () => {
    hoerer.delete(h);
  };
}

// ---------- Stumm (z. B. während der Prüfungssimulation) ----------

const gruende = new Set<string>();
const stummHoerer = new Set<() => void>();

/** Schaltet den Hoodie stumm und unsichtbar, bis die zurückgegebene Funktion aufgerufen wird. */
export function stummSchalten(grund: string): () => void {
  gruende.add(grund);
  stummHoerer.forEach((f) => f());
  return () => {
    gruende.delete(grund);
    stummHoerer.forEach((f) => f());
  };
}

export function istStumm(): boolean {
  return gruende.size > 0;
}

export function hoereStumm(f: () => void): () => void {
  stummHoerer.add(f);
  return () => {
    stummHoerer.delete(f);
  };
}
