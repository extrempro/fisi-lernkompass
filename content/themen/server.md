---
titel: Server & Virtualisierung
---

Wie Server Dienste bereitstellen, wie Virtualisierung und Container Hardware besser ausnutzen und wie du Daten mit RAID, Backup und USV absicherst.

## Serverrollen {#serverrollen}

### Kernbegriffe
- **Serverrolle:** Aufgabe, die ein Server im Netz übernimmt, z. B. Dateiablage oder Anmeldung.
- **Bauformen:** Tower (Einzelplatz, kleines Büro), Rack-Server (in 19-Zoll-Schränken, 1 HE = 44,45 mm), Blade (viele Server in einem Gehäuse).
- **Redundanz:** Doppelte Komponenten wie Netzteile oder Lüfter, oft im laufenden Betrieb tauschbar (Hot-Swap).
- **Fernwartung:** Eigener Verwaltungschip mit Netzwerkzugang (z. B. iDRAC, iLO, IPMI) – auch wenn das Betriebssystem hängt.

### Tabelle: Typische Rollen
| Rolle | Aufgabe | Beispiele |
| --- | --- | --- |
| Domänencontroller | Anmeldung, Benutzer, Richtlinien | Active Directory |
| Fileserver | Freigaben, Rechte | Windows-Freigaben, Samba |
| Printserver | Drucker zentral verwalten | Windows-Druckdienste, CUPS |
| Webserver | Webseiten und Anwendungen | IIS, Apache, nginx |
| Datenbankserver | Daten speichern und abfragen | SQL Server, MariaDB, PostgreSQL |
| Mailserver | E-Mails senden und empfangen | Exchange, Postfix |
| DHCP/DNS | Adressen und Namensauflösung | Windows Server, dnsmasq |

### Merksatz
Wichtige Rollen nie nur auf einem Server: Ausfall eines Geräts darf den Betrieb nicht stoppen.

## Hypervisor (Typ 1/2) {#hypervisor}

### Kernbegriffe
- **Virtualisierung:** Mehrere virtuelle Maschinen (VMs) teilen sich die Hardware eines Hosts.
- **Hypervisor:** Software, die VMs startet und die Hardware zwischen ihnen aufteilt.
- **Snapshot:** Momentaufnahme einer VM für schnelles Zurückspringen – kein Backup.
- **Live-Migration:** VM wird im laufenden Betrieb auf einen anderen Host verschoben.
- **Overcommitment:** Den VMs wird mehr RAM oder CPU zugewiesen, als physisch vorhanden ist.

### Abbildung: Hypervisor Typ 1 und Typ 2
![Links Typ 1 (Bare Metal): Hardware, darauf direkt der Hypervisor (z. B. ESXi, Hyper-V, Proxmox VE), darauf drei VMs mit je Gast-Betriebssystem und Anwendung. Rechts Typ 2 (Hosted): Hardware, Host-Betriebssystem, darauf der Hypervisor als Programm (z. B. VirtualBox) neben anderen Programmen, darauf zwei VMs. Typ 1 hat eine Schicht weniger und damit mehr Leistung.](hypervisor-typen.svg)

### Tabelle: Typ 1 und Typ 2
| | Typ 1 (Bare Metal) | Typ 2 (Hosted) |
| --- | --- | --- |
| Läuft auf | direkt auf der Hardware | auf einem Betriebssystem |
| Leistung | hoch | geringer |
| Einsatz | Rechenzentrum, Server | Testumgebung, Schulung |
| Beispiele | VMware ESXi, Hyper-V, Proxmox VE | VirtualBox, VMware Workstation |

### Merksatz
Typ 1 ist das Betriebssystem, Typ 2 läuft auf einem Betriebssystem.

## Container {#container}

### Kernbegriffe
- **Container:** Isolierte Umgebung für eine Anwendung, teilt sich den Kernel mit dem Host – startet in Sekunden.
- **Image:** Vorlage, aus der Container gestartet werden; wird schichtweise gebaut (Dockerfile).
- **Registry:** Ablage für Images, z. B. Docker Hub.
- **Volume:** Speicher außerhalb des Containers, damit Daten einen Neustart oder ein Update überleben.

### Abbildung: Virtuelle Maschinen und Container
![Links drei virtuelle Maschinen, jede mit App, Bibliotheken und eigenem Gast-Betriebssystem, auf einem Hypervisor und der Hardware. Rechts vier Container mit App und Bibliotheken auf einer Container-Engine wie Docker, die sich den Kernel eines Host-Betriebssystems teilen. VMs sind stärker getrennt, aber groß und langsam beim Start; Container sind klein und starten in Sekunden, sind aber schwächer isoliert.](container-vm.svg)

