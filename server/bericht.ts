import { transaktion, type DB } from './db';
import { heute } from './datum';
import { montag as montagVon } from './plan';
import { legeUnterschriftAn, pruefeUnterschrift } from './unterschrift';

/** Berichtsheft: ein Ausbildungsnachweis je Kalenderwoche (Montag als Schlüssel). */
export const BERICHT_STATUS = ['entwurf', 'fertig', 'abgezeichnet'] as const;
export type BerichtStatus = (typeof BERICHT_STATUS)[number];
export const ABWESENHEIT_GRUENDE = ['urlaub', 'krank', 'feiertag', 'sonstiges'] as const;
export type AbwesenheitGrund = (typeof ABWESENHEIT_GRUENDE)[number];

export interface Posten {
  text: string;
  stunden: number;
}

export interface Abwesenheit {
  tag: string;
  grund: AbwesenheitGrund;
  stunden: number;
  text: string;
}

export interface BerichtInhalt {
  betrieb: Posten[];
  unterweisung: Posten[];
  schule: Posten[];
  abwesenheit: Abwesenheit[];
}

/** Digitale Unterschrift, mit der ein Bericht abgezeichnet wurde */
export interface BerichtUnterschrift {
  name: string;
  datum: string;
  pfad: string;
}

export interface Bericht {
  montag: string;
  status: BerichtStatus;
  abgezeichnetAm: string | null;
  inhalt: BerichtInhalt;
  unterschrift: BerichtUnterschrift | null;
  geaendert: string;
}

/** Was beim Speichern geprüft wird – die Unterschrift setzt nur das Abzeichnen. */
export type BerichtWerte = Omit<Bericht, 'geaendert' | 'unterschrift'>;

export const MAX_POSTEN = 40;
export const MAX_POSTEN_TEXT = 300;
export const MAX_STUNDEN = 80;

const leer = (): BerichtInhalt => ({ betrieb: [], unterweisung: [], schule: [], abwesenheit: [] });

