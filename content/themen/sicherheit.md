---
titel: IT-Sicherheit & Datenschutz
---

Wie du Informationen schützt: Schutzziele, Vorgehen nach BSI, Schutzbedarf bestimmen, Verschlüsselung, Firewalls – und was die DSGVO von dir verlangt.

## Schutzziele (CIA) {#schutzziele}

### Kernbegriffe
- **Vertraulichkeit:** Nur Berechtigte können Informationen lesen.
- **Integrität:** Daten sind vollständig und unverändert.
- **Verfügbarkeit:** Systeme und Daten sind nutzbar, wenn sie gebraucht werden.
- **Erweitert:** Authentizität (echt) und Verbindlichkeit (nicht abstreitbar).

### Abbildung: Die drei Schutzziele
![Dreieck mit den Schutzzielen Vertraulichkeit (nur Befugte können lesen; bedroht durch Abhören und Datendiebstahl; Maßnahmen Verschlüsselung, Berechtigungen, MFA), Integrität (Daten korrekt und unverändert; bedroht durch Manipulation und Fehler; Maßnahmen Hashwerte, Signaturen, Protokollierung) und Verfügbarkeit (nutzbar, wenn gebraucht; bedroht durch Ausfall, DDoS, Ransomware; Maßnahmen Redundanz, USV, Backup). Dazu die erweiterten Schutzziele Authentizität und Nichtabstreitbarkeit.](schutzziele-cia.svg)

### Tabelle: Bedrohungen und Maßnahmen
| Schutzziel | Bedrohung | Maßnahme |
| --- | --- | --- |
| Vertraulichkeit | Abhören, Datendiebstahl | Verschlüsselung, Zugriffsrechte |
| Integrität | Manipulation | Hashwerte, digitale Signatur |
| Verfügbarkeit | Hardwareausfall, DDoS | Redundanz, Backup, USV |

### Merksatz
CIA – Confidentiality, Integrity, Availability. Nicht der Geheimdienst.

### Prüfungsfrage
Ein Mitarbeiter ändert unbemerkt Preise in der Datenbank. Welches Schutzziel ist verletzt?

1. Die Daten sind nicht mehr korrekt und unverändert.
2. Antwort: Integrität.

## BSI-Grundschutz {#bsi-grundschutz}

### Kernbegriffe
- **BSI:** Bundesamt für Sicherheit in der Informationstechnik.
- **IT-Grundschutz-Kompendium:** Sammlung von Bausteinen mit Anforderungen, z. B. SYS.2.1 Allgemeiner Client.
- **Absicherung:** Basis-, Standard- oder Kern-Absicherung – je nach Ausgangslage und Ziel.

### Tabelle: BSI-Standards
| Standard | Inhalt |
| --- | --- |
| 200-1 | Managementsysteme für Informationssicherheit (ISMS) |
| 200-2 | IT-Grundschutz-Methodik |
| 200-3 | Risikoanalyse |
| 200-4 | Business Continuity Management |

### Merksatz
Erst Struktur erfassen, dann Schutzbedarf feststellen, dann Bausteine modellieren und prüfen.

## Schutzbedarfsanalyse {#schutzbedarf}

### Kernbegriffe
- **Kategorien:** normal, hoch, sehr hoch – je Schutzziel.
- **Maximumprinzip:** Ein System erbt den höchsten Schutzbedarf der Anwendungen darauf.
- **Kumulationseffekt:** Viele kleine Schäden zusammen ergeben einen höheren Schutzbedarf.
- **Verteilungseffekt:** Läuft eine Anwendung redundant, kann der Bedarf je System sinken.

### Abbildung: Maximumprinzip, Kumulation und Verteilung
![Drei Anwendungen laufen auf dem Server SRV01: Intranet mit normalem, Zeiterfassung mit hohem und Lohnbuchhaltung mit sehr hohem Schutzbedarf bei der Vertraulichkeit. Der Server erbt das Maximum: sehr hoch. Ausnahmen: Beim Kumulationseffekt ergeben viele normale Anwendungen zusammen einen hohen Bedarf, beim Verteilungseffekt sinkt der Bedarf je Server, wenn eine Anwendung redundant auf zwei Servern läuft. Der Schutzbedarf vererbt sich von Anwendungen auf IT-Systeme, Räume und Verbindungen.](schutzbedarf-maximum.svg)

### Tabelle: Reihenfolge
| Schritt | Objekt |
| --- | --- |
| 1 | Geschäftsprozesse und Anwendungen |
| 2 | IT-Systeme |
| 3 | Räume und Gebäude |
| 4 | Kommunikationsverbindungen |

### Merksatz
Der Schutzbedarf vererbt sich von der Anwendung nach unten auf Server, Räume und Leitungen.

### Prüfungsfrage
Auf einem Server laufen die Lohnbuchhaltung (Vertraulichkeit: hoch) und das Intranet (normal). Welchen Schutzbedarf hat der Server bei Vertraulichkeit?

1. Der Server erbt den Bedarf aller Anwendungen.
2. Maximumprinzip: der höchste Wert zählt.
3. Antwort: hoch.

## Bedrohungen & Angriffe {#bedrohungen}

### Kernbegriffe
- **Malware:** Oberbegriff für Schadsoftware – Virus, Wurm, Trojaner, Ransomware, Spyware.
- **Ransomware:** Verschlüsselt Daten und erpresst Lösegeld; oft der teuerste Angriff für Unternehmen.
- **Phishing:** Gefälschte Nachrichten, um Zugangsdaten zu stehlen oder Schadsoftware zu verbreiten; gezielt auf Personen zugeschnitten heißt es Spear-Phishing.
- **Social Engineering:** Manipulation von Menschen, z. B. falscher Anruf „vom IT-Support“.
- **Schadensszenarien (BSI):** Verstoß gegen Gesetze und Verträge, Beeinträchtigung des informationellen Selbstbestimmungsrechts, der persönlichen Unversehrtheit, der Aufgabenerfüllung, negative Innen- oder Außenwirkung, finanzielle Auswirkungen.

### Abbildung: Ablauf eines Ransomware-Angriffs
![Sechs Schritte eines Ransomware-Angriffs mit jeweils passender Gegenmaßnahme: 1 Erstzugang über Phishing, offenes RDP oder eine VPN-Lücke – Awareness, MFA, Patchen. 2 Ausführen von Schadcode – Makros sperren, EDR. 3 Rechte ausweiten auf Admin-Konten – Tiering, LAPS, keine Admin-Rechte im Alltag. 4 Ausbreiten auf Server und Domänencontroller – Segmentierung und Firewall zwischen Zonen. 5 Backups löschen – Offline- oder unveränderliche Backups. 6 Verschlüsseln und erpressen, oft nach Datendiebstahl – Notfallplan und Wiederanlauf üben.](ransomware-kette.svg)

### Tabelle: Angriffe und Gegenmaßnahmen
| Angriff | Funktionsweise | Gegenmaßnahme |
| --- | --- | --- |
| Phishing | gefälschte Mail oder Webseite | Schulung, MFA, Mailfilter |
| Ransomware | Verschlüsselung von Daten | Offline-Backups, Patches, Rechte beschränken |
| Brute Force | massenhaftes Ausprobieren von Passwörtern | lange Passwörter, Kontosperre, MFA |
| DDoS | Überlastung durch viele Anfragen | Provider-Schutz, Lastverteilung |
| Man-in-the-Middle | Mitlesen zwischen zwei Parteien | Verschlüsselung (TLS, VPN), Zertifikate prüfen |
| SQL-Injection | eingeschleuster SQL-Code über Eingabefelder | vorbereitete Abfragen, Eingaben prüfen |

### Merksatz
Der Mensch ist das häufigste Einfallstor – Schulung gehört genauso dazu wie Technik.

## Verschlüsselung {#verschluesselung}

### Kernbegriffe
- **Symmetrisch:** Ein gemeinsamer Schlüssel zum Ver- und Entschlüsseln, z. B. AES. Schnell, aber der Schlüssel muss sicher ausgetauscht werden.
- **Asymmetrisch:** Schlüsselpaar aus öffentlichem und privatem Schlüssel, z. B. RSA (nach den Erfindern Rivest, Shamir und Adleman) oder ECC. Löst den Schlüsselaustausch, ist aber langsam.
- **Hybrid:** Asymmetrisch einen Sitzungsschlüssel austauschen, dann symmetrisch weiter – so arbeitet TLS.
- **Hash:** Einweg-Prüfsumme, z. B. SHA-256. Keine Verschlüsselung.

### Befehle
- `ssh-keygen -t ed25519` – SSH-Schlüsselpaar erzeugen
- `Get-FileHash setup.iso -Algorithm SHA256` – Prüfsumme einer Datei (PowerShell)
- `sha256sum setup.iso` – Prüfsumme einer Datei (Linux)

### Merksatz
Verschlüsseln mit dem öffentlichen Schlüssel des Empfängers – signieren mit dem eigenen privaten.

### Prüfungsfrage
Wie viele Schlüssel brauchen 10 Personen, die paarweise sicher kommunizieren wollen?

1. Symmetrisch: n · (n − 1) / 2 = 10 · 9 / 2 = 45 Schlüssel
2. Asymmetrisch: 2 · n = 20 Schlüssel (je ein Paar)

## Digitale Signatur und Zertifikate (PKI) {#pki}