### Tabelle: VM und Container
| | VM | Container |
| --- | --- | --- |
| Enthält | eigenes Betriebssystem | nur Anwendung und Bibliotheken |
| Start | Minuten | Sekunden |
| Größe | Gigabytes | Megabytes |
| Isolation | stark | geringer (gemeinsamer Kernel) |

### Befehle
- `docker run -d -p 8080:80 nginx` – Container im Hintergrund starten, Port 8080 weiterleiten
- `docker ps` – laufende Container anzeigen
- `docker logs -f <name>` – Protokoll eines Containers verfolgen
- `docker compose up -d` – alle Dienste aus docker-compose.yml starten

### Merksatz
Container sind wegwerfbar – alles Wichtige gehört in ein Volume.

## RAID {#raid}

### Kernbegriffe
- **RAID:** Zusammenschluss mehrerer Festplatten für mehr Leistung und/oder Ausfallsicherheit.
- **Spiegelung:** Daten liegen identisch auf zwei Platten (RAID 1).
- **Parität:** Prüfinformation, aus der fehlende Daten berechnet werden (RAID 5 und 6).
- **Rebuild:** Wiederherstellung nach Plattentausch – in dieser Zeit ist das RAID besonders gefährdet.
- **Hot Spare:** Zusätzliche, eingebaute Ersatzplatte, die bei einem Ausfall automatisch einspringt und den Rebuild sofort startet; sie zählt nicht zur Nutzkapazität.
- **Cold Spare:** Ersatzplatte, die im Schrank liegt und von Hand eingebaut wird.
- **Plattenbedarf berechnen:** Benötigte Kapazität ÷ Plattengröße, aufrunden, dann die Platten für Parität (RAID 5: +1, RAID 6: +2) und Hot Spares addieren.

### Tabelle: RAID-Level
| Level | Mindestplatten | Nutzkapazität | Ausfallsicherheit |
| --- | --- | --- | --- |
| RAID 0 | 2 | n · Platte | keine |
| RAID 1 | 2 | 1 Platte | 1 Platte |
| RAID 5 | 3 | (n − 1) · Platte | 1 Platte |
| RAID 6 | 4 | (n − 2) · Platte | 2 Platten |
| RAID 10 | 4 | n ÷ 2 · Platte | 1 Platte je Spiegel |

### Tabelle: Beispiel – wie viele Platten für RAID 6 mit Hot Spare?
| Schritt | Rechnung |
| --- | --- |
| Speicherbedarf | 4 TiB Datenbank + 2 TiB Wachstum + 3 TiB Reserve = 9 TiB |
| Platten für die Daten | 9 TiB ÷ 2 TiB = 4,5 → aufrunden auf 5 Platten |
| Parität bei RAID 6 | + 2 Platten → 7 |
| Hot Spare | + 1 Platte → **8 Platten** |

### Merksatz
RAID ersetzt kein Backup – gelöschte oder verschlüsselte Daten sind auf allen Platten weg.

### Prüfungsfrage
Ein Server hat vier Festplatten mit je 4 TB. Wie viel nutzbarer Speicher steht bei RAID 5 und bei RAID 10 zur Verfügung?

1. RAID 5: (4 − 1) · 4 TB = 12 TB, eine Platte darf ausfallen.
2. RAID 10: 4 ÷ 2 · 4 TB = 8 TB, je Spiegelpaar darf eine Platte ausfallen.

## Backup-Strategien {#backup}

### Kernbegriffe
- **Vollsicherung:** Alle Daten werden gesichert.
- **Inkrementell:** Nur Änderungen seit der letzten Voll- oder inkrementellen Sicherung (alles mit gesetztem Archivbit) – eine differenzielle Sicherung dazwischen zählt nicht.
- **Differenziell:** Alle Änderungen seit der letzten Vollsicherung – genauer: seit der letzten Sicherung, die das Archivbit zurückgesetzt hat.
- **3-2-1-Regel:** 3 Kopien, auf 2 verschiedenen Medien, 1 davon außer Haus (oder offline).
- **RPO/RTO:** Wie viel Datenverlust akzeptabel ist (Recovery Point Objective) und wie schnell es wieder laufen muss (Recovery Time Objective).
- **Generationenprinzip:** Großvater-Vater-Sohn – z. B. Monats-, Wochen- und Tagessicherungen.
- **Archivbit:** Dateiattribut, das beim Ändern einer Datei gesetzt wird. Voll- und inkrementelle Sicherung setzen es zurück, die differenzielle lässt es stehen – daran erkennt die nächste Sicherung, was neu ist. Moderne Software nutzt stattdessen oft eigene Änderungsprotokolle, das Prinzip bleibt gleich.
- **Klonen (Image):** 1:1-Abbild eines ganzen Datenträgers samt Bootbereich, Partitionen und Einstellungen; so groß wie die Quelle, ideal für die schnelle Wiederherstellung kompletter Systeme. Das Archivbit bleibt unverändert.
- **Snapshot:** Momentaufnahme eines Volumes oder einer VM; schnell angelegt, liegt aber auf demselben System und ist deshalb kein Ersatz für ein Backup.
- **LTO (Linear Tape Open):** Standard für Magnetbänder; günstig pro Terabyte, lange haltbar und offline lagerbar – damit Schutz gegen Ransomware. LTO-9 fasst 18 TB unkomprimiert.
- **LTFS (Linear Tape File System):** Dateisystem für LTO-Bänder; ein Band erscheint wie ein Laufwerk, Dateien lassen sich per Drag-and-drop kopieren und ohne spezielle Backup-Software lesen.
- **Auslagerungsdatei:** pagefile.sys bzw. Swap enthält nur flüchtige Inhalte des Arbeitsspeichers und wird beim Start neu angelegt – sie muss nicht gesichert werden und wird beim Restore ausgelassen.

