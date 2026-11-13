---
titel: Support & IT-Service
---

Wie Serviceanfragen strukturiert bearbeitet werden: vom Ticket über die Fehleranalyse bis zur Kommunikation mit dem Kunden – nach ITIL (IT Infrastructure Library) und vereinbarten SLAs (Service Level Agreements).

## Ticketsysteme {#ticketsysteme}

### Kernbegriffe
- **Ticket:** Dokumentierte Anfrage mit Nummer, Melder, Beschreibung, Priorität, Status und Verlauf.
- **Single Point of Contact (SPOC):** Eine zentrale Anlaufstelle für alle Anfragen, meist der Service Desk.
- **Priorität:** Ergibt sich aus Auswirkung (wie viele betroffen?) und Dringlichkeit (wie schnell nötig?).
- **Funktionale Eskalation:** Weitergabe an eine Stelle mit mehr Fachwissen (1st → 2nd → 3rd Level).
- **Hierarchische Eskalation:** Einbeziehen der Führungsebene, z. B. wenn ein SLA (Service Level Agreement) zu reißen droht.

### Tabelle: Prioritätsmatrix
| Auswirkung ↓ / Dringlichkeit → | hoch | mittel | niedrig |
| --- | --- | --- | --- |
| hoch (viele Nutzer, Kernsystem) | 1 – kritisch | 2 – hoch | 3 – mittel |
| mittel (Abteilung) | 2 – hoch | 3 – mittel | 4 – niedrig |
| niedrig (einzelner Nutzer) | 3 – mittel | 4 – niedrig | 5 – planbar |

### Tabelle: Support-Level
| Level | Aufgabe |
| --- | --- |
| 1st Level | Annahme, Erfassung, Standardlösungen, Weiterleitung |
| 2nd Level | Fachliche Analyse, komplexere Fehler |
| 3rd Level | Spezialisten, Entwickler, Hersteller |

### Merksatz
Priorität = Auswirkung × Dringlichkeit – nicht wer am lautesten ruft.

## ITIL-Grundlagen {#itil}

### Kernbegriffe
- **ITIL:** Sammlung bewährter Verfahren (Best Practices) für IT-Service-Management; verbreitet ist ITIL (IT Infrastructure Library) 4, seit 2026 erscheint schrittweise ITIL (Version 5).
- **Service:** Leistung, die dem Kunden einen Nutzen bringt, z. B. „E-Mail funktioniert“.
- **Workaround:** Vorübergehende Umgehungslösung, bis die Ursache behoben ist.
- **Known Error:** Problem mit bekannter Ursache und dokumentiertem Workaround.
- **Wissensdatenbank:** Gesammelte Lösungen, damit der 1st Level mehr selbst lösen kann.

### Tabelle: Wichtige Praktiken
| Praktik | Ziel | Beispiel |
| --- | --- | --- |
| Incident Management | Störung so schnell wie möglich beheben | Drucker druckt nicht |
| Problem Management | Ursache wiederkehrender Störungen finden und beseitigen | Drucker fällt jede Woche aus |
| Change Management (Change Enablement) | Änderungen geplant, geprüft und dokumentiert einführen | Firmware-Update aller Drucker |
| Service Request Management | Standardanfragen erfüllen | neuer Benutzer, Passwort zurücksetzen |

### Merksatz
Incident heilt das Symptom, Problem heilt die Ursache.

## SLA {#sla}

### Kernbegriffe
- **SLA:** Service Level Agreement – Vereinbarung zwischen IT-Dienstleister und Kunde über messbare Leistungen.
- **Reaktionszeit:** Zeit bis zur ersten qualifizierten Rückmeldung.
- **Lösungszeit:** Zeit bis zur Behebung der Störung.
- **Verfügbarkeit:** Anteil der vereinbarten Zeit, in der der Service nutzbar ist, in Prozent.
- **OLA:** Operational Level Agreement – interne Vereinbarung zwischen IT-Teams.
- **UC:** Underpinning Contract – Vertrag mit externem Lieferanten, z. B. Hardware-Wartung.

### Tabelle: Verfügbarkeit und Ausfallzeit pro Jahr
| Verfügbarkeit | erlaubte Ausfallzeit pro Jahr |
| --- | --- |
| 99 % | ca. 87,6 Stunden |
| 99,9 % | ca. 8,76 Stunden |
| 99,99 % | ca. 52,6 Minuten |
| 99,999 % | ca. 5,26 Minuten |

### Merksatz
Jede zusätzliche Neun teilt die erlaubte Ausfallzeit durch zehn.

### Prüfungsfrage
Ein SLA garantiert 99,5 % Verfügbarkeit bei Betrieb rund um die Uhr. Wie viele Stunden Ausfall sind pro Jahr erlaubt?

1. Stunden pro Jahr: 365 · 24 = 8 760 h
2. Erlaubter Ausfall: 0,5 % von 8 760 h
3. 8 760 · 0,005 = 43,8 Stunden

## Fehleranalyse {#fehleranalyse}

