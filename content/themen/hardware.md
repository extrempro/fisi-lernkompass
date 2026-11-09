---
titel: Hardware & Arbeitsplatz
---

Aus welchen Komponenten ein Arbeitsplatz-PC besteht, wie sie zusammenspielen und wie du einen Arbeitsplatz nach Kundenwunsch auswählst und ergonomisch einrichtest. Leistungs- und Kostenrechnungen sind ein Klassiker in Teil 1 der Abschlussprüfung.

## PC-Komponenten {#pc-komponenten}

### Kernbegriffe
- **CPU:** Prozessor; wichtige Kennwerte sind Kerne, Threads, Takt (GHz), Cache und Leistungsaufnahme (TDP).
- **Mainboard:** Verbindet alle Komponenten; Sockel und Chipsatz müssen zur CPU passen, Formfaktor zum Gehäuse (ATX, Micro-ATX, Mini-ITX).
- **Arbeitsspeicher (RAM):** Flüchtiger Speicher für laufende Programme; DDR4 und DDR5 sind nicht kompatibel. Dual Channel nutzt zwei Module parallel.
- **ECC-RAM:** Arbeitsspeicher mit Fehlerkorrektur – Standard in Servern.
- **Netzteil:** Wandelt Netzspannung in Gleichspannung; das 80-PLUS-Siegel steht für den Wirkungsgrad.
- **UEFI:** Moderne Firmware (Nachfolger des BIOS) mit Secure Boot und GPT-Unterstützung.

### Tabelle: Auswahl nach Einsatzzweck
| Einsatz | CPU | RAM | Speicher | Grafik |
| --- | --- | --- | --- | --- |
| Büro | 4–6 Kerne | 16 GB | 512 GB NVMe-SSD | integriert |
| Entwicklung | 8+ Kerne | 32 GB | 1 TB NVMe-SSD | integriert oder Einstieg |
| CAD/Video | 8+ Kerne, hoher Takt | 32–64 GB | 1–2 TB NVMe-SSD | dedizierte GPU |

### Befehle
- `msinfo32` – Systeminformationen mit allen Komponenten (Windows)
- `wmic memorychip get capacity,speed` – RAM-Module auslesen (Windows, älter)
- `lscpu` – Prozessordaten (Linux)
- `sudo dmidecode -t memory` – RAM-Module auslesen (Linux)

### Merksatz
Erst den Einsatzzweck klären, dann Komponenten wählen – und auf Kompatibilität von Sockel, RAM-Typ und Formfaktor achten.

## Bussysteme {#bussysteme}

### Kernbegriffe
- **Bus:** Gemeinsamer Übertragungsweg für Daten zwischen Komponenten.
- **PCIe:** Serielle Punkt-zu-Punkt-Verbindung mit Lanes (x1, x4, x8, x16); jede Generation verdoppelt etwa die Datenrate.
- **Bit und Byte:** Datenraten werden meist in Bit/s angegeben, Dateigrößen in Byte – 1 Byte = 8 Bit.
- **Bruttodatenrate:** Theoretischer Höchstwert; real kommt durch Protokoll-Overhead weniger an.

### Tabelle: Schnittstellen und Datenraten
| Schnittstelle | Datenrate (brutto) | Typischer Einsatz |
| --- | --- | --- |
| USB 2.0 | 480 Mbit/s | Maus, Tastatur |
| USB 3.2 Gen 1 | 5 Gbit/s | USB-Sticks, externe Festplatten |
| USB 3.2 Gen 2 | 10 Gbit/s | externe SSDs |
| USB4 / Thunderbolt 4 | 40 Gbit/s | Dockingstationen, Monitore |
| SATA III | 6 Gbit/s | SATA-SSDs, Festplatten |
| PCIe 4.0 x4 | ca. 8 GByte/s | NVMe-SSDs |
| PCIe 5.0 x16 | ca. 64 GByte/s | Grafikkarten |

### Merksatz
Bit klein, Byte groß: Gbit/s geteilt durch 8 ergibt GByte/s.

### Prüfungsfrage
Wie lange dauert die Übertragung von 30 GB über USB 3.2 Gen 1 (5 Gbit/s) theoretisch?

1. 30 GB = 30 · 8 = 240 Gbit
2. 240 Gbit ÷ 5 Gbit/s = 48 s
3. Real dauert es länger, weil Overhead und Geräte die Bruttorate nicht erreichen.

## Arbeitsspeicher (RAM) {#arbeitsspeicher}

