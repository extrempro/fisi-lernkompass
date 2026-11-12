# Inhalte – Änderungen

Neueste Änderung oben. Überschrift = Inhaltsstand aus `meta.json`.

## 2026-11-12
- Neue Datei `planer.md`: Planer für das Abschlussprojekt im Format des Ausbildungsportals (Termine, Checklisten für Projektantrag und Dokumentation, Zeitplanung mit höchstens 40 Stunden, Fragen fürs Fachgespräch mit Uhr für die Präsentation, Links zum Merkblatt und zum Antragsportal). Inhaltlich wie der Projekt-Begleiter unter „Prüfungen“ im Lernkompass. Der Lernkompass selbst liest die Datei nicht; an den Cheatsheets ändert sich nichts.

## 2026-11-08
- Inhaltsprüfung: Backup-Kernbegriffe „Inkrementell“ und „Differenziell“ an das Archivbit-Modell angepasst (eine differenzielle Sicherung setzt das Archivbit nicht zurück).
- Ergonomie-Grafik: feste Tischhöhe 74 cm ± 2 cm (DGUV Information 215-410) statt 72 cm.
- 6 GHz: neben Low Power Indoor (200 mW, nur innen) auch Very Low Power (25 mW, auch im Freien) – Tabelle und Kanal-Grafik.
- Unternehmensmitbestimmung: „mehr als 500“ bzw. „mehr als 2 000“ Beschäftigte wie im Gesetz.
- NoSQL-Merksatz an die Tabelle angeglichen (Zeitreihen ergänzt).
- Struktogramm-Grafik: „viermal“ statt „dreimal“.
- Beispiele einheitlich mit ad.firma.de statt firma.local (Kerberos, bedingte Weiterleitung, PowerShell-SearchBase).
- KI-Verordnung: Zeile zum 2. Dezember 2026 (neue Verbote, Kennzeichnungspflicht auch für Altsysteme).

