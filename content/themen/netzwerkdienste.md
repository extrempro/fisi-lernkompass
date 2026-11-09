---
titel: Netzwerkdienste
---

Die Dienste, ohne die kein Netz läuft: Adressvergabe, Namensauflösung, Adressumsetzung, sichere Verbindungen und zentrale Benutzerverwaltung.

## DHCP {#dhcp}

### Kernbegriffe
- **DHCP:** Dynamic Host Configuration Protocol – vergibt IP-Adresse, Subnetzmaske, Gateway und DNS-Server automatisch an Clients, damit niemand jedes Gerät von Hand einrichten muss.
- **DORA:** Ablauf der Adressvergabe bei IPv4 in vier Nachrichten: Discover, Offer, Request, Acknowledge.
- **Bereich (Scope):** Adresspool, aus dem der Server vergibt, z. B. 192.168.1.100–192.168.1.200, mit Subnetzmaske und Optionen.
- **Ausschluss:** Adressen innerhalb des Bereichs, die der Server nicht vergibt, z. B. für fest eingestellte Server oder Drucker.
- **Lease:** Zeitlich begrenzte Vergabe einer Adresse; Windows Server vergibt standardmäßig für 8 Tage, viele Heimrouter für 1 Tag.
- **T1 und T2:** Zeitpunkte zur Verlängerung der Lease – bei 50 % fragt der Client seinen Server direkt (Renewing), bei 87,5 % jeden erreichbaren Server per Broadcast (Rebinding).
- **Reservierung:** Feste Zuordnung einer IP-Adresse zu einer MAC-Adresse, z. B. für Drucker; das Gerät bleibt trotzdem auf DHCP eingestellt.
- **DHCP-Optionen:** Zusätzliche Einstellungen, die der Server mitliefert, z. B. Option 3 Router (Gateway), 6 DNS-Server, 15 Domänenname, 42 NTP-Server, 66/67 TFTP-Server und Bootdatei für PXE.
- **DHCP-Relay:** Leitet DHCP-Broadcasts über einen Router per Unicast an einen DHCP-Server in einem anderen Subnetz weiter (bei Cisco ip helper-address); der Server erkennt am Feld giaddr, aus welchem Bereich er vergeben muss.
- **DHCPNAK und DHCPDECLINE:** NAK – der Server lehnt eine angefragte Adresse ab, z. B. weil der Client in ein anderes Subnetz umgezogen ist; DECLINE – der Client meldet, dass die angebotene Adresse schon von einem anderen Gerät genutzt wird.
- **SLAAC:** Stateless Address Autoconfiguration bei IPv6 – der Client bildet seine Adresse selbst aus dem Präfix im Router Advertisement und einer eigenen Interface-ID, ganz ohne DHCP-Server.
- **Router Advertisement (RA):** IPv6-Nachricht des Routers mit Präfix, Standard-Gateway und den Flags M und O, die festlegen, ob und wofür DHCPv6 genutzt wird.
- **DHCPv6:** DHCP für IPv6 über UDP 546 (Client) und 547 (Server); Anfragen gehen an die Multicast-Adresse ff02::1:2, weil es bei IPv6 keinen Broadcast gibt.
- **SARR:** Ablauf bei stateful DHCPv6: Solicit, Advertise, Request, Reply – das Gegenstück zu DORA.
- **Stateless DHCPv6:** Adresse per SLAAC, nur zusätzliche Angaben wie DNS-Server und Domäne kommen vom DHCPv6-Server (Information-Request und Reply).
- **DUID:** DHCP Unique Identifier – kennzeichnet bei DHCPv6 den Client statt der MAC-Adresse; Reservierungen hängen deshalb an der DUID.
- **Prefix Delegation:** Ein Router bekommt per DHCPv6 ein ganzes Präfix vom Provider, z. B. ein /56, und verteilt daraus /64-Netze an seine eigenen Subnetze.
- **DAD:** Duplicate Address Detection – bei IPv6 prüft der Client per Neighbor Solicitation, ob seine neue Adresse schon jemand nutzt, bevor er sie verwendet.

### Abbildung: DHCP bei IPv4 (DORA und Lease)
![Ablauf DORA zwischen Client und DHCP-Server: 1 Discover als Broadcast von 0.0.0.0 an 255.255.255.255, 2 Offer mit angebotener Adresse, Gateway, DNS und Leasedauer, 3 Request als Broadcast mit gewählter Adresse und Server, 4 Acknowledge. Darunter der Lebenszyklus der Lease: ab 50 % (T1) Renewing per Unicast, ab 87,5 % (T2) Rebinding per Broadcast, bei 100 % Ablauf.](dhcp-dora.svg)

### Tabelle: DORA Schritt für Schritt (IPv4)
| Schritt | Nachricht | Absender → Empfänger | Was passiert |
| --- | --- | --- | --- |
| 1 | Discover | Client 0.0.0.0:68 → Broadcast 255.255.255.255:67 | Der Client hat noch keine Adresse und ruft ins ganze Netz, ob es einen DHCP-Server gibt; er schickt seine MAC-Adresse mit. |
| 2 | Offer | Server → Client | Jeder erreichbare Server bietet eine freie Adresse an, dazu Subnetzmaske, Gateway, DNS und Leasedauer. Die Adresse ist kurz für den Client vorgemerkt. |
| 3 | Request | Client → Broadcast | Der Client nimmt das erste Angebot an. Er antwortet per Broadcast, damit auch die anderen Server sehen, dass ihr Angebot nicht genommen wurde. |
| 4 | Acknowledge | Server → Client | Der Server bestätigt und trägt die Lease ein. Viele Clients prüfen noch per ARP, ob die Adresse wirklich frei ist, und melden sonst DECLINE. |

### Tabelle: Lebenszyklus einer Lease
| Zeitpunkt | Zustand | Was der Client tut |
| --- | --- | --- |
| 0 % | Bound | Nutzt die Adresse. |
| 50 % (T1) | Renewing | Fragt per Unicast direkt beim vergebenden Server nach Verlängerung (Request → Acknowledge). |
| 87,5 % (T2) | Rebinding | Sein Server antwortet nicht – er fragt per Broadcast jeden DHCP-Server. |
| 100 % | abgelaufen | Gibt die Adresse auf und beginnt wieder mit Discover; findet er keinen Server, nimmt Windows eine APIPA-Adresse (169.254.x.x). |
| jederzeit | Release | Gibt die Adresse freiwillig zurück, z. B. beim Herunterfahren oder mit ipconfig /release. |

### Abbildung: Adressvergabe bei IPv6
![IPv6-Adressvergabe: 1 Der Client schickt eine Router Solicitation an ff02::2, 2 der Router antwortet mit einem Router Advertisement an ff02::1 mit Präfix, Gateway und den Flags M und O. 3 Je nach Flags: M=0 und O=0 nur SLAAC mit DNS über RDNSS; M=0 und O=1 SLAAC plus stateless DHCPv6 für DNS und Domäne; M=1 stateful DHCPv6 mit Solicit, Advertise, Request, Reply. Das Gateway kommt immer aus dem Router Advertisement.](ipv6-adressvergabe.svg)

