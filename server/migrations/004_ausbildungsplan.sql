-- Ausbildungsplan: Einträge je Kalenderwoche (von/bis = Montag der ersten/letzten Woche)
CREATE TABLE plan_eintrag (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  art        TEXT NOT NULL CHECK (art IN ('schule', 'aufgabe', 'notiz', 'thema')),
  von        TEXT NOT NULL,                  -- JJJJ-MM-TT, immer ein Montag
  bis        TEXT NOT NULL,                  -- JJJJ-MM-TT, immer ein Montag, >= von
  titel      TEXT NOT NULL DEFAULT '',
  text       TEXT NOT NULL DEFAULT '',
  themenfeld TEXT NOT NULL DEFAULT '',       -- ID eines Themenfelds oder leer
  erledigt   INTEGER NOT NULL DEFAULT 0,
  geaendert  TEXT NOT NULL,
  CHECK (bis >= von)
);

CREATE INDEX plan_eintrag_von ON plan_eintrag (von);
