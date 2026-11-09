export type Status = 'rot' | 'gelb' | 'gruen';
export type PruefungKey = 'AP1' | 'AP2';

export interface Begriff {
  begriff: string;
  erklaerung: string;
}
export interface Tabelle {
  titel: string;
  kopf: string[];
  zeilen: string[][];
}
export interface Befehl {
  befehl: string;
  info: string;
}

export interface Unterthema {
  id: string;
  titel: string;
  begriffe: Begriff[];
  tabellen: Tabelle[];
  befehle: Befehl[];
  merksatz: string | null;
  frage: { frage: string; loesung: string[] } | null;
  abbildungen: Abbildung[];
  hatInhalt: boolean;
  status: Status;
  luecke: string;
  notiz: string;
  geaendert: string | null;
  inhaltAktualisiert: boolean;
}

export interface Bild {
  alt: string;
  datei: string;
  svg: string;
}

export interface Abbildung {
  titel: string;
  bilder: Bild[];
}

export interface VergleichKarte {
  titel: string;
  schema: string;
  bild: Bild | null;
  kurz: string;
  plus: string;
  minus: string;
  beispiel: string;
}

export interface AblaufTabelle {
  titel: string;
  kopf: string[];
  zeilen: string[][];
  /** Zeilen (Index), die in diesem Schritt neu sind oder sich geändert haben */
  neu?: number[];
}

export interface AblaufSchritt {
  titel: string;
  text: string;
  aktiv: number[];
  position: number;
  paket: string;
  blockiert?: boolean;
  regel?: number;
  hinweis?: string;
  zeilen: [string, string, string, boolean][];
  ziele?: number[];
  tabelle?: AblaufTabelle;
}

export interface AblaufSzenario {
  id: string;
  label: string;
  merksatz: string;
  geraete: { name: string; sub: string }[];
  regeln?: [string, string, string, string, string][];
  spalten?: [string, string, string];
  zeilenTitel?: string;
  schritte: AblaufSchritt[];
}

export interface TextAbschnitt {
  art: 'text' | 'checkliste' | 'vergleich';
  titel: string;
  absaetze: string[];
  bilder: Bild[];
  tabelle: Tabelle | null;
  punkte: string[];
  schritte: string[];
  karten: VergleichKarte[];
}

export interface Zusatz {
  id: string;
  titel: string;
  typ: 'ablauf' | 'text';
  /** vertiefte Unterthemen als "themenfeld.unterthema" */
  zu: string[];
  intro: string;
  absaetze: string[];
  abschnitte: TextAbschnitt[];
  szenarien: AblaufSzenario[];
  gelesen: boolean;
}

export interface Themenfeld {
  id: string;
  titel: string;
  icon: string;
  lernfelder: string[];
  pruefung: PruefungKey[];
  worum: string;
  fehler: string[];
  links: { titel: string; url: string; info: string }[];
  unterthemen: Unterthema[];
  zusatz: Zusatz[];
}

export interface Einstellungen {
  ausbildungsbeginn: string;
  zwischenpruefung: string;
  abschlusspruefung: string;
  theme: 'auto' | 'light' | 'dark';
  gesehene_version: string;
  /** 'ja' = vor dem Umstellen einer Ampel nachfragen */
  ampel_bestaetigen: 'ja' | 'nein';
  azubi_name: string;
  ausbildungsberuf: string;
  ausbildungsbetrieb: string;
  ausbilder: string;
  /** Wochenarbeitszeit in Stunden, als Text gespeichert */
  wochenstunden: string;
  /** 'ja' = eigene Unterschrift auf jedem Nachweis mitdrucken */
  azubi_unterschrift_drucken: 'ja' | 'nein';
  /** Verkürzung in Monaten als Text ('0'–'18') */
  verkuerzung_monate: string;
  verkuerzung_art: 'ende' | 'anfang';
  verkuerzung_zeitpunkt: 'vertrag' | 'nachtraeglich';
  verkuerzung_grund: string;
  /** abweichendes Vertragsende oder leer */
  vertragsende: string;
  vorzeitige_zulassung: 'ja' | 'nein';
  /** Companion „Hoodie“ unten links */
  companion: 'an' | 'aus';
  companion_haeufigkeit: 'selten' | 'normal' | 'gespraechig';
}