### Kernbegriffe
- **SRAM und DRAM:** SRAM speichert jedes Bit in mehreren Transistoren – sehr schnell, aber teuer und groß; er steckt als Cache in der CPU. DRAM speichert jedes Bit in einem winzigen Kondensator, der ständig aufgefrischt werden muss (Refresh) – günstig und dicht, daher der eigentliche Arbeitsspeicher.
- **DDR (Double Data Rate):** Überträgt Daten zweimal pro Takt. Die Angabe DDR5-6000 meint 6000 Millionen Übertragungen pro Sekunde (MT/s) bei 3000 MHz Takt.
- **DDR4 und DDR5:** DDR5 ist schneller (ab 4800 MT/s), braucht weniger Spannung (1,1 V statt 1,2 V), teilt jedes Modul in zwei Unterkanäle und hat einen eigenen Spannungsregler (PMIC) auf dem Riegel. Kerbe und Kontakte sind anders – die Generationen passen nicht in denselben Steckplatz.
- **DIMM und SO-DIMM:** DIMM ist der lange Riegel für Desktop-PCs und Server, SO-DIMM der kurze für Notebooks und Mini-PCs. Beide gibt es als DDR4 und DDR5.
- **Aufgelöteter Speicher und LPCAMM2:** In flachen Notebooks ist LPDDR-Speicher oft fest aufgelötet und nicht aufrüstbar. LPCAMM2 ist ein neues, flaches Modul, mit dem sich auch LPDDR wieder tauschen lässt.
- **UDIMM, RDIMM, LRDIMM:** Unbuffered DIMMs stecken in normalen PCs. Registered DIMMs puffern die Steuersignale über ein Register und erlauben mehr und größere Module pro Kanal – Standard in Servern. LRDIMMs puffern zusätzlich die Daten für noch mehr Kapazität. Die Typen lassen sich nicht mischen.
- **ECC:** Echte ECC-Module speichern pro 64 Bit zusätzliche Prüfbits, erkennen Bitfehler und korrigieren einzelne Fehler. CPU und Mainboard müssen ECC unterstützen. Das „On-Die-ECC“ jedes DDR5-Chips schützt nur intern und ersetzt echtes ECC nicht.
- **Modulbezeichnung (PC4-25600):** Auf dem Riegel steht oft zweierlei: DDR4-3200 nennt die effektive Übertragungsrate (3200 MT/s, umgangssprachlich „3200 MHz effektiv“, echter Takt 1600 MHz), PC4-25600 die Datenrate in MB/s: 3200 × 8 Byte (64-Bit-Bus) = 25.600 MB/s = 25,6 GB/s.
- **Latenz (CL):** CAS-Latenz = Anzahl Takte, bis angeforderte Daten kommen. Wirklich vergleichbar ist nur die Zeit: Latenz in ns = CL × 2000 / MT/s. DDR4-3200 CL16 und DDR5-6000 CL30 liegen beide bei 10 ns.
- **XMP und EXPO:** Profile im Riegel für höhere Geschwindigkeiten (Intel: XMP, AMD: EXPO). Ohne Aktivierung im UEFI läuft der Speicher nur mit dem langsameren Standardtakt nach JEDEC.
- **Speicherkanäle:** Jeder Kanal hat 64 Bit Breite. Desktop-CPUs haben meist zwei Kanäle (Dual Channel), Server-CPUs 8 bis 12. Volle Bandbreite gibt es nur, wenn alle Kanäle bestückt sind.

### Abbildung: RAM-Arten im Überblick
![SRAM als Cache in der CPU, DRAM als DDR4/DDR5-Riegel, LPDDR in Notebooks, GDDR auf Grafikkarten und HBM in KI-Beschleunigern](ram-arten.svg)

### Tabelle: DDR4 und DDR5 im Vergleich
| Merkmal | DDR4 | DDR5 |
| --- | --- | --- |
| Geschwindigkeit (JEDEC) | 1600–3200 MT/s | ab 4800 MT/s, aktuell bis über 8000 MT/s |
| Spannung | 1,2 V | 1,1 V |
| Kanäle pro Modul | einer mit 64 Bit | zwei mit je 32 Bit |
| Spannungsregelung | auf dem Mainboard | auf dem Modul (PMIC) |
| Fehlerkorrektur | nur bei ECC-Modulen | On-Die-ECC intern; echtes ECC nur bei ECC-Modulen |
| Pins (DIMM / SO-DIMM) | 288 / 260 | 288 / 262 |

### Tabelle: Speichertypen und Einsatz
| Typ | Bauform | Einsatz | Besonderheit |
| --- | --- | --- | --- |
| DDR5 UDIMM | DIMM | Desktop-PC, Workstation | steckbar, aufrüstbar |
| DDR5 SO-DIMM | SO-DIMM | Notebook, Mini-PC | kurz, steckbar |
| DDR5 RDIMM (ECC) | DIMM mit Register | Server | sehr große Module, Fehlerkorrektur |
| LPDDR5X | aufgelötet oder LPCAMM2 | Notebook, Smartphone | sehr sparsam, meist nicht aufrüstbar |
| GDDR6/GDDR7 | auf der Grafikkarte | Grafik, Spiele, CAD | hohe Bandbreite |
| HBM3e | gestapelt neben dem Chip | KI-Beschleuniger | extrem hohe Bandbreite, sehr teuer |

### Befehle
- `Get-CimInstance Win32_PhysicalMemory | Select-Object Capacity, Speed, PartNumber` – eingebaute Module mit Größe und Takt (PowerShell)
- `sudo dmidecode -t memory` – Speichermodule, Steckplätze und ECC-Status (Linux)
- `mdsched` – Windows-Speicherdiagnose beim nächsten Neustart

### Merksatz
Bauform passend zum Gerät (DIMM oder SO-DIMM), Generation passend zum Board (DDR4 oder DDR5), Typ passend zum System (UDIMM oder RDIMM) – und Riegel immer paarweise für Dual Channel.

### Prüfungsfrage
Ein PC hat zwei Module DDR5-5600 im Dual Channel. Wie hoch ist die theoretische Speicherbandbreite?

1. Jeder Kanal überträgt 64 Bit = 8 Byte pro Übertragung.
2. Pro Kanal: 5600 Mio. Übertragungen/s × 8 Byte = 44.800 MB/s = 44,8 GB/s.
3. Zwei Kanäle: 2 × 44,8 GB/s = 89,6 GB/s.
4. Mit nur einem Riegel wäre es die Hälfte – deshalb immer zwei Module in die laut Handbuch richtigen Steckplätze.

## Speicher (HDD/SSD/NVMe) {#speicher}

### Kernbegriffe
- **HDD:** Magnetische Festplatte mit drehenden Scheiben; günstig pro TB, aber langsam und stoßempfindlich.
- **SATA-SSD:** Flash-Speicher am SATA-Anschluss, durch die Schnittstelle auf ca. 550 MB/s begrenzt.
- **NVMe-SSD:** Flash-Speicher direkt an PCIe, meist im Formfaktor M.2 2280; mehrere GB/s.
- **TBW:** Terabytes Written – wie viel insgesamt auf eine SSD geschrieben werden darf.
- **GB und GiB:** Hersteller rechnen dezimal (1 GB = 10⁹ Byte), Betriebssysteme oft binär (1 GiB = 2³⁰ Byte).

### Abbildung: HDD, SATA-SSD und NVMe im Vergleich
![Maßstabsgetreue Balken für das sequenzielle Lesen: HDD mit 7200 Umdrehungen etwa 200 MB/s, SATA-SSD etwa 550 MB/s, NVMe-SSD mit PCIe 4.0 etwa 7000 MB/s. Zugriffszeit: HDD etwa 8 ms, weil der Lesekopf mechanisch fährt, SSD unter 0,1 ms. Bei vielen kleinen Zugriffen zählen IOPS und Zugriffszeit mehr als die Lesegeschwindigkeit.](speicher-vergleich.svg)

