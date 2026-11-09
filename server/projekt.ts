import type { DB } from './db';
import { heute } from './datum';

/** Abschlussprojekt: freie Angaben, aber mit festen Feldern und Grenzen. */
export interface Phase {
  name: string;
  soll: number;
  ist: number;
}

export interface ProjektDaten {
  titel: string;
  auftraggeber: string;
  termine: Record<string, string>;
  antrag: Record<string, boolean>;
  doku: Record<string, boolean>;
  phasen: Phase[];
  fragen: Record<string, string>;
  notizen: string;
}

export const TERMIN_SCHLUESSEL = ['antrag', 'genehmigung', 'start', 'ende', 'doku', 'praesentation'] as const;
const DATUM = /^\d{4}-\d{2}-\d{2}$/;
const SCHLUESSEL = /^[a-z0-9-]{1,40}$/;

export function leeresProjekt(): ProjektDaten {
  return {
    titel: '',
    auftraggeber: '',
    termine: {},
    antrag: {},
    doku: {},
    phasen: [
      { name: 'Analyse (Ist-Zustand, Anforderungen)', soll: 4, ist: 0 },
      { name: 'Planung und Konzeption', soll: 8, ist: 0 },
      { name: 'Umsetzung', soll: 16, ist: 0 },
      { name: 'Test und Qualitätssicherung', soll: 4, ist: 0 },
      { name: 'Übergabe und Abnahme', soll: 2, ist: 0 },
      { name: 'Projektdokumentation', soll: 6, ist: 0 },
    ],
    fragen: {},
    notizen: '',
  };
}

function text(x: unknown, max: number): string | null {
  return typeof x === 'string' && x.length <= max ? x : null;
}

/** Prüft das ganze Projekt-Dokument. Unbekannte Felder werden verworfen. */
export function pruefeProjekt(roh: unknown): ProjektDaten | string {
  if (typeof roh !== 'object' || roh === null || Array.isArray(roh)) return 'JSON-Objekt erwartet';
  const r = roh as Record<string, unknown>;
  const p = leeresProjekt();
  const titel = text(r.titel ?? '', 300);
  const auftraggeber = text(r.auftraggeber ?? '', 300);
  const notizen = text(r.notizen ?? '', 20000);
  if (titel === null || auftraggeber === null || notizen === null) return 'Titel, Auftraggeber oder Notizen zu lang';
  Object.assign(p, { titel, auftraggeber, notizen });

  if (r.termine !== undefined) {
    if (typeof r.termine !== 'object' || r.termine === null) return 'termine muss ein Objekt sein';
    p.termine = {};
    for (const k of TERMIN_SCHLUESSEL) {
      const v = (r.termine as Record<string, unknown>)[k];
      if (v === undefined || v === '') continue;
      if (typeof v !== 'string' || !DATUM.test(v)) return `Termin "${k}" muss ein Datum JJJJ-MM-TT sein`;
      p.termine[k] = v;
    }
  }
  for (const feld of ['antrag', 'doku'] as const) {
    if (r[feld] === undefined) continue;
    if (typeof r[feld] !== 'object' || r[feld] === null) return `${feld} muss ein Objekt sein`;
    p[feld] = {};
    for (const [k, v] of Object.entries(r[feld] as Record<string, unknown>).slice(0, 60)) {
      if (SCHLUESSEL.test(k) && v === true) p[feld][k] = true;
    }
  }
  if (r.phasen !== undefined) {
    if (!Array.isArray(r.phasen) || r.phasen.length > 20) return 'phasen: höchstens 20 Einträge';
    p.phasen = [];
    for (const x of r.phasen) {
      if (typeof x !== 'object' || x === null) return 'Ungültige Phase';
      const ph = x as Record<string, unknown>;
      const name = text(ph.name, 120);
      const soll = Number(ph.soll ?? 0);
      const ist = Number(ph.ist ?? 0);
      if (name === null || !Number.isFinite(soll) || !Number.isFinite(ist) || soll < 0 || ist < 0 || soll > 200 || ist > 200) {
        return 'Phasen brauchen einen Namen und Stunden zwischen 0 und 200';
      }
      p.phasen.push({ name, soll: Math.round(soll * 4) / 4, ist: Math.round(ist * 4) / 4 });
    }
  }
  if (r.fragen !== undefined) {
    if (typeof r.fragen !== 'object' || r.fragen === null) return 'fragen muss ein Objekt sein';
    p.fragen = {};
    for (const [k, v] of Object.entries(r.fragen as Record<string, unknown>).slice(0, 60)) {
      const t = text(v, 3000);
      if (SCHLUESSEL.test(k) && t) p.fragen[k] = t;
    }
  }
  return p;
}

export function leseProjekt(db: DB): ProjektDaten {
  const z = db.prepare('SELECT daten FROM projekt WHERE id = 1').get() as { daten: string } | undefined;
  if (!z) return leeresProjekt();
  try {
    const p = pruefeProjekt(JSON.parse(z.daten));
    return typeof p === 'string' ? leeresProjekt() : p;
  } catch {
    return leeresProjekt();
  }
}

export function speichereProjekt(db: DB, p: ProjektDaten): ProjektDaten {
  db.prepare(
    `INSERT INTO projekt (id, daten, geaendert) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET daten = excluded.daten, geaendert = excluded.geaendert`,
  ).run(JSON.stringify(p), heute());
  return p;
}
