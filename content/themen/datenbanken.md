---
titel: Datenbanken & Daten
---

Wie Daten in Tabellen modelliert, mit SQL (Structured Query Language) abgefragt und zwischen Systemen in Formaten wie JSON (JavaScript Object Notation), XML (Extensible Markup Language) oder CSV (Comma-Separated Values) ausgetauscht werden.

## Relationales Modell {#relationales-modell}

### Kernbegriffe
- **Relation (Tabelle):** Daten in Zeilen und Spalten; jede Zeile ist ein Datensatz (Tupel), jede Spalte ein Attribut.
- **Primärschlüssel:** Eindeutige Kennung jedes Datensatzes, z. B. kunde_id.
- **Fremdschlüssel:** Verweist auf den Primärschlüssel einer anderen Tabelle und verknüpft so Tabellen.
- **Referenzielle Integrität:** Ein Fremdschlüssel darf nur auf existierende Datensätze zeigen.
- **Datentyp:** Legt fest, was in einer Spalte stehen darf, z. B. INT, VARCHAR(50), DATE, DECIMAL(10,2).

### Tabelle: Kardinalitäten
| Beziehung | Beispiel | Umsetzung |
| --- | --- | --- |
| 1:1 | Mitarbeiter – Dienstwagen | Fremdschlüssel in einer der beiden Tabellen (eindeutig) |
| 1:n | Abteilung – Mitarbeiter | Fremdschlüssel auf der n-Seite (Mitarbeiter.abteilung_id) |
| n:m | Mitarbeiter – Projekt | Zwischentabelle mit zwei Fremdschlüsseln |

### Merksatz
n:m geht nie direkt – immer über eine Zwischentabelle.

## ER-Diagramm {#er-diagramm}

### Kernbegriffe
- **ER-Modell:** Entity-Relationship-Modell – beschreibt Entitäten und ihre Beziehungen, bevor Tabellen entstehen.
- **Entität:** Objekt der realen Welt, über das Daten gespeichert werden, z. B. Kunde (Rechteck).
- **Attribut:** Eigenschaft einer Entität, z. B. Name (Ellipse in der Chen-Notation).
- **Beziehung:** Verbindung zwischen Entitäten, z. B. „bestellt“ (Raute).
- **Krähenfuß-Notation:** Zeigt Kardinalitäten mit Strichen und „Krähenfüßen“ an den Linienenden.
- **(min,max)-Notation:** Gibt an, wie oft eine Entität mindestens und höchstens an einer Beziehung teilnimmt.

### Abbildung: Vom ER-Modell zu Tabellen
![ER-Modell in Chen-Notation: Entität Kunde (Attribute kunde_id unterstrichen als Schlüssel, name) steht in der n:m-Beziehung bestellt (Attribute menge, datum) zur Entität Artikel (artikel_id, preis). Darunter die Umsetzung: Tabellen kunde (kunde_id PK, name), artikel (artikel_id PK, preis) und die Zwischentabelle bestellung mit den Fremdschlüsseln kunde_id und artikel_id sowie menge und datum. Regel: 1:n bekommt einen Fremdschlüssel auf der n-Seite, n:m eine Zwischentabelle.](er-beispiel.svg)

### Merksatz
Substantive werden Entitäten, Verben werden Beziehungen, Eigenschaften werden Attribute.

### Prüfungsfrage
Ein Kunde kann mehrere Artikel bestellen, ein Artikel kann von vielen Kunden bestellt werden. Welche Tabellen brauchst du?

1. Es ist eine n:m-Beziehung zwischen Kunde und Artikel.
2. Tabellen: Kunde (kunde_id), Artikel (artikel_id) und Bestellung als Zwischentabelle.
3. Bestellung enthält kunde_id und artikel_id als Fremdschlüssel, dazu z. B. Menge und Datum.

## SQL (SELECT, JOIN) {#sql}

### Kernbegriffe
- **DQL/DML:** DQL = Data Query Language. SELECT liest, INSERT fügt ein, UPDATE ändert, DELETE löscht Daten.
- **DDL:** Data Definition Language – CREATE, ALTER, DROP ändern die Struktur von Tabellen.
- **DCL:** Data Control Language – GRANT und REVOKE vergeben und entziehen Rechte.
- **INNER JOIN:** Nur Datensätze, die in beiden Tabellen einen Partner haben.
- **LEFT JOIN:** Alle Datensätze der linken Tabelle, auch ohne Partner (fehlende Werte sind NULL).
- **Aggregatfunktionen:** COUNT, SUM, AVG, MIN, MAX – meist zusammen mit GROUP BY.

