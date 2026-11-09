import type { KartenStand, PruefungKey, Status, Themenfeld, Unterthema } from '../types';

/** Eine Karteikarte: aus einem Kernbegriff oder aus der Prüfungsfrage eines Unterthemas. */
export interface Karte {
  id: string;
  art: 'begriff' | 'frage';
  feld: string;
  feldTitel: string;
  unterthema: string;
  unterthemaTitel: string;
  vorne: string;
  /** Begriff: Erklärung; Frage: Lösungsschritte */
  hinten: string[];
}

export function alleKarten(felder: Themenfeld[]): Karte[] {
  const k: Karte[] = [];
  for (const f of felder) {
    for (const u of f.unterthemen) {
      const basis = { feld: f.id, feldTitel: f.titel, unterthema: u.id, unterthemaTitel: u.titel };
      for (const b of u.begriffe) {
        k.push({ ...basis, id: `b:${f.id}.${u.id}:${b.begriff}`, art: 'begriff', vorne: b.begriff, hinten: [b.erklaerung] });
      }
      if (u.frage) k.push({ ...basis, id: `f:${f.id}.${u.id}`, art: 'frage', vorne: u.frage.frage, hinten: u.frage.loesung });
    }
  }
  return k;
}

/** Zufall mit Startwert – damit eine Runde beim Neuzeichnen gleich bleibt. */
export function zufall(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mische<T>(l: T[], r: () => number): T[] {
  const x = [...l];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

/** Ersetzt den gesuchten Begriff (und seine Teile in Klammern) in der Erklärung durch „…“, damit die Frage ihn nicht verrät. */
export function maskiere(text: string, begriff: string): string {
  const teile = [begriff, ...begriff.split(/[()/,]/)].map((t) => t.trim()).filter((t) => t.length >= 3);
  let s = text;
  for (const t of teile.sort((a, b) => b.length - a.length)) {
    s = s.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '…');
  }
  return s;
}

export interface McFrage {
  id: string;
  karte: Karte;
  text: string;
  optionen: string[];
  richtig: number;
}

/**
 * Multiple Choice aus Kernbegriffen: Erklärung gegeben, passender Begriff gesucht.
 * Falsche Antworten kommen bevorzugt aus demselben Unterthema bzw. Themenfeld – das macht es knifflig.
 */
export function mcFragen(karten: Karte[], anzahl: number, r: () => number): McFrage[] {
  const begriffe = karten.filter((k) => k.art === 'begriff');
  const fragen: McFrage[] = [];
  for (const k of mische(begriffe, r)) {
    if (fragen.length >= anzahl) break;
    const text = maskiere(k.hinten[0], k.vorne);
    if (text.replace(/[…\s]/g, '').length < 12) continue; // nach dem Maskieren zu wenig übrig
    const gleich = (a: string) => a.toLowerCase() === k.vorne.toLowerCase();
    const nah = mische(begriffe.filter((x) => x.unterthema === k.unterthema && x.feld === k.feld && !gleich(x.vorne)), r);
    const feld = mische(begriffe.filter((x) => x.feld === k.feld && x.unterthema !== k.unterthema && !gleich(x.vorne)), r);
    const rest = mische(begriffe.filter((x) => x.feld !== k.feld), r);
    const falsch: string[] = [];
    for (const x of [...nah.slice(0, 2), ...feld, ...rest]) {
      if (falsch.length >= 3) break;
      if (!falsch.some((y) => y.toLowerCase() === x.vorne.toLowerCase())) falsch.push(x.vorne);
    }
    if (falsch.length < 3) continue;
    const optionen = mische([k.vorne, ...falsch], r);
    fragen.push({ id: k.id, karte: k, text, optionen, richtig: optionen.indexOf(k.vorne) });
  }
  return fragen;
}

/** Fällige Karten zuerst (nie gesehene zählen als fällig), dann nach Fach. */
export function faellige(karten: Karte[], stand: Map<string, KartenStand>, heute: string): Karte[] {
  return karten.filter((k) => {
    const s = stand.get(k.id);
    return !s || s.faellig <= heute;
  });
}

/** Notenschlüssel der IHK (100-Punkte-Skala). */
export function note(prozent: number): { note: number; text: string } {
  if (prozent >= 92) return { note: 1, text: 'sehr gut' };
  if (prozent >= 81) return { note: 2, text: 'gut' };
  if (prozent >= 67) return { note: 3, text: 'befriedigend' };
  if (prozent >= 50) return { note: 4, text: 'ausreichend' };
  if (prozent >= 30) return { note: 5, text: 'mangelhaft' };
  return { note: 6, text: 'ungenügend' };
}

export interface AmpelVorschlag {
  id: string;
  feldTitel: string;
  unterthema: Unterthema;
  von: Status;
  nach: Status;
  grund: string;
}

/**
 * Vorschläge für die Ampel aus dem Kartenstand:
 * - alle Karten eines Unterthemas mindestens in Fach 3 → „Sicher“
 * - Rot, aber schon Karten gewusst → „In Arbeit“
 * - Sicher, aber mehrere Karten zuletzt nicht gewusst → zurück auf „In Arbeit“
 */
export function ampelVorschlaege(felder: Themenfeld[], karten: Karte[], stand: Map<string, KartenStand>, nur?: Set<string>): AmpelVorschlag[] {
  const v: AmpelVorschlag[] = [];
  for (const f of felder) {
    for (const u of f.unterthemen) {
      const id = `${f.id}.${u.id}`;
      if (nur && !nur.has(id)) continue;
      const ks = karten.filter((k) => k.feld === f.id && k.unterthema === u.id);
      if (!ks.length) continue;
      const ss = ks.map((k) => stand.get(k.id));
      const gesehen = ss.filter(Boolean).length;
      const sicher = ss.filter((s) => s && s.fach >= 3).length;
      const vergessen = ss.filter((s) => s && s.fach === 1 && s.falsch > 0).length;
      if (u.status !== 'gruen' && sicher === ks.length) {
        v.push({ id, feldTitel: f.titel, unterthema: u, von: u.status, nach: 'gruen', grund: `alle ${ks.length} Karten mehrfach gewusst` });
      } else if (u.status === 'rot' && gesehen >= Math.ceil(ks.length / 2) && ss.filter((s) => s && s.fach >= 2).length >= Math.min(2, ks.length)) {
        v.push({ id, feldTitel: f.titel, unterthema: u, von: 'rot', nach: 'gelb', grund: `${gesehen} von ${ks.length} Karten geübt, mehrere gewusst` });
      } else if (u.status === 'gruen' && vergessen >= Math.max(2, Math.ceil(ks.length / 3))) {
        v.push({ id, feldTitel: f.titel, unterthema: u, von: 'gruen', nach: 'gelb', grund: `${vergessen} Karten zuletzt nicht gewusst` });
      }
    }
  }
  return v;
}

export function relevanteFelder(felder: Themenfeld[], pruefung: PruefungKey): Themenfeld[] {
  return felder.filter((f) => f.pruefung.includes(pruefung));
}
