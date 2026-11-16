---
titel: Netzwerkgrundlagen
---

Wie Daten durch ein Netzwerk kommen: Schichtenmodelle, IP-Adressen, Subnetze, Switching, Routing und WLAN. Subnetting kommt in fast jeder Prüfung vor.

## OSI- und TCP/IP-Modell {#osi-tcpip}

### Kernbegriffe
- **OSI-Modell:** Open Systems Interconnection – ein Modell, das die Netzwerkkommunikation in sieben Schichten aufteilt. Das TCP/IP-Modell fasst sie zu vier Schichten zusammen.
- **Kapselung:** Beim Senden fügt jede Schicht einen eigenen Header hinzu, beim Empfangen wird er wieder entfernt.
- **TCP:** Transmission Control Protocol – verbindungsorientiert und zuverlässig, Aufbau per 3-Way-Handshake: SYN (Synchronize – Verbindungswunsch), SYN-ACK (Zusage mit Bestätigung, Acknowledge), ACK (Bestätigung).
- **UDP:** Verbindungslos und schnell, ohne Bestätigung – z. B. DNS (Domain Name System), VoIP, Streaming.
- **Port:** Adressiert die Anwendung auf einem Host (0–65535).

### Abbildung: OSI- und TCP/IP-Modell
![Die sieben OSI-Schichten mit Dateneinheit, Geräten und Beispielen: 7 Anwendung, 6 Darstellung, 5 Sitzung (Daten; HTTP, DNS, TLS), 4 Transport (Segment; TCP, UDP, Ports), 3 Vermittlung (Paket; Router; IP, ICMP), 2 Sicherung (Frame; Switch; Ethernet, MAC, VLAN), 1 Bitübertragung (Bit; Hub, Kabel). Rechts die Zuordnung zum TCP/IP-Modell: Anwendung (OSI 5 bis 7), Transport (4), Internet (3), Netzzugang (1 und 2). Beim Senden fügt jede Schicht ihren Header hinzu, beim Empfangen wird er entfernt.](osi-modell.svg)

### Tabelle: Schichten
| Nr. | OSI-Schicht | TCP/IP | Dateneinheit | Beispiele |
| --- | --- | --- | --- | --- |
| 7 | Anwendung | Anwendung | Daten | HTTP (Hypertext Transfer Protocol), DNS, SMTP (Simple Mail Transfer Protocol) |
| 6 | Darstellung | Anwendung | Daten | TLS (Transport Layer Security), JPEG |
| 5 | Sitzung | Anwendung | Daten | RPC (Remote Procedure Call), NetBIOS |
| 4 | Transport | Transport | Segment | TCP, UDP |
| 3 | Vermittlung | Internet | Paket | IP (Internet Protocol), ICMP (Internet Control Message Protocol), Router |
| 2 | Sicherung | Netzzugang | Frame | Ethernet, MAC (Media Access Control), Switch |
| 1 | Bitübertragung | Netzzugang | Bit | Kabel, Funk, Hub |

### Tabelle: Wichtige Ports
| Port | Dienst | Protokoll |
| --- | --- | --- |
| 20/21 | FTP (File Transfer Protocol) | TCP |
| 22 | SSH (Secure Shell) | TCP |
| 25 | SMTP | TCP |
| 53 | DNS | UDP/TCP |
| 67/68 | DHCP (Dynamic Host Configuration Protocol) | UDP |
| 80 | HTTP | TCP |
| 110 | POP3 (Post Office Protocol, Version 3) | TCP |
| 143 | IMAP (Internet Message Access Protocol) | TCP |
| 443 | HTTPS (HTTP Secure) | TCP |
| 3389 | RDP (Remote Desktop Protocol) | TCP |

### Befehle
- `netstat -an` – offene Verbindungen und lauschende Ports (Windows)
- `ss -tulpn` – lauschende Ports mit Prozess (Linux)

### Merksatz
Von oben nach unten: „Alle Deutschen Studenten Trinken Verschiedene Sorten Bier“.

### Prüfungsfrage
Auf welcher OSI-Schicht arbeitet ein klassischer Switch?

1. Ein Switch leitet Frames anhand der Ziel-MAC-Adresse weiter.
2. MAC-Adressen gehören zur Sicherungsschicht.
3. Antwort: Schicht 2. Layer-3-Switches können zusätzlich routen.

## Aufbau von Frames und Paketen {#paketaufbau}

### Kernbegriffe
- **PDU (Protocol Data Unit):** Die Dateneinheit einer Schicht: Frame (Schicht 2), Paket (Schicht 3), Segment bei TCP bzw. Datagramm bei UDP (Schicht 4).
- **Ethernet-Frame:** Transportiert ein IP-Paket von Gerät zu Gerät im selben Netz. Enthält Ziel- und Quell-MAC-Adresse, den EtherType (welches Protokoll steckt drin), die Nutzdaten und eine Prüfsumme (FCS).
- **MAC-Adresse:** 48 Bit (6 Byte), z. B. 3C:52:82:1A:2B:4C. Die ersten 3 Byte kennzeichnen den Hersteller (OUI). Gilt nur bis zum nächsten Router – dort wird ein neuer Frame gebaut.
- **MTU (Maximum Transmission Unit):** Größtes Paket, das in einen Frame passt – bei Ethernet 1500 Byte. Größere Pakete müssen zerlegt (fragmentiert) werden; Jumbo Frames im Rechenzentrum erlauben bis 9000 Byte.
- **VLAN-Tag (802.1Q):** VLAN = Virtual LAN, also ein virtuelles LAN (Local Area Network – lokales Netz). 4 Byte im Frame mit der VLAN-ID (12 Bit, also 1–4094). Wird zwischen Switches auf Trunk-Ports eingefügt.
- **IPv4-Header:** Mindestens 20 Byte. Wichtig: Quell- und Ziel-IP, TTL, Protokoll-Nummer, Header-Prüfsumme.
- **TTL (Time to Live):** Jeder Router zieht 1 ab; bei 0 wird das Paket verworfen und der Absender per ICMP (Internet Control Message Protocol – Steuer- und Fehlermeldungen, z. B. für ping) informiert. So kreisen Pakete nicht endlos. `tracert` nutzt genau das.
- **IPv6-Header:** Fester Header mit 40 Byte, ohne Prüfsumme. Hop Limit statt TTL, Next Header statt Protokoll; Erweiterungen hängen als eigene Header dahinter.
- **TCP-Header:** Mindestens 20 Byte. Ports, Sequenz- und Bestätigungsnummer, Flags (SYN – Aufbau, ACK – Bestätigung, FIN – geordneter Abbau, RST – Abbruch) und Fenstergröße für die Flusskontrolle.
- **UDP-Header:** Nur 8 Byte: Quellport, Zielport, Länge, Prüfsumme – kein Verbindungsaufbau, keine Bestätigung.
- **MSS (Maximum Segment Size):** Nutzdaten pro TCP-Segment: MTU 1500 − 20 Byte IP − 20 Byte TCP = 1460 Byte.

### Abbildung: Kapselung und Ethernet-Frame
![Kapselung: Daten bekommen nacheinander TCP-Header, IP-Header und Ethernet-Header mit Prüfsumme](paket-kapselung.svg)
![Ethernet-Frame mit Präambel, Ziel-MAC, Quell-MAC, optionalem VLAN-Tag, EtherType, Nutzdaten und Prüfsumme](ethernet-frame.svg)

### Abbildung: IP-, TCP- und UDP-Header
![IPv4-Header mit Version, Länge, Identifikation, TTL, Protokoll, Prüfsumme, Quell- und Ziel-IP](ipv4-header.svg)
![TCP-Header mit Ports, Sequenznummer, Bestätigungsnummer, Flags und Fenstergröße](tcp-header.svg)
![UDP-Header mit Quellport, Zielport, Länge und Prüfsumme](udp-header.svg)

### Tabelle: Wer adressiert was?
| Schicht | Adresse | Gilt für | Ändert sich unterwegs? |
| --- | --- | --- | --- |
| 2 – Ethernet | MAC-Adresse | den nächsten Abschnitt (bis zum Router) | ja, an jedem Router |
| 3 – IP | IP-Adresse | den ganzen Weg vom Absender zum Ziel | nein (außer bei NAT – Network Address Translation) |
| 4 – TCP/UDP | Port | die Anwendung auf dem Zielrechner | nein (außer bei NAT/PAT) |

### Befehle
- `ping -f -l 1472 192.168.1.1` – MTU testen: 1472 Byte Daten + 8 Byte ICMP + 20 Byte IP = 1500 Byte, „-f“ verbietet Fragmentierung (Windows)
- `tracert 8.8.8.8` – Weg über die Router anzeigen; arbeitet mit steigender TTL (Windows; Linux: `traceroute`)
- `tcpdump -i eth0 -n port 53` – Pakete mitschneiden, hier DNS (Linux); grafisch geht das mit Wireshark

### Merksatz
Frame trägt Paket, Paket trägt Segment, Segment trägt Daten. MAC für den nächsten Schritt, IP für das Ziel, Port für die Anwendung.

### Prüfungsfrage
Wie viele Byte Nutzdaten passen bei einer TCP-Verbindung über Ethernet in einen Frame, und wie groß ist der Overhead?

1. MTU bei Ethernet: 1500 Byte für das IP-Paket.
2. Davon ab: 20 Byte IPv4-Header und 20 Byte TCP-Header → 1460 Byte Nutzdaten (MSS).
3. Der Frame selbst kommt dazu: 14 Byte Ethernet-Header + 4 Byte FCS → 1518 Byte Frame.
4. Overhead: 1518 − 1460 = 58 Byte, also knapp 4 % (ohne Präambel und Pause zwischen den Frames).

## Netzwerkverkehr analysieren (Mitschnitt) {#mitschnitt}

### Kernbegriffe
- **Mitschnitt (Capture):** Aufzeichnung aller Frames, die an einer Netzwerkkarte vorbeikommen, z. B. mit Wireshark oder tcpdump; Datei meist im Format .pcap bzw. .pcapng.
- **Wireshark:** Grafisches Werkzeug zum Mitschneiden und Auswerten; zeigt oben die Liste der Frames, in der Mitte die Schichten (Ethernet, IP, TCP/UDP, Anwendung) und unten die Rohdaten in Hex.
- **Anzeigefilter:** Blendet nur passende Frames ein, z. B. dns, ip.addr == 10.0.0.5, tcp.port == 443, icmp or icmpv6.
- **Hex-Dump:** Rohdaten Byte für Byte in Hexadezimal; im Wireshark-Mitschnitt beginnen die ersten 14 Byte mit dem Ethernet-Header, das IP-Paket startet danach bei Offset 0x0E.
- **Transaction ID:** Kennung einer DNS-Anfrage; die passende Antwort trägt dieselbe ID – so ordnet man Anfrage und Antwort zu.
- **Start-TTL:** Betriebssysteme starten mit festen Werten: Windows 128, Linux und macOS 64, viele Netzwerkgeräte 255. Bei IPv6 heißt das Feld Hop Limit.
- **Hops berechnen:** Start-TTL minus empfangene TTL = Anzahl der Router auf dem Weg; als Start nimmt man den nächsthöheren typischen Wert, z. B. 128 − 118 = 10 Router.
- **Mehrere DNS-Antworten:** Ein Name kann mehrere A- und AAAA-Einträge haben – für Lastverteilung, Ausfallsicherheit oder weil ein Content Delivery Network je nach Standort andere Server liefert.
- **IPv6 bevorzugt:** Haben Client und Ziel IPv4 und IPv6, nutzt der Client in der Regel IPv6 (Adressauswahl nach dem Internet-Standard RFC 6724, „Happy Eyeballs“ nach RFC 8305 probiert beide fast gleichzeitig).
- **Promiscuous Mode:** Die Netzwerkkarte nimmt auch Frames an, die nicht an sie adressiert sind; an einem Switch sieht man trotzdem nur den eigenen Verkehr, Broadcasts und gespiegelte Ports (Port Mirroring/SPAN).
- **Rechtlicher Rahmen:** Mitschnitte enthalten oft personenbezogene Daten und Inhalte von Kommunikation – nur mit Auftrag, zweckgebunden und so kurz wie nötig mitschneiden.

