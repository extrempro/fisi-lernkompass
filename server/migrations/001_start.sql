-- Grundstruktur: Status je Unterthema, Einstellungen, Schema-Version
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER NOT NULL
);

CREATE TABLE unterthema_status (
  unterthema_id TEXT PRIMARY KEY,            -- z. B. 'netzwerkgrundlagen.subnetting'
  status        TEXT NOT NULL DEFAULT 'rot' CHECK (status IN ('rot', 'gelb', 'gruen')),
  notiz         TEXT NOT NULL DEFAULT '',
  geaendert     TEXT NOT NULL                -- ISO-Datum der letzten Statusänderung
);

CREATE TABLE einstellungen (
  schluessel TEXT PRIMARY KEY,
  wert       TEXT
);
