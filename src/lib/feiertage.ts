import { plusTage } from './kalender';

/** Gesetzliche Feiertage in Hamburg (Feiertagsgesetz Hamburg), berechnet – keine Pflege nötig. */
export interface Feiertag {
  datum: string;
  name: string;
}

/** Ostersonntag nach der Gaußschen Osterformel (gregorianischer Kalender). */
export function ostersonntag(jahr: number): string {
  const a = jahr % 19;
  const b = Math.floor(jahr / 100);
  const c = jahr % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const monat = Math.floor((h + l - 7 * m + 114) / 31);
  const tag = ((h + l - 7 * m + 114) % 31) + 1;
  return `${jahr}-${String(monat).padStart(2, '0')}-${String(tag).padStart(2, '0')}`;
}

export function feiertageHamburg(jahr: number): Feiertag[] {
  const ostern = ostersonntag(jahr);
  const liste: Feiertag[] = [
    { datum: `${jahr}-01-01`, name: 'Neujahr' },
    { datum: plusTage(ostern, -2), name: 'Karfreitag' },
    { datum: plusTage(ostern, 1), name: 'Ostermontag' },
    { datum: `${jahr}-05-01`, name: 'Tag der Arbeit' },
    { datum: plusTage(ostern, 39), name: 'Christi Himmelfahrt' },
    { datum: plusTage(ostern, 50), name: 'Pfingstmontag' },
    { datum: `${jahr}-10-03`, name: 'Tag der Deutschen Einheit' },
    { datum: `${jahr}-12-25`, name: '1. Weihnachtstag' },
    { datum: `${jahr}-12-26`, name: '2. Weihnachtstag' },
  ];
  // Reformationstag ist in Hamburg seit 2018 gesetzlicher Feiertag
  if (jahr >= 2018) liste.push({ datum: `${jahr}-10-31`, name: 'Reformationstag' });
  return liste.sort((x, y) => x.datum.localeCompare(y.datum));
}

/** Alle Feiertage zwischen zwei Daten (einschließlich). */
export function feiertageZwischen(von: string, bis: string): Feiertag[] {
  const jahre: number[] = [];
  for (let j = Number(von.slice(0, 4)); j <= Number(bis.slice(0, 4)); j++) jahre.push(j);
  return jahre.flatMap(feiertageHamburg).filter((f) => f.datum >= von && f.datum <= bis);
}