### Abbildung: Beispiel-Mitschnitt in Wireshark
![Wireshark-Fenster mit Anzeigefilter „dns or tcp.port == 443“ (1). Paketliste mit sechs Frames: DNS-Anfrage des Clients 192.168.1.20 an den DNS-Server 192.168.1.1 nach shop.example.com, DNS-Antwort mit 203.0.113.80 (2, markiert), TCP-Handshake SYN, SYN/ACK, ACK zum Port 443 und TLS Client Hello. Darunter die Details der markierten Antwort: IPv4 mit Time to Live 64 (3), UDP von Port 53, DNS mit Transaction ID 0x3f2a (4) und der Antwort shop.example.com Typ A 203.0.113.80 (5). Unten die Rohdaten in Hex (6): Byte 0x0E = 45 ist der Beginn des IP-Headers, 40 ist die TTL, 3f 2a die Transaction ID und cb 00 71 50 die Adresse 203.0.113.80.](wireshark-beispiel.svg)

### Tabelle: Das Beispiel gelesen
| Nr. | Was du siehst | Was es bedeutet |
| --- | --- | --- |
| 1 | Anzeigefilter dns or tcp.port == 443 | nur DNS und HTTPS-Verkehr werden angezeigt, der Rest ist ausgeblendet (nicht gelöscht) |
| 2 | Frame 2: Antwort von 192.168.1.1 | 192.168.1.1 ist der DNS-Server des Clients (Ziel der Anfrage in Frame 1), der Client hat die IPv4-Adresse 192.168.1.20 |
| 3 | Time to Live: 64 | Start-TTL 64 (z. B. Linux-Router) – kein Router dazwischen, der DNS-Server steht im selben Netz |
| 4 | Transaction ID 0x3f2a | dieselbe ID wie in der Anfrage – Frame 2 ist die Antwort auf Frame 1 |
| 5 | Answers: … A 203.0.113.80 | der Name shop.example.com gehört zu 203.0.113.80; genau dorthin baut der Client in Frame 3 bis 5 die TCP-Verbindung auf |
| 6 | Hex: 45 bei Offset 0x0E, 40, 3f 2a, cb 00 71 50 | dieselben Werte in den Rohdaten: IPv4-Header beginnt nach 14 Byte Ethernet, 0x40 = 64, 0xcb 0x00 0x71 0x50 = 203.0.113.80 |
| – | Frame 6: Client Hello (SNI=shop.example.com) | der TLS-Handshake beginnt; ab hier ist der Inhalt verschlüsselt, nur der Servername im SNI (Server Name Indication) ist noch lesbar |

### Tabelle: IPv4-Header im Hex-Dump lesen
| Byte (ab Beginn des IP-Pakets) | Feld | Beispiel | Bedeutung |
| --- | --- | --- | --- |
| 0 | Version und Headerlänge | 45 | 4 = IPv4, 5 × 4 Byte = 20 Byte Header |
| 2–3 | Gesamtlänge | 00 3c | 60 Byte |
| 8 | TTL | 40 | 64 – vermutlich Linux, noch kein Router passiert |
| 9 | Protokoll | 06 | 06 = TCP, 11 = UDP, 01 = ICMP (Internet Control Message Protocol), 3a = ICMPv6 (bei IPv6 im Feld Next Header) |
| 12–15 | Quell-IP | c0 a8 01 0a | 192.168.1.10 |
| 16–19 | Ziel-IP | cb 00 71 50 | 203.0.113.80 |
| 20–21 | Quellport (TCP/UDP) | c3 50 | 50000 – dynamischer Port des Clients |
| 22–23 | Zielport (TCP/UDP) | 01 bb | 443 – HTTPS |

### Tabelle: Typische Fragen an einen Mitschnitt
| Frage | Wo man es sieht |
| --- | --- |
| Welcher DNS-Server wird genutzt? | Ziel-IP der DNS-Anfrage (Port 53) |
| Welche IP-Adressen hat der Client? | Quell-IP seiner Anfragen – getrennt für IPv4 und IPv6 |
| Was hat der DNS-Server geantwortet? | Frame mit „Standard query response“ und gleicher Transaction ID; A = IPv4, AAAA = IPv6 |
| Wie viele Router liegen dazwischen? | TTL bzw. Hop Limit der Antwort vom Ziel, vom typischen Startwert abgezogen |
| Wurde die Verbindung aufgebaut? | TCP-Handshake SYN → SYN/ACK → ACK; RST oder keine Antwort deutet auf Firewall oder geschlossenen Port |
| Warum ging der Ping an diese Adresse? | Der Client nimmt meist die erste passende Adresse aus der DNS-Antwort und bevorzugt IPv6 |

### Befehle
- `tcpdump -i eth0 -n -w mitschnitt.pcap` – Verkehr in eine Datei schreiben, später in Wireshark öffnen (Linux)
- `tcpdump -n -X port 53` – DNS-Pakete mit Hex-Ausgabe anzeigen (Linux)
- `pktmon start --capture` – Mitschnitt mit Bordmitteln von Windows, anschließend `pktmon etl2pcap` zum Umwandeln
- `ping -n 1 www.beispiel.de` – ein einzelnes Echo; die Antwort zeigt TTL bzw. Zeit (Windows)

### Merksatz
Im Mitschnitt verrät jede Zeile etwas: Ziel-IP der DNS-Anfrage = DNS-Server, gleiche ID = passende Antwort, 128 bzw. 64 minus TTL = Router dazwischen.

### Prüfungsfrage
Ein mitgeschnittenes IP-Paket beginnt mit: 45 00 00 3c 1c 46 40 00 7e 06 b1 e6 0a 00 00 05 c6 33 64 0a … Bestimme Quell- und Ziel-IP, Protokoll und die Zahl der Router, die das Paket bereits passiert hat.

1. 45: IPv4 mit 20 Byte Header.
2. Byte 8 = 7e = 126 (TTL), Byte 9 = 06 → TCP.
3. Quell-IP (Byte 12–15): 0a 00 00 05 = 10.0.0.5.
4. Ziel-IP (Byte 16–19): c6 33 64 0a = 198.51.100.10.
5. Start-TTL vermutlich 128 (Windows): 128 − 126 = 2 Router passiert.

## IPv4/IPv6 {#ipv4-ipv6}

### Kernbegriffe
- **IPv4:** 32 Bit, 4 Oktette in Dezimalschreibweise, z. B. 192.168.1.10.
- **IPv6:** 128 Bit, 8 Blöcke à 16 Bit in Hexadezimal, z. B. 2001:db8::1.
- **CIDR:** Classless Inter-Domain Routing – Präfixlänge hinter dem Schrägstrich, z. B. /24 = 24 Bit Netzanteil.
- **APIPA:** 169.254.x.x – der Client hat keinen DHCP-Server erreicht.

### Abbildung: Aufbau einer IPv6-Adresse
![Die Adresse 2001:0db8:0a0b:0001:0000:0000:0000:0001 in acht Blöcken zu 16 Bit: die ersten 48 Bit sind das globale Routing-Präfix vom Provider, dann 16 Bit Subnetz-ID, dann 64 Bit Interface-ID. Gekürzt in zwei Schritten: führende Nullen weglassen (2001:db8:a0b:1:0:0:0:1), dann eine Folge von Null-Blöcken einmal durch :: ersetzen (2001:db8:a0b:1::1). Dazu die Bereiche Global Unicast 2000::/3, Link-Local fe80::/10, Unique Local fc00::/7, Multicast ff00::/8 und Loopback ::1.](ipv6-adresse.svg)

### Tabelle: Wichtige Adressbereiche
| Bereich | Bedeutung |
| --- | --- |
| 10.0.0.0/8 | privat |
| 172.16.0.0/12 | privat |
| 192.168.0.0/16 | privat |
| 127.0.0.0/8 | Loopback (IPv4) |
| 169.254.0.0/16 | APIPA (Automatic Private IP Addressing) / Link-Local (IPv4) |
| ::1 | Loopback (IPv6) |
| fe80::/10 | Link-Local (IPv6) |
| fc00::/7 | Unique Local, privat (IPv6) |
| 2000::/3 | Global Unicast (IPv6) |

### Befehle
- `ipconfig /all` – IP-Konfiguration inkl. MAC, DNS, DHCP (Windows)
- `ip addr show` – IP-Adressen der Schnittstellen (Linux)
- `ping -6 ::1` – IPv6-Stack lokal testen

### Merksatz
IPv6 kürzen: führende Nullen weg, die längste Nullfolge genau einmal durch :: ersetzen.

### Prüfungsfrage
Kürze 2001:0db8:0000:0000:0000:ff00:0042:8329.

1. Führende Nullen je Block entfernen: 2001:db8:0:0:0:ff00:42:8329
2. Längste Nullfolge (3 Blöcke) durch :: ersetzen
3. Ergebnis: 2001:db8::ff00:42:8329

## Subnetting {#subnetting}

### Kernbegriffe
- **Netzadresse:** Erste Adresse eines Subnetzes, alle Hostbits 0 – nicht für Hosts nutzbar.
- **Broadcast:** Letzte Adresse, alle Hostbits 1 – nicht für Hosts nutzbar.
- **Hosts pro Netz:** 2^(32 − Präfix) − 2
- **Anzahl Subnetze:** 2^(geliehene Bits)

### Tabelle: Präfix-Tabelle
| Präfix | Subnetzmaske | Adressen | Hosts |
| --- | --- | --- | --- |
| /24 | 255.255.255.0 | 256 | 254 |
| /25 | 255.255.255.128 | 128 | 126 |
| /26 | 255.255.255.192 | 64 | 62 |
| /27 | 255.255.255.224 | 32 | 30 |
| /28 | 255.255.255.240 | 16 | 14 |
| /29 | 255.255.255.248 | 8 | 6 |
| /30 | 255.255.255.252 | 4 | 2 |

### Merksatz
Blockgröße = 256 − letztes Masken-Oktett, das nicht 0 ist.

### Prüfungsfrage
Teile 192.168.10.0/24 in 4 gleich große Subnetze. Wie lauten Maske, Netze und Hostbereich des ersten Subnetzes?

1. 4 Subnetze → 2 Bits leihen (2² = 4) → /26
2. Maske 255.255.255.192, Blockgröße 256 − 192 = 64
3. Netze: .0, .64, .128, .192
4. 1. Subnetz: Netz 192.168.10.0, Hosts .1 bis .62, Broadcast .63
5. Je Subnetz 62 nutzbare Hosts

## VLAN {#vlan}

### Kernbegriffe
- **VLAN:** Teilt einen physischen Switch logisch in mehrere getrennte Broadcast-Domänen.
- **IEEE 802.1Q:** IEEE = Institute of Electrical and Electronics Engineers. Standard für VLAN-Tagging: 4-Byte-Tag im Ethernet-Frame, 12 Bit VLAN-ID (1–4094 nutzbar).
- **Inter-VLAN-Routing:** Verkehr zwischen VLANs (Virtual LANs) läuft über einen Router oder Layer-3-Switch.

### Tabelle: Port-Typen
| Typ | Tagging | Einsatz |
| --- | --- | --- |
| Access-Port | untagged, genau ein VLAN | Endgeräte wie PC oder Drucker |
| Trunk-Port | tagged (802.1Q), mehrere VLANs | Switch–Switch, Switch–Router |
| Native VLAN | untagged auf dem Trunk | Standard VLAN 1 – aus Sicherheitsgründen ändern |

