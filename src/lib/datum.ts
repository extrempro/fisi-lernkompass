import type { Einstellungen, PruefungKey } from '../types';
import { ausbildungsdauer, ausbildungsjahrAm, gueltigesDatum, plusJahre, plusTage } from './kalender';

/** Heutiges Datum als JJJJ-MM-TT in lokaler Zeit (nicht UTC). */
export function heuteIso(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDatum(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatZeit(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Ganze Tage bis zu einem Datum (negativ = vorbei). */
export function tageBis(iso: string, heute = new Date()): number | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const h = new Date(heute);
  h.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - h.getTime()) / 86400000);
}

export interface Ausbildungsstand {
  titel: string;
  hinweis: string;
  jahr: number | null;
}

/** Ausbildungsjahr aus dem Ausbildungsbeginn (Regeldauer 3 Jahre). */
export function ausbildungsstand(
  beginn: string,
  heute = new Date(),
  opt?: { ende?: string; versatz?: number; verkuerzung?: number; vorzeitig?: boolean },
): Ausbildungsstand {
  if (!beginn) return { titel: 'Kein Startdatum', hinweis: 'Trag den ersten Ausbildungstag ein.', jahr: null };
  if (!gueltigesDatum(beginn)) return { titel: 'Ungültiges Datum', hinweis: '', jahr: null };
  const jetzt = new Date(heute);
  const heuteIso = `${jetzt.getFullYear()}-${String(jetzt.getMonth() + 1).padStart(2, '0')}-${String(jetzt.getDate()).padStart(2, '0')}`;
  const ende = opt?.ende && gueltigesDatum(opt.ende) && opt.ende > beginn ? opt.ende : plusTage(plusJahre(beginn, 3), -1);
  const verkuerzt = (opt?.verkuerzung ?? 0) > 0;
  const hinweis =
    `${verkuerzt ? 'Vertragsende' : 'Voraussichtliches Ende'}: ${formatDatum(ende)}` +
    (verkuerzt ? ` · verkürzt um ${opt!.verkuerzung} Monate` : '') +
    (opt?.vorzeitig ? ' · vorzeitige Zulassung: Ende mit bestandener Prüfung' : '');
  if (heuteIso < beginn) {
    const tage = Math.round((new Date(`${beginn}T00:00:00`).getTime() - new Date(`${heuteIso}T00:00:00`).getTime()) / 86400000);
    return { titel: `Start in ${tage} ${tage === 1 ? 'Tag' : 'Tagen'}`, hinweis, jahr: null };
  }
  if (heuteIso > ende) return { titel: verkuerzt ? 'Vertragsende erreicht' : 'Regeldauer erreicht', hinweis, jahr: null };
  const jahr = ausbildungsjahrAm({ beginn, versatz: opt?.versatz ?? 0 }, heuteIso);
  return { titel: `${jahr}. Ausbildungsjahr`, hinweis, jahr };
}

/** Ausbildungsstand direkt aus den Einstellungen – berücksichtigt Verkürzung und vorzeitige Zulassung. */
export function ausbildungsstandAus(e: Einstellungen, heute = new Date()): Ausbildungsstand {
  const dauer = ausbildungsdauer(e);
  return ausbildungsstand(e.ausbildungsbeginn, heute, dauer ? { ende: dauer.ende, versatz: dauer.versatz, verkuerzung: dauer.verkuerzung, vorzeitig: e.vorzeitige_zulassung === 'ja' } : undefined);
}

/** Gestreckte Abschlussprüfung nach FIAusbV: Teil 1 (früher oft „Zwischenprüfung“ genannt) und Teil 2. */
export const PRUEFUNG_NAME: Record<PruefungKey, string> = {
  AP1: 'Abschlussprüfung Teil 1',
  AP2: 'Abschlussprüfung Teil 2',
};

/** Kurzform für Chips */
export const PRUEFUNG_KURZ: Record<PruefungKey, string> = {
  AP1: 'AP Teil 1',
  AP2: 'AP Teil 2',
};

export const PRUEFUNG_FELD: Record<PruefungKey, 'zwischenpruefung' | 'abschlusspruefung'> = {
  AP1: 'zwischenpruefung',
  AP2: 'abschlusspruefung',
};

/** Nächste anstehende Prüfung (heute oder später); ohne Termine: Teil 1 ohne Datum. */
export function naechstePruefung(e: Einstellungen): { key: PruefungKey; datum: string; tage: number | null } {
  const kandidaten = (['AP1', 'AP2'] as PruefungKey[])
    .map((key) => ({ key, datum: e[PRUEFUNG_FELD[key]], tage: tageBis(e[PRUEFUNG_FELD[key]]) }))
    .filter((k) => k.tage !== null && k.tage >= 0)
    .sort((a, b) => (a.tage ?? 0) - (b.tage ?? 0));
  if (kandidaten.length) return kandidaten[0];
  if (!e.zwischenpruefung) return { key: 'AP1', datum: '', tage: null };
  if (!e.abschlusspruefung) return { key: 'AP2', datum: '', tage: null };
  return { key: 'AP2', datum: e.abschlusspruefung, tage: tageBis(e.abschlusspruefung) };
}
