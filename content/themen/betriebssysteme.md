---
titel: Betriebssysteme & Clients
---

Wie du Windows- und Linux-Clients installierst, Benutzer und Rechte verwaltest und Dateisysteme einordnest. Grundlage für fast jede Aufgabe in Teil 1 der Abschlussprüfung („Einrichten eines IT-gestützten Arbeitsplatzes“).

## Windows-Installation {#windows-installation}

### Kernbegriffe
- **Clean Install:** Neuinstallation auf leerem Datenträger, alte Daten gehen verloren.
- **In-Place-Upgrade:** Neue Version über die alte, Programme und Daten bleiben.
- **Image-Verteilung:** Ein vorbereitetes Abbild wird auf viele PCs ausgerollt, z. B. mit WDS (Windows Deployment Services) und MDT (Microsoft Deployment Toolkit) oder Windows Autopilot.
- **unattend.xml:** Antwortdatei für eine unbeaufsichtigte Installation.

### Tabelle: Mindestanforderungen Windows 11
| Komponente | Minimum |
| --- | --- |
| Prozessor | 64 Bit, 1 GHz, mind. 2 Kerne, kompatible CPU |
| Arbeitsspeicher | 4 GB |
| Speicher | 64 GB |
| Firmware | UEFI mit Secure Boot |
| Sicherheitschip | TPM 2.0 |

### Befehle
- `winver` – zeigt Windows-Version und Build
- `systeminfo` – Hardware- und Systemdaten auf einen Blick
- `sfc /scannow` – prüft und repariert Systemdateien
- `DISM /Online /Cleanup-Image /RestoreHealth` – repariert das Systemabbild

### Merksatz
Ohne TPM 2.0 und Secure Boot keine reguläre Windows-11-Installation.

## Linux-Grundlagen {#linux-grundlagen}

### Kernbegriffe
- **Distribution:** Linux-Kernel plus Software-Paket, z. B. Debian/Ubuntu (apt) oder RHEL (Red Hat Enterprise Linux)/Fedora (dnf).
- **Root:** Administrator-Konto unter Linux; Rechte holst du dir besser mit sudo.
- **Paketmanager:** Installiert und aktualisiert Software aus Repositories.

### Tabelle: Wichtige Verzeichnisse
| Pfad | Inhalt |
| --- | --- |
| /etc | Konfigurationsdateien |
| /home | Benutzerverzeichnisse |
| /var/log | Logdateien |
| /usr/bin | Programme |
| /root | Home von root |
| /tmp | temporäre Dateien |

### Befehle
- `ls -la` – Inhalt inkl. versteckter Dateien und Rechte
- `cd /etc && pwd` – Verzeichnis wechseln, aktuellen Pfad zeigen
- `grep -i fehler /var/log/syslog` – Text in Datei suchen
- `sudo apt update && sudo apt upgrade` – Paketlisten holen und System aktualisieren
- `systemctl status ssh` – Status eines Dienstes
- `man ls` – Hilfe zu einem Befehl

### Merksatz
Unter Linux ist alles eine Datei – auch Geräte (/dev) und Prozessinfos (/proc).

## Benutzer & Rechte {#benutzer-rechte}

### Kernbegriffe
- **rwx:** Lesen (r = 4), Schreiben (w = 2), Ausführen (x = 1) – je für Besitzer, Gruppe, Andere.
- **NTFS- vs. Freigaberechte:** Beim Zugriff übers Netz gilt die restriktivere Kombination aus beiden.
- **AGDLP:** Accounts → Global Groups → Domain Local Groups → Permissions: Rechte nie direkt an Benutzer vergeben.
- **Least Privilege:** Jeder bekommt nur die Rechte, die er für seine Aufgabe braucht.

### Befehle
- `chmod 640 bericht.txt` – rw- r-- --- setzen
- `chown max:it bericht.txt` – Besitzer und Gruppe ändern
- `sudo useradd -m max` – Benutzer mit Home-Verzeichnis anlegen
- `whoami /groups` – eigene Gruppen unter Windows
- `icacls C:\Daten` – NTFS-Rechte eines Ordners anzeigen

