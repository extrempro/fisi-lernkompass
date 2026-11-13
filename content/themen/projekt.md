---
titel: Projektmanagement & Wirtschaft
---

Projekte planen und dokumentieren, Angebote vergleichen und Kosten kalkulieren – das Handwerkszeug für die betriebliche Projektarbeit in der Abschlussprüfung.

## Projektphasen {#projektphasen}

### Kernbegriffe
- **Projekt:** Einmaliges Vorhaben mit klarem Ziel, begrenzter Zeit und begrenzten Mitteln.
- **Magisches Dreieck:** Qualität, Zeit und Kosten beeinflussen sich gegenseitig.
- **SMART-Ziele:** spezifisch, messbar, akzeptiert (attraktiv), realistisch, terminiert.
- **Lastenheft:** Vom Auftraggeber – beschreibt, was und wofür.
- **Pflichtenheft:** Vom Auftragnehmer – beschreibt, wie und womit die Anforderungen umgesetzt werden.
- **Meilenstein:** Wichtiger Zwischenstand ohne Dauer, z. B. „Testumgebung steht“.

### Abbildung: Wasserfall und Scrum
![Links das Wasserfallmodell mit den Phasen Analyse, Entwurf, Umsetzung, Test und Einführung nacheinander; Vorteile: gut planbar, fester Umfang; Nachteile: Änderungen spät und teuer, Ergebnis erst am Ende sichtbar. Rechts Scrum: Aus dem Product Backlog entsteht im Sprint Planning das Sprint Backlog, im Sprint von 1 bis 4 Wochen mit Daily Scrum entsteht ein lauffähiges Inkrement, danach Review und Retrospektive. Rollen: Product Owner, Scrum Master, Developer.](wasserfall-scrum.svg)

### Tabelle: Phasen und Ergebnisse
| Phase | Ergebnis |
| --- | --- |
| Initiierung / Analyse | Ist-Analyse, Soll-Konzept, Lastenheft |
| Planung | Pflichtenheft, Zeit-, Ressourcen- und Kostenplan |
| Durchführung | Umsetzung, Tests |
| Kontrolle | Soll-Ist-Vergleich laufend |
| Abschluss | Übergabe, Abnahmeprotokoll, Dokumentation, Fazit |

### Tabelle: Vorgehensmodelle
| Modell | Merkmal | Geeignet für |
| --- | --- | --- |
| Wasserfall | Phasen nacheinander, Rücksprung schwierig | klare, feste Anforderungen |
| V-Modell | jeder Phase ist eine Testphase gegenübergestellt | sicherheitskritische Projekte |
| Scrum (agil) | kurze Sprints, Product Owner, Scrum Master, Team | sich ändernde Anforderungen |

### Merksatz
Lastenheft: der Kunde sagt WAS. Pflichtenheft: der Dienstleister sagt WIE.

## Gantt/Netzplan {#gantt-netzplan}

### Kernbegriffe
- **Gantt-Diagramm:** Balkendiagramm mit Vorgängen über der Zeitachse – zeigt Dauer und Überschneidungen.
- **Netzplan:** Zeigt Vorgänge mit ihren Abhängigkeiten und berechnet Puffer.
- **FAZ/FEZ:** Frühester Anfangs- und Endzeitpunkt (Vorwärtsrechnung).
- **SAZ/SEZ:** Spätester Anfangs- und Endzeitpunkt (Rückwärtsrechnung).
- **Gesamtpuffer (GP):** SAZ − FAZ – so weit darf ein Vorgang sich verschieben, ohne das Projektende zu gefährden.
- **Kritischer Pfad:** Alle Vorgänge mit Gesamtpuffer 0 – jede Verzögerung verschiebt das Projektende.

### Tabelle: Rechenregeln
| Wert | Regel |
| --- | --- |
| FEZ | FAZ + Dauer |
| FAZ (Nachfolger) | größter FEZ aller Vorgänger |
| SAZ | SEZ − Dauer |
| SEZ (Vorgänger) | kleinster SAZ aller Nachfolger |
| GP | SAZ − FAZ |

### Merksatz
Vorwärts das Maximum, rückwärts das Minimum.

### Prüfungsfrage
A (2 Tage) ist Vorgänger von B (3 Tage) und C (5 Tage); D (1 Tag) folgt auf B und C. Wie lang dauert das Projekt, und welcher Vorgang hat Puffer?

