-- Lernpunkt bei "In Arbeit" und "Gelesen"-Status für Zusatzwissen
ALTER TABLE unterthema_status ADD COLUMN luecke TEXT NOT NULL DEFAULT '';

CREATE TABLE zusatz_status (
  zusatz_id TEXT PRIMARY KEY,                -- z. B. 'netzwerkgrundlagen.paketreise'
  gelesen   INTEGER NOT NULL DEFAULT 0,
  geaendert TEXT NOT NULL
);
