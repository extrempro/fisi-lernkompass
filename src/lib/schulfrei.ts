import { createContext, useContext } from 'react';
import type { Ferienzeit } from '../types';
import type { Feiertag } from './feiertage';
import { plusTage } from './kalender';

/** Was in einer Kalenderwoche schulfrei ist: Ferien (Hamburg) und gesetzliche Feiertage. */
export interface FreieWoche {
  ferien: Ferienzeit[];
  feiertage: Feiertag[];
  /** Werktage (Mo–Fr) dieser Woche, die in Ferien liegen */
  ferienWerktage: number;
}

const LEER: FreieWoche = { ferien: [], feiertage: [], ferienWerktage: 0 };

export function freieWoche(montag: string, ferien: Ferienzeit[], feiertage: Feiertag[]): FreieWoche {
  const sonntag = plusTage(montag, 6);
  const f = ferien.filter((x) => x.von <= sonntag && x.bis >= montag);
  const t = feiertage.filter((x) => x.datum >= montag && x.datum <= sonntag);
  if (!f.length && !t.length) return LEER;
  let werktage = 0;
  for (let i = 0; i < 5; i++) {
    const tag = plusTage(montag, i);
    if (f.some((x) => x.von <= tag && x.bis >= tag)) werktage++;
  }
  return { ferien: f, feiertage: t, ferienWerktage: werktage };
}

/** Liefert für einen Montag die freien Tage – im Ausbildungsplan einmal oben bereitgestellt. */
export const FreiKontext = createContext<(montag: string) => FreieWoche>(() => LEER);
export const useFreieWoche = (montag: string) => useContext(FreiKontext)(montag);
