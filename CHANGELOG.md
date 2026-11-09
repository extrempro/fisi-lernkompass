# Changelog – FISI-Lernkompass

Alle Änderungen an der Anwendung (Code). Änderungen an den Inhalten stehen in `content/CHANGELOG.md`.
Format: neueste Version oben; Gruppen „Neu“, „Geändert“, „Behoben“. Der erste Punkt unter „Neu“ erscheint im Update-Banner.

## [1.28.1] – 2026-11-09
### Geändert
- Hoodie zeigt seine Stimmung jetzt über leuchtende Augen im Schatten der Kapuze statt über Arme: ruhig mit gelegentlichem Blinzeln, zwinkernd bei Begrüßung und Klick, ^ ^ bei richtig (mit kleinem Hüpfer), > < bei falsch (mit kurzem Wackeln), nachdenklich mit geneigtem Kopf, müde mit gesenktem Kopf.

## [1.28.0] – 2026-11-09
### Neu
- Hoodie: ein kleiner Companion unten links, der Quiz, Karteikarten, Rechner, Ampeln und Berichtsheft kommentiert – mit Gesten, farbigem Monitorlicht (grün richtig, rot falsch, gelb nachdenken, blau Pause) und kurzen Terminal-Sprüchen mit etwas Leetspeak. Ein Klick auf ihn bringt einen Spruch.
- Einstellungen → Hoodie: anzeigen oder ausschalten und wählen, wie oft er etwas sagt (selten, normal, gesprächig). Das Minus an der Figur verkleinert ihn zu einem Knopf.

### Geändert
- Während der Prüfungssimulation ist der Hoodie ausgeblendet; nach der Abgabe kommentiert er das Ergebnis. Bei „Bewegung reduzieren“ bewegt er sich nicht, nur das Licht wechselt die Farbe.

## [1.27.0] – 2026-11-06
### Neu
- Neun interaktive Werkzeuge unter Üben → Werkzeuge: Subnetting auf Bit-Ebene, RAID-Ausfall-Simulator, Backup-Planer mit Archivbit, Firewall-Regelprüfer, Netzplan mit kritischem Pfad, SQL-JOINs, Linux-Rechte mit umask, Cron-Erklärer und Nutzwertanalyse.
- Im Cheatsheet verlinken passende Unterthemen direkt auf das Werkzeug („Zum Ausprobieren“).

## [1.26.0] – 2026-11-06
### Neu
- Sieben neue animierte Abläufe zum Durchklicken: Switch und ARP, VLAN, TCP, DHCP, DNS, NAT und Verschlüsselung.
- Abläufe können jetzt eine Zustandstabelle zeigen (z. B. MAC-, ARP-, NAT- oder Lease-Tabelle), in der neue Einträge hervorgehoben sind, und Broadcasts als Kopien an mehrere Geräte darstellen.

### Geändert
- Abläufe: Bei reduzierter Bewegung (Systemeinstellung) springt das Paket direkt an die nächste Station statt zu gleiten.

## [1.25.1] – 2026-11-06
### Behoben
- Hilfe: Das Inhaltsverzeichnis markiert beim Scrollen das Kapitel, in dem du gerade liest.

## [1.25.0] – 2026-11-06
### Neu
- Hilfe mit dem Handbuch für Azubis direkt in der App: zehn Kapitel von den ersten Schritten bis zur Lernroutine, mit Inhaltsverzeichnis, Suche und Sprüngen zur jeweiligen Seite. Erreichbar über das Fragezeichen in der Navigation und „Hilfe“ in der Fußzeile.

## [1.24.0] – 2026-11-06
### Neu
- Verkürzte Ausbildung: In den Einstellungen lässt sich eine Verkürzung (bis 18 Monate) eintragen – am Ende oder am Anfang angerechnet, mit Grund und Zeitpunkt, optional ein abweichendes Vertragsende und die vorzeitige Zulassung zur Prüfung. Ausbildungsjahr, Ausbildungsplan, Berichtsheft-Deckblatt und Übersicht rechnen mit dem neuen Vertragsende.
- Prüfungen: Karte „Verkürzen oder vorzeitig zur Prüfung?“ mit Vergleich, Hinweisen zu Teil 1 und Teil 2 und Link zur Handelskammer; das Abschlussprojekt warnt, wenn Termine nach dem Vertragsende liegen.

