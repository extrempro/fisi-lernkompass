import type { PlanEintrag } from '../types';

/** Rechnet mit reinen Kalenderdaten (JJJJ-MM-TT) in UTC, damit Sommerzeit nichts verschiebt. */
function d(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}
function iso(x: Date): string {
  return x.toISOString().slice(0, 10);
}

export function gueltigesDatum(s: string | null | undefined): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(d(s).getTime()) && iso(d(s)) === s;
}

export function plusTage(datum: string, n: number): string {
  const x = d(datum);
  x.setUTCDate(x.getUTCDate() + n);
  return iso(x);
}

/** Montag der Woche, in der das Datum liegt. */
export function montagVon(datum: string): string {
  const x = d(datum);
  return plusTage(datum, -((x.getUTCDay() + 6) % 7));
}

/** ISO-Kalenderwoche (KW 1 ist die Woche mit dem ersten Donnerstag des Jahres). */
export function kalenderwoche(datum: string): { kw: number; jahr: number } {
  const donnerstag = d(plusTage(montagVon(datum), 3));
  const jahr = donnerstag.getUTCFullYear();
  const kw = Math.floor((donnerstag.getTime() - Date.UTC(jahr, 0, 1)) / (7 * 86400000)) + 1;
  return { kw, jahr };
}

export function wochenAbstand(von: string, bis: string): number {
  return Math.round((d(bis).getTime() - d(von).getTime()) / (7 * 86400000));
}

export function plusJahre(datum: string, n: number): string {
  const x = d(datum);
  x.setUTCFullYear(x.getUTCFullYear() + n);
  return iso(x);
}

/** n Monate später; fällt der Tag weg (31.01. + 1 Monat), wird auf das Monatsende gekürzt. */
export function plusMonate(datum: string, n: number): string {
  const x = d(datum);
  const tag = x.getUTCDate();
  x.setUTCDate(1);
  x.setUTCMonth(x.getUTCMonth() + n);
  const letzter = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate();
  x.setUTCDate(Math.min(tag, letzter));
  return iso(x);
}

/** Ganze Monate zwischen zwei Daten (wie alt ist die Ausbildung am Stichtag). */
export function monateZwischen(von: string, bis: string): number {
  const a = d(von);
  const b = d(bis);
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth()) - (b.getUTCDate() < a.getUTCDate() ? 1 : 0);
}

// ---------- Ausbildungsdauer und Verkürzung ----------

export const REGELDAUER_MONATE = 36;
export const MINDESTDAUER_MONATE = 18;

export const VERKUERZUNG_GRUENDE: [string, string][] = [
  ['', '– kein Grund angegeben –'],
  ['abitur', 'Abitur'],
  ['fachhochschulreife', 'Fachhochschulreife'],
  ['mittlere-reife', 'Mittlere Reife'],
  ['berufsausbildung', 'Abgeschlossene Berufsausbildung'],
  ['vorausbildung', 'Vorausbildung im selben oder einem verwandten Beruf'],
  ['alter', 'Alter über 21 Jahre'],
  ['leistung', 'Gute Leistungen (nachträglich)'],
  ['sonstiges', 'Sonstiges'],
];

export interface Dauer {
  beginn: string;
  /** vertragliche Dauer in Monaten */
  monate: number;
  /** Verkürzung in Monaten */
  verkuerzung: number;
  /** am Anfang angerechnete Monate (Start in höherem Ausbildungsjahr) */
  versatz: number;
  /** letzter Ausbildungstag laut Vertrag */
  ende: string;
  /** Vertragsende von Hand eingetragen statt berechnet */
  endeVonHand: boolean;
}

interface DauerEingabe {
  ausbildungsbeginn: string;
  verkuerzung_monate?: string;
  verkuerzung_art?: string;
  vertragsende?: string;
}

/** Ausbildungsdauer aus den Einstellungen: Regeldauer 36 Monate minus Verkürzung (höchstens 18). */
export function ausbildungsdauer(e: DauerEingabe): Dauer | null {
  const beginn = e.ausbildungsbeginn;
  if (!gueltigesDatum(beginn)) return null;
  const roh = Number(e.verkuerzung_monate ?? 0);
  const verkuerzung = Number.isInteger(roh) ? Math.min(Math.max(roh, 0), REGELDAUER_MONATE - MINDESTDAUER_MONATE) : 0;
  const monate = REGELDAUER_MONATE - verkuerzung;
  const endeVonHand = gueltigesDatum(e.vertragsende) && e.vertragsende! > beginn;
  const ende = endeVonHand ? e.vertragsende! : plusTage(plusMonate(beginn, monate), -1);
  return { beginn, monate, verkuerzung, versatz: e.verkuerzung_art === 'anfang' ? verkuerzung : 0, ende, endeVonHand };
}

/** Ausbildungsjahr an einem Tag (ab Beginn; angerechnete Monate zählen mit). */
export function ausbildungsjahrAm(dauer: Pick<Dauer, 'beginn' | 'versatz'>, datum: string): number {
  const ref = datum < dauer.beginn ? dauer.beginn : datum;
  return Math.floor((monateZwischen(dauer.beginn, ref) + dauer.versatz) / 12) + 1;
}