### Tabelle: IPv6 – welche Flags im Router Advertisement was bewirken
| M-Flag | O-Flag | Verfahren | Adresse von | DNS-Server von |
| --- | --- | --- | --- | --- |
| 0 | 0 | nur SLAAC | Client selbst (Präfix + Interface-ID) | Router Advertisement (Option RDNSS) |
| 0 | 1 | SLAAC + stateless DHCPv6 | Client selbst | DHCPv6-Server |
| 1 | – | stateful DHCPv6 | DHCPv6-Server (SARR) | DHCPv6-Server |

### Tabelle: DHCP bei IPv4 und IPv6 im Vergleich
| Merkmal | DHCPv4 | IPv6 (SLAAC / DHCPv6) |
| --- | --- | --- |
| Ports | UDP 67 (Server), 68 (Client) | UDP 547 (Server), 546 (Client) |
| Erste Kontaktaufnahme | Broadcast 255.255.255.255 | Multicast: RS an ff02::2, DHCPv6 an ff02::1:2 |
| Ablauf | DORA | RS/RA, danach SLAAC oder SARR |
| Standard-Gateway | per DHCP (Option 3) | immer per Router Advertisement, nie per DHCPv6 |
| Client erkannt an | MAC-Adresse | DUID |
| Adresse ohne Server möglich | nein (nur APIPA, nicht routbar) | ja, mit SLAAC; Link-Local fe80:: hat jedes Interface sowieso |
| Prüfung auf doppelte Adressen | ARP-Probe (optional) | Duplicate Address Detection (Pflicht) |
| Über Router hinweg | DHCP-Relay | DHCPv6-Relay |

### Befehle
- `ipconfig /all` – zeigt, ob DHCP aktiv ist, den DHCP-Server und Beginn und Ende der Lease (Windows)
- `ipconfig /release` – IPv4-Adresse freigeben (Windows)
- `ipconfig /renew` – neue IPv4-Adresse anfordern (Windows)
- `ipconfig /renew6` – IPv6-Adresse per DHCPv6 neu anfordern (Windows)
- `sudo dhclient -v eth0` – Adresse per DHCP holen und den DORA-Ablauf anzeigen (Linux)
- `ip -6 addr` – IPv6-Adressen anzeigen, auch per SLAAC gebildete (Linux)
- `ip -6 route` – zeigt das Standard-Gateway, das aus dem Router Advertisement stammt (fe80::…) (Linux)
- `Get-DhcpServerv4Lease -ScopeId 192.168.1.0` – vergebene Leases eines Bereichs anzeigen (Windows Server)

### Merksatz
IPv4: DORA über UDP 67/68. IPv6: erst das Router Advertisement fragen – das Gateway kommt immer vom Router, die Adresse per SLAAC oder per DHCPv6 (SARR).

### Prüfungsfrage
Ein PC hat die Adresse 169.254.12.7. Woran liegt das, und was prüfst du?

1. 169.254.x.x ist eine APIPA-Adresse: Der Client hat keinen DHCP-Server erreicht.
2. Prüfen: Kabel bzw. WLAN, richtiges VLAN, läuft der DHCP-Dienst, ist der Bereich voll?
3. Danach mit ipconfig /renew eine neue Adresse anfordern.

## DNS {#dns}

### Kernbegriffe
- **DNS:** Domain Name System – übersetzt Namen in IP-Adressen und umgekehrt; Port 53, meist UDP, TCP für Zonentransfers und große Antworten.
- **Namensraum:** Hierarchisch wie ein umgedrehter Baum: Root „.“ → Top-Level-Domain (de, com) → Second-Level-Domain (firma) → Subdomain (www, intranet).
- **FQDN:** Fully Qualified Domain Name – vollständiger Name bis zur Root, z. B. www.firma.de. (der Punkt am Ende steht für die Root und wird meist weggelassen).
- **Rekursive Anfrage:** Der Client fragt seinen DNS-Server und erwartet eine fertige Antwort; der Server erledigt die ganze Suche für ihn.
- **Iterative Anfrage:** Der DNS-Server fragt sich selbst durch Root-, TLD- und zuständige Server; jeder antwortet nur mit dem nächsten Hinweis („frag dort“).
- **Autoritativer Nameserver:** Server, der die Zone selbst verwaltet und verbindliche Antworten gibt; im Gegensatz zu einer Antwort aus dem Cache.
- **Zone:** Verwalteter Bereich des Namensraums, z. B. firma.de, mit allen Einträgen in einer Zonendatei oder im Active Directory; Forward-Zone (Name → IP) und Reverse-Zone (IP → Name).
- **Reverse-Zone:** Zone für die Rückwärtsauflösung mit PTR-Einträgen; das Netz wird rückwärts geschrieben, z. B. 1.168.192.in-addr.arpa für 192.168.1.0/24, bei IPv6 unter ip6.arpa.
- **Primäre und sekundäre Zone:** Auf dem primären Server wird die Zone bearbeitet; sekundäre Server halten eine schreibgeschützte Kopie für Ausfallsicherheit und Lastverteilung.
- **Zonentransfer:** Kopieren einer Zone vom primären auf den sekundären Server, komplett (AXFR) oder nur die Änderungen (IXFR), über TCP 53; nur an bekannte sekundäre Server erlauben.
- **SOA-Eintrag:** Start of Authority – erster Eintrag jeder Zone mit primärem Nameserver, Verantwortlichem, Seriennummer und den Zeiten für die sekundären Server.
- **Seriennummer:** Zahl im SOA, die bei jeder Änderung steigen muss, üblich im Format JJJJMMTTnn; nur dann holen sich die sekundären Server die neue Zone.
- **TTL:** Time to Live – wie lange eine Antwort im Cache gespeichert werden darf, in Sekunden; vor einem Umzug senken, damit Änderungen schnell überall ankommen.
- **Forwarder:** Ein DNS-Server leitet Anfragen, die er nicht selbst beantworten kann, an einen festen anderen DNS-Server weiter, z. B. an den des Providers.
- **Bedingte Weiterleitung:** Anfragen für eine bestimmte Domain gehen gezielt an einen bestimmten Server, z. B. alles für partner.de an den DNS-Server des Partners.
- **Split-DNS:** Derselbe Name liefert intern eine andere Antwort als im Internet, z. B. intern die private und extern die öffentliche IP des Webservers.
- **Dynamisches DNS-Update:** Clients und DHCP-Server tragen ihre A- und PTR-Einträge selbst ein; im Active Directory „nur sichere dynamische Updates“ zulassen.
- **hosts-Datei:** Lokale Datei mit festen Zuordnungen von Namen zu IP-Adressen; wird vor dem DNS-Server befragt, unter Windows in `C:\Windows\System32\drivers\etc\hosts`, unter Linux in `/etc/hosts`.