### Merksatz
4 – 2 – 1: Lesen, Schreiben, Ausführen. Pro Gruppe zusammenzählen.

### Prüfungsfrage
Welche Rechte setzt chmod 754?

1. 7 = 4 + 2 + 1 → Besitzer: rwx
2. 5 = 4 + 1 → Gruppe: r-x
3. 4 = 4 → Andere: r--
4. Ergebnis: rwxr-xr--

## Dateisysteme (NTFS, ext4) {#dateisysteme}

### Kernbegriffe
- **Journaling:** Änderungen werden erst protokolliert, damit das Dateisystem nach einem Absturz konsistent bleibt.
- **MBR:** Alte Partitionstabelle: max. 4 primäre Partitionen, Datenträger bis 2 TB.
- **GPT:** Moderne Partitionstabelle für UEFI: große Datenträger, unter Windows bis 128 Partitionen.

### Abbildung: MBR und GPT
![MBR: Am Anfang des Datenträgers steht der Master Boot Record, danach höchstens vier primäre Partitionen oder drei primäre und eine erweiterte mit logischen Laufwerken; Datenträger bis 2 TiB, die Partitionstabelle gibt es nur einmal. GPT: Schutz-MBR, GPT-Kopf, EFI-Systempartition, MSR, Windows-Partition, Recovery-Partition und am Ende eine Kopie der Partitionstabelle; bis 128 Partitionen unter Windows, sehr große Datenträger, Prüfsummen.](mbr-gpt.svg)

### Tabelle: Dateisysteme im Vergleich
| Dateisystem | Einsatz | Rechte | Journaling | Max. Dateigröße |
| --- | --- | --- | --- | --- |
| FAT32 | USB-Sticks, alte Geräte | nein | nein | 4 GB |
| exFAT | USB-Sticks, SD-Karten | nein | nein | praktisch unbegrenzt |
| NTFS | Windows | ja (ACL – Access Control List) | ja | praktisch unbegrenzt |
| ext4 | Linux | ja (rwx) | ja | 16 TB |

### Befehle
- `diskpart` – Datenträger und Partitionen unter Windows verwalten
- `lsblk` – Datenträger und Partitionen unter Linux
- `df -h` – belegter und freier Platz
- `sudo mkfs.ext4 /dev/sdb1` – Partition mit ext4 formatieren

### Merksatz
FAT32 scheitert an Dateien über 4 GB – dann exFAT oder NTFS nehmen.

## Bootprozess {#bootprozess}

### Kernbegriffe
- **POST:** Power-On Self-Test: Firmware prüft die Hardware.
- **Bootloader:** Lädt den Kernel – Windows Boot Manager oder GRUB.
- **Secure Boot:** UEFI startet nur signierte Bootloader.
- **systemd:** Init-System unter Linux, startet Dienste.

### Abbildung: Vom Einschalten bis zur Anmeldung
![Fünf Schritte: 1 Firmware (UEFI oder BIOS) mit POST, 2 Bootloader aus der EFI-Partition (Windows Boot Manager bzw. GRUB), 3 Kernel wird in den RAM geladen (ntoskrnl.exe bzw. vmlinuz mit initramfs), 4 Treiber und Dienste starten (Windows-Dienste bzw. systemd), 5 Anmeldung. Secure Boot startet nur signierte Bootloader. Zur Fehlersuche: Bis zu welchem Schritt kommt der Start?](bootprozess.svg)

### Tabelle: Ablauf
| Schritt | Windows | Linux |
| --- | --- | --- |
| 1. Firmware | UEFI/BIOS, POST | UEFI/BIOS, POST |
| 2. Bootloader | Windows Boot Manager | GRUB |
| 3. Kernel | winload.exe lädt ntoskrnl.exe | vmlinuz + initramfs |
| 4. Dienste | Dienste und Treiber | systemd-Units |
| 5. Anmeldung | Anmeldebildschirm | Login / Display Manager |

### Befehle
- `bcdedit` – Windows-Startkonfiguration anzeigen
- `systemctl get-default` – Standard-Ziel (grafisch oder Konsole)
- `journalctl -b` – Logs seit dem letzten Start

### Merksatz
Strom – POST – Loader – Kernel – Dienste – Login.