### Tabelle: Sicherungsarten
| Art | Sicherung | Wiederherstellung | Speicherbedarf |
| --- | --- | --- | --- |
| Voll | langsam | schnell (1 Sicherung) | hoch |
| Differenziell | mittel, wächst täglich | mittel (Voll + letzte Differenzielle) | mittel |
| Inkrementell | schnell | langsam (Voll + alle Inkremente) | gering |

### Tabelle: Sicherungsarten und Archivbit
| Art | Was wird gesichert? | Archivbit danach |
| --- | --- | --- |
| Vollsicherung | alle ausgewählten Daten | zurückgesetzt |
| Differenziell | alles mit gesetztem Archivbit (seit der letzten Voll- oder inkrementellen Sicherung) | bleibt gesetzt |
| Inkrementell | alles mit gesetztem Archivbit | zurückgesetzt |
| Klonen / Kopie | der ganze Datenträger bzw. die Auswahl | unverändert |

### Tabelle: Wiederherstellung, wenn der Plan einen Fehler hatte
| Tag | So | Mo | Di | Mi | Do | Fr |
| --- | --- | --- | --- | --- | --- | --- |
| geplant | Voll | Diff | Diff | Diff | Diff | Diff |
| tatsächlich | Voll | Diff | Diff | **Inkr** | Diff | Diff |
| enthält Änderungen von | – | Mo | Mo–Di | Mo–Mi (Archivbit stand noch) | nur Do | Do–Fr |

Ausfall am Samstag: Vollsicherung vom Sonntag + Inkrementelle vom Mittwoch + Differenzielle vom Freitag. Die Sicherungen von Montag und Dienstag braucht man nicht, weil die inkrementelle Sicherung am Mittwoch alles seit Sonntag enthält und das Archivbit zurückgesetzt hat.

### Merksatz
Ein Backup ist erst gut, wenn die Wiederherstellung getestet wurde. Inkrementell und Voll setzen das Archivbit zurück, differenziell nicht.

### Prüfungsfrage
Sonntag Vollsicherung, Montag bis Freitag abends Sicherungen. Donnerstag früh fällt der Server aus. Welche Sicherungen brauchst du – inkrementell und differenziell?

1. Inkrementell: Vollsicherung + Montag + Dienstag + Mittwoch.
2. Differenziell: Vollsicherung + Mittwoch.

## Archivierung und Wiederherstellung {#archivierung}

