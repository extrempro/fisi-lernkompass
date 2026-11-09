import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { ladeInhalte } from '../content/store';
import { WERKZEUGE } from '../../src/lib/werkzeugListe';
import {
  cronNaechste,
  cronParsen,
  firewallPruefen,
  join,
  netzplan,
  nutzwert,
  raidBloecke,
  raidZustand,
  rechteAusOktal,
  rechteSymbolisch,
  rechteZuOktal,
  sicherungsInhalt,
  umaskRechte,
  wiederherstellung,
  type FwRegel,
} from '../../src/lib/werkzeuge';

describe('RAID', () => {
  it('erkennt degradiert und Datenverlust', () => {
    expect(raidZustand('5', 4, [1]).status).toBe('degradiert');
    expect(raidZustand('5', 4, [1, 2]).status).toBe('verloren');
    expect(raidZustand('6', 5, [0, 3]).status).toBe('degradiert');
    expect(raidZustand('0', 2, [0]).status).toBe('verloren');
    expect(raidZustand('10', 4, [0, 2]).status).toBe('degradiert');
    expect(raidZustand('10', 4, [2, 3]).status).toBe('verloren');
    expect(raidZustand('1', 2, [1]).status).toBe('degradiert');
    expect(raidZustand('6', 6, []).nutzbar).toBe(4);
  });
  it('verteilt die Parität reihum', () => {
    const b = raidBloecke('5', 3, 3);
    expect(b.map((p) => p[0].text)).toEqual(['A1', 'A2', 'Ap']);
    expect(b.map((p) => p[1].text)).toEqual(['B1', 'Bp', 'B2']);
  });
});

describe('Backup', () => {
  it('Archivbit: inkrementell nach differenziell sichert seit der letzten Rücksetzung', () => {
    const plan = ['voll', 'diff', 'inkr', 'diff', 'diff', 'keine', 'keine'] as const;
    const s = sicherungsInhalt([...plan]);
    expect(s[1].ab).toBe(1);
    expect(s[2].ab).toBe(1); // Inkr. Mi enthält Di und Mi
    expect(s[4].ab).toBe(3); // Diff. Fr seit Do
    const w = wiederherstellung([...plan], 4);
    expect(w.kette).toEqual([0, 2, 4]);
  });
  it('täglich inkrementell braucht die ganze Kette', () => {
    const w = wiederherstellung(['voll', 'inkr', 'inkr', 'inkr', 'inkr', 'keine', 'keine'], 6);
    expect(w.kette).toEqual([0, 1, 2, 3, 4]);
    expect(w.text.includes('verloren')).toBe(true);
  });
  it('täglich differenziell braucht Voll + letzte', () => {
    expect(wiederherstellung(['voll', 'diff', 'diff', 'diff', 'keine', 'keine', 'keine'], 3).kette).toEqual([0, 3]);
  });
  it('ohne Vollsicherung geht nichts', () => {
    expect(wiederherstellung(['keine', 'inkr', 'voll', 'inkr', 'inkr', 'keine', 'keine'], 1).moeglich).toBe(false);
  });
});

describe('Firewall', () => {
  const regeln: FwRegel[] = [
    { aktion: 'erlauben', proto: 'tcp', quelle: 'any', ziel: '192.168.100.10/32', port: '80,443', name: 'Web' },
    { aktion: 'erlauben', proto: 'tcp', quelle: '192.168.1.0/24', ziel: 'any', port: '22', name: 'SSH aus LAN' },
    { aktion: 'verwerfen', proto: 'alle', quelle: 'any', ziel: 'any', port: 'any', name: 'Rest' },
  ];
  it('first match', () => {
    expect(firewallPruefen(regeln, { proto: 'tcp', quelle: '8.8.8.8', ziel: '192.168.100.10', port: '443' }).treffer).toBe(0);
    const ssh = firewallPruefen(regeln, { proto: 'tcp', quelle: '192.168.1.50', ziel: '192.168.100.10', port: '22' });
    expect(ssh.treffer).toBe(1);
    expect(ssh.regeln[0]?.port).toBe(false);
    const fremd = firewallPruefen(regeln, { proto: 'tcp', quelle: '8.8.8.8', ziel: '192.168.100.10', port: '22' });
    expect([fremd.treffer, fremd.aktion]).toEqual([2, 'verwerfen']);
  });
  it('default deny ohne passende Regel', () => {
    const r = firewallPruefen(regeln.slice(0, 2), { proto: 'udp', quelle: '1.2.3.4', ziel: '5.6.7.8', port: '53' });
    expect([r.treffer, r.aktion]).toEqual([null, 'verwerfen']);
  });
});