### Tabelle: Speicher im Vergleich
| Typ | Lesen (ca.) | Zugriffszeit | Einsatz |
| --- | --- | --- | --- |
| HDD 7200 U/min | 200 MB/s | ca. 8 ms | Archiv, NAS, Backup |
| SATA-SSD | 550 MB/s | unter 0,1 ms | Aufrüstung älterer PCs |
| NVMe-SSD PCIe 4.0 | 7000 MB/s | unter 0,1 ms | System- und Arbeitslaufwerk |

### Befehle
- `Get-PhysicalDisk` – Datenträger mit Typ (HDD/SSD) und Zustand (PowerShell)
- `lsblk -d -o name,rota,size` – rota=1 heißt drehende Festplatte (Linux)
- `sudo smartctl -a /dev/sda` – SMART-Werte zur Gesundheit auslesen (Linux)

### Merksatz
SSD fürs System, HDD fürs Archiv.

### Prüfungsfrage
Warum zeigt Windows bei einer neuen 1-TB-SSD nur etwa 931 GB an?

1. Der Hersteller rechnet dezimal: 1 TB = 1 000 000 000 000 Byte.
2. Windows rechnet binär: 1 000 000 000 000 ÷ 1024³ ≈ 931 GiB.
3. Es fehlt kein Speicher – nur die Einheit ist eine andere (Windows schreibt trotzdem „GB“).

## Peripherie {#peripherie}

### Kernbegriffe
- **Auflösung:** Anzahl der Bildpunkte, z. B. Full HD 1920 × 1080, WQHD 2560 × 1440, 4K/UHD 3840 × 2160.
- **Panel-Typen:** IPS (farbtreu, blickwinkelstabil), VA (hoher Kontrast), TN (schnell, schwächere Farben).
- **Bildwiederholrate:** Bilder pro Sekunde in Hz; fürs Büro reichen 60–75 Hz.
- **Dockingstation:** Verbindet Notebook über ein Kabel (USB-C/Thunderbolt) mit Monitoren, Netzwerk, Strom und Peripherie.
- **USB-C mit DisplayPort Alt Mode:** Überträgt Bildsignal über USB-C; mit Power Delivery auch Strom.

### Tabelle: Bildschirm-Anschlüsse
| Anschluss | Signal | Hinweis |
| --- | --- | --- |
| VGA | analog | veraltet, unscharf bei hoher Auflösung |
| DVI | digital | veraltet, kein Ton |
| HDMI | digital, mit Ton | Standard bei Monitoren und Beamern |
| DisplayPort | digital, mit Ton | Daisy Chaining mehrerer Monitore möglich |
| USB-C (DP Alt Mode) | digital, mit Ton | ein Kabel für Bild, Daten und Strom |

### Merksatz
Für den Büroarbeitsplatz: IPS-Panel, mindestens Full HD, höhenverstellbar – und der passende Anschluss am Notebook oder an der Dockingstation.

## Ergonomie {#ergonomie}

### Kernbegriffe
- **ArbStättV:** Arbeitsstättenverordnung; Anhang 6 regelt Bildschirmarbeitsplätze.
- **ASR:** Technische Regeln für Arbeitsstätten, z. B. ASR A3.4 zur Beleuchtung.
- **Bildschirmabstand:** Etwa eine Armlänge (rund 50–70 cm); die Oberkante des Bildschirms liegt auf oder knapp unter Augenhöhe.
- **Ausrichtung:** Bildschirm seitlich zum Fenster (Blickrichtung parallel zur Fensterfront), um Blendung und Spiegelung zu vermeiden.

### Abbildung: Gute Sitzhaltung am Bildschirm
![Sitzhaltung von der Seite: Bildschirm eine Armlänge entfernt mit Oberkante auf Augenhöhe, Unterarme waagerecht, Rücken an der Lehne, Oberschenkel waagerecht, Füße flach auf dem Boden](ergonomie-haltung.svg)

### Tabelle: Checkliste Bildschirmarbeitsplatz
| Bereich | Anforderung |
| --- | --- |
| Bildschirm | flimmerfrei, entspiegelt, dreh- und neigbar, Zeichen gut lesbar |
| Tisch | ausreichend Fläche, Höhe passend zur Körpergröße (ideal höhenverstellbar) |
| Stuhl | höhenverstellbar, Rückenlehne mit Lordosenstütze |
| Beleuchtung | Büro mindestens 500 Lux, blendfrei |
| Haltung | Unterarme etwa waagerecht, Füße flach auf dem Boden |
| Software | an die Aufgabe angepasst, verständlich |

### Merksatz
Augen eine Armlänge weg, Blick leicht nach unten, Licht von der Seite.

## Barrierefreiheit {#barrierefreiheit}

