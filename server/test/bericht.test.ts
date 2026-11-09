import { describe, expect, it } from 'vitest';
import { DatabaseSync as Database } from '../sqlite';
import { loadMigrations, migrate } from '../db';
import { alleBerichte, ersetzeBerichte, holeBericht, loescheBericht, pruefeBericht, speichereBericht, zeichneAb } from '../bericht';
import { legeUnterschriftAn, pruefeUnterschrift, raeumeUnterschriftenAuf } from '../unterschrift';

async function neueDb() {
  const db = new Database(':memory:');
  await migrate(db, null, loadMigrations(), () => {});
  return db;
}

const KW44 = '2026-10-26';
const beispiel = {
  status: 'entwurf',
  inhalt: {
    betrieb: [
      { text: ' Tickets bearbeitet ', stunden: 12 },
      { text: 'Notebooks eingerichtet', stunden: '10,5' },
      { text: '', stunden: 0 },
    ],
    unterweisung: [{ text: 'Datenschutz', stunden: 1 }],
    abwesenheit: [{ tag: '2026-10-30', grund: 'urlaub', stunden: 8 }],
  },
};

function ok<T>(x: T | string): T {
  if (typeof x === 'string') throw new Error(x);
  return x;
}

describe('Berichtsheft', () => {
  it('prüft und bereinigt einen Bericht', () => {
    const b = ok(pruefeBericht(KW44, beispiel));
    expect(b.inhalt.betrieb).toEqual([
      { text: 'Tickets bearbeitet', stunden: 12 },
      { text: 'Notebooks eingerichtet', stunden: 10.5 },
    ]);
    expect(b.inhalt.schule).toEqual([]);
    expect(b.abgezeichnetAm).toBe(null);
    expect(b.inhalt.abwesenheit[0]).toEqual({ tag: '2026-10-30', grund: 'urlaub', stunden: 8, text: '' });
  });

  it('lehnt Ungültiges ab', () => {
    const f = (montag: string, body: unknown) => pruefeBericht(montag, body);
    expect(f('2026-10-27', beispiel)).toMatch(/Montag/);
    expect(f(KW44, { status: 'egal' })).toMatch(/status/);
    expect(f(KW44, { inhalt: { betrieb: [{ text: 'x', stunden: 99 }] } })).toMatch(/Stunden/);
    expect(f(KW44, { inhalt: { betrieb: [{ text: 'x', stunden: 'viel' }] } })).toMatch(/Stunden/);
    expect(f(KW44, { inhalt: { betrieb: 'x' } })).toMatch(/Liste/);
    expect(f(KW44, { inhalt: { betrieb: [{ text: 'x'.repeat(301) }] } })).toMatch(/höchstens/);
    expect(f(KW44, { inhalt: { abwesenheit: [{ tag: '2026-11-02', grund: 'urlaub', stunden: 8 }] } })).toMatch(/Berichtswoche/);
    expect(f(KW44, { inhalt: { abwesenheit: [{ tag: '2026-10-28', grund: 'party', stunden: 8 }] } })).toMatch(/Grund/);
  });

  it('abgezeichnet bekommt ein Datum, sonst keins', () => {
    expect(ok(pruefeBericht(KW44, { status: 'abgezeichnet', abgezeichnetAm: '2026-11-03' })).abgezeichnetAm).toBe('2026-11-03');
    expect(ok(pruefeBericht(KW44, { status: 'abgezeichnet' })).abgezeichnetAm).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(ok(pruefeBericht(KW44, { status: 'fertig', abgezeichnetAm: '2026-11-03' })).abgezeichnetAm).toBe(null);
  });

  it('speichert, überschreibt, zeichnet ab und löscht', async () => {
    const db = await neueDb();
    speichereBericht(db, ok(pruefeBericht(KW44, beispiel)));
    speichereBericht(db, ok(pruefeBericht(KW44, { ...beispiel, status: 'fertig' })));
    speichereBericht(db, ok(pruefeBericht('2026-10-19', { status: 'fertig' })));
    expect(alleBerichte(db).map((b) => b.montag)).toEqual(['2026-10-19', KW44]);
    expect(holeBericht(db, KW44)!.status).toBe('fertig');
    expect(holeBericht(db, KW44)!.inhalt.betrieb).toHaveLength(2);

    expect(zeichneAb(db, ['2026-10-19', KW44, '2026-01-05'], '2026-11-02')).toBe(2);
    expect(zeichneAb(db, [KW44], '2026-11-09')).toBe(0); // schon abgezeichnet: Datum bleibt
    expect(holeBericht(db, KW44)!.abgezeichnetAm).toBe('2026-11-02');

    expect(loescheBericht(db, KW44)).toBe(true);
    expect(loescheBericht(db, KW44)).toBe(false);
  });

  it('Import ersetzt alles und überspringt Kaputtes; beschädigtes JSON stürzt nicht ab', async () => {
    const db = await neueDb();
    speichereBericht(db, ok(pruefeBericht('2026-01-05', { status: 'fertig' })));
    const n = ersetzeBerichte(db, [{ montag: KW44, ...beispiel }, { montag: '2026-10-28', status: 'fertig' }, 'Unsinn', { status: 'fertig' }]);
    expect(n).toBe(1);
    expect(alleBerichte(db).map((b) => b.montag)).toEqual([KW44]);
    db.prepare("UPDATE bericht SET inhalt = 'kaputt'").run();
    expect(alleBerichte(db)[0].inhalt.betrieb).toEqual([]);
  });
});