### Kernbegriffe
- **Backup und Archiv:** Ein Backup ist eine Kopie aktueller Daten für den Notfall und wird regelmäßig überschrieben. Ein Archiv bewahrt abgeschlossene Daten langfristig, unveränderbar und auffindbar auf, oft wegen gesetzlicher Pflichten. Ein Backup ersetzt kein Archiv – und umgekehrt.
- **Aufbewahrungsfristen:** Handels- und Steuerrecht (§ 257 HGB, § 147 AO) schreiben vor, wie lange Unterlagen aufzubewahren sind. Die Frist beginnt am Ende des Kalenderjahres, in dem die Unterlage entstanden ist.
- **GoBD:** Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern in elektronischer Form. Archivierte Daten müssen vollständig, richtig, unveränderbar, nachvollziehbar und jederzeit lesbar sein.
- **Revisionssicher:** Archivierte Daten lassen sich nicht unbemerkt ändern oder löschen; jeder Zugriff ist protokolliert.
- **WORM:** Write Once, Read Many – Speicher, auf den nur einmal geschrieben werden kann, z. B. als Objektsperre (Object Lock) in Cloud- oder Backup-Speichern.
- **Langzeitformate:** Dokumente in Formaten ablegen, die auch in vielen Jahren lesbar sind, z. B. PDF/A. E-Rechnungen (XRechnung, ZUGFeRD) im Originalformat aufbewahren.
- **Löschen und Aufbewahren:** Die DSGVO verlangt Löschung, sobald der Zweck entfällt – gesetzliche Aufbewahrungspflichten gehen aber vor. Dann werden die Daten gesperrt (nur noch für die Aufbewahrung nutzbar) und nach Fristende gelöscht.
- **Wiederherstellungskonzept:** Legt fest, wie Daten und Systeme nach einem Ausfall wiederhergestellt werden: Reihenfolge, Verantwortliche, Zielzeiten (RTO, RPO), benötigte Zugangsdaten und Medien.
- **Notfallhandbuch und Wiederanlaufplan:** Schritt-für-Schritt-Anleitungen für den Ernstfall, auch auf Papier und außerhalb der IT erreichbar. Grundlage im BSI-Standard 200-4 (Business Continuity Management).
- **Wiederherstellungstest:** Nur ein getesteter Restore ist ein sicherer Restore – regelmäßig einzelne Dateien und ganze Systeme probeweise zurückspielen.
- **Bare-Metal-Recovery:** Ein komplettes System samt Betriebssystem auf neuer, leerer Hardware wiederherstellen.
- **Komprimierungsrate:** Gibt an, um wie viel die Datenmenge kleiner wird. Bei 60 % Komprimierung bleiben 40 % übrig: 30 GiB × 0,4 = 12 GiB. Aus der Aufgabe muss klar werden, ob die Rate die Ersparnis oder den Rest meint.
- **Speicherbedarf für ein Archiv:** Datenmenge pro Monat × Restanteil nach Komprimierung × 12 Monate × Jahre der Aufbewahrung; umgekehrt reicht ein vorhandener Speicher Kapazität ÷ jährlichem Bedarf Jahre (abrunden).

### Tabelle: Wichtige Aufbewahrungsfristen
| Unterlage | Frist |
| --- | --- |
| Handelsbücher, Inventare, Jahresabschlüsse, Lageberichte, Eröffnungsbilanzen | 10 Jahre |
| Buchungsbelege, z. B. Rechnungen, Kontoauszüge, Lieferscheine | 8 Jahre (seit 2025, vorher 10) |
| empfangene und abgesandte Handels- und Geschäftsbriefe, auch E-Mails mit diesem Inhalt | 6 Jahre |

### Tabelle: Backup und Archiv im Vergleich
| Merkmal | Backup | Archiv |
| --- | --- | --- |
| Zweck | Wiederherstellung nach Verlust | langfristige, gesetzeskonforme Aufbewahrung |
| Daten | aktuelle Daten, auch in Bearbeitung | abgeschlossene Daten |
| Dauer | Tage bis Monate, wird überschrieben | Jahre |
| Veränderbarkeit | wird regelmäßig ersetzt | unveränderbar (revisionssicher) |
| Zugriff | im Notfall | jederzeit recherchierbar |

### Merksatz
Backup rettet, Archiv bewahrt. Was du nicht wiederhergestellt hast, kannst du nicht – also testen und den Wiederanlauf aufschreiben.

### Prüfungsfrage
Eine Eingangsrechnung stammt vom März 2024. Bis wann muss sie aufbewahrt werden, und wie muss das Archiv beschaffen sein?

1. Rechnungen sind Buchungsbelege: Frist 8 Jahre (gilt seit 2025 auch für ältere Belege, deren Frist noch lief).
2. Die Frist beginnt am Ende des Kalenderjahres: 31.12.2024.
3. Aufbewahren bis 31.12.2032; vernichten oder löschen ab 2033.
4. Archiv nach GoBD: vollständig, unveränderbar, jederzeit lesbar und auffindbar – z. B. revisionssicheres Archivsystem; E-Rechnungen im Originalformat.

## USV {#usv}

### Kernbegriffe
- **USV:** Unterbrechungsfreie Stromversorgung – überbrückt Stromausfälle und schützt vor Spannungsschwankungen.
- **Überbrückungszeit:** Wie lange die Akkus die Last tragen; reicht meist zum sauberen Herunterfahren.
- **Scheinleistung (VA) und Wirkleistung (W):** W = VA · Leistungsfaktor; beide Werte müssen zur Last passen.
- **Shutdown-Signal:** Die USV meldet über USB oder Netzwerk, dass Server herunterfahren sollen.

### Abbildung: Die drei USV-Typen
![Offline oder Standby (VFD): Der Strom geht im Normalbetrieb direkt vom Netz zum Server, nur bei Ausfall schaltet ein Schalter auf Akku und Wechselrichter um, mit einigen Millisekunden Umschaltzeit. Line-Interactive (VI): wie Offline, zusätzlich gleicht ein Regeltransformator Spannungsschwankungen aus. Online oder Doppelwandler (VFI): Netz, Gleichrichter, Akku und Wechselrichter liegen immer in Reihe, die Last hängt dauerhaft am Wechselrichter, es gibt keine Umschaltzeit.](usv-typen.svg)