## Lizenzen {#lizenzen}

### Kernbegriffe
- **EULA:** Endbenutzer-Lizenzvertrag – regelt, wie Software genutzt werden darf.
- **OEM-Lizenz:** An ein Gerät gebunden, wird mit neuer Hardware verkauft.
- **Retail-Lizenz:** Einzeln gekauft, kann auf ein anderes Gerät übertragen werden.
- **Volumenlizenz:** Viele Lizenzen über einen Rahmenvertrag, zentral verwaltet.
- **Abonnement:** Monatliche oder jährliche Gebühr pro Nutzer, z. B. Microsoft 365.
- **CAL:** Client Access License – Zugriffslizenz auf Serverdienste, als User-CAL (pro Person) oder Device-CAL (pro Gerät).

### Tabelle: Open-Source-Lizenzen
| Lizenz | Art | Bedingung |
| --- | --- | --- |
| GPL | Copyleft | veränderte Software muss wieder unter GPL weitergegeben werden |
| MIT | freizügig | Lizenzhinweis beibehalten, sonst fast alles erlaubt |
| Apache 2.0 | freizügig | Lizenzhinweis, Änderungen kennzeichnen, Patentregelung |
| LGPL | schwaches Copyleft | Bibliothek darf in Closed-Source-Programmen stecken; Änderungen an der Bibliothek selbst offenlegen |
| MPL 2.0 | Copyleft je Datei | geänderte MPL-Dateien offenlegen; eigene neue Dateien dürfen geschlossen bleiben |

### Merksatz
Freeware ist kostenlos, Open Source ist offen – das ist nicht dasselbe.

### Prüfungsfrage
40 Mitarbeiter im Schichtbetrieb teilen sich 25 PCs und greifen auf einen Windows Server zu. Welche CALs sind günstiger?

1. User-CALs: eine pro Person → 40 Lizenzen.
2. Device-CALs: eine pro Gerät → 25 Lizenzen.
3. Device-CALs sind hier günstiger, weil sich mehrere Personen ein Gerät teilen.

## Open Source und Closed Source {#open-source}

### Kernbegriffe
- **Quellcode:** Der für Menschen lesbare Programmtext. Daraus wird das ausführbare Programm erzeugt.
- **Closed Source (proprietäre Software):** Der Quellcode ist nicht einsehbar. Der Hersteller bestimmt allein über Weiterentwicklung, Preise und Lizenzbedingungen. Beispiele: Windows, Microsoft 365, Adobe Photoshop.
- **Open Source:** Der Quellcode ist offen, darf gelesen, verändert und weitergegeben werden – nach den Bedingungen der jeweiligen Lizenz. Beispiele: Linux, LibreOffice, Firefox, Nextcloud.
- **Freie Software:** Begriff der Free Software Foundation mit vier Freiheiten: das Programm ausführen, untersuchen, weitergeben und verbessert weitergeben. „Frei“ meint Freiheit, nicht kostenlos.
- **Freeware:** Kostenlos nutzbar, aber meist Closed Source – der Quellcode bleibt geheim, Änderungen sind nicht erlaubt.
- **Shareware:** Zum Ausprobieren kostenlos, danach kostenpflichtig oder eingeschränkt.
- **Copyleft:** Lizenzbedingung, nach der veränderte Versionen bei der Weitergabe wieder unter derselben Lizenz stehen müssen (stark bei der GPL, abgeschwächt bei LGPL und MPL).
- **LGPL (Lesser GPL):** Abgeschwächtes Copyleft, gedacht für Programmbibliotheken – also Bausteine, die andere Programme mitbenutzen. Ein Programm darf eine LGPL-Bibliothek einbinden und trotzdem Closed Source bleiben. Wer die Bibliothek selbst verändert und weitergibt, muss genau diese Änderungen offenlegen. Außerdem müssen die Nutzer die Bibliothek gegen eine eigene Fassung austauschen können. Beispiele: glibc (die C-Standardbibliothek unter Linux), Qt.
- **MPL (Mozilla Public License):** Copyleft für einzelne Dateien. Wer eine Datei unter MPL verändert und weitergibt, muss diese Datei offenlegen. Eigene, neue Dateien im selben Programm dürfen unter einer anderen Lizenz stehen – auch Closed Source. Beispiele: Firefox, Thunderbird, LibreOffice.
- **Freizügige Lizenzen (permissive):** Erlauben fast alles, auch die Verwendung in Closed-Source-Produkten; nur der Lizenzhinweis muss bleiben (MIT, BSD – Berkeley Software Distribution, Apache 2.0).
- **Open Core und Subscription:** Geschäftsmodelle mit Open Source: kostenlose Grundversion, kostenpflichtige Zusatzfunktionen (Open Core) oder bezahlter Support und Updates (z. B. Red Hat Enterprise Linux, SUSE).
- **Vendor Lock-in:** Abhängigkeit von einem Hersteller, weil Daten, Formate oder Schnittstellen sich nur schwer auf ein anderes Produkt übertragen lassen.
- **Digitale Souveränität:** Fähigkeit, selbst über die eigene IT zu entscheiden. Öffentliche Verwaltungen setzen deshalb zunehmend auf Open Source.