const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const TAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/** "01.09." */
export function tagMonat(datum: string): string {
  return `${datum.slice(8, 10)}.${datum.slice(5, 7)}.`;
}
/** "Do 05.03." */
export function wochentagKurz(datum: string): string {
  return `${TAGE[d(datum).getUTCDay()]} ${tagMonat(datum)}`;
}
/** "September 2026" */
export function monatJahr(datum: string): string {
  return `${MONATE[Number(datum.slice(5, 7)) - 1]} ${datum.slice(0, 4)}`;
}

export interface Woche {
  /** fortlaufend ab 0 (erste angezeigte Woche) */
  index: number;
  /** Ausbildungswoche ab 1; 0 vor dem Beginn */
  nummer: number;
  montag: string;
  sonntag: string;
  kw: number;
  kwJahr: number;
  /** 1–3 (bei Verlängerung auch 4) */
  ausbildungsjahr: number;
  /** Text für Auswahllisten: "KW 36 · 31.08.–06.09.2026" */
  label: string;
}

export interface Zeitraum {
  beginn: string;
  /** voraussichtliches Ende nach Regeldauer (Beginn + 3 Jahre − 1 Tag) */
  ende: string;
  wochen: Woche[];
}

/**
 * Alle Kalenderwochen der Ausbildung: von der Woche des Ausbildungsbeginns bis zur Woche des
 * voraussichtlichen Endes – erweitert um spätere Prüfungen bzw. Einträge (spaeteste) und um
 * Einträge vor dem Beginn (frueheste, Ausbildungsjahr 0).
 */
export function ausbildungsWochen(
  beginn: string,
  spaeteste: string[] = [],
  frueheste: string[] = [],
  dauer?: Pick<Dauer, 'ende' | 'versatz'> | null,
): Zeitraum | null {
  if (!gueltigesDatum(beginn)) return null;
  let erster = montagVon(beginn);
  for (const s of frueheste) {
    if (gueltigesDatum(s) && montagVon(s) < erster) erster = montagVon(s);
  }
  // auch nach vorn höchstens ein Jahr
  if (erster < montagVon(plusJahre(beginn, -1))) erster = montagVon(plusJahre(beginn, -1));
  const versatz = dauer?.versatz ?? 0;
  const ende = dauer?.ende && dauer.ende > beginn ? dauer.ende : plusTage(plusJahre(beginn, 3), -1);
  let letzter = montagVon(ende);
  for (const s of spaeteste) {
    if (gueltigesDatum(s) && montagVon(s) > letzter) letzter = montagVon(s);
  }
  // Schutz vor Tippfehlern (z. B. Jahr 2062): höchstens fünf Jahre anzeigen
  const grenze = montagVon(plusJahre(beginn, 5));
  if (letzter > grenze) letzter = grenze;

  const wochen: Woche[] = [];
  // Beginn des Ausbildungsjahres j + 1; bei angerechneten Monaten (versatz) entsprechend früher
  const naechstesJahr = (j: number) => plusMonate(beginn, 12 * j - versatz);
  let ajahr = 1;
  for (let m = erster, i = 0; m <= letzter; m = plusTage(m, 7), i++) {
    // Die Woche gehört zu dem Ausbildungsjahr, in dem ihr Montag liegt (die Woche des
    // Beginns zählt wie der erste Tag); Wochen, die ganz vor dem Beginn enden, zählen als Jahr 0.
    const ref = m < beginn ? beginn : m;
    while (ref >= naechstesJahr(ajahr)) ajahr++;
    const jahrDerWoche = plusTage(m, 6) < beginn ? 0 : ajahr;
    const { kw, jahr } = kalenderwoche(m);
    const sonntag = plusTage(m, 6);
    wochen.push({
      index: i,
      nummer: jahrDerWoche === 0 ? 0 : wochenAbstand(montagVon(beginn), m) + 1,
      montag: m,
      sonntag,
      kw,
      kwJahr: jahr,
      ausbildungsjahr: jahrDerWoche,
      label: `KW ${kw} · ${tagMonat(m)}–${tagMonat(sonntag)}${sonntag.slice(0, 4)}`,
    });
  }
  return { beginn, ende, wochen };
}

/** Kurzform: Wochen der Ausbildung direkt aus den Einstellungen (mit Verkürzung). */
export function wochenAus(e: DauerEingabe, spaeteste: string[] = [], frueheste: string[] = []): Zeitraum | null {
  return ausbildungsWochen(e.ausbildungsbeginn, spaeteste, frueheste, ausbildungsdauer(e));
}

/** Einträge, die eine bestimmte Woche berühren. */
export function eintraegeDerWoche(eintraege: PlanEintrag[], montag: string): PlanEintrag[] {
  return eintraege.filter((e) => e.von <= montag && e.bis >= montag);
}

/** Wie viele verschiedene Wochen mindestens ein Schulblock belegt. */
export function schulwochen(eintraege: PlanEintrag[]): Set<string> {
  const s = new Set<string>();
  for (const e of eintraege) {
    if (e.art !== 'schule') continue;
    for (let m = e.von; m <= e.bis; m = plusTage(m, 7)) s.add(m);
  }
  return s;
}

/** Reihenfolge innerhalb einer Woche: Schule, Themen, Aufgaben, Notizen. */
export const ART_RANG = { schule: 0, thema: 1, aufgabe: 2, notiz: 3 } as const;
