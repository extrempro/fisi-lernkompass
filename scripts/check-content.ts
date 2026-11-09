/**
 * Prüft alle Inhalte in CONTENT_DIR (Standard ./content) mit demselben Parser wie das Backend.
 * Beendet sich mit Code 1, wenn Fehler gefunden wurden.
 */
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { ladeInhalte, inhaltsStand } from '../server/content/store';
import type { Meldung } from '../server/content/types';

const dir = resolve(process.env.CONTENT_DIR || './content');
const inhalte = ladeInhalte(dir);
const meldungen: Meldung[] = [...inhalte.meldungen];

// Warnung: Inhalte geändert, aber Inhaltsstand nicht erhöht (nur wenn Git verfügbar)
try {
  const geaendert = execSync('git status --porcelain -- content/themen content/zusatz content/bilder', { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();
  const metaGeaendert = execSync('git status --porcelain -- content/meta.json', { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString()
    .trim();
  if (geaendert && !metaGeaendert) {
    meldungen.push({ level: 'warnung', datei: 'meta.json', text: 'Inhalte geändert, aber "stand" nicht erhöht' });
  }
} catch {
  /* kein Git – Prüfung überspringen */
}

const fehler = meldungen.filter((m) => m.level === 'fehler');
const warnungen = meldungen.filter((m) => m.level === 'warnung');
const breite = Math.max(0, ...meldungen.map((m) => `${m.datei}${m.zeile ? `:${m.zeile}` : ''}`.length));

for (const m of [...fehler, ...warnungen]) {
  const ort = `${m.datei}${m.zeile ? `:${m.zeile}` : ''}`.padEnd(breite);
  console.log(`${m.level === 'fehler' ? '✖' : '⚠'} ${ort}  ${m.text}`);
}

const s = inhaltsStand(inhalte);
console.log(
  `\nInhaltsstand ${s.stand || '–'}: ${s.themenfelder} Themenfelder (${s.befuellt} mit Inhalt), ` +
    `${s.unterthemenMitInhalt} Unterthemen mit Inhalt, ${s.unterthemenGeruest} als Gerüst.`,
);
console.log(`${fehler.length} Fehler, ${warnungen.length} Warnungen.`);
process.exit(fehler.length ? 1 : 0);