### Abbildung: So wird ein Name aufgelöst
![Namensauflösung: 1 Der Client stellt eine rekursive Anfrage an seinen DNS-Server. 2 bis 7 Der DNS-Server fragt iterativ: Der Root-Server verweist auf die .de-Server, der TLD-Server auf ns1.firma.de, ns1.firma.de liefert autoritativ den A-Eintrag. 8 Der DNS-Server antwortet dem Client und speichert die Antwort für die Dauer der TTL im Cache.](dns-aufloesung.svg)

### Tabelle: Wichtige Einträge
| Typ | Zweck | Beispiel |
| --- | --- | --- |
| SOA | Start der Zone: primärer Server, Verantwortlicher, Seriennummer, Zeiten | firma.de → ns1.firma.de hostmaster.firma.de 2026110501 … |
| NS | zuständige Nameserver der Zone | firma.de → ns1.firma.de, ns2.firma.de |
| A | Name → IPv4 | www → 203.0.113.10 |
| AAAA | Name → IPv6 | www → 2001:db8::10 |
| CNAME | Alias auf einen anderen Namen; daneben darf es für diesen Namen keinen weiteren Eintrag geben | intranet → server01.firma.de |
| MX | Mailserver der Domain mit Priorität – kleinere Zahl wird zuerst genommen | firma.de → 10 mail1.firma.de, 20 mail2.firma.de |
| PTR | IP → Name (Reverse) | 10.113.0.203.in-addr.arpa → www.firma.de |
| TXT | freier Text, z. B. SPF, DKIM, DMARC oder Nachweis der Domain für Cloud-Dienste | v=spf1 mx include:spf.provider.de -all |
| SRV | Dienst mit Port und Server; das Active Directory findet so seine Domänencontroller | _ldap._tcp.ad.firma.de → 0 100 389 dc01.ad.firma.de |
| CAA | welche CAs Zertifikate für die Domain ausstellen dürfen | firma.de → 0 issue "letsencrypt.org" |

### Tabelle: Der SOA-Eintrag Feld für Feld
| Feld | Bedeutung | Beispielwert |
| --- | --- | --- |
| MNAME | primärer Nameserver der Zone | ns1.firma.de. |
| RNAME | E-Mail des Verantwortlichen, das @ wird durch einen Punkt ersetzt | hostmaster.firma.de. = hostmaster@firma.de |
| Serial | Seriennummer, muss bei jeder Änderung steigen | 2026110501 (5. 11. 2026, 1. Änderung) |
| Refresh | so oft fragt der sekundäre Server, ob es eine neue Seriennummer gibt | 3600 s (1 Stunde) |
| Retry | so lange wartet er nach einem gescheiterten Refresh bis zum nächsten Versuch | 900 s (15 Minuten) |
| Expire | so lange beantwortet er noch Anfragen, wenn der primäre Server nicht erreichbar ist; danach gilt die Zone als ungültig | 1209600 s (2 Wochen) |
| Minimum | TTL für negative Antworten („diesen Namen gibt es nicht“) | 3600 s (1 Stunde) |

### Tabelle: Beispiel einer Zone firma.de
| Name | TTL | Typ | Wert |
| --- | --- | --- | --- |
| @ | 3600 | SOA | ns1.firma.de. hostmaster.firma.de. 2026110501 3600 900 1209600 3600 |
| @ | 3600 | NS | ns1.firma.de. |
| @ | 3600 | NS | ns2.firma.de. |
| @ | 3600 | MX | 10 mail.firma.de. |
| @ | 3600 | A | 203.0.113.10 |
| www | 3600 | CNAME | firma.de. |
| mail | 3600 | A | 203.0.113.25 |
| ns1 | 3600 | A | 203.0.113.2 |
| ns2 | 3600 | A | 198.51.100.2 |
| @ | 3600 | TXT | "v=spf1 mx -all" |

### Tabelle: Zonenarten im Überblick
| Art | Beschreibung | Typischer Einsatz |
| --- | --- | --- |
| Primär | bearbeitbare Originalzone | Hauptserver der eigenen Domain |
| Sekundär | schreibgeschützte Kopie per Zonentransfer | zweiter Nameserver für Ausfallsicherheit |
| Active-Directory-integriert | Zone liegt im AD und wird mit den Domänencontrollern repliziert; jeder DC kann ändern, sichere Updates möglich | interne Windows-Domäne |
| Stub-Zone | enthält nur SOA, NS und die Adressen der Nameserver einer anderen Zone | immer aktuell wissen, welcher Server für eine Partnerdomäne zuständig ist |
| Reverse-Zone | PTR-Einträge für ein IP-Netz | Rückwärtsauflösung, Mailserver, Protokolle |

### Befehle
- `nslookup www.beispiel.de` – Namen auflösen (Windows/Linux)
- `nslookup -type=SOA firma.de` – SOA-Eintrag mit Seriennummer anzeigen
- `Resolve-DnsName firma.de -Type MX` – bestimmten Eintrag abfragen (PowerShell)
- `dig firma.de MX` – Eintrag abfragen (Linux)
- `dig @ns1.firma.de www.firma.de` – gezielt einen bestimmten Nameserver fragen, am Cache vorbei
- `dig +trace www.firma.de` – Auflösung Schritt für Schritt von der Root an verfolgen (Linux)
- `dig -x 203.0.113.10` – Rückwärtsauflösung (PTR) testen (Linux)
- `ipconfig /displaydns` – Inhalt des lokalen DNS-Caches anzeigen (Windows)
- `ipconfig /flushdns` – lokalen DNS-Cache leeren (Windows)
- `ipconfig /registerdns` – eigene Einträge beim DNS-Server neu registrieren (Windows)

### Merksatz
A für Adresse, PTR für Rückwärts, MX für Mail, CNAME für Spitznamen. Ändern heißt immer: Seriennummer im SOA hochzählen.

### Prüfungsfrage
Ein Benutzer erreicht intranet.firma.de nicht, ein ping auf die IP-Adresse 192.168.10.20 funktioniert aber. Wie gehst du vor?

1. Da die IP erreichbar ist, liegt das Problem bei der Namensauflösung, nicht im Netzwerk.
2. Mit ipconfig /all prüfen, welcher DNS-Server eingetragen ist – im Firmennetz muss das der interne DNS-Server sein (z. B. der Domänencontroller), kein öffentlicher wie 8.8.8.8.
3. Mit nslookup intranet.firma.de testen, ob und was der DNS-Server antwortet; zum Vergleich gezielt einen zweiten DNS-Server fragen.
4. Lokale Einflüsse ausschließen: hosts-Datei prüfen, Cache mit ipconfig /flushdns leeren.
5. Auf dem DNS-Server prüfen, ob der A- bzw. CNAME-Eintrag existiert und stimmt; fehlt er, anlegen und bei sekundären Servern auf die Replikation bzw. die Seriennummer achten.

