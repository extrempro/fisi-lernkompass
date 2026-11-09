import { describe, expect, it } from 'vitest';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { ladeInhalte } from '../content/store';

const quelle = fileURLToPath(new URL('../../content', import.meta.url));

function kopie() {
  const dir = mkdtempSync(join(tmpdir(), 'lk-ablauf-'));
  cpSync(quelle, dir, { recursive: true });
  return dir;
}

describe('Abläufe', () => {
  it('lädt Zustandstabellen, Kopien und eigene Spalten', () => {
    const i = ladeInhalte(quelle);
    const alle = i.themenfelder.flatMap((f) => f.zusatz).filter((z) => z.typ === 'ablauf');
    expect(alle.length >= 8).toBe(true);
    const sw = alle.find((z) => z.id === 'ablauf-arp-switching')!;
    const flood = sw.szenarien[0].schritte[2];
    expect(flood.ziele).toEqual([1, 4]);
    expect(sw.szenarien[0].schritte[4].tabelle?.neu).toEqual([1]);
    const tcp = alle.find((z) => z.id === 'ablauf-tcp')!;
    expect(tcp.szenarien[0].spalten).toEqual(['Feld', 'Wert', 'Bedeutung']);
  });

  it('meldet fehlerhafte Tabellen, Ziele und Spalten', () => {
    const dir = kopie();
    const datei = join(dir, 'zusatz', 'arp-switching.json');
    const daten = JSON.parse(readFileSync(datei, 'utf8'));
    const sz = daten.szenarien[0];
    sz.spalten = ['nur', 'zwei'];
    sz.schritte[2].ziele = [9];
    sz.schritte[1].tabelle.zeilen.push(['nur eine Spalte']);
    sz.schritte[1].tabelle.neu = [7];
    writeFileSync(datei, JSON.stringify(daten));
    const texte = ladeInhalte(dir)
      .meldungen.filter((m) => m.level === 'fehler')
      .map((m) => m.text);
    expect(texte.some((t) => t.includes('"spalten"'))).toBe(true);
    expect(texte.some((t) => t.includes('"ziele"'))).toBe(true);
    expect(texte.some((t) => t.includes('jede Zeile braucht 2 Spalten'))).toBe(true);
    expect(texte.some((t) => t.includes('"neu"'))).toBe(true);
  });
});
