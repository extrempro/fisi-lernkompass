-- Inhalts-Hash beim letzten Bestätigen, für den Hinweis "Inhalt aktualisiert"
ALTER TABLE unterthema_status ADD COLUMN inhalt_hash TEXT;