### Kernbegriffe
- **Barrierefreiheit:** IT-Systeme, Software, Webseiten und Dokumente sind so gestaltet, dass Menschen mit Behinderungen sie ohne fremde Hilfe nutzen können – etwa bei Seh-, Hör- oder motorischen Einschränkungen. Davon profitieren auch alle anderen, z. B. bei Sonnenlicht auf dem Display oder mit Gipsarm.
- **Barrierefreiheitsstärkungsgesetz (BFSG):** Seit dem 28. Juni 2025 müssen viele Produkte und Dienstleistungen barrierefrei sein, z. B. Computer, Smartphones, Selbstbedienungsterminals, Online-Shops, Banking und E-Books. Kleinstunternehmen mit weniger als 10 Beschäftigten und höchstens 2 Mio. € Umsatz sind bei Dienstleistungen ausgenommen.
- **BITV 2.0:** Verordnung für öffentliche Stellen des Bundes: Webseiten, Apps und interne Software müssen barrierefrei sein.
- **WCAG:** Web Content Accessibility Guidelines – internationaler Standard mit Prüfkriterien in den Stufen A, AA und AAA. Gefordert ist meist Stufe AA; die europäische Norm EN 301 549 baut darauf auf.
- **Vier Prinzipien (POUR):** wahrnehmbar, bedienbar, verständlich, robust – z. B. Alternativtexte, Bedienung per Tastatur, einfache Sprache, saubere Technik für Hilfsprogramme.
- **Kontrast:** Normaler Text braucht mindestens 4,5 : 1 gegenüber dem Hintergrund, großer Text 3 : 1. Informationen nie nur über Farbe vermitteln.
- **Screenreader:** Liest Bildschirminhalte vor oder gibt sie auf einer Braillezeile aus, z. B. NVDA und JAWS (Windows), Sprachausgabe/Narrator (Windows), VoiceOver (macOS, iOS), TalkBack (Android).
- **Weitere Hilfsmittel:** Bildschirmlupe, Spracheingabe, Großschrift- und Einhandtastaturen, Trackball, Kopf- oder Augensteuerung, Untertitel.
- **Barrierefreie Dokumente:** Überschriften mit Formatvorlagen, Alternativtexte für Bilder, Tabellen mit Kopfzeile, aussagekräftige Linktexte, PDF als PDF/UA. Office prüft mit „Barrierefreiheit überprüfen“.
- **Förderung:** Für die Ausstattung eines Arbeitsplatzes für schwerbehinderte Beschäftigte gibt es Zuschüsse, z. B. vom Inklusionsamt.

### Tabelle: Bedienungshilfen der Betriebssysteme
| Funktion | Windows | macOS |
| --- | --- | --- |
| Einstellungen öffnen | Win + U | Systemeinstellungen → Bedienungshilfen |
| Screenreader | Sprachausgabe: Win + Strg + Enter | VoiceOver: Befehl + F5 |
| Bildschirmlupe | Win + Plus | Zoom in den Bedienungshilfen |
| Kontrast | Kontrastdesigns | Kontrast erhöhen |
| Spracheingabe | Sprachzugriff | Sprachsteuerung |
| Untertitel | Liveuntertitel | Live-Untertitel |

### Tabelle: Typische Barrieren und Lösungen
| Barriere | Lösung |
| --- | --- |
| Bild ohne Beschreibung | Alternativtext, der den Inhalt erklärt |
| Bedienung nur mit Maus | alles per Tastatur erreichbar, sichtbarer Fokus |
| hellgraue Schrift auf Weiß | Kontrast mindestens 4,5 : 1 |
| Status nur über Farbe (rot/grün) | zusätzlich Text oder Symbol |
| Video ohne Untertitel | Untertitel und Transkript |
| „Hier klicken“ als Link | Linktext nennt das Ziel |
| eingescanntes PDF | durchsuchbares, getaggtes PDF (PDF/UA) |

### Merksatz
Barrierefrei heißt: wahrnehmbar, bedienbar, verständlich, robust. Was für einige notwendig ist, ist für alle komfortabel.

### Prüfungsfrage
Eine neue Mitarbeiterin mit starker Sehbehinderung bekommt einen Büroarbeitsplatz. Was berücksichtigst du bei der Einrichtung?

1. Bedarf mit ihr gemeinsam klären: Welche Hilfsmittel nutzt sie schon, was braucht sie?
2. Hardware: großer Monitor mit Schwenkarm, ggf. Braillezeile, Großschrifttastatur, gute blendfreie Beleuchtung.
3. Software: Screenreader (z. B. NVDA oder JAWS) und Bildschirmlupe installieren, Kontrast und Schriftgröße anpassen; prüfen, ob die Fachanwendungen damit bedienbar sind.
4. Förderung über das Inklusionsamt prüfen und die Einweisung in ihrem Tempo durchführen.
5. Dokumentationen und Vorlagen barrierefrei bereitstellen.

## Leistungsberechnungen {#leistungsberechnungen}

### Kernbegriffe
- **Leistung:** P = U · I (Watt = Volt · Ampere).
- **Energie:** E = P · t, meist in kWh (1 kWh = 1000 W über 1 Stunde).
- **Stromkosten:** Energie in kWh · Preis pro kWh.
- **Wirkungsgrad:** η = abgegebene Leistung ÷ aufgenommene Leistung.
- **Scheinleistung:** In VA angegeben; Wirkleistung in W = VA · Leistungsfaktor (cos φ).

### Abbildung: Formeldreieck und Rechenbeispiel
![Formeldreieck mit P oben sowie U und I unten: P = U · I, I = P ÷ U, U = P ÷ I. Rechenbeispiel: 230 V · 1,5 A = 345 W; im Dauerbetrieb 8.760 Stunden im Jahr ergibt 0,345 kW · 8.760 h = 3.022,2 kWh, bei 0,30 €/kWh also 906,66 €. Wirkungsgrad: Gibt ein Netzteil 300 W ab und hat η = 0,9, nimmt es 333,3 W auf, 33,3 W werden zu Wärme.](leistung-formeln.svg)

### Tabelle: Formeln auf einen Blick
| Gesucht | Formel |
| --- | --- |
| Leistung | P = U · I |
| Stromstärke | I = P ÷ U |
| Energie | E = P · t |
| Kosten | Kosten = E · Preis |
| Aufnahme Netzteil | P_auf = P_ab ÷ η |

### Merksatz
Watt mal Stunden durch 1000 ergibt kWh – erst dann mit dem Strompreis multiplizieren.

### Prüfungsfrage
Ein PC braucht im Betrieb 120 W und läuft 8 Stunden an 220 Arbeitstagen. Was kostet das bei 0,30 €/kWh pro Jahr?

1. Energie: 120 W · 8 h · 220 = 211 200 Wh
2. Umrechnen: 211 200 Wh = 211,2 kWh
3. Kosten: 211,2 kWh · 0,30 €/kWh = 63,36 €

## Normen & Energieeffizienz {#normen-energie}

### Kernbegriffe
- **CE-Kennzeichnung:** Der Hersteller erklärt, dass das Produkt die EU-Vorschriften erfüllt – Pflicht für den Verkauf in der EU, aber kein Prüfsiegel.
- **GS-Zeichen:** „Geprüfte Sicherheit“ – freiwillig, von einer unabhängigen Stelle geprüft.
- **EU-Energielabel:** Effizienzklassen A–G, z. B. für Monitore.
- **ElektroG/WEEE:** Altgeräte dürfen nicht in den Hausmüll (durchgestrichene Mülltonne); Händler und Hersteller müssen zurücknehmen.
- **RoHS:** Beschränkt gefährliche Stoffe wie Blei und Quecksilber in Elektrogeräten.

