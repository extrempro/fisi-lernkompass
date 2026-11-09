/**
 * Handbuch für Azubis – die Bedienung der App, Kapitel für Kapitel.
 * Text mit **fett** wird über <Inline> dargestellt. Bei Änderungen an der App hier mitpflegen.
 */

export type Block =
  | { typ: 'text'; text: string }
  | { typ: 'liste'; punkte: string[] }
  | { typ: 'schritte'; punkte: (string | { text: string; unter: string[] })[] }
  | { typ: 'tabelle'; kopf: string[]; zeilen: string[][] }
  | { typ: 'hinweis'; text: string };

export interface Kapitel {
  id: string;
  titel: string;
  /** Seite der App, zu der das Kapitel gehört */
  link?: { to: string; label: string };
  bloecke: Block[];
}

export const HANDBUCH: Kapitel[] = [
  {
    id: 'willkommen',
    titel: 'Willkommen',
    bloecke: [
      {
        typ: 'text',
        text: 'Der FISI-Lernkompass ist dein persönlicher Begleiter für die Ausbildung zum Fachinformatiker Systemintegration in Hamburg: Er zeigt dir, welche Themen du sicher kannst, wo du noch Lücken hast, und hilft dir beim Üben, beim Berichtsheft und bei der Prüfungsvorbereitung.',
      },
      {
        typ: 'text',
        text: 'Die App merkt sich alles automatisch – es gibt keinen Speichern-Knopf. Sie hat kein Login und läuft im Heim- oder Firmennetz bzw. über ein VPN; wie du sie erreichst, sagt dir die Person, die sie eingerichtet hat.',
      },
      {
        typ: 'tabelle',
        kopf: ['Bereich', 'Wofür du ihn nutzt'],
        zeilen: [
          ['Übersicht', 'Startseite: Fortschritt, nächste Prüfung, diese und nächste Woche'],
          ['Cheatsheets', 'Lernstoff der 13 Themenfelder lesen und deinen Stand per Ampel bewerten'],
          ['Kompendium', 'Begriffe und Inhalte über alle Themen hinweg nachschlagen'],
          ['Üben', 'Karteikarten, Quiz, Prüfungssimulation, Rechner und Werkzeuge'],
          ['Ausbildungsplan', 'Kalenderwochen mit Schulblöcken, Aufgaben, Ferien und Terminen'],
          ['Berichtsheft', 'Wöchentliche Ausbildungsnachweise schreiben, abzeichnen lassen, drucken'],
          ['Prüfungen', 'Stand für Teil 1 und Teil 2, Abschlussprojekt, Prüfungstechnik'],
          ['Einstellungen', 'Deine Daten, Ausbildungsdauer, Termine, Sicherung'],
        ],
      },
      {
        typ: 'text',
        text: 'Oben rechts schaltest du zwischen hellem und dunklem Design um; das Fragezeichen daneben öffnet dieses Handbuch (auf dem Handy über „Hilfe“ ganz unten). Unten auf jeder Seite stehen Version und Inhaltsstand; über „Was ist neu?“ kommst du zu den Versionshinweisen.',
      },
    ],
  },
  {
    id: 'erste-schritte',
    titel: 'Erste Schritte',
    link: { to: '/einstellungen', label: 'Zu den Einstellungen' },
    bloecke: [
      { typ: 'text', text: 'Bevor du loslegst, füll einmal die **Einstellungen** aus – Ausbildungsjahr, Ausbildungsplan, Berichtsheft und Countdown rechnen mit diesen Angaben.' },
      {
        typ: 'schritte',
        punkte: [
          '**Ausbildungsbeginn** eintragen (dein erster Ausbildungstag laut Vertrag). Daneben zeigt die App sofort dein Ausbildungsjahr und das Vertragsende.',
          {
            text: '**Ausbildungsdauer** prüfen: Hast du eine Verkürzung (z. B. 12 Monate wegen Abitur), trag sie hier ein.',
            unter: [
              '**Am Ende** – die Ausbildung endet früher, die Jahre zählen normal ab dem 1. (der übliche Fall).',
              '**Am Anfang angerechnet** – du startest in einem höheren Ausbildungsjahr, etwa nach einem Berufsgrundbildungsjahr.',
              'Nennt dein Vertrag ein anderes Enddatum, trag es unter **Vertragsende** ein; es hat Vorrang.',
              'Willst du vorzeitig zur Prüfung, setz den Haken **Vorzeitige Zulassung**.',
            ],
          },
          '**Berichtsheft-Angaben**: dein Name, Ausbildungsberuf, Ausbildungsbetrieb, Ausbilder/in und deine Wochenarbeitszeit. Sie stehen im Kopf jedes Nachweises.',
          '**Eigene Unterschrift** (optional): einmal mit Maus oder Finger unterschreiben und festlegen, ob sie auf jedem Nachweis mitgedruckt wird.',
          '**Prüfungstermine** für Teil 1 und Teil 2 eintragen, sobald die Handelskammer sie bekannt gibt. Die Übersicht zählt dann die Tage herunter.',
          '**Bedienung**: Lass „Vor dem Umstellen einer Ampel nachfragen“ eingeschaltet, solange du dich an die App gewöhnst.',
          '**Hoodie**: Der Companion unten links kommentiert, was du übst. Unter **Hoodie** stellst du ein, wie oft er etwas sagt, oder schaltest ihn ganz aus.',
        ],
      },
      { typ: 'text', text: 'Danach lohnt ein Blick in den **Ausbildungsplan**: Trag deine Schulblöcke der Berufsschule ITECH ein – Hamburger Ferien und Feiertage sind schon drin.' },
    ],
  },
  {
    id: 'uebersicht',
    titel: 'Übersicht',
    link: { to: '/', label: 'Zur Übersicht' },
    bloecke: [
      { typ: 'text', text: 'Die Übersicht ist deine Startseite und beantwortet in einem Blick: Wie weit bin ich, was steht diese Woche an, wann ist die nächste Prüfung?' },
      {
        typ: 'liste',
        punkte: [
          '**Gesamtfortschritt**: Anteil der sicheren, angefangenen und offenen Unterthemen über alle Themenfelder.',
          '**Nächste Prüfung**: Countdown in Tagen – sobald ein Termin in den Einstellungen steht.',
          '**Diese Woche**: Schulblock, Aufgaben und Termine aus dem Ausbildungsplan sowie der Stand deines Berichtshefts für die Woche.',
          '**Kacheln der Themenfelder**: je Feld Ampel, Fortschritt in Prozent und die Prüfungen, für die es zählt. Ein Klick öffnet das Cheatsheet.',
          '**Filter und Sortierung**: nur offene, angefangene oder sichere Felder zeigen; sortieren nach Katalog, Status (rot zuerst) oder Relevanz für Teil 1 bzw. Teil 2.',
          '**Legende** (aufklappbar): erklärt Ampelfarben, Chips und das Symbol „Auffrischen“ – es erscheint, wenn du ein Thema länger als 60 Tage nicht angefasst hast.',
        ],
      },
      { typ: 'text', text: 'Die Ampel einer Kachel ist grün, wenn mindestens 80 % ihrer Unterthemen sicher sind und keins offen ist, rot, wenn alle offen sind, sonst gelb.' },
    ],
  },
  {
    id: 'cheatsheets',
    titel: 'Cheatsheets, Ampel und Kompendium',
    link: { to: '/thema', label: 'Zu den Cheatsheets' },
    bloecke: [
      {
        typ: 'text',
        text: 'In den Cheatsheets lernst du den Stoff – und mit der Ampel hältst du fest, wie sicher du bist. Links wählst du das Themenfeld, rechts stehen „Worum geht\'s“, die Unterthemen, „Häufige Fehler“, Zusatzwissen und weiterführende Links.',
      },
      { typ: 'text', text: '**Ein Unterthema aufklappen** zeigt Kernbegriffe, Tabellen, Grafiken, Befehle, einen Merksatz und eine typische Prüfungsfrage mit Lösungsweg.' },
      {
        typ: 'tabelle',
        kopf: ['Status', 'Wann du ihn wählst'],
        zeilen: [
          ['Offen (rot)', '„Damit habe ich noch nichts gemacht.“'],
          ['In Arbeit (gelb)', '„Ich kenne es, brauche aber noch das Cheatsheet.“'],
          ['Sicher (grün)', '„Ich kann es ohne Hilfe erklären und anwenden.“'],
        ],
      },
      {
        typ: 'liste',
        punkte: [
          'Bei **In Arbeit** erscheint ein Feld für deinen **Lernpunkt**: Was fällt dir noch schwer? Er bleibt gespeichert, auch wenn du später auf „Sicher“ wechselst.',
          'Im aufgeklappten Unterthema gibt es zusätzlich eine **Notiz**, z. B. „in der Berufsschule nachfragen“.',
          'Steht **„Inhalt aktualisiert“** an einem Thema, wurde der Stoff seit deiner Bewertung ergänzt – kurz nachlesen und den Status bestätigen.',
          '**Zusatzwissen** (gestrichelter Rahmen) geht über den Prüfungsstoff hinaus, zählt nicht zur Ampel und hat nur ein Häkchen „Gelesen“. Manche Unterthemen verweisen mit einem Hinweis direkt dorthin.',
        ],
      },
      {
        typ: 'text',
        text: '**Kompendium**: Hier suchst du über alle Themenfelder nach einem Begriff, Befehl oder Merksatz und filterst nach Art – praktisch, wenn du im Betrieb schnell etwas nachschlagen willst. Prüfungsfragen lassen sich mit „Lösungsweg anzeigen“ aufdecken.',
      },
    ],
  },
  {
    id: 'ueben',
    titel: 'Üben',
    link: { to: '/ueben', label: 'Zum Üben' },
    bloecke: [
      {
        typ: 'text',
        text: 'Unter Üben fragst du dich selbst ab – die Fragen entstehen automatisch aus den Kernbegriffen und Prüfungsfragen der Cheatsheets. Oben siehst du, wie viele Karten heute fällig sind, wie viele schon sicher sitzen und dein letztes Simulationsergebnis.',
      },
      {
        typ: 'tabelle',
        kopf: ['Reiter', 'So funktioniert es', 'Gut für'],
        zeilen: [
          ['Karteikarten', 'Karte lesen, selbst überlegen, umdrehen (Leertaste), dann „Nicht gewusst“ (Taste 1) oder „Gewusst“ (Taste 2). Eine Runde hat bis zu 20 Karten.', 'tägliche Wiederholung in 10 Minuten'],
          ['Quiz', 'Multiple Choice: Zu einer Erklärung den passenden Begriff wählen. Am Ende steht, was du dir noch einmal ansehen solltest.', 'Begriffe sicher unterscheiden'],
          ['Prüfungssimulation', 'Fragen unter Zeitdruck wie in der Prüfung: Teil 1 mit 30 Fragen in 45 Minuten, Teil 2 mit 40 Fragen in 60 Minuten, danach Note nach dem Kammerschlüssel.', 'Generalprobe vor der Prüfung'],
          ['Rechner', 'Subnetting, Datenmengen, Übertragungsdauer, RAID, Plattenbedarf, Archiv mit Komprimierung, USV, Verfügbarkeit, VoIP-Bandbreite, Stromkosten, Amortisation – jeweils mit Rechenweg.', 'Rechenaufgaben üben und Ergebnisse prüfen'],
          ['Werkzeuge', 'Subnetting auf Bit-Ebene, RAID-Ausfall, Backup-Wiederherstellung mit Archivbit, Firewall-Regeln, Netzplan mit kritischem Pfad, SQL-JOINs, Linux-Rechte, Cron, Nutzwertanalyse – zum Ausprobieren und Verstehen.', 'Zusammenhänge sehen, bevor du sie auswendig lernst'],
        ],
      },
      {
        typ: 'text',
        text: '**Karteikarten nach dem Leitner-System:** Jede gewusste Karte wandert ein Fach weiter und kommt später wieder (Fach 2 nach 2 Tagen, Fach 5 nach 3 Wochen). Eine nicht gewusste Karte fällt zurück in Fach 1 und ist morgen wieder dran. Wähle „Heute fällig“ für die tägliche Runde, „Fehlerliste“ für deine Schwachstellen und grenze bei Bedarf die Themenfelder ein.',
      },
      { typ: 'text', text: '**Ampel-Vorschläge:** Nach einer Runde schlägt die App vor, die Ampel eines Unterthemas hochzusetzen, wenn du dort genug gewusst hast. Du entscheidest selbst, ob du den Vorschlag übernimmst.' },
      {
        typ: 'text',
        text: '**Rechner richtig nutzen:** Rechne eine Aufgabe zuerst selbst auf Papier und kontrolliere dann mit dem Rechner. Mit „Übungsaufgabe“ stellt dir jeder Rechner neue Aufgaben mit Zufallswerten und prüft deine Antwort; deutsche Schreibweise wie 1.234,5 ist erlaubt.',
      },
    ],
  },
  {
    id: 'ausbildungsplan',
    titel: 'Ausbildungsplan',
    link: { to: '/plan', label: 'Zum Ausbildungsplan' },
    bloecke: [
      {
        typ: 'text',
        text: 'Der Ausbildungsplan zeigt jede Kalenderwoche deiner Ausbildung – vom ersten Tag bis zum Vertragsende – und was in ihr ansteht. Oben findest du die Karten **Diese Woche** und **Nächste Woche**, an der Seite den Kompass mit Ausbildungsjahr, Ausbildungswoche und Fortschritt.',
      },
      { typ: 'text', text: '**Einträge anlegen:** In einer Woche auf Hinzufügen klicken und die Art wählen. Einträge können sich über mehrere Wochen erstrecken („Erste Woche“ bis „Letzte Woche“).' },
      {
        typ: 'tabelle',
        kopf: ['Art', 'Wofür'],
        zeilen: [
          ['Schulblock', 'Berufsschulzeiten, meist über mehrere Wochen'],
          ['Themenfeld', 'Lernthema der Woche – zeigt deinen aktuellen Ampelstand'],
          ['Aufgabe', 'Zum Abhaken, mit beliebig vielen Unteraufgaben als Checkboxen'],
          ['Notiz', 'Eigener Text, z. B. Urlaub oder Lehrgang'],
        ],
      },
      {
        typ: 'liste',
        punkte: [
          '**Besondere Tage** erscheinen automatisch als kleine Chips: Hamburger Schulferien und Feiertage, deine Prüfungstermine, Termine des Abschlussprojekts, Ausbildungsbeginn und Vertragsende.',
          '**Berichtsheft-Knopf** an jeder Woche: „Bericht schreiben“ öffnet direkt den Nachweis dieser Woche; fehlende Berichte vergangener Wochen werden markiert.',
          '**Ansicht**: Mit „Nur mit Einträgen“ blendest du leere Wochen aus, mit „Alle Wochen“ siehst du die komplette Ausbildung. Die Wochen sind nach Ausbildungsjahren gruppiert.',
          '**Verkürzung**: Hast du in den Einstellungen eine Verkürzung eingetragen, endet der Plan mit dem neuen Vertragsende.',
        ],
      },
    ],
  },
  {
    id: 'berichtsheft',
    titel: 'Berichtsheft',
    link: { to: '/berichtsheft', label: 'Zum Berichtsheft' },
    bloecke: [
      {
        typ: 'text',
        text: 'Im Berichtsheft schreibst du deine wöchentlichen Ausbildungsnachweise, lässt sie abzeichnen und druckst sie als PDF für die Handelskammer. Den Nachweis führst du auch in Schulwochen und bei Abwesenheit – er ist Voraussetzung für die Zulassung zur Prüfung.',
      },
      {
        typ: 'schritte',
        punkte: [
          '**Bericht schreiben**: über „Schreiben“ in der Liste oder den Knopf an der Woche im Ausbildungsplan.',
          {
            text: '**Abschnitte füllen**, jeweils mit Stunden:',
            unter: [
              '**Betriebliche Tätigkeiten** – was du gemacht hast, eine Zeile je Tätigkeit.',
              '**Unterweisungen** – Schulungen und betrieblicher Unterricht.',
              '**Berufsschule** – die Themen des Unterrichts; in Schulwochen macht die App Vorschläge aus dem Ausbildungsplan.',
              '**Abwesenheit** – Urlaub, Krankheit oder Feiertag; bei Krankheit genügt der Grund, Details gehören nicht hinein.',
            ],
          },
          '**Stunden prüfen**: Die App vergleicht die Summe mit deiner Wochenarbeitszeit und zeigt „Woche vollständig“ oder einen Hinweis.',
          '**Status setzen**: „Entwurf“, solange du noch schreibst, „Fertig“, wenn er zum Abzeichnen bereit ist.',
          {
            text: '**Abzeichnen lassen** – mindestens einmal im Monat:',
            unter: [
              '**Digital**: „Digital abzeichnen lassen“ öffnet die fertigen Berichte; deine Ausbilderin oder dein Ausbilder unterschreibt direkt am Gerät.',
              '**Auf Papier**: Ausdruck unterschreiben lassen und in der App „Auf Papier abgezeichnet?“ bestätigen.',
            ],
          },
          '**Drucken bzw. PDF**: einzelne Woche, „Angezeigte drucken“ oder „Alle drucken“, wahlweise mit Deckblatt. Im Druckdialog des Browsers „Als PDF speichern“ wählen.',
        ],
      },
      {
        typ: 'hinweis',
        text: 'Änderst du einen abgezeichneten Bericht, entfällt seine Unterschrift automatisch und er steht wieder auf „Fertig“. Bei der Anmeldung zu jedem Prüfungsteil lädst du alle bisherigen Nachweise im Azubi-Infocenter der Handelskammer hoch.',
      },
    ],
  },
  {
    id: 'pruefungen',
    titel: 'Prüfungen',
    link: { to: '/pruefung', label: 'Zu den Prüfungen' },
    bloecke: [
      { typ: 'text', text: 'Die Prüfungsseite hat drei Reiter: wie gut du für Teil 1 und Teil 2 vorbereitet bist, dein Abschlussprojekt und Tipps, wie du in der schriftlichen Prüfung Punkte holst.' },
      {
        typ: 'tabelle',
        kopf: ['Reiter', 'Was du dort findest'],
        zeilen: [
          ['Überblick AP1 / AP2', 'Vorbereitungsstand aus den Themenfeldern, die für den gewählten Teil zählen (größte Lücken zuerst), Prüfungsteile mit Dauer und Gewichtung, Bestehensregeln und die Karte „Verkürzen oder vorzeitig zur Prüfung?“ mit deinem Vertragsende.'],
          ['Abschlussprojekt', 'Termine der Handelskammer mit Countdown (auch im Ausbildungsplan), Checklisten für Antrag und Dokumentation, Zeitplanung mit Warnung über 40 Stunden, Präsentations-Timer (15 Minuten) und Fachgesprächsfragen mit eigenen Stichworten.'],
          ['Prüfungstechnik', 'Was Arbeitsaufträge wie „nennen“, „erläutern“ oder „begründen“ verlangen, die Übung „Welche Antwort bekommt volle Punkte?“, Spielregeln der schriftlichen Prüfung und Tipps für Zeit und Punkte.'],
        ],
      },
      { typ: 'text', text: 'Tipp: Arbeite zusätzlich alte Prüfungen unter echten Bedingungen durch – 90 Minuten je Bereich, nur mit Taschenrechner.' },
    ],
  },
  {
    id: 'daten',
    titel: 'Daten sichern und Datenschutz',
    link: { to: '/einstellungen', label: 'Zu den Einstellungen' },
    bloecke: [
      { typ: 'text', text: 'Deine Eingaben liegen in einer Datenbank auf dem Server, auf dem die App läuft – nicht im Browser. Du kannst also von PC und Handy aus auf denselben Stand zugreifen.' },
      {
        typ: 'tabelle',
        kopf: ['Aktion (Einstellungen → Daten)', 'Was passiert'],
        zeilen: [
          ['Exportieren', 'lädt eine JSON-Datei mit Lernstand, Notizen, Karteikarten, Ausbildungsplan, Berichtsheft, Unterschrift und Abschlussprojekt herunter'],
          ['Importieren', 'spielt eine solche Datei wieder ein und ersetzt den aktuellen Stand – vorher wird automatisch gesichert'],
          ['Fortschritt zurücksetzen', 'setzt alle Ampeln auf Rot und löscht Lernpunkte, Notizen, „Gelesen“-Häkchen, Karteikarten-Stand und Simulationsergebnisse; Ausbildungsplan und Berichtsheft bleiben erhalten'],
        ],
      },
      {
        typ: 'liste',
        punkte: [
          'Exportiere regelmäßig, z. B. einmal im Monat, und vor jedem großen Update; bewahre die Datei sicher auf.',
          'Die App hat **kein Login**: Wer sie im Netz erreicht, sieht deine Daten. Nutze sie nur im vorgesehenen Netz bzw. über das VPN und sperre dein Gerät, wenn du es liegen lässt.',
          'Schreib keine sensiblen Details ins Berichtsheft – etwa Diagnosen bei Krankheit oder Kundendaten. Der Grund „Krankheit“ reicht.',
          'Die digitale Unterschrift gilt nur für den Bericht in genau diesem Stand; deine eigene Unterschrift kannst du in den Einstellungen jederzeit löschen.',
        ],
      },
    ],
  },
  {
    id: 'lernroutine',
    titel: 'Lernroutine und häufige Fragen',
    bloecke: [
      { typ: 'text', text: 'Am meisten bringt die App, wenn du sie kurz und regelmäßig nutzt statt selten und lange.' },
      {
        typ: 'tabelle',
        kopf: ['Wann', 'Was', 'Dauer'],
        zeilen: [
          ['Täglich', 'Karteikarten „Heute fällig“', '10 Minuten'],
          ['Jede Woche (z. B. Freitag)', 'Bericht der Woche schreiben, Plan für nächste Woche prüfen', '15 Minuten'],
          ['Nach jedem Schulblock', 'Themen im Cheatsheet nachlesen, Ampel und Lernpunkte aktualisieren', '30 Minuten'],
          ['Monatlich', 'Berichte abzeichnen lassen, Daten exportieren', '15 Minuten'],
          ['3 Monate vor einer Prüfung', 'Fehlerliste, Rechner-Übungen, Prüfungssimulation, alte Prüfungen', 'wöchentlich 2–3 Stunden'],
        ],
      },
      {
        typ: 'liste',
        punkte: [
          '**Die App zeigt das falsche Ausbildungsjahr.** Prüfe Ausbildungsbeginn und Verkürzung in den Einstellungen – besonders, ob die Verkürzung „am Ende“ oder „am Anfang“ angerechnet wird.',
          '**Ein Bericht hat seine Unterschrift verloren.** Er wurde nach dem Abzeichnen geändert; lass ihn erneut abzeichnen.',
          '**Eine Karteikarte ist wieder in Fach 1, obwohl ich sie kannte.** Wurde ein Begriff im Inhalt umbenannt, gilt er als neue Karte.',
          '**Warum wird Zusatzwissen nicht abgefragt?** Es geht über den Prüfungsstoff hinaus und zählt bewusst nicht zur Ampel.',
          '**Beim Drucken fehlen Linien oder Farben.** Im Druckdialog die Option „Hintergrundgrafiken“ einschalten und „Als PDF speichern“ wählen.',
          '**Der Hoodie unten links stört.** Das Minus an seiner Ecke verkleinert ihn zu einem Knopf; ganz aus schaltest du ihn in den Einstellungen unter **Hoodie**. In der Prüfungssimulation ist er automatisch weg.',
          '**Oben steht „Es gibt eine neue Version“.** Auf „Seite neu laden“ klicken – dein Stand bleibt erhalten.',
          '**Ich habe einen Fehler im Inhalt gefunden.** Schreib dir eine Notiz am Unterthema und gib Bescheid, wer die Inhalte pflegt.',
        ],
      },
    ],
  },
];
