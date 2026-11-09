-- Berichtsheft (Ausbildungsnachweise): ein Bericht je Kalenderwoche
CREATE TABLE bericht (
  montag          TEXT PRIMARY KEY,          -- JJJJ-MM-TT, Montag der Berichtswoche
  status          TEXT NOT NULL DEFAULT 'entwurf' CHECK (status IN ('entwurf', 'fertig', 'abgezeichnet')),
  abgezeichnet_am TEXT,                      -- JJJJ-MM-TT, nur bei Status "abgezeichnet"
  inhalt          TEXT NOT NULL DEFAULT '{}', -- JSON: betrieb, unterweisung, schule, abwesenheit
  geaendert       TEXT NOT NULL
);