### Tabelle: Siegel und Kennzeichen
| Zeichen | Bedeutung | Pflicht? |
| --- | --- | --- |
| CE | Konformität mit EU-Recht (Herstellererklärung) | ja |
| GS | geprüfte Sicherheit durch Prüfstelle | nein |
| Energy Star | energieeffiziente Bürogeräte | nein |
| TCO Certified | Ergonomie, Umwelt, soziale Kriterien | nein |
| Blauer Engel | Umweltzeichen (z. B. Recycling, Emissionen) | nein |
| 80 PLUS | Wirkungsgrad von Netzteilen | nein |

### Merksatz
CE ist Pflicht und eine Selbsterklärung – Prüfsiegel wie GS oder TCO sind freiwillig, aber aussagekräftiger.

## Häufige Fehler
- Bit und Byte verwechseln: 1 Gbit/s sind nur 125 MB/s.
- Bei Stromkosten Watt statt Kilowattstunden mit dem Preis multiplizieren.
- DDR4- und DDR5-Module für austauschbar halten.
- CE-Kennzeichnung mit einem unabhängigen Prüfsiegel verwechseln.
- USV oder Netzteil nur nach VA statt nach Wirkleistung in Watt auswählen.
- Bei DDR-Speicher MHz und MT/s verwechseln: DDR5-6000 läuft mit 3000 MHz.
- Registered-Module (RDIMM) in einen normalen PC stecken – sie laufen dort nicht.

