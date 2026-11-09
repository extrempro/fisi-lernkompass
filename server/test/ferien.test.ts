import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ladeFerien } from '../content/ferien';
import type { Meldung } from '../content/types';

const CONTENT = fileURLToPath(new URL('../../content', import.meta.url));

function mit(inhalt: string) {
  const dir = mkdtempSync(join(tmpdir(), 'ferien-'));
  writeFileSync(join(dir, 'ferien-hamburg.json'), inhalt);
  const meldungen: Meldung[] = [];
  return { ferien: ladeFerien(dir, meldungen), meldungen };
}

describe('Schulferien', () => {
  it('lädt die echten Hamburger Ferien ohne Meldungen', () => {
    const meldungen: Meldung[] = [];
    const f = ladeFerien(CONTENT, meldungen);
    expect(meldungen).toEqual([]);
    expect(f.ferien.length).toBeGreaterThan(30);
    expect(f.ferien.find((x) => x.von === '2026-10-19')?.name).toBe('Herbstferien');
  });

  it('meldet fehlerhafte Einträge und überspringt sie', () => {
    const { ferien, meldungen } = mit(
      JSON.stringify({
        ferien: [
          { name: 'Gut', von: '2026-10-19', bis: '2026-10-30' },
          { name: 'Falsch herum', von: '2026-12-31', bis: '2026-12-01' },
          { name: 'Kein Datum', von: '2026-02-30', bis: '2026-03-01' },
          { von: '2026-01-01', bis: '2026-01-02' },
          { name: 'Überschneidung', von: '2026-10-30', bis: '2026-11-02' },
        ],
      }),
    );
    expect(ferien.ferien.map((x) => x.name)).toEqual(['Gut', 'Überschneidung']);
    expect(meldungen.filter((m) => m.level === 'fehler')).toHaveLength(3);
    expect(meldungen.some((m) => m.level === 'warnung' && /überschneiden/.test(m.text))).toBe(true);
  });

  it('kaputtes JSON ist ein Fehler, eine fehlende Datei nur eine Warnung', () => {
    expect(mit('{ kaputt').meldungen[0].level).toBe('fehler');
    const meldungen: Meldung[] = [];
    ladeFerien(mkdtempSync(join(tmpdir(), 'leer-')), meldungen);
    expect(meldungen[0].level).toBe('warnung');
  });
});
