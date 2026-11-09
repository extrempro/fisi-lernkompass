/**
 * Prüfungstechnik für die schriftlichen Prüfungsbereiche: Arbeitsaufträge (Operatoren),
 * Spielregeln, Zeiteinteilung und eine Übung „Welche Antwort bekommt volle Punkte?“.
 * Die Beispiele sind selbst geschrieben – keine Originalaufgaben.
 */

export interface Operator {
  wort: string;
  verlangt: string;
  umfang: string;
  frage: string;
  antwort: string;
  falle?: string;
}

export const OPERATOREN: Operator[] = [
  {
    wort: 'nennen',
    verlangt: 'Begriffe, Fakten oder Beispiele ohne Erklärung aufzählen.',
    umfang: 'ein Stichwort je Punkt',
    frage: 'Nennen Sie zwei Protokolle für den Empfang von E-Mails.',
    antwort: 'IMAP, POP3',
    falle: 'Wer mehr nennt als verlangt, verschenkt Zeit – bewertet werden nur die ersten Angaben.',
  },
  {
    wort: 'beschreiben',
    verlangt: 'Einen Sachverhalt, Aufbau oder Ablauf mit eigenen Worten wiedergeben – wie ist es, wie läuft es ab?',
    umfang: 'ein bis zwei Sätze oder mehrere zusammenhängende Stichworte',
    frage: 'Beschreiben Sie den Ablauf einer Anmeldung an einem WLAN mit WPA2-Enterprise.',
    antwort: 'Der Client meldet sich mit Benutzername und Passwort oder Zertifikat an; der Access Point leitet die Anmeldung per 802.1X an den RADIUS-Server weiter, der sie prüft und den Zugang freigibt.',
  },
  {
    wort: 'erklären',
    verlangt: 'Einen Sachverhalt verständlich machen und dabei Ursachen, Gründe oder Zusammenhänge zeigen – warum ist es so?',
    umfang: 'Aussage plus Begründung („…, weil …“)',
    frage: 'Erklären Sie, warum ein Switch die Last im Netz gegenüber einem Hub verringert.',
    antwort: 'Der Switch lernt, an welchem Port welche MAC-Adresse hängt, und leitet Frames nur an den Zielport weiter, während ein Hub jeden Frame an alle Ports schickt.',
  },
  {
    wort: 'erläutern',
    verlangt: 'Wie erklären, aber ausführlicher: mit zusätzlichen Informationen, Folgen oder einem Beispiel veranschaulichen.',
    umfang: 'Aussage plus Begründung plus Folge oder Beispiel',
    frage: 'Erläutern Sie einen Vorteil von WPA2-Enterprise gegenüber WPA2-Personal.',
    antwort: 'Jeder Benutzer hat eigene Zugangsdaten, die der RADIUS-Server prüft. Scheidet ein Mitarbeiter aus, wird nur sein Konto gesperrt – bei WPA2-Personal müsste man den gemeinsamen Schlüssel auf allen Geräten ändern.',
    falle: 'Die häufigste Punktefalle: Ein richtiges Stichwort bei „erläutern“ bringt meist nur einen Bruchteil der Punkte.',
  },
  {
    wort: 'begründen',
    verlangt: 'Eine Aussage oder Entscheidung mit stichhaltigen Argumenten stützen.',
    umfang: 'Entscheidung plus Argument(e), möglichst auf die Situation bezogen',
    frage: 'Begründen Sie, ob für die Außendienst-Notebooks ein VPN eingerichtet werden sollte.',
    antwort: 'Ja – die Mitarbeiter greifen über fremde Netze wie Hotel-WLANs auf interne Daten zu; das VPN verschlüsselt die Verbindung und verhindert, dass Dritte mitlesen.',
    falle: 'Ohne Bezug zur Ausgangssituation gibt es oft nur Teilpunkte – das Unternehmen aus dem Aufgabentext nennen.',
  },
  {
    wort: 'vergleichen / unterscheiden',
    verlangt: 'Gemeinsamkeiten und vor allem Unterschiede anhand derselben Merkmale gegenüberstellen.',
    umfang: 'für jedes Merkmal beide Seiten – gern als kleine Tabelle',
    frage: 'Unterscheiden Sie eine differenzielle von einer inkrementellen Sicherung.',
    antwort: 'Differenziell sichert alle Änderungen seit der letzten Vollsicherung, inkrementell nur die seit der letzten Sicherung jeder Art. Differenziell braucht mehr Platz, stellt aber schneller wieder her (Voll + letzte Differenzielle).',
    falle: 'Nur eine Seite zu beschreiben ist kein Vergleich.',
  },
  {
    wort: 'beurteilen / bewerten',
    verlangt: 'Einen Sachverhalt anhand von Kriterien prüfen und zu einem begründeten Urteil kommen.',
    umfang: 'Kriterien nennen, abwägen, eigenes Urteil',
    frage: 'Beurteilen Sie, ob ein RAID 5 als alleinige Datensicherung ausreicht.',
    antwort: 'Nein. RAID 5 schützt nur vor dem Ausfall einer Platte, nicht vor Löschen, Ransomware, Brand oder Diebstahl – es ersetzt kein Backup auf getrennten Medien.',
  },
  {
    wort: 'berechnen / ermitteln',
    verlangt: 'Ein Ergebnis rechnerisch bestimmen; ermitteln kann auch Ablesen oder Nachschlagen bedeuten.',
    umfang: 'Ansatz, Rechenweg mit Einheiten, Ergebnis mit Einheit und ggf. Antwortsatz',
    frage: 'Berechnen Sie die Dauer, um 18 GB über eine Leitung mit 100 Mbit/s zu übertragen.',
    antwort: '18 GB × 8 = 144 Gbit = 144.000 Mbit; 144.000 Mbit ÷ 100 Mbit/s = 1.440 s = 24 Minuten.',
    falle: 'Ohne Rechenweg gibt es bei einem Fehler gar keine Punkte – mit Rechenweg oft Folgepunkte.',
  },
  {
    wort: 'ergänzen / vervollständigen',
    verlangt: 'Eine vorgegebene Tabelle, Grafik oder einen Code an den freien Stellen ausfüllen.',
    umfang: 'genau die Lücken, im vorgegebenen Format',
    frage: 'Ergänzen Sie in der Routingtabelle die Standardroute.',
    antwort: '0.0.0.0 | 0.0.0.0 | Next-Hop 198.51.100.1',
  },
  {
    wort: 'zuordnen',
    verlangt: 'Elemente den passenden Kategorien zuweisen, z. B. per Kreuz in einer Tabelle.',
    umfang: 'Kreuz oder Nummer – Mehrfachnennungen beachten, wenn sie erlaubt sind',
    frage: 'Ordnen Sie „Alarmanlage“ und „Passwortrichtlinie“ einer TOM-Kontrollart zu.',
    antwort: 'Alarmanlage → Kontrolle des Zutritts zu Räumen; Passwortrichtlinie → Kontrolle der Anmeldung am System (Begriffe aus der Aufgabe verwenden).',
  },
  {
    wort: 'skizzieren / darstellen',
    verlangt: 'Einen Sachverhalt grafisch oder strukturiert wiedergeben, z. B. als Netzplan, ER-Diagramm oder Struktogramm.',
    umfang: 'auf das Wesentliche beschränkt, aber vollständig beschriftet',
    frage: 'Skizzieren Sie ein Netz mit Firewall und DMZ.',
    antwort: 'Internet – Firewall – DMZ mit Webserver; Firewall – internes LAN; Schnittstellen beschriftet.',
  },
];