## Links
- [Elektronik-Kompendium](https://www.elektronik-kompendium.de/) – Hardware und Schnittstellen erklärt
- [BAuA – Arbeitsstätten](https://www.baua.de) – ArbStättV und Technische Regeln (ASR)

## Zusatz: So arbeitet ein Mainboard {#mainboard}
typ: text
zu: pc-komponenten, bussysteme, betriebssysteme.bootprozess

Was auf der Hauptplatine passiert, wenn ein Programm läuft – und warum CPU, RAM, Chipsatz und Grafikkarte genau dort sitzen, wo sie sitzen.

Das Mainboard ist die Verkehrsplanung des Rechners: Es versorgt alle Bauteile mit Strom und verbindet sie über Leitungen (Busse). Die schnellsten Verbindungen gehen direkt zur CPU, langsamere Geräte hängen am Chipsatz.

### Der Überblick
![Blockschaltbild: CPU in der Mitte mit RAM, Grafikkarte und NVMe-SSD direkt angebunden; Chipsatz darunter mit SATA, USB, LAN und Audio; VRM versorgt die CPU mit Strom](mainboard-block.svg)

| Komponente | angebunden an | Verbindung |
| --- | --- | --- |
| RAM | CPU (Speichercontroller) | Speicherbus, 1–2 Kanäle |
| Grafikkarte | CPU | PCIe x16 |
| NVMe-SSD (erster M.2-Platz) | CPU | PCIe x4 |
| Chipsatz | CPU | DMI bzw. PCIe-Link |
| SATA, USB, LAN, Audio, weitere M.2 | Chipsatz | über den Chipsatz gebündelt |
| UEFI-Firmware | Chipsatz | SPI-Flash-Chip |

### CPU – der Prozessor
Die CPU führt Befehle aus, und zwar immer im gleichen Zyklus: Befehl holen, dekodieren, ausführen, Ergebnis zurückschreiben. Das **Steuerwerk** liest und übersetzt die Befehle, das **Rechenwerk** (ALU) rechnet, die **Register** sind ihre kleinsten und schnellsten Speicher.
![Befehlszyklus: Holen, Dekodieren, Ausführen, Zurückschreiben – bei jedem Takt](cpu-befehlszyklus.svg)
- **Takt:** Basistakt (meist 100 MHz) × Multiplikator = CPU-Takt, z. B. 100 MHz × 45 = 4,5 GHz. Im Turbo steigt der Takt kurzzeitig, solange Kühlung und Strom reichen.
- **Kerne und Threads:** Jeder Kern arbeitet unabhängig. Mit SMT (Intel: Hyper-Threading) bearbeitet ein Kern zwei Threads abwechselnd und nutzt Wartezeiten aus. Intel kombiniert schnelle Performance-Kerne (P-Kerne) mit sparsamen Effizienz-Kernen (E-Kerne).
- **Cache:** Kleiner, sehr schneller Speicher in der CPU. L1 und L2 gehören je einem Kern, den L3 teilen sich alle Kerne.
- **Integrierte Grafik (iGPU):** Viele CPUs haben eine Grafikeinheit eingebaut. Sie nutzt einen Teil des Arbeitsspeichers als Grafikspeicher.
- **TDP:** Wärmeleistung in Watt, für die der Kühler ausgelegt sein muss.
- **Befehlssatz:** PCs und Server nutzen x86-64 (Intel, AMD), Smartphones, Apple-Rechner und viele Cloud-Server ARM. Programme müssen für den Befehlssatz übersetzt sein.

### RAM – der Arbeitsspeicher
Im RAM liegen alle laufenden Programme und ihre Daten. Er ist flüchtig: Ohne Strom ist der Inhalt weg. Die CPU holt sich Daten aus dem RAM in ihre Caches, weil der RAM im Vergleich zur CPU langsam ist.
![Speicherhierarchie: von Registern und Cache über RAM bis SSD und Festplatte – je weiter unten, desto größer und langsamer](speicherhierarchie.svg)
- **Dual Channel:** Zwei Riegel in den richtigen Steckplätzen (laut Handbuch meist A2 und B2) verdoppeln die Bandbreite. Ein einzelner Riegel bremst besonders die integrierte Grafik.
- **DDR-Generationen:** DDR4 und DDR5 sind mechanisch und elektrisch nicht kompatibel – das Mainboard bestimmt, welche Generation passt.
- **ECC:** Fehlerkorrigierender Speicher erkennt und behebt Bitfehler. Pflicht in Servern; braucht Unterstützung von CPU und Mainboard.
- **Zu wenig RAM:** Das Betriebssystem lagert in die Auslagerungsdatei auf der SSD aus – der Rechner wird spürbar langsamer.

### Chipsatz – der Verteiler
Der Chipsatz bündelt alle Geräte, die nicht direkt an der CPU hängen: SATA-Anschlüsse, USB, Netzwerk, Audio und weitere PCIe- und M.2-Plätze. Zur CPU führt nur eine einzige Verbindung (Intel: DMI). Arbeiten viele Geräte am Chipsatz gleichzeitig, teilen sie sich diese Bandbreite.

Früher gab es zwei Chips: die **Northbridge** für RAM und Grafik und die **Southbridge** für alles Langsame. Heute steckt die Northbridge in der CPU (Speichercontroller, PCIe-Controller), übrig ist der **Chipsatz** (Intel: PCH, Platform Controller Hub).
- Der Chipsatz legt fest, was das Mainboard kann: Anzahl der USB- und SATA-Anschlüsse, zusätzliche Lanes, Übertakten.
- Er muss zur CPU-Generation passen – ein passender Sockel allein reicht nicht immer.

### GPU – die Grafikkarte
Eine CPU hat wenige, sehr flexible Kerne. Eine GPU hat Tausende einfache Kerne, die dieselbe Rechnung gleichzeitig auf viele Daten anwenden – ideal für Bilder, Videos und KI-Berechnungen.
- **Dedizierte Grafikkarte:** eigener, sehr schneller Grafikspeicher (VRAM, z. B. GDDR6/GDDR7), angebunden über PCIe x16 direkt an der CPU. Leistungsstarke Karten brauchen zusätzliche Stromstecker vom Netzteil.
- **Integrierte Grafik:** sparsam und günstig, reicht für Büro, Videos und mehrere Monitore.
- **Monitor anschließen:** Bei einer dedizierten Karte den Monitor an die Grafikkarte stecken, nicht an das Mainboard – sonst läuft das Bild über die iGPU oder bleibt schwarz.

### PCIe-Lanes – wer bekommt wie viel?
PCIe arbeitet mit Lanes: Jede Lane ist eine eigene Sende- und Empfangsleitung. Desktop-CPUs haben je nach Modell nur etwa 20 bis 28 Lanes, meist 16 für die Grafikkarte und 4 für die erste NVMe-SSD. Alles Weitere hängt am Chipsatz.
- Ein x16-Steckplatz kann elektrisch nur mit x4 angebunden sein – das steht im Handbuch.
- Steckplätze teilen sich oft Lanes: Ist ein bestimmter M.2-Platz belegt, fallen z. B. zwei SATA-Anschlüsse weg oder der zweite x16-Slot läuft nur mit x8.
- Vor dem Einbau also immer die Lane-Aufteilung im Mainboard-Handbuch prüfen.

### Firmware und weitere Bausteine
- **UEFI (früher BIOS):** Firmware in einem Flash-Chip auf dem Mainboard. Sie testet und initialisiert die Hardware und startet den Bootloader. Einstellungen liegen in einem nichtflüchtigen Speicher (NVRAM).
- **CMOS-Batterie (CR2032):** Hält die Echtzeituhr (RTC) am Laufen. Ist sie leer, stimmt nach dem Ausschalten die Uhrzeit nicht mehr.
- **TPM 2.0:** Sicherheitschip für Schlüssel, z. B. für BitLocker und Secure Boot; Voraussetzung für Windows 11. Oft als Firmware-TPM in der CPU umgesetzt (Intel PTT, AMD fTPM).
- **VRM (Spannungswandler):** Wandeln die 12 V vom Netzteil in die niedrige, sehr genaue Spannung für CPU und RAM (unter 1,5 V). Schwache VRMs werden heiß und drosseln starke CPUs.
- **Debug-LEDs und Signaltöne:** Viele Mainboards zeigen beim Start mit LEDs (CPU, DRAM, VGA, BOOT) oder Pieptönen, wo ein Fehler liegt.

### Was beim Einschalten passiert
1. Der Einschalter weckt das Netzteil; es meldet stabile Spannungen mit dem Signal „Power Good“.
2. Die VRMs versorgen die CPU, sie startet an einer festen Adresse in der UEFI-Firmware.
3. POST (Power-On Self-Test): Die Firmware prüft und initialisiert CPU, RAM (Memory Training), Grafik und Laufwerke.
4. Die Firmware erkennt alle PCIe-Geräte und verteilt Ressourcen.
5. Sie liest die Bootreihenfolge und sucht auf dem Startlaufwerk die EFI-Systempartition.
6. Secure Boot prüft die Signatur des Bootloaders (z. B. Windows Boot Manager, GRUB).
7. Der Bootloader lädt den Betriebssystem-Kernel in den RAM, und der Kernel übernimmt die Kontrolle.

## Zusatz: Prozessoren – Typen und Einsatzbereiche {#cpu-typen}
typ: text
zu: pc-komponenten, arbeitsspeicher

Warum ein Notebook-Prozessor anders gebaut ist als ein Server-Prozessor – und woran man erkennt, welcher wofür taugt.

Alle Prozessoren arbeiten nach demselben Prinzip (Befehle holen, dekodieren, ausführen), unterscheiden sich aber stark darin, wofür sie optimiert sind: lange Akkulaufzeit, hohe Leistung pro Kern, möglichst viele Kerne oder alles zusammen in einem Chip.

### Vergleich: Prozessoren nach Einsatzgebiet

#### Desktop
- **Kurz:** Für PCs am Arbeitsplatz und zu Hause, gesteckt in einen Sockel. Wenige bis mittlere Kernzahl (6–24), hoher Takt, 2 Speicherkanäle.
- **Plus:** hohe Leistung pro Kern, günstig, aufrüstbar
- **Minus:** begrenzte Zahl an PCIe-Lanes und RAM-Kanälen; ECC meist nur eingeschränkt
- **Beispiel:** Intel Core Ultra (Desktop), AMD Ryzen

#### Notebook und Mobil
- **Kurz:** Auf Effizienz getrimmt, fest aufgelötet. Leistungsaufnahme stark begrenzt, meist mit integrierter Grafik und NPU für KI-Funktionen.
- **Plus:** sparsam, lange Akkulaufzeit, alles in einem Chip
- **Minus:** nicht tauschbar; unter Dauerlast drosselt der Takt wegen Hitze
- **Beispiel:** Intel Core Ultra (Mobil), AMD Ryzen AI, Qualcomm Snapdragon X, Apple M

#### Workstation
- **Kurz:** Für CAD, Simulation, Videoschnitt und Softwareentwicklung. Viele Kerne, viele Speicherkanäle und PCIe-Lanes für mehrere Grafikkarten.
- **Plus:** sehr viel Rechenleistung und RAM, ECC-Unterstützung
- **Minus:** teuer, hoher Stromverbrauch, eigene Mainboards
- **Beispiel:** AMD Ryzen Threadripper PRO, Intel Xeon W

#### Server
- **Kurz:** Für Rechenzentren und Virtualisierung. Sehr viele Kerne (bis über 100), 8–12 Speicherkanäle, viele PCIe-Lanes, oft zwei CPUs pro Server.
- **Plus:** viele VMs und Container gleichzeitig, ECC und Fernwartung, für Dauerbetrieb ausgelegt
- **Minus:** teuer, oft niedrigerer Takt pro Kern, Lizenzkosten mancher Software hängen an der Kernzahl
- **Beispiel:** Intel Xeon 6, AMD EPYC, ARM-Server-CPUs bei Cloud-Anbietern

#### System on a Chip (SoC)
- **Kurz:** CPU, Grafik, NPU, Speichercontroller und oft auch der RAM sitzen in einem Gehäuse. Fast immer mit ARM-Befehlssatz.
- **Plus:** sehr effizient, kurze Wege, kompakte Geräte
- **Minus:** nichts aufrüstbar; RAM-Größe beim Kauf festgelegt
- **Beispiel:** Smartphones, Tablets, Apple-Mac, Raspberry Pi, Router

### x86 oder ARM
Der Befehlssatz legt fest, welche Maschinenbefehle ein Prozessor versteht. Programme müssen dafür übersetzt sein; Windows auf ARM und Apple-Macs können x86-Programme zusätzlich emulieren, verlieren dabei aber Leistung.
![Klassischer PC mit einzelnen Bauteilen im Vergleich zum System on a Chip, in dem CPU, GPU, NPU und RAM in einem Gehäuse sitzen](cpu-soc.svg)

| Merkmal | x86-64 | ARM |
| --- | --- | --- |
| Hersteller | Intel, AMD | Entwurf von ARM, gebaut von Apple, Qualcomm, Ampere, AWS u. a. |
| Stärke | riesige Software-Auswahl, Spiele, Unternehmenssoftware | sehr effizient, lange Akkulaufzeit |
| Typische Geräte | PCs, Notebooks, die meisten Server | Smartphones, Macs, Copilot+-Notebooks, Cloud-Server |
| Achtung | – | Treiber für ältere Hardware und Spezialsoftware fehlen manchmal |

### Was die Kennzahlen bedeuten
| Kennzahl | Bedeutung | Worauf achten |
| --- | --- | --- |
| Kerne / Threads | parallele Rechenwerke; SMT bearbeitet zwei Threads pro Kern | viele Kerne für Virtualisierung und Rendering, hoher Takt für Spiele und Office |
| Basis- und Boost-Takt | Grundtakt und kurzzeitiger Höchsttakt | Boost nur bei guter Kühlung |
| Cache (L2/L3) | schneller Zwischenspeicher | großer L3-Cache hilft Spielen und Datenbanken |
| TDP / Leistungsaufnahme | Wärme, die der Kühler abführen muss | Kühler und Netzteil passend auslegen |
| Sockel / Chipsatz | mechanische und elektrische Verbindung zum Board | muss zur CPU-Generation passen |
| PCIe-Lanes / RAM-Kanäle | Anbindung von GPU, SSDs und Speicher | wichtig bei Workstations und Servern |
| NPU (TOPS) | KI-Rechenleistung in Billionen Operationen pro Sekunde | Copilot+-PCs brauchen mindestens 40 TOPS |

### Hybride Kerne, Chiplets und NPU
- **Hybride Architektur:** Intel kombiniert schnelle Performance-Kerne (P-Kerne) mit sparsamen Effizienz-Kernen (E-Kerne); das Betriebssystem verteilt die Aufgaben. Auch ARM-Chips arbeiten so (big.LITTLE).
- **Chiplets:** Statt eines großen Chips werden mehrere kleine in ein Gehäuse gesetzt, z. B. Rechenkerne und Ein-/Ausgabe getrennt. Das senkt Kosten und erlaubt sehr hohe Kernzahlen (AMD Ryzen und EPYC, neuere Intel-CPUs).
- **NPU (Neural Processing Unit):** Spezielles Rechenwerk für KI-Aufgaben wie Hintergrundunschärfe in Videokonferenzen, Live-Untertitel oder lokale Sprachmodelle – deutlich sparsamer als CPU oder GPU.

### Checkliste: Prozessor auswählen
- Einsatzzweck klären: Office, Entwicklung, CAD, Virtualisierung?
- Sockel und Chipsatz des Mainboards prüfen – auch ein BIOS-Update kann nötig sein.
- Integrierte Grafik vorhanden? Bei Intel fehlt sie bei Modellen mit „F“ im Namen.
- Kühler für die Leistungsaufnahme auslegen; bei Boxed-CPUs ohne Kühler einen kaufen.
- Für Server und Workstations: ECC-Unterstützung, Speicherkanäle, PCIe-Lanes, Lizenzmodell der Software (pro Kern?).
- Bei ARM-Geräten prüfen, ob alle benötigten Programme und Treiber verfügbar sind.

## Zusatz: Grafikkarten – Gaming, CAD und KI {#gpu-typen}
typ: text
zu: pc-komponenten

Drei Karten mit fast demselben Chip können sich im Preis um das Zehnfache unterscheiden. Woran das liegt und welche Karte wofür gedacht ist.

### CPU und GPU – zwei Arbeitsweisen
Eine CPU hat wenige, sehr flexible Kerne für komplizierte Abläufe. Eine GPU hat Tausende einfache Rechenkerne, die dieselbe Rechnung gleichzeitig auf riesige Datenmengen anwenden – für Pixel in Spielen, für Bauteile in CAD-Modellen oder für die Matrizen eines KI-Modells.
![CPU mit wenigen großen Kernen und Cache, GPU mit tausenden kleinen Kernen und eigenem Grafikspeicher](cpu-gpu-kerne.svg)

### Vergleich: Gaming, Workstation und Rechenzentrum

#### Gaming-Grafikkarte
- **Kurz:** Für Spiele und Kreativarbeit am PC. Hohe Bildraten, Raytracing und KI-Hochskalierung (DLSS, FSR, XeSS). 8 bis 32 GB GDDR-Speicher.
- **Plus:** sehr viel Leistung fürs Geld, häufige Treiber-Updates für neue Spiele
- **Minus:** kein ECC-Speicher, keine Zertifizierung für CAD-Software, große Kühler mit Lüftern
- **Beispiel:** NVIDIA GeForce RTX 50, AMD Radeon RX, Intel Arc

#### Workstation-Grafikkarte (CAD)
- **Kurz:** Für CAD, Simulation, 3D-Visualisierung und Videoschnitt im Unternehmen. Treiber sind für Profi-Software zertifiziert, der Speicher ist größer und hat ECC.
- **Plus:** zertifizierte, stabile Treiber, viel Speicher mit Fehlerkorrektur, Support und lange Verfügbarkeit
- **Minus:** deutlich teurer bei ähnlicher Rohleistung
- **Beispiel:** NVIDIA RTX PRO (z. B. RTX PRO 6000 Blackwell mit 96 GB GDDR7 und ECC), AMD Radeon PRO

#### KI-Beschleuniger (Rechenzentrum)
- **Kurz:** Für das Training und den Betrieb großer KI-Modelle in Servern. Riesiger, gestapelter HBM-Speicher, spezielle Rechenwerke für niedrige Genauigkeit (FP8, FP4), schnelle Verbindung zwischen vielen GPUs.
- **Plus:** extreme Rechenleistung und Speicherbandbreite, skaliert über viele Karten
- **Minus:** sehr teuer, über 1 kW pro GPU, braucht Rechenzentrums-Kühlung; keine Monitoranschlüsse
- **Beispiel:** NVIDIA B200/B300 (bis 288 GB HBM3e), AMD Instinct

### Die Unterschiede im Detail
| Merkmal | Gaming | Workstation (CAD) | KI-Rechenzentrum |
| --- | --- | --- | --- |
| Speicher | 8–32 GB GDDR7/GDDR6 | bis 96 GB GDDR7, mit ECC | bis 288 GB HBM3e |
| Treiber | Game-Ready, häufige Updates | zertifiziert für CAD-Software (ISV) | Rechenzentrums-Treiber, KI-Frameworks |
| Bildausgänge | ja | ja, oft mehrere DisplayPort, Sync für Videowände | keine |
| Kühlung | große Lüfter | Lüfter oder Gebläse, passend für mehrere Karten | passiv, Luftstrom vom Server |
| Mehrere Karten | unüblich | über PCIe | NVLink, Hunderte GPUs im Verbund |
| Leistungsaufnahme | 150–575 W | 300–600 W | über 1000 W |
| Preis | Hunderte bis rund 2.500 € | einige Tausend bis über 10.000 € | Zehntausende Euro pro GPU |

### Warum CAD-Arbeitsplätze Profikarten bekommen
- **ISV-Zertifizierung:** Hersteller von CAD-Programmen (Independent Software Vendors wie Autodesk, Dassault oder Siemens) testen bestimmte Karten mit bestimmten Treibern. Nur dann gibt es vollen Support, wenn etwas falsch dargestellt wird.
- **ECC-Speicher:** Bei stundenlangen Simulationen und großen Baugruppen verhindert Fehlerkorrektur, dass ein einzelner Bitfehler das Ergebnis verfälscht.
- **Viel Speicher:** Große Baugruppen, Punktwolken und Renderings passen komplett in den Grafikspeicher.
- **Praxis:** Für Ausbildung, Studium und kleinere Modelle reicht oft eine Gaming-Karte. Im Unternehmen entscheidet meist die Supportfrage.

### Was KI-Karten auszeichnet
- **Speicher entscheidet:** Ein KI-Modell muss in den Grafikspeicher passen. Faustregel bei 16-Bit-Genauigkeit: 2 Byte pro Parameter – ein Modell mit 7 Milliarden Parametern braucht rund 14 GB plus Reserve.
- **Tensor-Kerne:** Spezielle Rechenwerke für Matrizen-Multiplikation, die Grundoperation neuronaler Netze. Sie rechnen mit niedriger Genauigkeit (FP16, FP8, FP4) sehr viel schneller.
- **Bandbreite:** HBM-Speicher liefert mehrere Terabyte pro Sekunde – ein Vielfaches von GDDR.
- **Software:** NVIDIA setzt auf CUDA, AMD auf ROCm. Viele KI-Werkzeuge laufen zuerst oder am besten mit CUDA.
- **Lokal statt Rechenzentrum:** Kleinere Modelle laufen auch auf Gaming- oder Workstation-Karten mit viel Speicher – oder sparsam auf der NPU eines Notebooks.

### Checkliste: Grafikkarte einbauen
- Netzteil: genug Leistung und die passenden Stromstecker (z. B. 12V-2x6 bei aktuellen NVIDIA-Karten); Stecker vollständig einstecken.
- Gehäuse: Länge und Breite der Karte (Slots) prüfen, Luftstrom einplanen.
- Steckplatz: oberster PCIe-x16-Slot, direkt an der CPU angebunden.
- Monitor an die Grafikkarte anschließen, nicht ans Mainboard.
- Treiber vom Hersteller installieren – bei CAD die zertifizierte Version laut Software-Hersteller.
