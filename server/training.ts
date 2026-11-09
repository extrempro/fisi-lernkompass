import { transaktion, type DB } from './db';
import { heute } from './datum';

/**
 * Leitner-System: Jede Karte liegt in Fach 1–5. Gewusst → ein Fach weiter, nicht gewusst → zurück in Fach 1.
 * Je höher das Fach, desto später ist die Karte wieder dran.
 */
export const INTERVALL_TAGE = [0, 1, 2, 5, 10, 21] as const;

export interface KartenStand {
  id: string;
  fach: number;
  faellig: string;
  richtig: number;
  falsch: number;
  zuletzt: string;
}

export interface Versuch {
  id: number;
  pruefung: 'AP1' | 'AP2';
  datum: string;
  fragen: number;
  richtig: number;
  dauer: number;
  felder: Record<string, [number, number]>;
}

/** Karten-IDs: b:<feld>.<unterthema>:<Begriff> oder f:<feld>.<unterthema> */
const KARTEN_ID = /^(b:[a-z0-9-]+\.[a-z0-9-]+:.{1,200}|f:[a-z0-9-]+\.[a-z0-9-]+)$/;
export const MAX_ANTWORTEN = 200;

export function istKartenId(x: unknown): x is string {
  return typeof x === 'string' && x.length <= 300 && KARTEN_ID.test(x) && !/[\u0000-\u001f]/.test(x);
}

function plusTage(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function naechsterStand(alt: KartenStand | undefined, id: string, gewusst: boolean, tag = heute()): KartenStand {
  const fach = gewusst ? Math.min(5, (alt?.fach ?? 1) + 1) : 1;
  return {
    id,
    fach,
    faellig: plusTage(tag, INTERVALL_TAGE[fach]),
    richtig: (alt?.richtig ?? 0) + (gewusst ? 1 : 0),
    falsch: (alt?.falsch ?? 0) + (gewusst ? 0 : 1),
    zuletzt: tag,
  };
}

export function alleKarten(db: DB): KartenStand[] {
  return db.prepare('SELECT * FROM karte').all() as unknown as KartenStand[];
}

/** Speichert mehrere Antworten in einer Transaktion. Ungültige IDs werden übersprungen. */
export function beantworte(db: DB, antworten: unknown[]): KartenStand[] {
  const lesen = db.prepare('SELECT * FROM karte WHERE id = ?');
  const schreiben = db.prepare(
    `INSERT INTO karte (id, fach, faellig, richtig, falsch, zuletzt) VALUES (@id, @fach, @faellig, @richtig, @falsch, @zuletzt)
     ON CONFLICT(id) DO UPDATE SET fach = excluded.fach, faellig = excluded.faellig, richtig = excluded.richtig,
       falsch = excluded.falsch, zuletzt = excluded.zuletzt`,
  );
  const neu: KartenStand[] = [];
  transaktion(db, () => {
    for (const a of antworten.slice(0, MAX_ANTWORTEN)) {
      if (typeof a !== 'object' || a === null) continue;
      const { id, gewusst } = a as Record<string, unknown>;
      if (!istKartenId(id) || typeof gewusst !== 'boolean') continue;
      const s = naechsterStand(lesen.get(id) as KartenStand | undefined, id, gewusst);
      schreiben.run({ ...s });
      neu.push(s);
    }
  });
  return neu;
}

export function pruefeVersuch(roh: unknown): Omit<Versuch, 'id' | 'datum'> | string {
  if (typeof roh !== 'object' || roh === null) return 'JSON-Objekt erwartet';
  const r = roh as Record<string, unknown>;
  if (r.pruefung !== 'AP1' && r.pruefung !== 'AP2') return 'pruefung muss AP1 oder AP2 sein';
  const zahl = (x: unknown, max: number) => (Number.isInteger(x) && (x as number) >= 0 && (x as number) <= max ? (x as number) : null);
  const fragen = zahl(r.fragen, 200);
  const richtig = zahl(r.richtig, 200);
  const dauer = zahl(r.dauer, 6 * 3600);
  if (fragen === null || !fragen || richtig === null || richtig > fragen || dauer === null) return 'fragen, richtig und dauer müssen gültige Zahlen sein';
  const felder: Record<string, [number, number]> = {};
  if (typeof r.felder === 'object' && r.felder !== null) {
    for (const [k, v] of Object.entries(r.felder as Record<string, unknown>).slice(0, 30)) {
      if (/^[a-z0-9-]{1,60}$/.test(k) && Array.isArray(v) && v.length === 2 && v.every((n) => Number.isInteger(n) && n >= 0 && n <= 200) && v[0] <= v[1]) {
        felder[k] = [v[0], v[1]];
      }
    }
  }
  return { pruefung: r.pruefung, fragen, richtig, dauer, felder };
}

export function speichereVersuch(db: DB, v: Omit<Versuch, 'id' | 'datum'>): Versuch {
  const r = db
    .prepare('INSERT INTO pruefung_versuch (pruefung, datum, fragen, richtig, dauer, felder) VALUES (?, ?, ?, ?, ?, ?)')
    .run(v.pruefung, heute(), v.fragen, v.richtig, v.dauer, JSON.stringify(v.felder));
  return alleVersuche(db).find((x) => x.id === Number(r.lastInsertRowid))!;
}

export function alleVersuche(db: DB): Versuch[] {
  const rows = db.prepare('SELECT * FROM pruefung_versuch ORDER BY id DESC').all() as unknown as (Omit<Versuch, 'felder'> & { felder: string })[];
  return rows.map((x) => {
    let felder: Record<string, [number, number]> = {};
    try {
      felder = JSON.parse(x.felder);
    } catch {
      /* leer */
    }
    return { ...x, felder };
  });
}

/** Import: ersetzt Kartenstand und Versuche. */
export function ersetzeTraining(db: DB, karten: unknown[], versuche: unknown[]): { karten: number; versuche: number } {
  let k = 0;
  let v = 0;
  transaktion(db, () => {
    db.exec('DELETE FROM karte; DELETE FROM pruefung_versuch;');
    const s1 = db.prepare('INSERT INTO karte (id, fach, faellig, richtig, falsch, zuletzt) VALUES (?, ?, ?, ?, ?, ?)');
    for (const x of karten) {
      if (typeof x !== 'object' || x === null) continue;
      const r = x as Record<string, unknown>;
      const datum = (d: unknown) => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : heute());
      const n = (d: unknown) => (Number.isInteger(d) && (d as number) >= 0 ? (d as number) : 0);
      if (!istKartenId(r.id)) continue;
      const fach = Number.isInteger(r.fach) && (r.fach as number) >= 1 && (r.fach as number) <= 5 ? (r.fach as number) : 1;
      s1.run(r.id, fach, datum(r.faellig), n(r.richtig), n(r.falsch), datum(r.zuletzt));
      k++;
    }
    const s2 = db.prepare('INSERT INTO pruefung_versuch (pruefung, datum, fragen, richtig, dauer, felder) VALUES (?, ?, ?, ?, ?, ?)');
    for (const x of versuche) {
      const p = pruefeVersuch(x);
      if (typeof p === 'string') continue;
      const d = (x as Record<string, unknown>).datum;
      s2.run(p.pruefung, typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : heute(), p.fragen, p.richtig, p.dauer, JSON.stringify(p.felder));
      v++;
    }
  });
  return { karten: k, versuche: v };
}