export const SPIELREGELN: string[] = [
  'Teil 2 besteht neben dem Projekt aus drei schriftlichen Bereichen: Konzeption und Administration von IT-Systemen (90 Minuten), Analyse und Entwicklung von Netzwerken (90 Minuten) und Wirtschafts- und Sozialkunde (60 Minuten).',
  'Die beiden Fachbereiche bestanden bisher aus je 4 Aufgaben mit zusammen 100 Punkten; die Zahl steht auf dem Deckblatt. Bearbeitet werden alle Aufgaben – anders als in alten Prüfungen nach der Verordnung von 1997, in denen man eine von fünf streichen durfte.',
  'Vor dem Start die Vollständigkeit des Aufgabensatzes prüfen; fehlende Seiten sofort melden, spätere Reklamationen werden nicht anerkannt.',
  'Wird eine bestimmte Anzahl verlangt („Nennen Sie drei …“), werden nur die ersten Angaben in dieser Anzahl bewertet.',
  'Stichworte reichen, solange nicht ausdrücklich ganze Sätze oder ein Brief verlangt sind.',
  'Nur ein nicht programmierbarer, netzunabhängiger Taschenrechner ohne Verbindung nach außen ist erlaubt.',
  'Wer ein gerundetes Ergebnis einträgt und damit weiterrechnen muss, rechnet mit dem gerundeten Wert weiter.',
  'Bewertet wird nur, was im Aufgabensatz steht – das Konzeptpapier ist für Notizen und wird nicht gewertet.',
  'Unleserliches oder nicht eindeutig zuzuordnendes zählt als falsch. Deutlich schreiben, Korrekturen klar kennzeichnen.',
  'Englische Texte kommen regelmäßig vor (Datenblätter, Auszüge aus Standards und Dokumentationen); oft gibt es eine kleine Vokabelhilfe.',
  'Hilfsblätter mit Syntax (z. B. SQL oder Programmcode) liegen bei, wenn Code verlangt ist – Befehle muss man nicht auswendig können, aber anwenden.',
];

