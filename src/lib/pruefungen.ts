import type { PruefungKey } from '../types';

export interface Pruefungsteil {
  titel: string;
  dauer: string;
  art: string;
  /** Anteil an der Endnote */
  gewicht: string;
  hinweis?: string;
}

export interface Pruefung {
  name: string;
  sub: string;
  teile: Pruefungsteil[];
  /** Was im Prüfungsbereich nachzuweisen ist (FIAusbV) */
  inhalte: { titel: string; punkte: string[] }[];
  /** Bewertung und Bestehen */
  regeln: string[];
}

/** Gestreckte Abschlussprüfung nach der Fachinformatikerausbildungsverordnung (FIAusbV) 2020, §§ 7–9 und 18–25. */
export const PRUEFUNGEN: Record<PruefungKey, Pruefung> = {
  AP1: {
    name: 'Abschlussprüfung Teil 1',
    sub: 'Im 4. Ausbildungshalbjahr · zählt schon 20 % zur Endnote · früher oft „Zwischenprüfung“ genannt',
    teile: [{ titel: 'Einrichten eines IT-gestützten Arbeitsplatzes', dauer: '90 min', art: 'schriftlich', gewicht: '20 %' }],
    inhalte: [
      {
        titel: 'Einrichten eines IT-gestützten Arbeitsplatzes (§ 9)',
        punkte: [
          'Kundenbedarfe zielgruppengerecht ermitteln',
          'Hard- und Software auswählen und ihre Beschaffung einleiten',
          'IT-Arbeitsplatz konfigurieren und testen – mit Datenschutz, IT-Sicherheit und Qualitätssicherung',
          'Kunden in die Nutzung des Arbeitsplatzes einweisen',
          'Leistungserbringung kontrollieren und protokollieren',
        ],
      },
    ],
    regeln: [
      'Stoff: die Inhalte der ersten 18 Monate aus dem Ausbildungsrahmenplan, Abschnitt A Nr. 1–7 – auch Programmiergrundlagen, Algorithmen und Datenbanken.',
      'Teil 1 kann nicht eigenständig wiederholt werden – auch eine schwache Note geht mit 20 % in das Gesamtergebnis ein. Gut vorbereiten lohnt sich.',
      'Die Aufgaben sind praxisbezogen und werden schriftlich bearbeitet.',
    ],
  },
  AP2: {
    name: 'Abschlussprüfung Teil 2',
    sub: 'Am Ende der Ausbildung · Fachrichtung Systemintegration · vor der Handelskammer Hamburg',
    teile: [
      {
        titel: 'Planen und Umsetzen eines Projektes der Systemintegration',
        dauer: 'max. 40 h + 30 min',
        art: 'Projekt + mündlich',
        gewicht: '50 %',
        hinweis: 'Projektarbeit mit Dokumentation (50 %) sowie Präsentation (max. 15 min) und Fachgespräch, zusammen max. 30 min (50 %)',
      },
      { titel: 'Konzeption und Administration von IT-Systemen', dauer: '90 min', art: 'schriftlich', gewicht: '10 %' },
      { titel: 'Analyse und Entwicklung von Netzwerken', dauer: '90 min', art: 'schriftlich', gewicht: '10 %' },
      { titel: 'Wirtschafts- und Sozialkunde', dauer: '60 min', art: 'schriftlich', gewicht: '10 %' },
    ],
    inhalte: [
      {
        titel: 'Projekt (§ 20)',
        punkte: [
          'Anforderungen analysieren, Lösungsalternativen technisch, wirtschaftlich und qualitativ vergleichen',
          'Systemänderungen durchführen und übergeben, IT-Systeme einführen und pflegen',
          'Schwachstellen analysieren, Schutzmaßnahmen vorschlagen und umsetzen',
          'Projekt dokumentieren, präsentieren und das Vorgehen im Fachgespräch begründen',
        ],
      },
      {
        titel: 'Konzeption und Administration von IT-Systemen (§ 21)',
        punkte: [
          'IT-Systeme für unterschiedliche Anforderungen planen und konfigurieren',
          'IT-Systeme administrieren und betreiben',
          'Speicherlösungen integrieren und verwalten',
          'Programme zur automatisierten Systemverwaltung erstellen',
        ],
      },
      {
        titel: 'Analyse und Entwicklung von Netzwerken (§ 22)',
        punkte: [
          'Netzwerkprotokolle anwendungsbezogen auswählen und einsetzen',
          'Netzwerkkomponenten bedarfsgerecht auswählen und konfigurieren',
          'IT-Sicherheit in Netzwerken sicherstellen',
          'Betrieb und Verfügbarkeit von Netzwerken überwachen und gewährleisten',
        ],
      },
      {
        titel: 'Wirtschafts- und Sozialkunde (§ 23)',
        punkte: ['Wirtschaftliche und gesellschaftliche Zusammenhänge der Berufs- und Arbeitswelt darstellen und beurteilen'],
      },
    ],
    regeln: [
      'Gesamtergebnis aus Teil 1 und Teil 2 mindestens „ausreichend“.',
      'Ergebnis von Teil 2 für sich mindestens „ausreichend“.',
      'In mindestens drei der vier Prüfungsbereiche von Teil 2 mindestens „ausreichend“.',
      'In keinem Prüfungsbereich von Teil 2 „ungenügend“.',
      'Mündliche Ergänzungsprüfung (15 min) auf Antrag in einem einzigen schriftlichen Bereich von Teil 2 möglich, wenn er schlechter als „ausreichend“ ist und das Bestehen davon abhängt; Gewichtung alt : neu = 2 : 1.',
    ],
  },
};