### Befehle
- `show vlan brief` – VLANs und zugeordnete Ports (Cisco IOS)
- `switchport mode access` – Port als Access-Port festlegen (Cisco IOS)
- `switchport access vlan 10` – Port dem VLAN 10 zuordnen (Cisco IOS)

### Merksatz
VLANs trennen auf Layer 2 – miteinander reden sie nur über Layer 3.

## Switching {#switching}

### Kernbegriffe
- **MAC-Adresse:** 48 Bit, als 12 Hex-Zeichen geschrieben, z. B. 00:1A:2B:3C:4D:5E.
- **MAC-Tabelle:** Ordnet MAC-Adressen den Switch-Ports zu.
- **Flooding:** Unbekannte Ziele und Broadcasts gehen an alle Ports im VLAN (Virtual LAN) außer dem Eingangsport.
- **STP:** Spanning Tree Protocol – Spanning Tree verhindert Schleifen bei redundanten Verbindungen.

### Tabelle: Koppelelemente
| Gerät | Schicht | Arbeitet mit | Trennt |
| --- | --- | --- | --- |
| Hub | 1 | Bits | nichts |
| Switch | 2 | MAC-Adressen | Kollisionsdomänen |
| Router | 3 | IP-Adressen | Broadcast-Domänen |

### Befehle
- `arp -a` – ARP-Cache: welche IP gehört zu welcher MAC
- `show mac address-table` – MAC-Tabelle des Switches (Cisco IOS)

### Merksatz
Lernen über die Quell-MAC, weiterleiten über die Ziel-MAC.

### Prüfungsfrage
Ein Switch empfängt einen Frame an eine Ziel-MAC, die nicht in seiner Tabelle steht. Was passiert?

1. Er trägt die Quell-MAC mit dem Eingangsport in die MAC-Tabelle ein.
2. Die Ziel-MAC ist unbekannt → Flooding an alle Ports im VLAN außer dem Eingangsport.
3. Antwortet das Ziel, lernt der Switch auch dessen Port und leitet künftig gezielt weiter.

## Routing {#routing}

### Kernbegriffe
- **Routingtabelle:** Liste aus Zielnetz, Maske, Gateway und Schnittstelle.
- **Default-Gateway:** Router, an den ein Host alles schickt, was nicht im eigenen Netz liegt.
- **Default-Route:** 0.0.0.0/0 – passt auf jedes Ziel, wird zuletzt genommen.
- **Longest Prefix Match:** Bei mehreren passenden Einträgen gewinnt der mit dem längsten Präfix.

### Abbildung: Longest Prefix Match
![Ein Paket an 10.1.5.7 trifft auf eine Routingtabelle mit den Einträgen 10.0.0.0/8 über R1 (passt, 8 Bit), 10.1.0.0/16 über R2 (passt, 16 Bit), 192.168.5.0/24 über R4 (passt nicht) und der Default-Route 0.0.0.0/0 über R3 (passt immer, 0 Bit). Gewählt wird der längste passende Präfix, also R2. Ohne passenden Eintrag und ohne Default-Route wird das Paket verworfen.](routing-tabelle.svg)

### Tabelle: Routingprotokolle
| Protokoll | Typ | Einsatz |
| --- | --- | --- |
| RIP (Routing Information Protocol) | Distanzvektor (Hops, max. 15) | kleine Netze |
| OSPF (Open Shortest Path First) | Link-State | Unternehmensnetze |
| BGP (Border Gateway Protocol) | Pfadvektor | zwischen Providern im Internet |

### Befehle
- `route print` – Routingtabelle (Windows)
- `ip route` – Routingtabelle (Linux)
- `tracert 8.8.8.8` – Weg eines Pakets verfolgen (Linux: traceroute)

### Merksatz
Das Default-Gateway liegt immer im eigenen Subnetz.

### Prüfungsfrage
Routingtabelle: 10.0.0.0/8 → R1, 10.1.0.0/16 → R2, 0.0.0.0/0 → R3. Wohin geht ein Paket an 10.1.5.7?

1. Passend sind alle drei Einträge.
2. Längster Präfix ist /16.
3. Antwort: an R2.

## Software Defined Networking (SDN) {#sdn}

### Kernbegriffe
- **SDN:** Die Steuerung des Netzes wird von der Hardware getrennt und zentral in Software zusammengefasst. Switches und Router leiten nur noch weiter; welche Wege und Regeln gelten, legt ein Controller fest.
- **Datenebene (Data Plane):** Leitet Pakete anhand von Tabellen weiter – schnell, in Hardware. Bleibt in den Switches.
- **Steuerungsebene (Control Plane):** Entscheidet, wie weitergeleitet wird: Routing, Spanning Tree, Zugriffsregeln. Bei SDN zentral im Controller.
- **Managementebene (Management Plane):** Konfiguration, Überwachung, Auswertung – bei SDN meist über die Oberfläche oder API (Application Programming Interface – Programmierschnittstelle) des Controllers.
- **SDN-Controller:** Zentrale Software, die das ganze Netz kennt und allen Geräten ihre Regeln gibt. Fällt er aus, leiten die Geräte mit den letzten Regeln weiter, ändern lässt sich aber nichts mehr – daher redundant betreiben.
- **Northbound-API:** Schnittstelle vom Controller nach oben zu Anwendungen und Automatisierung, meist REST (Representational State Transfer – Schnittstelle über HTTP) mit JSON (JavaScript Object Notation).
- **Southbound-API:** Schnittstelle vom Controller zu den Netzgeräten, z. B. OpenFlow oder NETCONF (Network Configuration Protocol).
- **Overlay-Netz:** Logische Netze, die über das physische Netz gelegt werden, z. B. mit VXLAN (Virtual Extensible LAN). So lassen sich Netze für VMs (virtuelle Maschinen) per Software anlegen, ohne Kabel zu ändern.
- **SD-WAN:** SDN für die Verbindung von Standorten. Nutzt mehrere Leitungen (Glasfaser, DSL – Digital Subscriber Line, 5G) gleichzeitig, wählt pro Anwendung den besten Weg, verschlüsselt und wird zentral verwaltet.
- **NFV (Network Functions Virtualization):** Netzfunktionen wie Firewall, Router oder Load Balancer laufen als Software auf Standard-Servern statt als eigene Hardware.

### Abbildung: Klassisches Netz und SDN
![Links: jedes Gerät hat eigene Steuerung und Weiterleitung. Rechts: ein zentraler SDN-Controller steuert Switches, die nur noch weiterleiten](sdn-ebenen.svg)

### Tabelle: Klassisch und SDN im Vergleich
| Merkmal | Klassisches Netz | SDN |
| --- | --- | --- |
| Steuerung | in jedem Gerät einzeln | zentral im Controller |
| Konfiguration | Gerät für Gerät, oft per Kommandozeile | einmal zentral, per Oberfläche oder API |
| Änderungen | langsam, fehleranfällig | schnell, automatisierbar, wiederholbar |
| Überblick | Summe einzelner Geräte | Gesamtbild des Netzes im Controller |
| Risiko | Fehler betreffen meist ein Gerät | Controller ist kritisch und muss geschützt und redundant sein |

### Merksatz
SDN trennt Denken und Handeln: Der Controller entscheidet, die Switches leiten nur weiter. SD-WAN macht dasselbe für die Verbindung zwischen Standorten.

### Prüfungsfrage
Ein Unternehmen mit 20 Filialen verbindet alle Standorte bisher über teure MPLS-Leitungen. Welche Vorteile hätte SD-WAN?

1. Mehrere günstige Leitungen (Glasfaser, DSL, 5G) pro Filiale gleichzeitig nutzbar – fällt eine aus, übernimmt die andere.
2. Pro Anwendung wird der beste Weg gewählt, z. B. Videokonferenzen über die Leitung mit der geringsten Verzögerung.
3. Zentrale Verwaltung: Regeln einmal festlegen, neue Filialen per Zero-Touch-Provisioning anbinden (Gerät anschließen, Konfiguration kommt automatisch).
4. Verbindungen werden verschlüsselt, Kosten sinken gegenüber reinem MPLS (Multiprotocol Label Switching – Netz eines Providers für Standortverbindungen).

## WLAN {#wlan}

### Kernbegriffe
- **SSID:** Service Set Identifier – Name des Funknetzes.
- **Access Point:** Verbindet WLAN-Clients mit dem kabelgebundenen Netz.
- **Infrastruktur-Modus:** Alle Clients verbinden sich mit einem Access Point und kommunizieren über ihn – auch untereinander; der AP verbindet das WLAN mit dem LAN. Standard in Unternehmen.
- **Ad-hoc-Modus (IBSS):** Geräte funken direkt miteinander, ohne Access Point; nur für kurze Verbindungen zwischen wenigen Geräten.
- **Mesh:** Mehrere Access Points verbinden sich per Funk untereinander und bilden ein gemeinsames Netz; nur einer braucht ein Kabel.
- **Brutto und netto:** Die Angabe im Standard (z. B. 867 Mbit/s) ist die maximale Bruttodatenrate auf der Funkstrecke; netto bleibt wegen Protokoll-Overhead, Bestätigungen und Wartezeiten oft nur die Hälfte oder weniger.
- **Geteiltes Medium:** Alle Clients einer Funkzelle teilen sich die Datenrate, und immer nur einer sendet gleichzeitig (Halbduplex) – je mehr Clients, desto weniger für jeden.
- **Spatial Streams (MIMO):** Mehrere Antennen senden parallel; 867 Mbit/s bei 802.11ac gelten nur für 2 Streams und 80 MHz Kanalbreite – ein Client mit einer Antenne schafft höchstens die Hälfte.
- **Kanäle:** Bei 2,4 GHz überlappen sich die Kanäle; nur 1, 6 und 11 stören sich nicht. 5 und 6 GHz bieten deutlich mehr freie Kanäle.
- **WPA2-Personal (PSK):** Alle Geräte melden sich mit demselben vorinstallierten Schlüssel an; wer ihn kennt, kommt ins Netz, und einzelne Geräte lassen sich nicht gezielt aussperren.
- **WPA3:** Wi-Fi Protected Access 3 – Aktueller Sicherheitsstandard, nutzt SAE (Simultaneous Authentication of Equals) statt des älteren PSK-Handshakes; schützt besser gegen das Erraten des Schlüssels.
- **WPA2/3-Enterprise:** WPA2 = Wi-Fi Protected Access 2. Anmeldung pro Benutzer über 802.1X und einen RADIUS-Server.
- **Vorteil von Enterprise:** Jeder Benutzer oder jedes Gerät hat eigene Zugangsdaten oder ein Zertifikat; Konten lassen sich einzeln sperren, Anmeldungen sind protokolliert, und der RADIUS-Server kann Benutzer automatisch dem passenden VLAN (Virtual LAN) zuweisen.

### Tabelle: Aktuelle Standards im Überblick
| Standard | Name | Frequenz | max. brutto |
| --- | --- | --- | --- |
| 802.11n | Wi-Fi 4 | 2,4 / 5 GHz | 600 Mbit/s |
| 802.11ac | Wi-Fi 5 | 5 GHz | ca. 6,9 Gbit/s |
| 802.11ax | Wi-Fi 6 / 6E | 2,4 / 5 / 6 GHz | ca. 9,6 Gbit/s |
| 802.11be | Wi-Fi 7 | 2,4 / 5 / 6 GHz | ca. 46 Gbit/s |

Alle Standards, Ergänzungen und Sicherheitsverfahren stehen im Unterthema „WLAN-Standards und Protokolle“, Planung und Betrieb unter „WLAN im Unternehmen“.