## NAT {#nat}

### Kernbegriffe
- **NAT:** Network Address Translation – setzt private in öffentliche IP-Adressen um.
- **PAT / NAT-Overload:** Viele private Clients teilen sich eine öffentliche IP, unterschieden über Ports – der Standard im Heimrouter.
- **Portweiterleitung (DNAT):** Leitet eingehende Verbindungen auf einem Port an einen internen Server weiter.
- **NAT-Tabelle:** Merkt sich, welche interne Adresse und welcher Port zu welcher Verbindung gehört.

### Tabelle: Beispiel PAT
| Intern | Nach NAT (öffentlich) | Ziel |
| --- | --- | --- |
| 192.168.1.10:51000 | 198.51.100.7:40001 | 93.184.216.34:443 |
| 192.168.1.11:51000 | 198.51.100.7:40002 | 93.184.216.34:443 |

### Merksatz
Raus geht's automatisch (PAT), rein nur mit Portweiterleitung.

### Prüfungsfrage
Ein Webserver im LAN (192.168.1.50) soll aus dem Internet per HTTPS erreichbar sein. Was richtest du am Router ein?

1. Portweiterleitung: eingehend TCP 443 auf 192.168.1.50:443.
2. Firewall-Regel, die genau diesen Verkehr erlaubt.
3. Besser: Server in eine DMZ stellen, damit ein kompromittierter Server nicht direkt im LAN steht.

## VPN {#vpn}

### Kernbegriffe
- **VPN:** Verschlüsselter Tunnel über ein unsicheres Netz wie das Internet.
- **Site-to-Site:** Verbindet zwei Standorte dauerhaft über ihre Router oder Firewalls.
- **Client-to-Site (Remote Access):** Einzelne Geräte verbinden sich ins Firmennetz, z. B. im Homeoffice.
- **Split Tunneling:** Nur Firmenverkehr läuft durch den Tunnel, Internetverkehr direkt.

### Abbildung: Site-to-Site und Remote Access
![Oben Site-to-Site: LAN A, Firewall A als VPN-Gateway, verschlüsselter IPsec-Tunnel durch das Internet, Firewall B, LAN B. Außen stehen die öffentlichen IP-Adressen der Firewalls, innen das private Paket verschlüsselt verpackt. Unten Remote Access: Ein Notebook mit VPN-Client baut einen Tunnel zur Firewall der Firma auf und erreicht das Firmennetz; beim Split Tunneling geht Internetverkehr direkt zu Webseiten, beim Full Tunnel läuft alles durch die Firma.](vpn-arten.svg)

### Tabelle: VPN-Protokolle
| Protokoll | Ports | Eigenschaften |
| --- | --- | --- |
| IPsec (IKEv2) | UDP 500, 4500 | Standard für Site-to-Site, in vielen Geräten eingebaut |
| OpenVPN | UDP/TCP 1194 | flexibel, nutzt TLS |
| WireGuard | UDP 51820 | schlank, schnell, moderne Kryptografie |
| SSL-VPN | TCP 443 | läuft über HTTPS, gut durch Firewalls |

### Merksatz
Ein VPN schützt den Transportweg – nicht ein unsicheres Endgerät.

## SSH {#ssh}

### Kernbegriffe
- **SSH (Secure Shell):** Verschlüsseltes Protokoll für die Fernverwaltung von Servern und Netzwerkgeräten über TCP 22; ersetzt das unverschlüsselte Telnet.
- **Host-Key:** Schlüsselpaar des Servers, mit dem er sich bei jeder Verbindung ausweist; der Client merkt sich den Fingerabdruck in der Datei known_hosts.
- **known_hosts:** Liste der Server, denen der Client schon einmal vertraut hat; ändert sich der Host-Key, warnt SSH deutlich vor einem möglichen Angriff.
- **Public-Key-Authentifizierung:** Anmeldung mit Schlüsselpaar statt Passwort – der öffentliche Schlüssel liegt auf dem Server in authorized_keys, der private bleibt beim Benutzer.
- **authorized_keys:** Datei ~/.ssh/authorized_keys auf dem Server mit den öffentlichen Schlüsseln, die sich als dieser Benutzer anmelden dürfen.
- **Ed25519:** Heute empfohlener Schlüsseltyp für SSH: kurz, schnell und sicher; RSA nur noch mit mindestens 3072 Bit.
- **Passphrase:** Passwort, das den privaten Schlüssel auf der Festplatte verschlüsselt; wird der Schlüssel gestohlen, ist er ohne Passphrase nutzlos.
- **ssh-agent:** Hält entsperrte private Schlüssel im Arbeitsspeicher, damit man die Passphrase nicht bei jeder Verbindung eingeben muss.
- **SFTP und SCP:** Dateiübertragung über eine SSH-Verbindung; SFTP ist das heute empfohlene Verfahren und nicht mit FTPS (FTP über TLS) zu verwechseln.
- **SSH-Tunnel (Port-Weiterleitung):** Leitet andere Verbindungen verschlüsselt durch SSH, z. B. mit -L einen entfernten Dienst auf einen lokalen Port.
- **Jump Host (Bastion):** Zentraler, gut abgesicherter Server, über den Admins per SSH ins interne Netz gelangen, z. B. mit ssh -J.
- **sshd_config:** Konfigurationsdatei des SSH-Servers unter /etc/ssh/; hier wird z. B. die Anmeldung als root oder mit Passwort abgeschaltet.

### Abbildung: Ablauf einer SSH-Verbindung
![Ablauf einer SSH-Verbindung: 1 TCP-Verbindung auf Port 22 und Aushandeln der Verfahren; 2 Schlüsselaustausch per Diffie-Hellman, danach ist alles verschlüsselt; 3 der Server weist sich mit seinem Host-Key aus, der Client vergleicht den Fingerabdruck mit known_hosts; 4 der Benutzer meldet sich an, bei Schlüsselanmeldung signiert der Client mit seinem privaten Schlüssel und der Server prüft mit authorized_keys; 5 verschlüsselte Sitzung für Shell, SFTP oder Tunnel.](ssh-ablauf.svg)

### Tabelle: SSH-Server absichern (sshd_config)
| Einstellung | Wirkung |
| --- | --- |
| PasswordAuthentication no | nur noch Anmeldung per Schlüssel – Passwortraten läuft ins Leere |
| PermitRootLogin no | keine direkte Anmeldung als root; Admins melden sich persönlich an und nutzen sudo |
| AllowUsers bzw. AllowGroups | nur bestimmte Benutzer oder Gruppen dürfen sich überhaupt anmelden |
| MaxAuthTries 3 | wenige Versuche pro Verbindung |
| Port nur aus dem Verwaltungsnetz oder per VPN erreichbar | SSH nie offen ins Internet, wenn es sich vermeiden lässt |
| Zusätzlich fail2ban | sperrt IP-Adressen nach mehreren Fehlversuchen per Firewall |