function istObjekt(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function stunden(x: unknown, wo: string): number | string {
  const n = typeof x === 'number' ? x : typeof x === 'string' && x.trim() !== '' ? Number(x.replace(',', '.')) : 0;
  if (!Number.isFinite(n) || n < 0 || n > MAX_STUNDEN) return `${wo}: Stunden müssen zwischen 0 und ${MAX_STUNDEN} liegen`;
  return Math.round(n * 4) / 4; // auf Viertelstunden
}

function postenListe(roh: unknown, name: string): Posten[] | string {
  if (roh === undefined) return [];
  if (!Array.isArray(roh)) return `${name} muss eine Liste sein`;
  if (roh.length > MAX_POSTEN) return `${name}: höchstens ${MAX_POSTEN} Einträge`;
  const liste: Posten[] = [];
  for (const [i, x] of roh.entries()) {
    if (!istObjekt(x) || typeof x.text !== 'string') return `${name}, Eintrag ${i + 1}: Text fehlt`;
    const text = x.text.trim();
    if (text.length > MAX_POSTEN_TEXT) return `${name}, Eintrag ${i + 1}: höchstens ${MAX_POSTEN_TEXT} Zeichen`;
    const h = stunden(x.stunden, `${name}, Eintrag ${i + 1}`);
    if (typeof h === 'string') return h;
    if (!text && !h) continue; // leere Zeile
    liste.push({ text, stunden: h });
  }
  return liste;
}

/** Prüft den Inhalt eines Berichts. Abwesenheiten müssen in der Berichtswoche liegen. */
export function pruefeInhalt(roh: unknown, montag: string): BerichtInhalt | string {
  if (roh === undefined) return leer();
  if (!istObjekt(roh)) return 'inhalt muss ein Objekt sein';
  const inhalt: BerichtInhalt = leer();
  for (const [k, name] of [
    ['betrieb', 'Betriebliche Tätigkeiten'],
    ['unterweisung', 'Unterweisungen'],
    ['schule', 'Berufsschule'],
  ] as const) {
    const l = postenListe(roh[k], name);
    if (typeof l === 'string') return l;
    inhalt[k] = l;
  }
  const abw = roh.abwesenheit ?? [];
  if (!Array.isArray(abw)) return 'abwesenheit muss eine Liste sein';
  if (abw.length > 14) return 'Abwesenheit: höchstens 14 Einträge';
  const sonntag = new Date(`${montag}T00:00:00Z`);
  sonntag.setUTCDate(sonntag.getUTCDate() + 6);
  const ende = sonntag.toISOString().slice(0, 10);
  for (const [i, x] of abw.entries()) {
    const wo = `Abwesenheit, Eintrag ${i + 1}`;
    if (!istObjekt(x)) return `${wo}: ungültig`;
    if (typeof x.tag !== 'string' || montagVon(x.tag) !== montag || x.tag > ende) return `${wo}: der Tag muss in der Berichtswoche liegen`;
    if (!ABWESENHEIT_GRUENDE.includes(x.grund as AbwesenheitGrund)) return `${wo}: Grund muss urlaub, krank, feiertag oder sonstiges sein`;
    const h = stunden(x.stunden, wo);
    if (typeof h === 'string') return h;
    const text = typeof x.text === 'string' ? x.text.trim().slice(0, MAX_POSTEN_TEXT) : '';
    inhalt.abwesenheit.push({ tag: x.tag, grund: x.grund as AbwesenheitGrund, stunden: h, text });
  }
  inhalt.abwesenheit.sort((a, b) => a.tag.localeCompare(b.tag));
  return inhalt;
}

/** Prüft einen Bericht zum Speichern (ganzer Bericht, kein Teil-Update). */
export function pruefeBericht(montagRoh: string, body: unknown): BerichtWerte | string {
  const montag = montagVon(montagRoh);
  if (!montag || montag !== montagRoh) return 'Die Woche muss als Montag JJJJ-MM-TT angegeben werden';
  if (!istObjekt(body)) return 'JSON-Objekt erwartet';
  const status = (body.status ?? 'entwurf') as BerichtStatus;
  if (!BERICHT_STATUS.includes(status)) return 'status muss entwurf, fertig oder abgezeichnet sein';
  let abgezeichnetAm: string | null = null;
  if (status === 'abgezeichnet') {
    const d = typeof body.abgezeichnetAm === 'string' && body.abgezeichnetAm ? body.abgezeichnetAm : heute();
    if (!montagVon(d)) return 'abgezeichnetAm muss ein Datum JJJJ-MM-TT sein';
    abgezeichnetAm = d;
  }
  const inhalt = pruefeInhalt(body.inhalt, montag);
  if (typeof inhalt === 'string') return inhalt;
  return { montag, status, abgezeichnetAm, inhalt };
}

type Zeile = {
  montag: string;
  status: BerichtStatus;
  abgezeichnet_am: string | null;
  inhalt: string;
  geaendert: string;
  unterschrift_id: number | null;
  u_name: string | null;
  u_datum: string | null;
  u_pfad: string | null;
};

const SELECT = `SELECT b.*, u.name AS u_name, u.datum AS u_datum, u.pfad AS u_pfad
  FROM bericht b LEFT JOIN unterschrift u ON u.id = b.unterschrift_id`;

function ausZeile(z: Zeile): Bericht {
  let roh: unknown = {};
  try {
    roh = JSON.parse(z.inhalt || '{}');
  } catch {
    /* beschädigt: leer */
  }
  const inhalt = pruefeInhalt(roh, z.montag);
  return {
    montag: z.montag,
    status: z.status,
    abgezeichnetAm: z.abgezeichnet_am,
    inhalt: typeof inhalt === 'string' ? leer() : inhalt,
    unterschrift: z.unterschrift_id && z.u_pfad ? { name: z.u_name ?? '', datum: z.u_datum ?? '', pfad: z.u_pfad } : null,
    geaendert: z.geaendert,
  };
}

export function alleBerichte(db: DB): Bericht[] {
  return (db.prepare(`${SELECT} ORDER BY b.montag`).all() as unknown as Zeile[]).map(ausZeile);
}

export function holeBericht(db: DB, montag: string): Bericht | undefined {
  const z = db.prepare(`${SELECT} WHERE b.montag = ?`).get(montag) as Zeile | undefined;
  return z ? ausZeile(z) : undefined;
}

/**
 * Speichert einen Bericht. War er digital unterschrieben und ändert sich der Inhalt,
 * fällt die Unterschrift weg und der Bericht geht zurück auf „fertig“ –
 * Unterschriebenes kann also nicht unbemerkt verändert werden.
 */
export function speichereBericht(db: DB, b: BerichtWerte): Bericht & { unterschriftEntfernt: boolean } {
  const alt = db.prepare('SELECT inhalt, unterschrift_id FROM bericht WHERE montag = ?').get(b.montag) as
    | { inhalt: string; unterschrift_id: number | null }
    | undefined;
  let werte = b;
  let unterschriftId: number | null = alt?.unterschrift_id ?? null;
  let entfernt = false;
  if (unterschriftId) {
    const gleich = alt!.inhalt === JSON.stringify(b.inhalt);
    if (!gleich) {
      werte = { ...b, status: 'fertig', abgezeichnetAm: null };
      unterschriftId = null;
      entfernt = true;
    } else if (b.status !== 'abgezeichnet') {
      unterschriftId = null; // bewusst zurückgestuft
      entfernt = true;
    }
  }
  db.prepare(
    `INSERT INTO bericht (montag, status, abgezeichnet_am, inhalt, unterschrift_id, geaendert) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(montag) DO UPDATE SET status = excluded.status, abgezeichnet_am = excluded.abgezeichnet_am,
       inhalt = excluded.inhalt, unterschrift_id = excluded.unterschrift_id, geaendert = excluded.geaendert`,
  ).run(werte.montag, werte.status, werte.abgezeichnetAm, JSON.stringify(werte.inhalt), unterschriftId, heute());
  return { ...holeBericht(db, b.montag)!, unterschriftEntfernt: entfernt };
}

export function loescheBericht(db: DB, montag: string): boolean {
  return Number(db.prepare('DELETE FROM bericht WHERE montag = ?').run(montag).changes) > 0;
}

/**
 * Setzt mehrere Berichte auf „abgezeichnet“ (z. B. einen ganzen Monat nach der Unterschrift).
 * Mit Unterschrift werden auch abgezeichnete Berichte ohne Unterschrift nachträglich unterschrieben.
 */
export function zeichneAb(db: DB, montage: string[], datum: string, unterschriftId: number | null = null): number {
  let n = 0;
  const stmt = unterschriftId
    ? db.prepare(
        `UPDATE bericht SET status = 'abgezeichnet', abgezeichnet_am = ?, unterschrift_id = ?, geaendert = ?
         WHERE montag = ? AND status IN ('fertig', 'abgezeichnet') AND unterschrift_id IS NULL`,
      )
    : db.prepare("UPDATE bericht SET status = 'abgezeichnet', abgezeichnet_am = ?, geaendert = ? WHERE montag = ? AND status <> 'abgezeichnet'");
  transaktion(db, () => {
    for (const m of montage) {
      n += Number((unterschriftId ? stmt.run(datum, unterschriftId, heute(), m) : stmt.run(datum, heute(), m)).changes);
    }
  });
  return n;
}

/** Ersetzt alle Berichte (Import). Ungültige werden übersprungen, mitgelieferte Unterschriften neu angelegt. */
export function ersetzeBerichte(db: DB, roh: unknown[]): number {
  const gueltig: { b: BerichtWerte; u: unknown }[] = [];
  for (const x of roh) {
    if (!istObjekt(x) || typeof x.montag !== 'string') continue;
    const b = pruefeBericht(x.montag, x);
    if (typeof b !== 'string') gueltig.push({ b, u: x.unterschrift });
  }
  transaktion(db, () => {
    db.exec("DELETE FROM bericht; DELETE FROM unterschrift WHERE rolle = 'ausbilder';");
    const stmt = db.prepare('INSERT INTO bericht (montag, status, abgezeichnet_am, inhalt, unterschrift_id, geaendert) VALUES (?, ?, ?, ?, ?, ?)');
    // gleiche Unterschrift (Sammel-Abzeichnen) nur einmal anlegen
    const schon = new Map<string, number>();
    for (const { b, u } of gueltig) {
      let uid: number | null = null;
      if (b.status === 'abgezeichnet' && u) {
        const geprueft = pruefeUnterschrift(u, 'ausbilder');
        if (typeof geprueft !== 'string') {
          const key = `${geprueft.name}|${geprueft.datum}|${geprueft.pfad}`;
          uid = schon.get(key) ?? legeUnterschriftAn(db, geprueft).id;
          schon.set(key, uid);
        }
      }
      stmt.run(b.montag, b.status, b.abgezeichnetAm, JSON.stringify(b.inhalt), uid, heute());
    }
  });
  return gueltig.length;
}