### Tabelle: Reihenfolge einer Abfrage
| Klausel | Aufgabe |
| --- | --- |
| SELECT | welche Spalten |
| FROM / JOIN | aus welchen Tabellen |
| WHERE | Zeilen vor dem Gruppieren filtern |
| GROUP BY | Zeilen zusammenfassen |
| HAVING | Gruppen filtern |
| ORDER BY | sortieren (ASC/DESC) |

### Befehle
- `SELECT name, ort FROM kunde WHERE ort = 'Hamburg' ORDER BY name;` – filtern und sortieren
- `SELECT k.name, b.datum FROM kunde k INNER JOIN bestellung b ON b.kunde_id = k.kunde_id;` – Tabellen verknüpfen
- `UPDATE geraet SET standort = 'Raum 2.14' WHERE inventar_nr = 'IT-0042';` – Datensatz ändern
- `INSERT INTO abteilung (name) VALUES ('Vertrieb');` – Datensatz einfügen

### Merksatz
WHERE filtert Zeilen, HAVING filtert Gruppen – und UPDATE/DELETE nie ohne WHERE.

### Prüfungsfrage
Gib für jede Abteilung die Anzahl der Geräte aus – auch Abteilungen ohne Gerät.

1. Alle Abteilungen sollen erscheinen → LEFT JOIN von abteilung auf geraet.
2. SELECT a.name, COUNT(g.geraet_id) AS anzahl
3. FROM abteilung a LEFT JOIN geraet g ON g.abteilung_id = a.abteilung_id
4. GROUP BY a.name;
5. COUNT(g.geraet_id) zählt NULL nicht mit – Abteilungen ohne Gerät erhalten 0.

## Tabellen anlegen und Datentypen (DDL) {#sql-ddl}

### Kernbegriffe
- **CREATE TABLE:** Legt eine neue Tabelle mit Spalten, Datentypen und Schlüsseln an.
- **PRIMARY KEY:** Primärschlüssel – identifiziert jeden Datensatz eindeutig, darf nicht leer sein; oft eine fortlaufende Nummer.
- **FOREIGN KEY … REFERENCES:** Fremdschlüssel – verweist auf den Primärschlüssel einer anderen Tabelle und sorgt dafür, dass nur existierende Datensätze referenziert werden (referentielle Integrität).
- **NOT NULL, UNIQUE, DEFAULT:** Einschränkungen: Feld muss gefüllt sein, Wert darf nur einmal vorkommen, Standardwert wenn nichts angegeben ist.
- **AUTO_INCREMENT:** Die Datenbank vergibt den Primärschlüssel selbst fortlaufend (in MySQL/MariaDB; in SQL Server IDENTITY, in PostgreSQL GENERATED … AS IDENTITY).
- **ALTER TABLE:** Ändert eine bestehende Tabelle, z. B. Spalte hinzufügen (ADD COLUMN) oder Fremdschlüssel nachträglich anlegen.
- **DROP TABLE:** Löscht die Tabelle samt allen Daten – nicht rückgängig zu machen.
- **INTEGER:** Ganze Zahlen, z. B. Mengen oder Schlüssel.
- **DECIMAL(p,s):** Festkommazahl mit p Stellen insgesamt, davon s nach dem Komma – für Geldbeträge, weil FLOAT und DOUBLE Rundungsfehler haben.
- **CHAR(n) und VARCHAR(n):** Text mit fester bzw. variabler Länge; CHAR für immer gleich lange Werte wie IBAN oder Länderkürzel, VARCHAR für Namen und Straßen.
- **DATE, TIME, DATETIME:** Datum, Uhrzeit oder beides; im SQL-Befehl als '2026-11-06' (ISO-Format – ISO = International Organization for Standardization) schreiben.
- **BOOLEAN:** Wahrheitswert wahr/falsch, z. B. aktiv; in manchen Systemen als BIT oder TINYINT(1) umgesetzt.
- **Zahl oder Text:** Werte, mit denen nicht gerechnet wird und die führende Nullen oder Sonderzeichen enthalten können, gehören in ein Textfeld – Postleitzahl, Telefonnummer, IBAN, Artikelnummer.
- **LIKE:** Mustervergleich in WHERE; % steht für beliebig viele Zeichen, _ für genau eines – z. B. plz LIKE '2%' für alle Postleitzahlen, die mit 2 beginnen.
- **COUNT(*):** Zählt die Datensätze, die nach dem WHERE übrig bleiben; mit GROUP BY je Gruppe.

