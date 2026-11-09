# FISI-Lernkompass

Persönlicher Lern-Kompass für Auszubildende zum Fachinformatiker Systemintegration in Hamburg (Berufsschule ITECH, Prüfung vor der Handelskammer Hamburg). Zeigt per Ampel, welche Themen sitzen, sammelt Lernpunkte, liefert zu jedem Thema ein Cheatsheet und plant die Ausbildung Woche für Woche.

Version 1.28.1 · Code unter [MIT](LICENSE), Lerninhalte in `content/` unter [CC BY-SA 4.0](content/LICENSE).

> **Kein Login:** Die App ist für den eigenen Rechner oder das eigene Netz gedacht und darf **nie ungeschützt ins Internet**. Details in [SECURITY.md](SECURITY.md).

## Systemvoraussetzungen

| Was | Version | Wofür | Prüfen mit |
| --- | --- | --- | --- |
| **Git** | 2.30 oder neuer | Repository klonen und Updates holen (`git pull`) | `git --version` |
| **Node.js** | 22.16 oder neuer, empfohlen 24 LTS | App, Tests, Typprüfung, Inhalts-Check; die Datenbank nutzt das in Node eingebaute SQLite | `node --version` |
| **npm** | kommt mit Node.js | Abhängigkeiten installieren, Befehle starten | `npm --version` |
| Browser | aktuelles Chrome, Edge oder Firefox | Oberfläche; Berichtsheft als PDF über den Druckdialog | – |
| Docker Desktop (optional) | Compose v2 | nur für den Betrieb im Container statt mit Node | `docker compose version` |

Für die Tests braucht es **nichts zusätzlich**: Vitest, TypeScript und alle anderen Werkzeuge installiert `npm install` in den Projektordner. Es muss nichts kompiliert werden und kein Datenbankserver laufen – die Tests legen ihre Datenbank im Speicher an.

