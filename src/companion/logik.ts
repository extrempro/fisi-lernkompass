import type { Meldung } from './bus';
import { SAETZE } from './saetze';

/** Ausdruck der Augen (und Kopfhaltung): ruhig, freut sich, autsch, denkt nach, müde, zwinkert */
export type Pose = 'ruhe' | 'freut' | 'autsch' | 'denkt' | 'muede' | 'zwinkert';
export type Licht = 'neutral' | 'gruen' | 'gelb' | 'rot' | 'blau';
export type Haeufigkeit = 'selten' | 'normal' | 'gespraechig';

export type Anlass =
  | 'start'
  | 'start-nacht'
  | 'start-freitag'
  | 'richtig'
  | 'serie'
  | 'falsch'
  | 'falsch-serie'
  | 'runde-gut'
  | 'runde-mittel'
  | 'runde-schlecht'
  | 'sim-gut'
  | 'sim-knapp'
  | 'sim-schlecht'
  | 'ampel-gruen'
  | 'ampel-gelb'
  | 'ampel-rot'
  | 'zusatz'
  | 'bericht'
  | 'abgezeichnet'
  | 'pause'
  | 'klick';

/** Mindestabstand zwischen zwei Sprüchen bei gewöhnlichen Anlässen (ms) */
export const ABSTAND: Record<Haeufigkeit, number> = { selten: 300_000, normal: 90_000, gespraechig: 25_000 };

/** Ab dieser Serie richtiger Antworten gibt es einen Serien-Spruch */
export const SERIEN = [3, 5, 10, 15, 20, 30, 40, 50];

const AUSSEHEN: Record<Anlass, [Pose, Licht, boolean]> = {
  // [Pose, Licht, wichtig = spricht auch innerhalb des Mindestabstands]
  start: ['zwinkert', 'neutral', true],
  'start-nacht': ['muede', 'blau', true],
  'start-freitag': ['zwinkert', 'neutral', true],
  richtig: ['freut', 'gruen', false],
  serie: ['freut', 'gruen', true],
  falsch: ['autsch', 'rot', false],
  'falsch-serie': ['denkt', 'gelb', true],
  'runde-gut': ['freut', 'gruen', true],
  'runde-mittel': ['denkt', 'gelb', true],
  'runde-schlecht': ['autsch', 'rot', true],
  'sim-gut': ['freut', 'gruen', true],
  'sim-knapp': ['denkt', 'gelb', true],
  'sim-schlecht': ['autsch', 'rot', true],
  'ampel-gruen': ['freut', 'gruen', false],
  'ampel-gelb': ['denkt', 'gelb', false],
  'ampel-rot': ['denkt', 'rot', false],
  zusatz: ['freut', 'blau', false],
  bericht: ['freut', 'gruen', false],
  abgezeichnet: ['freut', 'gruen', true],
  pause: ['muede', 'blau', true],
  klick: ['zwinkert', 'neutral', true],
};

export interface Zustand {
  /** Zeitpunkt des letzten Spruchs (ms), 0 = noch keiner */
  zuletzt: number;
  serie: number;
  fehlerSerie: number;
  /** zuletzt gewählter Satz je Anlass – damit derselbe Spruch nicht zweimal hintereinander kommt */
  letzterSatz: Partial<Record<Anlass, number>>;
}

export interface Reaktion {
  anlass: Anlass;
  pose: Pose;
  licht: Licht;
  /** null = nur Blick und Licht, kein Spruch */
  text: string | null;
}

export const START_ZUSTAND: Zustand = { zuletzt: 0, serie: 0, fehlerSerie: 0, letzterSatz: {} };

function anlassFuer(m: Meldung, z: Zustand, jetzt: Date): [Anlass, Zustand, Record<string, string | number>] {
  const p = Math.round((m.quote ?? 0) * 100);
  switch (m.art) {
    case 'start': {
      const h = jetzt.getHours();
      const a: Anlass = h >= 22 || h < 5 ? 'start-nacht' : jetzt.getDay() === 5 ? 'start-freitag' : 'start';
      return [a, z, {}];
    }
    case 'richtig': {
      const serie = z.serie + 1;
      return [SERIEN.includes(serie) ? 'serie' : 'richtig', { ...z, serie, fehlerSerie: 0 }, { n: serie }];
    }
    case 'falsch': {
      const fehlerSerie = z.fehlerSerie + 1;
      return [fehlerSerie === 3 ? 'falsch-serie' : 'falsch', { ...z, serie: 0, fehlerSerie }, {}];
    }
    case 'runde':
      return [p >= 80 ? 'runde-gut' : p >= 50 ? 'runde-mittel' : 'runde-schlecht', z, { p }];
    case 'simulation':
      // 50 % ist die Bestehensgrenze, ab 81 % gibt es mindestens „gut“
      return [p >= 81 ? 'sim-gut' : p >= 50 ? 'sim-knapp' : 'sim-schlecht', z, { p }];
    default:
      return [m.art, z, {}];
  }
}

/**
 * Entscheidet, wie der Hoodie auf ein Ereignis reagiert. Rein funktional, damit testbar:
 * Zufall und Uhrzeit kommen von außen.
 */
export function reagiere(
  z: Zustand,
  m: Meldung,
  jetzt: Date,
  haeufigkeit: Haeufigkeit,
  name: string,
  zufall: () => number = Math.random,
): { zustand: Zustand; reaktion: Reaktion } {
  const [anlass, z2, werte] = anlassFuer(m, z, jetzt);
  const [pose, licht, wichtig] = AUSSEHEN[anlass];
  const ms = jetzt.getTime();
  const darf = wichtig || z2.zuletzt === 0 || ms - z2.zuletzt >= ABSTAND[haeufigkeit];
  if (!darf) return { zustand: z2, reaktion: { anlass, pose, licht, text: null } };

  const liste = SAETZE[anlass];
  const vorher = z2.letzterSatz[anlass];
  let i = Math.floor(zufall() * liste.length) % liste.length;
  if (liste.length > 1 && i === vorher) i = (i + 1) % liste.length;
  const text = fuelleSatz(liste[i], { ...werte, name: name || 'azubi' });
  return {
    zustand: { ...z2, zuletzt: ms, letzterSatz: { ...z2.letzterSatz, [anlass]: i } },
    reaktion: { anlass, pose, licht, text },
  };
}

function fuelleSatz(s: string, werte: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in werte ? String(werte[k]) : m));
}

/** Vorname aus dem Namen im Berichtsheft */
export function vorname(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

/** Wie lange die Sprechblase stehen bleibt (ms) */
export function anzeigeDauer(text: string): number {
  return Math.min(9000, 3000 + text.length * 70);
}
