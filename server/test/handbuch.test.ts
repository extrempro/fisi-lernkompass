import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HANDBUCH } from '../../src/lib/handbuch';

describe('Handbuch', () => {
  it('Kapitel haben eindeutige IDs und Inhalt', () => {
    expect(new Set(HANDBUCH.map((k) => k.id)).size).toBe(HANDBUCH.length);
    for (const k of HANDBUCH) expect(k.bloecke.length > 0 && /^[a-z0-9-]+$/.test(k.id)).toBe(true);
  });
  it('verlinkte Seiten gibt es als Route', () => {
    const app = readFileSync(new URL('../../src/App.tsx', import.meta.url), 'utf8');
    for (const k of HANDBUCH) {
      if (!k.link || k.link.to === '/') continue;
      expect(app.includes(`path="${k.link.to.slice(1)}"`)).toBe(true);
    }
  });
  it('Tabellenzeilen passen zum Kopf', () => {
    for (const k of HANDBUCH) for (const b of k.bloecke) if (b.typ === 'tabelle') for (const z of b.zeilen) expect(z.length).toBe(b.kopf.length);
  });
});