### Tabelle: Welcher Datentyp passt?
| Feld | Beispielwert | Datentyp | Begründung |
| --- | --- | --- | --- |
| GeraetID | 1 | INTEGER (Primärschlüssel, AUTO_INCREMENT) | fortlaufende Nummer |
| Bezeichnung | Notebook ThinkPad T14 | VARCHAR(100) | Länge schwankt |
| Anschaffungspreis | 1.249,90 | DECIMAL(8,2) | Geld ohne Rundungsfehler |
| Anschaffungsdatum | 06.11.2026 | DATE | Datum, sortier- und vergleichbar |
| Ausgeliehen | ja | BOOLEAN | nur zwei Zustände |
| PLZ | 01067 | CHAR(5) | führende Null bliebe bei INTEGER nicht erhalten |
| Telefonnummer | 040 / 123456-0 | VARCHAR(30) | enthält Leer- und Sonderzeichen |
| IBAN | DE02120300000000202051 | CHAR(22) | in Deutschland immer 22 Zeichen, mit Buchstaben |

### Tabelle: Beispiel CREATE TABLE mit Fremdschlüssel
| Zeile | SQL |
| --- | --- |
| 1 | CREATE TABLE Ausleihe ( |
| 2 | AusleiheID INTEGER NOT NULL AUTO_INCREMENT, |
| 3 | GeraetID INTEGER NOT NULL, |
| 4 | Mitarbeiter VARCHAR(100) NOT NULL, |
| 5 | Ausgabe DATE NOT NULL, |
| 6 | Rueckgabe DATE, |
| 7 | PRIMARY KEY (AusleiheID), |
| 8 | FOREIGN KEY (GeraetID) REFERENCES Geraet(GeraetID) |
| 9 | ); |

### Befehle
- `SELECT COUNT(*) FROM Kunde WHERE Ort = 'Hamburg' AND Aktiv = TRUE;` – aktive Kunden in Hamburg zählen
- `SELECT COUNT(*) FROM Ausleihe a JOIN Geraet g ON g.GeraetID = a.GeraetID WHERE a.Ausgabe < '2026-01-01' AND g.Bezeichnung LIKE 'Notebook%';` – Ausleihen von Notebooks vor 2026 zählen
- `ALTER TABLE Geraet ADD COLUMN Seriennummer VARCHAR(50);` – Spalte nachträglich hinzufügen
- `DROP TABLE Test_Ausleihe;` – Tabelle löschen

### Merksatz
Gerechnet wird mit Zahlen, alles andere ist Text – die PLZ ist Text. Geld in DECIMAL, nie in FLOAT. Der Fremdschlüssel steht auf der n-Seite und zeigt auf den Primärschlüssel der 1-Seite.

### Prüfungsfrage
Eine Tabelle Mitarbeiter (PersNr als Primärschlüssel) existiert. Lege eine Tabelle Schulung an, in der Titel, Datum, Kosten und der teilnehmende Mitarbeiter gespeichert werden, und zähle anschließend alle Schulungen im Jahr 2026.

1. CREATE TABLE Schulung ( SchulungID INTEGER NOT NULL AUTO_INCREMENT, Titel VARCHAR(100) NOT NULL, Datum DATE NOT NULL, Kosten DECIMAL(8,2), PersNr INTEGER NOT NULL,
2. PRIMARY KEY (SchulungID), FOREIGN KEY (PersNr) REFERENCES Mitarbeiter(PersNr) );
3. Kosten als DECIMAL, weil es Geldbeträge sind; Datum als DATE, damit man vergleichen kann.
4. SELECT COUNT(*) FROM Schulung WHERE Datum >= '2026-01-01' AND Datum <= '2026-12-31';
5. Alternativ: WHERE YEAR(Datum) = 2026 – je nach Datenbanksystem.

## Normalisierung {#normalisierung}