### Tabelle: Open Source und Closed Source im Vergleich
| Merkmal | Open Source | Closed Source |
| --- | --- | --- |
| Quellcode | einsehbar und veränderbar | geheim |
| Lizenzkosten | meist keine; Support kann kosten | Kauf, Abo oder Lizenz pro Nutzer/Gerät |
| Anpassung | selbst oder durch Dienstleister möglich | nur was der Hersteller anbietet |
| Support | Community oder bezahlter Dienstleister | Hersteller mit Vertrag |
| Sicherheit | jeder kann prüfen; Lücken werden oft schnell öffentlich | Prüfung nur durch Hersteller; Vertrauen nötig |
| Abhängigkeit | gering, offene Formate | Vendor Lock-in möglich |
| Kompatibilität | teils Probleme mit verbreiteten Formaten | oft Industriestandard |
| Beispiele | Linux, LibreOffice, Nextcloud, PostgreSQL | Windows, Microsoft 365, SAP, Photoshop |

### Tabelle: Wie viel muss offen bleiben?
| Lizenz | Was muss bei der Weitergabe offen sein? | Darf eigener Code geschlossen bleiben? |
| --- | --- | --- |
| GPL | das ganze veränderte Programm | nein |
| AGPL | wie GPL – schon, wenn andere es nur über das Netz nutzen | nein |
| LGPL | nur die Bibliothek mit deinen Änderungen daran | ja, wenn du die Bibliothek nur einbindest |
| MPL 2.0 | nur die veränderten MPL-Dateien | ja, in deinen eigenen Dateien |
| MIT, BSD, Apache 2.0 | nichts – nur der Lizenzhinweis muss bleiben | ja |

### Tabelle: Kostenlos ist nicht gleich offen
| Begriff | Kostenlos? | Quellcode offen? | Ändern und weitergeben? |
| --- | --- | --- | --- |
| Open Source | meist | ja | ja, nach Lizenz |
| Freeware | ja | nein | nein |
| Shareware | nur zum Testen | nein | nein |
| Closed Source (kommerziell) | nein | nein | nein |
| Public Domain | ja | meist | ja, ohne Bedingungen |

### Merksatz
Open Source heißt: Quellcode offen, Ändern und Weitergeben erlaubt – aber nicht automatisch kostenlos und nicht ohne Pflichten. Freeware ist kostenlos, aber nicht offen.

### Prüfungsfrage
Ein Unternehmen verändert ein Programm, das unter der GPL steht, und nutzt es nur intern. Muss es den veränderten Quellcode veröffentlichen? Was ändert sich, wenn es das Programm an Kunden verkauft?

1. Die Pflichten der GPL greifen erst bei der Weitergabe an andere.
2. Reine interne Nutzung: keine Veröffentlichung nötig.
3. Verkauf oder Weitergabe an Kunden: Die Kunden müssen den Quellcode der veränderten Version erhalten können, und die Software muss wieder unter der GPL stehen (Copyleft).
4. Sonderfall AGPL: Dort gilt die Pflicht schon, wenn Nutzer die Software nur über das Netz verwenden, z. B. als Webanwendung.

