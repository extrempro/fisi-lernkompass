-- Digitale Unterschriften (gezeichnet) für das Berichtsheft
CREATE TABLE unterschrift (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  rolle   TEXT NOT NULL CHECK (rolle IN ('ausbilder', 'azubi')),
  name    TEXT NOT NULL,
  datum   TEXT NOT NULL,                 -- JJJJ-MM-TT
  pfad    TEXT NOT NULL,                 -- SVG-Pfad im Feld 600 × 200 (nur M/L-Befehle und Zahlen)
  erstellt TEXT NOT NULL
);

-- Welche Unterschrift einen Bericht bestätigt; fällt weg, wenn der Bericht danach geändert wird
ALTER TABLE bericht ADD COLUMN unterschrift_id INTEGER REFERENCES unterschrift(id) ON DELETE SET NULL;
