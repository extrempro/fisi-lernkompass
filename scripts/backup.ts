/**
 * Manuelle Sicherung der Datenbank nach DATA_DIR/backups (auch im laufenden Betrieb sicher).
 * Aufruf: npm run backup   bzw. im Container: docker compose exec app npm run backup
 */
import { DatabaseSync } from '../server/sqlite';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { backupDatabase } from '../server/db';

const dataDir = resolve(process.env.DATA_DIR || './data');
const datei = join(dataDir, 'lernkompass.db');
if (!existsSync(datei)) {
  console.error(`Keine Datenbank gefunden: ${datei}`);
  process.exit(1);
}
const db = new DatabaseSync(datei, { readOnly: true });
const ziel = await backupDatabase(db, dataDir, 'manuell');
db.close();
console.log(`Sicherung erstellt: ${ziel}`);