### Tabelle: USV-Typen
| Typ (Klasse) | Funktion | Einsatz |
| --- | --- | --- |
| Offline / Standby (VFD) | schaltet erst bei Ausfall um | Arbeitsplatz-PC |
| Line-Interactive (VI) | regelt zusätzlich Spannungsschwankungen | kleine Server, Netzwerktechnik |
| Online / Doppelwandler (VFI) | versorgt dauerhaft über Akku-Wechselrichter, keine Umschaltzeit | Rechenzentrum, kritische Server |

### Merksatz
Online-USV = immer auf Akku-Strom, keine Umschaltlücke.

### Prüfungsfrage
Server und Switch ziehen zusammen 900 W. Reicht eine USV mit 1500 VA und Leistungsfaktor 0,9?

1. Wirkleistung der USV: 1500 VA · 0,9 = 1350 W
2. 1350 W > 900 W → reicht, mit Reserve.
3. Reserve ist wichtig: Akkus altern, und Geräte können beim Start mehr ziehen.

## Hochverfügbarkeit {#hochverfuegbarkeit}

### Kernbegriffe
- **Verfügbarkeit:** Anteil der Zeit, in der ein System nutzbar ist, in Prozent: (Gesamtzeit − Ausfallzeit) ÷ Gesamtzeit × 100.
- **Hochverfügbarkeit (HA):** Ein System bleibt auch beim Ausfall einzelner Komponenten nutzbar; meist ab 99,99 % Verfügbarkeit.
- **Single Point of Failure (SPOF):** Eine Komponente, deren Ausfall das ganze System lahmlegt – z. B. ein einzelner Switch, ein Netzteil oder eine Internetleitung.
- **Redundanz:** Komponenten sind mehrfach vorhanden: zwei Netzteile an zwei Stromkreisen, mehrere Netzwerkkarten (Teaming/Bonding), RAID, zwei Switches, zwei Internetanschlüsse.
- **Cluster:** Mehrere Server bilden einen Verbund; fällt einer aus, übernimmt ein anderer seine Dienste.
- **Aktiv/Passiv:** Ein Knoten arbeitet, der andere wartet und übernimmt nur im Fehlerfall (Failover).
- **Aktiv/Aktiv:** Alle Knoten arbeiten gleichzeitig und teilen sich die Last; fällt einer aus, tragen die anderen mehr.
- **Failover:** Automatisches Umschalten auf ein Ersatzsystem; Failback ist der Rückweg nach der Reparatur.
- **Lastverteilung (Load Balancing):** Anfragen werden auf mehrere Server verteilt – mehr Leistung und Ausfallsicherheit zugleich.
- **Georedundanz:** Ein zweites Rechenzentrum in ausreichender Entfernung schützt auch bei Brand, Hochwasser oder Stromausfall am Standort.
- **Hot, Warm und Cold Standby:** Ersatzsysteme sind sofort betriebsbereit (hot), vorbereitet und schnell startbar (warm) oder müssen erst eingerichtet werden (cold).
- **SLA und Wartungsfenster:** Im Service Level Agreement steht die zugesagte Verfügbarkeit; geplante Wartungen werden oft nicht als Ausfall gezählt.

### Abbildung: Aktiv/Passiv-Cluster
![Clients sprechen eine virtuelle IP-Adresse an. Dahinter läuft der Dienst auf Knoten 1 (aktiv), Knoten 2 (passiv) wartet. Beide überwachen sich über einen Heartbeat und greifen auf gemeinsamen oder replizierten Speicher zu. Fällt Knoten 1 aus, übernimmt Knoten 2 nach kurzer Pause die virtuelle IP und den Dienst. Ein Quorum oder Zeuge verhindert, dass sich beide Knoten gleichzeitig für aktiv halten (Split Brain).](ha-cluster.svg)

### Tabelle: Verfügbarkeit und erlaubte Ausfallzeit pro Jahr
| Verfügbarkeit | Ausfallzeit pro Jahr | Einordnung |
| --- | --- | --- |
| 99 % | 3,65 Tage | einfacher Server |
| 99,9 % | 8,76 Stunden | gute Standardsysteme |
| 99,99 % | 52,6 Minuten | hochverfügbar |
| 99,999 % | 5,26 Minuten | höchste Verfügbarkeit, z. B. Telekommunikation |

### Tabelle: Maßnahmen für hohe Verfügbarkeit
| Maßnahme | schützt gegen den Ausfall von … |
| --- | --- |
| RAID mit Hot Spare | einer oder zwei Festplatten |
| redundante Netzteile an getrennten Stromkreisen | einem Netzteil oder Stromkreis |
| Netzwerkkarten-Teaming an zwei Switches | einer Netzwerkkarte, eines Kabels oder Switches |
| Server-Cluster | eines ganzen Servers |
| USV und Netzersatzanlage (Generator) | der Stromversorgung |
| zweiter Internetanschluss eines anderen Providers | der Internetleitung |
| zweites Rechenzentrum | des gesamten Standorts |
| Wartungsvertrag mit kurzer Reaktionszeit | – verkürzt die Ausfallzeit |