### Tabelle: Warum im WLAN weniger ankommt
| Ursache | Erklärung |
| --- | --- |
| Brutto statt netto | Overhead, Bestätigungen und Wartezeiten kosten oft die Hälfte |
| Geteiltes Medium | alle Clients der Funkzelle teilen sich die Datenrate, nur einer sendet gleichzeitig |
| Abstand und Hindernisse | Wände, Decken und Entfernung schwächen das Signal; der AP schaltet auf eine langsamere Modulation |
| Störungen | Nachbar-WLANs auf demselben Kanal, Bluetooth, Mikrowelle (2,4 GHz) |
| Client kann weniger | weniger Antennen (Streams), kleinere Kanalbreite oder älterer Standard |
| Engpass woanders | Uplink des Access Points, Internetanschluss oder der Server selbst sind langsamer |

### Befehle
- `netsh wlan show interfaces` – aktuelle WLAN-Verbindung mit Kanal, Signal und Empfangs-/Senderate (Windows)
- `netsh wlan show networks mode=bssid` – Netze in der Umgebung mit Kanälen, um Überlappungen zu finden (Windows)
- `nmcli dev wifi` – sichtbare Netze (Linux)

### Merksatz
2,4 GHz reicht weiter, 5 und 6 GHz sind schneller. Brutto ist nicht netto – real kommt deutlich weniger an. Personal heißt ein Schlüssel für alle, Enterprise heißt ein Zugang pro Person.

### Prüfungsfrage
Ein Access Point nach 802.11ac wirbt mit 867 Mbit/s, ein Notebook im Besprechungsraum erreicht nur 120 Mbit/s. Nenne mögliche Gründe.

1. 867 Mbit/s sind die Brutto-Datenrate; netto bleibt durch Overhead und Bestätigungen deutlich weniger.
2. Der Wert gilt nur für 2 Streams und 80 MHz – das Notebook hat vielleicht nur eine Antenne oder nutzt eine kleinere Kanalbreite.
3. Abstand, Wände oder Störungen durch Nachbarnetze senken die Signalqualität und damit die Modulation.
4. Andere Clients in derselben Funkzelle teilen sich die Datenrate.
5. Der Engpass kann auch hinter dem Access Point liegen, z. B. am Uplink oder am Internetanschluss.

## WLAN-Standards und Protokolle {#wlan-standards}

### Kernbegriffe
- **IEEE 802.11:** IEEE = Institute of Electrical and Electronics Engineers. Normenfamilie für WLAN; die Buchstaben hinter 802.11 bezeichnen Erweiterungen – für Datenraten (a, b, g, n, ac, ax, be) und für Zusatzfunktionen (e, i, k, r, v, w …).
- **Wi-Fi Alliance:** Herstellerverband, der Geräte auf Kompatibilität prüft und die einfachen Namen vergibt: Wi-Fi 4 (n), Wi-Fi 5 (ac), Wi-Fi 6 (ax), Wi-Fi 6E (ax im 6-GHz-Band), Wi-Fi 7 (be).
- **OFDM:** Verfahren, das einen Kanal in viele schmale Unterträger aufteilt; seit 802.11a/g die Grundlage aller schnellen WLAN-Standards.
- **OFDMA:** Ab Wi-Fi 6 kann der Access Point die Unterträger eines Kanals gleichzeitig auf mehrere Clients aufteilen – weniger Wartezeit bei vielen Geräten mit kleinen Datenmengen.
- **MIMO und MU-MIMO:** Mehrere Antennen senden parallel Datenströme (Spatial Streams); bei Multi-User-MIMO bedient der Access Point mehrere Clients gleichzeitig.
- **QAM (Modulation):** QAM = Quadraturamplitudenmodulation. Wie viele Bits ein Funksymbol trägt: 64-QAM (Wi-Fi 4), 256-QAM (Wi-Fi 5), 1024-QAM (Wi-Fi 6), 4096-QAM (Wi-Fi 7). Hohe Stufen funktionieren nur bei sehr gutem Signal, also nahe am Access Point.
- **Kanalbreite:** 20, 40, 80, 160 und bei Wi-Fi 7 bis 320 MHz; breiter heißt schneller, aber es gibt weniger überlappungsfreie Kanäle und mehr Störungen.
- **DFS und TPC (802.11h):** Im 5-GHz-Band müssen Access Points Radar (Wetter-, Militär-, Flugradar) erkennen und den Kanal räumen (Dynamic Frequency Selection) sowie die Sendeleistung anpassen (Transmit Power Control).
- **Target Wake Time (TWT):** Ab Wi-Fi 6 vereinbaren Clients feste Sendezeiten und schlafen dazwischen – spart Akku bei IoT-Geräten.
- **Multi-Link Operation (MLO):** Ab Wi-Fi 7 nutzt ein Gerät mehrere Bänder gleichzeitig (z. B. 5 und 6 GHz) – höhere Datenrate und weniger Aussetzer.
- **Beacon:** Kurze Rundsendung des Access Points, etwa zehnmal pro Sekunde je SSID (Service Set Identifier) und Funkmodul, mit Netzname, Fähigkeiten und Sicherheitsverfahren.
- **WEP:** Erstes Verschlüsselungsverfahren (1999) mit RC4 (Rivest Cipher 4); in Minuten zu knacken und nicht mehr zulässig.
- **WPA und WPA2:** WPA (2003, TKIP – Temporal Key Integrity Protocol) war eine Übergangslösung; WPA2 (2004, 802.11i) nutzt AES-CCMP und war lange Standard. Die Lücke KRACK (Key Reinstallation Attack, 2017) betraf den Handshake und wurde per Update geschlossen.
- **WPA3:** Seit 2018; Personal nutzt SAE (Simultaneous Authentication of Equals) statt PSK-Handshake (schützt vor Offline-Raten des Schlüssels und sorgt für Forward Secrecy), Enterprise bietet optional einen 192-Bit-Modus; geschützte Management-Frames (PMF, 802.11w) sind Pflicht.
- **OWE (Opportunistic Wireless Encryption, vermarktet als Wi-Fi Enhanced Open):** Verschlüsselt auch offene Netze ohne Passwort, z. B. Gäste-WLANs – jeder Client bekommt einen eigenen Schlüssel.
- **WPS:** Wi-Fi Protected Setup – Verbinden per Knopfdruck oder PIN; das PIN-Verfahren ist leicht zu knacken, im Unternehmen abschalten.
- **802.1X und EAP:** Rahmen für die Anmeldung über einen RADIUS-Server; EAP-TLS (EAP = Extensible Authentication Protocol) nutzt Zertifikate auf beiden Seiten (sicherste Variante), PEAP (Protected EAP) und EAP-TTLS nutzen Benutzername und Passwort in einem TLS-Tunnel.

### Abbildung: Kanäle in den drei Frequenzbändern
![Oben das 2,4-GHz-Band mit 13 Kanälen im Abstand von 5 MHz, die sich überlappen; nur die Kanäle 1, 6 und 11 sind überlappungsfrei hervorgehoben. Darunter das 5-GHz-Band in der EU: Kanäle 36 bis 48 nur in Gebäuden, 52 bis 64 mit DFS nur in Gebäuden, 5350 bis 5470 MHz gesperrt, 100 bis 140 mit DFS innen und außen. Unten das 6-GHz-Band von 5945 bis 6425 MHz mit 24 Kanälen zu 20 MHz, mit voller Leistung nur in Gebäuden, ohne Radar-DFS.](wlan-kanaele.svg)

### Tabelle: Alle Übertragungsstandards
| Standard | Name | Jahr | Frequenz | max. brutto | Technik |
| --- | --- | --- | --- | --- | --- |
| 802.11 | – | 1997 | 2,4 GHz | 2 Mbit/s | erster Standard |
| 802.11b | – | 1999 | 2,4 GHz | 11 Mbit/s | DSSS (Direct Sequence Spread Spectrum); bremst gemischte Netze bis heute aus |
| 802.11a | – | 1999 | 5 GHz | 54 Mbit/s | OFDM (Orthogonal Frequency-Division Multiplexing) |
| 802.11g | – | 2003 | 2,4 GHz | 54 Mbit/s | OFDM, abwärtskompatibel zu b |
| 802.11n | Wi-Fi 4 | 2009 | 2,4 / 5 GHz | 600 Mbit/s | MIMO (Multiple Input, Multiple Output) bis 4 Streams, 40 MHz, 64-QAM |
| 802.11ac | Wi-Fi 5 | 2013 | 5 GHz | ca. 6,9 Gbit/s | bis 8 Streams, 160 MHz, 256-QAM, MU-MIMO im Download |
| 802.11ax | Wi-Fi 6 | 2019 | 2,4 / 5 GHz | ca. 9,6 Gbit/s | OFDMA (Orthogonal Frequency-Division Multiple Access), 1024-QAM, MU-MIMO in beide Richtungen, TWT |
| 802.11ax | Wi-Fi 6E | 2021 | zusätzlich 6 GHz | ca. 9,6 Gbit/s | wie Wi-Fi 6, aber im freien 6-GHz-Band |
| 802.11be | Wi-Fi 7 | 2024 | 2,4 / 5 / 6 GHz | ca. 46 Gbit/s | 320 MHz, 4096-QAM, Multi-Link Operation |
| 802.11bn | Wi-Fi 8 | in Entwicklung | 2,4 / 5 / 6 GHz | – | Ziel: Zuverlässigkeit und geringe Latenz statt höherer Spitzenrate |

### Tabelle: Wichtige Ergänzungsstandards
| Standard | Wofür |
| --- | --- |
| 802.11e (WMM – Wi-Fi Multimedia) | QoS im WLAN: Sprache und Video bekommen Vorrang |
| 802.11h | DFS und TPC im 5-GHz-Band (Radarschutz, Sendeleistung) |
| 802.11i | Sicherheit, Grundlage von WPA2 (AES-CCMP, 802.1X) |
| 802.11k | Access Point nennt dem Client benachbarte APs – schnelleres Finden beim Roaming |
| 802.11r | Fast Roaming: Schlüssel werden vorab ausgehandelt, Wechsel in Millisekunden (wichtig für WLAN-Telefonie) |
| 802.11v | Access Point kann Clients zum Wechsel auf einen besseren AP auffordern |
| 802.11w | geschützte Management-Frames (PMF) gegen gefälschte Abmeldungen; Pflicht bei WPA3 (Wi-Fi Protected Access 3) |
| 802.11s | Mesh-Netze zwischen Access Points |
| 802.11u | Hotspot 2.0 / Passpoint: automatische, sichere Anmeldung an öffentlichen Hotspots |
| 802.11ad / ay | WiGig im 60-GHz-Band: sehr schnell, aber nur im selben Raum |
| 802.11ah | Wi-Fi HaLow unter 1 GHz: große Reichweite, geringe Datenrate, für IoT-Sensoren |

### Tabelle: Sicherheitsverfahren im Vergleich
| Verfahren | Verschlüsselung | Anmeldung | Bewertung |
| --- | --- | --- | --- |
| offen | keine | keine | nur mit Gastportal und VPN (Virtual Private Network); besser OWE |
| WEP (Wired Equivalent Privacy) | RC4 | gemeinsamer Schlüssel | gebrochen – nicht verwenden |
| WPA (TKIP) | RC4 mit TKIP | PSK oder 802.1X | veraltet – nicht verwenden |
| WPA2-Personal | AES-CCMP | gemeinsamer Schlüssel (PSK) | noch üblich, Schlüssel lang wählen |
| WPA2-Enterprise | AES-CCMP | 802.1X mit RADIUS (Remote Authentication Dial-In User Service) | gut, Standard in Unternehmen |
| WPA3-Personal | AES (Advanced Encryption Standard), SAE-Handshake | gemeinsames Passwort | empfohlen für kleine Netze |
| WPA3-Enterprise | AES (optional 192 Bit) | 802.1X, PMF Pflicht | empfohlen für Unternehmen |
| OWE (Enhanced Open) | AES, eigener Schlüssel je Client | keine | für Gäste-WLANs ohne Passwort |