1. Vorwärts: A 0–2, B 2–5, C 2–7, D startet beim größeren FEZ → 7–8.
2. Projektdauer: 8 Tage.
3. Rückwärts: D 7–8, C SEZ 7 → SAZ 2, B SEZ 7 → SAZ 4, A SEZ 2 → SAZ 0.
4. Puffer: B hat GP = 4 − 2 = 2 Tage; A, C und D haben 0.
5. Kritischer Pfad: A → C → D.

## Angebotsvergleich {#angebotsvergleich}

### Kernbegriffe
- **Quantitativer Vergleich:** Nach Preis – alle Angebote auf denselben Bezugspreis rechnen.
- **Qualitativer Vergleich:** Nach Kriterien wie Lieferzeit, Service, Garantie, Zuverlässigkeit (Nutzwertanalyse).
- **Rabatt:** Preisnachlass, z. B. Mengenrabatt.
- **Skonto:** Nachlass bei Zahlung innerhalb einer Frist, z. B. 2 % bei Zahlung in 10 Tagen.
- **Bezugskosten:** Fracht, Verpackung, Versicherung.

### Tabelle: Bezugskalkulation
| Schritt | Rechnung |
| --- | --- |
| Listeneinkaufspreis | Ausgangswert laut Angebot (netto) |
| − Liefererrabatt | = Zieleinkaufspreis |
| − Liefererskonto | = Bareinkaufspreis |
| + Bezugskosten | = Bezugspreis (Einstandspreis) |

### Merksatz
Rabatt vom Listenpreis, Skonto vom Zielpreis, Bezugskosten zum Schluss.

### Prüfungsfrage
Angebot: Listenpreis 1 000 € netto, 10 % Rabatt, 2 % Skonto, 25 € Versand. Wie hoch ist der Bezugspreis?

1. Zieleinkaufspreis: 1 000 € − 10 % = 900 €
2. Bareinkaufspreis: 900 € − 2 % = 882 €
3. Bezugspreis: 882 € + 25 € = 907 €

## Nutzwertanalyse {#nutzwertanalyse}

### Kernbegriffe
- **Nutzwertanalyse:** Vergleicht Alternativen anhand gewichteter Kriterien – auch für nicht in Geld messbare Eigenschaften.
- **Gewichtung:** Bedeutung eines Kriteriums in Prozent; alle Gewichte ergeben zusammen 100 %.
- **Bewertung:** Punkte je Alternative und Kriterium, z. B. 1–10.
- **Nutzwert:** Summe aus Gewicht · Punkte – die Alternative mit dem höchsten Nutzwert gewinnt.
- **K.-o.-Kriterium:** Muss erfüllt sein, sonst scheidet die Alternative vorab aus.

### Tabelle: Beispiel
| Kriterium | Gewicht | A: Punkte | A: gewichtet | B: Punkte | B: gewichtet |
| --- | --- | --- | --- | --- | --- |
| Preis | 40 % | 8 | 3,20 | 6 | 2,40 |
| Leistung | 35 % | 6 | 2,10 | 9 | 3,15 |
| Service | 25 % | 7 | 1,75 | 8 | 2,00 |
| Summe | 100 % | | 7,05 | | 7,55 |

### Merksatz
Erst gewichten, dann bewerten – und die Gewichte vor dem Blick auf die Angebote festlegen.

### Prüfungsfrage
Welches Angebot gewinnt im Beispiel, obwohl A günstiger ist?

1. A: 0,40 · 8 + 0,35 · 6 + 0,25 · 7 = 7,05
2. B: 0,40 · 6 + 0,35 · 9 + 0,25 · 8 = 7,55
3. B gewinnt, weil Leistung und Service den Preisnachteil ausgleichen.

## Kalkulation {#kalkulation}

### Kernbegriffe
- **Handlungskosten:** Gemeinkosten des Betriebs (Miete, Personal, Verwaltung) als Prozentzuschlag.
- **Selbstkosten:** Bezugspreis + Handlungskosten.
- **Gewinnzuschlag:** Aufschlag auf die Selbstkosten.
- **Im Hundert:** Kundenskonto und Kundenrabatt werden vom höheren Preis gerechnet – also durch (100 % − Satz) teilen, nicht einfach aufschlagen.
- **Stundensatz:** Grundlage für Dienstleistungen, z. B. Installation pro Stunde.
- **Amortisationszeit:** Anschaffungskosten ÷ jährliche Einsparung – nach wie vielen Jahren sich etwas bezahlt macht.

