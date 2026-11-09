/**
 * Inhalte des Projekt-Begleiters. Grundlage: Merkblatt „Betriebliche Projektarbeit IT-Berufe 2026“
 * der Handelskammer Hamburg und FIAusbV § 20 (Fachinformatiker Systemintegration).
 */
export const MERKBLATT_URL =
  'https://www.handelskammer-hamburg.de/blueprint/servlet/resource/blob/7140672/8fe3a3dd5f599945a10aa367fbcebdad/merkblatt-betriebliche-projektarbeit-it-berufe-2026-data.pdf';
export const ANTRAGSPORTAL_URL = 'https://projektantraege.gfi.ihk.de';
export const MAX_STUNDEN = 40;

export const TERMINE: { key: string; label: string; kurz: string; hinweis: string }[] = [
  { key: 'antrag', label: 'Projektantrag abgeben bis', kurz: 'Projektantrag fällig', hinweis: 'Das Portal schließt um 24 Uhr am Abgabetag – lieber früher hochladen.' },
  { key: 'genehmigung', label: 'Antrag genehmigt am', kurz: 'Antrag genehmigt', hinweis: 'Vorher darfst du mit dem Projekt nicht beginnen.' },
  { key: 'start', label: 'Durchführungszeitraum ab', kurz: 'Projektstart', hinweis: 'Gibt die Handelskammer vor.' },
  { key: 'ende', label: 'Durchführungszeitraum bis', kurz: 'Projektende', hinweis: 'Spätestens jetzt muss die Dokumentation hochgeladen sein.' },
  { key: 'doku', label: 'Dokumentation hochladen bis', kurz: 'Projektdoku fällig', hinweis: 'Verspätete Abgabe kann mit 0 Punkten bewertet werden.' },
  { key: 'praesentation', label: 'Präsentation und Fachgespräch am', kurz: 'Präsentation + Fachgespräch', hinweis: 'Präsentation höchstens 15 Minuten, zusammen höchstens 30 Minuten.' },
];

/** Eingetragene Projekttermine (für den Ausbildungsplan), nach Datum sortiert. */
export function projektTermine(p: { termine: Record<string, string> } | undefined): { key: string; kurz: string; datum: string }[] {
  if (!p) return [];
  return TERMINE.filter((t) => /^\d{4}-\d{2}-\d{2}$/.test(p.termine[t.key] ?? ''))
    .map((t) => ({ key: t.key, kurz: t.kurz, datum: p.termine[t.key] }))
    .sort((a, b) => a.datum.localeCompare(b.datum));
}

export interface Punkt {
  id: string;
  text: string;
  hilfe?: string;
}

export const ANTRAG: { titel: string; punkte: Punkt[] }[] = [
  {
    titel: 'Pflichtangaben im Online-Antrag',
    punkte: [
      { id: 'thema', text: 'Thema bzw. Projektbezeichnung', hilfe: 'Aussagekräftig: Was wird für wen umgesetzt?' },
      { id: 'zeitraum', text: 'Geplanter Bearbeitungszeitraum', hilfe: 'Innerhalb des vorgegebenen Durchführungszeitraums, höchstens 40 Stunden.' },
      { id: 'ausgang', text: 'Ausgangssituation und Projektbeschreibung', hilfe: 'Ist-Zustand, Auftraggeber (intern oder extern), Zielgruppe.' },
      { id: 'ziel', text: 'Projektziel', hilfe: 'Soll-Zustand und Nutzen für den Auftraggeber.' },
      { id: 'zeitplan', text: 'Zeitplanung mit Phasen und Stunden', hilfe: 'Muss eine Kosten-Nutzen-Analyse oder eine Ist-Soll-Analyse enthalten. Keine grafische Zeitplanung als PDF-Anhang.' },
      { id: 'praesmittel', text: 'Präsentationsmittel und Zielgruppe der Präsentation' },
      { id: 'anlagen', text: 'Anlagen nur, wenn sie zum Verständnis nötig sind' },
    ],
  },
  {
    titel: 'Damit der Antrag genehmigt wird',
    punkte: [
      { id: 'real', text: 'Realer Auftrag mit echter Durchführung', hilfe: 'Eine rein planerische oder virtuelle Betrachtung ist nicht zulässig – kann 0 Punkte bedeuten.' },
      { id: 'eigen', text: 'Eigene Leistung klar erkennbar', hilfe: 'Schnittstellen und Fremdleistungen kennzeichnen und von deiner Arbeit abgrenzen.' },
      { id: 'umfang', text: 'Umfang, Aufwand und Verantwortlichkeiten erkennbar' },
      { id: 'technik', text: 'Eingesetzte Hard- und Software genannt' },
      { id: 'laien', text: 'Für Fachfremde verständlich', hilfe: 'Fachbegriffe beim ersten Auftreten ausschreiben und kurz erklären.' },
      { id: 'machbar', text: 'Im Betrieb zeitlich, kostenmäßig und technisch durchführbar' },
    ],
  },
  {
    titel: 'Abgabe',
    punkte: [
      { id: 'portal', text: 'Über das Portal „Digitaler Projektantrag“ eingereicht', hilfe: 'Zugang über das Azubi-Infocenter, ca. zwei Wochen nach Anmeldeschluss.' },
      { id: 'mail', text: 'E-Mail-Postfach im Blick', hilfe: 'Genehmigung oder Ablehnung kommen nur per E-Mail. Ein abgelehnter Antrag kann überarbeitet werden, solange Zeit ist.' },
      { id: 'warten', text: 'Erst nach der Genehmigung anfangen' },
    ],
  },
];