### Tabelle: Erlaubte Sendeleistung in der EU (EIRP – Equivalent Isotropically Radiated Power)
| Band | Bereich | max. Leistung | Besonderheit |
| --- | --- | --- | --- |
| 2,4 GHz | 2400–2483,5 MHz, Kanäle 1–13 | 100 mW | innen und außen |
| 5 GHz | 5150–5350 MHz, Kanäle 36–64 | 200 mW | nur in Gebäuden; ab Kanal 52 DFS |
| 5 GHz | 5470–5725 MHz, Kanäle 100–140 | 1 W | innen und außen, DFS; Kanäle 120–128 mit 10 Minuten Radarprüfung (Wetterradar) |
| 6 GHz | 5945–6425 MHz | 200 mW / 25 mW | 200 mW nur in Gebäuden (LPI – Low Power Indoor); mit 25 mW (VLP – Very Low Power) auch im Freien |

### Merksatz
Wi-Fi 4 n, Wi-Fi 5 ac, Wi-Fi 6 ax, Wi-Fi 7 be. WEP und WPA sind tot, WPA2 lebt noch, WPA3 ist das Ziel. Im 2,4-GHz-Band gibt es nur drei überlappungsfreie Kanäle: 1, 6, 11.

### Prüfungsfrage
Ein Unternehmen tauscht seine Access Points nach 802.11n gegen Wi-Fi-6E-Geräte. Nenne drei technische Neuerungen und erläutere, welche Clients davon profitieren.

1. OFDMA: Der Access Point teilt einen Kanal auf mehrere Clients gleichzeitig auf – vorteilhaft bei vielen Geräten mit kleinen Datenmengen, z. B. in Besprechungsräumen.
2. 1024-QAM und breitere Kanäle (bis 160 MHz): höhere Datenraten nahe am Access Point.
3. 6-GHz-Band: viele freie Kanäle ohne Altgeräte und ohne Radar-DFS – aber nur Clients mit Wi-Fi 6E oder 7 können es nutzen.
4. Zusätzlich WPA3 mit PMF und TWT zum Stromsparen bei IoT-Geräten.
5. Ältere Clients (Wi-Fi 4/5) funktionieren weiter, profitieren aber kaum – der volle Nutzen entsteht erst mit neuen Endgeräten.

## WLAN im Unternehmen planen und betreiben {#wlan-betrieb}

### Kernbegriffe
- **Ausleuchtung (Site Survey):** Messung oder Simulation der Funkabdeckung vor und nach der Installation; zeigt Signalstärke, Störungen und Funklöcher je Raum.
- **Funkzellen planen:** Lieber mehr Access Points mit geringerer Sendeleistung als wenige mit voller Leistung; für nahtloses Roaming sollen sich benachbarte Zellen um etwa 15–20 % überlappen.
- **Signalstärke (RSSI, dBm):** RSSI steht für Received Signal Strength Indicator. Die Stärke wird in dBm negativ angegeben – je näher an 0, desto besser. Richtwerte: −67 dBm oder besser für Telefonie und Video, −70 dBm für Daten, unter −80 dBm kaum noch nutzbar.
- **Signal-Rausch-Abstand (SNR):** Abstand zwischen Signal und Grundrauschen in dB; für Sprache mindestens 25 dB. Ein starkes Signal nützt nichts, wenn auch das Rauschen hoch ist.
- **Gleichkanalstörung (Co-Channel Interference):** Hören sich zwei Access Points auf demselben Kanal, teilen sie sich die Sendezeit wie eine einzige Zelle – deshalb Kanäle so verteilen, dass Nachbarn verschiedene nutzen.
- **Nachbarkanalstörung:** Überlappende, aber verschiedene Kanäle (z. B. 1 und 3) stören sich als Rauschen, ohne sich abzustimmen – noch schlechter als derselbe Kanal.
- **Sendeleistung anpassen:** Volle Leistung am Access Point vergrößert die Zelle, aber Clients mit schwachem Sender kommen nicht zurück (asymmetrische Verbindung) und klammern sich an weit entfernte APs („Sticky Clients“).
- **SSID-Overhead:** Jede SSID (Service Set Identifier) sendet pro Funkmodul etwa zehn Beacons pro Sekunde, und zwar mit der niedrigsten erlaubten Datenrate. Viele SSIDs verbrauchen so einen spürbaren Teil der Sendezeit, bevor ein einziges Nutzdatenpaket fließt – Richtwert: höchstens drei bis vier SSIDs pro Access Point.
- **Niedrige Datenraten abschalten:** Die alten 802.11b-Raten (1, 2, 5,5 und 11 Mbit/s) deaktivieren und als Mindestrate z. B. 12 oder 24 Mbit/s setzen – Beacons werden kürzer, und weit entfernte Clients wechseln früher zum besseren Access Point.
- **Band Steering:** Der Access Point schiebt Clients, die 5 oder 6 GHz können, aus dem vollen 2,4-GHz-Band.
- **Airtime Fairness:** Langsame Clients bekommen nicht mehr Sendezeit als schnelle; sonst bremst ein altes Gerät die ganze Zelle.
- **Controller oder Cloud-Management:** Zentrale Verwaltung aller Access Points mit automatischer Kanal- und Leistungsplanung (RRM), Roaming und Überwachung.
- **Gastnetz:** Eigene SSID in einem eigenen VLAN (Virtual LAN), nur Zugang zum Internet, Client-Isolation (Gäste sehen sich nicht gegenseitig), Bandbreitenbegrenzung und ggf. Gastportal mit Nutzungsbedingungen.
- **Rogue Access Point:** Nicht genehmigter Access Point im Firmennetz, etwa ein mitgebrachter Router; ein WIPS (Wireless Intrusion Prevention System) erkennt ihn und meldet ihn.
- **Stromversorgung und Uplink:** Moderne Access Points brauchen PoE+ (802.3at) oder PoE++ (802.3bt) und ab Wi-Fi 6 oft einen 2,5-GbE-Uplink (Multi-Gigabit); PoE-Budget des Switches einplanen.

### Abbildung: Zellplan mit den Kanälen 1, 6 und 11
![Wabenförmig angeordnete Funkzellen von Access Points. Jede Zelle nutzt im 2,4-GHz-Band einen der überlappungsfreien Kanäle 1, 6 oder 11, so dass keine zwei benachbarten Zellen denselben Kanal haben. Die Zellen überlappen etwa 15 bis 20 Prozent, damit Roaming ohne Abbruch funktioniert.](wlan-zellplan.svg)

### Tabelle: Probleme im 2,4-GHz-Band
| Problem | Warum | Was hilft |
| --- | --- | --- |
| nur drei freie Kanäle | 13 Kanäle überlappen; nur 1, 6 und 11 sind getrennt | Kanäle konsequent 1/6/11 planen, nur 20 MHz Breite |
| große Reichweite | niedrigere Frequenz dringt besser durch Wände – benachbarte APs hören sich weit und stören sich gegenseitig | Sendeleistung senken, 2,4 GHz nur auf einem Teil der Access Points einschalten |
| viele andere Funktechniken | Bluetooth, Zigbee und Thread (Smart Home), Funkkameras und Videosender, Babyphones, Mikrowellen senden im selben Band | Störquellen mit einem Spektrumanalyzer finden, Clients nach 5/6 GHz verlagern |
| alte Geräte | 802.11b/g-Clients senden langsam und belegen viel Sendezeit | niedrige Raten abschalten, 2,4 GHz für IoT und Altgeräte reservieren |
| Nachbarnetze | jede Wohnung und jedes Büro funkt im 2,4-GHz-Band | lieber 5 und 6 GHz nutzen |

### Tabelle: Beispielrechnung SSID-Overhead
| Annahme | Wert |
| --- | --- |
| Beacon | ca. 300 Byte, etwa 10-mal pro Sekunde je SSID |
| gesendet mit 1 Mbit/s (alte Mindestrate) | ca. 2,6 ms je Beacon → 26 ms pro Sekunde = 2,6 % Sendezeit je SSID |
| 5 SSIDs, 4 Access Points hören sich auf demselben Kanal | 5 × 4 × 2,6 % ≈ **52 % der Sendezeit nur für Beacons** |
| gleiche Lage mit Mindestrate 6 Mbit/s | ca. 0,4 ms je Beacon → 5 × 4 × 0,4 % ≈ **8 %** |
| zusätzlich nur 2 SSIDs | 2 × 4 × 0,4 % ≈ **3 %** |

Die Werte sind gerundete Richtwerte; sie zeigen, warum wenige SSIDs und höhere Mindestraten so viel bringen. Statt für jede Abteilung eine eigene SSID anzulegen, lieber eine SSID mit 802.1X nutzen und Benutzer per RADIUS (Remote Authentication Dial-In User Service – zentrale Prüfung von Anmeldungen) dynamisch dem passenden VLAN zuweisen.

### Tabelle: Dämpfung durch Baustoffe (Richtwerte)
| Hindernis | 2,4 GHz | 5 GHz |
| --- | --- | --- |
| Gipskartonwand, Holztür | ca. 3 dB | ca. 4 dB |
| normales Fenster | ca. 2–3 dB | ca. 4–6 dB |
| Ziegelwand | ca. 6–8 dB | ca. 10–15 dB |
| Betonwand, Decke | ca. 10–15 dB | ca. 15–25 dB |
| Wärmeschutzglas (metallbeschichtet), Metallschrank, Aufzug | über 20 dB | über 25 dB |
| Mensch | ca. 3 dB | ca. 4–5 dB |

Merke: 3 dB weniger heißt halbe Leistung, 10 dB weniger nur noch ein Zehntel.

### Tabelle: Checkliste für ein produktives WLAN
| Bereich | Worauf achten |
| --- | --- |
| Planung | Anforderungen klären (Geräte pro Raum, Telefonie, Lager mit Regalen), Ausleuchtung messen oder simulieren, Montageorte an der Decke, nicht hinter Metall |
| Funk | Kanalplan, 20/40 MHz statt maximaler Breite in dichter Umgebung, Sendeleistung angepasst, DFS-Kanäle (DFS = Dynamic Frequency Selection) bei Radarstörungen beobachten |
| SSIDs | höchstens drei bis vier, z. B. Firma (802.1X), Gäste, IoT; niedrige Datenraten abschalten |
| Sicherheit | WPA3- oder WPA2-Enterprise (WPA2 = Wi-Fi Protected Access 2) mit 802.1X, PMF, WPS (Wi-Fi Protected Setup) aus, Gäste und IoT in eigene VLANs, Management-Zugang nur aus dem Admin-Netz |
| Roaming | 802.11k/v/r aktivieren, wenn alle Clients es unterstützen; Überlappung der Zellen prüfen |
| Infrastruktur | PoE-Budget, Multi-Gigabit-Uplinks, Access Points zentral verwalten, Firmware aktuell |
| Betrieb | Kanalauslastung, Wiederholungen und Fehlanmeldungen überwachen; Rogue APs erkennen; nach Umbauten neu messen |

### Befehle
- `netsh wlan show interfaces` – Signal in Prozent, Kanal, Band, Empfangs- und Senderate (Windows)
- `netsh wlan show networks mode=bssid` – alle Access Points in Reichweite mit Kanal und Signal, um Überlappungen zu finden (Windows)
- `netsh wlan show wlanreport` – HTML-Bericht über Verbindungsabbrüche der letzten Tage (Windows)
- `iw dev wlan0 link` – verbundener Access Point, Signal in dBm und Datenrate (Linux)
- `iw dev wlan0 scan | grep -E "SSID|signal|primary channel"` – Umgebung scannen (Linux, root)

### Merksatz
Viele kleine Zellen statt weniger großer, wenige SSIDs statt vieler, 5 und 6 GHz statt 2,4 GHz – und das WLAN regelmäßig nachmessen.

