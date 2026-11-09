import { transaktion, type DB } from './db';
import type { Inhalte } from './content/store';
import { unterthemaIndex } from './content/store';
import { heute } from './datum';

export type Status = 'rot' | 'gelb' | 'gruen';
export const STATI: Status[] = ['rot', 'gelb', 'gruen'];

export interface UnterthemaStatus {
  unterthema_id: string;
  status: Status;
  luecke: string;
  notiz: string;
  inhalt_hash: string | null;
  geaendert: string;
}

export interface ZusatzStatus {
  zusatz_id: string;
  gelesen: number;
  geaendert: string;
}

export const EINSTELLUNGEN_STANDARD = {
  ausbildungsbeginn: '',
  zwischenpruefung: '',
  abschlusspruefung: '',
  theme: 'auto',
  gesehene_version: '',
  /** Vor dem Umstellen einer Ampel nachfragen ('ja' | 'nein') */
  ampel_bestaetigen: 'ja',
  /** Angaben für das Berichtsheft (Kopf jeder Seite und Deckblatt) */
  azubi_name: '',
  ausbildungsberuf: 'Fachinformatiker/in – Systemintegration',
  ausbildungsbetrieb: '',
  ausbilder: '',
  wochenstunden: '40',
  /** eigene hinterlegte Unterschrift auf jedem Nachweis mitdrucken ('ja' | 'nein') */
  azubi_unterschrift_drucken: 'nein',
  /** Verkürzung der Ausbildungszeit in Monaten (0–18, Regeldauer 36 Monate, Mindestdauer 18) */
  verkuerzung_monate: '0',
  /** 'ende' = Ausbildung endet früher, 'anfang' = Zeit wird am Anfang angerechnet (Start in höherem Ausbildungsjahr) */
  verkuerzung_art: 'ende',
  /** 'vertrag' = schon im Ausbildungsvertrag, 'nachtraeglich' = später beantragt */
  verkuerzung_zeitpunkt: 'vertrag',
  /** Grund der Verkürzung (Schlüssel, siehe src/lib/kalender.ts) */
  verkuerzung_grund: '',
  /** abweichendes Vertragsende JJJJ-MM-TT; leer = aus Beginn und Dauer berechnet */
  vertragsende: '',
  /** vorzeitige Zulassung zur Abschlussprüfung ('ja' | 'nein') */
  vorzeitige_zulassung: 'nein',
  /** Companion „Hoodie“ unten links ('an' | 'aus') */
  companion: 'an',
  /** wie oft der Hoodie etwas sagt ('selten' | 'normal' | 'gespraechig') */
  companion_haeufigkeit: 'normal',
} as const;

export type EinstellungsSchluessel = keyof typeof EINSTELLUNGEN_STANDARD;
export type Einstellungen = Record<EinstellungsSchluessel, string>;

export { heute } from './datum';

export function alleStatus(db: DB): Map<string, UnterthemaStatus> {
  const rows = db.prepare('SELECT * FROM unterthema_status').all() as unknown as UnterthemaStatus[];
  return new Map(rows.map((r) => [r.unterthema_id, r]));
}

export function alleZusatz(db: DB): Map<string, ZusatzStatus> {
  const rows = db.prepare('SELECT * FROM zusatz_status').all() as unknown as ZusatzStatus[];
  return new Map(rows.map((r) => [r.zusatz_id, r]));
}

export function holeStatus(db: DB, id: string): UnterthemaStatus | undefined {
  return db.prepare('SELECT * FROM unterthema_status WHERE unterthema_id = ?').get(id) as UnterthemaStatus | undefined;
}

export function speichereStatus(db: DB, s: UnterthemaStatus): void {
  db.prepare(
    `INSERT INTO unterthema_status (unterthema_id, status, luecke, notiz, inhalt_hash, geaendert)
     VALUES (@unterthema_id, @status, @luecke, @notiz, @inhalt_hash, @geaendert)
     ON CONFLICT(unterthema_id) DO UPDATE SET
       status = excluded.status, luecke = excluded.luecke, notiz = excluded.notiz,
       inhalt_hash = excluded.inhalt_hash, geaendert = excluded.geaendert`,
  ).run({ ...s });
}

export function speichereZusatz(db: DB, id: string, gelesen: boolean): void {
  db.prepare(
    `INSERT INTO zusatz_status (zusatz_id, gelesen, geaendert) VALUES (?, ?, ?)
     ON CONFLICT(zusatz_id) DO UPDATE SET gelesen = excluded.gelesen, geaendert = excluded.geaendert`,
  ).run(id, gelesen ? 1 : 0, heute());
}

export function leseEinstellungen(db: DB): Einstellungen {
  const rows = db.prepare('SELECT schluessel, wert FROM einstellungen').all() as { schluessel: string; wert: string | null }[];
  const e: Einstellungen = { ...EINSTELLUNGEN_STANDARD };
  for (const r of rows) {
    if (r.schluessel in e) e[r.schluessel as EinstellungsSchluessel] = r.wert ?? '';
  }
  return e;
}

export function schreibeEinstellungen(db: DB, werte: Partial<Einstellungen>): void {
  const stmt = db.prepare(
    `INSERT INTO einstellungen (schluessel, wert) VALUES (?, ?)
     ON CONFLICT(schluessel) DO UPDATE SET wert = excluded.wert`,
  );
  transaktion(db, () => {
    for (const [k, v] of Object.entries(werte)) stmt.run(k, v ?? '');
  });
}

/**
 * Überträgt den Lernstand alter IDs auf neue (content/umbenennungen.json) –
 * nur wenn die neue ID noch keinen eigenen Stand hat. Idempotent.
 */
export function wendeUmbenennungenAn(db: DB, inhalte: Inhalte, log: (m: string) => void = console.log): number {
  let n = 0;
  transaktion(db, () => {
    for (const [alt, neu] of Object.entries(inhalte.umbenennungen)) {
      for (const [tabelle, spalte] of [
        ['unterthema_status', 'unterthema_id'],
        ['zusatz_status', 'zusatz_id'],
      ] as const) {
        const hatAlt = db.prepare(`SELECT 1 FROM ${tabelle} WHERE ${spalte} = ?`).get(alt);
        const hatNeu = db.prepare(`SELECT 1 FROM ${tabelle} WHERE ${spalte} = ?`).get(neu);
        if (hatAlt && !hatNeu) {
          db.prepare(`UPDATE ${tabelle} SET ${spalte} = ? WHERE ${spalte} = ?`).run(neu, alt);
          n++;
        }
      }
    }
  });
  if (n) log(`Lernstand von ${n} umbenannten Einträgen übertragen`);
  return n;
}

/**
 * Übernimmt bei Unterthemen mit <!-- kein-hinweis --> den neuen Hash stillschweigend,
 * damit reine Korrekturen kein Etikett "Inhalt aktualisiert" auslösen.
 */
export function uebernehmeStilleAenderungen(db: DB, inhalte: Inhalte): void {
  const index = unterthemaIndex(inhalte);
  const stmt = db.prepare(
    "UPDATE unterthema_status SET inhalt_hash = ? WHERE unterthema_id = ? AND inhalt_hash IS NOT NULL AND inhalt_hash <> ?",
  );
  transaktion(db, () => {
    for (const [id, info] of index) if (info.keinHinweis) stmt.run(info.hash, id, info.hash);
  });
}