## [1.23.1] – 2026-11-06
### Geändert
- Docker: Eigener Port oder Freigabe im Netz über eine lokale `docker-compose.override.yml` (Vorlage `docker-compose.override.example.yml`, steht in `.gitignore`); `docker-compose.yml` bleibt unverändert bei `127.0.0.1:3000`.

## [1.23.0] – 2026-11-06
### Neu
- Prüfungstechnik unter Prüfungen → Prüfungstechnik: was Arbeitsaufträge wie „nennen“, „beschreiben“, „erläutern“ oder „begründen“ verlangen (mit Beispielen und typischen Punktefallen), eine Übung „Welche Antwort bekommt volle Punkte?“, die Spielregeln der schriftlichen Prüfung und Tipps zu Zeit und Punkten.

## [1.22.0] – 2026-11-06
### Neu
- Vier neue Rechner unter Üben → Rechner, jeweils mit Rechenweg und Übungsaufgaben: VoIP-Bandbreite (Codec, Overhead, Cloud-Anlage), RAID-Plattenbedarf mit Hot Spare, Speicherbedarf mit Komprimierung (Archiv über Jahre) und Verfügbarkeit (erlaubte Ausfallzeit).

## [1.21.1] – 2026-11-05
### Behoben
- `npm test`: Die Servertests brachen mit „Failed to load url sqlite“ ab, weil Vitest das eingebaute Modul `node:sqlite` nicht erkennt. SQLite wird jetzt zentral über `server/sqlite.ts` geladen.

## [1.21.0] – 2026-11-05
### Neu
- Projekt-Begleiter für das Abschlussprojekt unter Prüfungen → Abschlussprojekt: Termine mit Countdown, Checklisten für Projektantrag und Dokumentation nach dem Merkblatt der Handelskammer Hamburg, 40-Stunden-Zeitplanung mit Soll/Ist und Warnung, Präsentations-Timer (15 Minuten) und typische Fragen im Fachgespräch mit eigenen Stichworten.
- Eingetragene Projekttermine erscheinen im Ausbildungsplan in der jeweiligen Woche.

### Geändert
- Export und Import enthalten die Daten des Abschlussprojekts.

## [1.20.0] – 2026-11-05
### Neu
- Rechner unter Üben → Rechner für die typischen Rechenaufgaben der Prüfung: Subnetting, Datenmengen (dezimal und binär), Übertragungsdauer, RAID-Kapazität, USV (Wirkleistung und Überbrückungszeit), Stromkosten und Amortisation – jeweils mit Rechenweg Schritt für Schritt.
- Übungsaufgaben mit Zufallswerten zu jedem Rechner: Ergebnis eintragen, prüfen lassen, danach den Rechenweg ansehen.

## [1.19.0] – 2026-11-05
### Neu
- Neuer Menüpunkt „Üben“ mit Prüfungstraining aus den Inhalten der Cheatsheets: Karteikarten aus 624 Kernbegriffen und den Prüfungsfragen mit Leitner-System (gewusst → seltener, nicht gewusst → morgen wieder), Fehlerliste und Tastenkürzeln.
- Quiz: Erklärung lesen, den passenden Begriff aus vier Antworten wählen – mit sofortiger Rückmeldung und „Falsche wiederholen“.
- Prüfungssimulation für Teil 1 (30 Fragen, 45 Minuten) und Teil 2 (40 Fragen, 60 Minuten) mit Note nach IHK-Schlüssel, Auswertung nach Themenfeld und Verlauf der Versuche.
- Nach jeder Runde Vorschläge für die Ampel, z. B. „alle Karten mehrfach gewusst → auf Sicher stellen?“.
- README: Systemvoraussetzungen (Git, Node.js, npm, Browser, optional Docker) und erste Einrichtung mit Tests.

### Geändert
- „Fortschritt zurücksetzen“ löscht auch den Übungsstand der Karteikarten und die Simulationsversuche.
- Export und Import enthalten den Übungsstand.

## [1.18.0] – 2026-11-05
### Neu
- Digitale Unterschrift im Berichtsheft: Die Ausbilderin oder der Ausbilder prüft die fertigen Berichte, wählt aus und unterschreibt einmal mit Finger, Stift oder Maus. Name, Datum und Unterschrift stehen danach auf jedem Nachweis im PDF.
- Eigene Unterschrift (optional) unter Einstellungen → Berichtsheft, auf Wunsch auf jedem Nachweis mitgedruckt.