describe('Digitale Unterschrift', () => {
  const PFAD = 'M10 10 L20 20 L30 15 L40 30 L50 25 L60 40 L70 35';

  it('prüft den Unterschriftspfad streng', () => {
    expect(typeof pruefeUnterschrift({ name: 'Frau Muster', pfad: PFAD }, 'ausbilder')).toBe('object');
    expect(pruefeUnterschrift({ name: '', pfad: PFAD }, 'ausbilder')).toMatch(/Namen/);
    expect(pruefeUnterschrift({ name: 'X', pfad: 'M1 1 L2 2' }, 'ausbilder')).toMatch(/kurz/);
    expect(pruefeUnterschrift({ name: 'X', pfad: PFAD + '"/><script>' }, 'ausbilder')).toMatch(/ungültig/);
    expect(pruefeUnterschrift({ name: 'X', pfad: 'C1 2 3 4 5 6' }, 'ausbilder')).toMatch(/ungültig/);
  });

  it('zeichnet mit Unterschrift ab; eine Änderung entfernt sie wieder', async () => {
    const db = await neueDb();
    speichereBericht(db, ok(pruefeBericht(KW44, { ...beispiel, status: 'fertig' })));
    speichereBericht(db, ok(pruefeBericht('2026-10-19', { status: 'entwurf' })));
    const u = legeUnterschriftAn(db, ok(pruefeUnterschrift({ name: 'Frau Muster', pfad: PFAD, datum: '2026-11-02' }, 'ausbilder')));
    expect(zeichneAb(db, [KW44, '2026-10-19'], '2026-11-02', u.id)).toBe(1); // Entwürfe werden nicht abgezeichnet
    const b = holeBericht(db, KW44)!;
    expect(b.status).toBe('abgezeichnet');
    expect(b.unterschrift?.name).toBe('Frau Muster');

    // unverändert speichern: Unterschrift bleibt
    const gleich = speichereBericht(db, ok(pruefeBericht(KW44, { ...beispiel, status: 'abgezeichnet', abgezeichnetAm: '2026-11-02' })));
    expect(gleich.unterschriftEntfernt).toBe(false);
    expect(gleich.unterschrift).toBeTruthy();

    // Inhalt ändern: Unterschrift weg, Status zurück auf fertig
    const neu = speichereBericht(
      db,
      ok(pruefeBericht(KW44, { status: 'abgezeichnet', inhalt: { betrieb: [{ text: 'nachträglich', stunden: 40 }] } })),
    );
    expect(neu.unterschriftEntfernt).toBe(true);
    expect(neu.status).toBe('fertig');
    expect(neu.unterschrift).toBe(null);
    raeumeUnterschriftenAuf(db);
    expect(db.prepare('SELECT COUNT(*) AS n FROM unterschrift').get()).toEqual({ n: 0 });
  });

  it('Import legt Unterschriften wieder an, eine pro Sammel-Abzeichnung', async () => {
    const db = await neueDb();
    const u = { name: 'Frau Muster', datum: '2026-11-02', pfad: PFAD };
    ersetzeBerichte(db, [
      { montag: KW44, status: 'abgezeichnet', abgezeichnetAm: '2026-11-02', unterschrift: u },
      { montag: '2026-10-19', status: 'abgezeichnet', abgezeichnetAm: '2026-11-02', unterschrift: u },
      { montag: '2026-10-12', status: 'fertig', unterschrift: u },
    ]);
    expect(alleBerichte(db).map((b) => !!b.unterschrift)).toEqual([false, true, true]);
    expect(db.prepare('SELECT COUNT(*) AS n FROM unterschrift').get()).toEqual({ n: 1 });
  });
});