### Tabelle: Verkaufskalkulation (vorwärts)
| Schritt | Ergebnis |
| --- | --- |
| Bezugspreis | Ausgangswert |
| + Handlungskosten | = Selbstkosten |
| + Gewinn | = Barverkaufspreis |
| + Kundenskonto (im Hundert) | = Zielverkaufspreis |
| + Kundenrabatt (im Hundert) | = Listenverkaufspreis netto |
| + 19 % Umsatzsteuer | = Listenverkaufspreis brutto |

### Merksatz
Zuschläge auf Hundert (vom kleineren Wert), Skonto und Rabatt im Hundert (vom größeren Wert).

### Prüfungsfrage
Bezugspreis 800 €, Handlungskosten 25 %, Gewinn 10 %, kein Skonto und Rabatt. Wie hoch ist der Bruttoverkaufspreis?

1. Selbstkosten: 800 € + 25 % = 1 000 €
2. Barverkaufspreis: 1 000 € + 10 % = 1 100 €
3. Brutto: 1 100 € · 1,19 = 1 309 €

## Qualitätsmanagement {#qualitaetsmanagement}

### Kernbegriffe
- **Qualität:** Wie gut ein Produkt oder eine Leistung die vereinbarten Anforderungen erfüllt – nicht „so gut wie möglich“, sondern „so wie vereinbart“.
- **Qualitätsmanagement (QM):** Alle geplanten Maßnahmen, mit denen ein Unternehmen Qualität sichert und verbessert: Abläufe festlegen, prüfen, Fehler auswerten, verbessern.
- **ISO 9001:** Internationale Norm für Qualitätsmanagementsysteme. Unternehmen können sich danach zertifizieren lassen; gefordert sind u. a. dokumentierte Prozesse, Kundenorientierung, Verantwortung der Leitung und laufende Verbesserung.
- **PDCA-Zyklus:** Plan – Do – Check – Act. Grundlage jeder kontinuierlichen Verbesserung, auch im ISMS und bei ITIL.
- **KVP / Kaizen:** Kontinuierlicher Verbesserungsprozess – viele kleine Verbesserungen statt seltener großer Umbrüche; Ideen kommen von den Mitarbeitenden.
- **Qualitätssicherung (QS):** Prüfende Maßnahmen im Projekt: Checklisten, Tests, Vier-Augen-Prinzip, Reviews, Abnahme.
- **Soll-Ist-Vergleich:** Geplante Werte (Termine, Kosten, Funktionen) werden mit den erreichten verglichen; Abweichungen werden begründet und führen zu Maßnahmen.
- **Ishikawa-Diagramm:** Ursache-Wirkungs-Diagramm („Fischgräte“). Mögliche Ursachen werden nach Kategorien gesammelt, klassisch die 6 M: Mensch, Maschine, Material, Methode, Milieu (Umfeld), Messung.
- **5-Why-Methode:** Fünfmal „Warum?“ fragen, bis man von Symptom zur eigentlichen Ursache kommt.
- **Pareto-Prinzip (80/20):** Wenige Ursachen verursachen den Großteil der Probleme. Erst die häufigsten angehen.
- **1-10-100-Regel:** Ein Fehler kostet in der Planung 1 €, in der Umsetzung 10 € und beim Kunden 100 € – früh prüfen spart Geld.
- **Software-Qualitätsmerkmale (ISO/IEC 25010):** u. a. Funktionalität, Zuverlässigkeit, Benutzbarkeit, Effizienz, Sicherheit, Wartbarkeit und Übertragbarkeit.

### Abbildung: PDCA-Zyklus
![Plan, Do, Check und Act im Kreis als kontinuierliche Verbesserung](pdca-zyklus.svg)

### Tabelle: Werkzeuge zur Fehleranalyse
| Werkzeug | Wofür | Beispiel |
| --- | --- | --- |
| Ishikawa-Diagramm | mögliche Ursachen strukturiert sammeln | Warum dauert die Einrichtung neuer PCs so lange? |
| 5 x Warum | einer Ursache auf den Grund gehen | Backup fehlgeschlagen → Platte voll → keine Löschregel → … |
| Pareto-Analyse | wichtigste Ursachen nach Häufigkeit finden | Ticketauswertung nach Kategorien |
| Checkliste | nichts vergessen, gleichbleibende Qualität | Checkliste für die Arbeitsplatz-Einrichtung |
| Soll-Ist-Vergleich | Abweichungen erkennen | Projektzeit geplant 40 h, gebraucht 46 h |