export const TIPPS: { titel: string; text: string }[] = [
  { titel: 'Punkte zeigen den Umfang', text: 'Bei „nennen“ gibt es meist einen Punkt je Angabe, bei „beschreiben“ oder „erläutern“ etwa zwei Punkte je Aspekt mit Begründung. 2 Punkte „nennen“ heißt also zwei Stichworte, 6 Punkte „erläutern“ rund drei ausgeführte Aspekte.' },
  { titel: 'Zeit einteilen', text: '90 Minuten für 100 Punkte sind knapp eine Minute pro Punkt. Plane je Aufgabe rund 20 Minuten und behalte 10 Minuten Reserve zum Durchsehen.' },
  { titel: 'Ausgangssituation lesen', text: 'Die Aufgaben bauen auf einer gemeinsamen Situation auf (Unternehmen, Netzplan, Anlagen). Lies sie zuerst ganz – viele Antworten stehen indirekt darin, und Bezüge darauf bringen Punkte.' },
  { titel: 'Erst die sicheren Punkte', text: 'Fang mit dem an, was du sicher kannst. Bleib nicht an einer Teilaufgabe hängen, sondern markiere sie und komm später zurück.' },
  { titel: 'Rechenweg immer hinschreiben', text: 'Formel, eingesetzte Werte mit Einheiten, Ergebnis mit Einheit. Auch ein falsches Zwischenergebnis bringt so oft noch Folgepunkte.' },
  { titel: 'Fachbegriffe verwenden', text: 'Die Korrektur sucht nach den richtigen Begriffen: lieber „Stateful Packet Inspection merkt sich den Verbindungsstatus“ als „die Firewall ist schlauer“.' },
  { titel: 'Nichts leer lassen', text: 'Eine sinnvolle Teilantwort bringt oft Teilpunkte, eine leere Zeile nie.' },
];

export interface Uebung {
  id: string;
  operator: string;
  punkte: number;
  frage: string;
  antworten: { text: string; voll: boolean; warum: string }[];
}