### Kernbegriffe
- **Digitale Signatur:** Der Absender bildet einen Hash der Daten und verschlüsselt ihn mit seinem privaten Schlüssel; jeder kann mit dem öffentlichen Schlüssel prüfen, dass die Daten echt und unverändert sind.
- **Zertifikat (X.509):** Elektronischer Ausweis, der einen öffentlichen Schlüssel an einen Namen bindet, z. B. www.example.de – bestätigt durch die Signatur einer Zertifizierungsstelle.
- **CA (Certificate Authority):** Zertifizierungsstelle, die Identitäten prüft und Zertifikate ausstellt und signiert, z. B. Let's Encrypt, D-Trust oder die eigene Firmen-CA.
- **PKI (Public Key Infrastructure):** Alles, was zum Ausstellen, Verteilen, Prüfen und Sperren von Zertifikaten gehört: CAs, Richtlinien, Sperrlisten, Verzeichnisse.
- **Root-CA:** Oberste Zertifizierungsstelle; ihr Zertifikat signiert sie selbst. Es ist vertrauenswürdig, weil es im Vertrauensspeicher (Trust Store) von Betriebssystem oder Browser liegt.
- **Zwischenzertifikat (Intermediate):** Von der Root-CA signiert, stellt die eigentlichen Serverzertifikate aus; so bleibt der Root-Schlüssel offline und geschützt.
- **Zertifikatskette:** Serverzertifikat → Zwischenzertifikat → Root-CA; der Client prüft jede Stufe bis zu einer Root, der er vertraut.
- **SAN (Subject Alternative Name):** Liste der Namen, für die ein Zertifikat gilt; Browser prüfen nur noch den SAN, nicht den Common Name.
- **Wildcard-Zertifikat:** Gilt für alle Namen einer Ebene, z. B. *.example.de für shop.example.de – aber nicht für example.de selbst und nicht für a.b.example.de.
- **CSR (Certificate Signing Request):** Zertifikatsantrag mit öffentlichem Schlüssel und Namen, den man bei der CA einreicht; der private Schlüssel bleibt dabei auf dem eigenen Server.
- **Selbstsigniertes Zertifikat:** Vom Besitzer selbst unterschrieben, ohne CA; verschlüsselt zwar, aber niemand bestätigt die Identität – der Browser warnt.
- **Sperrung (CRL und OCSP):** Ein kompromittiertes Zertifikat wird vor Ablauf gesperrt; Clients prüfen das über eine Sperrliste (CRL) oder eine Online-Abfrage (OCSP).
- **DV, OV, EV:** Prüfstufen beim Ausstellen – Domain Validation prüft nur die Kontrolle über die Domain, Organization und Extended Validation zusätzlich das Unternehmen.
- **ACME:** Protokoll zum automatischen Ausstellen und Erneuern von Zertifikaten, bekannt durch Let's Encrypt und den Client certbot.

### Abbildung: Zertifikatskette und Inhalt eines Zertifikats
![Zertifikatskette: Die Root-CA im Vertrauensspeicher signiert das Zwischenzertifikat, das Zwischenzertifikat signiert das Serverzertifikat für www.example.de. Der Browser prüft von unten nach oben. Daneben die Felder eines X.509-Zertifikats: Subject, SAN, Issuer, Gültigkeit, öffentlicher Schlüssel, Verwendungszweck, Seriennummer, Sperrinformationen und die Signatur der CA. Der private Schlüssel steht nicht im Zertifikat.](pki-kette.svg)

### Tabelle: Dateiformate für Zertifikate
| Format | Endung | Inhalt |
| --- | --- | --- |
| PEM | .pem, .crt, .cer, .key | Text (Base64) zwischen -----BEGIN …----- und -----END …-----; üblich unter Linux, Apache, nginx |
| DER | .der, .cer | dasselbe binär; oft unter Windows |
| PKCS#12 (Public Key Cryptography Standards) | .pfx, .p12 | Zertifikat **mit** privatem Schlüssel und Kette, mit Passwort geschützt – zum Importieren unter Windows und IIS |
| CSR | .csr | Zertifikatsantrag an die CA |

### Tabelle: Typische Zertifikatswarnungen im Browser
| Meldung (Chrome) | Ursache | Lösung |
| --- | --- | --- |
| NET::ERR_CERT_DATE_INVALID | Zertifikat abgelaufen – oder die Uhrzeit am Client ist falsch | erneuern bzw. Uhrzeit und NTP (Network Time Protocol) prüfen |
| NET::ERR_CERT_COMMON_NAME_INVALID | Der aufgerufene Name steht nicht im SAN, z. B. Aufruf per IP-Adresse | Zertifikat mit allen benötigten Namen ausstellen |
| NET::ERR_CERT_AUTHORITY_INVALID | selbstsigniert, unbekannte Firmen-CA oder fehlendes Zwischenzertifikat | Kette vollständig ausliefern bzw. Root-CA per Gruppenrichtlinie verteilen |
| NET::ERR_CERT_REVOKED | Zertifikat wurde gesperrt | neues Zertifikat mit neuem Schlüssel ausstellen |

### Befehle
- `openssl x509 -in server.crt -noout -text` – Inhalt eines Zertifikats anzeigen: Aussteller, SAN, Gültigkeit (Linux)
- `openssl req -new -newkey rsa:3072 -nodes -keyout server.key -out server.csr` – privaten Schlüssel und CSR erzeugen
- `openssl s_client -connect www.example.de:443 -servername www.example.de` – Zertifikatskette eines Servers abrufen und prüfen
- `certbot --nginx -d example.de -d www.example.de` – Let's-Encrypt-Zertifikat holen und automatisch erneuern lassen
- `certlm.msc` – Zertifikatsspeicher des Computers öffnen (Windows)

### Merksatz
Das Zertifikat ist öffentlich, der private Schlüssel ist geheim. Vertrauen entsteht durch die Kette bis zur Root-CA im Trust Store.

### Prüfungsfrage
Beim Aufruf des neuen Intranet-Servers meldet der Browser „NET::ERR_CERT_AUTHORITY_INVALID“. Nenne mögliche Ursachen und eine dauerhafte Lösung.

1. Das Zertifikat ist selbstsigniert, stammt von der internen Firmen-CA, die der Client nicht kennt, oder der Server liefert das Zwischenzertifikat nicht mit.
2. Kette prüfen, z. B. mit openssl s_client oder in den Zertifikatsdetails des Browsers.
3. Dauerhaft: Zertifikat von der Firmen-CA (z. B. Active Directory Certificate Services) ausstellen, die Root-CA per Gruppenrichtlinie in den Vertrauensspeicher aller Clients verteilen und die vollständige Kette auf dem Server einrichten.
4. Die Warnung nicht durch „Trotzdem fortfahren“ wegklicken lassen – Nutzer gewöhnen sich sonst daran und erkennen echte Angriffe nicht mehr.

## TLS und HTTPS {#tls-https}

### Kernbegriffe
- **TLS (Transport Layer Security):** Protokoll, das eine Verbindung verschlüsselt, vor Veränderung schützt und die Identität des Servers per Zertifikat nachweist; Nachfolger von SSL (Secure Sockets Layer).
- **HTTPS:** HTTP über TLS, Standard-Port TCP 443; die Adresszeile zeigt ein Schloss.
- **TLS-Handshake:** Aushandeln von Version und Verfahren, Prüfen des Zertifikats und Vereinbaren eines gemeinsamen Sitzungsschlüssels, bevor Nutzdaten fließen.
- **Cipher Suite:** Kombination der Verfahren einer Verbindung, z. B. TLS_AES_128_GCM_SHA256 – symmetrische Verschlüsselung und Hash; der Schlüsselaustausch läuft bei TLS 1.3 immer per (EC)DHE – Diffie-Hellman mit Einmalschlüsseln, die nach der Sitzung verworfen werden.
- **Forward Secrecy:** Für jede Sitzung wird ein neuer Schlüssel per Diffie-Hellman vereinbart; wird der private Serverschlüssel später gestohlen, bleiben alte Mitschnitte trotzdem geheim.
- **SNI (Server Name Indication):** Der Client nennt im ClientHello den gewünschten Hostnamen, damit ein Server mit einer IP-Adresse mehrere Webseiten mit eigenen Zertifikaten anbieten kann.
- **HSTS:** HTTP-Header, mit dem eine Webseite dem Browser vorschreibt, sie für eine bestimmte Zeit nur noch per HTTPS aufzurufen – schützt vor dem Herabstufen auf HTTP.
- **TLS-Terminierung:** Ein Reverse Proxy oder Load Balancer entschlüsselt TLS und leitet die Anfrage an die Server dahinter weiter; das Zertifikat liegt dann auf dem Proxy.
- **mTLS (gegenseitiges TLS):** Auch der Client weist sich mit einem Zertifikat aus, z. B. bei Schnittstellen zwischen Servern oder bei EAP-TLS im WLAN.
- **HTTP/3 und QUIC:** Neueste HTTP-Version; läuft über UDP 443 mit fest eingebautem TLS 1.3 statt über TCP.

### Abbildung: TLS-1.3-Handshake bei HTTPS
![TLS-1.3-Handshake: 1 ClientHello mit TLS-Versionen, Cipher Suites, Key Share und Servername; 2 ServerHello mit Key Share, danach verschlüsselt Zertifikat, CertificateVerify und Finished; 3 Finished vom Client nach Prüfung der Zertifikatskette; 4 symmetrisch verschlüsselte HTTP-Daten. Asymmetrische Verfahren dienen dem Schlüsselaustausch und der Identität, symmetrische den Daten – hybride Verschlüsselung. TLS 1.3 braucht nur einen Hin- und Rückweg und bietet immer Forward Secrecy.](tls13-handshake.svg)

### Tabelle: Was TLS schützt – und was nicht
| Schutzziel | Wie TLS es erreicht | Grenze |
| --- | --- | --- |
| Vertraulichkeit | symmetrische Verschlüsselung, z. B. AES-GCM | Hostname (SNI) und Ziel-IP sind für das Netz sichtbar |
| Integrität | jede Nachricht ist mit einem Prüfwert gesichert | schützt nur auf dem Transportweg, nicht die Daten auf dem Server |
| Authentizität | Serverzertifikat aus einer vertrauenswürdigen Kette | das Schloss sagt nur „Domain stimmt“, nicht „Seite ist seriös“ – auch Phishing-Seiten haben Zertifikate |