export const DOKU: { titel: string; punkte: Punkt[] }[] = [
  {
    titel: 'Aufbau (Empfehlung der Handelskammer)',
    punkte: [
      { id: 'deckblatt', text: 'Deckblatt', hilfe: 'Name, Thema, Ausbildungsberuf, Prüfungszeitraum.' },
      { id: 'inhalt', text: 'Inhaltsverzeichnis mit Seitenzahlen' },
      { id: 'einleitung', text: 'Einleitung mit Zielsetzung' },
      { id: 'planung', text: 'Projektplanung', hilfe: 'Zeitplan, Meilensteine, Ressourcen.' },
      { id: 'wirtschaft', text: 'Betriebswirtschaftliche Betrachtung', hilfe: 'Wo sinnvoll, z. B. Kosten-Nutzen-Analyse oder Amortisation.' },
      { id: 'umsetzung', text: 'Projektumsetzung', hilfe: 'Vorgehen, Technik, Methoden, Probleme und ihre Lösung.' },
      { id: 'ergebnis', text: 'Ergebnisse', hilfe: 'Screenshots, Konfigurationsauszüge, Diagramme, Testprotokoll.' },
      { id: 'fazit', text: 'Reflexion und Fazit', hilfe: 'Soll-Ist-Vergleich der Zeit, was würdest du heute anders machen?' },
      { id: 'quellen', text: 'Quellenangaben (Pflicht)' },
      { id: 'erklaerung', text: 'Ehrenwörtliche Erklärung im Anhang' },
    ],
  },
  {
    titel: 'Form',
    punkte: [
      { id: 'seiten', text: '10 bis 15 Seiten, höchstens 20 inklusive Anlagen' },
      { id: 'format', text: 'DIN A4, einheitliche Schrift (z. B. Arial, Calibri), 11 pt, einfacher Zeilenabstand' },
      { id: 'nummern', text: 'Durchgängige Seitennummerierung' },
      { id: 'ki', text: 'Mit KI erstellte Textstellen gekennzeichnet', hilfe: 'KI ist erlaubt, die Stellen zählen aber nicht als eigene Prüfungsleistung.' },
      { id: 'datenschutz', text: 'Interne Daten mit dem Betreuer abgestimmt, ggf. anonymisiert oder geschwärzt' },
      { id: 'abgabe', text: 'Rechtzeitig im Portal unter „Dokumente“ hochgeladen' },
    ],
  },
];

/** Typische Fragen im Fachgespräch – zum Üben mit eigenen Stichworten. */
export const FRAGEN: { id: string; text: string }[] = [
  { id: 'warum', text: 'Warum haben Sie sich für genau diese Lösung entschieden?' },
  { id: 'alternativen', text: 'Welche Alternativen haben Sie geprüft und warum verworfen?' },
  { id: 'anders', text: 'Was würden Sie heute anders machen?' },
  { id: 'plan', text: 'Wo sind Sie vom Zeitplan abgewichen und wie haben Sie reagiert?' },
  { id: 'test', text: 'Wie haben Sie getestet, dass die Lösung funktioniert?' },
  { id: 'kosten', text: 'Was kostet die Lösung, und wann rechnet sie sich?' },
  { id: 'sicherheit', text: 'Wie haben Sie Datensicherheit und Datenschutz berücksichtigt?' },
  { id: 'ausfall', text: 'Was passiert, wenn ein Teil der Lösung ausfällt?' },
  { id: 'backup', text: 'Wie wird die Lösung gesichert und wiederhergestellt?' },
  { id: 'laie', text: 'Erklären Sie den Kern Ihres Projekts so, dass ihn ein Laie versteht.' },
  { id: 'auftraggeber', text: 'Wie haben Sie den Auftraggeber eingebunden und wie lief die Abnahme?' },
  { id: 'betrieb', text: 'Wer betreut die Lösung nach der Übergabe, und wie ist sie dokumentiert?' },
  { id: 'lizenzen', text: 'Welche Lizenzen oder rechtlichen Punkte waren zu beachten?' },
  { id: 'erweitern', text: 'Wie ließe sich die Lösung erweitern oder skalieren?' },
  { id: 'begriff', text: 'Erklären Sie einen Fachbegriff aus Ihrer Präsentation genauer.' },
];
