import { describe, expect, it } from 'vitest';
import { DatabaseSync as Database } from '../sqlite';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { currentSchemaVersion, latestSchemaVersion, loadMigrations, migrate } from '../db';

const still = () => {};

describe('Migrationen', () => {
  it('legt eine neue Datenbank auf dem neuesten Stand an', async () => {
    const db = new Database(':memory:');
    await migrate(db, null, loadMigrations(), still);
    expect(currentSchemaVersion(db)).toBe(latestSchemaVersion());
  });

  it('migriert jede ältere Version ohne Datenverlust und legt vorher eine Sicherung an', async () => {
    const alle = loadMigrations();
    for (const start of alle.map((m) => m.version).filter((v) => v < latestSchemaVersion())) {
      const dir = mkdtempSync(join(tmpdir(), 'lk-'));
      const db = new Database(join(dir, 'lernkompass.db'));
      await migrate(db, dir, alle.filter((m) => m.version <= start), still);
      expect(currentSchemaVersion(db)).toBe(start);

      db.prepare("INSERT INTO unterthema_status (unterthema_id, status, notiz, geaendert) VALUES ('a.b', 'gelb', 'Notiz', '2026-01-01')").run();

      await migrate(db, dir, alle, still);
      expect(currentSchemaVersion(db)).toBe(latestSchemaVersion());
      const row = db.prepare("SELECT * FROM unterthema_status WHERE unterthema_id = 'a.b'").get() as Record<string, unknown>;
      expect(row.status).toBe('gelb');
      expect(row.notiz).toBe('Notiz');
      expect(row.luecke).toBe('');
      expect(readdirSync(join(dir, 'backups')).some((f) => f.startsWith(`lernkompass-migration-v${start}-`))).toBe(true);
      db.close();
    }
  });

  it('bricht ab, wenn die Datenbank neuer als der Code ist', async () => {
    const db = new Database(':memory:');
    await migrate(db, null, loadMigrations(), still);
    db.exec('UPDATE schema_version SET version = 999');
    await expect(migrate(db, null, loadMigrations(), still)).rejects.toThrow(/neuer|kennt nur/);
  });
});