### Merksatz
Qualität ist erfüllte Anforderung. Planen, umsetzen, prüfen, verbessern – und die häufigsten Fehler zuerst.

### Prüfungsfrage
Der Service Desk hat im letzten Monat 200 Tickets bearbeitet: 90 zu Druckern, 50 zu Passwörtern, 30 zu VPN und 30 Sonstige. Wo setzt du zuerst an?

1. Pareto-Analyse: nach Häufigkeit sortieren und den Anteil berechnen.
2. Drucker 45 %, Passwörter 25 % – zusammen 70 % aller Tickets.
3. Maßnahmen dort zuerst: Ursachen der Druckerprobleme analysieren (z. B. Ishikawa), für Passwörter eine Self-Service-Rücksetzung einführen.
4. Nach einem Monat Soll-Ist-Vergleich: Ist die Ticketzahl gesunken? (PDCA)

## Einführung und Übergabe von IT-Systemen {#systemeinfuehrung}

### Kernbegriffe
- **Testkonzept:** Legt vor der Einführung fest, was, wie, von wem und mit welchen Daten getestet wird und wann ein Test als bestanden gilt. Ergebnisse kommen ins Testprotokoll.
- **Funktionstest:** Erfüllt das System die geforderten Funktionen?
- **Integrationstest:** Arbeitet es mit den anderen Systemen zusammen – Active Directory, Drucker, Netzlaufwerke, Fachanwendungen?
- **Last- und Performancetest:** Hält es auch viele gleichzeitige Benutzer oder große Datenmengen aus?
- **Abnahmetest:** Der Kunde prüft anhand der vereinbarten Anforderungen, ob er das Ergebnis annimmt.
- **Regressionstest:** Nach einer Änderung prüfen, ob bisher Funktionierendes noch funktioniert.
- **Datenübernahme (Migration):** Daten aus dem alten System ins neue übertragen: planen, Daten bereinigen, Probemigration, eigentliche Übernahme, Vollständigkeit prüfen – mit Rückfallplan.
- **Rollout-Strategien:** Big Bang (alles zum Stichtag), Pilot (eine Gruppe zuerst), stufenweise (Bereich für Bereich), Parallelbetrieb (alt und neu laufen eine Zeit lang gleichzeitig).
- **Abnahme:** Der Kunde erklärt, dass die Leistung im Wesentlichen vertragsgemäß ist. Beim Werkvertrag (§ 640 BGB – Bürgerliches Gesetzbuch) wird damit die Vergütung fällig, die Gewährleistungsfrist beginnt, und die Beweislast für Mängel geht auf den Kunden über.
- **Abnahmeprotokoll:** Hält fest, was übergeben wurde, wer abgenommen hat, wann, welche Tests liefen und welche Mängel offen sind – mit Frist zur Behebung und Unterschriften.
- **Einweisung und Schulung:** Benutzer lernen das neue System kennen; dazu gehören Kurzanleitungen und ein Ansprechpartner für Fragen.
- **Veränderungsprozess begleiten:** Betroffene früh informieren, Gründe erklären, Ängste ernst nehmen und Rückmeldungen einholen – Akzeptanz ist oft schwieriger als Technik.

### Abbildung: Rollout-Strategien
![Big Bang mit Stichtag, Pilot mit Testgruppe, stufenweise Einführung nach Bereichen und Parallelbetrieb von alt und neu auf einer Zeitachse](einfuehrungsstrategien.svg)

### Tabelle: Rollout-Strategien im Vergleich
| Strategie | Vorteil | Nachteil | Geeignet für |
| --- | --- | --- | --- |
| Big Bang | schnell, keine Zwischenstände | hohes Risiko, alle gleichzeitig betroffen | kleine Umgebungen, eng gekoppelte Systeme |
| Pilot | Fehler zeigen sich in kleiner Gruppe | dauert länger | neue Software, unbekannte Risiken |
| Stufenweise | Aufwand und Risiko verteilt | zeitweise zwei Welten nebeneinander | viele Standorte oder Abteilungen |
| Parallelbetrieb | sicherster Rückfall, Ergebnisse vergleichbar | doppelter Aufwand, Daten doppelt pflegen | kritische Systeme wie Buchhaltung |