### Merksatz
Hochverfügbarkeit heißt: jeden Single Point of Failure finden und doppeln. Jede Neun hinter dem Komma kostet ein Vielfaches.

### Prüfungsfrage
Ein Datenbankserver soll 99,9 % Verfügbarkeit erreichen. Wie viele Stunden Ausfall sind pro Jahr erlaubt, und welche Maßnahmen außer RAID helfen?

1. Ausfallzeit: 365 Tage × 24 h × (1 − 0,999) = 8,76 Stunden pro Jahr.
2. Redundante Netzteile an getrennten Stromkreisen – ein Netzteilausfall legt den Server nicht lahm.
3. Redundante Netzwerkkarten an zwei Switches – kein Ausfall bei defekter Karte oder defektem Switch.
4. USV gegen kurze Stromausfälle und zum geordneten Herunterfahren.
5. Server-Cluster (aktiv/passiv), damit ein zweiter Server die Datenbank übernimmt.

## Zusatz: Systemarchitekturen im Vergleich {#architekturen}
typ: text
zu: serverrollen, container

Wie Anwendungen und Dienste aufgebaut sein können – von zentral bis verteilt.

### Vergleich:

#### Client-Server
![Mehrere Clients schicken Anfragen an einen zentralen Server](arch-client-server.svg)
- **Kurz:** Ein zentraler Server stellt Dienste bereit, die Clients fragen sie an.
- **Plus:** zentrale Verwaltung, Rechte und Datensicherung an einer Stelle
- **Minus:** fällt der Server aus, steht alles (Single Point of Failure)
- **Beispiel:** Fileserver, Webserver, Active Directory

#### Peer-to-Peer
![Gleichberechtigte PCs, jeder mit jedem verbunden](arch-p2p.svg)
- **Kurz:** Alle Rechner sind gleichberechtigt und zugleich Client und Server.
- **Plus:** günstig, kein zentraler Ausfallpunkt
- **Minus:** keine zentrale Verwaltung, schwer abzusichern, unübersichtlich ab wenigen Geräten
- **Beispiel:** Windows-Arbeitsgruppe, BitTorrent

#### Drei-Schichten (3-Tier)
![Browser, App-Server und Datenbank als getrennte Schichten](arch-3tier.svg)
- **Kurz:** Präsentation, Logik und Daten laufen getrennt auf eigenen Schichten.
- **Plus:** Schichten einzeln skalier- und austauschbar, Datenbank nicht direkt erreichbar
- **Minus:** mehr Systeme, mehr Aufwand im Betrieb
- **Beispiel:** Webshop, Warenwirtschaft mit Weboberfläche

#### Monolith
![Oberfläche, Logik und Datenzugriff in einer Anwendung mit einer Datenbank](arch-monolith.svg)
- **Kurz:** Die ganze Anwendung ist ein Stück und wird als Ganzes ausgeliefert.
- **Plus:** einfach zu entwickeln, zu testen und zu betreiben
- **Minus:** schwer zu skalieren, jedes Update betrifft die ganze Anwendung
- **Beispiel:** klassische Branchensoftware

#### Microservices
![Client über API-Gateway an einzelne Dienste mit je eigener Datenbank](arch-microservices.svg)
- **Kurz:** Viele kleine, unabhängige Dienste sprechen über APIs miteinander, meist in Containern.
- **Plus:** Dienste einzeln aktualisier- und skalierbar
- **Minus:** komplexer Betrieb: Orchestrierung (z. B. Kubernetes), Monitoring, Netzwerk
- **Beispiel:** große Web- und Streamingplattformen

## Monitoring der Infrastruktur {#monitoring}