### Kernbegriffe
- **Systematisches Vorgehen:** Problem beschreiben, Informationen sammeln, eingrenzen, Hypothese aufstellen, testen, lösen, dokumentieren.
- **Bottom-up:** Fehlersuche entlang des OSI-Modells (Open Systems Interconnection) von Schicht 1 (Kabel) nach oben.
- **Divide and Conquer:** Mitten im Ablauf testen und so die Fehlerstelle halbieren.
- **Reproduzierbarkeit:** Lässt sich der Fehler gezielt auslösen? Das erleichtert Ursache und Test.
- **Ereignisanzeige / Logs:** Systemprotokolle mit Fehlern und Warnungen.

### Abbildung: Von unten nach oben eingrenzen
![Prüfreihenfolge von unten nach oben: Link-LED, Kabel oder WLAN-Verbindung; ipconfig /all für IP, Maske, Gateway und DNS; ping 127.0.0.1 für den TCP/IP-Stack; ping auf die eigene IP und das Gateway für das lokale Netz; ping 8.8.8.8 für Internet und Routing; nslookup für DNS; zuletzt Browser, Anwendung und Proxy. Der erste Test, der scheitert, zeigt die Ebene des Fehlers.](fehleranalyse-osi.svg)

### Tabelle: Netzwerkfehler eingrenzen
| Test | Ergebnis bei Erfolg |
| --- | --- |
| `ping 127.0.0.1` | TCP (Transmission Control Protocol)/IP-Stack funktioniert |
| `ping` eigene IP (Internet Protocol) | Netzwerkkarte arbeitet |
| `ping` Gateway | lokales Netz in Ordnung |
| `ping 8.8.8.8` | Internet erreichbar |
| `nslookup beispiel.de` | Namensauflösung funktioniert |

### Befehle
- `eventvwr.msc` – Ereignisanzeige öffnen (Windows)
- `Get-WinEvent -LogName System -MaxEvents 20` – letzte Systemereignisse (PowerShell)
- `journalctl -p err -b` – Fehler seit dem letzten Start (Linux)
- `tracert 8.8.8.8` – zeigt, an welchem Router es hakt

### Merksatz
Erst fragen „Was hat sich geändert?“ – die meisten Fehler entstehen durch die letzte Änderung.

## Troubleshooting-Werkzeuge der Betriebssysteme {#os-troubleshooting}

### Kernbegriffe
- **Ereignisanzeige (Windows):** Zentrale Protokolle für System, Anwendungen und Sicherheit. Bei Abstürzen zuerst unter „Windows-Protokolle → System“ nach Fehlern und kritischen Ereignissen filtern.
- **Zuverlässigkeitsverlauf (Windows):** Zeitleiste mit Abstürzen, fehlgeschlagenen Updates und Installationen – zeigt schnell, was sich um den Zeitpunkt des Problems geändert hat (`perfmon /rel`).
- **Task-Manager und Ressourcenmonitor (Windows):** Welche Prozesse belasten CPU (Central Processing Unit – Prozessor), RAM, Datenträger und Netzwerk? Der Ressourcenmonitor zeigt zusätzlich, welcher Prozess welche Datei oder Verbindung nutzt.
- **SFC und DISM (Windows):** SFC = System File Checker. `sfc /scannow` repariert beschädigte Systemdateien aus einem lokalen Speicher; ist dieser selbst beschädigt, repariert ihn vorher `DISM /Online /Cleanup-Image /RestoreHealth`.
- **Windows-Wiederherstellungsumgebung (WinRE):** Starthilfe, Systemwiederherstellung, Updates deinstallieren, abgesicherter Modus und Eingabeaufforderung – erreichbar mit Umschalt + Neu starten oder nach zwei fehlgeschlagenen Starts automatisch.
- **journalctl und systemctl (Linux):** systemd sammelt alle Protokolle im Journal. `systemctl status dienst` zeigt Zustand und letzte Logzeilen eines Dienstes, `systemctl --failed` alle fehlgeschlagenen Dienste.
- **dmesg (Linux):** Meldungen des Kernels: Hardware, Treiber, Datenträgerfehler, USB-Geräte.
- **/var/log (Linux):** Klassische Logdateien, z. B. syslog bzw. messages, auth.log für Anmeldungen und Logs einzelner Dienste.
- **Rettungsmodus (Linux):** Im GRUB-Menü unter „Erweiterte Optionen“ einen älteren Kernel oder den Recovery-Modus wählen.
- **Konsole und Aktivitätsanzeige (macOS):** Die Konsole zeigt System- und Absturzprotokolle, die Aktivitätsanzeige Prozesse, Speicher, Energie und Netzwerk.
- **Festplattendienstprogramm und Wiederherstellung (macOS):** „Erste Hilfe“ prüft und repariert Volumes; die macOS-Wiederherstellung bietet Time-Machine-Rücksicherung, Neuinstallation und Terminal.
- **Apple Diagnose (macOS):** Eingebauter Hardwaretest – bei Apple-Chips beim Start den Einschaltknopf halten bis „Optionen“, dann Befehl + D; bei Intel-Macs beim Start D halten.

