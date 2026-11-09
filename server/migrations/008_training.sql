-- Prüfungstraining: Lernstand je Karteikarte (Leitner-System) und Ergebnisse der Prüfungssimulation
CREATE TABLE karte (
  id       TEXT PRIMARY KEY,                -- z. B. 'b:netzwerkgrundlagen.subnetting:Broadcast' oder 'f:netzwerkgrundlagen.subnetting'
  fach     INTEGER NOT NULL DEFAULT 1 CHECK (fach BETWEEN 1 AND 5),
  faellig  TEXT NOT NULL,                   -- JJJJ-MM-TT: ab wann die Karte wieder dran ist
  richtig  INTEGER NOT NULL DEFAULT 0,
  falsch   INTEGER NOT NULL DEFAULT 0,
  zuletzt  TEXT NOT NULL
);

CREATE TABLE pruefung_versuch (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  pruefung TEXT NOT NULL CHECK (pruefung IN ('AP1', 'AP2')),
  datum    TEXT NOT NULL,
  fragen   INTEGER NOT NULL,
  richtig  INTEGER NOT NULL,
  dauer    INTEGER NOT NULL,                -- Sekunden
  felder   TEXT NOT NULL DEFAULT '{}'       -- JSON: { themenfeld: [richtig, gesamt] }
);
