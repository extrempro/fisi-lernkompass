---
titel: Cloud
---

Welche Cloud-Modelle es gibt, wer wofür verantwortlich ist und wie Unternehmen Dienste wie Microsoft 365 und Azure einsetzen und abrechnen.

## IaaS/PaaS/SaaS {#servicemodelle}

### Kernbegriffe
- **IaaS:** Infrastructure as a Service – gemietete virtuelle Server, Speicher und Netze; Betriebssystem und Software verwaltest du selbst.
- **PaaS:** Platform as a Service – Laufzeitumgebung für eigene Anwendungen; Betriebssystem und Updates übernimmt der Anbieter.
- **SaaS:** Software as a Service – fertige Anwendung im Browser oder als App, z. B. E-Mail oder Office.
- **On-Premises:** Alles läuft im eigenen Haus auf eigener Hardware.

### Abbildung: Wer verwaltet was?
![Vier Stapel mit je sieben Ebenen von Anwendung bis Rechenzentrum. On-Premises: alles verwaltest du selbst. IaaS: Anwendung, Daten, Laufzeit und Betriebssystem du, Virtualisierung, Server und Rechenzentrum der Anbieter. PaaS: nur Anwendung und Daten du. SaaS: nur die Daten du, alles andere der Anbieter. Für die Daten bleibst du immer verantwortlich.](cloud-servicemodelle.svg)

### Tabelle: Wer verwaltet was?
| Ebene | On-Premises | IaaS | PaaS | SaaS |
| --- | --- | --- | --- | --- |
| Anwendung und Daten | Kunde | Kunde | Kunde | Anbieter (Daten: Kunde) |
| Laufzeit, Middleware | Kunde | Kunde | Anbieter | Anbieter |
| Betriebssystem | Kunde | Kunde | Anbieter | Anbieter |
| Virtualisierung, Server | Kunde | Anbieter | Anbieter | Anbieter |
| Rechenzentrum, Netz | Kunde | Anbieter | Anbieter | Anbieter |

### Tabelle: Beispiele
| Modell | Beispiele |
| --- | --- |
| IaaS | Azure Virtual Machines, AWS EC2, Hetzner Cloud |
| PaaS | Azure App Service, Azure SQL (Structured Query Language) Database, Google App Engine |
| SaaS | Microsoft 365, Google Workspace, Salesforce |

### Merksatz
Je weiter Richtung SaaS, desto weniger betreibst du selbst – und desto weniger kannst du anpassen.

## Public/Private/Hybrid {#bereitstellungsmodelle}

### Kernbegriffe
- **Public Cloud:** Infrastruktur eines Anbieters, die sich viele Kunden teilen.
- **Private Cloud:** Cloud-Infrastruktur nur für ein Unternehmen, im eigenen oder einem gemieteten Rechenzentrum.
- **Hybrid Cloud:** Kombination aus eigener Infrastruktur und Public Cloud, die zusammenarbeiten.
- **Multi-Cloud:** Dienste mehrerer Anbieter gleichzeitig, z. B. gegen Abhängigkeit (Vendor Lock-in).
- **Community Cloud:** Gemeinsame Cloud mehrerer Organisationen mit gleichen Anforderungen, z. B. Behörden.

### Tabelle: Datenschutz in der Cloud
| Punkt | Worauf achten |
| --- | --- |
| Serverstandort | möglichst EU, im Vertrag festgelegt |
| Auftragsverarbeitung | Auftragsverarbeitungsvertrag (AVV) nach Art. 28 Datenschutz-Grundverordnung (DSGVO) mit dem Anbieter |
| Zertifikate | z. B. ISO (International Organization for Standardization) 27001, BSI C5 (Kriterienkatalog des Bundesamts für Sicherheit in der Informationstechnik) |
| Verschlüsselung | Daten bei Übertragung und Speicherung verschlüsselt |
| Ausstieg | Daten exportierbar, Kündigung geregelt |

### Tabelle: On-Premises oder Public Cloud?
| Modell | Vorteile | Nachteile |
| --- | --- | --- |
| On-Premises | volle Kontrolle über Hardware und Daten, Datenhoheit, geringe Latenz zu anderen Systemen im Haus, keine Abhängigkeit vom Internetanschluss | hohe Anschaffungskosten, eigenes Personal für Betrieb, Updates und Sicherheit, Erweiterung dauert |
| Public Cloud | Bezahlung nach Nutzung, schnell skalierbar, kein eigener Hardwarebetrieb, Backup und Georedundanz als Dienst buchbar | laufende Kosten, Abhängigkeit vom Anbieter und von der Internetleitung, höhere Latenz, Datenschutz vertraglich regeln |

„Billiger“ allein ist kein Argument – es kommt auf Laufzeit, Auslastung und Personalkosten an (Gesamtkosten, TCO).

### Merksatz
Public für Flexibilität, Private für Kontrolle, Hybrid für das Beste aus beidem. Weit weg heißt langsamer: Anwendungen mit vielen kleinen Anfragen leiden besonders unter Latenz.

### Prüfungsfrage
Eine Warenwirtschaft im Firmennetz soll auf eine Datenbank in der Public Cloud zugreifen; Tests zeigen eine hohe Latenz. Erkläre den Begriff, nenne Ursachen und einen Fall, in dem sie besonders stört.