### Kernbegriffe
- **Normalisierung:** Tabellen so aufteilen, dass keine überflüssigen Wiederholungen (Redundanzen) entstehen.
- **Anomalien:** Fehler durch Redundanz – Einfüge-, Änderungs- und Löschanomalie.
- **Funktionale Abhängigkeit:** Ein Attribut ergibt sich eindeutig aus einem anderen, z. B. PLZ → Ort.
- **Transitive Abhängigkeit:** Ein Nicht-Schlüssel-Attribut hängt von einem anderen Nicht-Schlüssel-Attribut ab.

### Tabelle: Normalformen
| Normalform | Regel | Typischer Verstoß |
| --- | --- | --- |
| 1. NF | jedes Feld enthält nur einen (atomaren) Wert | „Max Muster, Hamburg“ in einer Spalte |
| 2. NF | 1. NF und jedes Nicht-Schlüssel-Attribut hängt vom ganzen Schlüssel ab | Artikelname in einer Tabelle mit Schlüssel (Bestellung, Artikel) |
| 3. NF | 2. NF und keine transitiven Abhängigkeiten | Ort in der Kundentabelle neben der PLZ |

### Merksatz
Jedes Attribut hängt vom Schlüssel ab, vom ganzen Schlüssel und von nichts als dem Schlüssel.

## Datenformate (JSON, XML, CSV) {#datenformate}

### Kernbegriffe
- **CSV:** Werte durch Trennzeichen (in Deutschland oft Semikolon) getrennt, eine Zeile pro Datensatz – einfach, aber ohne Datentypen.
- **JSON:** Objekte in { } und Listen in [ ], Schlüssel-Wert-Paare; Standard bei Web-APIs.
- **XML:** Daten in verschachtelten Tags, mit Schema (XSD) prüfbar; z. B. in älteren Schnittstellen und Office-Dateien.
- **YAML:** Gut lesbar, Struktur über Einrückung; oft für Konfiguration (z. B. docker-compose.yml).
- **Wohlgeformt/gültig:** Ein Dokument ist wohlgeformt, wenn die Syntax stimmt, und gültig, wenn es zusätzlich zum Schema passt.

### Tabelle: Formate im Vergleich
| Format | Struktur | Datentypen | Typischer Einsatz |
| --- | --- | --- | --- |
| CSV (Comma-Separated Values) | flache Tabelle | nein (alles Text) | Export aus Excel, Massenimport |
| JSON | verschachtelt | Zahl, Text, true/false, null | REST-APIs (REST = Representational State Transfer), Konfiguration |
| XML (Extensible Markup Language) | verschachtelt | über Schema | ältere Schnittstellen, Behörden |
| YAML (YAML Ain’t Markup Language) | verschachtelt | Zahl, Text, Boolean | Konfigurationsdateien |

### Befehle
- `Import-Csv .\geraete.csv -Delimiter ';'` – CSV mit Semikolon einlesen (PowerShell)
- `Get-Service | ConvertTo-Json` – Objekte als JSON ausgeben (PowerShell)
- `jq '.[] .name' geraete.json` – Werte aus JSON herausfiltern (Linux)

### Merksatz
CSV für Tabellen, JSON für APIs, XML wenn ein Schema gefordert ist.

## NoSQL-Datenbanken {#nosql}

### Kernbegriffe
- **NoSQL:** „Not only SQL“ – Datenbanken, die Daten nicht in festen Tabellen mit Beziehungen speichern; flexibler und leichter auf viele Server verteilbar, dafür meist ohne JOINs und mit weniger strengen Regeln.
- **Dokumentenorientierte Datenbank:** Speichert Datensätze als Dokumente, meist JSON (JavaScript Object Notation); jedes Dokument kann andere Felder haben – z. B. MongoDB, CouchDB.
- **Key-Value-Store:** Speichert nur Schlüssel und Wert, extrem schnell – z. B. Redis als Cache oder Sitzungsspeicher.
- **Spaltenorientierte Datenbank (Wide Column):** Speichert Daten spaltenweise in Spaltenfamilien; für sehr große, verteilte Datenmengen – z. B. Apache Cassandra.
- **Graphdatenbank:** Speichert Knoten und Kanten mit Eigenschaften; ideal für Beziehungen wie Netzwerktopologien, soziale Netze oder Berechtigungen – z. B. Neo4j.
- **Zeitreihendatenbank:** Optimiert für Messwerte mit Zeitstempel, etwa aus dem Monitoring oder von Sensoren – z. B. InfluxDB, Prometheus.
- **Schemafrei (schemalos):** Die Struktur muss vorher nicht festgelegt werden; neue Felder kommen einfach dazu – bequem, aber Fehler fallen später auf.
- **ACID:** Eigenschaften von Transaktionen in relationalen Datenbanken: Atomarität, Konsistenz, Isolation, Dauerhaftigkeit – alles oder nichts.
- **BASE und Eventual Consistency:** Viele verteilte NoSQL-Systeme sind „irgendwann konsistent“: Eine Änderung ist nicht sofort auf allen Servern sichtbar, dafür bleibt das System verfügbar.
- **Horizontale Skalierung:** Mehr Leistung durch zusätzliche Server statt durch einen größeren Server (vertikal); NoSQL-Systeme sind meist dafür gebaut.