### Geändert
- Wird ein digital unterschriebener Bericht inhaltlich geändert, entfällt die Unterschrift automatisch und der Bericht geht zurück auf „Fertig“.
- Versionshinweise: die 10 neuesten Versionen einzeln, ältere gesammelt in „Ältere Versionen“.
- Export und Import enthalten die Unterschriften.

## [1.17.0] – 2026-11-05
### Neu
- Übersicht: neue Karten „Diese Woche“ (Schul- oder Betriebswoche, Ferien und Feiertage, Einträge, überfällige Aufgaben, Ausblick auf die nächste Woche) und „Berichtsheft“ (fehlende Berichte, Bericht der letzten Woche direkt öffnen, Berichte zum Abzeichnen).

### Geändert
- Druck des Berichtshefts: eine durchgehende Tabelle mit Abschnitten und Zwischensummen statt vier einzelner Tabellen; kräftigere Linien, die auch beim verkleinerten Drucken sichtbar bleiben; leere Abschnitte zeigen „– keine –“.
- Bei „Krank“ wird eine Bemerkung nicht mit ausgedruckt – im Berichtsheft reicht die Angabe „krank“.

## [1.16.0] – 2026-11-05
### Neu
- Berichtsheft: Ausbildungsnachweis je Kalenderwoche mit betrieblichen Tätigkeiten, Unterweisungen, Berufsschule und Abwesenheit, jeweils mit Stunden und Abgleich gegen die Wochenarbeitszeit. Status Entwurf, Fertig oder Vom Ausbilder abgezeichnet. Feiertage und Schulblöcke werden vorausgefüllt, Vorschläge kommen aus Plan und Lernstand, Tätigkeiten der Vorwoche lassen sich übernehmen.
- Neue Seite „Berichtsheft“ mit der Liste aller Nachweise, fehlenden Wochen, Filtern, „Alle als abgezeichnet markieren“ und Drucken bzw. Speichern als PDF (A4, mit Deckblatt) für die Handelskammer.
- Ausbildungsplan: Berichtsheft-Status an jeder Woche; oben stehen jetzt „Diese Woche“ und „Nächste Woche“ nebeneinander.
- Einstellungen → Berichtsheft: Name, Ausbildungsberuf, Ausbildungsbetrieb, Ausbilder/in und Wochenarbeitszeit.

### Geändert
- Einträge im Ausbildungsplan sind übersichtlicher: jede als eigene Karte mit Titel, Infozeilen und Bearbeiten-Knopf; Ferien, Feiertage und Prüfungen stehen gesammelt darüber, Unteraufgaben eingerückt.
- Die Navigation passt in eine Zeile: bis 1280 px Breite nur Symbole (Name als Tooltip), darüber nur Text.
- Export und Import enthalten das Berichtsheft.

## [1.15.0] – 2026-11-05
### Neu
- Hamburger Schulferien und gesetzliche Feiertage im Ausbildungsplan: Ferien und Feiertage stehen in der passenden Woche, Ferienwochen sind im Jahresband der Seitenleiste markiert. Lässt sich mit „Ferien und Feiertage“ ausblenden.
- Unteraufgaben zum Abhaken bei Aufgaben im Ausbildungsplan. Sind alle Unteraufgaben erledigt, ist die Aufgabe automatisch erledigt.
- Alle Versionshinweise unter Einstellungen → Versionshinweise: die installierte Version aufgeklappt, ältere eingeklappt; dazu die Änderungen an den Inhalten.

### Geändert
- Die Ferientermine liegen als Inhaltsdatei `content/ferien-hamburg.json` vor und lassen sich ohne Code-Änderung ergänzen; die Feiertage berechnet die App selbst.

## [1.14.0] – 2026-11-05
### Neu
- Seitenleiste im Ausbildungsplan: zeigt beim Scrollen, wo du gerade bist (Ausbildungsjahr, Monat, KW, Schul- oder Betriebswoche), wie weit die Ausbildung ist, und je Ausbildungsjahr ein Band aller Wochen mit Schul- und Prüfungswochen. Ein Klick auf Jahr, Monat oder Woche springt dorthin.

### Geändert
- Neues Eingabefenster im Ausbildungsplan: Die Art des Eintrags wird über große Karten mit kurzer Erklärung gewählt, nichts wird mehr abgeschnitten. Die Wochen sind in der Auswahl nach Ausbildungsjahr gruppiert.

