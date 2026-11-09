import { transaktion, type DB } from './db';
import { heute } from './datum';

/** Ausbildungsplan: Einträge, die eine oder mehrere Kalenderwochen belegen. */
export const PLAN_ARTEN = ['schule', 'aufgabe', 'notiz', 'thema'] as const;
export type PlanArt = (typeof PLAN_ARTEN)[number];

export interface PlanEintrag {
  id: number;
  art: PlanArt;
  /** Montag der ersten Woche (JJJJ-MM-TT) */
  von: string;
  /** Montag der letzten Woche (JJJJ-MM-TT) */
  bis: string;
  titel: string;
  text: string;
  themenfeld: string;
  erledigt: number;
  /** nur bei Aufgaben: Teilschritte zum Abhaken */
  unteraufgaben: Unteraufgabe[];
  geaendert: string;
}

export interface Unteraufgabe {
  text: string;
  erledigt: boolean;
}

export type PlanWerte = Omit<PlanEintrag, 'id' | 'geaendert'>;

export const MAX_TITEL = 200;
export const MAX_TEXT = 5000;
/** Ein Eintrag darf höchstens so viele Wochen umfassen (gut drei Ausbildungsjahre). */
export const MAX_WOCHEN = 200;
export const MAX_UNTERAUFGABEN = 30;
const DATUM = /^\d{4}-\d{2}-\d{2}$/;

