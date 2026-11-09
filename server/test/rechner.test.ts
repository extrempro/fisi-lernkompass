import { describe, expect, it } from 'vitest';
import { RECHNER, pruefeAntwort, zahl } from '../../src/lib/rechner';
import { zufall } from '../../src/lib/training';

const R = Object.fromEntries(RECHNER.map((r) => [r.id, r]));
const std = (id: string) => Object.fromEntries(R[id].felder.map((f) => [f.key, f.standard]));
const werte = (id: string, e: Record<string, string>) => Object.fromEntries(R[id].rechne(e).werte.map((x) => [x.key, x.zahl ?? x.text]));
const rund = (n: unknown) => Math.round((n as number) * 100) / 100;

describe('Rechner', () => {
  it('Subnetting', () => {
    expect(werte('subnetting', std('subnetting'))).toMatchObject({ netz: '192.168.10.64', broadcast: '192.168.10.127', hosts: 62, maske: '255.255.255.192' });
    expect(werte('subnetting', { ip: '172.16.5.200', praefix: '22' })).toMatchObject({ netz: '172.16.4.0', broadcast: '172.16.7.255', hosts: 1022 });
    expect(R.subnetting.rechne({ ip: '300.1.1.1', praefix: '24' }).fehler).toMatch(/IPv4/);
  });
  it('Datenmengen, Übertragung, RAID, USV, Strom, Amortisation', () => {
    expect(rund(werte('datenmengen', std('datenmengen')).ziel)).toBe(465.66);
    expect(Math.round(werte('uebertragung', std('uebertragung')).sekunden as number)).toBe(752);
    expect(werte('raid', std('raid')).nutz).toBe(12);
    expect(werte('raid', { level: '10', anzahl: '6', groesse: '2' }).nutz).toBe(6);
    expect(R.raid.rechne({ level: '5', anzahl: '2', groesse: '4' }).fehler).toMatch(/mindestens 3/);
    const u = werte('usv', std('usv'));
    expect([u.watt, rund(u.minuten)]).toEqual([900, 51.84]);
    const s = werte('strom', std('strom'));
    expect([s.kwh, rund(s.euro)]).toEqual([114.4, 36.61]);
    expect(rund(werte('amortisation', std('amortisation')).jahre)).toBe(2.67);
  });
  it('Plattenbedarf, Archiv, VoIP, Verfügbarkeit', () => {
    expect(werte('raidBedarf', std('raidBedarf')).gesamt).toBe(8);
    expect(werte('raidBedarf', { bedarf: '13', groesse: '2', level: '6', spare: '1' }).gesamt).toBe(10);
    expect(werte('raidBedarf', { bedarf: '3', groesse: '2', level: '10', spare: '0' }).gesamt).toBe(4);
    expect(R.raidBedarf.rechne({ bedarf: '3', groesse: '2', level: '1', spare: '0' }).fehler).toMatch(/RAID 10/);
    const a = werte('archiv', std('archiv'));
    expect([a.gesamt, a.jahr, a.reicht]).toEqual([1440, 144, 7]);
    const v = werte('voip', std('voip'));
    expect([v.proVerbindung, v.verbindungen, v.gesamt]).toEqual([80, 18, 1440]);
    expect(rund(werte('voip', { codec: 'g722', bitrate: '', overhead: '15', intern: '3', extern: '12', cloud: 'cloud' }).gesamt)).toBe(1324.8);
    expect(werte('voip', { codec: 'g711', bitrate: '', overhead: '10', intern: '5', extern: '15', cloud: 'lokal' }).verbindungen).toBe(15);
    expect(rund(werte('verfuegbarkeit', std('verfuegbarkeit')).stunden)).toBe(8.76);
    expect(rund(werte('verfuegbarkeit', { richtung: 'prozent', prozent: '', stunden: '87.6' }).prozent)).toBe(99);
  });
  it('Eingaben und Prüfen', () => {
    expect([zahl('1.234,5'), zahl('0,6'), zahl('12.5')]).toEqual([1234.5, 0.6, 12.5]);
    expect(pruefeAntwort({ key: 'x', label: '', text: '', zahl: 465.66 }, '465,7')).toBe(true);
    expect(pruefeAntwort({ key: 'x', label: '', text: '', zahl: 465.66 }, '470')).toBe(false);
    expect(pruefeAntwort({ key: 'x', label: '', text: '10.0.0.0' }, ' 10.0.0.0 ')).toBe(true);
  });
  it('jede Übungsaufgabe ist rechenbar', () => {
    for (const r of RECHNER) {
      for (let i = 0; i < 100; i++) {
        const a = r.aufgabe(zufall(i * 7 + 1));
        const e = r.rechne(a.eingaben);
        expect(e.fehler).toBeUndefined();
        for (const g of a.gefragt) expect(e.werte.some((w) => w.key === g)).toBe(true);
      }
    }
  });
});
