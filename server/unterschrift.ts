import type { DB } from './db';
import { heute } from './datum';

/** Gezeichnete Unterschrift als SVG-Pfad (Zeichenfeld 600 × 200). */
export interface Unterschrift {
  id: number;
  rolle: 'ausbilder' | 'azubi';
  name: string;
  datum: string;
  pfad: string;
  erstellt: string;
}

export const MAX_PFAD = 60000;
// Nur Bewegen/Linie und Zahlen – kein Platz für Skripte oder fremde SVG-Befehle
const PFAD = /^[ML0-9 .-]+$/;

function istObjekt(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

export function pruefeUnterschrift(roh: unknown, rolle: Unterschrift['rolle']): Omit<Unterschrift, 'id' | 'erstellt'> | string {
  if (!istObjekt(roh)) return 'Unterschrift fehlt';
  const name = typeof roh.name === 'string' ? roh.name.trim() : '';
  if (!name || name.length > 200) return 'Bitte den Namen der unterschreibenden Person angeben';
  const pfad = typeof roh.pfad === 'string' ? roh.pfad.trim() : '';
  if (!pfad || pfad.length > MAX_PFAD || !PFAD.test(pfad) || !pfad.startsWith('M')) return 'Die Unterschrift ist leer oder ungültig';
  // eine echte Unterschrift hat mehrere Punkte
  if ((pfad.match(/L/g) ?? []).length < 5) return 'Die Unterschrift ist zu kurz – bitte im Feld unterschreiben';
  const datum = typeof roh.datum === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(roh.datum) ? roh.datum : heute();
  return { rolle, name, datum, pfad };
}

export function legeUnterschriftAn(db: DB, u: Omit<Unterschrift, 'id' | 'erstellt'>): Unterschrift {
  const r = db
    .prepare('INSERT INTO unterschrift (rolle, name, datum, pfad, erstellt) VALUES (?, ?, ?, ?, ?)')
    .run(u.rolle, u.name, u.datum, u.pfad, new Date().toISOString());
  return holeUnterschrift(db, Number(r.lastInsertRowid))!;
}

export function holeUnterschrift(db: DB, id: number): Unterschrift | undefined {
  return db.prepare('SELECT * FROM unterschrift WHERE id = ?').get(id) as Unterschrift | undefined;
}

export function alleUnterschriften(db: DB): Unterschrift[] {
  return db.prepare('SELECT * FROM unterschrift ORDER BY id').all() as unknown as Unterschrift[];
}

/** Entfernt Ausbilder-Unterschriften, die keinen Bericht mehr bestätigen (z. B. nach Änderung oder Löschen). */
export function raeumeUnterschriftenAuf(db: DB): void {
  db.exec(
    `DELETE FROM unterschrift WHERE rolle = 'ausbilder'
       AND id NOT IN (SELECT unterschrift_id FROM bericht WHERE unterschrift_id IS NOT NULL)`,
  );
}
