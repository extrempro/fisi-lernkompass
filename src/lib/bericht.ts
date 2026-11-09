import type { Abwesenheit, AbwesenheitGrund, Bericht, BerichtInhalt, BerichtStatus, Einstellungen, PlanEintrag, Themenfeld } from '../types';
import type { Feiertag } from './feiertage';
import { plusTage } from './kalender';

export const GRUND: Record<AbwesenheitGrund, string> = {
  urlaub: 'Urlaub',
  krank: 'Krank',
  feiertag: 'Feiertag',
  sonstiges: 'Sonstiges',
};

export const STATUS_TEXT: Record<BerichtStatus | 'fehlt', string> = {
  fehlt: 'Fehlt',
  entwurf: 'Entwurf',
  fertig: 'Fertig',
  abgezeichnet: 'Abgezeichnet',
};

export function leererInhalt(): BerichtInhalt {
  return { betrieb: [], unterweisung: [], schule: [], abwesenheit: [] };
}

export function sollStunden(e: Einstellungen | undefined): number {
  const n = Number(e?.wochenstunden);
  return n >= 1 && n <= 60 ? n : 40;
}

export interface Summe {
  betrieb: number;
  unterweisung: number;
  schule: number;
  abwesenheit: number;
  gesamt: number;
}

export function summe(i: BerichtInhalt): Summe {
  const s = (l: { stunden: number }[]) => l.reduce((n, x) => n + (Number(x.stunden) || 0), 0);
  const r = { betrieb: s(i.betrieb), unterweisung: s(i.unterweisung), schule: s(i.schule), abwesenheit: s(i.abwesenheit) };
  return { ...r, gesamt: r.betrieb + r.unterweisung + r.schule + r.abwesenheit };
}

/** Stunden schön: 7,5 statt 7.5 */
export function h(n: number): string {
  return String(Math.round(n * 100) / 100).replace('.', ',');
}

/**
 * Startwerte für einen neuen Bericht: Feiertage an Werktagen als Abwesenheit,
 * in Schulwochen der Schulblock als Berufsschule.
 */
export function vorbelegen(montag: string, plan: PlanEintrag[], feiertage: Feiertag[], soll: number): BerichtInhalt {
  const inhalt = leererInhalt();
  const tagSoll = Math.round((soll / 5) * 4) / 4;
  const werktage = [0, 1, 2, 3, 4].map((i) => plusTage(montag, i));
  inhalt.abwesenheit = feiertage
    .filter((f) => werktage.includes(f.datum))
    .map((f): Abwesenheit => ({ tag: f.datum, grund: 'feiertag', stunden: tagSoll, text: f.name }));
  const schule = plan.filter((e) => e.art === 'schule' && e.von <= montag && e.bis >= montag);
  if (schule.length) {
    const rest = Math.max(0, soll - inhalt.abwesenheit.length * tagSoll);
    inhalt.schule = schule.map((e, i) => ({ text: e.titel, stunden: i === 0 ? rest : 0 }));
  }
  return inhalt;
}

/** Stichworte, die zur Woche passen: Themen-Einträge, Aufgaben und Unterthemen, deren Ampel sich in der Woche geändert hat. */
export function vorschlaege(montag: string, plan: PlanEintrag[], felder: Themenfeld[]): string[] {
  const sonntag = plusTage(montag, 6);
  const feld = new Map(felder.map((f) => [f.id, f]));
  const liste: string[] = [];
  for (const e of plan) {
    if (e.von > montag || e.bis < montag) continue;
    if (e.art === 'thema') {
      const t = feld.get(e.themenfeld)?.titel ?? '';
      liste.push(e.titel ? `${e.titel} (${t})` : t);
    }
    if (e.art === 'aufgabe') liste.push(e.titel);
  }
  for (const f of felder) {
    for (const u of f.unterthemen) {
      if (u.status !== 'rot' && u.geaendert && u.geaendert >= montag && u.geaendert <= sonntag) liste.push(u.titel);
    }
  }
  return [...new Set(liste.filter(Boolean))].slice(0, 8);
}

export function berichtStatus(b: Bericht | undefined): BerichtStatus | 'fehlt' {
  return b ? b.status : 'fehlt';
}