describe('Netzplan', () => {
  it('berechnet Puffer und kritischen Pfad', () => {
    const { zeiten, dauer } = netzplan([
      { id: 'A', name: '', dauer: 3, vorgaenger: [] },
      { id: 'B', name: '', dauer: 2, vorgaenger: ['A'] },
      { id: 'C', name: '', dauer: 5, vorgaenger: ['A'] },
      { id: 'D', name: '', dauer: 1, vorgaenger: ['B', 'C'] },
    ]);
    expect(dauer).toBe(9);
    const b = zeiten.find((z) => z.id === 'B')!;
    expect([b.faz, b.fez, b.saz, b.sez, b.gp, b.fp]).toEqual([3, 5, 6, 8, 3, 3]);
    expect(zeiten.filter((z) => z.kritisch).map((z) => z.id)).toEqual(['A', 'C', 'D']);
  });
  it('meldet Kreise und unbekannte Vorgänger', () => {
    expect(netzplan([{ id: 'A', name: '', dauer: 1, vorgaenger: ['B'] }, { id: 'B', name: '', dauer: 1, vorgaenger: ['A'] }]).fehler?.includes('Kreis')).toBe(true);
    expect(netzplan([{ id: 'A', name: '', dauer: 1, vorgaenger: ['X'] }]).fehler?.includes('X')).toBe(true);
  });
});

describe('JOIN', () => {
  const k = [[1, 'Meier'], [2, 'Schulz'], [3, 'Yilmaz']];
  const b = [[10, 1], [11, 1], [12, 3], [13, null]];
  it('inner, left, right, full, cross', () => {
    expect(join(k, b, 0, 1, 'INNER')).toHaveLength(3);
    expect(join(k, b, 0, 1, 'LEFT')).toHaveLength(4);
    expect(join(k, b, 0, 1, 'RIGHT')).toHaveLength(4);
    expect(join(k, b, 0, 1, 'FULL')).toHaveLength(5);
    expect(join(k, b, 0, 1, 'CROSS')).toHaveLength(12);
    expect(join(k, b, 0, 1, 'LEFT').find((z) => z.links === 1)?.rechts).toBe(null);
  });
});

describe('Rechte', () => {
  it('oktal und symbolisch', () => {
    const r = rechteAusOktal('4755')!;
    expect(rechteSymbolisch(r)).toBe('-rwsr-xr-x');
    expect(rechteZuOktal(r)).toBe('4755');
    expect(rechteSymbolisch(rechteAusOktal('1777')!, true)).toBe('drwxrwxrwt');
    expect(rechteSymbolisch(rechteAusOktal('2640')!)).toBe('-rw-r-S---');
    expect(rechteZuOktal(rechteAusOktal('640')!)).toBe('640');
    expect(rechteAusOktal('789')).toBe(null);
  });
  it('umask', () => {
    expect(umaskRechte('022')).toEqual({ datei: '644', verzeichnis: '755' });
    expect(umaskRechte('0027')).toEqual({ datei: '640', verzeichnis: '750' });
  });
});

describe('Cron', () => {
  it('erklärt Ausdrücke', () => {
    expect(cronParsen('30 2 * * 1-5').text).toBe('um 02:30 Uhr, Montag bis Freitag');
    expect(cronParsen('*/15 * * * *').text).toBe('alle 15 Minuten');
    expect(cronParsen('0 3 1 * *').text).toBe('um 03:00 Uhr, am 1. des Monats');
    expect(cronParsen('@reboot').neustart).toBe(true);
    expect(cronParsen('0 0 * *').fehler?.includes('fünf')).toBe(true);
    expect(cronParsen('61 * * * *').fehler?.includes('Minute')).toBe(true);
    expect(cronParsen('0 8,12,18 * * *').text).toBe('um 08:00, 12:00 und 18:00 Uhr, jeden Tag');
  });
  it('findet die nächsten Läufe', () => {
    const n = cronNaechste(cronParsen('30 2 * * 1-5'), new Date(2026, 10, 6, 12, 0), 3); // Fr 6.11.2026
    expect(n.map((d) => `${d.getDate()}.${d.getHours()}:${d.getMinutes()}`)).toEqual(['9.2:30', '10.2:30', '11.2:30']);
    const m = cronNaechste(cronParsen('0 0 13 * 5'), new Date(2026, 10, 6, 12, 0), 2);
    expect(m.map((d) => d.getDate())).toEqual([13, 20]);
  });
});

describe('Nutzwert', () => {
  it('rechnet und vergibt Ränge', () => {
    const n = nutzwert([50, 30, 20], [[8, 6, 4], [6, 9, 7]]);
    expect(n.summeGewicht).toBe(100);
    expect(n.ergebnisse.map((e) => e.summe)).toEqual([6.6, 7.1]);
    expect(n.ergebnisse.map((e) => e.rang)).toEqual([2, 1]);
  });
});

describe('Werkzeug-Liste', () => {
  it('verweist nur auf vorhandene Unterthemen', () => {
    const i = ladeInhalte(fileURLToPath(new URL('../../content', import.meta.url)));
    const ids = new Set(i.themenfelder.flatMap((f) => f.unterthemen.map((u) => `${f.id}.${u.id}`)));
    const fehlend = WERKZEUGE.flatMap((w) => w.zu.filter((z) => !ids.has(z)));
    expect(fehlend).toEqual([]);
  });
});
