import type { Tabelle, Themenfeld } from '../types';

export type EintragTyp = 'begriff' | 'befehl' | 'tabelle' | 'merksatz' | 'frage' | 'zusatz';

export const TYP_LABEL: Record<EintragTyp, string> = {
  begriff: 'Begriff',
  befehl: 'Befehl',
  tabelle: 'Tabelle',
  merksatz: 'Merksatz',
  frage: 'Prüfungsfrage',
  zusatz: 'Zusatzwissen',
};

export const TYP_MEHRZAHL: Record<EintragTyp, string> = {
  begriff: 'Begriffe',
  befehl: 'Befehle',
  tabelle: 'Tabellen',
  merksatz: 'Merksätze',
  frage: 'Prüfungsfragen',
  zusatz: 'Zusatzwissen',
};

export interface Eintrag {
  key: string;
  typ: EintragTyp;
  titel: string;
  text: string;
  tabelle?: Tabelle;
  loesung?: string[];
  /** nur Zusatzwissen: Abschnittstitel */
  abschnitte?: string[];
  /** Link-Ziel, falls nicht das Unterthema */
  ziel?: string;
  feldId: string;
  feldTitel: string;
  subId: string;
  subTitel: string;
  /** Buchstabe für die A–Z-Leiste */
  buchstabe: string;
  /** normalisierter Suchtext */
  such: string;
}

/** Kleinbuchstaben, Umlaute vereinheitlicht, Markdown-Zeichen entfernt – für die Suche. */
export function normalisiere(s: string): string {
  return s
    .toLowerCase()
    .replace(/[`*]/g, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function buchstabeVon(titel: string): string {
  const c = titel
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .charAt(0)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  return /[A-Z]/.test(c) ? c : '#';
}

/** Sammelt alle Einträge aus allen Cheatsheets. */
export function sammleEintraege(felder: Themenfeld[]): Eintrag[] {
  const out: Eintrag[] = [];
  for (const f of felder) {
    for (const u of f.unterthemen) {
      const basis = { feldId: f.id, feldTitel: f.titel, subId: u.id, subTitel: u.titel };
      const add = (typ: EintragTyp, titel: string, text: string, extra: Partial<Eintrag> = {}, zusatzSuche = '') =>
        out.push({
          key: `${typ}:${f.id}.${u.id}:${out.length}`,
          typ,
          titel,
          text,
          ...basis,
          ...extra,
          buchstabe: buchstabeVon(titel),
          such: normalisiere(`${titel} ${text} ${zusatzSuche} ${u.titel} ${f.titel}`),
        });

      for (const b of u.begriffe) add('begriff', b.begriff, b.erklaerung);
      for (const b of u.befehle) add('befehl', b.befehl, b.info);
      for (const t of u.tabellen) {
        add('tabelle', t.titel, '', { tabelle: t }, [...t.kopf, ...t.zeilen.flat()].join(' '));
      }
      if (u.merksatz) add('merksatz', u.titel, u.merksatz);
      if (u.frage) add('frage', u.frage.frage, '', { loesung: u.frage.loesung }, u.frage.loesung.join(' '));
    }
    for (const z of f.zusatz) {
      const titel = z.abschnitte.flatMap((a) => (a.titel ? [a.titel] : a.karten.map((k) => k.titel)));
      const volltext = [
        ...z.absaetze,
        ...z.abschnitte.flatMap((a) => [
          a.titel,
          ...a.absaetze,
          ...a.punkte,
          ...a.schritte,
          ...a.bilder.map((b) => b.alt),
          ...(a.tabelle ? [...a.tabelle.kopf, ...a.tabelle.zeilen.flat()] : []),
          ...a.karten.flatMap((k) => [k.titel, k.kurz, k.plus, k.minus, k.beispiel]),
        ]),
        ...z.szenarien.flatMap((s) => [s.label, s.merksatz, ...s.schritte.map((st) => `${st.titel} ${st.text}`)]),
      ].join(' ');
      out.push({
        key: `zusatz:${f.id}.${z.id}`,
        typ: 'zusatz',
        titel: z.titel,
        text: z.intro,
        abschnitte: titel,
        ziel: `/thema/${f.id}#z-${z.id}`,
        feldId: f.id,
        feldTitel: f.titel,
        subId: z.id,
        subTitel: 'Zusatzwissen',
        buchstabe: buchstabeVon(z.titel),
        such: normalisiere(`${z.titel} ${z.intro} ${volltext} ${f.titel} zusatzwissen`),
      });
    }
  }
  const sortTitel = (s: string) => s.replace(/[`*]/g, '').replace(/^[^\p{L}\p{N}]+/u, '');
  return out.sort((a, b) => sortTitel(a.titel).localeCompare(sortTitel(b.titel), 'de', { sensitivity: 'base', numeric: true }));
}

/** Alle Suchwörter müssen vorkommen (UND-Verknüpfung). */
export function passt(e: Eintrag, suche: string): boolean {
  const woerter = normalisiere(suche).split(/\s+/).filter(Boolean);
  return woerter.every((w) => e.such.includes(w));
}