### Tabelle: Wo schaue ich nach?
| Was | Windows | Linux | macOS |
| --- | --- | --- | --- |
| Protokolle | Ereignisanzeige (`eventvwr.msc`) | `journalctl`, `/var/log` | Konsole, `log show` |
| Abstürze im Überblick | Zuverlässigkeitsverlauf (`perfmon /rel`) | `journalctl -b -1 -p err` (voriger Start) | Konsole → Absturzberichte |
| Prozesse und Last | Task-Manager, Ressourcenmonitor | `top`, `htop`, `free -h` | Aktivitätsanzeige |
| Dienste | `services.msc`, `Get-Service` | `systemctl status`, `systemctl --failed` | `launchctl list` |
| Speicherplatz | Explorer, `Get-Volume` | `df -h`, `du -sh` | Über diesen Mac → Speicher, `df -h` |
| Datenträger prüfen | `chkdsk C: /f` | `fsck` (nicht eingehängt), `smartctl -a` | Festplattendienstprogramm → Erste Hilfe |
| Systemdateien reparieren | `sfc /scannow`, DISM (Deployment Image Servicing and Management) | Paket neu installieren (`apt reinstall`) | macOS über Wiederherstellung neu installieren |
| Geräte und Treiber | Geräte-Manager (`devmgmt.msc`) | `lsusb`, `lspci`, `dmesg` | Systeminformationen |
| Hardware-Infos | `msinfo32` | `lshw`, `inxi`, `dmidecode` | Systeminformationen (Wahltaste + Apple-Menü) |
| Arbeitsspeicher testen | `mdsched` | memtest86+ (Boot-Menü, falls installiert) | Apple Diagnose |
| Startprobleme | WinRE, abgesicherter Modus | GRUB (GRand Unified Bootloader): älterer Kernel, Recovery-Modus | sicherer Modus, macOS-Wiederherstellung |
| Fernhilfe | Schnellhilfe (`quickassist`), RDP (Remote Desktop Protocol) | SSH (Secure Shell) | Bildschirmfreigabe, SSH |

### Befehle
- `perfmon /rel` – Zuverlässigkeitsverlauf: Abstürze und Änderungen auf einer Zeitleiste (Windows)
- `Get-WinEvent -LogName System -MaxEvents 50 | Where-Object Level -le 2` – letzte kritische und Fehler-Ereignisse (PowerShell)
- `DISM /Online /Cleanup-Image /RestoreHealth` – Komponentenspeicher reparieren, danach `sfc /scannow` (Windows, als Admin)
- `shutdown /r /o /t 0` – direkt in die Wiederherstellungsumgebung neu starten (Windows)
- `gpresult /r` – welche Gruppenrichtlinien wirken auf Benutzer und Computer (Windows)
- `journalctl -u ssh -f` – Log eines Dienstes live mitlesen (Linux)
- `dmesg -T --level=err,warn` – Kernel-Fehler mit Uhrzeit (Linux)
- `log show --last 1h --predicate 'messageType == error'` – Fehler der letzten Stunde (macOS)

### Merksatz
Erst ins Protokoll schauen, dann reparieren: Windows hat die Ereignisanzeige, Linux das Journal, macOS die Konsole – und jedes System einen Notfallmodus zum Starten.

### Prüfungsfrage
Ein Windows-Rechner startet seit gestern unregelmäßig neu. Wie gehst du mit Bordmitteln vor?

1. Zuverlässigkeitsverlauf öffnen (`perfmon /rel`): Wann trat das Problem zuerst auf, wurde kurz davor ein Update, Treiber oder Programm installiert?
2. Ereignisanzeige → System: Kernel-Power (ID 41) zeigt unerwartete Neustarts, BugCheck (ID 1001) einen Bluescreen mit Fehlercode.
3. Je nach Hinweis: Treiber oder Update zurücknehmen, Arbeitsspeicher mit `mdsched` testen, Systemdateien mit DISM und `sfc /scannow` prüfen.
4. Hardware ausschließen: Temperaturen, Netzteil, Datenträger (SMART).
5. Ursache, Lösung und Zeitaufwand im Ticket dokumentieren.

## Kundenkommunikation {#kundenkommunikation}

### Kernbegriffe
- **Aktives Zuhören:** Ausreden lassen, nachfragen, mit eigenen Worten zusammenfassen.
- **Offene Fragen:** W-Fragen, die zum Erzählen anregen – „Was genau passiert, wenn …?“
- **Geschlossene Fragen:** Ja/Nein-Fragen zum gezielten Eingrenzen – „Leuchtet die LED?“
- **Vier-Seiten-Modell:** Nach Schulz von Thun hat jede Nachricht Sachinhalt, Selbstoffenbarung, Beziehung und Appell.
- **Ich-Botschaft:** „Ich brauche noch …“ statt „Sie haben vergessen …“ – wirkt weniger angreifend.

### Tabelle: Gesprächsphasen am Service Desk
| Phase | Inhalt |
| --- | --- |
| Begrüßung | Name, Firma, freundlicher Einstieg |
| Problemaufnahme | offene Fragen, aktiv zuhören |
| Eingrenzung | geschlossene Fragen, Tests |
| Lösung oder Weiterleitung | verständlich erklären, Ticketnummer nennen |
| Abschluss | zusammenfassen, nächste Schritte, Verabschiedung |

### Merksatz
Fachbegriffe übersetzen, Ticketnummer nennen, Erwartungen klar setzen.

### Prüfungsfrage
Ein verärgerter Anwender ruft an: „Bei euch funktioniert ja nie etwas!“ Wie reagierst du?

1. Ruhig bleiben und den Ärger anerkennen: „Ich verstehe, dass das gerade sehr stört.“
2. Auf die Sachebene lenken: „Was genau funktioniert im Moment nicht?“
3. Konkrete nächste Schritte und eine realistische Rückmeldezeit nennen.