## 2026-11-06
- Neue Grafiken (Teil 2): Maximumprinzip beim Schutzbedarf, Ablauf eines Ransomware-Angriffs, Faktoren und MFA, VM und Container, USV-Typen, Aktiv/Passiv-Cluster, Bootprozess, MBR und GPT, Speicher im Vergleich, Formeldreieck mit Rechenbeispiel, Struktogramm/PAP/Pseudocode/Code, Wasserfall und Scrum, Sozialversicherung, Mitbestimmung des Betriebsrats und Fehleranalyse von unten nach oben.
- Neue Grafiken (Teil 1): OSI- und TCP/IP-Modell, Longest Prefix Match, Aufbau einer IPv6-Adresse, strukturierte Verkabelung, WLAN-Zellplan, QoS-Warteschlangen, Hypervisor Typ 1/2, VPN-Arten, Forward/Reverse Proxy, Active Directory mit AGDLP, vom ER-Modell zu Tabellen, Cloud-Servicemodelle und die drei Schutzziele.
- Neue Schritt-für-Schritt-Abläufe als Zusatzwissen: Switch lernt MAC-Adressen und ARP (Netzwerkgrundlagen), VLAN über einen Trunk, TCP-Handshake und -Abbau, DHCP mit DORA und Relay, DNS-Auflösung mit Cache und TTL, NAT/PAT und Portweiterleitung (Netzwerkdienste) sowie Verschlüsselung symmetrisch, asymmetrisch, hybrid und digitale Signatur (IT-Sicherheit).
- Netzwerkgrundlagen, WLAN: neue Unterthemen „WLAN-Standards und Protokolle“ (alle Übertragungsstandards von 802.11 bis Wi-Fi 7/8, Ergänzungsstandards wie 802.11e/h/i/k/r/v/w, Sicherheitsverfahren von WEP bis WPA3 und OWE, 802.1X/EAP, Sendeleistung in der EU, Grafik der Kanäle in 2,4/5/6 GHz) und „WLAN im Unternehmen planen und betreiben“ (Ausleuchtung, Zellplanung, Signal und SNR, Gleich- und Nachbarkanalstörung, SSID-Overhead mit Beispielrechnung, 2,4-GHz-Probleme und Störquellen, Dämpfung durch Baustoffe, Checkliste für den produktiven Betrieb).
- Netzwerkgrundlagen, Mitschnitt: Beispiel-Mitschnitt in Wireshark als Grafik mit Schritt-für-Schritt-Auswertung.
Abgleich mit echten Prüfungsaufgaben (Teil 2, Winter 2022/23) – Themen, die dort vorkamen und in der App fehlten:
- Netzwerkgrundlagen: neues Unterthema „VoIP, Videokonferenz und QoS“ (Codecs, Overhead, Latenz, Jitter, Paketverlust, DSCP, Traffic Shaping, Bandbreite bei Cloud-Telefonanlagen) und „Netzwerkverkehr analysieren (Mitschnitt)“ (Wireshark, Hex-Dump lesen, Hops aus TTL/Hop Limit, DNS-Antworten zuordnen); WLAN erweitert um Infrastruktur- und Ad-hoc-Modus, Gründe für geringere Datenraten, WPA2-Personal gegen Enterprise und eine Prüfungsfrage.
- Datenbanken: neue Unterthemen „Tabellen anlegen und Datentypen (DDL)“ (CREATE TABLE mit Fremdschlüssel, passende Datentypen, LIKE, COUNT) und „NoSQL-Datenbanken“.
- Server & Virtualisierung: neues Unterthema „Hochverfügbarkeit“; RAID um Hot Spare und Plattenbedarf ergänzt; Backup um Archivbit, Klonen, Snapshot, LTO/LTFS und Wiederherstellung bei fehlerhaftem Sicherungsplan; Archivierung um Speicherbedarf mit Komprimierung.
- IT-Sicherheit, DSGVO: TOM nach Kontrollarten (Zutritt, Zugang, Zugriff …) mit Hinweis auf die abweichenden Begriffe in § 64 BDSG und eine Prüfungsfrage.
- Automatisierung: neues Unterthema „Arrays und einfache Algorithmen“ (Index, Schleife, Summe, Mittelwert, Maximum, Ganzzahldivision).
- Cloud: On-Premises gegen Public Cloud und Latenz mit Prüfungsfrage; Hardware: Modulbezeichnung PC4-25600.