### Tabelle: TLS- und SSL-Versionen
| Version | Status |
| --- | --- |
| SSL 2.0 und 3.0 | unsicher, abschalten |
| TLS 1.0 und 1.1 | veraltet, seit 2021 offiziell abgekündigt (Internet-Standard RFC 8996) |
| TLS 1.2 | noch zulässig mit sicheren Cipher Suites (ECDHE, AES-GCM) |
| TLS 1.3 | aktueller Standard (2018): schneller, nur noch sichere Verfahren, Forward Secrecy immer an |

### Befehle
- `curl -vI https://www.example.de` – Handshake, TLS-Version und Zertifikat im Kurzüberblick anzeigen
- `openssl s_client -connect www.example.de:443 -tls1_3` – prüfen, ob der Server TLS 1.3 kann
- `Test-NetConnection www.example.de -Port 443` – prüfen, ob Port 443 überhaupt erreichbar ist (PowerShell)

### Merksatz
TLS ist hybride Verschlüsselung: asymmetrisch für Schlüsselaustausch und Identität, symmetrisch für die Daten. Das Schloss bedeutet „verschlüsselt und richtige Domain“ – nicht „vertrauenswürdig“.

### Prüfungsfrage
Erkläre, warum bei HTTPS sowohl asymmetrische als auch symmetrische Verschlüsselung eingesetzt wird.

1. Asymmetrische Verfahren lösen das Problem des Schlüsselaustauschs und erlauben dem Server, sich per Zertifikat auszuweisen – sie sind aber rechenaufwendig.
2. Im Handshake vereinbaren Client und Server deshalb per Diffie-Hellman einen gemeinsamen Sitzungsschlüssel; der Server beweist mit seinem privaten Schlüssel, dass ihm das Zertifikat gehört.
3. Die eigentlichen Daten werden mit diesem Sitzungsschlüssel symmetrisch (z. B. AES) verschlüsselt, weil das sehr schnell ist.
4. Die Kombination heißt hybride Verschlüsselung und vereint die Vorteile beider Verfahren.

## Authentifizierung {#authentifizierung}

### Kernbegriffe
- **Authentifizierung:** Nachweis, wer jemand ist (Anmeldung).
- **Autorisierung:** Festlegen, was jemand darf (Rechte).
- **Faktoren:** Wissen (Passwort, PIN), Besitz (Smartphone, Token, Chipkarte), Sein (Fingerabdruck, Gesicht).
- **MFA:** Mehr-Faktor-Authentifizierung – mindestens zwei verschiedene Faktoren.
- **Single Sign-On (SSO):** Einmal anmelden, mehrere Dienste nutzen, z. B. über Entra ID oder Kerberos.
- **Salt:** Zufallswert, der vor dem Hashen an das Passwort gehängt wird – verhindert Rainbow-Table-Angriffe.

### Abbildung: Faktoren und MFA
![Die drei Faktorkategorien Wissen (Passwort, PIN, Sicherheitsfrage), Besitz (Smartphone mit App, FIDO2-Schlüssel, Smartcard) und Inhärenz (Fingerabdruck, Gesicht, Iris). MFA braucht mindestens zwei verschiedene Kategorien: Passwort plus App-Code und Smartcard plus PIN sind MFA, Passwort plus Sicherheitsfrage ist zweimal Wissen und damit keine MFA. Phishing-resistent sind FIDO2/Passkeys und Smartcards.](auth-faktoren.svg)

### Tabelle: Gute Passwortrichtlinie
| Regel | Begründung |
| --- | --- |
| lieber lang als kompliziert, z. B. Passphrase | Länge erhöht die Rechenzeit für Angreifer am stärksten |
| kein Zwangswechsel ohne Anlass | führt zu schwachen, vorhersehbaren Mustern |
| sofort wechseln bei Verdacht auf Kompromittierung | gestohlene Passwörter werden schnell genutzt |
| für jeden Dienst ein eigenes Passwort, Passwortmanager nutzen | ein Datenleck öffnet sonst alle Konten |
| MFA für alle wichtigen Konten | ein gestohlenes Passwort reicht dann nicht |

### Merksatz
Zwei Passwörter sind keine MFA – es braucht zwei verschiedene Arten von Faktoren.

## Zero Trust & Least Privilege {#zero-trust}

### Kernbegriffe
- **Least Privilege (minimale Rechte):** Jeder Benutzer, Dienst und jedes Programm bekommt nur die Rechte, die er für seine Aufgabe braucht – und nur so lange wie nötig.
- **Need-to-know:** Zugriff auf Informationen nur, wenn man sie für die Arbeit tatsächlich benötigt – auch innerhalb derselben Abteilung.
- **Funktionstrennung (Separation of Duties):** Kritische Vorgänge werden auf mehrere Personen verteilt, z. B. beantragt einer die Berechtigung, ein anderer genehmigt sie.
- **Perimeter-Modell:** Klassischer Ansatz „Burg und Graben“: Eine Firewall schützt nach außen, wer im internen Netz ist, gilt als vertrauenswürdig. Ein Angreifer im Netz kann sich dann frei bewegen.
- **Zero Trust:** „Never trust, always verify“: Kein Gerät und kein Benutzer gilt automatisch als vertrauenswürdig, auch nicht im eigenen Netz. Jeder Zugriff wird einzeln anhand von Identität, Gerätezustand und Kontext geprüft (Modell z. B. nach NIST SP 800-207, einer Veröffentlichung der US-Normungsbehörde NIST).
- **Assume Breach:** Grundhaltung von Zero Trust: Man geht davon aus, dass ein Angreifer bereits im Netz ist, und begrenzt den möglichen Schaden.
- **Mikrosegmentierung:** Das Netz wird in sehr kleine Bereiche geteilt, oft bis auf einzelne Server oder Anwendungen. Ein befallener Rechner erreicht dann nur wenige andere Systeme.
- **ZTNA (Zero Trust Network Access):** Ersatz für das klassische VPN: Statt Zugang zum ganzen Netz gibt es nur Zugang zu einzelnen freigegebenen Anwendungen, nach Prüfung von Nutzer und Gerät.
- **Just-in-Time (JIT):** Administrative Rechte werden nur bei Bedarf und für kurze Zeit vergeben und danach automatisch wieder entzogen.
- **PAM (Privileged Access Management):** Werkzeuge zur Verwaltung von Admin-Konten: Passwort-Tresor, Freigabe auf Antrag, Aufzeichnung von Admin-Sitzungen.

### Abbildung: Perimeter und Zero Trust
![Links ein internes Netz hinter einer Firewall, in dem alles vertraut wird; rechts wird jeder Zugriff von Nutzer und Gerät einzeln geprüft, bevor er eine Anwendung erreicht](zero-trust.svg)

### Tabelle: Perimeter-Modell und Zero Trust
| Merkmal | Perimeter (Burg und Graben) | Zero Trust |
| --- | --- | --- |
| Vertrauen | wer im Netz ist, ist vertrauenswürdig | niemand ohne Prüfung |
| Prüfung | einmal am Eingang (Firewall, VPN) | bei jedem Zugriff, laufend |
| Zugriff | aufs ganze Netz | nur auf die einzelne Anwendung |
| Kriterien | meist nur Benutzer und Passwort | Identität mit MFA, Gerätezustand, Ort, Uhrzeit, Verhalten |
| Angreifer im Netz | kann sich frei bewegen | erreicht nur wenig, wird schneller bemerkt |
| Passt zu | Büro mit festen Arbeitsplätzen | Cloud, Homeoffice, mobile Geräte |

### Tabelle: Least Privilege in der Praxis
| Bereich | Umsetzung |
| --- | --- |
| Benutzer | keine lokalen Admin-Rechte im Alltag; Rechte über Gruppen und Rollen |
| Administratoren | getrenntes Admin-Konto, nur für Admin-Aufgaben; Domänen-Admin nur auf Domänencontrollern |
| Dienste | eigene Dienstkonten mit minimalen Rechten statt Admin- oder Systemkonto |
| Dateien | Freigaben nach Abteilung und Aufgabe, Schreibrechte nur wo nötig |
| Cloud | Rollen mit eng begrenzten Berechtigungen, keine Dauer-Schlüssel mit Vollzugriff |
| Kontrolle | Rechte regelmäßig prüfen (Rezertifizierung), beim Austritt sofort entziehen |

### Merksatz
Least Privilege: so wenig Rechte wie möglich, so kurz wie möglich. Zero Trust: nie vertrauen, immer prüfen – bei jedem Zugriff.

### Prüfungsfrage
Ein Administrator arbeitet den ganzen Tag mit seinem Domänen-Admin-Konto, liest damit auch E-Mails und surft im Internet. Bewerte das und schlage Maßnahmen vor.

1. Risiko: Öffnet er einen bösartigen Anhang, läuft die Schadsoftware mit Domänen-Admin-Rechten – das ganze Active Directory ist gefährdet.
2. Least Privilege: getrenntes Alltagskonto ohne Admin-Rechte für E-Mail und Internet.
3. Eigenes Admin-Konto nur für Verwaltungsaufgaben, geschützt mit MFA, genutzt von einem gesicherten Admin-Rechner.
4. Domänen-Admin-Rechte nur bei Bedarf und befristet vergeben (Just-in-Time), Admin-Anmeldungen protokollieren.

## Nutzungsrichtlinien und Berechtigungskonzept {#berechtigungskonzept}