/** Übung: Welche Antwort bekommt die volle Punktzahl? Genau eine Antwort ist voll. */
export const UEBUNGEN: Uebung[] = [
  {
    id: 'erlaeutern-spi',
    operator: 'erläutern',
    punkte: 4,
    frage: 'Erläutern Sie den Unterschied zwischen einer Firewall mit und ohne Stateful Packet Inspection (SPI).',
    antworten: [
      { text: 'Mit SPI ist die Firewall sicherer.', voll: false, warum: 'Nur eine Behauptung ohne Erklärung – bei „erläutern“ reicht das höchstens für einen Teilpunkt.' },
      { text: 'Mit SPI merkt sich die Firewall den Zustand jeder Verbindung und lässt Antwortpakete nur zu, wenn sie zu einer bestehenden, von innen aufgebauten Verbindung gehören. Ohne SPI prüft sie jedes Paket einzeln nur nach Adressen und Ports – Rückwege müssen dann eigens freigegeben werden, und gefälschte Antwortpakete fallen nicht auf.', voll: true, warum: 'Beide Seiten werden erklärt, und die Folge (Rückwege, gefälschte Pakete) wird gezeigt – das ist eine Erläuterung.' },
      { text: 'SPI = Stateful Packet Inspection, ohne SPI = Paketfilter.', voll: false, warum: 'Das sind nur zwei Begriffe – genannt, nicht erläutert.' },
    ],
  },
  {
    id: 'nennen-raid',
    operator: 'nennen',
    punkte: 2,
    frage: 'Nennen Sie zwei Maßnahmen, die die Verfügbarkeit eines Servers erhöhen (außer RAID).',
    antworten: [
      { text: 'Redundante Netzteile, USV', voll: true, warum: 'Zwei passende Stichworte – mehr verlangt „nennen“ nicht.' },
      { text: 'Backup, Redundante Netzteile, USV', voll: false, warum: 'Bewertet werden nur die ersten zwei Angaben: „Backup“ erhöht nicht die Verfügbarkeit, sondern schützt vor Datenverlust – also nur ein Punkt. Die richtige dritte Angabe zählt nicht mehr.' },
      { text: 'RAID 1 und RAID 5', voll: false, warum: 'RAID war ausdrücklich ausgeschlossen – genau lesen.' },
    ],
  },
  {
    id: 'berechnen-voip',
    operator: 'berechnen',
    punkte: 4,
    frage: 'Berechnen Sie die benötigte Upload-Bandbreite für 10 gleichzeitige externe VoIP-Gespräche mit G.711 (64 kbit/s) und 20 % Overhead.',
    antworten: [
      { text: '768 kbit/s', voll: false, warum: 'Das Ergebnis stimmt, aber ohne Rechenweg. Viele Korrekturhinweise vergeben Punkte gerade für den Weg – und bei einem Fehler gäbe es gar nichts.' },
      { text: '64 kbit/s × 1,2 = 76,8 kbit/s je Gespräch; 76,8 kbit/s × 10 = 768 kbit/s. Benötigt werden 768 kbit/s im Upload (und ebenso im Download).', voll: true, warum: 'Ansatz, Rechenweg mit Einheiten, Ergebnis und Antwortsatz.' },
      { text: '64 × 10 = 640, plus 20 % = 768', voll: false, warum: 'Rechnerisch richtig, aber ohne Einheiten und ohne Antwortsatz – je nach Korrektor Abzug.' },
    ],
  },
  {
    id: 'begruenden-ca',
    operator: 'begründen',
    punkte: 4,
    frage: 'Die Firma Möbel Krause will für ihr öffentliches Kundenportal ein Zertifikat einsetzen. Entscheiden Sie sich zwischen interner und öffentlicher CA und begründen Sie Ihre Entscheidung mit zwei Argumenten.',
    antworten: [
      { text: 'Öffentliche CA, weil sie besser ist und man das so macht.', voll: false, warum: 'Entscheidung ja, aber keine stichhaltigen Argumente.' },
      { text: 'Öffentliche CA: Die Kunden nutzen eigene Geräte, deren Browser der Root der öffentlichen CA bereits vertrauen – es erscheint keine Warnung. Eine interne CA müsste man auf allen Kundengeräten installieren, was bei externen Kunden nicht möglich ist.', voll: true, warum: 'Klare Entscheidung, zwei Argumente, und beide beziehen sich auf die Situation (Kunden mit eigenen Geräten).' },
      { text: 'Interne CA ist günstiger, öffentliche CA ist vertrauenswürdig.', voll: false, warum: 'Keine Entscheidung getroffen – nur Eigenschaften beider Seiten genannt.' },
    ],
  },
  {
    id: 'beschreiben-dhcp',
    operator: 'beschreiben',
    punkte: 4,
    frage: 'Beschreiben Sie, wie ein Client per DHCP eine IPv4-Adresse erhält.',
    antworten: [
      { text: 'DORA', voll: false, warum: 'Nur ein Merkwort – das ist nicht beschrieben.' },
      { text: 'Der Client sendet einen Discover als Broadcast. Der DHCP-Server antwortet mit einem Offer, das eine freie Adresse enthält. Der Client fordert diese Adresse per Request an, und der Server bestätigt mit einem Acknowledge; danach nutzt der Client die Adresse für die Leasedauer.', voll: true, warum: 'Der Ablauf wird Schritt für Schritt in eigenen Worten wiedergegeben.' },
      { text: 'Der Client bekommt die IP automatisch vom Server, weil DHCP aktiviert ist.', voll: false, warum: 'Zu allgemein – der Ablauf fehlt.' },
    ],
  },
  {
    id: 'vergleichen-cloud',
    operator: 'vergleichen',
    punkte: 4,
    frage: 'Vergleichen Sie On-Premises und Public Cloud hinsichtlich Kosten und Skalierbarkeit.',
    antworten: [
      { text: 'Public Cloud ist billiger und flexibler.', voll: false, warum: 'Nur eine Seite, und „billiger“ allein gilt als unpräzise – es fehlt die Gegenüberstellung.' },
      { text: 'Kosten: On-Premises hat hohe Anschaffungskosten und eigene Betriebskosten, die Cloud wird laufend nach Nutzung bezahlt. Skalierbarkeit: On-Premises muss Hardware gekauft und eingebaut werden, in der Cloud lassen sich Ressourcen innerhalb von Minuten erweitern oder verringern.', voll: true, warum: 'Beide Merkmale, jeweils beide Seiten – ein echter Vergleich.' },
      { text: 'On-Premises: eigene Server im Haus. Cloud: Server beim Anbieter.', voll: false, warum: 'Beschreibt nur, was die Begriffe bedeuten, nicht die gefragten Merkmale Kosten und Skalierbarkeit.' },
    ],
  },
  {
    id: 'erklaeren-latenz',
    operator: 'erklären',
    punkte: 3,
    frage: 'Erklären Sie, warum eine hohe Latenz bei vielen kleinen Datenbankabfragen besonders stört.',
    antworten: [
      { text: 'Jede Abfrage muss auf die Antwort der vorherigen warten. Weil bei kleinen Abfragen kaum Daten fließen, besteht die Gesamtzeit fast nur aus Wartezeit – die Latenz summiert sich mit jeder Abfrage.', voll: true, warum: 'Der Zusammenhang (warten → aufsummieren) wird gezeigt.' },
      { text: 'Weil die Leitung zu langsam ist.', voll: false, warum: 'Verwechselt Latenz mit Bandbreite – fachlich falsch.' },
      { text: 'Latenz = Verzögerung.', voll: false, warum: 'Nur eine Definition, kein „warum“.' },
    ],
  },
  {
    id: 'beurteilen-wpa2',
    operator: 'beurteilen',
    punkte: 4,
    frage: 'Beurteilen Sie, ob für das Gäste-WLAN eines Hotels WPA2-Enterprise sinnvoll ist.',
    antworten: [
      { text: 'Ja, weil Enterprise sicherer ist.', voll: false, warum: 'Urteil ohne Kriterien und ohne Bezug zur Situation.' },
      { text: 'Eher nicht. Enterprise braucht für jeden Gast eigene Zugangsdaten und einen RADIUS-Server – bei wechselnden Gästen ist das aufwendig. Für Gäste ist ein getrenntes Netz mit WPA3-Personal oder ein Gastportal mit Tagescodes praktikabler; Enterprise lohnt sich für das Personal-WLAN.', voll: true, warum: 'Kriterien (Aufwand, wechselnde Nutzer) werden abgewogen, Urteil mit Alternative.' },
      { text: 'WPA2-Enterprise nutzt 802.1X und RADIUS.', voll: false, warum: 'Nur eine Beschreibung – kein Urteil.' },
    ],
  },
  {
    id: 'nennen-nosql',
    operator: 'nennen',
    punkte: 2,
    frage: 'Nennen Sie zwei Typen nicht-relationaler Datenbanken.',
    antworten: [
      { text: 'MongoDB, MySQL', voll: false, warum: 'MySQL ist relational, MongoDB ist ein Produkt statt eines Typs – höchstens ein Teilpunkt.' },
      { text: 'Dokumentenorientierte Datenbank, Graphdatenbank', voll: true, warum: 'Zwei korrekte Typen – genau das ist gefragt.' },
      { text: 'NoSQL und Big Data', voll: false, warum: 'Oberbegriffe, keine Typen.' },
    ],
  },
  {
    id: 'erlaeutern-hash',
    operator: 'erläutern',
    punkte: 4,
    frage: 'Erläutern Sie, warum Passwörter als Hashwert und nicht im Klartext gespeichert werden.',
    antworten: [
      { text: 'Damit sie sicher sind.', voll: false, warum: 'Viel zu allgemein – keine Erläuterung.' },
      { text: 'Ein Hash lässt sich nicht in das Passwort zurückrechnen. Gelangt die Datenbank in falsche Hände, sehen Angreifer keine Passwörter und können sie nicht direkt bei anderen Diensten ausprobieren. Zur Anmeldung wird das eingegebene Passwort ebenfalls gehasht und mit dem gespeicherten Hash verglichen; ein zufälliger Salt verhindert zusätzlich, dass gleiche Passwörter gleiche Hashes ergeben.', voll: true, warum: 'Eigenschaft, Folge im Angriffsfall, Funktionsweise und eine Ergänzung (Salt) – eine echte Erläuterung.' },
      { text: 'Hashwerte sind verschlüsselte Passwörter.', voll: false, warum: 'Fachlich falsch: Hashing ist keine (umkehrbare) Verschlüsselung.' },
    ],
  },
];