## [1.13.0] – 2026-11-05
### Neu
- Ausbildungsplan als eigener Menüpunkt: alle Kalenderwochen ab Ausbildungsbeginn bis zum Ende der Regeldauer, mit Schulblöcken über mehrere Wochen, Aufgaben zum Abhaken, eigenen Notizen und Verknüpfungen zu Themenfeldern samt Lernstand. Prüfungstermine, Beginn und Ende sind automatisch eingetragen.
- Rückfrage vor dem Umstellen einer Ampel, damit ein versehentlicher Klick nichts verstellt. Lässt sich unter Einstellungen → Bedienung abschalten.

### Geändert
- Export und Import enthalten den Ausbildungsplan. Ältere Sicherungen ohne Plan lassen einen vorhandenen Plan unverändert.
- Auf dem Handy zeigt die Navigation nur Symbole, damit sie nicht drei Zeilen hoch wird.

## [1.12.0] – 2026-11-05
### Neu
- Betrieb mit Docker: `Dockerfile`, `docker-compose.yml` und Startskript. Ein Container, Lernstand im eingebundenen Ordner `data`, Inhalte lesend aus `content`; die App läuft ohne Root-Rechte und meldet über einen Healthcheck, ob sie läuft.
- Inhalte können auch im Produktionsbetrieb automatisch neu geladen werden (`CONTENT_WATCH=true`, bei Docker voreingestellt; `CONTENT_WATCH_POLL=true` für Windows und macOS).

### Geändert
- Das Build-Datum wird im Container aus dem Image gelesen und unter „Über die App“ angezeigt.

## [1.11.0] – 2026-11-05
### Neu
- Prüfungsseite nach der Ausbildungsverordnung (FIAusbV): Gewichtung jedes Prüfungsbereichs, was laut Verordnung geprüft wird, Bestehensregeln und mündliche Ergänzungsprüfung.
- Neun neue Unterthemen aus dem Ausbildungsrahmenplan, u. a. Barrierefreiheit, Qualitätsmanagement, Einführung und Übergabe von IT-Systemen, Programmiersprachen.

### Geändert
- „Zwischenprüfung“ heißt jetzt richtig „Abschlussprüfung Teil 1“ (zählt 20 % zur Endnote), die Abschlussprüfung „Abschlussprüfung Teil 2“; Chips zeigen kurz „AP Teil 1“ bzw. „AP Teil 2“. Gespeicherte Prüfungstermine bleiben erhalten.

## [1.10.0] – 2026-11-05
### Neu
- Grafiken lassen sich per Klick groß anzeigen; schließen mit Esc, Klick daneben oder dem X.
- Tempo-Auswahl (langsam, mittel, schnell) bei animierten Abläufen.
- Neue Inhalte: Monitoring der Infrastruktur; Zusatzwissen zu Kerberos, Monitoring in der Praxis und Kundenkommunikation in der Praxis.

### Geändert
- Breite Grafiken stehen untereinander in voller Breite statt klein nebeneinander.
- Animierte Abläufe sind langsamer: standardmäßig 6 statt 2,8 Sekunden pro Schritt, das Paket wandert ruhiger.

## [1.9.0] – 2026-11-05
### Neu
- Neues Themenfeld „Künstliche Intelligenz“ mit eigenem Symbol: KI-Grundlagen und Sprachmodelle, Sprachmodelle im Vergleich, KI-Chat und KI-Agent, KI sicher und rechtskonform nutzen – dazu Zusatzwissen „KI aus Sicht eines IT-Admins“.

## [1.8.0] – 2026-11-05
### Neu
- Knopf „Nach oben“ unten rechts, sobald man ein Stück gescrollt hat.
- Neue Inhalte: Skripte planen, testen und sicher ausführen; Troubleshooting-Werkzeuge der Betriebssysteme – dazu Zusatzwissen zu effizientem Scripting, Troubleshooting Schritt für Schritt und ITIL in der Praxis.

### Behoben
- Beim Wechsel des Themenfelds landete man am Ende der Seite, weil die Scrollposition der vorigen Seite stehen blieb. Neue Seiten beginnen jetzt oben.

## [1.7.0] – 2026-11-05
### Neu
- Neue Inhalte: Arbeitsspeicher, Aufbau von Frames und Paketen, Software Defined Networking, Network Access Control, Zero Trust & Least Privilege, Open Source und Closed Source – dazu Zusatzwissen zu Prozessoren und Grafikkarten.

### Geändert
- Unterthemen sind immer aufgeklappt; die Navigation läuft über das Inhaltsverzeichnis in der Seitenleiste.
- „Meine Notiz“ erscheint erst nach Klick auf „Notiz hinzufügen“ – oder sofort, wenn schon eine Notiz da ist.