export const KAMMER_LINKS = {
  pruefungstermine:
    'https://www.handelskammer-hamburg.de/aus-und-weiterbildung/aus-und-fortbildungspruefungen/pruefungen/it-berufe/pruefungstermine-it-berufe-6776926',
  ausbildungsnachweise: 'https://www.handelskammer-hamburg.de/aus-und-weiterbildung/ausbildungsnachweise-6775234',
  verkuerzung: 'https://www.handelskammer-hamburg.de/aus-und-weiterbildung/kuerzungnachbeginn-6779606',
};

/** Verkürzen oder vorzeitig zur Prüfung? Grundlage: BBiG §§ 7, 8, 21, 45 und Hinweise der Handelskammer Hamburg. */
export const VERKUERZUNG_INFO: { merkmal: string; verkuerzung: string; vorzeitig: string }[] = [
  { merkmal: 'Was passiert', verkuerzung: 'Die Vertragslaufzeit wird kürzer.', vorzeitig: 'Du gehst früher zur Prüfung, der Vertrag bleibt wie er ist.' },
  { merkmal: 'Wann', verkuerzung: 'Im Vertrag oder nachträglich – dann so, dass noch mindestens ein Jahr Ausbildung bleibt.', vorzeitig: 'Mit der Anmeldung zur Prüfung, in der Regel bis zu sechs Monate vor dem Vertragsende.' },
  { merkmal: 'Voraussetzung', verkuerzung: 'Schulabschluss (Mittlere Reife bis 6, Fachhochschulreife/Abitur bis 12 Monate), Vorausbildung, Alter über 21 – und das Ausbildungsziel wird in der kürzeren Zeit erreicht.', vorzeitig: 'Überdurchschnittliche Leistungen in Betrieb und Berufsschule, Zustimmung des Betriebs.' },
  { merkmal: 'Antrag', verkuerzung: 'Gemeinsam von Betrieb und Azubi bei der Handelskammer.', vorzeitig: 'Bei der Prüfungsanmeldung, mit Stellungnahmen von Betrieb und Berufsschule.' },
  { merkmal: 'Ende der Ausbildung', verkuerzung: 'Am neuen Vertragsende – oder früher mit bestandener Prüfung.', vorzeitig: 'Mit Bekanntgabe des Ergebnisses der bestandenen Prüfung.' },
  { merkmal: 'Grenze', verkuerzung: 'Mindestdauer bei drei Jahren Regelzeit: 18 Monate.', vorzeitig: 'Wer nicht besteht, bleibt bis zum regulären Vertragsende in der Ausbildung.' },
];