function alsDatum(iso: string): Date | null {
  if (!DATUM.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso ? null : d;
}

/** Montag der Woche, in der das Datum liegt (ISO-Woche beginnt montags). */
export function montag(iso: string): string | null {
  const d = alsDatum(iso);
  if (!d) return null;
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

function wochenZwischen(von: string, bis: string): number {
  return Math.round((Date.parse(`${bis}T00:00:00Z`) - Date.parse(`${von}T00:00:00Z`)) / (7 * 86400000));
}

function istObjekt(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

/**
 * Prüft einen neuen Eintrag oder eine Änderung. Bei einer Änderung (alt gesetzt) dürfen Felder fehlen.
 * Datumswerte werden auf den Montag der jeweiligen Woche gesetzt.
 */
export function pruefePlanEintrag(
  body: unknown,
  themenfelder: ReadonlySet<string>,
  alt?: PlanWerte,
): { werte: PlanWerte } | { fehler: string } {
  if (!istObjekt(body)) return { fehler: 'JSON-Objekt erwartet' };
  const w: PlanWerte = alt
    ? { ...alt }
    : { art: 'notiz', von: '', bis: '', titel: '', text: '', themenfeld: '', erledigt: 0, unteraufgaben: [] };

  if (body.art !== undefined || !alt) {
    if (!PLAN_ARTEN.includes(body.art as PlanArt)) return { fehler: 'art muss schule, aufgabe, notiz oder thema sein' };
    w.art = body.art as PlanArt;
  }
  for (const feld of ['von', 'bis'] as const) {
    if (body[feld] === undefined) continue;
    const m = typeof body[feld] === 'string' ? montag(body[feld] as string) : null;
    if (!m) return { fehler: `${feld} muss ein Datum JJJJ-MM-TT sein` };
    w[feld] = m;
  }
  if (!w.von) return { fehler: 'von fehlt' };
  if (!w.bis) w.bis = w.von;
  if (w.bis < w.von) return { fehler: 'Die letzte Woche liegt vor der ersten' };
  if (wochenZwischen(w.von, w.bis) >= MAX_WOCHEN) return { fehler: `Ein Eintrag darf höchstens ${MAX_WOCHEN} Wochen umfassen` };

  for (const [feld, max] of [
    ['titel', MAX_TITEL],
    ['text', MAX_TEXT],
  ] as const) {
    if (body[feld] === undefined) continue;
    if (typeof body[feld] !== 'string' || (body[feld] as string).length > max) {
      return { fehler: `${feld} muss Text mit höchstens ${max} Zeichen sein` };
    }
    w[feld] = (body[feld] as string).trim();
  }
  if (body.themenfeld !== undefined) {
    if (typeof body.themenfeld !== 'string') return { fehler: 'themenfeld muss Text sein' };
    if (body.themenfeld !== '' && !themenfelder.has(body.themenfeld)) return { fehler: `Unbekanntes Themenfeld "${body.themenfeld}"` };
    w.themenfeld = body.themenfeld;
  }
  if (body.erledigt !== undefined) {
    if (typeof body.erledigt !== 'boolean') return { fehler: 'erledigt muss true oder false sein' };
    w.erledigt = body.erledigt ? 1 : 0;
  }

  if (body.unteraufgaben !== undefined) {
    const u = pruefeUnteraufgaben(body.unteraufgaben);
    if (typeof u === 'string') return { fehler: u };
    w.unteraufgaben = u;
  }

  if (w.art === 'thema' && !w.themenfeld) return { fehler: 'Bitte ein Themenfeld wählen' };
  if (w.art !== 'thema' && !w.titel) return { fehler: 'Bitte einen Titel eingeben' };
  if (w.art !== 'aufgabe') {
    w.erledigt = 0;
    w.unteraufgaben = [];
  }
  return { werte: w };
}

function pruefeUnteraufgaben(roh: unknown): Unteraufgabe[] | string {
  if (!Array.isArray(roh)) return 'unteraufgaben muss eine Liste sein';
  if (roh.length > MAX_UNTERAUFGABEN) return `Höchstens ${MAX_UNTERAUFGABEN} Unteraufgaben`;
  const liste: Unteraufgabe[] = [];
  for (const x of roh) {
    if (!istObjekt(x) || typeof x.text !== 'string') return 'Jede Unteraufgabe braucht einen Text';
    const text = x.text.trim();
    if (text.length > MAX_TITEL) return `Unteraufgaben dürfen höchstens ${MAX_TITEL} Zeichen haben`;
    if (!text) continue; // leere Zeilen still verwerfen
    liste.push({ text, erledigt: x.erledigt === true });
  }
  return liste;
}

type Zeile = Omit<PlanEintrag, 'unteraufgaben'> & { unteraufgaben: string };

function ausZeile(z: Zeile): PlanEintrag {
  let u: unknown = [];
  try {
    u = JSON.parse(z.unteraufgaben || '[]');
  } catch {
    /* beschädigt: als leer behandeln */
  }
  const geprueft = pruefeUnteraufgaben(u);
  return { ...z, unteraufgaben: typeof geprueft === 'string' ? [] : geprueft };
}

function alsZeile(w: PlanWerte) {
  return { ...w, unteraufgaben: JSON.stringify(w.unteraufgaben) };
}

export function allePlanEintraege(db: DB): PlanEintrag[] {
  return (db.prepare('SELECT * FROM plan_eintrag ORDER BY von, art, id').all() as unknown as Zeile[]).map(ausZeile);
}

export function holePlanEintrag(db: DB, id: number): PlanEintrag | undefined {
  const z = db.prepare('SELECT * FROM plan_eintrag WHERE id = ?').get(id) as Zeile | undefined;
  return z ? ausZeile(z) : undefined;
}

export function legePlanEintragAn(db: DB, w: PlanWerte): PlanEintrag {
  const r = db
    .prepare(
      `INSERT INTO plan_eintrag (art, von, bis, titel, text, themenfeld, erledigt, unteraufgaben, geaendert)
       VALUES (@art, @von, @bis, @titel, @text, @themenfeld, @erledigt, @unteraufgaben, @geaendert)`,
    )
    .run({ ...alsZeile(w), geaendert: heute() });
  return holePlanEintrag(db, Number(r.lastInsertRowid))!;
}

export function aenderePlanEintrag(db: DB, id: number, w: PlanWerte): PlanEintrag {
  db.prepare(
    `UPDATE plan_eintrag SET art = @art, von = @von, bis = @bis, titel = @titel, text = @text,
       themenfeld = @themenfeld, erledigt = @erledigt, unteraufgaben = @unteraufgaben, geaendert = @geaendert WHERE id = @id`,
  ).run({ ...alsZeile(w), geaendert: heute(), id });
  return holePlanEintrag(db, id)!;
}

export function loeschePlanEintrag(db: DB, id: number): boolean {
  return Number(db.prepare('DELETE FROM plan_eintrag WHERE id = ?').run(id).changes) > 0;
}

/** Ersetzt den ganzen Plan (Import einer Sicherung). Ungültige Einträge werden übersprungen. */
export function ersetzePlan(db: DB, eintraege: unknown[], themenfelder: ReadonlySet<string>): number {
  // Themenfelder, die es nicht mehr gibt, nicht verwerfen: der Eintrag bleibt als Notiz erhalten
  const gueltig: PlanWerte[] = [];
  for (const e of eintraege) {
    if (!istObjekt(e)) continue;
    const bekannt = themenfelder.has(String(e.themenfeld ?? ''));
    const verwaist = e.art === 'thema' && !bekannt;
    const r = pruefePlanEintrag(
      {
        ...e,
        art: verwaist ? 'notiz' : e.art,
        titel: verwaist && !e.titel ? `Themenfeld „${String(e.themenfeld ?? '')}“` : e.titel,
        erledigt: Boolean(e.erledigt),
        themenfeld: bekannt ? e.themenfeld : '',
      },
      themenfelder,
    );
    if ('werte' in r) gueltig.push(r.werte);
  }
  transaktion(db, () => {
    db.exec('DELETE FROM plan_eintrag');
    const stmt = db.prepare(
      `INSERT INTO plan_eintrag (art, von, bis, titel, text, themenfeld, erledigt, unteraufgaben, geaendert)
       VALUES (@art, @von, @bis, @titel, @text, @themenfeld, @erledigt, @unteraufgaben, @geaendert)`,
    );
    for (const w of gueltig) stmt.run({ ...alsZeile(w), geaendert: heute() });
  });
  return gueltig.length;
}
