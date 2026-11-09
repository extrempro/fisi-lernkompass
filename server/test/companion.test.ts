import { describe, expect, it } from 'vitest';
import { ABSTAND, anzeigeDauer, reagiere, START_ZUSTAND, vorname, type Anlass, type Zustand } from '../../src/companion/logik';
import { klartext, LEET_KLAR, SAETZE } from '../../src/companion/saetze';

// Montag, 9. November 2026, 10:00 Uhr Ortszeit
const MONTAG = new Date(2026, 10, 9, 10, 0, 0);
const spaeter = (d: Date, ms: number) => new Date(d.getTime() + ms);
const immerErster = () => 0;

function folge(arten: ('richtig' | 'falsch')[], start: Zustand = START_ZUSTAND) {
  let z = start;
  const anlaesse: Anlass[] = [];
  arten.forEach((art, i) => {
    const r = reagiere(z, { art }, spaeter(MONTAG, i * 1000), 'normal', 'Alex', immerErster);
    z = r.zustand;
    anlaesse.push(r.reaktion.anlass);
  });
  return { z, anlaesse };
}

describe('Companion: Sprüche', () => {
  it('jeder Anlass hat mindestens zwei Sprüche, keiner ist leer oder zu lang', () => {
    for (const [anlass, liste] of Object.entries(SAETZE)) {
      expect(liste.length, anlass).toBeGreaterThanOrEqual(2);
      for (const s of liste) {
        expect(s.trim().length, s).toBeGreaterThan(0);
        expect(s.length, s).toBeLessThanOrEqual(80);
      }
    }
  });

  it('nur bekannte Platzhalter', () => {
    for (const liste of Object.values(SAETZE)) {
      for (const s of liste) for (const m of s.matchAll(/\{(\w+)\}/g)) expect(['name', 'n', 'p']).toContain(m[1]);
    }
  });

  it('jedes Leet-Wort hat Klartext für Screenreader', () => {
    for (const liste of Object.values(SAETZE)) {
      for (const s of liste) {
        for (const w of klartext(s).match(/[\p{L}\d]+/gu) ?? []) {
          expect(/\d/.test(w) && /\p{L}/u.test(w), `${w} in „${s}“`).toBe(false);
        }
      }
    }
    expect(klartext('n1c3. l33t.')).toBe('nice. leet.');
    for (const [leet, klar] of Object.entries(LEET_KLAR)) {
      expect(leet).toMatch(/\d/);
      expect(klar).not.toMatch(/\d/);
    }
  });
});

describe('Companion: Reaktionen', () => {
  it('Begrüßung mit Vorname, nachts und freitags eigene Sprüche', () => {
    const r = reagiere(START_ZUSTAND, { art: 'start' }, MONTAG, 'normal', 'Alex', immerErster);
    expect(r.reaktion).toMatchObject({ anlass: 'start', pose: 'zwinkert', text: 'hallo, Alex. system online.' });
    expect(reagiere(START_ZUSTAND, { art: 'start' }, MONTAG, 'normal', '', immerErster).reaktion.text).toBe('hallo, azubi. system online.');
    expect(reagiere(START_ZUSTAND, { art: 'start' }, new Date(2026, 10, 9, 23, 30), 'normal', 'Alex').reaktion.anlass).toBe('start-nacht');
    expect(reagiere(START_ZUSTAND, { art: 'start' }, new Date(2026, 10, 13, 9, 0), 'normal', 'Alex').reaktion.anlass).toBe('start-freitag');
  });

  it('zählt Serien und setzt sie bei Fehlern zurück', () => {
    const { z, anlaesse } = folge(['richtig', 'richtig', 'richtig', 'richtig', 'richtig', 'falsch', 'richtig']);
    expect(anlaesse).toEqual(['richtig', 'richtig', 'serie', 'richtig', 'serie', 'falsch', 'richtig']);
    expect(z.serie).toBe(1);
  });

  it('drei Fehler in Folge geben einen Tipp', () => {
    expect(folge(['falsch', 'falsch', 'falsch']).anlaesse).toEqual(['falsch', 'falsch', 'falsch-serie']);
  });

  it('gewöhnliche Anlässe halten den Mindestabstand ein, wichtige nicht', () => {
    const a = reagiere(START_ZUSTAND, { art: 'richtig' }, MONTAG, 'normal', '', immerErster);
    expect(a.reaktion.text).toBe('korrekt.');
    const b = reagiere(a.zustand, { art: 'falsch' }, spaeter(MONTAG, 10_000), 'normal', '');
    expect(b.reaktion.text).toBeNull();
    expect(b.reaktion).toMatchObject({ pose: 'autsch', licht: 'rot' });
    const c = reagiere(b.zustand, { art: 'runde', quote: 0.9 }, spaeter(MONTAG, 11_000), 'normal', '', immerErster);
    expect(c.reaktion.text).toBe('90 %. 0wn3d.');
    const d = reagiere(c.zustand, { art: 'falsch' }, spaeter(MONTAG, 11_000 + ABSTAND.normal), 'normal', '');
    expect(d.reaktion.text).not.toBeNull();
    const e = reagiere(c.zustand, { art: 'falsch' }, spaeter(MONTAG, 11_000 + ABSTAND.normal), 'selten', '');
    expect(e.reaktion.text).toBeNull();
  });

  it('wiederholt denselben Spruch nicht direkt', () => {
    const a = reagiere(START_ZUSTAND, { art: 'klick' }, MONTAG, 'normal', '', immerErster);
    const b = reagiere(a.zustand, { art: 'klick' }, spaeter(MONTAG, 1000), 'normal', '', immerErster);
    expect(b.reaktion.text).not.toBe(a.reaktion.text);
  });

  it('bewertet Runden und Simulation', () => {
    const an = (art: 'runde' | 'simulation', quote: number) => reagiere(START_ZUSTAND, { art, quote }, MONTAG, 'normal', '').reaktion.anlass;
    expect([an('runde', 0.8), an('runde', 0.5), an('runde', 0.49)]).toEqual(['runde-gut', 'runde-mittel', 'runde-schlecht']);
    expect([an('simulation', 0.81), an('simulation', 0.5), an('simulation', 0.3)]).toEqual(['sim-gut', 'sim-knapp', 'sim-schlecht']);
  });

  it('Hilfsfunktionen', () => {
    expect(vorname('  Alex Beispiel ')).toBe('Alex');
    expect(vorname('')).toBe('');
    expect(anzeigeDauer('kurz')).toBeGreaterThanOrEqual(3000);
    expect(anzeigeDauer('x'.repeat(500))).toBe(9000);
  });
});
