import { describe, expect, it } from 'vitest';
import { DatabaseSync as Database } from '../sqlite';
import { loadMigrations, migrate } from '../db';
import { leeresProjekt, leseProjekt, pruefeProjekt, speichereProjekt } from '../projekt';

describe('Abschlussprojekt', () => {
  it('startet mit 40 Stunden Standardplanung', () => {
    expect(leeresProjekt().phasen.reduce((n, p) => n + p.soll, 0)).toBe(40);
  });

  it('prüft und bereinigt', () => {
    const p = pruefeProjekt({
      titel: 'Einführung eines Monitorings',
      termine: { antrag: '2027-01-15', start: '2027-03-01', unbekannt: '2027-01-01', doku: '' },
      antrag: { thema: true, ziel: false, 'BÖSE KEY': true },
      phasen: [{ name: 'Analyse', soll: 4.1, ist: '3' }],
      fragen: { alternativen: 'Zabbix vs. PRTG', leer: '' },
      geheim: 'weg',
    });
    if (typeof p === 'string') throw new Error(p);
    expect(p.termine).toEqual({ antrag: '2027-01-15', start: '2027-03-01' });
    expect(p.antrag).toEqual({ thema: true });
    expect(p.phasen).toEqual([{ name: 'Analyse', soll: 4, ist: 3 }]);
    expect(p.fragen).toEqual({ alternativen: 'Zabbix vs. PRTG' });
    expect('geheim' in p).toBe(false);
    expect(pruefeProjekt({ termine: { antrag: '15.01.2027' } })).toMatch(/Datum/);
    expect(pruefeProjekt({ phasen: [{ name: 'x', soll: -1 }] })).toMatch(/Stunden/);
    expect(pruefeProjekt({ titel: 'x'.repeat(301) })).toMatch(/zu lang/);
  });

  it('speichert und liest; kaputte Daten führen zum leeren Projekt', async () => {
    const db = new Database(':memory:');
    await migrate(db, null, loadMigrations(), () => {});
    expect(leseProjekt(db).titel).toBe('');
    const p = pruefeProjekt({ titel: 'Test' });
    if (typeof p === 'string') throw new Error(p);
    speichereProjekt(db, p);
    expect(leseProjekt(db).titel).toBe('Test');
    db.prepare("UPDATE projekt SET daten = 'kaputt'").run();
    expect(leseProjekt(db).phasen).toHaveLength(6);
  });
});