### Tabelle: Fernzugriff im Vergleich
| Protokoll | Port | Verschlüsselt | Einsatz |
| --- | --- | --- | --- |
| Telnet | TCP 23 | nein – Passwort im Klartext | nur noch alte Geräte, möglichst abschalten |
| SSH | TCP 22 | ja | Linux-Server, Switches, Router, Firewalls; auch Windows hat einen eingebauten OpenSSH-Client und -Server |
| RDP | TCP 3389 | ja (TLS) | grafischer Fernzugriff auf Windows; nie direkt ins Internet, nur per VPN oder Gateway |
| WinRM / PowerShell Remoting | TCP 5985 (HTTP), 5986 (HTTPS) | ja | Windows-Server per PowerShell verwalten |

### Befehle
- `ssh-keygen -t ed25519 -C "max@notebook"` – Schlüsselpaar erzeugen (mit Passphrase)
- `ssh-copy-id admin@server01` – eigenen öffentlichen Schlüssel in authorized_keys des Servers eintragen (Linux)
- `ssh admin@server01` – verbinden; `-p 2222` für einen anderen Port
- `ssh -L 8080:intranet:80 admin@jumphost` – lokalen Port 8080 durch den Tunnel auf intranet:80 weiterleiten
- `ssh -J admin@jumphost admin@server01` – über einen Jump Host verbinden
- `scp bericht.pdf admin@server01:/tmp/` – Datei per SSH kopieren
- `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` – Fingerabdruck des Host-Keys auf dem Server anzeigen, um ihn beim ersten Verbinden zu vergleichen
- `sudo sshd -t` – sshd_config vor dem Neustart auf Fehler prüfen

### Merksatz
Der Host-Key beweist den Server, der Benutzerschlüssel beweist den Benutzer. Der private Schlüssel bleibt immer beim Besitzer – auf den Server kommt nur der öffentliche.

### Prüfungsfrage
Ein Linux-Server soll künftig nur noch per SSH-Schlüssel erreichbar sein. Beschreibe die Schritte.

1. Auf dem eigenen Rechner ein Schlüsselpaar erzeugen: ssh-keygen -t ed25519, mit Passphrase.
2. Den öffentlichen Schlüssel auf den Server bringen: ssh-copy-id benutzer@server (landet in ~/.ssh/authorized_keys).
3. In einer zweiten Sitzung testen, ob die Anmeldung per Schlüssel klappt – die erste Sitzung offen lassen, um sich nicht auszusperren.
4. In /etc/ssh/sshd_config PasswordAuthentication no und PermitRootLogin no setzen, mit sshd -t prüfen und den Dienst neu laden.
5. Optional: Zugriff per Firewall auf das Verwaltungsnetz beschränken und fail2ban einrichten.

## Proxy {#proxy}

### Kernbegriffe
- **Forward Proxy:** Stellvertreter der Clients ins Internet; filtert Inhalte, protokolliert, cacht.
- **Reverse Proxy:** Steht vor Servern; übernimmt TLS, verteilt Last, schützt die Server dahinter.
- **Transparenter Proxy:** Clients merken nichts, der Verkehr wird umgeleitet.
- **Caching:** Häufig abgerufene Inhalte werden zwischengespeichert und schneller ausgeliefert.

### Abbildung: Forward und Reverse Proxy
![Oben: drei Clients gehen über einen Forward Proxy, der filtert, protokolliert und cacht, ins Internet; die Webseiten sehen nur den Proxy. Unten: Nutzer aus dem Internet erreichen einen Reverse Proxy, der TLS übernimmt, die Last verteilt und als Web Application Firewall schützt, und dahinter drei Webserver.](proxy-forward-reverse.svg)

### Tabelle: Forward und Reverse Proxy
| | Forward Proxy | Reverse Proxy |
| --- | --- | --- |
| Steht vor | den Clients | den Servern |
| Zweck | Filtern, Protokollieren, Cachen | TLS, Lastverteilung, Schutz |
| Beispiele | Squid | nginx, Caddy, Traefik |

### Merksatz
Forward schützt die Nutzer, Reverse schützt die Server.

## Network Access Control (NAC) {#nac}

### Kernbegriffe
- **NAC:** Regelt, welches Gerät überhaupt ins Netz darf und in welches Netz es kommt. Ohne NAC reicht es, ein Kabel in eine freie Netzwerkdose zu stecken.
- **IEEE 802.1X:** Standard für portbasierte Zugangskontrolle im LAN und WLAN. Der Switchport bleibt gesperrt, bis sich das Gerät erfolgreich angemeldet hat.
- **Supplicant:** Software auf dem Endgerät, die sich anmeldet (in Windows, macOS und Linux eingebaut).
- **Authenticator:** Switch oder Access Point. Er reicht die Anmeldung weiter und gibt den Port frei oder nicht – er entscheidet nicht selbst.
- **Authentication Server:** Meist ein RADIUS-Server, z. B. Windows NPS, FreeRADIUS oder eine NAC-Lösung. Prüft die Anmeldedaten, oft gegen Active Directory, und meldet das Ergebnis samt VLAN zurück.
- **EAP:** Extensible Authentication Protocol – das Anmeldeverfahren innerhalb von 802.1X. Zwischen Gerät und Switch läuft es als EAPoL (EAP over LAN), zwischen Switch und Server in RADIUS verpackt.
- **Dynamische VLAN-Zuweisung:** Der RADIUS-Server sagt dem Switch, in welches VLAN der Port kommt – Mitarbeiter, Gäste oder Quarantäne – egal an welcher Dose das Gerät steckt.
- **MAB (MAC Authentication Bypass):** Für Geräte ohne 802.1X wie Drucker oder Telefone: Die MAC-Adresse dient als Anmeldung. Leicht zu fälschen, daher solche Geräte in eigene, eingeschränkte VLANs.
- **Posture-Prüfung:** Erweiterte NAC-Lösungen prüfen zusätzlich den Zustand des Geräts: Updates, Virenschutz, Verschlüsselung. Wer nicht passt, landet im Quarantäne-VLAN, bis er nachgebessert hat.
- **WPA2/WPA3-Enterprise:** WLAN mit 802.1X – jeder meldet sich mit eigenem Konto oder Zertifikat an statt mit einem gemeinsamen WLAN-Passwort.

### Abbildung: Anmeldung mit 802.1X
![Endgerät meldet sich über Switch oder Access Point beim RADIUS-Server an; danach Freigabe ins Mitarbeiter-, Quarantäne- oder Gäste-VLAN oder Port bleibt gesperrt](nac-8021x.svg)