### Prüfungsfrage
In einem Bürogebäude bricht das WLAN in Besprechungsräumen ein, obwohl die Signalstärke gut ist. Es sind acht SSIDs auf jedem Access Point eingerichtet, alle APs funken mit voller Leistung, viele auf 2,4 GHz. Nenne Ursachen und Maßnahmen.

1. Zu viele SSIDs: Jede sendet rund zehn Beacons pro Sekunde mit niedriger Datenrate – ein großer Teil der Sendezeit geht verloren. Auf drei bis vier SSIDs reduzieren und Benutzer per 802.1X dynamisch VLANs zuweisen.
2. Niedrige Datenraten abschalten (Mindestrate z. B. 12 Mbit/s), damit Beacons kürzer werden.
3. Volle Sendeleistung: Access Points hören sich gegenseitig und teilen sich die Kanäle (Gleichkanalstörung); Leistung senken und Kanalplan erstellen.
4. 2,4 GHz hat nur drei freie Kanäle und viele Störquellen (Bluetooth, Funkkameras, Nachbarnetze); Clients per Band Steering auf 5 bzw. 6 GHz verlagern.
5. Danach erneut ausleuchten und die Kanalauslastung im Controller überwachen.

## VoIP, Videokonferenz und QoS {#voip-qos}

### Kernbegriffe
- **VoIP (Voice over IP):** Telefonie über IP-Netze; die Sprache wird digitalisiert, komprimiert und in kleinen Paketen übertragen, meist alle 20 ms ein Paket.
- **SIP:** Session Initiation Protocol – baut Gespräche auf und ab (Klingeln, Annehmen, Auflegen); Port 5060 (UDP/TCP), verschlüsselt 5061 (TLS).
- **RTP und SRTP:** Real-time Transport Protocol überträgt die eigentlichen Sprachdaten über UDP; SRTP ist die verschlüsselte Variante.
- **Codec:** Verfahren, das Sprache oder Video kodiert und komprimiert; bestimmt Bitrate und Qualität, z. B. G.711, G.722, Opus.
- **Protokoll-Overhead:** Zusätzliche Daten für RTP-, UDP-, IP- und Ethernet-Header; bei VoIP oft 20–40 % zusätzlich zur Bitrate des Codecs, in Prüfungen meist als Prozentwert vorgegeben.
- **Latenz:** Verzögerung zwischen Senden und Empfangen, in Millisekunden; entsteht durch Entfernung, Anzahl der Router, Warteschlangen bei hoher Auslastung, Funkstrecken, VPN und Verschlüsselung. Für Telefonie gilt eine Einweg-Verzögerung bis 150 ms als gut.
- **Jitter:** Schwankung der Laufzeit zwischen den Paketen; Sprache wird abgehackt. Ein Jitter-Puffer gleicht das aus, erhöht aber die Latenz.
- **Paketverlust:** Verlorene Pakete werden bei Echtzeitdaten nicht neu gesendet (UDP); schon ab etwa 1 % leidet die Sprachqualität.
- **QoS (Quality of Service):** Netzwerkgeräte behandeln Datenverkehr unterschiedlich: Sprache und Video werden bevorzugt weitergeleitet, Downloads und Updates müssen warten. Bringt nichts, wenn die Bandbreite grundsätzlich nicht reicht.
- **Klassifizierung und Markierung:** Pakete werden einer Klasse zugeordnet und markiert – auf Schicht 3 per DSCP (Differentiated Services Code Point – Feld für die Priorität) im IP-Header (Sprache: EF = 46, Expedited Forwarding), auf Schicht 2 per Priorität im VLAN-Tag (802.1p, Sprache: 5).
- **Priorisierung (Queuing):** Jede Klasse hat eine eigene Warteschlange; die Sprach-Warteschlange wird zuerst abgearbeitet (Priority Queuing).
- **Traffic Shaping:** Begrenzt die Senderate einer Verbindung, z. B. auf etwas unter die Upload-Bandbreite, damit sich die Warteschlange im eigenen Router bildet, wo QoS greift – nicht beim Provider.
- **Voice-VLAN:** Eigenes VLAN (Virtual LAN) für Telefone; trennt Sprache vom übrigen Verkehr und erleichtert QoS und Sicherheit.
- **Cloud-Telefonanlage:** Die Telefonanlage läuft beim Anbieter; auch interne Gespräche laufen über den Internetanschluss – jedes Telefon hat dann eine eigene Verbindung zur Cloud, ein internes Gespräch belegt also zwei.

### Abbildung: QoS mit Warteschlangen
![Gemischter Verkehr aus VoIP, Web, Video und Backup wird anhand der DSCP-Markierung klassifiziert und in drei Warteschlangen einsortiert: Priorität für Sprache (EF, 46), Video (AF41, 34) und Standard (Best Effort, 0). Ein Scheduler sendet die Sprachpakete zuerst. Sprache braucht wenig Bandbreite, aber geringe Verzögerung unter 150 ms und wenig Jitter unter 30 ms.](qos-warteschlangen.svg)

### Tabelle: Wichtige Codecs
| Codec | Bitrate | Qualität | Einsatz |
| --- | --- | --- | --- |
| G.711 | 64 kbit/s | klassische Telefonqualität (Schmalband) | Standard, fast überall unterstützt |
| G.722 | 64 kbit/s | HD-Voice (Breitband, klarere Sprache) | moderne IP-Telefone |
| G.729 | 8 kbit/s | etwas schlechter, stark komprimiert | wenig Bandbreite |
| Opus | 6–510 kbit/s, variabel | sehr gut, passt sich an die Leitung an | Teams, Zoom, WebRTC |

### Tabelle: Grenzwerte für gute Sprachqualität
| Größe | gut | Folge bei Überschreitung |
| --- | --- | --- |
| Latenz (Einweg) | bis 150 ms | Gesprächspartner reden durcheinander |
| Jitter | unter 30 ms | abgehackte Sprache |
| Paketverlust | unter 1 % | Aussetzer, Roboterstimme |

### Tabelle: Beispiel – Bandbreite für VoIP berechnen
| Schritt | Rechnung |
| --- | --- |
| Codec G.711 | 64 kbit/s je Richtung |
| plus 25 % Overhead | 64 × 1,25 = 80 kbit/s je Gespräch und Richtung |
| 4 interne Gespräche über eine Cloud-Anlage | 4 × 2 = 8 Verbindungen (jedes Telefon einzeln zur Cloud) |
| 10 externe Gespräche | 10 Verbindungen |
| Summe | 18 × 80 kbit/s = 1.440 kbit/s ≈ 1,44 Mbit/s – im Upload **und** im Download |

### Befehle
- `ping -n 50 voip.anbieter.de` – Latenz und Schwankungen grob prüfen (Windows)
- `pathping voip.anbieter.de` – Laufzeit und Paketverlust je Router auf dem Weg (Windows)
- `mtr voip.anbieter.de` – dasselbe fortlaufend unter Linux
- `iperf3 -c server -u -b 2M` – UDP-Last erzeugen und Jitter sowie Verlust messen

### Merksatz
Sprache verträgt keine Verzögerung, ein Download schon – deshalb fährt Sprache mit QoS auf der Überholspur. Bandbreite = Codec plus Overhead mal Anzahl Verbindungen, und das in beide Richtungen.

### Prüfungsfrage
Ein Unternehmen nutzt eine Cloud-Telefonanlage mit G.722 (64 kbit/s) und 15 % Protokoll-Overhead. Gleichzeitig laufen 3 interne und 12 externe Gespräche. Welche Bandbreite wird im Upload benötigt?

1. Je Verbindung: 64 kbit/s × 1,15 = 73,6 kbit/s.
2. Interne Gespräche laufen über die Cloud: 3 × 2 = 6 Verbindungen; externe: 12 Verbindungen; zusammen 18.
3. 18 × 73,6 kbit/s = 1.324,8 kbit/s ≈ 1,32 Mbit/s.
4. Dieselbe Bandbreite wird gleichzeitig im Download gebraucht; dazu Reserve für Videokonferenzen und übrigen Verkehr einplanen und QoS einrichten.

## Strukturierte Verkabelung & Netzwerkplan {#verkabelung}

### Kernbegriffe
- **Strukturierte Verkabelung:** Einheitliches, anwendungsneutrales Verkabelungssystem nach DIN EN 50173 (Norm des Deutschen Instituts für Normung, gleichzeitig Europäische Norm), aufgeteilt in Primär-, Sekundär- und Tertiärbereich. Wer welches Kabel nutzt, wird erst im Schrank durch Patchen festgelegt.
- **Primärbereich (Standort):** Verbindet die Gebäude eines Standorts – vom Standortverteiler zu den Gebäudeverteilern. Meist Singlemode-Glasfaser.
- **Sekundärbereich (Gebäude):** Verbindet im Gebäude den Gebäudeverteiler mit den Etagenverteilern, über Steigleitungen. Meist Glasfaser.
- **Tertiärbereich (Etage):** Vom Etagenverteiler bis zur Netzwerkdose am Arbeitsplatz. Kupfer-Installationskabel, höchstens 90 m.
- **Verteiler:** Standortverteiler (SV), Gebäudeverteiler (GV) und Etagenverteiler (EV) – jeweils ein Netzwerkschrank mit Patchfeldern und aktiven Komponenten wie Switches.
- **Patchfeld:** Hier enden die fest verlegten Installationskabel auf LSA-Leisten. Mit kurzen Patchkabeln werden die Ports mit dem Switch verbunden – Änderungen erfordern nur Umstecken.
- **Permanent Link und Channel:** Permanent Link ist die fest verlegte Strecke vom Patchfeld bis zur Dose (höchstens 90 m). Channel ist die ganze Übertragungsstrecke einschließlich Patchkabeln (höchstens 100 m).
- **Abnahmemessung:** Jede neue Strecke wird mit einem Messgerät zertifiziert (Verdrahtung, Länge, Dämpfung, Übersprechen) und im Messprotokoll dokumentiert.
- **Beschriftung:** Dose, Patchfeld-Port und Kabel tragen dieselbe eindeutige Bezeichnung, z. B. „2.OG-R204-03“. Ohne Beschriftung wird jede Fehlersuche zur Suche nach dem richtigen Kabel.
- **Physischer und logischer Netzwerkplan:** Physisch zeigt Räume, Schränke, Dosen und Kabelwege; logisch zeigt Subnetze, VLANs (Virtual LANs), IP-Bereiche und Geräte.

### Abbildung: Primär-, Sekundär- und Tertiärbereich
![Gebäude A mit dem Standortverteiler ist über den Primärbereich (Glasfaser Singlemode) mit dem Gebäudeverteiler im Keller von Gebäude B verbunden. Von dort führt der Sekundärbereich als Steigleitung zu den Etagenverteilern in EG, 1. und 2. OG. Von jedem Etagenverteiler geht im Tertiärbereich je ein Kupferkabel zu jeder Netzwerkdose, höchstens 90 Meter; der Channel mit Patchkabeln höchstens 100 Meter.](verkabelung-struktur.svg)

### Tabelle: Bereiche der strukturierten Verkabelung
| Bereich | verbindet | typisches Medium | max. Länge |
| --- | --- | --- | --- |
| Primär | Standortverteiler – Gebäudeverteiler | Singlemode-Glasfaser | 1500 m |
| Sekundär | Gebäudeverteiler – Etagenverteiler | Glasfaser (Multi- oder Singlemode) | 500 m |
| Tertiär | Etagenverteiler – Anschlussdose | Kupfer Cat 6A (Installationskabel) | 90 m |

### Tabelle: Was gehört in welchen Netzwerkplan?
| Physischer Plan | Logischer Plan |
| --- | --- |
| Gebäude, Räume, Etagen | Subnetze und IP-Bereiche |
| Netzwerkschränke und Patchfelder | VLANs und ihre Zuordnung |
| Dosen mit Bezeichnung | Router, Firewalls, Gateways |
| Kabelwege und Kabeltypen | Server und Dienste mit IP-Adressen |
| Standorte der Switches und Access Points | Verbindungen zwischen den Netzen (Routing) |