## 2026-11-05
- Künstliche Intelligenz: neues Unterthema „KI und IT-Sicherheit“ – KI als Ziel, als Werkzeug von Angreifern und in der Abwehr; direkte und indirekte Prompt Injection mit Grafik, gefährliche Dreierkombination, Datenabfluss, Poisoning, Slopsquatting, Deepfakes und CEO-Fraud; OWASP Top 10 für LLM-Anwendungen (2025) mit Gegenmaßnahmen; Prüfungsfrage zu einem Deepfake-Anruf.
- Netzwerkdienste, DNS: ausführlich erklärt – Namensraum, FQDN, autoritative Server, Reverse-Zonen, primäre/sekundäre und AD-integrierte Zonen, Zonentransfer, SOA Feld für Feld mit Seriennummer, Forwarder, bedingte Weiterleitung, Split-DNS, dynamische Updates, Beispielzone, weitere Einträge (SOA, SRV, CAA), Grafik zur Namensauflösung, neue Befehle und eine Prüfungsfrage. Zusatzwissen „DNS in der Praxis“ (Active Directory, SPF/DKIM/DMARC, Angriffe, DNSSEC, DoH/DoT, Umzug und Fehlersuche).
- IT-Sicherheit: neue Unterthemen „Digitale Signatur und Zertifikate (PKI)“ (Zertifikatskette, X.509, CSR, Formate, Sperrung, Browserwarnungen) und „TLS und HTTPS“ (Handshake TLS 1.3, Forward Secrecy, SNI, HSTS, Versionen) mit Grafiken; Zusatzwissen „Zertifikate im Betrieb“ (kürzere Laufzeiten bis 47 Tage, ACME, Überwachung, Schlüsselschutz, AD CS, SSH-Schlüssel im Unternehmen).
- Netzwerkdienste: neues Unterthema „SSH“ mit Ablaufgrafik, Host-Key und Schlüsselanmeldung, Absicherung per sshd_config, Tunnel, Jump Host und Vergleich der Fernzugriffsprotokolle.
- Netzwerkdienste, DHCP: ausführlich erklärt – DORA Schritt für Schritt mit Absender, Ports und Grafik, Lebenszyklus der Lease (T1/T2, Renewing, Rebinding), Optionen, Ausschlüsse, Relay, NAK/DECLINE; dazu IPv6 mit Router Advertisement, SLAAC, stateless und stateful DHCPv6 (SARR), M- und O-Flag, DUID, Prefix Delegation, DAD und ein Vergleich IPv4/IPv6. Neue Grafiken `dhcp-dora.svg` und `ipv6-adressvergabe.svg`.
- IT-Sicherheit: Zusatzwissen „MFA und Passwort-Manager“ – wie Passwörter gestohlen werden, MFA-Verfahren im Vergleich (SMS, TOTP, Push, FIDO2, Passkeys, Smartcard), Funktionsweise von TOTP und Passkeys, Angriffe auf MFA, Einführung im Unternehmen, Nutzen und Bedenken bei Passwort-Managern (inkl. BSI-Untersuchung 2025) und aktuelle Passwortregeln nach NIST SP 800-63B Rev. 4.
- Support: Zusatzwissen „Dos and Don'ts als IT-Admin“ – Regeln aus dem Admin-Alltag zu Konten und Rechten, Passwörtern, Änderungen, Backups, Arbeiten an Produktivsystemen, Dokumentation, Datenschutz, Sicherheitsvorfällen und dem Umgang mit Nutzern, dazu die goldenen Regeln.
- Neue Datei `ferien-hamburg.json`: Hamburger Schulferien der Schuljahre 2024/25 bis 2029/30 laut Ferienordnung der Schulbehörde, für den Ausbildungsplan.
- Abgleich mit dem Ausbildungsrahmenplan der FIAusbV – neue Unterthemen: Barrierefreiheit (Hardware), Qualitätsmanagement und Einführung und Übergabe von IT-Systemen (Projekt), Programmiersprachen und Paradigmen (Automatisierung), Archivierung und Wiederherstellung (Server), Nutzungsrichtlinien und Berechtigungskonzept (Sicherheit), Entgeltabrechnung, Unternehmen und Rechtsformen sowie Arbeits-, Brand- und Umweltschutz (WiSo).
- Automatisierung und KI zusätzlich Teil 1 der Abschlussprüfung zugeordnet (Programmiergrundlagen und technologische Trends gehören laut Verordnung dazu).
- Server & Virtualisierung: neues Unterthema „Monitoring der Infrastruktur“ (SNMP, Syslog, Agenten, Schwellwerte, Werkzeuge) und Zusatzwissen „Monitoring in der Praxis“.
- Netzwerkdienste: Zusatzwissen „Kerberos“ mit Ablaufgrafik, Vergleich zu NTLM, Fehlerquellen und Angriffen.
- Support: Zusatzwissen „Kundenkommunikation in der Praxis“ mit Vier-Seiten-Modell, Fragetechniken, Formulierungen und Sicherheit im Gespräch.
- Neues Themenfeld „Künstliche Intelligenz“ (13 Themenfelder): vier Unterthemen mit Grafiken zu Begriffen, Funktionsweise von Sprachmodellen, RAG und dem Unterschied zwischen Chat und Agent; KI-Verordnung mit Fristen nach dem Digital-Omnibus 2026; Zusatzwissen aus Admin-Sicht.
- Automatisierung: neues Unterthema „Skripte planen, testen und sicher ausführen“ (Anforderung aufschreiben, -WhatIf, Probelauf je Werkzeug, was man vermeiden sollte) und Zusatzwissen „Effizient scripten“ (Editor, Autovervollständigung, Hilfe, Analyse-Werkzeuge, KI-Assistenten).
- Support: neues Unterthema „Troubleshooting-Werkzeuge der Betriebssysteme“ mit Vergleich Windows, Linux und macOS; Zusatzwissen „Troubleshooting Schritt für Schritt“ und „ITIL in der Praxis“ (Wertsystem, Leitprinzipien, Change-Arten, Eskalation, SLA/OLA/UC, Kennzahlen, ITIL 5).
- Neue Unterthemen: Arbeitsspeicher (RAM-Typen, DDR4/DDR5, Bauformen, ECC, Latenz), Aufbau von Frames und Paketen (Ethernet, IPv4, TCP, UDP), Software Defined Networking, Network Access Control (802.1X), Zero Trust & Least Privilege, Open Source und Closed Source.
- Zusatzwissen: Prozessoren – Typen und Einsatzbereiche; Grafikkarten – Gaming, CAD und KI.
- Ergonomie: Grafik zur guten Sitzhaltung am Bildschirm.
- Zusatzwissen auf das einheitliche Format umgestellt und mit den passenden Unterthemen verknüpft.
- „Verkabelung & Netzwerkplan“ heißt jetzt „Strukturierte Verkabelung & Netzwerkplan“: Primär-, Sekundär- und Tertiärbereich, Verteiler, Permanent Link und Channel, Abnahmemessung, Beschriftung, neue Prüfungsfrage. Kabelkategorien und Twisted Pair stehen jetzt bei „Kabeltypen“.
- Zusatzwissen: So arbeitet ein Mainboard (Hardware) mit Blockschaltbild, Befehlszyklus und Speicherhierarchie.
- Zusatzwissen: BSI IT-Grundschutz in der Praxis (IT-Sicherheit & Datenschutz) – Absicherungsarten, Vorgehen, Kompendium, Zertifizierung und Ausblick auf Grundschutz++.
- Neue Unterthemen bei Netzwerkgrundlagen: Netzwerktopologien, Kabeltypen, LWL-Steckertypen, Netzwerkkabel crimpen – jeweils mit Grafiken.
- Betriebssystem- und Systemarchitekturen: ASCII-Schemas durch Grafiken ersetzt.
- Zusatzwissen: Betriebssystemarchitekturen (Betriebssysteme & Clients) und DSGVO aus Sicht eines IT-Admins (IT-Sicherheit & Datenschutz).
- Alle zwölf Themenfelder vollständig: Hardware, Netzwerkdienste, Server & Virtualisierung, Cloud, Automatisierung, Datenbanken, Support, Projektmanagement und WiSo neu befüllt.
- Neues Unterthema „Normen & Energieeffizienz“ bei Hardware.
- Gerüste gefüllt: Verkabelung & Netzwerkplan, Bedrohungen & Angriffe, Authentifizierung, Risikoanalyse & Sicherheitstests, Lizenzen.
- WiSo mit Werten für 2026: Beitragssätze Sozialversicherung, Mindestausbildungsvergütung, Mindestlohn.

## 2026-11-04
- Netzwerkgrundlagen, IT-Sicherheit & Datenschutz sowie Betriebssysteme & Clients vollständig.
- Neue Unterthemen als Gerüst: Verkabelung & Netzwerkplan, Bedrohungen & Angriffe, Authentifizierung, Risikoanalyse & Sicherheitstests, Lizenzen.
- Zusatzwissen: Paketreise (Router und Firewall), Systemarchitekturen im Vergleich.
- Übrige neun Themenfelder als Gerüst.