### Tabelle: Häufige EAP-Verfahren
| Verfahren | Anmeldung mit | Sicherheit | Hinweis |
| --- | --- | --- | --- |
| EAP-TLS | Zertifikat auf Gerät und Server | sehr hoch | braucht eine PKI, z. B. Active Directory Certificate Services |
| PEAP (MSCHAPv2) | Benutzername und Passwort im TLS-Tunnel | mittel | einfach einzuführen; Server-Zertifikat auf den Clients prüfen lassen |
| EAP-TTLS | verschiedene Verfahren im TLS-Tunnel | mittel bis hoch | verbreitet bei Nicht-Windows-Geräten |
| MAB | MAC-Adresse | niedrig | nur als Notlösung für Geräte ohne 802.1X |

### Befehle
- `netsh lan show interfaces` – Status der 802.1X-Anmeldung am kabelgebundenen Anschluss (Windows; Dienst „Automatische Konfiguration (verkabelt)“ muss laufen)
- `netsh wlan show interfaces` – WLAN-Verbindung mit Authentifizierungsverfahren (Windows)
- `show authentication sessions` – angemeldete Geräte je Port auf einem Cisco-Switch

### Merksatz
Erst ausweisen, dann ins Netz: 802.1X macht jeden Switchport zur Pforte – Supplicant fragt, Authenticator reicht weiter, RADIUS entscheidet.

### Prüfungsfrage
Ein Besucher steckt seinen Laptop in eine Netzwerkdose im Besprechungsraum und ist sofort im Firmennetz. Was schlägst du vor?

1. 802.1X auf allen Switchports aktivieren; Firmengeräte melden sich per Zertifikat an (EAP-TLS).
2. RADIUS-Server (z. B. NPS) mit Anbindung an Active Directory einrichten.
3. Unbekannte Geräte kommen ins Gäste-VLAN mit reinem Internetzugang oder bleiben gesperrt.
4. Drucker und Telefone per MAB in eigene, eingeschränkte VLANs.
5. Ungenutzte Ports zusätzlich deaktivieren.

## Verzeichnisdienste (AD/LDAP) {#verzeichnisdienste}

### Kernbegriffe
- **Active Directory (AD DS):** Verzeichnisdienst von Microsoft für Benutzer, Gruppen, Computer und Richtlinien.
- **Domänencontroller:** Server, der AD bereitstellt und Anmeldungen prüft; für Ausfallsicherheit mindestens zwei.
- **OU:** Organisationseinheit – Ordner im AD, um Objekte zu strukturieren und Richtlinien zuzuweisen.
- **Gruppenrichtlinie (GPO):** Zentrale Einstellungen für Benutzer und Computer, z. B. Laufwerkszuordnungen.
- **LDAP:** Protokoll für Abfragen an Verzeichnisdienste (Port 389, verschlüsselt LDAPS 636).
- **Kerberos:** Anmeldeprotokoll in AD-Domänen (Port 88), arbeitet mit Tickets.

### Abbildung: Active Directory und AGDLP
![Links: Eine Gesamtstruktur enthält die Domäne ad.firma.de mit zwei Domänencontrollern und der OU Hamburg mit den Unter-OUs Benutzer, Computer und Gruppen; eine Gruppenrichtlinie ist mit einer OU verknüpft und wirkt auf alle Objekte darin. Rechts die Kette AGDLP: Account mmuster ist Mitglied der globalen Gruppe GG_Vertrieb, diese ist Mitglied der domänenlokalen Gruppe DL_Share_Vertrieb_Lesen, und nur diese bekommt die Berechtigung Lesen auf die Freigabe des Vertriebs.](ad-struktur.svg)

### Tabelle: Gruppenbereiche
| Bereich | Mitglieder aus | Einsatz |
| --- | --- | --- |
| Global | eigene Domäne | Benutzer nach Rolle bündeln (z. B. GG_Vertrieb) |
| Domänenlokal | beliebigen Domänen | Rechte auf Ressourcen vergeben (z. B. DL_Share_Vertrieb_Lesen) |
| Universal | ganzer Forest | Gruppen über mehrere Domänen |

### Befehle
- `Get-ADUser -Identity mmuster -Properties *` – Benutzer mit allen Eigenschaften (PowerShell)
- `New-ADUser -Name "Max Muster" -SamAccountName mmuster` – Benutzer anlegen (PowerShell)
- `gpupdate /force` – Gruppenrichtlinien sofort neu anwenden
- `gpresult /r` – angewendete Richtlinien anzeigen

### Merksatz
AGDLP: Benutzer in globale Gruppen, globale Gruppen in domänenlokale Gruppen, Rechte nur an domänenlokale Gruppen.

## Häufige Fehler
- APIPA-Adresse (169.254.x.x) für ein Kabelproblem halten, statt DHCP zu prüfen.
- Bei IPv6 das Standard-Gateway im DHCPv6-Server eintragen wollen – das kommt immer aus dem Router Advertisement.
- Einen zweiten DHCP-Server (z. B. einen mitgebrachten Router) im Netz übersehen; DHCP Snooping auf den Switches verhindert solche fremden Server.
- PTR- und A-Eintrag verwechseln.
- Die Seriennummer im SOA nach einer Änderung nicht erhöhen – die sekundären Server behalten dann die alte Zone.
- Clients in einer AD-Domäne einen öffentlichen DNS-Server wie 8.8.8.8 eintragen – dann finden sie die Domänencontroller nicht mehr.
- Vor einem Serverumzug die TTL nicht senken und sich wundern, dass Clients noch stundenlang die alte IP nutzen.
- Einen CNAME auf die Domain selbst (firma.de) setzen – dort stehen schon SOA und NS, ein CNAME darf nicht neben anderen Einträgen stehen.
- Annehmen, NAT sei eine Firewall – es versteckt Adressen, prüft aber keine Inhalte.
- Rechte direkt an Benutzer statt an Gruppen vergeben.
- Nur einen Domänencontroller betreiben.
- 802.1X einführen und Drucker, Telefone oder Kameras vergessen – sie brauchen MAB oder Zertifikate.
- Bei SSH die Frage nach dem Fingerabdruck ungeprüft mit „yes“ beantworten – genau dort würde ein Angreifer in der Mitte auffallen.
- Die Passwortanmeldung per SSH abschalten, bevor der Schlüssel-Login getestet ist, und sich damit selbst aussperren.
- Bei Anmeldeproblemen im AD die Uhrzeit vergessen: mehr als 5 Minuten Abweichung und Kerberos scheitert.