## Häufige Fehler
- chmod-Werte falsch addiert: 6 ist rw-, nicht rwx.
- NTFS- und Freigaberechte nicht kombiniert – über das Netz gilt die restriktivere.
- Großes Image auf FAT32-Stick kopieren wollen – 4-GB-Grenze.
- MBR auf Datenträgern über 2 TB verwenden.
- Dauerhaft als root arbeiten statt sudo zu nutzen.
- Open Source mit kostenlos gleichsetzen – und Freeware mit Open Source.

## Links
- [Microsoft Learn – Windows](https://learn.microsoft.com/de-de/windows/) – offizielle Doku zu Installation und Verwaltung
- [ubuntuusers Wiki](https://wiki.ubuntuusers.de) – deutschsprachige Linux-Anleitungen

## Zusatz: Betriebssystemarchitekturen {#os-architekturen}
typ: text
zu: bootprozess

Wie der Kern eines Betriebssystems aufgebaut ist – und warum ein fehlerhafter Treiber unter Windows einen Bluescreen auslösen kann, ein Treiber unter QNX aber nicht.

Grundlage für alle Modelle: Der Prozessor kennt einen privilegierten **Kernel-Modus** (Ring 0), in dem Code alles darf, und einen eingeschränkten **Benutzermodus** (Ring 3) für Anwendungen. Anwendungen bitten den Kernel über **Systemaufrufe** (System Calls) um Dienste wie Datei öffnen oder Speicher anfordern. Je mehr Code im Kernel-Modus läuft, desto schneller – aber desto größer der Schaden, wenn darin ein Fehler steckt.

### Vergleich:

#### Monolithischer Kernel
![Anwendungen im Benutzermodus, alle Dienste und Treiber gemeinsam im Kernel](os-monolith.svg)
- **Kurz:** Alle Betriebssystemdienste einschließlich der Treiber laufen gemeinsam im Kernel-Modus.
- **Plus:** sehr schnell, weil Dienste sich direkt aufrufen können
- **Minus:** ein fehlerhafter Treiber kann das ganze System zum Absturz bringen; großer, komplexer Kernel
- **Beispiel:** Linux (mit nachladbaren Kernel-Modulen), klassische Unix-Systeme

#### Mikrokernel
![Treiber und Dateisystem als eigene Prozesse im Benutzermodus, kleiner Kernel mit IPC](os-mikrokernel.svg)
- **Kurz:** Im Kernel bleibt nur das Nötigste; Treiber und Dateisysteme laufen als eigene Prozesse im Benutzermodus und kommunizieren über Nachrichten (IPC).
- **Plus:** stabil und sicher – stürzt ein Treiber ab, wird nur dieser neu gestartet
- **Minus:** langsamer durch den ständigen Nachrichtenaustausch
- **Beispiel:** QNX (Autos, Medizintechnik, Industrie), MINIX 3, seL4

#### Hybridkernel
![Executive, Treiber, Kernel und HAL im Kernel-Modus, Subsysteme im Benutzermodus](os-hybrid.svg)
- **Kurz:** Aufgebaut wie ein Mikrokernel, aber viele Dienste und Treiber laufen aus Leistungsgründen doch im Kernel-Modus.
- **Plus:** guter Kompromiss aus Leistung und Struktur; Hardware-Abstraktion (HAL) erleichtert die Portierung
- **Minus:** Treiberfehler können weiterhin das System stoppen (Bluescreen)
- **Beispiel:** Windows NT-Kernel (Windows 10/11, Windows Server), macOS (XNU)

#### Unikernel
![Je eine Anwendung mit nötigen OS-Teilen als eigenes Image direkt auf dem Hypervisor](os-unikernel.svg)
- **Kurz:** Anwendung und nur die benötigten Betriebssystemteile werden zu einem einzigen Image zusammengebaut, das direkt auf einem Hypervisor läuft.
- **Plus:** sehr klein, startet in Millisekunden, kleine Angriffsfläche
- **Minus:** nur eine Anwendung pro Image, schwer zu debuggen, wenig verbreitet
- **Beispiel:** MirageOS, Spezialanwendungen in der Cloud