**Installation unter Windows:** Git von [git-scm.com](https://git-scm.com/download/win), Node.js als LTS-Installer von [nodejs.org](https://nodejs.org/) oder per `winget install OpenJS.NodeJS.LTS` und `winget install Git.Git`. Danach ein neues Terminal öffnen, damit `git` und `node` gefunden werden.

**Erste Einrichtung:**

```bash
git clone https://github.com/extrempro/fisi-lernkompass
cd fisi-lernkompass
npm install            # Abhängigkeiten (einmalig und nach Updates)
npm test               # alle Tests
npm run typecheck      # TypeScript-Prüfung
npm run check-content  # Inhalte prüfen
```

Alle drei Prüfungen sollten ohne Fehler durchlaufen. Den Lernstand aus einer älteren Installation übernimmst du, indem du deren Ordner `data` in den neuen Projektordner kopierst.

## Schnellstart

```bash
npm install
npm run dev
```

Dann im Browser **http://localhost:5173** öffnen. Vite liefert das Frontend mit Live-Aktualisierung, das Backend läuft auf Port 3000; Vite leitet `/api` dorthin weiter. Beim ersten Start wird die Datenbank `data/lernkompass.db` angelegt.

> Unter Node 22 erscheint beim Start einmal der Hinweis „SQLite is an experimental feature“. Das ist normal und kann ignoriert werden.

## Befehle

| Befehl | Was passiert |
| --- | --- |
| `npm run dev` | Entwicklung: Frontend (Vite) + Backend (Fastify), Inhalte werden bei Änderung neu geladen |
| `npm run build` | Frontend-Build nach `dist/` |
| `npm run typecheck` | TypeScript-Prüfung von Frontend, Backend und Skripten |
| `npm start` | Produktionsbetrieb: Fastify liefert `dist/` und die API auf Port 3000 aus (vorher `npm run build`) |
| `npm run check-content` | Prüft alle Inhalte in `content/` (IDs, Tabellen, Format) – vor jedem Ausrollen |
| `npm test` | Tests: Inhalts-Parser, Ferien, Migrationen, Ausbildungsplan, Berichtsheft mit Unterschrift, Prüfungstraining |
| `npm run backup` | Manuelle Sicherung der Datenbank nach `data/backups/` |

Konfiguration über Umgebungsvariablen (siehe `.env.example`): `PORT`, `HOST`, `DATA_DIR`, `CONTENT_DIR`, `ALLOW_CONTENT_RELOAD`.

## Aufbau

```
src/                 Frontend (React, Vite, Tailwind, React Query)
  pages/             Übersicht, Cheatsheets, Kompendium, Üben, Ausbildungsplan, Berichtsheft, Prüfungen, Einstellungen
  ueben/             Karteikarten, Quiz, Prüfungssimulation, Rechner
  bericht/           Berichtsheft: Eingabe, Status-Knopf, Druck/PDF
  components/        Navigation, Banner, Fußzeile, Ampel-Schalter, Dialog, Textfelder
  plan/              Ausbildungsplan: Eintrags-Editor, Seitenleiste, Arten von Einträgen
  zusatz/            Zusatzwissen: interaktiver Ablauf, Vergleichskarten, Checklisten
  lib/               Ampel-Berechnung, Datumslogik, Kalenderwochen, Prüfungsdaten, Theme
server/              Backend (Fastify, SQLite)
  content/           Inhalts-Parser und -Laden (auch vom Prüfskript genutzt)
  migrations/        nummerierte SQL-Migrationen
  test/              Tests
content/             Inhalte (Markdown/JSON, Grafiken in content/bilder/) – getrennt vom Code
scripts/             check-content, backup
data/                Datenbank und Sicherungen (nicht im Git)
Dockerfile, docker-compose.yml, docker-entrypoint.sh   Betrieb im Container
```

Drei getrennte Teile: **Anwendung** (Code), **Inhalte** (`content/`) und **Lernstand** (`data/lernkompass.db`). Inhalte lassen sich ändern, ohne Code oder Datenbank anzufassen.

## Inhalte pflegen

1. Datei in `content/themen/<slug>.md` bearbeiten (Format: siehe die Beispiele unten und die vorhandenen Themen-Dateien).
2. Mit `npm run dev` ansehen – Änderungen erscheinen nach dem Speichern.
3. `npm run check-content` ausführen.
4. `content/meta.json` (`stand`) aktualisieren und `content/CHANGELOG.md` ergänzen, dann committen.

Grafiken: SVG-Datei nach `content/bilder/` legen (Name nur a–z, 0–9, `-`) und im Unterthema einbinden:

```markdown
### Abbildung: RJ45-Belegung
![T568B: ws/or, or, ws/gn, bl, ws/bl, gn, ws/br, br](rj45-t568b.svg)
```

In Vergleichskarten genügt die Bildzeile direkt unter dem Kartentitel. Damit die Grafik im Dunkelmodus funktioniert, nutzt sie statt fester Farben die Klassen `sv-*` (Liste in `src/index.css`). Skripte und Event-Attribute werden beim Laden entfernt.

Zusatzwissen gibt es in zwei Formen: als interaktiven Ablauf (`ablauf: datei.json`) oder als Text mit Abschnitten (`typ: text`). Mit `zu:` gibst du an, welche Unterthemen es vertieft – dort erscheint dann ein Hinweis mit Sprung. Andere Themenfelder erreichst du mit `themenfeld.unterthema`.

```markdown
## Zusatz: So arbeitet ein Mainboard {#mainboard}
typ: text
zu: pc-komponenten, bussysteme, betriebssysteme.bootprozess

Einleitung (erscheint unter dem Titel).

### Ein normaler Abschnitt
Absätze, Bildzeilen, eine Tabelle, Listenpunkte (`- `) und nummerierte Schritte (`1. `).

### Checkliste: Rechte und Zugriffe
- Punkte erscheinen mit Haken.

### Vergleich: Kernel-Modelle
#### Mikrokernel
![Beschreibung](os-mikrokernel.svg)
- **Kurz:** …
- **Plus:** …
- **Minus:** …
- **Beispiel:** …
```

Das ältere Format mit `typ: vergleich` oder `typ: checkliste` wird weiter gelesen; `check-content` weist darauf hin.

Wichtig: Unterthemen haben feste IDs (`## Subnetting {#subnetting}`). Der Lernstand hängt an der ID, nicht am Titel. Eine ID nur ändern, wenn die alte in `content/umbenennungen.json` auf die neue zeigt.

## Versionen

- **App-Version** in `package.json` (SemVer), Änderungen in `CHANGELOG.md`. Neue Version: Changelog ergänzen, Version in `package.json` erhöhen, Commit „Version X.Y.Z …“ nach `main`. Danach legt GitHub Actions (`.github/workflows/releases.yml`) automatisch das Release mit Tag `vX.Y.Z` und dem Changelog-Text an; fehlende ältere Releases ergänzt es dabei ebenfalls. Von Hand anstoßen: auf GitHub unter Actions → Releases → „Run workflow“.
- **Inhaltsstand** in `content/meta.json`.
- **Datenbank-Schema** = höchste Datei in `server/migrations/`. Migrationen laufen beim Start automatisch, vorher wird gesichert.

Alle drei stehen in der Fußzeile bzw. unter Einstellungen → „Über die App“.

## Betrieb

Die App hat kein Login. Im Heimnetz betreiben oder per VPN (z. B. NetBird, Tailscale) erreichen – **nie ungeschützt ins Internet stellen**. Mehr in [SECURITY.md](SECURITY.md).

## Betrieb mit Docker

Alternative zu `npm install` und `npm start`: Die App läuft in einem Container, Node.js muss auf dem Rechner nicht installiert sein. Voraussetzung ist Docker – unter Windows und macOS **Docker Desktop**, unter Linux Docker Engine mit Compose-Plugin.

```bash
docker compose up -d --build
```

Dann im Browser **http://localhost:3000** öffnen. Der erste Build dauert einige Minuten, weil die Abhängigkeiten im Container installiert werden.

| Befehl | Was passiert |
| --- | --- |
| `docker compose up -d --build` | Image bauen und Container im Hintergrund starten (auch nach jedem Update) |
| `docker compose logs -f` | Ausgaben des Servers verfolgen |
| `docker compose ps` | Status anzeigen – „healthy“ heißt: läuft |
| `docker compose down` | Container stoppen (Daten bleiben erhalten) |
| `docker compose exec app npm run backup` | manuelle Sicherung nach `data/backups/` |
| `docker compose exec app npm run check-content` | Inhalte prüfen |

So ist der Container aufgebaut:

- **Ein Container**: Fastify liefert Frontend und API auf Port 3000, die App läuft als normaler Benutzer (nicht root).
- **`./data`** wird eingebunden: Datenbank und Sicherungen liegen weiter in deinem Projektordner und überstehen jedes Update.
- **`./content`** wird nur lesend eingebunden. Änderungen an den Inhalten übernimmt die App nach wenigen Sekunden ohne Neustart (`CONTENT_WATCH` in `docker-compose.yml`).
- Der Port ist standardmäßig nur auf diesem Rechner erreichbar (`127.0.0.1:3000`). Einen anderen Port oder die Freigabe im Netz stellst du in einer eigenen Datei `docker-compose.override.yml` ein, die Docker Compose automatisch mitliest. Sie steht in `.gitignore`, `git pull` überschreibt sie also nicht:

  ```bash
  cp docker-compose.override.example.yml docker-compose.override.yml
  # Port anpassen, z. B. "127.0.0.1:8988:3000" (nur dieser Rechner) oder "8988:3000" (alle Geräte im Netz)
  docker compose up -d
  ```

  `ports: !override` ersetzt die Zuordnung aus `docker-compose.yml` (Docker Compose ab Version 2.24, prüfen mit `docker compose version`). Was am Ende gilt, zeigt `docker compose config`. Im Container lauscht die App immer auf Port 3000; ein Reverse Proxy im selben Compose-Netz spricht sie als `app:3000` an.

**Von `npm start` auf Docker umsteigen:** Den bisherigen Server beenden (sonst ist Port 3000 belegt und beide würden dieselbe Datenbank öffnen), dann im selben Ordner `docker compose up -d --build`. Der vorhandene `data`-Ordner wird übernommen.

**Update:** Neue Version wie gewohnt in denselben Ordner entpacken und überschreiben, dann `docker compose up -d --build`. Migrationen laufen beim Start automatisch, vorher wird gesichert.

**Linux-Hinweis:** Die App schreibt als Benutzer mit der UID 1000. Meldet der Container „In den Datenordner … kann nicht geschrieben werden“, hilft `sudo chown -R 1000:1000 ./data`.

## Ausbildungsdauer und Verkürzung

Unter **Einstellungen → Ausbildung** trägst du neben dem Beginn eine Verkürzung ein (0–18 Monate, Regeldauer 36, Mindestdauer 18): **am Ende** (Ausbildung endet früher, Jahre zählen ab dem 1.) oder **am Anfang angerechnet** (Start in einem höheren Ausbildungsjahr). Ein abweichendes Vertragsende hat Vorrang vor der Berechnung. Die vorzeitige Zulassung zur Prüfung ändert das Vertragsende nicht, wird aber auf der Prüfungsseite berücksichtigt. Rechenlogik in `src/lib/kalender.ts` (`ausbildungsdauer`, `wochenAus`), Tests in `server/test/ausbildungsdauer.test.ts`.

## Ausbildungsplan

Der Menüpunkt **Ausbildungsplan** zeigt jede Kalenderwoche von der Woche des Ausbildungsbeginns bis zum Ende der Regeldauer (drei Jahre), gruppiert nach Ausbildungsjahr. Voraussetzung ist der Ausbildungsbeginn in den Einstellungen.

| Eintrag | Wofür |
| --- | --- |
| Schulblock | Berufsschule; gilt für eine oder mehrere Wochen und färbt diese Wochen violett |
| Themenfeld | verknüpft ein Themenfeld und zeigt dessen aktuellen Lernstand |
| Aufgabe | zum Abhaken, z. B. Berichtsheft, auch mit Unteraufgaben; überfällige Aufgaben werden oben gezählt |
| Notiz | eigener Text, z. B. Urlaub oder Projektwoche |

Prüfungstermine aus den Einstellungen, Ausbildungsbeginn und voraussichtliches Ende erscheinen automatisch in der passenden Woche. Hamburger Schulferien (aus `content/ferien-hamburg.json`, Ferienordnung bis Schuljahr 2029/30) und gesetzliche Feiertage (berechnet) stehen ebenfalls in den Wochen. Neue Schuljahre trägt man in der JSON-Datei nach; `npm run check-content` prüft sie. Die Seitenleiste zeigt beim Scrollen Ausbildungsjahr, Monat und KW und springt per Klick zu jedem Jahr, Monat oder jeder Woche. Die Einträge liegen in der Datenbank (Tabelle `plan_eintrag`) und sind in Export und Import enthalten; „Fortschritt zurücksetzen“ lässt den Plan unangetastet.

## Üben

Unter **Üben** stehen Karteikarten, ein Quiz und eine Prüfungssimulation – erzeugt aus den Kernbegriffen und Prüfungsfragen der Cheatsheets, es muss also nichts extra gepflegt werden. Karteikarten folgen dem Leitner-System (Fach 1–5: gewusst → später wieder, nicht gewusst → morgen). Die Simulation stellt Multiple-Choice-Fragen gleichmäßig aus den Themenfeldern einer Prüfung zusammen und bewertet nach dem IHK-Notenschlüssel; sie ersetzt keine echten Prüfungsaufgaben mit Rechnungen und offenen Fragen. Der Übungsstand liegt in den Tabellen `karte` und `pruefung_versuch`.

Der Reiter **Rechner** rechnet Subnetting, Datenmengen, Übertragungsdauer, RAID-Kapazität und Plattenbedarf, Speicherbedarf mit Komprimierung, USV, Verfügbarkeit, VoIP-Bandbreite, Stromkosten und Amortisation mit Rechenweg und stellt Übungsaufgaben mit Zufallswerten (`src/lib/rechner.ts`, getestet in `server/test/rechner.test.ts`).

## Hilfe (Handbuch)

Unter **/hilfe** (Fragezeichen in der Navigation, „Hilfe“ in der Fußzeile) steht das Handbuch für Azubis. Der Text liegt in `src/lib/handbuch.ts` und wird bei Änderungen an der App mitgepflegt; `server/test/handbuch.test.ts` prüft IDs, Tabellen und dass verlinkte Seiten existieren.

## Prüfungstechnik

Unter **Prüfungen → Prüfungstechnik** erklärt die App die Arbeitsaufträge der schriftlichen Prüfung (nennen, beschreiben, erläutern, begründen …) mit Beispielen, übt mit der Frage „Welche Antwort bekommt volle Punkte?“ und fasst Spielregeln und Zeittipps zusammen. Inhalte in `src/lib/pruefungstechnik.ts`, geprüft in `server/test/pruefungstechnik.test.ts`. Alle Beispiele sind selbst geschrieben – keine Originalaufgaben.

## Abschlussprojekt

Unter **Prüfungen → Abschlussprojekt** begleitet die App die betriebliche Projektarbeit (Teil 2): Termine der Handelskammer (erscheinen auch im Ausbildungsplan), Checklisten für Projektantrag und Dokumentation nach dem Merkblatt der Handelskammer Hamburg, eine Zeitplanung mit höchstens 40 Stunden, ein 15-Minuten-Timer zum Üben der Präsentation und typische Fragen im Fachgespräch mit eigenen Stichworten. Die Inhalte stehen in `src/lib/projekt.ts`, die eigenen Eingaben in der Tabelle `projekt` (in Export und Import enthalten). Maßgeblich bleibt immer das aktuelle Merkblatt der Kammer.

## Berichtsheft

Ausbildungsnachweise werden wöchentlich geführt (Menüpunkt **Berichtsheft** oder der Status-Knopf an jeder Woche im Ausbildungsplan). Pro Woche: betriebliche Tätigkeiten, Unterweisungen, Berufsschule und Abwesenheit, jeweils mit Stunden. Name, Betrieb, Ausbilder/in und Wochenarbeitszeit stehen unter Einstellungen → Berichtsheft.

**Drucken / PDF:** Auf der Berichtsheft-Seite „Alle drucken“, „Auswahl drucken“ oder das Drucker-Symbol einer Woche wählen; im Druckdialog des Browsers „Als PDF speichern“. Eine A4-Seite pro Woche, auf Wunsch mit Deckblatt. Diese Datei lädst du bei der Anmeldung zu Teil 1 und Teil 2 im Azubi-Infocenter der Handelskammer hoch (höchstens 20 MB pro Datei).

**Digital abzeichnen:** Auf der Berichtsheft-Seite „Digital abzeichnen lassen“ – die Ausbilderin oder der Ausbilder wählt die fertigen Berichte aus und unterschreibt einmal im Feld (Finger, Stift oder Maus). Die Unterschrift erscheint mit Name und Datum auf jedem ausgewählten Nachweis im PDF. Ändert man einen unterschriebenen Bericht danach, entfällt seine Unterschrift. Rechtlich ist das eine einfache elektronische Signatur; die Handelskammer lässt bei elektronischen Berichtsheften eine elektronische Bestätigung zu – im Zweifel mit dem Betrieb abstimmen.

Die Berichte liegen in der Tabelle `bericht`, Unterschriften in `unterschrift`; beides ist in Export und Import enthalten.

## Stand dieser Version

- Alle 13 Themenfelder mit Inhalt (112 Unterthemen), dazu Zusatzwissen, rund 100 Grafiken, Abläufe und Werkzeuge.
- Inhalte vor dem Einsatz gegen Berufsschulmaterial und AkA-Prüfungskatalog prüfen, besonders Zahlenwerte.

## Lizenz

- **Code:** MIT, siehe [LICENSE](LICENSE).
- **Lerninhalte** (`content/`: Texte, Tabellen, Grafiken, Abläufe): CC BY-SA 4.0, siehe [content/LICENSE](content/LICENSE).
- Prüfungsaufgaben und -lösungen von Prüfungsaufgabenstellen oder Verlagen sind bewusst nicht enthalten.