### Befehle
- `ping -n 100 192.168.1.1` – Verbindung über längere Zeit testen, Paketverluste erkennen (Windows)
- `iperf3 -c 192.168.1.20` – tatsächliche Übertragungsrate zwischen zwei Rechnern messen
- `Get-NetAdapter` – Verbindungsgeschwindigkeit der Netzwerkkarte anzeigen (PowerShell)

### Merksatz
Primär zwischen Gebäuden, sekundär zwischen Etagen, tertiär bis zur Dose. 90 m fest verlegt plus 10 m Patchkabel ergeben 100 m Channel.

### Prüfungsfrage
Ein dreistöckiges Bürogebäude soll neu verkabelt werden. Beschreibe die Planung nach dem Modell der strukturierten Verkabelung.

1. Gebäudeverteiler im Serverraum (z. B. im Erdgeschoss), dazu je Etage ein Etagenverteiler.
2. Sekundärbereich: Glasfaser vom Gebäudeverteiler zu jedem Etagenverteiler, mit Reserve-Fasern.
3. Tertiärbereich: Cat-6A-Installationskabel vom Etagenverteiler zu jeder Dose, höchstens 90 m; lieber eine Dose mehr pro Arbeitsplatz einplanen.
4. Alle Strecken auf Patchfeldern auflegen, einheitlich beschriften und per Abnahmemessung prüfen.
5. Physischen und logischen Netzwerkplan erstellen und aktuell halten.

## Netzwerktopologien {#topologien}

### Kernbegriffe
- **Topologie:** Anordnung der Geräte und Verbindungen in einem Netz. Die **physische** Topologie beschreibt die Kabelwege, die **logische** den Weg der Daten – beides kann sich unterscheiden (Token Ring war physisch ein Stern, logisch ein Ring).
- **Bus:** Alle Geräte hängen an einem gemeinsamen Kabel, an beiden Enden sitzt ein Abschlusswiderstand. Ein Kabelbruch legt das ganze Netz lahm. Historisch: Koax-Ethernet (10BASE2).
- **Ring:** Jedes Gerät ist mit zwei Nachbarn verbunden, Daten laufen reihum. Ohne Redundanz unterbricht ein Ausfall den Ring – daher oft als Doppelring (z. B. FDDI – Fiber Distributed Data Interface, Ring-Topologien in Industrienetzen).
- **Stern:** Alle Geräte sind einzeln mit einem zentralen Switch verbunden. Fällt ein Kabel aus, betrifft es nur ein Gerät; fällt der Switch aus, steht das Netz. Standard im heutigen Ethernet-LAN.
- **Baum (erweiterter Stern):** Mehrere Sterne hierarchisch verbunden, z. B. Core-Switch → Etagenswitches → Endgeräte. Typisch für strukturierte Verkabelung in Gebäuden.
- **Vollvermascht:** Jeder Knoten ist mit jedem verbunden. Höchste Ausfallsicherheit, aber sehr viele Verbindungen: n · (n − 1) / 2.
- **Teilvermascht:** Nur wichtige Knoten sind mehrfach verbunden. Guter Kompromiss aus Kosten und Redundanz – so ist das Internet und fast jedes WAN (Wide Area Network – Netz über große Entfernungen) aufgebaut.
- **Single Point of Failure (SPOF):** Eine Komponente, deren Ausfall das ganze Netz stoppt – beim Stern der zentrale Switch.

### Abbildung: Topologien im Überblick
![Bus: alle Geräte an einem Kabel mit Abschlusswiderständen](topo-bus.svg)
![Ring: jedes Gerät mit zwei Nachbarn, Daten laufen reihum](topo-ring.svg)
![Stern: alle Geräte einzeln an einem zentralen Switch](topo-stern.svg)
![Baum: Core-Switch verbindet mehrere Etagenswitches](topo-baum.svg)
![Vollvermascht: jeder Knoten mit jedem verbunden](topo-vollvermascht.svg)
![Teilvermascht: wichtige Knoten mehrfach verbunden](topo-teilvermascht.svg)

### Tabelle: Topologien im Vergleich
| Topologie | Vorteil | Nachteil | Heute |
| --- | --- | --- | --- |
| Bus | wenig Kabel, einfach | Kabelbruch = Totalausfall, Kollisionen | veraltet (Koax) |
| Ring | geordneter Zugriff, kein Kollisionsproblem | ein Ausfall unterbricht den Ring (ohne Doppelring) | Industrie, Glasfaser-Ringe bei Providern |
| Stern | einfach erweiterbar, Fehler leicht zu finden | zentraler Switch ist SPOF, viel Kabel | Standard im LAN |
| Baum | skalierbar, gut strukturiert | Ausfall eines oberen Switches trennt ganze Äste | Gebäude- und Campusnetze |
| Vollvermascht | maximale Redundanz | Kosten und Aufwand steigen stark | kleine Kernnetze |
| Teilvermascht | Redundanz, wo sie zählt | Planung aufwendiger | Internet, WAN, Rechenzentrum |

### Merksatz
Stern ist Standard im LAN, Baum im Gebäude, Masche im WAN. Vollvermascht braucht n · (n − 1) / 2 Leitungen.

### Prüfungsfrage
Sechs Standorte sollen vollvermascht verbunden werden. Wie viele Leitungen sind nötig, und wie viele Anschlüsse braucht jeder Standort?

1. Formel für die Vollvermaschung: n · (n − 1) / 2.
2. Einsetzen: 6 · 5 / 2 = 15 Leitungen.
3. Jeder Standort ist mit allen anderen verbunden: n − 1 = 5 Anschlüsse pro Standort.
4. Bewertung: Bei vielen Standorten wird das schnell teuer – deshalb meist teilvermascht oder sternförmig über eine Zentrale.

## Kabeltypen {#kabeltypen}

### Kernbegriffe
- **Twisted Pair:** Kupferkabel mit vier verdrillten Adernpaaren und RJ45-Anschluss. Die Kategorie (Cat) bestimmt die mögliche Datenrate; neu verlegt wird mindestens Cat 6A, dann sind 10 Gbit/s auf voller Länge möglich.
- **Schirmung (X/YTP):** Bezeichnung nach ISO (International Organization for Standardization)/IEC 11801. Vor dem Schrägstrich steht der Gesamtschirm um alle Paare, dahinter der Schirm um jedes einzelne Paar. U = ungeschirmt, F = Folie, S = Geflecht, SF = Geflecht und Folie. TP = Twisted Pair.
- **Verdrillung:** Die Adern eines Paares sind miteinander verdrillt. Störungen wirken auf beide Adern gleich und heben sich auf; zusätzlich sinkt das Übersprechen zwischen den Paaren (NEXT).
- **Patchkabel:** Flexible Litzenadern, mit fertigen RJ45-Steckern. Verbindet Patchfeld und Switch oder Dose und PC. Höchstens 10 m pro Strecke.
- **Installationskabel (Verlegekabel):** Starre Volldrahtadern, fest in Wand oder Kabelkanal verlegt und auf LSA-Leisten in Patchfeld und Netzwerkdose aufgelegt – nicht gecrimpt. Höchstens 90 m.
- **Halogenfrei (LSZH/LSOH):** Low Smoke Zero Halogen – Mantel ohne Halogene; im Brandfall entsteht weniger giftiger, ätzender Rauch. In Gebäuden Standard. Kabel tragen außerdem eine Brandschutzklasse nach EU-Bauproduktenverordnung.
- **Glasfaser (LWL):** Licht statt Strom: unempfindlich gegen elektromagnetische Störungen, keine Potenzialprobleme zwischen Gebäuden, große Reichweiten. Aufbau: Kern, Mantel (125 µm) und Schutzbeschichtung.
- **Multimode (OM):** Kern 50 µm (früher 62,5 µm). Licht nimmt viele Wege (Moden), die unterschiedlich lang sind – das begrenzt die Reichweite. Günstige Optiken, für Gebäude und Rechenzentrum.
- **Singlemode (OS2):** Kern ca. 9 µm, nur ein Lichtweg. Reichweiten von vielen Kilometern; Standard zwischen Gebäuden und bei Providern. Mantelfarbe gelb.
- **Twinax (DAC):** Fertig konfektioniertes Kupferkabel mit SFP-Modulen an beiden Enden, für kurze Strecken im Rack (wenige Meter), günstiger als Glasfaser.

### Abbildung: Aufbau von Twisted-Pair-Kabeln
![U/UTP: ungeschirmt](kabel-u-utp.svg)
![U/FTP: jedes Paar in Folie](kabel-u-ftp.svg)
![F/UTP: Folie um alle Paare](kabel-f-utp.svg)
![S/FTP: Geflecht um alle Paare, Folie um jedes Paar](kabel-s-ftp.svg)

### Tabelle: Kupferkabel-Kategorien
| Kategorie | Datenrate | Reichweite |
| --- | --- | --- |
| Cat 5e | 1 Gbit/s | 100 m |
| Cat 6 | 1 Gbit/s (10 Gbit/s bis ca. 55 m) | 100 m |
| Cat 6A | 10 Gbit/s | 100 m |
| Cat 7 / 7A | 10 Gbit/s | 100 m |
| Cat 8 | 25 bis 40 Gbit/s | 30 m (Rechenzentrum) |

### Abbildung: Glasfaser im Querschnitt
![Multimode: dicker Kern 50 µm, Licht nimmt viele Wege](faser-multimode.svg)
![Singlemode: dünner Kern 9 µm, Licht nimmt einen Weg](faser-singlemode.svg)

### Tabelle: Glasfaser-Kategorien
| Kategorie | Typ | Kern | Mantelfarbe (üblich) | 10GBASE-SR/-LR |
| --- | --- | --- | --- | --- |
| OM1 | Multimode | 62,5 µm | orange | ca. 33 m |
| OM2 | Multimode | 50 µm | orange | ca. 82 m |
| OM3 | Multimode | 50 µm | aqua (türkis) | 300 m |
| OM4 | Multimode | 50 µm | aqua oder violett (erika) | 400 m |
| OM5 | Multimode, mehrere Wellenlängen | 50 µm | limettengrün | 400 m |
| OS2 | Singlemode | ca. 9 µm | gelb | 10 km (10GBASE-LR) |

### Tabelle: Kupfer oder Glasfaser?
| Kriterium | Kupfer (Twisted Pair) | Glasfaser |
| --- | --- | --- |
| Reichweite | 100 m | Multimode einige 100 m, Singlemode viele km |
| Störfestigkeit | anfällig, Schirmung hilft | unempfindlich gegen elektromagnetische Störungen |
| Zwischen Gebäuden | ungeeignet (Potenzialunterschiede, Blitz) | Standard |
| PoE | möglich | nicht möglich |
| Kosten | günstig, einfach anzuschließen | teurere Technik, Spleißen braucht Fachkraft |

### Merksatz
X/YTP: erst der Schirm um alles, dann der Schirm ums Paar. Gelb ist Singlemode, aqua ist OM3/OM4 – zwischen Gebäuden immer Glasfaser.

### Prüfungsfrage
Zwei Gebäude auf einem Firmengelände sind 350 m voneinander entfernt und sollen mit 10 Gbit/s verbunden werden. Welches Kabel wählst du?

1. Kupfer scheidet aus: höchstens 100 m und ungeeignet zwischen Gebäuden (Potenzialunterschiede, Überspannung).
2. Multimode OM3 schafft bei 10GBASE-SR nur 300 m – zu knapp. OM4 (400 m) würde reichen, hat aber kaum Reserve.
3. Empfehlung: Singlemode OS2 mit 10GBASE-LR (bis 10 km) – genug Reserve auch für spätere 25 oder 100 Gbit/s.
4. Anschluss im Switch über SFP+-Module mit LC-Duplex-Steckern.

