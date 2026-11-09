-- Unteraufgaben zum Abhaken (JSON-Liste aus {text, erledigt}) für Plan-Einträge der Art "aufgabe"
ALTER TABLE plan_eintrag ADD COLUMN unteraufgaben TEXT NOT NULL DEFAULT '[]';