1. Latenz ist die Verzögerung zwischen dem Senden einer Anfrage und dem Eintreffen der Antwort, gemessen in Millisekunden – nicht die Bandbreite.
2. Ursachen: große Entfernung zum Rechenzentrum, viele Router auf dem Weg, ausgelastete Leitungen und Warteschlangen, VPN (Virtual Private Network) und Verschlüsselung.
3. Besonders schlimm bei vielen kleinen, nacheinander ausgeführten Abfragen: Jede wartet auf die Antwort der vorherigen, sodass sich die Verzögerung aufsummiert, obwohl kaum Daten fließen.
4. Abhilfe: Anwendung und Datenbank in dieselbe Umgebung legen, Abfragen bündeln oder eine Region in der Nähe wählen.

## Microsoft 365/Azure-Grundlagen {#microsoft-365-azure}

### Kernbegriffe
- **Microsoft 365:** Abo-Paket aus Office-Apps und Clouddiensten wie Exchange Online, SharePoint, OneDrive und Teams.
- **Microsoft Entra ID:** Cloud-Verzeichnisdienst (früher Azure AD – Active Directory) für Benutzer, Anmeldung und MFA (Multi-Faktor-Authentifizierung).
- **Intune:** Verwaltung von Geräten und Apps aus der Cloud (Mobile Device Management).
- **Azure:** Microsofts Cloud-Plattform für IaaS und PaaS.
- **Ressourcengruppe:** Container in Azure, der zusammengehörige Ressourcen bündelt, z. B. für ein Projekt.
- **Region:** Rechenzentrumsstandort in Azure, z. B. Germany West Central.

### Tabelle: Dienste und Zweck
| Dienst | Zweck |
| --- | --- |
| Exchange Online | E-Mail, Kalender, Kontakte |
| SharePoint Online | Intranet, Dokumentenablage für Teams |
| OneDrive | persönlicher Cloudspeicher |
| Teams | Chat, Besprechungen, Zusammenarbeit |
| Entra ID | Identitäten, Anmeldung, MFA |
| Intune | Geräte- und App-Verwaltung |

### Befehle
- `Connect-ExchangeOnline` – PowerShell-Verbindung zu Exchange Online
- `az login` – mit der Azure-Befehlszeile anmelden
- `az vm list -o table` – virtuelle Maschinen in Azure auflisten

### Merksatz
Entra ID ist das Herz: Wer dort nicht sauber angelegt und mit MFA geschützt ist, gefährdet alle anderen Dienste.

## Kostenmodelle {#kostenmodelle}

### Kernbegriffe
- **CapEx:** Investitionskosten – Hardware wird gekauft und über Jahre abgeschrieben.
- **OpEx:** Laufende Betriebskosten – Cloud wird monatlich gemietet.
- **Pay-as-you-go:** Abrechnung nach tatsächlicher Nutzung, z. B. pro Stunde VM-Laufzeit.
- **Reservierung:** Feste Laufzeit (z. B. 1 oder 3 Jahre) gegen deutlichen Rabatt.
- **Abo pro Nutzer:** Fester Preis je Benutzer und Monat, typisch für SaaS.
- **TCO:** Total Cost of Ownership – alle Kosten über die Nutzungsdauer, auch Strom, Wartung und Personal.

### Merksatz
Vergleiche nie nur den Kaufpreis mit der Monatsmiete – vergleiche die Gesamtkosten über denselben Zeitraum.

### Prüfungsfrage
Eigener Server: 6 000 € Anschaffung plus 100 € Betrieb pro Monat. Cloud-VM: 280 € pro Monat. Was ist über 3 Jahre günstiger?

1. Eigener Server: 6 000 € + 36 · 100 € = 9 600 €
2. Cloud: 36 · 280 € = 10 080 €
3. Der eigene Server ist über 3 Jahre 480 € günstiger – Personal, Ausfallrisiko und Flexibilität sind dabei aber noch nicht berücksichtigt.

## Geteilte Verantwortung {#geteilte-verantwortung}

### Kernbegriffe
- **Shared Responsibility Model:** Anbieter und Kunde teilen sich die Sicherheitsverantwortung – je nach Servicemodell unterschiedlich.
- **Sicherheit der Cloud:** Liegt beim Anbieter – Rechenzentrum, Hardware, Basisnetz.
- **Sicherheit in der Cloud:** Liegt beim Kunden – Daten, Konten, Zugriffsrechte, Konfiguration.

### Tabelle: Verantwortung des Kunden
| Bereich | IaaS | PaaS | SaaS |
| --- | --- | --- | --- |
| Daten | Kunde | Kunde | Kunde |
| Konten und Zugriffe | Kunde | Kunde | Kunde |
| Anwendung | Kunde | Kunde | Anbieter |
| Betriebssystem, Patches | Kunde | Anbieter | Anbieter |
| Physische Sicherheit | Anbieter | Anbieter | Anbieter |

### Merksatz
Daten und Benutzerkonten bleiben immer deine Verantwortung – auch in der Cloud braucht es Backup und MFA.

## Häufige Fehler
- Glauben, in der Cloud sei der Anbieter für die Datensicherung zuständig.
- IaaS und PaaS verwechseln: Bei IaaS patchst du das Betriebssystem selbst.
- Kosten ohne gleiche Laufzeit vergleichen.
- Keinen Auftragsverarbeitungsvertrag abschließen.
- Microsoft-Konten ohne MFA (Multi-Faktor-Authentifizierung) betreiben.

## Links
- [Microsoft Learn – Azure](https://learn.microsoft.com/de-de/azure/) – Grundlagen und Lernpfade
- [BSI – Cloud Computing](https://www.bsi.bund.de) – Kriterienkatalog C5 und Empfehlungen