## Links
- [Microsoft Learn – Windows Server](https://learn.microsoft.com/de-de/windows-server/) – DHCP, DNS und Active Directory
- [Elektronik-Kompendium](https://www.elektronik-kompendium.de/) – Netzwerkdienste verständlich erklärt

## Zusatz: Kerberos – so funktioniert die Anmeldung im Active Directory {#kerberos}
typ: text
zu: verzeichnisdienste, sicherheit.authentifizierung

Warum man sich morgens einmal anmeldet und danach ohne erneutes Passwort auf Dateifreigaben, Drucker und Intranet zugreifen kann – und warum eine falsche Uhrzeit die Anmeldung verhindert.

Kerberos ist das Standard-Anmeldeverfahren im Active Directory. Es arbeitet mit Tickets wie bei einem Festival: Am Eingang zeigt man einmal den Ausweis und bekommt ein Eintrittsband (Ticket Granting Ticket). Für jede Bühne holt man sich mit diesem Band eine Karte (Service-Ticket). Das Passwort selbst wird dabei nie über das Netz geschickt.

### Der Ablauf in sechs Schritten
![Client meldet sich beim Authentication Service an, erhält ein TGT, fordert damit beim Ticket Granting Service ein Service-Ticket an und zeigt es dem Server](kerberos-ablauf.svg)
1. **Anmeldung (AS-REQ):** Der Client schickt den Benutzernamen und einen Zeitstempel, verschlüsselt mit einem Schlüssel aus dem Passwort-Hash, an den Authentication Service des Domänencontrollers.
2. **TGT (AS-REP):** Kann der DC den Zeitstempel mit dem gespeicherten Hash entschlüsseln, ist das Passwort richtig. Er schickt ein Ticket Granting Ticket – verschlüsselt mit dem Schlüssel des Kontos krbtgt, den nur die DCs kennen – und einen Sitzungsschlüssel.
3. **Service-Ticket anfordern (TGS-REQ):** Öffnet der Benutzer `\\fileserver\daten`, schickt der Client das TGT und den Namen des gewünschten Dienstes (SPN, z. B. cifs/fileserver) an den Ticket Granting Service.
4. **Service-Ticket (TGS-REP):** Der DC stellt ein Ticket für genau diesen Dienst aus, verschlüsselt mit dem Schlüssel des Dienst- bzw. Computerkontos. Darin stehen Benutzer und Gruppenmitgliedschaften (PAC).
5. **Ticket vorzeigen (AP-REQ):** Der Client gibt das Service-Ticket an den Fileserver weiter.
6. **Zugriff:** Der Fileserver entschlüsselt das Ticket mit seinem eigenen Schlüssel – ohne den DC zu fragen – und prüft anhand der Gruppen die Freigabe- und NTFS-Rechte.

### Die Bausteine
| Begriff | Bedeutung |
| --- | --- |
| KDC (Key Distribution Center) | Dienst auf jedem Domänencontroller, besteht aus Authentication Service und Ticket Granting Service; Port 88 |
| TGT (Ticket Granting Ticket) | „Eintrittsband“ nach der Anmeldung; im AD standardmäßig 10 Stunden gültig, bis zu 7 Tage verlängerbar |
| Service-Ticket | Ticket für genau einen Dienst auf einem Server |
| SPN (Service Principal Name) | eindeutiger Name eines Dienstes, z. B. HTTP/intranet.ad.firma.de; verknüpft den Dienst mit seinem Konto |
| krbtgt | verstecktes Konto, mit dessen Schlüssel alle TGTs verschlüsselt sind |
| PAC | Teil des Tickets mit Benutzer-SID und Gruppenmitgliedschaften |
| Realm | Kerberos-Bereich – im AD der Domänenname in Großbuchstaben, z. B. AD.FIRMA.DE |

### Kerberos und NTLM
| Merkmal | Kerberos | NTLM |
| --- | --- | --- |
| Verfahren | Tickets vom DC | Challenge-Response direkt mit dem Server |
| Gegenseitige Prüfung | ja – auch der Server weist sich aus | nein |
| Belastung des DC | gering, Tickets werden wiederverwendet | jede Anmeldung wird beim DC geprüft |
| Sicherheit | höher, Standard im AD | älter, anfällig z. B. für Pass-the-Hash |
| Wann verwendet | Zugriff über DNS-Namen innerhalb der Domäne | Fallback: Zugriff per IP-Adresse, Arbeitsgruppe, fehlender SPN |

Microsoft baut NTLM schrittweise ab. Wo es noch auftaucht, lohnt sich die Suche nach der Ursache.

### Checkliste: Häufige Fehlerquellen
- **Uhrzeit:** Weicht die Uhr eines Geräts mehr als 5 Minuten vom DC ab, scheitert die Anmeldung. Zeitquelle prüfen mit `w32tm /query /status`.
- **DNS:** Clients finden den DC über DNS-Einträge (SRV-Records). Falscher DNS-Server am Client = keine Anmeldung.
- **Zugriff per IP statt Name:** Für eine IP-Adresse gibt es meist keinen SPN – Windows fällt auf NTLM zurück oder der Zugriff scheitert.
- **SPN fehlt oder ist doppelt:** Dienste wie SQL Server oder Webanwendungen unter einem Dienstkonto brauchen einen passenden SPN; doppelte SPNs findet `setspn -X`.
- **Alte Tickets:** Nach einer Änderung der Gruppenmitgliedschaft gilt sie erst mit neuem Ticket – abmelden und wieder anmelden oder `klist purge`.

### Angriffe und Schutz
| Angriff | Was passiert | Schutz |
| --- | --- | --- |
| Kerberoasting | Angreifer fordert Service-Tickets an und knackt offline das Passwort des Dienstkontos | lange, zufällige Passwörter; gruppenverwaltete Dienstkonten (gMSA); AES statt RC4 |
| AS-REP-Roasting | Konten ohne Vorab-Authentifizierung liefern knackbare Antworten | Option „Keine Kerberos-Vorauthentifizierung“ nie aktivieren |
| Pass-the-Ticket | gestohlenes Ticket wird auf einem anderen Rechner verwendet | Admin-Konten nur auf gesicherten Admin-Rechnern nutzen, Gruppe „Protected Users“ |
| Golden Ticket | mit dem krbtgt-Schlüssel stellt der Angreifer sich selbst beliebige TGTs aus | DCs besonders schützen; nach einem Vorfall das krbtgt-Passwort zweimal zurücksetzen |
| Silver Ticket | mit dem Schlüssel eines Dienstkontos werden Tickets für diesen Dienst gefälscht | starke Dienstkonto-Passwörter, gMSA, Überwachung |

### Nützliche Befehle
- `klist` – vorhandene Kerberos-Tickets des angemeldeten Benutzers anzeigen; `klist purge` löscht sie
- `setspn -L dienstkonto` – SPNs eines Kontos anzeigen; `setspn -X` sucht doppelte SPNs
- `w32tm /query /status` – Zeitquelle und Abweichung prüfen
- `nltest /dsgetdc:ad.firma.de` – welcher Domänencontroller wird gefunden?

## Zusatz: DNS in der Praxis {#dns-praxis}
typ: text
zu: dns, verzeichnisdienste, sicherheit.tls-https, sicherheit.bedrohungen

Wie DNS mit dem Active Directory und der E-Mail zusammenhängt, welche Angriffe es auf DNS gibt und wie man einen Umzug ohne Ausfall plant.

„It's always DNS“ ist unter Admins ein geflügeltes Wort: Wenn Anmeldungen hängen, E-Mails abgelehnt werden oder eine Webseite nur bei manchen Nutzern nicht lädt, steckt erstaunlich oft ein falscher, fehlender oder noch zwischengespeicherter DNS-Eintrag dahinter.

### DNS und Active Directory
Ohne funktionierendes DNS gibt es kein Active Directory. Clients finden ihren Domänencontroller nicht über einen festen Namen, sondern über SRV-Einträge in der Zone, z. B. _ldap._tcp.dc._msdcs.ad.firma.de. Die Domänencontroller registrieren diese Einträge selbst beim Start (Dienst Netlogon).
- Alle Clients und Server der Domäne nutzen ausschließlich die internen DNS-Server (meist die Domänencontroller).
- Anfragen für das Internet beantworten die DCs über Forwarder (z. B. zum Provider) oder über die Root-Hints selbst.
- Jeder DC trägt als ersten DNS-Server einen anderen DC ein und sich selbst als zweiten – so startet er auch, wenn er allein nicht weiterkommt.
- AD-integrierte Zonen werden mit dem Active Directory repliziert; einen separaten Zonentransfer braucht es dann nicht.
- Für die interne Domäne einen eigenen Namen nutzen, der einem selbst gehört, z. B. ad.firma.de – .local ist eigentlich für Multicast-DNS (z. B. Apple Bonjour) reserviert und kann damit kollidieren.

### Tabelle: DNS-Einträge für E-Mail
| Eintrag | Typ | Wofür |
| --- | --- | --- |
| MX | MX | Welcher Server nimmt E-Mails für die Domain an? |
| SPF | TXT an der Domain | Welche Server dürfen E-Mails im Namen der Domain versenden? z. B. v=spf1 mx include:spf.protection.outlook.com -all |
| DKIM | TXT unter selector._domainkey | Öffentlicher Schlüssel, mit dem Empfänger die Signatur ausgehender E-Mails prüfen |
| DMARC | TXT unter _dmarc | Was soll der Empfänger tun, wenn SPF und DKIM nicht passen (none, quarantine, reject), und wohin gehen Berichte? |
| PTR | PTR beim Provider | Rückwärtsauflösung der Mailserver-IP; ohne passenden PTR lehnen viele Empfänger E-Mails ab |

Große Anbieter wie Google und Yahoo verlangen seit 2024 von Massenversendern SPF, DKIM und DMARC – ohne diese Einträge landen E-Mails schnell im Spam.

### Angriffe auf DNS und Schutz
- **Cache Poisoning (Spoofing):** Ein Angreifer schiebt einem DNS-Server gefälschte Antworten unter, die dann im Cache landen. Schutz: zufällige Quellports und Abfrage-IDs, DNSSEC.
- **DNS-Tunneling:** Daten werden in DNS-Anfragen versteckt, um Firewalls zu umgehen oder Daten abfließen zu lassen. Schutz: Clients nur interne DNS-Server erlauben, auffällig lange oder viele Anfragen überwachen.
- **Amplification (DDoS):** Kleine Anfragen mit gefälschter Absender-IP an offene Resolver erzeugen große Antworten an das Opfer. Schutz: eigene rekursive Server nie offen ins Internet stellen.
- **Verwaiste Einträge (Subdomain-Übernahme):** Ein CNAME zeigt noch auf einen gelöschten Cloud-Dienst; ein Angreifer legt dort einen Dienst mit demselben Namen an und kontrolliert die Subdomain. Schutz: Einträge beim Abbau von Diensten mit entfernen.
- **Domain-Hijacking:** Jemand übernimmt das Konto beim Registrar und ändert die Nameserver. Schutz: MFA beim Registrar, Registrar-Lock.

### Sicherheitsfunktionen
- **DNSSEC:** Signiert die Einträge einer Zone; ein validierender Resolver erkennt gefälschte Antworten. Verschlüsselt nichts – es geht nur um Echtheit.
- **DNS over TLS (DoT, TCP 853) und DNS over HTTPS (DoH, TCP 443):** Verschlüsseln den Weg zwischen Client und Resolver, damit niemand im Netz mitliest. Im Unternehmen zweischneidig: Browser mit eigenem DoH umgehen den internen DNS-Server und dessen Filter – deshalb oft per Richtlinie gesteuert.
- **DNS-Filter:** Bekannte Schadsoftware- und Phishing-Domains werden am DNS-Server blockiert, z. B. über Response Policy Zones oder Dienste wie Pi-hole im Kleinen.

### Checkliste: DNS-Umzug ohne Ausfall
- Einige Tage vorher die TTL der betroffenen Einträge auf z. B. 300 Sekunden senken – mindestens so lange vorher, wie die alte TTL war.
- Neuen Server vorbereiten und gezielt testen, z. B. mit einem Eintrag in der hosts-Datei oder dig @neuer-server.
- Eintrag ändern, Seriennummer erhöhen und prüfen, ob alle Nameserver die neue Antwort liefern.
- Alten Server noch einige Zeit weiterlaufen lassen, bis sicher kein Client mehr die alte Adresse im Cache hat.
- Danach die TTL wieder auf den normalen Wert (z. B. 3600 Sekunden) anheben.

### Checkliste: Fehlersuche bei DNS
- Funktioniert die Verbindung per IP-Adresse? Dann ist es ein Namensproblem.
- Welcher DNS-Server ist eingetragen (ipconfig /all, resolvectl status)?
- Was liefern verschiedene Server für denselben Namen (nslookup name server, dig @server name)?
- Ist der Eintrag im Cache noch alt (ipconfig /displaydns)? Cache leeren und TTL beachten.
- Steht etwas in der hosts-Datei?
- Stimmt die Seriennummer auf allen Nameservern überein?
- Bei AD-Problemen: Sind die SRV-Einträge der DCs vorhanden (dcdiag /test:dns)?

## Zusatz: DHCP Schritt für Schritt {#ablauf-dhcp}
ablauf: dhcp.json
zu: dhcp

Der DORA-Ablauf im eigenen Netz mit der Lease-Tabelle des Servers – und wie ein DHCP-Relay Clients in anderen Subnetzen versorgt.

## Zusatz: DNS-Auflösung Schritt für Schritt {#ablauf-dns}
ablauf: dns.json
zu: dns

Vom leeren Cache bis zur Antwort: rekursive und iterative Anfragen, Verweise über Root- und TLD-Server und was die TTL im Cache bewirkt.

## Zusatz: NAT und PAT Schritt für Schritt {#ablauf-nat}
ablauf: nat.json
zu: nat, netzwerkgrundlagen.routing, sicherheit.firewall

Wie der Router private Adressen nach außen übersetzt, Antworten über die NAT-Tabelle zurückfindet und eingehende Verbindungen per Portweiterleitung zustellt.