### Kernbegriffe
- **IT-Nutzungsrichtlinie:** Verbindliche Regeln für alle Beschäftigten zur Nutzung der IT: private Nutzung von E-Mail und Internet, Umgang mit Passwörtern, Software-Installation, mobile Geräte und USB-Sticks, KI-Dienste, Homeoffice, Meldung von Vorfällen, Kontrollen und Folgen bei Verstößen.
- **Einführung einer Richtlinie:** Mit Datenschutz und Betriebsrat abstimmen (bei Kontrollmöglichkeiten mitbestimmungspflichtig), von der Geschäftsleitung in Kraft setzen, bekannt machen, Kenntnisnahme bestätigen lassen, schulen und regelmäßig überarbeiten.
- **Berechtigungskonzept:** Dokument, das festlegt, wer auf welche Systeme, Daten und Funktionen wie zugreifen darf – und wie Rechte beantragt, genehmigt, vergeben, überprüft und entzogen werden.
- **Rollenbasierte Vergabe (RBAC):** Rechte hängen an Rollen wie „Buchhaltung“ oder „Vertrieb“, Personen bekommen Rollen. Im Active Directory über Gruppen umgesetzt (AGDLP).
- **Need-to-know und Least Privilege:** Jeder bekommt nur die Rechte, die er für seine Aufgabe braucht.
- **Funktionstrennung:** Unverträgliche Rechte nicht bei einer Person, z. B. Rechnungen anlegen und Zahlungen freigeben.
- **Berechtigungsmatrix:** Tabelle aus Rollen und Ressourcen mit der jeweiligen Rechtestufe (keine, lesen, ändern, vollzugriff).
- **Antrags- und Genehmigungsweg:** Rechte nur auf Antrag, genehmigt von der verantwortlichen Stelle (Daten- oder Abteilungsverantwortliche), umgesetzt von der IT, dokumentiert im Ticket.
- **Rezertifizierung:** Verantwortliche bestätigen regelmäßig (z. B. halbjährlich), dass die vergebenen Rechte noch nötig sind.
- **Joiner, Mover, Leaver:** Eintritt, Wechsel und Austritt sind die kritischen Momente: Rechte am ersten Tag bereit, beim Wechsel alte Rechte entziehen, beim Austritt sofort sperren.

### Abbildung: Rollen statt Einzelrechte
![Benutzer werden Rollen zugeordnet, Rollen Berechtigungsgruppen, und nur diese erhalten Rechte auf Ressourcen](berechtigung-rollen.svg)

### Tabelle: Beispiel einer Berechtigungsmatrix
| Ressource | Buchhaltung | Vertrieb | Geschäftsleitung | IT-Administration |
| --- | --- | --- | --- | --- |
| Finanzen-Ordner | ändern | keine | lesen | keine (nur im Notfall, protokolliert) |
| Kunden-Ordner | lesen | ändern | lesen | keine |
| Warenwirtschaft | Rechnungen buchen | Angebote erstellen | Auswertungen | Administration |
| Personalakte | keine | keine | lesen | keine |

### Merksatz
Rechte an Rollen, Rollen an Personen – beantragt, genehmigt, dokumentiert und regelmäßig überprüft.

### Prüfungsfrage
Ein Unternehmen vergibt Rechte auf Zuruf direkt an einzelne Benutzer. Ein Mitarbeiter, der vom Vertrieb in die Buchhaltung gewechselt ist, hat noch Zugriff auf alle Kundendaten. Was schlägst du vor?

1. Berechtigungskonzept erstellen: Rollen je Abteilung, Berechtigungsmatrix, Antrags- und Genehmigungsweg.
2. Umsetzung im AD nach AGDLP: Benutzer in globale Rollengruppen, diese in domänenlokale Berechtigungsgruppen, nur diese erhalten Rechte.
3. Prozess für Eintritt, Wechsel und Austritt mit der Personalabteilung abstimmen – alte Rechte beim Wechsel automatisch entziehen.
4. Bestehende Rechte bereinigen und künftig regelmäßig rezertifizieren lassen.

## Firewall {#firewall}

### Kernbegriffe
- **Paketfilter:** Prüft IP-Adressen und Ports (Schicht 3/4), jedes Paket einzeln.
- **Stateful Inspection:** Merkt sich Verbindungen und lässt Antworten automatisch zu.
- **Application-Level-Gateway:** Prüft Inhalte auf Anwendungsebene (Schicht 7), z. B. als Proxy.
- **DMZ:** Eigenes Netz für öffentlich erreichbare Server zwischen Internet und LAN.

### Tabelle: Beispiel-Regelwerk
| Nr. | Quelle | Ziel | Port | Aktion |
| --- | --- | --- | --- | --- |
| 1 | Internet | Webserver (DMZ) | 443/TCP | erlauben |
| 2 | LAN | Webserver (DMZ) | 443/TCP | erlauben |
| 3 | LAN | Internet | 80, 443/TCP | erlauben |
| 4 | beliebig | beliebig | beliebig | verwerfen |

### Befehle
- `netsh advfirewall show allprofiles` – Status der Windows-Firewall
- `sudo ufw status verbose` – Regeln der Linux-Firewall (ufw)

### Merksatz
Alles verbieten, was nicht ausdrücklich erlaubt ist. Regeln gelten von oben nach unten – die erste passende gewinnt.

## Risikoanalyse & Sicherheitstests {#risikoanalyse}

### Kernbegriffe
- **Risiko:** Eintrittswahrscheinlichkeit × Schadensausmaß.
- **Risikobehandlung:** Vermeiden (Tätigkeit lassen), vermindern (Maßnahmen), übertragen (z. B. Versicherung), akzeptieren (bewusst tragen).
- **Restrisiko:** Bleibt nach allen Maßnahmen übrig und muss von der Leitung bewusst akzeptiert werden.
- **Relative Sicherheit:** Absolute Sicherheit gibt es nicht – Ziel ist ein angemessenes Niveau im Verhältnis zu Kosten und Schutzbedarf.
- **Schwachstellenscan:** Automatische Suche nach bekannten Lücken, z. B. mit Greenbone/OpenVAS.
- **Penetrationstest:** Gezielter, simulierter Angriff durch Fachleute – nur mit schriftlichem Auftrag.

### Tabelle: Risikomatrix
| Wahrscheinlichkeit ↓ / Schaden → | gering | mittel | hoch |
| --- | --- | --- | --- |
| hoch | mittel | hoch | sehr hoch |
| mittel | gering | mittel | hoch |
| gering | gering | gering | mittel |

### Befehle
- `nmap -sV 192.168.1.10` – offene Ports und Dienstversionen eines eigenen Systems ermitteln (nur mit Erlaubnis!)
- `Get-HotFix` – installierte Windows-Updates anzeigen
- `sudo apt list --upgradable` – ausstehende Updates anzeigen (Linux)

### Merksatz
Scannen und testen nur im eigenen Netz oder mit schriftlicher Erlaubnis – sonst ist es strafbar.

### Prüfungsfrage
Risiko A: Ausfall des Fileservers (Wahrscheinlichkeit 2, Schaden 5). Risiko B: Phishing-Angriff (Wahrscheinlichkeit 4, Schaden 3). Welches Risiko zuerst behandeln (Skala 1–5)?

1. Risiko A: 2 · 5 = 10
2. Risiko B: 4 · 3 = 12
3. Risiko B ist höher und wird zuerst behandelt, z. B. mit Schulung und MFA.

## DSGVO {#dsgvo}

### Kernbegriffe
- **Personenbezogene Daten:** Alle Informationen, die sich einer Person zuordnen lassen – auch IP-Adressen.
- **TOM:** Technische und organisatorische Maßnahmen zum Schutz der Daten (Art. 32).
- **Ziele nach Art. 32 DSGVO:** Pseudonymisierung und Verschlüsselung, dauerhafte Vertraulichkeit, Integrität, Verfügbarkeit und Belastbarkeit der Systeme, rasche Wiederherstellung nach einem Zwischenfall sowie regelmäßige Überprüfung der Maßnahmen.
- **Technische und organisatorische Maßnahme:** Technisch ist alles, was Hard- oder Software erledigt (Verschlüsselung, Firewall, Protokollierung); organisatorisch sind Regeln und Abläufe (Richtlinien, Schulungen, Besucherregelung, Vier-Augen-Prinzip).
- **Zutrittskontrolle:** Unbefugte kommen nicht in die Räume, in denen Daten verarbeitet werden – z. B. Schließsystem, Chipkarten, Alarmanlage, Besucheranmeldung.
- **Zugangskontrolle:** Unbefugte können die Systeme nicht benutzen – z. B. Anmeldung mit Passwort und MFA, Passwortregeln, automatische Bildschirmsperre.
- **Zugriffskontrolle:** Angemeldete Benutzer sehen und ändern nur die Daten, für die sie berechtigt sind – z. B. Berechtigungskonzept, Benutzerprofile und Rollen, Verschlüsselung von Datenträgern, sichere Vernichtung.
- **Weitere Kontrollen:** Weitergabekontrolle (Daten sicher übertragen und transportieren), Eingabekontrolle (nachvollziehen, wer was geändert hat), Auftragskontrolle (Dienstleister arbeiten nur nach Weisung), Verfügbarkeitskontrolle (Schutz vor Verlust, z. B. Backup, USV) und Trennungsgebot (Daten verschiedener Zwecke getrennt verarbeiten).
- **Datenschutz vs. Datensicherheit:** Datenschutz schützt Personen, Datensicherheit schützt Daten allgemein.
- **Aufsicht in Hamburg:** Hamburgische Beauftragte für Datenschutz und Informationsfreiheit (HmbBfDI).

### Tabelle: Wichtige Regeln
| Thema | Artikel | Kurz |
| --- | --- | --- |
| Grundsätze | Art. 5 | Zweckbindung, Datenminimierung, Speicherbegrenzung u. a. |
| Auskunft | Art. 15 | Betroffene dürfen wissen, was gespeichert ist. |
| Löschung | Art. 17 | Recht auf Vergessenwerden |
| Meldepflicht | Art. 33 | Datenpanne binnen 72 Stunden an die Aufsicht melden |
| Bußgeld | Art. 83 | bis 20 Mio. € oder 4 % des Jahresumsatzes |