### Kernbegriffe
- **Monitoring:** Laufende, automatische Überwachung von Servern, Netzwerk, Diensten und Anwendungen. Ziel: Störungen erkennen, bevor Benutzer anrufen, und Engpässe rechtzeitig sehen.
- **Aktive und passive Überwachung:** Aktiv fragt der Monitoring-Server regelmäßig nach (Polling, z. B. alle 60 Sekunden). Passiv meldet sich das Gerät selbst, wenn etwas passiert (Push, z. B. SNMP-Trap oder Syslog).
- **Agent oder agentenlos:** Ein Agent ist eine kleine Software auf dem Server, die viele Details liefert (Dienste, Logs, Prozesse). Agentenlos wird über Standardprotokolle abgefragt – SNMP, WMI/WinRM, SSH, Ping.
- **SNMP:** Simple Network Management Protocol für Switches, Router, Drucker, USVs und Server. Abfragen über UDP-Port 161, Traps (Meldungen) an Port 162. Werte stehen in der MIB und werden über OIDs angesprochen.
- **SNMP-Versionen:** v1 und v2c schicken den „Community String“ als Passwort im Klartext; v3 bietet Benutzeranmeldung und Verschlüsselung und ist heute Standard.
- **Syslog:** Standard, mit dem Netzwerkgeräte, Linux-Server und Firewalls Logmeldungen an einen zentralen Server schicken – klassisch UDP-Port 514, sicherer per TLS (TCP 6514). Schweregrade von 0 (Emergency) bis 7 (Debug).
- **Schwellwerte:** Grenzen, ab denen ein Zustand gemeldet wird, z. B. Warnung bei 80 % belegtem Speicher, kritisch bei 95 %. Gute Schwellwerte melden früh genug, aber nicht ständig.
- **Metriken, Logs, Traces:** Metriken sind Messwerte im Zeitverlauf (CPU, Speicher, Antwortzeit); Logs sind Ereignismeldungen; Traces verfolgen eine Anfrage durch mehrere Dienste. Zusammen spricht man von Observability.
- **Dienstprüfung (Service Check):** Nicht nur „Server pingt“, sondern „Dienst funktioniert“: Webseite liefert Status 200, Mailserver nimmt an, Datenbank antwortet, Zertifikat noch gültig.
- **NetFlow / IPFIX:** Router und Firewalls melden, wer mit wem wie viel Datenverkehr hat – zeigt Bandbreitenfresser und auffällige Verbindungen.
- **SIEM:** Security Information and Event Management – sammelt Sicherheitsereignisse aus vielen Quellen und erkennt Angriffsmuster. Ergänzt das Betriebs-Monitoring.

### Abbildung: Aufbau eines Monitoring-Systems
![Server, Netzwerkgeräte, Firewall, USV und Cloud-Dienste liefern per Agent, SNMP, Syslog oder API an den Monitoring-Server; der zeigt ein Dashboard, alarmiert und legt Tickets an](monitoring-aufbau.svg)

### Tabelle: Was wird überwacht?
| Bereich | Typische Werte |
| --- | --- |
| Server | CPU, Arbeitsspeicher, freier Speicherplatz, Dienste, Ereignisprotokoll, Updates |
| Netzwerk | Erreichbarkeit, Auslastung der Ports, Fehler auf Schnittstellen, Latenz, Paketverlust |
| Dienste | Antwortzeit und Funktion von Web, Mail, DNS, DHCP, Datenbank; Ablauf von Zertifikaten |
| Hardware | Temperatur, Lüfter, Netzteile, RAID-Zustand, SMART-Werte der Datenträger |
| USV und Strom | Netzbetrieb oder Akku, Restlaufzeit, Akkuzustand |
| Datensicherung | Backup gelaufen, erfolgreich, Größe plausibel |
| Sicherheit | fehlgeschlagene Anmeldungen, Virenschutz aktuell, Firewall-Meldungen |

### Tabelle: Verbreitete Monitoring-Werkzeuge
| Werkzeug | Art | Besonderheit |
| --- | --- | --- |
| Zabbix | Open Source | sehr flexibel, Agenten und SNMP, große Umgebungen |
| Checkmk | Open Source und kommerziell | viele Prüfungen automatisch erkannt, aus Deutschland |
| Icinga | Open Source | Weiterentwicklung von Nagios, aus Deutschland |
| PRTG | kommerziell | einfacher Einstieg, Lizenz nach Anzahl der Sensoren |
| Prometheus und Grafana | Open Source | Metriken und Dashboards, verbreitet bei Containern und Cloud |
| Uptime Kuma | Open Source | schlanke Erreichbarkeitsprüfung für kleine Umgebungen |

### Befehle
- `snmpwalk -v3 -l authPriv -u monitor -a SHA -A geheim1 -x AES -X geheim2 192.168.1.2 system` – Systemdaten eines Geräts per SNMPv3 abfragen (Linux, net-snmp)
- `logger -p local0.warning "Backup fehlgeschlagen"` – Testmeldung an Syslog senden (Linux)
- `Get-Counter '\Prozessor(_Total)\Prozessorzeit (%)' -SampleInterval 5 -MaxSamples 3` – Leistungswerte abfragen (PowerShell, deutsches Windows)
- `Test-NetConnection mail.firma.de -Port 25` – erreicht man den Dienst? (PowerShell)

### Merksatz
Probleme sehen, bevor Benutzer sie melden: nicht nur prüfen, ob das Gerät lebt, sondern ob der Dienst funktioniert – mit Schwellwerten, die rechtzeitig warnen.

### Prüfungsfrage
Ein mittelständisches Unternehmen hat bisher kein Monitoring; Störungen fallen erst auf, wenn Mitarbeiter anrufen. Wie gehst du bei der Einführung vor?

