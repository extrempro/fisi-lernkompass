/**
 * Zugriff auf das eingebaute SQLite-Modul von Node.js.
 *
 * Geladen über require statt über `import … from 'node:sqlite'`: Vite/Vitest kennt
 * `node:sqlite` noch nicht als eingebautes Modul, entfernt das Präfix und sucht dann
 * ein npm-Paket „sqlite“ („Failed to load url sqlite“). Über require lädt Node das
 * Modul direkt – in den Tests genauso wie im Betrieb.
 */
import { createRequire } from 'node:module';
import type * as NodeSqlite from 'node:sqlite';

const sqlite = createRequire(import.meta.url)('node:sqlite') as typeof NodeSqlite;

export const DatabaseSync = sqlite.DatabaseSync;
export type DatabaseSync = NodeSqlite.DatabaseSync;
export const backup = sqlite.backup;
