import { existsSync, readFileSync } from 'node:fs';

export interface ChangelogEintrag {
  /** Version (z. B. "1.0.0") oder Datum (Inhalte) */
  version: string;
  datum: string;
  gruppen: { titel: string; punkte: string[] }[];
}

/**
 * Liest ein CHANGELOG im Format
 *   ## [1.1.0] – 2026-12-01      (App)
 *   ## 2026-11-04                (Inhalte)
 *   ### Neu
 *   - Punkt
 */
export function parseChangelog(text: string): ChangelogEintrag[] {
  const eintraege: ChangelogEintrag[] = [];
  let akt: ChangelogEintrag | null = null;
  for (const zeile of text.split(/\r?\n/)) {
    const v = /^##\s+\[([^\]]+)\]\s*(?:[–-]\s*(\S+))?/.exec(zeile);
    const d = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/.exec(zeile);
    if (v || d) {
      akt = { version: v ? v[1] : d![1], datum: v ? v[2] || '' : d![1], gruppen: [] };
      eintraege.push(akt);
      continue;
    }
    if (!akt) continue;
    const g = /^###\s+(.+)$/.exec(zeile);
    if (g) {
      akt.gruppen.push({ titel: g[1].trim(), punkte: [] });
      continue;
    }
    const p = /^\s*[-*]\s+(.+)$/.exec(zeile);
    if (p) {
      if (!akt.gruppen.length) akt.gruppen.push({ titel: '', punkte: [] });
      akt.gruppen[akt.gruppen.length - 1].punkte.push(p[1].trim());
    }
  }
  return eintraege;
}

export function leseChangelog(pfad: string, max = 5): ChangelogEintrag[] {
  if (!existsSync(pfad)) return [];
  return parseChangelog(readFileSync(pfad, 'utf8')).slice(0, max);
}