1. Bestandsaufnahme: Welche Server, Netzwerkgeräte, Dienste und Backups sind geschäftskritisch?
2. Werkzeug auswählen (z. B. Checkmk, Zabbix oder PRTG) nach Größe, Budget und Know-how; Monitoring-Server möglichst unabhängig von den überwachten Systemen betreiben.
3. Datenquellen anbinden: Agenten auf Servern, SNMPv3 für Netzwerkgeräte und USV, Syslog für Firewalls; Dienstprüfungen für Web, Mail und Datenbank.
4. Schwellwerte und Alarmierung festlegen: wer wird wann wie benachrichtigt (E-Mail, Chat, Bereitschaftstelefon), Eskalation bei ausbleibender Reaktion.
5. Dashboard für den Überblick einrichten, Meldungen regelmäßig auswerten und Schwellwerte nachschärfen.

## Häufige Fehler
- Snapshots oder RAID für ein Backup halten.
- Inkrementelle und differenzielle Sicherung vertauschen.
- Vergessen, dass eine inkrementelle Sicherung das Archivbit zurücksetzt – die folgende differenzielle enthält dann nur noch die Änderungen seitdem.
- Hot-Spare-Platten zur Nutzkapazität zählen.
- RAID-5-Kapazität mit allen Platten rechnen statt mit n − 1.
- USV nur nach VA dimensionieren und die Wattzahl vergessen.
- Daten im Container statt in einem Volume speichern.
- Monitoring nur auf „Gerät antwortet auf Ping“ beschränken – der Dienst darauf kann trotzdem ausgefallen sein.
- SNMP v1/v2c mit dem Standard-Community-String „public“ betreiben.
- Ein Backup für ein Archiv halten – Backups werden überschrieben, Archive müssen unveränderbar sein.

## Links
- [Docker-Dokumentation](https://docs.docker.com) – Container, Images, Compose
- [Proxmox VE](https://www.proxmox.com) – freier Typ-1-Hypervisor
- [BSI](https://www.bsi.bund.de) – Datensicherung und Notfallvorsorge

## Zusatz: Monitoring in der Praxis {#monitoring-praxis}
typ: text
zu: monitoring, backup, usv

Ein Monitoring, das ständig rot leuchtet, wird ignoriert – eins, das nichts meldet, wiegt in falscher Sicherheit. Worauf es im Alltag ankommt.

### Checkliste: Gute Alarmierung
Zu viele Meldungen sind fast so schlimm wie keine: Wer täglich hundert Mails bekommt, übersieht die eine wichtige (Alarmmüdigkeit).
- Nur alarmieren, wenn jemand etwas tun muss; alles andere ins Dashboard.
- Für jeden Alarm festlegen: Wer ist zuständig, was ist zu tun? Kurze Anleitung im Alarmtext verlinken.
- Wartungsfenster eintragen, damit geplante Neustarts keinen Alarm auslösen.
- Abhängigkeiten abbilden: Fällt der Switch aus, nicht zusätzlich 40 Server melden.
- Kritische Alarme über einen zweiten Weg (z. B. Push oder SMS), falls der Mailserver selbst ausgefallen ist.
- Schwellwerte regelmäßig überprüfen und anpassen.

### Checkliste: Was oft vergessen wird
- Ablaufdatum von Zertifikaten und Domains
- Erfolg der Datensicherung – nicht nur, ob der Job gestartet ist
- Zustand von RAID-Verbünden und SMART-Werte der Datenträger
- Akkuzustand der USV und Selbsttest
- Lizenzlaufzeiten und Speicherkontingente in der Cloud
- Das Monitoring selbst: Wer merkt, wenn der Monitoring-Server ausfällt?

### Kennzahlen und Trends
Monitoring liefert nicht nur Alarme, sondern Zahlen über Wochen und Monate.
- **Kapazitätsplanung:** Wächst der Speicherplatz um 50 GB pro Monat, ist absehbar, wann die Platte voll ist.
- **SLA-Nachweis:** Die gemessene Verfügbarkeit zeigt, ob vereinbarte Werte eingehalten wurden.
- **Fehlersuche:** Der Verlauf zeigt, seit wann ein Wert auffällig ist – oft passend zu einem Update oder einer Änderung.

### Monitoring und Datenschutz
- Werden Benutzeraktivitäten erfasst (Anmeldungen, Webzugriffe, Logs mit Namen), sind personenbezogene Daten betroffen: Zweck festlegen, Speicherdauer begrenzen, Zugriff beschränken.
- Eine Leistungs- oder Verhaltenskontrolle von Beschäftigten ist mitbestimmungspflichtig – den Betriebsrat früh einbinden (§ 87 Abs. 1 Nr. 6 BetrVG).
- SNMP nur mit v3 und eigenem, eingeschränktem Konto; Monitoring-Zugänge sind attraktive Ziele für Angreifer.
