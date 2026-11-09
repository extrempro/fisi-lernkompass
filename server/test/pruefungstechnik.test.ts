import { describe, expect, it } from 'vitest';
import { OPERATOREN, UEBUNGEN } from '../../src/lib/pruefungstechnik';

describe('Prüfungstechnik', () => {
  it('jede Übung hat genau eine Antwort mit vollen Punkten und eine eindeutige ID', () => {
    for (const u of UEBUNGEN) {
      expect(u.antworten.filter((a) => a.voll)).toHaveLength(1);
      expect(u.antworten.length >= 2).toBe(true);
      expect(u.punkte > 0).toBe(true);
    }
    expect(new Set(UEBUNGEN.map((u) => u.id)).size).toBe(UEBUNGEN.length);
  });
  it('Operatoren sind eindeutig und vollständig beschrieben', () => {
    expect(new Set(OPERATOREN.map((o) => o.wort)).size).toBe(OPERATOREN.length);
    for (const o of OPERATOREN) expect([o.verlangt, o.umfang, o.frage, o.antwort].every((x) => x.length > 3)).toBe(true);
  });
});