### Tabelle: Inhalt eines Abnahmeprotokolls
| Punkt | Beispiel |
| --- | --- |
| Projekt und Auftrag | Einrichtung von 12 Arbeitsplätzen, Auftrag Nr. 2026-117 |
| Beteiligte | Auftraggeber, Auftragnehmer, Datum, Ort |
| Lieferumfang | Geräte mit Seriennummern, Software, Dokumentation |
| Durchgeführte Prüfungen | Funktionstest bestanden, Anmeldung im AD, Druck und Netzlaufwerke |
| Offene Mängel | Dockingstation an Platz 7 fehlt – Lieferung bis 15.11. |
| Ergebnis | abgenommen / abgenommen mit Vorbehalt / nicht abgenommen |
| Unterschriften | beider Seiten |

### Merksatz
Testen nach Plan, migrieren mit Rückfallplan, übergeben mit Protokoll – und die Benutzer mitnehmen.

### Prüfungsfrage
Ein Unternehmen mit 200 Arbeitsplätzen an drei Standorten stellt auf ein neues Betriebssystem um. Welche Einführungsstrategie empfiehlst du und wie gehst du vor?

1. Kein Big Bang: zu viele Arbeitsplätze, zu hohes Risiko für den Betrieb.
2. Pilot mit 10–15 Arbeitsplätzen aus verschiedenen Abteilungen, inklusive IT; Fachanwendungen, Drucker und Peripherie testen.
3. Danach stufenweise Standort für Standort, Termine mit den Abteilungen abstimmen.
4. Vorher Testkonzept und Rückfallplan, Benutzerdaten sichern; Benutzer informieren und kurz einweisen.
5. Je Abschnitt Abnahme mit Protokoll, Erfahrungen in die nächste Stufe übernehmen.

## Projektdoku Abschlussprüfung {#projektdoku}

### Kernbegriffe
- **Projektantrag:** Wird vor Beginn bei der Handelskammer eingereicht und muss genehmigt sein, bevor du startest.
- **Zeitrahmen:** Die betriebliche Projektarbeit umfasst höchstens 40 Stunden.
- **Projektdokumentation:** Prozessorientierter Bericht über dein Vorgehen; Umfang und Form nach den Vorgaben der Handelskammer.
- **Präsentation und Fachgespräch:** Zusammen rund 30 Minuten; im Fachgespräch wird dein Projekt und das fachliche Umfeld hinterfragt.
- **Eigenleistung:** Die Doku muss zeigen, was du selbst geplant, entschieden und umgesetzt hast.

### Tabelle: Gliederung der Doku
| Abschnitt | Inhalt |
| --- | --- |
| Einleitung | Ausgangssituation, Auftraggeber, Projektziel, Abgrenzung |
| Analyse | Ist-Analyse, Soll-Konzept, Wirtschaftlichkeit |
| Planung | Zeitplan (mit Abweichungen), Ressourcen, Kosten |
| Entscheidung | Alternativen, Nutzwertanalyse, Begründung |
| Durchführung | Umsetzung in nachvollziehbaren Schritten |
| Qualitätssicherung | Tests, Testprotokolle |
| Abschluss | Soll-Ist-Vergleich, Übergabe, Fazit, Ausblick |
| Anhang | Netzplan, Konfigurationsauszüge, Kundendoku, Glossar |

### Merksatz
Nicht nur was du gemacht hast, sondern warum – jede Entscheidung braucht eine Begründung.

## Häufige Fehler
- Lastenheft und Pflichtenheft verwechseln.
- Im Netzplan bei mehreren Vorgängern den kleineren statt den größten FEZ übernehmen.
- Skonto vom Listenpreis statt vom Zieleinkaufspreis abziehen.
- Gewichte der Nutzwertanalyse, die nicht 100 % ergeben.
- Projekt ohne genehmigten Antrag beginnen oder in der Doku nur Tätigkeiten aufzählen, ohne Entscheidungen zu begründen.
- Ein neues System ohne Pilot oder Rückfallplan auf einen Schlag für alle einführen.

## Links
- [Handelskammer Hamburg – IT-Berufe](https://www.handelskammer-hamburg.de/aus-und-weiterbildung/ausbildung-und-umschulung/ausbildungsberufsbilder-und-ansprechpartner/it-berufe/fachinformatiker-6776088) – Berufsseite mit Prüfungsinfos
- [Merkblatt Fachinformatiker (PDF)](https://www.handelskammer-hamburg.de/blueprint/servlet/resource/blob/4206506/7cfd874f69f0e7b73dec87e201be5b82/merkblatt-fachinformatiker-data.pdf) – Vorgaben der Handelskammer zur Prüfung
