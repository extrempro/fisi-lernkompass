import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { parseThemaMarkdown } from '../content/parse';
import { bereinigeSvg, ladeInhalte } from '../content/store';
import { parseChangelog } from '../changelog';

const beispiel = `---
titel: Test
---

Einleitung.

## Subnetting {#subnetting}

### Kernbegriffe
- **Netzadresse:** Erste Adresse.

### Tabelle: Präfixe
| Präfix | Hosts |
| --- | --- |
| /24 | 254 |

### Befehle
- \`ipconfig /all\` – Konfiguration

### Merksatz
Kurz und knapp.

### Prüfungsfrage
Wie viele Hosts hat /26?

1. 2^6 = 64
2. minus 2 = 62

## Leer {#leer}

## Häufige Fehler
- Fehler eins

## Links
- [Beispiel](https://example.org) – Info
`;

describe('parseThemaMarkdown', () => {
  it('liest alle Abschnitte', () => {
    const { thema, meldungen } = parseThemaMarkdown(beispiel, 'test.md');
    expect(meldungen.filter((m) => m.level === 'fehler')).toEqual([]);
    expect(thema.titel).toBe('Test');
    expect(thema.worum).toBe('Einleitung.');
    expect(thema.unterthemen.map((u) => u.id)).toEqual(['subnetting', 'leer']);
    const u = thema.unterthemen[0];
    expect(u.begriffe).toEqual([{ begriff: 'Netzadresse', erklaerung: 'Erste Adresse.' }]);
    expect(u.tabellen[0]).toEqual({ titel: 'Präfixe', kopf: ['Präfix', 'Hosts'], zeilen: [['/24', '254']] });
    expect(u.befehle).toEqual([{ befehl: 'ipconfig /all', info: 'Konfiguration' }]);
    expect(u.merksatz).toBe('Kurz und knapp.');
    expect(u.frage?.loesung).toHaveLength(2);
    expect(thema.unterthemen[1].hatInhalt).toBe(false);
    expect(thema.fehler).toEqual(['Fehler eins']);
    expect(thema.links[0].url).toBe('https://example.org');
  });

  it('meldet fehlende IDs und kaputte Tabellen mit Zeilennummer', () => {
    const kaputt = beispiel.replace('## Leer {#leer}', '## Ohne ID').replace('| /24 | 254 |', '| /24 |');
    const { meldungen } = parseThemaMarkdown(kaputt, 'test.md');
    const texte = meldungen.filter((m) => m.level === 'fehler').map((m) => m.text);
    expect(texte.some((t) => t.includes('keine ID'))).toBe(true);
    expect(texte.some((t) => t.includes('1 statt 2 Spalten'))).toBe(true);
    expect(meldungen.every((m) => m.level !== 'fehler' || typeof m.zeile === 'number')).toBe(true);
  });

  it('Hash ändert sich nur bei Inhaltsänderung, nicht beim Titel', () => {
    const a = parseThemaMarkdown(beispiel, 't.md').thema.unterthemen[0].hash;
    const b = parseThemaMarkdown(beispiel.replace('## Subnetting {#subnetting}', '## Subnetze {#subnetting}'), 't.md')
      .thema.unterthemen[0].hash;
    const c = parseThemaMarkdown(beispiel.replace('Kurz und knapp.', 'Anders.'), 't.md').thema.unterthemen[0].hash;
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});

describe('Zusatz: Abschnitts-Varianten', () => {
  const kopf = `---\ntitel: T\n---\n\nIntro.\n\n## A {#a}\n\n### Merksatz\nX.\n\n## B {#b}\n\n### Merksatz\nY.\n\n`;

  it('liest Checkliste und Vergleich als Abschnitte und löst "zu" auf', () => {
    const md = `${kopf}## Zusatz: Z {#z}\ntyp: text\nzu: a, anderes.feld\n\nEinleitung.\n\n### Checkliste: Rechte\nWarum.\n- Punkt 1\n- Punkt 2\n\n### Vergleich: Modelle\nKurz erklärt.\n\n#### Eins\n![Schema eins](arch-p2p.svg)\n- **Kurz:** K1\n\n#### Zwei\n- **Kurz:** K2\n- **Plus:** P\n`;
    const { thema, meldungen } = parseThemaMarkdown(md, 'z.md');
    expect(meldungen.filter((m) => m.level === 'fehler')).toEqual([]);
    const z = thema.zusatz[0];
    expect(z.typ).toBe('text');
    expect(z.zu).toEqual(['a', 'anderes.feld']);
    expect(z.abschnitte[0]).toEqual({
      art: 'checkliste', titel: 'Rechte', absaetze: ['Warum.'], bilder: [], tabelle: null, punkte: ['Punkt 1', 'Punkt 2'], schritte: [], karten: [],
    });
    const v = z.abschnitte[1];
    expect(v.art).toBe('vergleich');
    expect(v.titel).toBe('Modelle');
    expect(v.absaetze).toEqual(['Kurz erklärt.']);
    expect(v.karten.map((k) => k.titel)).toEqual(['Eins', 'Zwei']);
    expect(v.karten[0].bild?.datei).toBe('arch-p2p.svg');
    expect(v.karten[1].plus).toBe('P');
  });

  it('liest das alte Format weiter und weist darauf hin', () => {
    const md = `${kopf}## Zusatz: V {#v}\ntyp: vergleich\n\nIntro.\n\n### Karte\n- **Kurz:** K\n\n## Zusatz: C {#c}\ntyp: checkliste\n\nIntro.\n\n### Bereich\n- Punkt\n`;
    const { thema, meldungen } = parseThemaMarkdown(md, 'alt.md');
    expect(meldungen.filter((m) => m.level === 'fehler')).toEqual([]);
    expect(meldungen.filter((m) => m.text.includes('veraltet'))).toHaveLength(2);
    expect(thema.zusatz[0].abschnitte[0].karten[0].kurz).toBe('K');
    expect(thema.zusatz[1].abschnitte[0].art).toBe('checkliste');
    expect(thema.zusatz[1].abschnitte[0].punkte).toEqual(['Punkt']);
  });
});

describe('Verknüpfung "zu"', () => {
  it('meldet unbekannte Unterthemen', async () => {
    const { mkdtempSync, mkdirSync, writeFileSync, cpSync } = await import('node:fs');
    const { join } = await import('node:path');
    const { tmpdir } = await import('node:os');
    const quelle = fileURLToPath(new URL('../../content', import.meta.url));
    const dir = mkdtempSync(join(tmpdir(), 'lk-'));
    cpSync(quelle, dir, { recursive: true });
    const datei = join(dir, 'themen', 'hardware.md');
    const { readFileSync } = await import('node:fs');
    writeFileSync(datei, readFileSync(datei, 'utf8').replace('zu: pc-komponenten', 'zu: gibt-es-nicht'));
    mkdirSync(join(dir, 'zusatz'), { recursive: true });
    const i = ladeInhalte(dir);
    const texte = i.meldungen.filter((m) => m.level === 'fehler').map((m) => m.text);
    expect(texte.some((t) => t.includes('hardware.gibt-es-nicht'))).toBe(true);
    const mb = i.themenfelder.find((f) => f.id === 'hardware')!.zusatz[0];
    expect(mb.zu.includes('betriebssysteme.bootprozess')).toBe(true);
  });
});

describe('Abbildungen', () => {
  it('liest Abbildungen und Bilder in Vergleichskarten', () => {
    const md = `---\ntitel: T\n---\n\nIntro.\n\n## A {#a}\n\n### Abbildung: Topologien\n![Stern mit Switch](topo-stern.svg)\n![Ring](topo-ring.svg)\n\n## Zusatz: V {#v}\ntyp: vergleich\n\nIntro.\n\n### Karte\n![Schema der Karte](arch-p2p.svg)\n- **Kurz:** K\n`;
    const { thema, meldungen } = parseThemaMarkdown(md, 'b.md');
    expect(meldungen.filter((m) => m.level === 'fehler')).toEqual([]);
    expect(meldungen.filter((m) => m.text.includes('veraltet'))).toHaveLength(1);
    const u = thema.unterthemen[0];
    expect(u.hatInhalt).toBe(true);
    expect(u.abbildungen).toEqual([
      {
        titel: 'Topologien',
        bilder: [
          { alt: 'Stern mit Switch', datei: 'topo-stern.svg', svg: '' },
          { alt: 'Ring', datei: 'topo-ring.svg', svg: '' },
        ],
      },
    ]);
    expect(thema.zusatz[0].abschnitte[0].karten[0].bild?.datei).toBe('arch-p2p.svg');
  });

  it('meldet ungültige Bilder', () => {
    const md = `---\ntitel: T\n---\n\nIntro.\n\n## A {#a}\n\n### Abbildung: X\n![](leer.svg)\n![Foto](foto.png)\nText\n`;
    const texte = parseThemaMarkdown(md, 'b.md').meldungen.map((m) => m.text);
    expect(texte.some((t) => t.includes('ohne Beschreibung'))).toBe(true);
    expect(texte.some((t) => t.includes('nur SVG'))).toBe(true);
    expect(texte.some((t) => t.includes('nur Bildzeilen'))).toBe(true);
  });

  it('bereinigt SVGs', () => {
    const roh = '<?xml version="1.0"?><svg viewBox="0 0 1 1" onload="x()"><script>alert(1)</script><a href="javascript:x"><rect onclick="y" /></a><use href="#ok"/></svg>';
    const s = bereinigeSvg(roh);
    expect(/script|onload|onclick|javascript/i.test(s)).toBe(false);
    expect(s.includes('href="#ok"')).toBe(true);
  });
});

describe('Zusatz: Text mit Abschnitten', () => {
  it('liest Absätze, Bilder, Tabelle, Punkte und Schritte', () => {
    const md = `---\ntitel: T\n---\n\nIntro.\n\n## A {#a}\n\n### Merksatz\nX.\n\n## Zusatz: Text {#t}\ntyp: text\n\nEinleitung.\n\n### Teil eins\nErster Absatz\nmit Fortsetzung.\n![Bild eins](topo-bus.svg)\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n- Punkt\n  weiter\n1. Schritt eins\n2. Schritt zwei\n\n### Leer\n`;
    const { thema, meldungen } = parseThemaMarkdown(md, 't.md');
    expect(meldungen.filter((m) => m.level === 'fehler').map((m) => m.text)).toEqual(['Abschnitt "Leer" ist leer']);
    const a = thema.zusatz[0].abschnitte[0];
    expect(a.absaetze).toEqual(['Erster Absatz mit Fortsetzung.']);
    expect(a.bilder.map((b) => b.datei)).toEqual(['topo-bus.svg']);
    expect(a.tabelle?.zeilen).toEqual([['1', '2']]);
    expect(a.punkte).toEqual(['Punkt weiter']);
    expect(a.schritte).toEqual(['Schritt eins', 'Schritt zwei']);
  });
});

describe('echte Inhalte', () => {
  it('content/ ist fehlerfrei', () => {
    const dir = fileURLToPath(new URL('../../content', import.meta.url));
    const i = ladeInhalte(dir);
    expect(i.meldungen.filter((m) => m.level === 'fehler')).toEqual([]);
    expect(i.themenfelder).toHaveLength(13);
    expect(i.meldungen.filter((m) => m.level === 'warnung')).toEqual([]);
    const alleZusatz = i.themenfelder.flatMap((f) => f.zusatz);
    expect(alleZusatz.every((z) => z.zu.length > 0)).toBe(true);
    const bilder = i.themenfelder.flatMap((f) => f.unterthemen.flatMap((u) => u.abbildungen.flatMap((a) => a.bilder)));
    expect(bilder.every((b) => b.svg.startsWith('<svg'))).toBe(true);
  });
});

describe('parseChangelog', () => {
  it('liest Versionen und Gruppen', () => {
    const c = parseChangelog('## [1.1.0] – 2026-12-01\n### Neu\n- A\n- B\n### Behoben\n- C\n\n## [1.0.0] – 2026-11-20\n### Neu\n- D\n');
    expect(c[0]).toEqual({ version: '1.1.0', datum: '2026-12-01', gruppen: [{ titel: 'Neu', punkte: ['A', 'B'] }, { titel: 'Behoben', punkte: ['C'] }] });
    expect(c).toHaveLength(2);
  });
});