## Häufige Fehler
- Incident und Problem gleichsetzen.
- Priorität nur nach Dringlichkeit oder nach dem Rang des Anrufers vergeben.
- Lösung umsetzen, aber nicht im Ticket dokumentieren.
- Bei der Verfügbarkeitsrechnung mit Arbeitstagen statt mit der vereinbarten Servicezeit rechnen.
- Dem Kunden mit Fachbegriffen antworten, die er nicht versteht.
- Bei der Fehlersuche mehrere Dinge gleichzeitig ändern – dann weiß niemand, was geholfen hat.
- Ereignisanzeige bzw. Journal überspringen und auf Verdacht neu installieren.

## Links
- [PeopleCert – ITIL](https://www.peoplecert.org) – Herausgeber von ITIL
- [Microsoft Learn – Problembehandlung](https://learn.microsoft.com/de-de/troubleshoot/) – Fehlerbilder und Lösungen

## Zusatz: Troubleshooting Schritt für Schritt {#troubleshooting-praxis}
typ: text
zu: fehleranalyse, os-troubleshooting

Ein festes Vorgehen spart Zeit und verhindert, dass man auf Verdacht drei Dinge gleichzeitig ändert. Dazu für jedes Betriebssystem die wichtigsten Stellen, an denen man zuerst nachschaut.

### Das Vorgehen
![Sechs Schritte im Kreis: Problem erfassen, Ursache vermuten, Vermutung testen, Lösung umsetzen, Ergebnis prüfen, dokumentieren](troubleshooting-ablauf.svg)
1. Problem genau erfassen: Was passiert, welche Fehlermeldung (Screenshot), seit wann, wer und wie viele sind betroffen?
2. Fragen, was sich geändert hat: Updates, neue Software, neue Hardware, Umzug, neues Passwort.
3. Eingrenzen: Nur ein Benutzer oder alle? Nur ein Gerät? Nur eine Anwendung? Im Netz von unten nach oben (Kabel, IP, DNS – Domain Name System, Dienst).
4. Eine Vermutung nach der anderen testen und dabei immer nur eine Sache ändern.
5. Lösung umsetzen – bei Eingriffen in den Betrieb als geplanter Change.
6. Mit dem Benutzer prüfen, ob alles funktioniert, und alles im Ticket dokumentieren.

### Checkliste: Windows – zuerst hier schauen
- Zuverlässigkeitsverlauf (`perfmon /rel`) – was ist um den Zeitpunkt passiert?
- Ereignisanzeige → Windows-Protokolle → System und Anwendung, nach „Kritisch“ und „Fehler“ filtern
- Task-Manager → Prozesse und Autostart; Ressourcenmonitor bei hoher Datenträgerlast
- Geräte-Manager: gelbe Warnzeichen, Treiber zurücksetzen
- Windows Update → Updateverlauf, ggf. Update deinstallieren
- Systemdiagnosebericht: `perfmon /report` sammelt 60 Sekunden lang Daten und bewertet das System
- Netzwerk: `ipconfig /all`, `Test-NetConnection server -Port 443`, `nslookup`
- Bluescreen-Abbilder unter `C:\Windows\Minidump` für die genaue Ursache aufheben

### Windows startet nicht
1. Wiederherstellungsumgebung öffnen (startet nach zwei fehlgeschlagenen Starts automatisch).
2. Starthilfe ausführen.
3. Letztes Qualitäts- oder Funktionsupdate deinstallieren.
4. Systemwiederherstellung auf einen Punkt vor dem Problem.
5. Abgesicherter Modus: Treiber oder Software entfernen, die das Problem verursacht.
6. Eingabeaufforderung: Datenträger mit `chkdsk` prüfen, Systemdateien offline mit `sfc /scannow /offbootdir=C:\ /offwindir=C:\Windows` reparieren.
7. Letzter Ausweg: Daten sichern, „Diesen PC zurücksetzen“ oder neu installieren.

### Checkliste: Linux – zuerst hier schauen
- `systemctl --failed` und `systemctl status dienst` – läuft der Dienst, was sagt er?
- `journalctl -p err -b` – Fehler seit dem Start; `-b -1` für den vorigen Start
- `dmesg -T` – Hardware- und Treiberfehler, z. B. Datenträger mit I/O-Fehlern
- `df -h` und `df -i` – volle Partition oder keine freien Inodes mehr; `du -sh /var/log/*` findet die Ursache
- `top` bzw. `htop` und `free -h` – CPU-Last, Speicher, Swap
- `ip a`, `ip r`, `ss -tulpn`, `resolvectl status` – Adresse, Route, offene Ports, DNS
- Logdateien unter `/var/log`, z. B. `auth.log` bei Anmeldeproblemen

### Linux startet nicht
1. Im GRUB-Menü (GRUB = GRand Unified Bootloader) unter „Erweiterte Optionen“ einen älteren Kernel wählen – hilft nach fehlerhaften Kernel-Updates.
2. Recovery-Modus oder `systemd.unit=rescue.target` als Startoption: minimales System mit Root-Shell.
3. Häufige Ursache prüfen: Fehler in `/etc/fstab` (Laufwerk fehlt oder falsche UUID – Universally Unique Identifier).
4. Dateisystem im nicht eingehängten Zustand mit `fsck` prüfen.
5. Notfalls von einem Live-USB-Stick starten, Daten sichern und das System per `chroot` reparieren.

### Checkliste: macOS – zuerst hier schauen
- Aktivitätsanzeige: Prozesse mit hoher CPU-, Speicher- oder Energielast
- Konsole: Fehler und Absturzberichte zum Zeitpunkt des Problems
- Systemeinstellungen → Allgemein → Speicher: Platz auf dem Startvolume
- Festplattendienstprogramm → Erste Hilfe für das Startvolume
- WLAN-Probleme: Wahltaste + Klick aufs WLAN-Symbol → Diagnose für drahtlose Umgebungen
- `networkQuality` im Terminal misst Durchsatz und Reaktionszeit der Verbindung
- Anmeldeobjekte und Hintergrundprogramme in den Systemeinstellungen prüfen

### macOS startet nicht
1. Sicheren Modus starten: lädt nur das Nötigste und prüft das Startvolume.
2. macOS-Wiederherstellung öffnen (Apple-Chip: Einschaltknopf halten bis „Optionen“; Intel: Befehl + R).
3. Festplattendienstprogramm → Erste Hilfe für das Volume ausführen.
4. Aus einem Time-Machine-Backup wiederherstellen.
5. macOS neu installieren – die Benutzerdaten bleiben dabei normalerweise erhalten.
6. Hardware mit Apple Diagnose prüfen.

## Zusatz: ITIL in der Praxis {#itil-praxis}
typ: text
zu: itil, ticketsysteme, sla

ITIL (IT Infrastructure Library) ist das bekannteste Rahmenwerk für IT-Service-Management. Hier die Bausteine von ITIL 4 im Zusammenhang – und wie sie im Alltag eines Service Desks aussehen.

ITIL schreibt keine Werkzeuge vor, sondern beschreibt bewährte Vorgehensweisen. Unternehmen übernehmen davon, was zu ihnen passt. Die Begriffe sind aber überall gleich – daher tauchen sie in Ticketsystemen, Verträgen und Prüfungen immer wieder auf.

### Das Service-Wertsystem
Im Zentrum von ITIL 4 steht der Wert, den ein Service für Kunden erzeugt. Das Service-Wertsystem beschreibt, wie eine Organisation dafür zusammenarbeitet: mit Leitprinzipien, Governance, der Wertschöpfungskette, Praktiken und kontinuierlicher Verbesserung.
![Service-Wertschöpfungskette mit sechs Aktivitäten rund um den Wert für Kunden: Planen, Verbessern, Einbinden, Entwerfen und Überführen, Beschaffen und Erstellen, Liefern und Unterstützen](itil-wertkette.svg)
- Die sechs Aktivitäten werden für jeden Service passend kombiniert – zum Beispiel bei einer Störung: Einbinden (Benutzer meldet sich) → Liefern & Unterstützen (Störung beheben) → Verbessern (Ursache abstellen).
- Die **vier Dimensionen** müssen bei jedem Service zusammenpassen: Organisationen und Personen; Informationen und Technologie; Partner und Lieferanten; Wertströme und Prozesse.

### Die sieben Leitprinzipien
| Leitprinzip | Bedeutung im Alltag |
| --- | --- |
| Fokus auf Wert | Alles, was wir tun, muss dem Kunden nützen |
| Beginne, wo du stehst | Vorhandenes nutzen, nicht alles neu erfinden |
| Iterativ mit Feedback vorgehen | in kleinen Schritten verbessern und Rückmeldung einholen |
| Zusammenarbeiten und Transparenz fördern | Teams einbinden, Informationen teilen |
| Ganzheitlich denken und arbeiten | den Service als Ganzes sehen, nicht nur das eigene Teilstück |
| Einfach und praktisch halten | unnötige Schritte weglassen |
| Optimieren und automatisieren | erst Abläufe verbessern, dann automatisieren |

### Incident, Problem und Change
![Incident wird bei Wiederholung zum Problem, das Problem führt zum Known Error mit Workaround und über einen Change zur Lösung](itil-incident-problem-change.svg)
- **Incident:** ungeplante Unterbrechung oder Verschlechterung eines Services. Ziel: Betrieb so schnell wie möglich wiederherstellen – notfalls mit Workaround.
- **Service Request:** keine Störung, sondern eine Standardanfrage: neues Passwort, Software, Zugang, Hardware.
- **Problem:** Ursache für einen oder mehrere Incidents. Ziel: Ursache finden und dauerhaft beseitigen.
- **Known Error:** Problem mit bekannter Ursache und dokumentiertem Workaround, abgelegt in der Wissensdatenbank.
- **Change:** jede Änderung, die Services beeinflussen kann. Sie wird bewertet, genehmigt, geplant, getestet und mit Rückfallplan umgesetzt.

### Change-Arten
| Art | Beschreibung | Beispiel |
| --- | --- | --- |
| Standard-Change | vorab genehmigt, geringes Risiko, feste Anleitung | RAM-Erweiterung nach Vorlage, neuer Arbeitsplatz-PC |
| Normaler Change | einzeln bewertet und genehmigt, ggf. durch ein Change Advisory Board (CAB) | Umstellung des Mailservers |
| Notfall-Change | sofort nötig, verkürzte Genehmigung, Dokumentation danach | Sicherheitslücke wird aktiv ausgenutzt |

### Service Desk und Eskalation
- **Single Point of Contact (SPOC):** Der Service Desk ist die eine Anlaufstelle für alle Anliegen der Benutzer.
- **Formen:** zentral (ein Standort), lokal (an jedem Standort), virtuell (verteilt, wirkt wie einer), Follow-the-Sun (rund um die Uhr über Zeitzonen verteilt).
- **Funktionale Eskalation:** Weitergabe an Spezialisten mit mehr Fachwissen (1st → 2nd → 3rd Level).
- **Hierarchische Eskalation:** Weitergabe an Vorgesetzte, wenn Entscheidungen, Geld oder Prioritäten nötig sind – z. B. wenn ein SLA zu reißen droht.

### Vereinbarungen und Konfiguration
| Begriff | Zwischen wem | Inhalt |
| --- | --- | --- |
| SLA (Service Level Agreement) | IT-Dienstleister und Kunde | Servicezeiten, Verfügbarkeit, Reaktions- und Lösungszeiten |
| OLA (Operational Level Agreement) | interne Teams des Dienstleisters | z. B. Netzwerkteam reagiert in 30 Minuten |
| UC (Underpinning Contract) | Dienstleister und externer Lieferant | z. B. Hardware-Austausch durch den Hersteller am nächsten Arbeitstag |
| CMDB (Configuration Management Database) | – | Datenbank aller Configuration Items (CIs) wie Server, Software, Verträge und ihrer Beziehungen |

### Kennzahlen im Service Desk
| Kennzahl | Bedeutung |
| --- | --- |
| First Contact Resolution | Anteil der Anliegen, die beim ersten Kontakt gelöst werden |
| MTTR (Mean Time to Restore) | durchschnittliche Zeit bis zur Wiederherstellung nach einer Störung |
| MTBF (Mean Time Between Failures) | durchschnittliche Zeit zwischen zwei Ausfällen |
| SLA-Erfüllung | Anteil der Tickets, die in der vereinbarten Zeit gelöst wurden |
| Kundenzufriedenheit (CSAT) | Bewertung durch die Benutzer nach Abschluss |

### ITIL v3, ITIL 4 und ITIL 5
- **ITIL v3 (2007/2011):** in fünf Lebenszyklus-Phasen gegliedert – Service Strategy, Service Design, Service Transition, Service Operation, Continual Service Improvement. Diese Begriffe stehen noch in vielen Lehrbüchern.
- **ITIL 4 (seit 2019):** Service-Wertsystem, Wertschöpfungskette, sieben Leitprinzipien, vier Dimensionen und 34 Praktiken statt starrer Prozesse.
- **ITIL (Version 5):** erscheint seit 2026 schrittweise. Es baut auf ITIL 4 auf, verbindet Produkt- und Servicemanagement in einem Lebenszyklus und ergänzt Leitlinien zur KI-Governance. ITIL 4 bleibt vorerst parallel gültig.
- **Für die Prüfung:** Incident, Problem, Change, Service Request, Known Error, SLA/OLA/UC und Eskalation sind in allen Versionen gleich – darauf kommt es an.

## Zusatz: Kundenkommunikation in der Praxis {#kommunikation-praxis}
typ: text
zu: kundenkommunikation, ticketsysteme

Im Support ist die technische Lösung nur die halbe Arbeit. Ob ein Anwender zufrieden ist, hängt oft davon ab, wie er behandelt und informiert wurde.

### Vier Seiten einer Nachricht
![Vier-Seiten-Modell: Eine Aussage enthält Sachinhalt, Selbstkundgabe, Beziehungshinweis und Appell](vier-seiten-modell.svg)
- **Sachinhalt:** Worüber informiere ich? Hier liegt die technische Aufgabe.
- **Selbstkundgabe:** Was gebe ich von mir preis? Ärger und Zeitdruck des Anwenders sind echte Information – ernst nehmen.
- **Beziehung:** Was halte ich vom anderen? Kritik am „Ihr“ nicht persönlich nehmen und nicht zurückgeben.
- **Appell:** Was soll der andere tun? Mit einem konkreten nächsten Schritt antworten.

### Fragetechniken
| Frageart | Zweck | Beispiel |
| --- | --- | --- |
| Offene Frage | Situation verstehen, Anwender erzählen lassen | „Was genau passiert, wenn Sie drucken?“ |
| Geschlossene Frage | Fakten klären, eingrenzen | „Betrifft das nur Ihren PC?“ |
| Alternativfrage | Auswahl anbieten, Entscheidung erleichtern | „Passt Ihnen heute 14 Uhr oder morgen früh?“ |
| Kontrollfrage | Verständnis sichern | „Habe ich richtig verstanden, dass es seit dem Update so ist?“ |
| Zusammenfassung | gemeinsamen Stand festhalten | „Wir halten fest: … Ich melde mich bis 16 Uhr.“ |

### Verständlich und positiv formulieren
| Vermeiden | Besser |
| --- | --- |
| „Da ist wohl der DNS-Cache korrupt.“ | „Ihr PC hat sich eine veraltete Adresse gemerkt. Ich lösche das kurz.“ |
| „Das geht nicht.“ | „Das geht so leider nicht, aber wir können …“ |
| „Da haben Sie was falsch gemacht.“ | „Das passiert schnell – ich zeige Ihnen, wie es klappt.“ |
| „Dafür bin ich nicht zuständig.“ | „Ich gebe das an die Kollegen vom Netzwerkteam weiter, Sie hören bis morgen von uns.“ |
| „Kein Problem.“ | „Gern.“ |
| „Ich versuche es mal.“ | „Ich kümmere mich darum und melde mich bis 15 Uhr.“ |

### Verärgerte Anwender
1. Ausreden lassen und aktiv zuhören – nicht unterbrechen, Notizen machen.
2. Verständnis zeigen, ohne Schuld zu verteilen: „Ich verstehe, dass das ärgerlich ist, gerade vor der Präsentation.“
3. Auf die Sachebene zurückführen: konkrete Fragen zum Problem stellen.
4. Eine Lösung oder einen nächsten Schritt mit Zeitangabe anbieten, notfalls einen Workaround.
5. Zusagen einhalten und sich melden, auch wenn es noch keine Lösung gibt.
6. Bei Beleidigungen ruhig Grenzen setzen und, wenn nötig, an die Teamleitung übergeben.

### Checkliste: Schreiben im Ticket und per E-Mail
- Ticketnummer im Betreff und in jeder Nachricht
- Kurz und in Alltagssprache: Was ist passiert, was wurde getan, was kommt als Nächstes?
- Konkrete Zeitangaben statt „zeitnah“
- Anweisungen als nummerierte Schritte, gern mit Screenshot
- Keine Schuldzuweisungen, keine Ironie – Geschriebenes wirkt härter als Gesprochenes
- Vor dem Absenden lesen: Ton, Rechtschreibung, richtiger Empfänger
- Zum Abschluss fragen, ob das Problem gelöst ist, dann erst schließen

### Checkliste: Sicherheit im Gespräch
- Identität prüfen, bevor Passwörter zurückgesetzt oder Rechte geändert werden – z. B. Rückruf an die hinterlegte Nummer.
- Niemals nach Passwörtern fragen; ein seriöser Support braucht sie nicht.
- Vorsicht bei Druck und Eile („Ich bin der Geschäftsführer, das muss sofort gehen!“) – typisch für Social Engineering.
- Bei Fernwartung vorher um Erlaubnis bitten, erklären, was man tut, und keine vertraulichen Inhalte auf dem Bildschirm kommentieren.
- Keine Auskünfte über andere Benutzer oder Systeme an Unbekannte.

## Zusatz: Dos and Don'ts als IT-Admin {#admin-dos-donts}
typ: text
zu: ticketsysteme, itil, fehleranalyse, kundenkommunikation, sicherheit.zero-trust, sicherheit.berechtigungskonzept, server.backup, automatisierung.skript-vorgehen

Ungeschriebene Regeln aus dem Admin-Alltag: was Profis selbstverständlich tun – und was man besser nie macht, auch wenn es gerade schneller ginge.

Als Admin hast du mehr Rechte als fast alle anderen im Unternehmen. Das ist Vertrauen, kein Freibrief. Die meisten großen Ausfälle entstehen nicht durch Angreifer, sondern durch gut gemeinte Änderungen ohne Plan, ohne Backup und ohne Absprache.

### Konten und Rechte
- **Do:** Getrennte Konten nutzen – ein normales Konto für Mail, Web und Office, ein Admin-Konto nur für Verwaltungsaufgaben.
- **Do:** Rechte nach Least Privilege vergeben, über Gruppen statt an einzelne Benutzer, und befristete Rechte wieder entziehen.
- **Do:** Austritte und Abteilungswechsel sofort umsetzen: Konto sperren, Rechte prüfen, Geräte und Schlüssel zurückholen.
- **Don't:** Mit dem Domänen-Admin im Internet surfen oder E-Mails lesen.
- **Don't:** „Gib mir einfach Vollzugriff, dann geht's schneller“ – weder für Nutzer noch für dich selbst.
- **Don't:** Sammelkonten wie „azubi“ oder „lager“ mit gemeinsamem Passwort einrichten; dann weiß niemand, wer was getan hat.

### Passwörter und Geheimnisse
- **Do:** Passwörter, API-Schlüssel (API = Application Programming Interface) und Zertifikate in einem Passwort-Tresor ablegen; Notfallzugänge versiegelt und dokumentiert.
- **Do:** Standardpasswörter von Geräten, Druckern und Anwendungen sofort ändern.
- **Do:** Überall, wo es geht, MFA (Multi-Faktor-Authentifizierung) einschalten – zuerst für Admin- und Fernzugänge.
- **Don't:** Passwörter per E-Mail, Chat oder Post-it weitergeben, auch nicht „nur kurz“.
- **Don't:** Zugangsdaten in Skripte, Konfigurationsdateien oder ein Git-Repository schreiben.
- **Don't:** Nutzer nach ihrem Passwort fragen – ein seriöser Support braucht es nie.

### Änderungen an Systemen
- **Do:** Änderungen planen, ankündigen und über den Change-Prozess freigeben lassen; ein Rückfallplan gehört immer dazu.
- **Do:** Erst in der Testumgebung ausprobieren, dann in einem Wartungsfenster in Produktion.
- **Do:** Nur eine Sache auf einmal ändern und danach prüfen, ob alles läuft – so weißt du, was den Fehler verursacht hat.
- **Don't:** Freitagnachmittag kurz vor Feierabend größere Änderungen einspielen.
- **Don't:** Mehrere Baustellen gleichzeitig aufmachen und dann nicht mehr wissen, welche den Fehler gebracht hat.
- **Don't:** Ungefragt „mal eben aufräumen“ – unbekannte Freigaben, Dienste oder Regeln haben oft einen Grund, den nur jemand anderes kennt.

### Backups
- **Do:** Nach der 3-2-1-Regel sichern und mindestens eine Kopie offline oder unveränderbar halten.
- **Do:** Die Wiederherstellung regelmäßig testen – ein Backup, das nie zurückgespielt wurde, ist nur eine Hoffnung.
- **Do:** Vor jeder größeren Änderung einen Snapshot oder eine Sicherung anlegen und prüfen, dass sie da ist.
- **Don't:** Snapshots als Backup betrachten oder wochenlang liegen lassen; sie liegen auf demselben System und bremsen.
- **Don't:** Fehlermeldungen der Sicherung ignorieren, weil „es gestern ja auch ging“.

### Arbeiten an Produktivsystemen
- **Do:** Vor dem Ausführen prüfen, wo du gerade bist: Hostname, Verzeichnis, Benutzer, Umgebung (Test oder Produktion).
- **Do:** Gefährliche Befehle zuerst im Probelauf ausführen, z. B. mit `-WhatIf` in PowerShell oder `ls` statt `rm` in der Bash.
- **Do:** Bei Fernwartung um Erlaubnis bitten, erklären, was du tust, und die Sitzung danach sauber beenden.
- **Don't:** Befehle aus Foren oder von einer KI ungeprüft als Administrator oder root ausführen.
- **Don't:** Löschen mit Platzhaltern wie `rm -rf $VERZEICHNIS/*`, ohne vorher zu prüfen, ob die Variable gefüllt ist.
- **Don't:** Firewall- oder Netzwerkänderungen aus der Ferne ohne Rückweg einspielen – sonst sperrst du dich selbst aus.

### Dokumentation und Tickets
- **Do:** Jede Anfrage und jede Änderung als Ticket erfassen, auch wenn sie im Flur kam.
- **Do:** Lösungen so dokumentieren, dass ein Kollege sie um 3 Uhr nachts nachvollziehen kann: Was war los, was wurde geändert, wie macht man es rückgängig.
- **Do:** Netzpläne, IP-Listen, Passwort-Tresor und Inventar aktuell halten.
- **Don't:** Wissen nur im Kopf behalten – wer der Einzige ist, der etwas kann, macht sich zum Risiko für den Betrieb.
- **Don't:** Tickets schließen, ohne dass der Nutzer bestätigt hat, dass das Problem gelöst ist.

### Datenschutz und Vertraulichkeit
- **Do:** Nur auf Daten zugreifen, die du für die Aufgabe wirklich brauchst, und Zugriffe auf fremde Postfächer nur mit Auftrag und Dokumentation.
- **Do:** Bildschirm sperren (Windows + L), sobald du den Platz verlässt – gerade mit Admin-Rechten.
- **Do:** Datenträger vor der Entsorgung sicher löschen oder vernichten und das nachweisen.
- **Don't:** Aus Neugier in Gehaltsdaten, privaten Dateien oder Postfächern stöbern – das kann arbeits- und strafrechtliche Folgen haben.
- **Don't:** Interna, Sicherheitslücken oder Kundendaten außerhalb der Firma erzählen oder posten.

### Fehler und Sicherheitsvorfälle
- **Do:** Eigene Fehler sofort melden. Früh gemeldet sind sie fast immer harmloser als ein vertuschter Fehler, der später auffliegt.
- **Do:** Bei Verdacht auf einen Angriff den Notfallplan befolgen: Gerät vom Netz trennen, aber eingeschaltet lassen, Vorgesetzte und Sicherheitsverantwortliche informieren.
- **Do:** Nach jedem größeren Vorfall eine Nachbesprechung ohne Schuldzuweisung machen und daraus lernen.
- **Don't:** Logdateien löschen oder Spuren „aufräumen“ – sie werden für die Analyse gebraucht.
- **Don't:** Auf eigene Faust Lösegeld zahlen, Angreifer kontaktieren oder Systeme neu aufsetzen, bevor geklärt ist, was passiert ist.

### Umgang mit Nutzern
- **Do:** Freundlich bleiben, auch bei der zehnten gleichen Frage, und in einfachen Worten erklären.
- **Do:** Bei Passwort-Resets und Rechteänderungen die Identität prüfen, z. B. per Rückruf an die hinterlegte Nummer.
- **Do:** Erwartungen klar machen: Wann wird es gelöst, und was passiert bis dahin?
- **Don't:** Nutzer bloßstellen („Haben Sie es schon mal mit Einschalten versucht?“).
- **Don't:** Sich unter Druck setzen lassen („Ich bin der Chef, das muss sofort gehen!“) – genau so funktioniert Social Engineering.

### Checkliste: Die goldenen Regeln
- Erst denken, dann Enter.
- Kein Change ohne Backup und Rückfallplan.
- Was nicht dokumentiert ist, ist nicht passiert.
- Admin-Rechte nur, wenn sie gerade gebraucht werden.
- Nie Passwörter weitergeben oder erfragen.
- Fehler sofort melden – lieber einmal zu viel fragen.
- Neugier endet an fremden Daten.