### Tabelle: TOM nach Kontrollarten
| Kontrolle | Frage | Beispiele |
| --- | --- | --- |
| Zutrittskontrolle | Wer kommt in den Raum? | Schließsystem, Chipkarte, Alarmanlage, Videoüberwachung, Besucheranmeldung am Empfang |
| Zugangskontrolle | Wer kann das System benutzen? | Benutzername und Passwort, Passwortregeln, MFA, Bildschirmsperre, Sperre nach Fehlversuchen |
| Zugriffskontrolle | Wer darf welche Daten sehen und ändern? | Berechtigungskonzept, Benutzerprofile und Rollen, Verschlüsselung von Datenträgern, datenschutzkonforme Vernichtung |
| Weitergabekontrolle | Sind Daten unterwegs geschützt? | VPN, TLS, verschlüsselte E-Mail, verschlossener Transport von Datenträgern |
| Eingabekontrolle | Wer hat was wann geändert? | Protokollierung, Versionierung, persönliche Konten statt Sammelkonten |
| Auftragskontrolle | Hält sich der Dienstleister an die Weisungen? | Vertrag zur Auftragsverarbeitung (AVV), Kontrollen beim Dienstleister |
| Verfügbarkeitskontrolle | Sind die Daten vor Verlust geschützt? | Backup, USV, RAID, Brandschutz, Notfallplan |
| Trennungsgebot | Werden Daten verschiedener Zwecke getrennt? | getrennte Datenbanken oder Mandanten, Test- und Produktivsystem trennen |

Achtung bei der Wortwahl: Diese acht Kontrollen stammen aus dem alten Bundesdatenschutzgesetz und sind in der Praxis weiter üblich. Das neue BDSG (§ 64) nennt den Schutz der Räume und Anlagen „Zugangskontrolle“ und die Benutzung der Systeme „Benutzerkontrolle“. In einer Aufgabe zählt deshalb, wie die Kontrollen dort beschrieben sind.

### Merksatz
So wenig Daten wie nötig, so kurz wie nötig, nur für den genannten Zweck. Zutritt zum Raum, Zugang zum System, Zugriff auf die Daten.

### Prüfungsfrage
Ordne die Maßnahmen Schlüsselkarte für den Serverraum, Passwortrichtlinie, Rollen im Warenwirtschaftssystem und Verschlüsselung von Notebook-Festplatten einer Kontrollart zu und begründe kurz.

1. Schlüsselkarte für den Serverraum → Zutrittskontrolle: verhindert, dass Unbefugte den Raum betreten.
2. Passwortrichtlinie → Zugangskontrolle: verhindert, dass Unbefugte sich am System anmelden.
3. Rollen im Warenwirtschaftssystem → Zugriffskontrolle: Angemeldete sehen nur die Daten ihrer Rolle.
4. Verschlüsselung der Festplatten → Zugriffskontrolle (bei Diebstahl kann niemand die Daten lesen); beim Transport eines Datenträgers auch Weitergabekontrolle.
5. Wenn die Aufgabe die Begriffe nach § 64 BDSG verwendet, gehört die Schlüsselkarte zur „Zugangskontrolle“ und die Passwortrichtlinie zur „Benutzerkontrolle“ – die Beschreibung in der Aufgabe gibt den Ausschlag.


## Häufige Fehler
- Zutritts-, Zugangs- und Zugriffskontrolle verwechseln: Raum – System – Daten.
- Hashing mit Verschlüsselung verwechseln – ein Hash lässt sich nicht zurückrechnen.
- Mit dem öffentlichen Schlüssel „signieren“ wollen.
- Das Zertifikat für geheim halten – geheim ist nur der private Schlüssel; das Zertifikat bekommt jeder Besucher.
- Das Schloss im Browser als Zeichen einer seriösen Seite deuten – es bestätigt nur Verschlüsselung und Domain.
- Ablaufdaten von Zertifikaten nicht überwachen – ein abgelaufenes Zertifikat legt Webseiten, VPN und Schnittstellen lahm.
- Beim Schutzbedarf das Maximumprinzip vergessen.
- Firewall-Regeln ohne Blick auf die Reihenfolge bewerten.
- Datenschutz und Datensicherheit gleichsetzen.
- Mit dem Domänen-Admin-Konto E-Mails lesen und im Internet surfen.