### Tabelle: NoSQL-Typen im Überblick
| Typ | Datenmodell | Beispiel | Typischer Einsatz |
| --- | --- | --- | --- |
| Dokumentenorientiert | JSON-Dokumente | MongoDB | Produktkataloge, Inhalte, Profile mit wechselnden Feldern |
| Key-Value | Schlüssel → Wert | Redis | Cache, Sitzungen, Warteschlangen |
| Spaltenorientiert | Zeilen mit flexiblen Spaltenfamilien | Cassandra | riesige verteilte Datenmengen, Protokolle |
| Graph | Knoten und Kanten | Neo4j | Beziehungen, Netzwerke, Empfehlungen |
| Zeitreihe | Messwert mit Zeitstempel | InfluxDB, Prometheus | Monitoring, IoT-Sensoren |

### Tabelle: Relational oder NoSQL?
| Merkmal | Relationale Datenbank | NoSQL |
| --- | --- | --- |
| Struktur | festes Schema, Tabellen mit Beziehungen | flexibel, je nach Typ |
| Abfragen | SQL mit JOINs | eigene Abfragesprachen oder APIs, meist ohne JOIN |
| Konsistenz | streng (ACID) | oft „irgendwann konsistent“ (BASE – Basically Available, Soft State, Eventually Consistent) |
| Skalierung | vor allem vertikal | vor allem horizontal |
| Gut für | Buchhaltung, Warenwirtschaft, Kundendaten | große, schnell wachsende oder unstrukturierte Daten |

### Merksatz
Relationale Datenbanken für feste Strukturen und Geld, NoSQL für Masse, Tempo und wechselnde Strukturen. NoSQL-Typen: Dokument, Key-Value, Spalte, Graph – dazu Zeitreihen.

### Prüfungsfrage
Ein Onlineshop will Produktdaten speichern; jede Produktgruppe hat andere Eigenschaften (Schuhe: Größe, Material; Notebooks: CPU – Central Processing Unit, RAM – Random Access Memory). Begründe, warum eine dokumentenorientierte Datenbank passen kann, und nenne einen Nachteil.

1. Jedes Produkt wird als JSON-Dokument mit genau seinen Eigenschaften gespeichert – keine leeren Spalten und keine Schemaänderung für neue Produktgruppen.
2. Ein Produkt wird mit einem Zugriff vollständig gelesen, ohne JOINs über viele Tabellen.
3. Die Datenbank lässt sich bei wachsender Last auf mehrere Server verteilen.
4. Nachteil: Ohne festes Schema prüft die Datenbank Felder und Beziehungen nicht – Bestellungen und Zahlungen gehören besser in eine relationale Datenbank mit Transaktionen (ACID).

## Häufige Fehler
- Postleitzahlen oder Telefonnummern als Zahl speichern – führende Nullen gehen verloren.
- Geldbeträge als FLOAT oder DOUBLE speichern statt als DECIMAL.
- Den Fremdschlüssel auf die 1-Seite statt auf die n-Seite der Beziehung legen.
- n:m-Beziehung ohne Zwischentabelle umsetzen.
- WHERE und HAVING verwechseln.
- UPDATE oder DELETE ohne WHERE ausführen – trifft alle Datensätze.
- INNER JOIN verwenden, obwohl auch Datensätze ohne Partner erscheinen sollen.
- CSV (Comma-Separated Values) mit Komma öffnen, obwohl die Datei mit Semikolon getrennt ist.

## Links
- [W3Schools SQL](https://www.w3schools.com/sql/) – SQL-Befehle mit Übungen (englisch)
- [SQLite](https://www.sqlite.org) – kleine Datenbank zum Ausprobieren