## LWL-Steckertypen {#lwl-stecker}

### Kernbegriffe
- **LWL:** Lichtwellenleiter – Glasfaserkabel, das Daten als Licht überträgt.
- **Ferrule:** Präzisionshülse (meist Keramik) im Stecker, in der die Faser mittig sitzt. Zwei Ferrulen werden in einer Kupplung genau gegeneinander gedrückt.
- **LC (Lucent Connector):** Kleiner Stecker mit 1,25-mm-Ferrule und Rasthebel, meist als Duplex (Senden und Empfangen). Standard an SFP-Modulen in Switches und Servern.
- **SC (Subscriber Connector):** Quadratischer Stecker mit 2,5-mm-Ferrule und Push-Pull-Mechanik. Verbreitet in Patchfeldern; beim Glasfaser-Hausanschluss (FTTH) oft als SC/APC – neuere Anschlüsse nutzen auch LC/APC.
- **ST (Straight Tip):** Runder Stecker mit Bajonettverschluss (drücken und drehen), 2,5-mm-Ferrule. Älter, findet sich in Bestandsnetzen.
- **MTP/MPO:** Mehrfaserstecker mit 8, 12 oder 24 Fasern in einer Reihe und Führungsstiften. Für 40/100-Gbit/s-Verbindungen und vorkonfektionierte Trunks im Rechenzentrum.
- **E-2000 (LSH):** Stecker mit 2,5-mm-Ferrule, Hebel und federnder Schutzklappe gegen Staub und Laserlicht. Häufig bei Carriern und in APC-Ausführung.
- **Schliff PC/UPC:** Ferrule leicht gewölbt und gerade poliert. Ein kleiner Teil des Lichts wird in die Faser zurückgeworfen. Steckerfarbe bei Singlemode: blau.
- **Schliff APC:** Ferrule um 8° schräg poliert – reflektiertes Licht verlässt den Kern seitlich. Weniger Rückreflexion, wichtig z. B. bei FTTH und Kabel-TV. Steckerfarbe: grün.
- **Polarität:** Bei Duplex muss Senden (TX) der einen Seite auf Empfangen (RX) der anderen treffen (A auf B). Kommt kein Link zustande, ist oft die Polarität vertauscht.
- **Transceiver:** Steckbares Modul im Switch, das elektrische in optische Signale wandelt: SFP (Small Form-factor Pluggable, 1 Gbit/s), SFP+ (10), SFP28 (25), QSFP+ (40; Q für Quad – vier Kanäle in einem Modul), QSFP28 (100). Faser-Typ und Wellenlänge müssen zum Modul passen.

### Abbildung: Steckertypen
![LC: klein, Rasthebel, 1,25-mm-Ferrule](lwl-lc.svg)
![SC: quadratisch, Push-Pull, 2,5-mm-Ferrule](lwl-sc.svg)
![ST: rund, Bajonettverschluss](lwl-st.svg)
![MTP/MPO: viele Fasern in einer Reihe, Führungsstifte](lwl-mtp.svg)
![E-2000: Hebel und Schutzklappe](lwl-e2000.svg)

### Abbildung: Schliffarten
![Gerader UPC-Schliff wirft Licht in die Faser zurück, 8°-APC-Schliff lenkt es seitlich ab](lwl-schliff.svg)

### Tabelle: Farbcode der Stecker
| Farbe | Bedeutung |
| --- | --- |
| beige | Multimode (OM1/OM2) |
| aqua (türkis) | Multimode OM3/OM4 |
| blau | Singlemode, UPC-Schliff |
| grün | Singlemode, APC-Schliff (8°) |

### Merksatz
LC klein, SC eckig, ST rund, MTP viele. Blau ist gerade, grün ist schräg – APC und UPC niemals zusammenstecken.

### Prüfungsfrage
Ein Kollege will eine neue Glasfaserstrecke mit grünen SC-Steckern auf ein Patchfeld mit blauen SC-Kupplungen stecken. Was sagst du ihm?

1. Grün bedeutet APC (8° schräg), blau bedeutet UPC (gerade).
2. Die Ferrulen berühren sich nur an einer Kante; es entsteht ein Luftspalt mit hoher Dämpfung und starken Reflexionen.
3. Die Stirnflächen können dabei beschädigt werden.
4. Lösung: passende Patchkabel (APC auf UPC als Hybridkabel) verwenden oder die Kupplung tauschen – und vor dem Stecken die Stirnflächen reinigen.

## Netzwerkkabel crimpen {#crimpen}

### Kernbegriffe
- **Crimpen:** Einen RJ45-Stecker mit einer Crimpzange auf ein Kabel pressen. Die Kontakte des Steckers schneiden dabei durch die Isolierung der Adern.
- **T568A und T568B:** Zwei Normen für die Reihenfolge der Adern. Beide sind gleich gut – wichtig ist, an beiden Enden und im ganzen Gebäude dieselbe zu verwenden.
- **Patchkabel (1:1):** Beide Enden nach derselben Norm belegt. Das ist heute der Normalfall.
- **Crossover-Kabel:** Ein Ende nach T568A, das andere nach T568B – Sende- und Empfangspaar sind getauscht. Früher nötig, um zwei gleichartige Geräte (PC–PC, Switch–Switch) direkt zu verbinden.
- **Auto-MDI-X:** Die Netzwerkkarte erkennt selbst, wo gesendet und empfangen wird. Damit funktioniert jedes 1:1-Kabel; Crossover-Kabel braucht man praktisch nicht mehr.
- **Werkzeug:** Abmantelwerkzeug, Crimpzange für RJ45, passende Stecker (für Litze oder Draht, geschirmt oder ungeschirmt), Kabeltester. Für Installationskabel stattdessen LSA-Anlegewerkzeug oder werkzeuglose Keystone-Module.
- **Split Pair:** Adern zwar durchgängig, aber falsch gepaart (z. B. Pin 3 und 6 nicht aus demselben Paar). Einfache Durchgangstester zeigen das nicht – das Kabel läuft dann mit Fehlern oder nur langsam.
- **Kabeltester und Zertifizierung:** Ein einfacher Tester prüft Durchgang, Vertauschung und Kurzschluss. Fest installierte Strecken werden mit einem Messgerät zertifiziert (Dämpfung, Übersprechen, Länge) und protokolliert.

### Abbildung: RJ45-Belegung
![T568A: ws/gn, gn, ws/or, bl, ws/bl, or, ws/br, br](rj45-t568a.svg)
![T568B: ws/or, or, ws/gn, bl, ws/bl, gn, ws/br, br](rj45-t568b.svg)

### Tabelle: Belegung T568A und T568B
| Pin | T568A | T568B | 100 Mbit/s |
| --- | --- | --- | --- |
| 1 | weiß-grün | weiß-orange | Senden + |
| 2 | grün | orange | Senden − |
| 3 | weiß-orange | weiß-grün | Empfangen + |
| 4 | blau | blau | – |
| 5 | weiß-blau | weiß-blau | – |
| 6 | orange | grün | Empfangen − |
| 7 | weiß-braun | weiß-braun | – |
| 8 | braun | braun | – |

### Merksatz
Blau bleibt in der Mitte, Braun bleibt hinten – A und B tauschen nur Grün und Orange. An beiden Enden dieselbe Norm, dann ist es ein Patchkabel.

### Prüfungsfrage
Beschreibe die Arbeitsschritte, um ein Patchkabel nach T568B zu crimpen.

1. Kabel ablängen, Knickschutztüllen vor dem Crimpen aufschieben.
2. Mantel ca. 2–3 cm abisolieren, ohne die Adern zu beschädigen; bei geschirmtem Kabel Schirm und Beidraht zurücklegen.
3. Paare nur so weit wie nötig entdrillen und nach T568B ordnen: ws/or, or, ws/gn, bl, ws/bl, gn, ws/br, br.
4. Adern gerade auf ca. 12 mm kürzen und bis vorn an den Anschlag in den Stecker schieben – der Mantel muss im Stecker unter der Zugentlastung sitzen.
5. Reihenfolge durch den transparenten Stecker kontrollieren, dann mit der Crimpzange fest verpressen.
6. Zweites Ende genauso nach T568B konfektionieren.
7. Mit dem Kabeltester alle acht Adern prüfen (Durchgang, keine Vertauschung, kein Kurzschluss).

## Häufige Fehler
- Für jede Abteilung eine eigene SSID (Service Set Identifier) anlegen – jede SSID kostet Sendezeit für Beacons.
- Access Points mit voller Sendeleistung betreiben, damit „die Reichweite gut ist“.
- Im 2,4-GHz-Band Kanäle wie 1, 3, 5 vergeben statt 1, 6, 11.
- Bei einer Cloud-Telefonanlage interne Gespräche nur einfach zählen – jedes Telefon hat seine eigene Verbindung zur Cloud.
- QoS für ein Allheilmittel halten – es verteilt die vorhandene Bandbreite nur anders.
- Im Mitschnitt die TTL (Time to Live) direkt als Zahl der Router lesen, statt sie vom Startwert (64, 128 oder 255) abzuziehen.
- Netz- oder Broadcastadresse als Host-IP vergeben.
- Bei /26 mit 64 statt 62 nutzbaren Hosts rechnen.
- :: in einer IPv6-Adresse mehr als einmal verwenden.
- Default-Gateway in einem anderen Subnetz als den Host eintragen.
- Switch und Router verwechseln: Nur der Router verbindet verschiedene Netze.
- Beim Crimpen T568A und T568B an den Enden mischen, ohne ein Crossover-Kabel zu wollen.
- APC- (grün) und UPC-Stecker (blau) zusammenstecken.
- Installationskabel (Draht) mit Steckern für Litze crimpen – dafür gibt es LSA-Leisten oder passende Feldstecker.
- Glauben, die MAC-Adresse bleibe bis zum Ziel gleich – sie wird an jedem Router neu gesetzt.
- Bei SDN (Software-Defined Networking) vergessen, den Controller redundant und besonders geschützt zu betreiben.

## Links
- [Elektronik-Kompendium](https://www.elektronik-kompendium.de/) – verständliche Erklärungen zu Netzwerktechnik
- [Microsoft Learn – Training](https://learn.microsoft.com/de-de/training/) – kostenlose Lernpfade, u. a. zu Netzwerkgrundlagen

## Zusatz: Wie Pakete durchs Netz reisen {#paketreise}
ablauf: paketreise.json
zu: osi-tcpip, routing, sicherheit.firewall

Zwei Szenarien: ein Ping über einen Router in ein anderes Subnetz und ein Zugriff aus dem Internet auf einen Webserver hinter einer Firewall. Klick dich durch oder lass es abspielen.

## Zusatz: Switch und ARP Schritt für Schritt {#ablauf-arp-switching}
ablauf: arp-switching.json
zu: switching, ipv4-ipv6, paketaufbau

Wie ein Switch seine MAC-Adresstabelle füllt und wie ein PC per ARP (Address Resolution Protocol – findet zur IP-Adresse die MAC-Adresse) zur IP-Adresse die passende MAC-Adresse findet. Die Tabelle unter der Animation zeigt, was sich in jedem Schritt ändert.

## Zusatz: VLAN und Trunk Schritt für Schritt {#ablauf-vlan}
ablauf: vlan.json
zu: vlan, switching

Ein Broadcast wandert von einem Access-Port über einen Trunk zum zweiten Switch – und bleibt dabei in seinem VLAN (Virtual LAN).

## Zusatz: TCP-Verbindung Schritt für Schritt {#ablauf-tcp}
ablauf: tcp.json
zu: osi-tcpip, paketaufbau, mitschnitt

Drei-Wege-Handshake, Datenübertragung mit Sequenz- und Bestätigungsnummern und der saubere Verbindungsabbau. Genau diese Pakete siehst du auch in einem Wireshark-Mitschnitt.
