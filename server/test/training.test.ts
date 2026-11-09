import { describe, expect, it } from 'vitest';
import { DatabaseSync as Database } from '../sqlite';
import { loadMigrations, migrate } from '../db';
import { alleKarten, alleVersuche, beantworte, ersetzeTraining, istKartenId, naechsterStand, pruefeVersuch, speichereVersuch } from '../training';

async function neueDb() {
  const db = new Database(':memory:');
  await migrate(db, null, loadMigrations(), () => {});
  return db;
}

describe('Prüfungstraining', () => {
  it('Leitner: gewusst → nächstes Fach, nicht gewusst → Fach 1', () => {
    let s = naechsterStand(undefined, 'f:a.b', true, '2026-11-05');
    expect([s.fach, s.faellig]).toEqual([2, '2026-11-07']);
    s = naechsterStand(s, 'f:a.b', true, '2026-11-07');
    expect([s.fach, s.faellig]).toEqual([3, '2026-11-12']);
    for (let i = 0; i < 5; i++) s = naechsterStand(s, 'f:a.b', true, '2026-11-12');
    expect(s.fach).toBe(5);
    s = naechsterStand(s, 'f:a.b', false, '2026-11-12');
    expect([s.fach, s.faellig, s.falsch]).toEqual([1, '2026-11-13', 1]);
  });

  it('prüft Karten-IDs', () => {
    expect(istKartenId('b:netzwerkgrundlagen.subnetting:Broadcast')).toBe(true);
    expect(istKartenId('f:netzwerkgrundlagen.subnetting')).toBe(true);
    expect(istKartenId('x:a.b')).toBe(false);
    expect(istKartenId('f:a')).toBe(false);
    expect(istKartenId('b:a.b:' + 'x'.repeat(201))).toBe(false);
  });

  it('speichert Antworten und überspringt Unsinn', async () => {
    const db = await neueDb();
    beantworte(db, [{ id: 'f:a.b', gewusst: true }, { id: 'kaputt', gewusst: true }, { id: 'f:a.c', gewusst: 'ja' }, null]);
    beantworte(db, [{ id: 'f:a.b', gewusst: true }]);
    const k = alleKarten(db);
    expect(k).toHaveLength(1);
    expect([k[0].fach, k[0].richtig]).toEqual([3, 2]);
  });

  it('Versuche: Prüfung und Speichern', async () => {
    const db = await neueDb();
    expect(pruefeVersuch({ pruefung: 'AP3', fragen: 10, richtig: 5, dauer: 60 })).toMatch(/AP1/);
    expect(pruefeVersuch({ pruefung: 'AP1', fragen: 10, richtig: 11, dauer: 60 })).toMatch(/Zahlen/);
    const v = pruefeVersuch({ pruefung: 'AP1', fragen: 10, richtig: 7, dauer: 600, felder: { hardware: [3, 4], 'BÖSE': [1, 1], netz: [5, 2] } });
    if (typeof v === 'string') throw new Error(v);
    expect(v.felder).toEqual({ hardware: [3, 4] });
    speichereVersuch(db, v);
    expect(alleVersuche(db)[0].richtig).toBe(7);
  });

  it('Import ersetzt Karten und Versuche', async () => {
    const db = await neueDb();
    beantworte(db, [{ id: 'f:a.b', gewusst: true }]);
    const r = ersetzeTraining(db, [{ id: 'f:x.y', fach: 4, faellig: '2026-12-01', richtig: 3, falsch: 1, zuletzt: '2026-11-01' }, { id: '!!' }], [
      { pruefung: 'AP2', datum: '2026-10-01', fragen: 30, richtig: 20, dauer: 1800 },
    ]);
    expect(r).toEqual({ karten: 1, versuche: 1 });
    expect(alleKarten(db).map((x) => x.id)).toEqual(['f:x.y']);
    expect(alleVersuche(db)[0].datum).toBe('2026-10-01');
  });
});
