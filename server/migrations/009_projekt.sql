-- Abschlussprojekt (Teil 2): ein Dokument mit Terminen, Checklisten, Zeitplanung und Notizen
CREATE TABLE projekt (
  id        INTEGER PRIMARY KEY CHECK (id = 1),
  daten     TEXT NOT NULL DEFAULT '{}',
  geaendert TEXT NOT NULL
);