export type PlanArt = 'schule' | 'aufgabe' | 'notiz' | 'thema';

export interface PlanEintrag {
  id: number;
  art: PlanArt;
  /** Montag der ersten Woche (JJJJ-MM-TT) */
  von: string;
  /** Montag der letzten Woche (JJJJ-MM-TT) */
  bis: string;
  titel: string;
  text: string;
  themenfeld: string;
  erledigt: number;
  /** nur bei Aufgaben */
  unteraufgaben: Unteraufgabe[];
  geaendert: string;
}

export interface Unteraufgabe {
  text: string;
  erledigt: boolean;
}

export type PlanWerte = Pick<PlanEintrag, 'art' | 'von' | 'bis' | 'titel' | 'text' | 'themenfeld'> & {
  erledigt?: boolean;
  unteraufgaben?: Unteraufgabe[];
};

export interface VersionInfo {
  app: string;
  commit: string;
  build: string;
  schema: number;
  inhalt: string;
  letzteSicherung: string | null;
}

export interface ChangelogEintrag {
  version: string;
  datum: string;
  gruppen: { titel: string; punkte: string[] }[];
}

export interface InhaltsStand {
  stand: string;
  themenfelder: number;
  befuellt: number;
  unterthemenMitInhalt: number;
  unterthemenGeruest: number;
}

export interface Ferienzeit {
  name: string;
  von: string;
  bis: string;
}

export interface Ferien {
  land: string;
  quelle: string;
  stand: string;
  hinweis: string;
  ferien: Ferienzeit[];
}

export type BerichtStatus = 'entwurf' | 'fertig' | 'abgezeichnet';
export type AbwesenheitGrund = 'urlaub' | 'krank' | 'feiertag' | 'sonstiges';

export interface Posten {
  text: string;
  stunden: number;
}

export interface Abwesenheit {
  tag: string;
  grund: AbwesenheitGrund;
  stunden: number;
  text: string;
}

export interface BerichtInhalt {
  betrieb: Posten[];
  unterweisung: Posten[];
  schule: Posten[];
  abwesenheit: Abwesenheit[];
}

/** Gezeichnete Unterschrift als SVG-Pfad im Feld 600 × 200 */
export interface Unterschrift {
  name: string;
  datum: string;
  pfad: string;
}

export interface Bericht {
  /** Montag der Berichtswoche */
  montag: string;
  status: BerichtStatus;
  abgezeichnetAm: string | null;
  inhalt: BerichtInhalt;
  /** digitale Unterschrift des Ausbilders, falls so abgezeichnet */
  unterschrift: Unterschrift | null;
  geaendert: string;
}

/** Lernstand einer Karteikarte (Leitner-Fach 1–5) */
export interface KartenStand {
  id: string;
  fach: number;
  faellig: string;
  richtig: number;
  falsch: number;
  zuletzt: string;
}

export interface Versuch {
  id: number;
  pruefung: PruefungKey;
  datum: string;
  fragen: number;
  richtig: number;
  dauer: number;
  felder: Record<string, [number, number]>;
}

export interface ProjektPhase {
  name: string;
  soll: number;
  ist: number;
}

/** Abschlussprojekt (Teil 2) */
export interface Projekt {
  titel: string;
  auftraggeber: string;
  termine: Record<string, string>;
  antrag: Record<string, boolean>;
  doku: Record<string, boolean>;
  phasen: ProjektPhase[];
  fragen: Record<string, string>;
  notizen: string;
}