## [1.6.0] – 2026-11-05
### Neu
- Cheatsheets als Akkordeon: Öffnest du ein Unterthema, klappt das vorherige zu. Die angeklickte Überschrift bleibt dabei an ihrer Stelle.
- Mitlaufendes Inhaltsverzeichnis: In der Seitenleiste stehen unter dem aktuellen Themenfeld seine Unterthemen und das Zusatzwissen. Was du gerade liest, ist markiert; ein Klick springt hin und klappt auf. Die Seitenleiste bleibt beim Scrollen stehen (auf breiten Bildschirmen).

### Geändert
- Notizen und Lernpunkte werden auch gespeichert, wenn ein Unterthema zuklappt, während du noch tippst.

## [1.5.0] – 2026-11-05
### Neu
- Zusatzwissen ist mit seinen Unterthemen verknüpft: Im Unterthema erscheint „Vertiefung“ mit Sprung zum Zusatzwissen, im Zusatzwissen ein Rückverweis – auch über Themenfelder hinweg.
- Das Kompendium findet auch Zusatzwissen, mit eigenem Filter und den Abschnitten als Überblick.

### Geändert
- Zusatzwissen hat nur noch zwei Formate: Ablauf und Text mit Abschnitten. Checklisten und Vergleichskarten sind Abschnitte (`### Checkliste: …`, `### Vergleich: …` mit `#### Karten`). Das alte Format wird weiter gelesen.
- `check-content` prüft die Verweise `zu:`.

### Behoben
- `npm run typecheck` meldete seit 1.3.0 einen Typfehler im Inhalts-Parser (Vergleichskarten).

## [1.4.0] – 2026-11-05
### Neu
- Zusatzwissen: So arbeitet ein Mainboard (CPU, RAM, Chipsatz, GPU) und BSI IT-Grundschutz in der Praxis – mit Grafiken.
- Zusatz-Typ „Text“ mit Abschnitten (`###`): Absätze, Grafiken, eine Tabelle, Listen und nummerierte Schritte.

### Geändert
- Einzeln stehende Grafiken werden höchstens etwas größer als ihre Originalgröße angezeigt.

## [1.3.0] – 2026-11-05
### Neu
- Grafiken in den Cheatsheets: Abbildungen passen sich an Hell- und Dunkelmodus an.
- Neue Inhaltssyntax `### Abbildung: Titel` mit Bildzeilen `![Beschreibung](datei.svg)`; SVGs liegen in `content/bilder/`.
- Vergleichskarten können statt eines ASCII-Schemas eine Grafik zeigen.

### Geändert
- Vergleichskarten stehen jetzt höchstens zu zweit nebeneinander und sind dadurch besser lesbar.
- `check-content` prüft Bilder (fehlende Dateien, ungültige Namen, ungenutzte Grafiken).

## [1.2.0] – 2026-11-05
### Neu
- Zusatzwissen: Betriebssystemarchitekturen im Vergleich und DSGVO aus Sicht eines IT-Admins.
- Neuer Zusatzwissen-Typ „Checkliste“ (`typ: checkliste`) mit Bereichen und Prüfpunkten.

## [1.1.0] – 2026-11-05
### Neu
- Kompendium: alle Begriffe, Befehle, Tabellen, Merksätze und Prüfungsfragen aus den Cheatsheets an einem Ort – mit Suche, Filtern und A–Z-Leiste.
- Links aus dem Kompendium öffnen direkt das passende Unterthema im Cheatsheet.

## [1.0.1] – 2026-11-05
### Behoben
- Installation scheiterte unter Windows mit neuen Node-Versionen (z. B. Node 26), weil `better-sqlite3` kompiliert werden musste. Die App nutzt jetzt das in Node eingebaute SQLite (`node:sqlite`) – keine Build-Werkzeuge mehr nötig.

## [1.0.0] – 2026-11-04
### Neu
- Erste Version mit Übersicht, Cheatsheets, Prüfungen und Einstellungen.
- Ampel mit drei Stufen pro Unterthema, Lernpunkte bei „In Arbeit“ und Notizen.
- Zusatzwissen: Paketreise mit Router- und Firewall-Szenario, Systemarchitekturen im Vergleich.
- Export, Import und Zurücksetzen des Lernstands; automatische Sicherungen.
- Versionsanzeige, „Was ist neu?“ und Hinweis auf neue Versionen.