## Links
- [BSI](https://www.bsi.bund.de) – IT-Grundschutz-Kompendium und BSI-Standards
- [BSI TR-02102-2](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Technische-Richtlinien/TR-nach-Thema-sortiert/tr02102/tr02102_node.html) – Empfehlungen für TLS-Versionen und Verfahren
- [Qualys SSL Labs](https://www.ssllabs.com/ssltest/) – TLS-Konfiguration eines öffentlichen Servers testen
- [DSGVO-Gesetzestext](https://dsgvo-gesetz.de) – alle Artikel übersichtlich
- [Datenschutz Hamburg](https://datenschutz-hamburg.de) – zuständige Aufsichtsbehörde

## Zusatz: DSGVO aus Sicht eines IT-Admins {#dsgvo-admin}
typ: text
zu: dsgvo

Was die DSGVO im IT-Alltag konkret bedeutet – vom Benutzerkonto über Logdateien bis zur Datenpanne. Verantwortlich im Sinne der DSGVO ist das Unternehmen; die IT setzt einen großen Teil der technischen Maßnahmen um und liefert die Informationen für die Dokumentation.

Im Zweifel gilt: Datenschutzbeauftragten früh einbeziehen – lieber eine Frage zu viel als eine Meldung zu spät.

### Checkliste: Rechte und Zugriffe
Grundsatz: Jeder sieht nur, was er für seine Aufgabe braucht (Art. 5 und 32).
- Rechte über Rollen und Gruppen vergeben, nie direkt an Personen.
- Eigene Admin-Konten nutzen, getrennt vom Alltagskonto mit E-Mail und Browser.
- Eintritt, Wechsel, Austritt: Rechte am selben Tag anpassen bzw. Konto sperren.
- Rechte regelmäßig überprüfen lassen, z. B. halbjährlich durch die Fachabteilung.
- Gemeinsam genutzte Konten vermeiden – sonst ist nicht nachvollziehbar, wer was getan hat.

### Checkliste: Protokollierung
Logdateien enthalten personenbezogene Daten wie Benutzernamen und IP-Adressen.
- Zweck jeder Protokollierung festlegen, z. B. Sicherheit oder Fehlersuche.
- Speicherdauer begrenzen und Logs danach automatisch löschen.
- Zugriff auf Logs auf wenige Personen beschränken.
- Logs nicht zur Leistungs- oder Verhaltenskontrolle nutzen – dafür braucht es eine Betriebsvereinbarung (§ 87 BetrVG).
- Admin-Tätigkeiten an kritischen Systemen selbst protokollieren.

### Checkliste: Löschen und Aufbewahren
Daten dürfen nur so lange gespeichert werden, wie es für den Zweck nötig ist (Art. 5 und 17).
- Löschkonzept mit Fristen je Datenart umsetzen.
- Gesetzliche Aufbewahrungspflichten, z. B. aus Handels- und Steuerrecht, gehen der Löschung vor – dann Zugriff sperren statt löschen.
- In Backups verschwinden gelöschte Daten erst mit Ablauf der Aufbewahrungszeit; bei einer Wiederherstellung die Löschungen erneut anwenden.
- Datenträger vor Entsorgung oder Weitergabe sicher löschen oder zerstören (DIN 66399 – Norm des Deutschen Instituts für Normung), mit Nachweis.

### Checkliste: Technische Maßnahmen (TOM)
Art. 32 verlangt ein Schutzniveau, das zum Risiko passt – und eine regelmäßige Überprüfung.
- Datenträger von Notebooks und Smartphones verschlüsseln, z. B. mit BitLocker.
- Übertragungen verschlüsseln: TLS, VPN, keine unverschlüsselten Protokolle wie FTP oder Telnet.
- MFA für Fernzugriff, Cloud-Dienste und Admin-Konten.
- Updates zeitnah einspielen (Patchmanagement).
- Backups regelmäßig erstellen und die Wiederherstellung testen.
- Pseudonymisieren, wo personenbezogene Daten nicht im Klartext nötig sind, z. B. in Testsystemen.

### Checkliste: Privacy by Design und by Default
Art. 25: Datenschutz schon beim Einrichten mitdenken, datensparsame Voreinstellungen.
- Bei neuen Systemen nur die wirklich nötigen Datenfelder erfassen.
- Telemetrie und unnötige Datenübermittlungen abschalten.
- Freigaben und Teams-/SharePoint-Bereiche standardmäßig eng einstellen, nicht „für alle“.
- Echte Kundendaten nicht für Tests verwenden.

### Checkliste: Dienstleister und Cloud
Wer im Auftrag Daten verarbeitet, braucht einen Vertrag nach Art. 28.
- Auftragsverarbeitungsvertrag (AVV) mit Cloud-Anbietern, Hostern und Fernwartungsfirmen abschließen.
- Serverstandort und Übermittlung in Drittländer vor der Einführung prüfen lassen.
- Fernwartung nur nach Freigabe, zeitlich begrenzt und protokolliert.
- Neue Tools nicht einfach selbst einführen („Schatten-IT“), sondern vorher mit dem Datenschutzbeauftragten klären.

### Checkliste: Datenpanne
Beispiele: verlorenes unverschlüsseltes Notebook, Mail an den falschen Verteiler, Ransomware-Befall.
- Sofort intern melden – an Vorgesetzte und den Datenschutzbeauftragten.
- Die Meldung an die Aufsichtsbehörde muss binnen 72 Stunden nach Bekanntwerden erfolgen, wenn ein Risiko für Betroffene besteht (Art. 33).
- Bei hohem Risiko müssen auch die Betroffenen informiert werden (Art. 34).
- Vorfall immer dokumentieren – auch wenn er nicht meldepflichtig ist.
- Beweise sichern: Systeme isolieren statt sofort neu aufsetzen, Logs aufbewahren.

### Checkliste: Dokumentation und Anfragen
Die IT liefert die technischen Angaben für die Pflichtdokumentation.
- Verzeichnis von Verarbeitungstätigkeiten (Art. 30): Systeme, Datenarten, Empfänger, Löschfristen und TOM zuarbeiten.
- Bei Verarbeitungen mit hohem Risiko ist eine Datenschutz-Folgenabschätzung nötig (Art. 35), z. B. bei Videoüberwachung.
- Auskunftsanfragen (Art. 15) müssen innerhalb eines Monats beantwortet werden – die IT muss Daten einer Person aus allen Systemen zusammenstellen können.
- Vor einer Auskunft die Identität der anfragenden Person prüfen.
- Einen Datenschutzbeauftragten braucht ein Unternehmen in der Regel, sobald mindestens 20 Personen ständig mit automatisierter Verarbeitung personenbezogener Daten beschäftigt sind (§ 38 BDSG – Bundesdatenschutzgesetz).

## Zusatz: BSI IT-Grundschutz in der Praxis {#grundschutz-praxis}
typ: text
zu: bsi-grundschutz, schutzbedarf

Wie Unternehmen und Behörden mit dem IT-Grundschutz ihre Informationssicherheit aufbauen – vom ersten Schritt bis zum Zertifikat, und was sich mit Grundschutz++ ändert.

Der IT-Grundschutz des BSI ist eine Methode und ein Katalog zugleich: Die Methode beschreibt, wie man vorgeht; der Katalog (das IT-Grundschutz-Kompendium) beschreibt, was konkret zu tun ist. Für typische Systeme nimmt er einem die Risikoanalyse ab: Statt jedes Risiko einzeln zu bewerten, setzt man bewährte Standard-Anforderungen um.

### Die Bausteine des IT-Grundschutzes
| Dokument | Wofür |
| --- | --- |
| BSI-Standard 200-1 | Managementsystem für Informationssicherheit (ISMS): Rollen, Leitlinie, Verantwortung der Leitung |
| BSI-Standard 200-2 | Methodik: wie man den Grundschutz Schritt für Schritt umsetzt |
| BSI-Standard 200-3 | Risikoanalyse für alles, was über den normalen Schutzbedarf hinausgeht |
| BSI-Standard 200-4 | Business Continuity Management: Notfallvorsorge und Wiederanlauf |
| IT-Grundschutz-Kompendium | Bausteine mit konkreten Anforderungen, z. B. für Clients, Server, Netze und Räume |

### Drei Wege zur Absicherung
Der BSI-Standard 200-2 bietet drei Vorgehensweisen an. Sie unterscheiden sich darin, wie viel der Organisation betrachtet wird (Breite) und wie viele Anforderungen umgesetzt werden (Tiefe).
![Basis-Absicherung: breit, aber flach; Kern-Absicherung: schmal, aber vollständig; Standard-Absicherung: breit und vollständig](grundschutz-absicherung.svg)
- **Basis-Absicherung:** Einstieg für kleinere Organisationen. Alle Bereiche werden mit den wichtigsten Anforderungen (Basis-Anforderungen) schnell auf ein Grundniveau gebracht.
- **Kern-Absicherung:** Zuerst werden nur die besonders wichtigen Geschäftsprozesse und Werte („Kronjuwelen“) umfassend geschützt.
- **Standard-Absicherung:** Das empfohlene, vollständige Vorgehen für die ganze Organisation. Grundlage für ein Zertifikat.
- Basis- und Kern-Absicherung sind Zwischenschritte: Ziel ist am Ende die Standard-Absicherung.

### Vorgehen bei der Standard-Absicherung
![Neun Schritte: Initiierung, Organisation, Strukturanalyse, Schutzbedarfsfeststellung, Modellierung, IT-Grundschutz-Check, Risikoanalyse, Umsetzung, Aufrechterhaltung](grundschutz-vorgehen.svg)
- **Initiierung:** Die Leitung trägt die Verantwortung, beschließt eine Sicherheitsleitlinie und stellt Personal und Budget bereit.
- **Organisation:** Ein Informationssicherheitsbeauftragter (ISB) wird benannt. Der Geltungsbereich (Informationsverbund) wird festgelegt, z. B. „Standort Hamburg mit allen Clients und Servern“.
- **Strukturanalyse:** Geschäftsprozesse, Anwendungen, IT-Systeme, Räume und Netzverbindungen werden erfasst. Gleichartige Objekte werden zu Gruppen zusammengefasst, z. B. „80 Büro-Clients mit Windows 11“.
- **Schutzbedarfsfeststellung:** Für jedes Zielobjekt wird je Schutzziel normal, hoch oder sehr hoch festgelegt (Maximumprinzip, Kumulations- und Verteilungseffekt).
- **Modellierung:** Jedem Zielobjekt werden die passenden Bausteine zugeordnet, z. B. dem Dateiserver SYS.1.1 Allgemeiner Server und SYS.1.2.3 Windows Server.
- **IT-Grundschutz-Check:** Soll-Ist-Vergleich. Jede Anforderung wird bewertet: ja, teilweise, nein oder entbehrlich (mit Begründung).
- **Risikoanalyse:** Nur nötig bei hohem oder sehr hohem Schutzbedarf, bei Einsatzszenarien außerhalb der Bausteine oder wenn es für ein Objekt keinen Baustein gibt.
- **Umsetzung und Aufrechterhaltung:** Fehlende Maßnahmen werden priorisiert, mit Verantwortlichen und Terminen geplant und umgesetzt. Danach wird regelmäßig geprüft und verbessert (PDCA-Zyklus).

### Das IT-Grundschutz-Kompendium
Das Kompendium ordnet seine Bausteine in zwei Gruppen: Prozess-Bausteine gelten für die ganze Organisation, System-Bausteine für einzelne Zielobjekte. Die Edition 2023 enthält 111 Bausteine.
![Prozess-Bausteine ISMS, ORP, CON, OPS, DER und System-Bausteine APP, SYS, IND, NET, INF](grundschutz-schichten.svg)
- Jeder Baustein beschreibt die Gefährdungslage und listet Anforderungen in drei Stufen: **Basis-Anforderungen** (MUSS – vorrangig umsetzen), **Standard-Anforderungen** (SOLLTE – Stand der Technik) und **Anforderungen bei erhöhtem Schutzbedarf**.
- Zum Kompendium gehören die elementaren Gefährdungen G 0.1 bis G 0.47, z. B. G 0.1 Feuer, G 0.18 Fehlplanung, G 0.39 Schadprogramme.
- **Umsetzungshinweise** zu vielen Bausteinen beschreiben konkrete Maßnahmen und sind eine gute Vorlage für eigene Konzepte.

### Grundschutz im Admin-Alltag
Auch ohne Zertifikat sind die Bausteine eine hervorragende Checkliste für die eigene Arbeit.
- **SYS.2.2.3 Clients unter Windows:** Härtung, Updates, Berechtigungen.
- **SYS.1.1 Allgemeiner Server:** Grundregeln für jeden Server, vom Raum bis zur Protokollierung.
- **OPS.1.1.3 Patch- und Änderungsmanagement:** Updates geplant, getestet und dokumentiert einspielen.
- **OPS.1.1.4 Schutz vor Schadprogrammen:** Virenschutz und Umgang mit Schadsoftware.
- **CON.3 Datensicherungskonzept:** was, wie oft und wohin gesichert wird – und dass die Wiederherstellung getestet wird.
- **ORP.4 Identitäts- und Berechtigungsmanagement:** Konten und Rechte vergeben, prüfen und entziehen.
- **NET.3.2 Firewall:** Regelwerk, Protokollierung, Administration.
- Werkzeuge wie verinice helfen bei Modellierung, Grundschutz-Check und Dokumentation.

### Zertifizierung und Einstieg
- **ISO 27001-Zertifikat auf Basis von IT-Grundschutz:** Vergibt das BSI nach einem Audit durch zertifizierte Auditoren. Es weist ein funktionierendes ISMS und die Umsetzung der Standard-Absicherung nach und ist international anerkannt.
- **WiBA (Weg in die Basis-Absicherung):** Checklisten mit Prüffragen für einen schnellen Einstieg, vor allem für Kommunen und kleinere Organisationen. Das BSI führt sie auch künftig fort.
- **Bezug zu NIS2:** Für viele Unternehmen gelten durch die Umsetzung von NIS2 (EU-Richtlinie für Netz- und Informationssicherheit) Pflichten zum Risikomanagement. Der IT-Grundschutz ist ein anerkannter Weg, diese strukturiert umzusetzen.

### Ausblick: Grundschutz++
Das BSI baut den IT-Grundschutz grundlegend um. Den Leitfaden zur neuen Methodik Grundschutz++ hat es im April 2026 veröffentlicht; er befindet sich in der Einführungs- und Pilotphase.
- **Statt Bausteinen:** Grundschutz++ geht von Geschäftsprozessen und Werten (Assets) aus. Anforderungen gelten dort, wo sie für den Geschäftsbetrieb wichtig sind.
- **Maschinenlesbar:** Die Anforderungen liegen im Format OSCAL (Open Security Controls Assessment Language, auf Basis von JSON) vor statt als Word- oder PDF-Dokument – Werkzeuge können sie direkt verarbeiten.
- **Zertifizierung:** Nach Grundschutz++ ab dem 1. Januar 2027 möglich. Der bisherige IT-Grundschutz bleibt laut aktuellen Angaben bis Ende 2028 gültig; bestehende Zertifikate müssen nicht sofort umgestellt werden.
- **Für die Prüfung:** Die Begriffe des klassischen IT-Grundschutzes (Standards 200-1 bis 200-4, Absicherungsarten, Schutzbedarf, Bausteine) bleiben die Grundlage. Grundschutz++ ist Hintergrundwissen.

## Zusatz: MFA und Passwort-Manager {#mfa-passwortmanager}
typ: text
zu: authentifizierung, bedrohungen, zero-trust, netzwerkdienste.verzeichnisdienste

Warum ein Passwort allein heute nicht mehr reicht, wie die verschiedenen MFA-Verfahren funktionieren und wo sie angreifbar sind – und warum ein Passwort-Manager kein Risiko, sondern die Voraussetzung für gute Passwörter ist.

Die meisten erfolgreichen Angriffe auf Konten brauchen keine raffinierte Technik: Ein Passwort wird abgefischt, erraten oder stammt aus einem alten Datenleck. Gegen alle drei Wege helfen zwei Dinge zusammen: ein eigenes, langes Passwort pro Dienst (dafür braucht man einen Passwort-Manager) und ein zweiter Faktor, der ohne das Gerät oder den Schlüssel des Nutzers nicht funktioniert.

### Wie Passwörter in falsche Hände geraten
- **Phishing:** Eine gefälschte Anmeldeseite sieht aus wie Microsoft 365 oder die Bank; der Nutzer tippt sein Passwort selbst ein.
- **Credential Stuffing:** Angreifer probieren Benutzername-Passwort-Paare aus fremden Datenlecks automatisch bei vielen anderen Diensten aus. Das klappt überall dort, wo jemand sein Passwort wiederverwendet.
- **Password Spraying:** Wenige sehr häufige Passwörter („Sommer2026!“) werden gegen viele Konten probiert – so lösen sie keine Kontosperre aus.
- **Brute Force und Wörterbuchangriffe:** Gestohlene Passwort-Hashes werden offline durchprobiert. Kurze Passwörter fallen in Minuten, lange Passphrasen praktisch nicht.
- **Keylogger und Infostealer:** Schadsoftware liest Tastatureingaben oder im Browser gespeicherte Passwörter und Sitzungs-Cookies aus.

### So funktioniert MFA
Bei der Mehr-Faktor-Authentifizierung muss man mindestens zwei Faktoren aus verschiedenen Kategorien vorweisen: etwas, das man **weiß** (Passwort, PIN), etwas, das man **besitzt** (Smartphone, Sicherheitsschlüssel, Chipkarte) und etwas, das man **ist** (Fingerabdruck, Gesicht). Das bekannteste Beispiel ist die Bankkarte mit PIN: Wer nur die Karte findet oder nur die PIN kennt, kommt nicht an das Geld.

Ein gestohlenes Passwort ist mit MFA allein wertlos. Microsoft nennt seit Jahren, dass MFA über 99 % der automatisierten Angriffe auf Konten verhindert. Wichtig: Zwei Passwörter oder Passwort plus Sicherheitsfrage sind keine MFA – beides ist „Wissen“.

Bei Passkeys und Windows Hello entsperrt der Fingerabdruck oder die PIN nur den Schlüssel auf dem Gerät. Die PIN verlässt das Gerät nie; der eigentliche Nachweis ist der Besitz des Geräts. Deshalb zählt das als zwei Faktoren.

### MFA-Verfahren im Vergleich
| Verfahren | So funktioniert es | Schutz vor Phishing | Einschätzung |
| --- | --- | --- | --- |
| SMS-Code | Einmalcode per SMS | nein | besser als nichts, aber anfällig für SIM-Swapping und Abfangen; nur als Notlösung |
| E-Mail-Code | Einmalcode per E-Mail | nein | schwach, wenn das Postfach mit demselben Passwort geschützt ist |
| Authenticator-App (TOTP) | App erzeugt alle 30 Sekunden einen 6-stelligen Code | nein | solide Grundlage, funktioniert offline; Code kann auf einer Phishing-Seite eingegeben werden |
| Push-Bestätigung | App fragt „Anmeldung bestätigen?“ | nein | bequem, aber anfällig für MFA-Fatigue |
| Push mit Nummernabgleich | Nutzer tippt die auf dem Bildschirm angezeigte Zahl in der App ein | teilweise | deutlich besser als einfacher Push; Standard in Microsoft Authenticator |
| FIDO2-Sicherheitsschlüssel | USB- oder NFC-Schlüssel (z. B. YubiKey) mit Schlüsselpaar | ja | sehr sicher; ideal für Admins und besonders gefährdete Konten |
| Passkey | FIDO2-Schlüssel im Smartphone, Laptop oder Passwort-Manager | ja | sehr sicher und bequem; ersetzt das Passwort ganz |
| Smartcard / Zertifikat | Chipkarte mit Zertifikat und PIN | ja | klassisch in Behörden und großen Unternehmen; braucht eine PKI |

### Einmalcodes (TOTP) verstehen
1. Beim Einrichten zeigt der Dienst einen QR-Code. Darin steckt ein geheimer Schlüssel, den Dienst und App ab jetzt beide kennen.
2. Die App berechnet aus diesem Schlüssel und der aktuellen Uhrzeit (in 30-Sekunden-Schritten) per HMAC (Hash-based Message Authentication Code) einen 6-stelligen Code – nach dem Internet-Standard RFC 6238 (RFC = Request for Comments).
3. Der Server rechnet dasselbe und vergleicht. Stimmt der Code, ist bewiesen, dass der Nutzer das Gerät mit dem Schlüssel besitzt.
4. Weil die Uhrzeit eingeht, müssen die Uhren von Server und Smartphone ungefähr stimmen – falsche Uhrzeit ist eine typische Fehlerquelle im Support.

Den QR-Code nie per Screenshot speichern oder weiterschicken: Wer ihn hat, kann dieselben Codes erzeugen.

### Passkeys und FIDO2 – warum sie gegen Phishing schützen
Bei FIDO2 (Standard WebAuthn) erzeugt das Gerät für jeden Dienst ein eigenes Schlüsselpaar. Der öffentliche Schlüssel liegt beim Dienst, der private verlässt das Gerät nie. Bei der Anmeldung schickt der Dienst eine Zufallszahl, das Gerät unterschreibt sie mit dem privaten Schlüssel, der Dienst prüft die Unterschrift.

Der Schlüssel ist fest an die Domain gebunden. Auf einer gefälschten Seite wie „micr0soft-login.com“ gibt es schlicht keinen passenden Schlüssel – der Nutzer kann sich gar nicht versehentlich dort anmelden. Es gibt außerdem nichts, was beim Dienst gestohlen werden könnte: Ein Datenleck enthält nur öffentliche Schlüssel.

Passkeys sind FIDO2-Schlüssel, die zwischen Geräten synchronisiert werden können (über das Apple-, Google- oder Microsoft-Konto oder einen Passwort-Manager). Gerätegebundene Passkeys, etwa auf einem Sicherheitsschlüssel, lassen sich dagegen nicht kopieren – das ist für Admin-Konten die strengere Variante.

### Wie Angreifer MFA umgehen
- **MFA-Fatigue (Push-Bombing):** Der Angreifer kennt das Passwort und löst nachts Dutzende Push-Anfragen aus, bis der genervte Nutzer auf „Genehmigen“ tippt. Gegenmittel: Nummernabgleich, Anzeige von Ort und App in der Anfrage, Schulung („unerwartete Anfrage = sofort melden“).
- **Adversary-in-the-Middle:** Eine Phishing-Seite leitet alles live an den echten Dienst weiter, auch den TOTP-Code, und stiehlt danach das Sitzungs-Cookie. Gegenmittel: phishingresistente Verfahren (FIDO2, Passkeys) und Richtlinien, die nur verwaltete Geräte zulassen.
- **SIM-Swapping:** Der Angreifer überredet den Mobilfunkanbieter, die Nummer auf seine SIM-Karte zu übertragen, und empfängt die SMS-Codes. Gegenmittel: keine SMS für wichtige Konten.
- **Helpdesk-Trick:** „Ich habe ein neues Handy, bitte MFA zurücksetzen.“ Gegenmittel: feste Identitätsprüfung vor jedem Zurücksetzen, z. B. Rückruf an die hinterlegte Nummer oder persönliches Erscheinen.
- **Alte Protokolle:** Dienste mit einfacher Anmeldung ohne MFA (z. B. alte E-Mail-Protokolle mit Basic Auth) umgehen den zweiten Faktor komplett. Gegenmittel: abschalten.

### Checkliste: MFA im Unternehmen einführen
- Mit den Konten anfangen, die den größten Schaden anrichten können: Admins, Fernzugänge (VPN, RDP-Gateway), E-Mail und Cloud-Verwaltung.
- Für Admins phishingresistente Verfahren vorschreiben: FIDO2-Sicherheitsschlüssel oder Passkeys.
- Push nur mit Nummernabgleich, SMS nur als Ausnahme mit Begründung.
- Bedingten Zugriff nutzen (z. B. Conditional Access in Entra ID): MFA abhängig von Gerät, Ort und Risiko verlangen.
- Veraltete Anmeldeverfahren ohne MFA-Unterstützung abschalten.
- Jeden Nutzer mindestens zwei Methoden registrieren lassen, damit ein verlorenes Handy nicht zum Ausfall führt.
- Einen festen Prozess für verlorene Geräte und das Zurücksetzen von MFA mit Identitätsprüfung festlegen.
- Zwei Notfallkonten (Break-Glass) mit langen Passwörtern bzw. eigenen Sicherheitsschlüsseln sicher verwahren und ihre Anmeldungen überwachen.
- Nutzer schulen: Wie sieht eine echte Anfrage aus, und was tun bei einer, die man nicht selbst ausgelöst hat?

### Warum ein Passwort-Manager Sinn macht
Gute Passwörter sind lang, zufällig und für jeden Dienst verschieden. Bei 50 bis 100 Konten kann sich das niemand merken – also werden Passwörter wiederverwendet, leicht abgewandelt („Passwort1“, „Passwort2“) oder auf Zettel geschrieben. Genau das nutzen Credential Stuffing und Password Spraying aus. Ein Passwort-Manager löst das Problem: Man merkt sich nur noch ein starkes Master-Passwort, den Rest erledigt das Programm.

Die Vorteile im Überblick:
- **Einzigartige, starke Passwörter:** Der Generator erzeugt für jeden Dienst ein langes Zufallspasswort. Ein Datenleck betrifft dann nur noch dieses eine Konto.
- **Schutz vor Phishing:** Das automatische Ausfüllen funktioniert nur auf der Domain, für die das Passwort gespeichert ist. Bietet der Manager auf einer Seite nichts an, ist das ein Warnsignal.
- **Warnungen:** Viele Manager melden schwache, doppelte oder in Datenlecks aufgetauchte Passwörter.
- **Sicheres Teilen:** Gemeinsame Zugänge (z. B. für einen Lieferantenshop) werden über freigegebene Tresore geteilt statt per E-Mail – und beim Austritt eines Mitarbeiters zentral entzogen.
- **Mehr als Passwörter:** TOTP-Codes, Passkeys, Wiederherstellungscodes, Lizenzschlüssel und sichere Notizen an einem Ort.
- **Weniger Support:** Weniger vergessene Passwörter bedeuten weniger Tickets für Passwort-Resets.

### Wo Passwörter gespeichert werden
| Ort | Bewertung |
| --- | --- |
| Im Kopf | sicher, aber nur für wenige Passwörter machbar – führt zur Wiederverwendung |
| Zettel am Monitor, Excel-Liste | jeder mit Zugang zum Platz oder zur Datei hat alle Passwörter |
| Im Browser gespeichert | besser als Wiederverwendung, aber oft an das Benutzerkonto gebunden und ein Hauptziel von Infostealern; zentrale Verwaltung schwierig |
| Passwort-Manager (z. B. Bitwarden, 1Password, KeePassXC) | verschlüsselt, mit Generator, Ausfüllen und Teilen – die empfohlene Lösung |
| Unternehmens-Tresor für privilegierte Zugänge (PAM) | für Admin- und Dienstkonten: Freigabe nach Genehmigung, Protokollierung, automatischer Passwortwechsel |

### „Alle Eier in einem Korb?“ – die häufigsten Bedenken
- **Verschlüsselung:** Gute Passwort-Manager verschlüsseln den Tresor auf dem eigenen Gerät mit einem Schlüssel, der aus dem Master-Passwort abgeleitet wird (Zero-Knowledge-Prinzip). Der Anbieter speichert nur verschlüsselte Daten und kennt das Master-Passwort nicht.
- **Was das BSI sagt:** Das BSI hat 2025 zusammen mit der Verbraucherzentrale NRW zehn Passwort-Manager untersucht. Bei drei Produkten konnte der Hersteller theoretisch auf die Passwörter zugreifen. Trotzdem lautet das Fazit: Der Nutzen überwiegt deutlich, ganz ohne Passwort-Manager ist das Risiko größer.
- **Cloud oder lokal:** Cloud-Manager synchronisieren bequem zwischen PC und Smartphone. Lokale Lösungen wie KeePassXC speichern eine verschlüsselte Datei, um deren Sicherung man sich selbst kümmern muss.
- **Und wenn der Tresor gestohlen wird?** Ohne Master-Passwort sind die Daten nutzlos – vorausgesetzt, das Master-Passwort ist lang und nirgends sonst verwendet, und der Tresor ist zusätzlich mit MFA geschützt.

### Checkliste: Passwort-Manager richtig nutzen
- Master-Passwort als lange Passphrase aus mehreren zufälligen Wörtern wählen und nirgendwo sonst verwenden.
- Den Zugang zum Passwort-Manager selbst mit MFA schützen.
- Notfallzugang einrichten: Wiederherstellungscode ausdrucken und sicher verwahren, im Unternehmen über die Administration.
- Automatische Sperre nach kurzer Inaktivität und beim Sperren des Bildschirms einschalten.
- Regelmäßig Updates einspielen und einen Anbieter wählen, der unabhängig geprüft wurde (Sicherheitsaudits).
- Bestehende Passwörter nach und nach ersetzen: zuerst E-Mail, Bank und alles, womit man andere Passwörter zurücksetzen kann.
- Im Unternehmen: Firmen- und Privattresor trennen, Zugriffe über Gruppen vergeben, beim Austritt Tresor-Zugriff sofort entziehen.

### Was heute für Passwörter gilt
Die Regeln haben sich in den letzten Jahren deutlich geändert. Das US-Institut NIST hat in seiner Richtlinie SP 800-63B (Revision 4, August 2025) festgelegt: Ist das Passwort der einzige Faktor, muss es mindestens 15 Zeichen lang sein; bei MFA reichen 8. Systeme sollen mindestens 64 Zeichen erlauben und keine Pflicht zu Sonderzeichen oder Großbuchstaben mehr vorschreiben. Regelmäßige Zwangswechsel entfallen – gewechselt wird, wenn es einen Verdacht auf Kompromittierung gibt. Neue Passwörter werden stattdessen gegen eine Liste bekannter und geleakter Passwörter geprüft. Das BSI hat die Pflicht zum regelmäßigen Passwortwechsel schon 2020 aus dem IT-Grundschutz gestrichen.

Merke: Länge schlägt Komplexität, Einzigartigkeit schlägt Merkbarkeit – und MFA schützt auch dann noch, wenn das Passwort schon verloren ist.

## Zusatz: Zertifikate im Betrieb {#zertifikate-betrieb}
typ: text
zu: pki, tls-https, netzwerkdienste.ssh, netzwerkdienste.nac

Warum abgelaufene Zertifikate zu den häufigsten Ausfallursachen gehören, was sich bei den Laufzeiten gerade ändert und wie man Zertifikate und SSH-Schlüssel im Griff behält.

Ein abgelaufenes Zertifikat ist kein Sicherheitsproblem, sondern ein Betriebsproblem: Webseite, VPN, WLAN-Anmeldung oder eine Schnittstelle zwischen zwei Systemen hören von einer Minute auf die andere auf zu funktionieren. Oft weiß niemand, wo das Zertifikat überhaupt eingerichtet war – der Kollege, der es vor einem Jahr installiert hat, ist vielleicht nicht mehr da.

### Laufzeiten werden immer kürzer
Öffentliche Zertifikate (für Webseiten im Internet) dürfen nach einem Beschluss des CA/Browser Forums nur noch immer kürzer gelten:

| Ausgestellt ab | Höchstens gültig |
| --- | --- |
| bis 14. März 2026 | 398 Tage |
| 15. März 2026 | 200 Tage |
| 15. März 2027 | 100 Tage |
| 15. März 2029 | 47 Tage |

Let's Encrypt stellt bisher 90 Tage aus, ab dem 10. Februar 2027 standardmäßig 64 Tage und ab dem 16. Februar 2028 45 Tage. Das Ziel: Gestohlene oder falsch ausgestellte Zertifikate sind schneller wertlos, und Unternehmen werden gezwungen zu automatisieren. Interne Zertifikate der eigenen Firmen-CA betrifft das nicht – dort legt man die Laufzeit selbst fest.

### Checkliste: Zertifikate im Griff behalten
- Inventar führen: Welche Zertifikate gibt es, wo sind sie eingerichtet (Webserver, Load Balancer, VPN, WLAN-Controller, Drucker, Schnittstellen), wer ist verantwortlich, wann laufen sie ab?
- Erneuerung automatisieren – mit ACME (z. B. certbot, win-acme, eingebaute Funktionen von Reverse Proxys wie Caddy oder Traefik). Bei 47 Tagen Laufzeit ist Handarbeit nicht mehr machbar.
- Ablauf überwachen: Das Monitoring warnt z. B. 30 und 14 Tage vorher, auch wenn die Automatisierung eigentlich läuft.
- Nach dem Erneuern prüfen, ob der Dienst das neue Zertifikat wirklich ausliefert – manche Dienste müssen neu geladen werden.
- Immer die vollständige Kette einrichten (Serverzertifikat plus Zwischenzertifikat).
- Für Wildcard-Zertifikate per ACME die DNS-Prüfung (DNS-01) nutzen; die HTTP-Prüfung (HTTP-01) funktioniert dafür nicht.

### Checkliste: Private Schlüssel schützen
- Private Schlüssel nie per E-Mail oder Chat verschicken und nie in ein Git-Repository legen.
- Dateirechte eng setzen, unter Linux z. B. chmod 600 und nur für den Dienst lesbar.
- PFX-Dateien immer mit starkem Passwort exportieren und das Passwort getrennt aufbewahren.
- Bei Verdacht auf Diebstahl: Zertifikat sperren, neuen Schlüssel erzeugen, neues Zertifikat ausstellen – nicht nur das alte erneut einspielen.
- Für besonders wichtige Schlüssel (Root-CA, Code-Signatur) ein Hardware-Sicherheitsmodul (HSM) nutzen; die Root-CA einer Firmen-PKI bleibt ausgeschaltet und offline.

### Interne PKI mit Active Directory
Für interne Dienste (Intranet, WLAN mit EAP-TLS, VPN, Domänencontroller) betreiben viele Unternehmen eine eigene PKI mit Active Directory Certificate Services (AD CS). Typisch ist eine zweistufige Struktur: eine Offline-Root-CA und eine Ausstellungs-CA in der Domäne. Die Root-CA wird per Gruppenrichtlinie an alle Clients verteilt, Computer und Benutzer bekommen ihre Zertifikate per Autoenrollment automatisch. Zertifikatsvorlagen legen fest, wer welche Art von Zertifikat beantragen darf – zu großzügige Vorlagen sind ein bekannter Angriffsweg zum Domänen-Admin.

### Checkliste: SSH-Schlüssel im Unternehmen
- Persönliche Schlüssel pro Admin statt eines gemeinsamen Schlüssels für alle.
- Private Schlüssel immer mit Passphrase, besser noch auf einem FIDO2-Sicherheitsschlüssel (Schlüsseltyp ed25519-sk).
- Beim Austritt eines Mitarbeiters seine öffentlichen Schlüssel aus allen authorized_keys entfernen – das geht nur, wenn man weiß, wo sie liegen.
- Bei vielen Servern Schlüssel zentral verteilen (z. B. per Ansible) oder SSH-Zertifikate einer internen SSH-CA nutzen, die nach kurzer Zeit ablaufen.
- Host-Keys neuer Server dokumentieren oder per DNS (SSHFP-Einträge) veröffentlichen, damit Fingerabdrücke wirklich geprüft werden können.

## Zusatz: Verschlüsselung Schritt für Schritt {#ablauf-verschluesselung}
ablauf: verschluesselung.json
zu: verschluesselung, pki, tls-https

Symmetrisch, asymmetrisch, hybrid und die digitale Signatur im Vergleich. Die Spalte „Eve sieht“ zeigt jeweils, was ein Angreifer auf dem Übertragungsweg mitbekommt, die Tabelle darunter, wer welchen Schlüssel kennt.
