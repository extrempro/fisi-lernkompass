import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Meldung } from './types';

/** Schulferien aus content/ferien-hamburg.json – gepflegt wie andere Inhalte, ohne Code-Änderung. */
export interface Ferienzeit {
  name: string;
  von: string;
  bis: string;
}

export interface Ferien {
  land: string;
  quelle: string;
  stand: string;
  hinweis: string;
  ferien: Ferienzeit[];
}

export const FERIEN_DATEI = 'ferien-hamburg.json';
const LEER: Ferien = { land: '', quelle: '', stand: '', hinweis: '', ferien: [] };

function istDatum(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function ladeFerien(dir: string, meldungen: Meldung[]): Ferien {
  const pfad = join(dir, FERIEN_DATEI);
  if (!existsSync(pfad)) {
    meldungen.push({ level: 'warnung', datei: FERIEN_DATEI, text: 'Datei fehlt – im Ausbildungsplan werden keine Schulferien angezeigt' });
    return LEER;
  }
  let roh: unknown;
  try {
    roh = JSON.parse(readFileSync(pfad, 'utf8'));
  } catch (e) {
    meldungen.push({ level: 'fehler', datei: FERIEN_DATEI, text: `Ungültiges JSON: ${(e as Error).message}` });
    return LEER;
  }
  const r = (typeof roh === 'object' && roh !== null ? roh : {}) as Record<string, unknown>;
  const text = (k: string) => (typeof r[k] === 'string' ? (r[k] as string) : '');
  const ferien: Ferienzeit[] = [];
  const liste = Array.isArray(r.ferien) ? r.ferien : [];
  if (!Array.isArray(r.ferien)) meldungen.push({ level: 'fehler', datei: FERIEN_DATEI, text: '"ferien" muss eine Liste sein' });
  liste.forEach((x: unknown, i) => {
    const f = (typeof x === 'object' && x !== null ? x : {}) as Record<string, unknown>;
    const wo = `Eintrag ${i + 1}`;
    if (typeof f.name !== 'string' || !f.name.trim()) {
      meldungen.push({ level: 'fehler', datei: FERIEN_DATEI, text: `${wo}: "name" fehlt` });
      return;
    }
    if (!istDatum(f.von) || !istDatum(f.bis)) {
      meldungen.push({ level: 'fehler', datei: FERIEN_DATEI, text: `${wo} (${f.name}): "von" und "bis" müssen Daten JJJJ-MM-TT sein` });
      return;
    }
    if (f.bis < f.von) {
      meldungen.push({ level: 'fehler', datei: FERIEN_DATEI, text: `${wo} (${f.name}): "bis" liegt vor "von"` });
      return;
    }
    ferien.push({ name: f.name.trim(), von: f.von, bis: f.bis });
  });
  ferien.sort((a, b) => a.von.localeCompare(b.von));
  for (let i = 1; i < ferien.length; i++) {
    if (ferien[i].von <= ferien[i - 1].bis) {
      meldungen.push({ level: 'warnung', datei: FERIEN_DATEI, text: `${ferien[i - 1].name} und ${ferien[i].name} überschneiden sich (${ferien[i].von})` });
    }
  }
  return { land: text('land'), quelle: text('quelle'), stand: text('stand'), hinweis: text('hinweis'), ferien };
}
