import type { Status, Themenfeld, Unterthema } from '../types';

export interface Zaehlung {
  g: number;
  y: number;
  r: number;
  n: number;
}

export const AMPEL: Record<Status, { label: string; kurz: string; farbe: string; rang: number }> = {
  rot: { label: 'Nicht angefangen', kurz: 'Offen', farbe: '#DC2626', rang: 0 },
  gelb: { label: 'In Arbeit', kurz: 'In Arbeit', farbe: '#F59E0B', rang: 1 },
  gruen: { label: 'Sicher', kurz: 'Sicher', farbe: '#16A34A', rang: 2 },
};

export const FAUSTREGEL: Record<Status, string> = {
  rot: '„Davon habe ich noch nie etwas gemacht.“',
  gelb: '„Ich kenne es, brauche aber das Cheatsheet.“',
  gruen: '„Ich kann es ohne Hilfe erklären und anwenden.“',
};

export function zaehle(unterthemen: Unterthema[]): Zaehlung {
  const z = { g: 0, y: 0, r: 0, n: unterthemen.length };
  for (const u of unterthemen) {
    if (u.status === 'gruen') z.g++;
    else if (u.status === 'gelb') z.y++;
    else z.r++;
  }
  return z;
}

export function summe(felder: Themenfeld[]): Zaehlung {
  return felder.reduce(
    (acc, f) => {
      const z = zaehle(f.unterthemen);
      return { g: acc.g + z.g, y: acc.y + z.y, r: acc.r + z.r, n: acc.n + z.n };
    },
    { g: 0, y: 0, r: 0, n: 0 },
  );
}

/** Grün ab 80 % grün und kein Rot; Rot, wenn alles rot; sonst Gelb. */
export function ampelVon(z: Zaehlung): Status {
  if (z.n === 0 || z.r === z.n) return 'rot';
  if (z.r === 0 && z.g / z.n >= 0.8) return 'gruen';
  return 'gelb';
}

/** Grün = 1 Punkt, Gelb = 0,5, Rot = 0. */
export function prozent(z: Zaehlung): number {
  return z.n ? Math.round(((z.g + 0.5 * z.y) / z.n) * 100) : 0;
}

export function anteil(x: number, n: number): string {
  return n ? `${((x / n) * 100).toFixed(2)}%` : '0%';
}

export const AUFFRISCHEN_TAGE = 60;

export function tageSeit(datum: string | null, heute = new Date()): number | null {
  if (!datum) return null;
  const d = new Date(`${datum}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const h = new Date(heute);
  h.setHours(0, 0, 0, 0);
  return Math.round((h.getTime() - d.getTime()) / 86400000);
}

export function mussAuffrischen(u: Unterthema): boolean {
  if (u.status === 'rot') return false;
  const t = tageSeit(u.geaendert);
  return t !== null && t > AUFFRISCHEN_TAGE;
}

export function zusammenfassung(z: Zaehlung): string {
  return `${z.g} sicher · ${z.y} in Arbeit · ${z.r} offen`;
}

export function balkenLabel(z: Zaehlung): string {
  return `${z.n} Unterthemen: ${z.g} sicher, ${z.y} in Arbeit, ${z.r} nicht angefangen`;
}
