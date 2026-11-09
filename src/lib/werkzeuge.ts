/**
 * Logik der interaktiven Prüfungs-Werkzeuge (Üben → Werkzeuge). Alles ohne React, damit es testbar bleibt.
 */
import { ipZuZahl } from './rechner';

// ================================================================ Subnetting-Bits

/** 32 Bits einer IPv4-Adresse als Ziffernfolge (höchstwertiges Bit zuerst). */
export function bits32(n: number): string {
  return (n >>> 0).toString(2).padStart(32, '0');
}

export function maskeAus(praefix: number): number {
  return praefix <= 0 ? 0 : (0xffffffff << (32 - praefix)) >>> 0;
}

// ================================================================ RAID

export type RaidLevel = '0' | '1' | '5' | '6' | '10';

export const RAID_INFO: Record<RaidLevel, { name: string; min: number; gerade?: boolean; prinzip: string }> = {
  '0': { name: 'RAID 0', min: 2, prinzip: 'Striping: Daten blockweise auf alle Platten verteilt – schnell, aber keine Redundanz.' },
  '1': { name: 'RAID 1', min: 2, prinzip: 'Mirroring: Jede Platte enthält dieselben Daten.' },
  '5': { name: 'RAID 5', min: 3, prinzip: 'Striping mit verteilter Parität: Pro Stripe ein Paritätsblock, reihum auf allen Platten.' },
  '6': { name: 'RAID 6', min: 4, prinzip: 'Striping mit doppelter Parität (P und Q) – zwei beliebige Platten dürfen ausfallen.' },
  '10': { name: 'RAID 10', min: 4, gerade: true, prinzip: 'Stripe über Spiegelpaare (RAID 1+0): Platte 1+2, 3+4 … spiegeln sich, darüber Striping.' },
};

export interface RaidZustand {
  status: 'ok' | 'degradiert' | 'verloren';
  /** nutzbare Kapazität in Plattengrößen */
  nutzbar: number;
  /** wie viele Ausfälle sicher verkraftet werden */
  toleranz: number;
  text: string;
}

export function raidZustand(level: RaidLevel, n: number, ausgefallen: number[]): RaidZustand {
  const aus = new Set(ausgefallen.filter((i) => i >= 0 && i < n));
  const k = aus.size;
  const nutzbar = { '0': n, '1': 1, '5': n - 1, '6': n - 2, '10': n / 2 }[level];
  const toleranz = { '0': 0, '1': n - 1, '5': 1, '6': 2, '10': 1 }[level];
  let verloren: boolean;
  if (level === '0') verloren = k >= 1;
  else if (level === '1') verloren = k >= n;
  else if (level === '5') verloren = k >= 2;
  else if (level === '6') verloren = k >= 3;
  else {
    verloren = false;
    for (let p = 0; p < n; p += 2) if (aus.has(p) && aus.has(p + 1)) verloren = true;
  }
  if (k === 0) return { status: 'ok', nutzbar, toleranz, text: 'Alle Platten laufen.' };
  if (verloren) {
    const grund =
      level === '0'
        ? 'RAID 0 hat keine Redundanz – fällt eine Platte aus, fehlen in jedem Stripe Blöcke.'
        : level === '10'
          ? 'Beide Platten eines Spiegelpaars sind ausgefallen – dieser Teil des Stripes ist weg.'
          : `Es sind mehr Platten ausgefallen, als die Parität ausgleichen kann (${level === '5' ? 'eine' : 'zwei'}).`;
    return { status: 'verloren', nutzbar, toleranz, text: `${grund} Jetzt hilft nur noch das Backup.` };
  }
  const rest =
    level === '1'
      ? 'Der Spiegel liefert alle Daten.'
      : level === '10'
        ? 'Der Partner im Spiegelpaar springt ein.'
        : 'Fehlende Blöcke werden bei jedem Lesen aus den übrigen Daten und der Parität berechnet – das kostet Leistung.';
  return {
    status: 'degradiert',
    nutzbar,
    toleranz,
    text: `Die Daten sind noch da. ${rest} Platte schnell tauschen: Während des Rebuilds ist das Array besonders gefährdet.`,
  };
}

/** Blockbelegung für die Grafik: je Platte eine Liste von Blöcken pro Stripe. „p“/„q“ markieren Parität. */
export function raidBloecke(level: RaidLevel, n: number, stripes = 4): { text: string; art: 'daten' | 'paritaet' | 'spiegel' }[][] {
  const platten = Array.from({ length: n }, () => [] as { text: string; art: 'daten' | 'paritaet' | 'spiegel' }[]);
  for (let s = 0; s < stripes; s++) {
    const L = String.fromCharCode(65 + s);
    if (level === '0') for (let d = 0; d < n; d++) platten[d].push({ text: `${L}${d + 1}`, art: 'daten' });
    else if (level === '1') for (let d = 0; d < n; d++) platten[d].push({ text: L, art: d === 0 ? 'daten' : 'spiegel' });
    else if (level === '10')
      for (let d = 0; d < n; d++) platten[d].push({ text: `${L}${Math.floor(d / 2) + 1}`, art: d % 2 === 0 ? 'daten' : 'spiegel' });
    else {
      const anzP = level === '5' ? 1 : 2;
      const p = (n - 1 - (s % n) + n) % n;
      const q = (p + 1) % n;
      let nr = 1;
      for (let d = 0; d < n; d++) {
        if (d === p) platten[d].push({ text: `${L}p`, art: 'paritaet' });
        else if (anzP === 2 && d === q) platten[d].push({ text: `${L}q`, art: 'paritaet' });
        else platten[d].push({ text: `${L}${nr++}`, art: 'daten' });
      }
    }
  }
  return platten;
}

// ================================================================ Backup

export type SicherungsArt = 'voll' | 'inkr' | 'diff' | 'keine';
export const TAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export interface SicherungsTag {
  tag: number;
  art: SicherungsArt;
  /** sichert Änderungen ab Tag (einschließlich); null = alles (Vollsicherung) */
  ab: number | null;
  /** Archivbit nach der Sicherung zurückgesetzt? */
  setztZurueck: boolean;
}

/**
 * Was jede Sicherung enthält – über das Archivbit: Voll und inkrementell setzen es zurück,
 * differenziell lässt es stehen. Jeder Tag hat Änderungen.
 */
export function sicherungsInhalt(plan: SicherungsArt[]): SicherungsTag[] {
  let letzteRuecksetzung: number | null = null; // Tag der letzten Voll- oder Inkr.-Sicherung
  return plan.map((art, tag) => {
    if (art === 'keine') return { tag, art, ab: null, setztZurueck: false };
    if (art === 'voll') {
      letzteRuecksetzung = tag;
      return { tag, art, ab: null, setztZurueck: true };
    }
    // ohne vorherige Rücksetzung: alles, was ein Archivbit hat – also seit Wochenbeginn
    const ab = letzteRuecksetzung === null ? 0 : letzteRuecksetzung + 1;
    if (art === 'inkr') letzteRuecksetzung = tag;
    return { tag, art, ab, setztZurueck: art === 'inkr' };
  });
}

export interface Wiederherstellung {
  moeglich: boolean;
  /** Tage der benötigten Sicherungen in Einspiel-Reihenfolge */
  kette: number[];
  /** Stand nach der Wiederherstellung (Tag der letzten Sicherung) */
  stand: number | null;
  text: string;
}

/** Kürzeste Kette von Sicherungen, die nach einem Ausfall am Ende von Tag `ausfall` den letzten Stand herstellt. */
export function wiederherstellung(plan: SicherungsArt[], ausfall: number): Wiederherstellung {
  const inhalt = sicherungsInhalt(plan).slice(0, ausfall + 1);
  const voll = [...inhalt].reverse().find((s) => s.art === 'voll');
  if (!voll) return { moeglich: false, kette: [], stand: null, text: 'Vor dem Ausfall gibt es in dieser Woche keine Vollsicherung – ohne sie lässt sich nichts aufbauen.' };
  const ziel = [...inhalt].reverse().find((s) => s.art !== 'keine')!.tag;
  const kette = [voll.tag];
  let stand = voll.tag;
  while (stand < ziel) {
    // passt nahtlos an (ab ≤ stand + 1) und reicht am weitesten
    const kandidaten = inhalt.filter((s) => s.art !== 'keine' && s.art !== 'voll' && s.tag > stand && s.ab !== null && s.ab <= stand + 1);
    if (!kandidaten.length) break;
    const best = kandidaten.reduce((a, b) => (b.tag > a.tag ? b : a));
    kette.push(best.tag);
    stand = best.tag;
  }
  if (stand < ziel) return { moeglich: false, kette, stand, text: 'Die Sicherungen schließen nicht lückenlos aneinander an.' };
  const verlust = ausfall > ziel ? ` Änderungen nach ${TAGE[ziel]} sind verloren.` : '';
  return { moeglich: true, kette, stand, text: `Wiederhergestellt wird der Stand von ${TAGE[ziel]}.${verlust}` };
}

// ================================================================ Firewall

export interface FwRegel {
  aktion: 'erlauben' | 'verwerfen';
  proto: 'tcp' | 'udp' | 'icmp' | 'alle';
  quelle: string; // CIDR oder "any"
  ziel: string;
  port: string; // "443", "1024-65535", "any"
  name: string;
}

export interface FwPaket {
  proto: 'tcp' | 'udp' | 'icmp';
  quelle: string;
  ziel: string;
  port: string;
}

export function imNetz(ip: string, cidr: string): boolean | null {
  if (cidr.trim().toLowerCase() === 'any') return true;
  const [netz, p = '32'] = cidr.split('/');
  const a = ipZuZahl(ip.trim());
  const b = ipZuZahl(netz.trim());
  const praefix = Number(p);
  if (a === null || b === null || !Number.isInteger(praefix) || praefix < 0 || praefix > 32) return null;
  const m = maskeAus(praefix);
  return ((a & m) >>> 0) === ((b & m) >>> 0);
}

function portPasst(port: string, regel: string): boolean | null {
  const r = regel.trim().toLowerCase();
  if (r === 'any' || r === '') return true;
  const p = Number(port);
  if (!Number.isInteger(p)) return null;
  return r.split(',').some((teil) => {
    const [von, bis] = teil.split('-').map((x) => Number(x.trim()));
    return bis === undefined ? p === von : p >= von && p <= bis;
  });
}

export interface FwPruefung {
  /** pro Regel: Ergebnis je Kriterium; undefined = nicht mehr geprüft */
  regeln: ({ proto: boolean; quelle: boolean; ziel: boolean; port: boolean; passt: boolean } | undefined)[];
  treffer: number | null;
  aktion: 'erlauben' | 'verwerfen';
  fehler?: string;
}

/** First Match: Die erste passende Regel entscheidet, sonst greift die Standardregel (Default Deny). */
export function firewallPruefen(regeln: FwRegel[], paket: FwPaket): FwPruefung {
  const erg: FwPruefung['regeln'] = [];
  for (let i = 0; i < regeln.length; i++) {
    const r = regeln[i];
    const quelle = imNetz(paket.quelle, r.quelle);
    const ziel = imNetz(paket.ziel, r.ziel);
    if (quelle === null || ziel === null) return { regeln: erg, treffer: null, aktion: 'verwerfen', fehler: `Ungültige Adresse in Paket oder Regel ${i + 1}.` };
    const proto = r.proto === 'alle' || r.proto === paket.proto;
    const port = paket.proto === 'icmp' ? true : portPasst(paket.port, r.port) ?? false;
    const passt = proto && quelle && ziel && port;
    erg.push({ proto, quelle, ziel, port, passt });
    if (passt) return { regeln: erg, treffer: i, aktion: r.aktion };
  }
  return { regeln: erg, treffer: null, aktion: 'verwerfen' };
}

// ================================================================ Netzplan

export interface Vorgang {
  id: string;
  name: string;
  dauer: number;
  vorgaenger: string[];
}

export interface VorgangZeit extends Vorgang {
  faz: number;
  fez: number;
  saz: number;
  sez: number;
  gp: number;
  fp: number;
  kritisch: boolean;
  ebene: number;
}

export function netzplan(vorgaenge: Vorgang[]): { zeiten: VorgangZeit[]; dauer: number; fehler?: string } {
  const ids = new Set(vorgaenge.map((v) => v.id));
  if (ids.size !== vorgaenge.length) return { zeiten: [], dauer: 0, fehler: 'Jede Vorgangsnummer darf nur einmal vorkommen.' };
  for (const v of vorgaenge) {
    const fremd = v.vorgaenger.find((x) => !ids.has(x));
    if (fremd) return { zeiten: [], dauer: 0, fehler: `Vorgang ${v.id}: Vorgänger „${fremd}“ gibt es nicht.` };
    if (!(v.dauer >= 0)) return { zeiten: [], dauer: 0, fehler: `Vorgang ${v.id}: Die Dauer muss eine Zahl ab 0 sein.` };
  }
  // topologische Reihenfolge
  const reihe: Vorgang[] = [];
  const fertig = new Set<string>();
  while (reihe.length < vorgaenge.length) {
    const naechste = vorgaenge.filter((v) => !fertig.has(v.id) && v.vorgaenger.every((x) => fertig.has(x)));
    if (!naechste.length) return { zeiten: [], dauer: 0, fehler: 'Die Vorgänger bilden einen Kreis – ein Vorgang hängt (über Umwege) von sich selbst ab.' };
    for (const v of naechste) {
      reihe.push(v);
      fertig.add(v.id);
    }
  }
  const z = new Map<string, VorgangZeit>();
  for (const v of reihe) {
    const vor = v.vorgaenger.map((x) => z.get(x)!);
    const faz = vor.length ? Math.max(...vor.map((x) => x.fez)) : 0;
    const ebene = vor.length ? Math.max(...vor.map((x) => x.ebene)) + 1 : 0;
    z.set(v.id, { ...v, faz, fez: faz + v.dauer, saz: 0, sez: 0, gp: 0, fp: 0, kritisch: false, ebene });
  }
  const dauer = Math.max(0, ...[...z.values()].map((x) => x.fez));
  const nachfolger = (id: string) => [...z.values()].filter((x) => x.vorgaenger.includes(id));
  for (const v of [...reihe].reverse()) {
    const x = z.get(v.id)!;
    const nf = nachfolger(v.id);
    x.sez = nf.length ? Math.min(...nf.map((n) => n.saz)) : dauer;
    x.saz = x.sez - x.dauer;
    x.gp = x.saz - x.faz;
    x.fp = (nf.length ? Math.min(...nf.map((n) => n.faz)) : dauer) - x.fez;
    x.kritisch = x.gp === 0;
  }
  return { zeiten: vorgaenge.map((v) => z.get(v.id)!), dauer };
}

// ================================================================ SQL-JOIN

export type JoinArt = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS';

export interface JoinZeile {
  links: number | null; // Index in der linken Tabelle
  rechts: number | null;
}

/** Ergebnis eines Joins über links[lk] = rechts[rk]; NULL-Schlüssel finden nie einen Partner. */
export function join(
  links: (string | number | null)[][],
  rechts: (string | number | null)[][],
  lk: number,
  rk: number,
  art: JoinArt,
): JoinZeile[] {
  const out: JoinZeile[] = [];
  if (art === 'CROSS') {
    links.forEach((_, i) => rechts.forEach((_, j) => out.push({ links: i, rechts: j })));
    return out;
  }
  const gleich = (a: unknown, b: unknown) => a !== null && b !== null && a === b;
  const rechtsGenutzt = new Set<number>();
  links.forEach((l, i) => {
    const partner = rechts.map((r, j) => (gleich(l[lk], r[rk]) ? j : -1)).filter((j) => j >= 0);
    partner.forEach((j) => {
      out.push({ links: i, rechts: j });
      rechtsGenutzt.add(j);
    });
    if (!partner.length && (art === 'LEFT' || art === 'FULL')) out.push({ links: i, rechts: null });
  });
  if (art === 'RIGHT' || art === 'FULL')
    rechts.forEach((_, j) => {
      if (!rechtsGenutzt.has(j)) out.push({ links: null, rechts: j });
    });
  // RIGHT JOIN: in der Reihenfolge der rechten Tabelle zeigen
  if (art === 'RIGHT') out.sort((a, b) => (a.rechts ?? 0) - (b.rechts ?? 0));
  return out;
}

// ================================================================ Linux-Rechte

export interface Rechte {
  /** [u, g, o] je [r, w, x] */
  bits: [boolean, boolean, boolean][];
  suid: boolean;
  sgid: boolean;
  sticky: boolean;
}

export function rechteZuOktal(r: Rechte): string {
  const zif = r.bits.map(([a, b, c]) => (a ? 4 : 0) + (b ? 2 : 0) + (c ? 1 : 0));
  const sp = (r.suid ? 4 : 0) + (r.sgid ? 2 : 0) + (r.sticky ? 1 : 0);
  return (sp ? String(sp) : '') + zif.join('');
}

export function rechteAusOktal(s: string): Rechte | null {
  const t = s.trim();
  if (!/^[0-7]{3,4}$/.test(t)) return null;
  const z = t.padStart(4, '0').split('').map(Number);
  const b = (n: number): [boolean, boolean, boolean] => [!!(n & 4), !!(n & 2), !!(n & 1)];
  return { bits: [b(z[1]), b(z[2]), b(z[3])], suid: !!(z[0] & 4), sgid: !!(z[0] & 2), sticky: !!(z[0] & 1) };
}

/** Symbolische Schreibweise wie bei ls -l, z. B. -rwsr-xr-x oder drwxrwxrwt. */
export function rechteSymbolisch(r: Rechte, verzeichnis = false): string {
  const teil = ([a, b, c]: [boolean, boolean, boolean], spezial: boolean, s: string) =>
    (a ? 'r' : '-') + (b ? 'w' : '-') + (spezial ? (c ? s : s.toUpperCase()) : c ? 'x' : '-');
  return (
    (verzeichnis ? 'd' : '-') +
    teil(r.bits[0], r.suid, 's') +
    teil(r.bits[1], r.sgid, 's') +
    teil(r.bits[2], r.sticky, 't')
  );
}

/** Standardrechte neuer Dateien (666) und Verzeichnisse (777) nach Abzug der umask. */
export function umaskRechte(umask: string): { datei: string; verzeichnis: string } | null {
  const t = umask.trim();
  if (!/^0?[0-7]{3}$/.test(t)) return null;
  const m = parseInt(t.slice(-3), 8);
  const f = (basis: number) => (basis & ~m).toString(8).padStart(3, '0');
  return { datei: f(0o666), verzeichnis: f(0o777) };
}

// ================================================================ Cron

const MONATE = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WT = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MONATE_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WT_DE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

const FELDER: { name: string; min: number; max: number; namen?: string[] }[] = [
  { name: 'Minute', min: 0, max: 59 },
  { name: 'Stunde', min: 0, max: 23 },
  { name: 'Tag', min: 1, max: 31 },
  { name: 'Monat', min: 1, max: 12, namen: MONATE },
  { name: 'Wochentag', min: 0, max: 7, namen: WT },
];

const KUERZEL: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

export interface CronFeld {
  werte: Set<number>;
  stern: boolean;
  roh: string;
}

export interface Cron {
  felder: CronFeld[];
  text: string;
  fehler?: string;
  neustart?: boolean;
}

function feldParsen(roh: string, f: (typeof FELDER)[number]): CronFeld | string {
  const werte = new Set<number>();
  const wert = (x: string) => {
    const name = f.namen?.indexOf(x.toLowerCase()) ?? -1;
    if (name >= 0) return f.name === 'Monat' ? name + 1 : name;
    return /^\d+$/.test(x) ? Number(x) : NaN;
  };
  for (const teil of roh.split(',')) {
    const [bereich, schrittRoh] = teil.split('/');
    const schritt = schrittRoh === undefined ? 1 : Number(schrittRoh);
    if (!Number.isInteger(schritt) || schritt < 1) return `${f.name}: ungültige Schrittweite „${schrittRoh}“`;
    let von: number, bis: number;
    if (bereich === '*') [von, bis] = [f.min, f.name === 'Wochentag' ? 6 : f.max];
    else if (bereich.includes('-')) [von, bis] = bereich.split('-').map(wert) as [number, number];
    else {
      von = wert(bereich);
      bis = schrittRoh === undefined ? von : f.max;
    }
    if (![von, bis].every((x) => Number.isInteger(x) && x >= f.min && x <= f.max) || von > bis) return `${f.name}: „${teil}“ liegt nicht im Bereich ${f.min}–${f.max}`;
    for (let x = von; x <= bis; x += schritt) werte.add(f.name === 'Wochentag' && x === 7 ? 0 : x);
  }
  return { werte, stern: roh === '*', roh };
}

const zwei = (n: number) => String(n).padStart(2, '0');

function liste(xs: string[]): string {
  return xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} und ${xs[xs.length - 1]}`;
}

function feldText(f: CronFeld, i: number): string {
  const r = f.roh;
  const schritt = /^\*\/(\d+)$/.exec(r);
  const name = (x: number) => (i === 3 ? MONATE_DE[x - 1] : i === 4 ? WT_DE[x] : String(x));
  if (schritt) return [`alle ${schritt[1]} Minuten`, `alle ${schritt[1]} Stunden`, `jeden ${schritt[1]}. Tag`, `alle ${schritt[1]} Monate`, `jeden ${schritt[1]}. Wochentag`][i];
  const bereich = /^(\w+)-(\w+)$/.exec(r);
  const sortiert = [...f.werte].sort((a, b) => a - b);
  if (bereich) {
    const [a, b] = [sortiert[0], sortiert[sortiert.length - 1]];
    return [`Minute ${a} bis ${b}`, `${a} bis ${b} Uhr`, `am ${a}. bis ${b}.`, `${name(a)} bis ${name(b)}`, `${name(a)} bis ${name(b)}`][i];
  }
  const namen = sortiert.map(name);
  return [`Minute ${liste(namen)}`, `${liste(namen)} Uhr`, `am ${liste(namen.map((x) => x + '.'))}`, `im ${liste(namen)}`, liste(namen.map((x) => (i === 4 ? x + 's' : x)))][i];
}

export function cronParsen(eingabe: string): Cron {
  let t = eingabe.trim().replace(/\s+/g, ' ');
  if (t === '@reboot') return { felder: [], text: 'einmal bei jedem Systemstart', neustart: true };
  if (KUERZEL[t]) t = KUERZEL[t];
  const teile = t.split(' ');
  if (teile.length !== 5) return { felder: [], text: '', fehler: 'Ein Cron-Ausdruck hat fünf Felder: Minute Stunde Tag Monat Wochentag.' };
  const felder: CronFeld[] = [];
  for (let i = 0; i < 5; i++) {
    const f = feldParsen(teile[i], FELDER[i]);
    if (typeof f === 'string') return { felder: [], text: '', fehler: f };
    felder.push(f);
  }
  const [mi, st, tag, mo, wt] = felder;
  const teileText: string[] = [];
  if (mi.werte.size === 1 && st.werte.size === 1) teileText.push(`um ${zwei([...st.werte][0])}:${zwei([...mi.werte][0])} Uhr`);
  else if (mi.stern && st.stern) teileText.push('jede Minute');
  else if (st.stern) teileText.push(mi.werte.size === 1 ? `jede Stunde zur Minute ${[...mi.werte][0]}` : feldText(mi, 0));
  else if (mi.werte.size === 1) {
    const m = zwei([...mi.werte][0]);
    const s = [...st.werte].sort((a, b) => a - b);
    teileText.push(/[-/]/.test(st.roh) ? `${feldText(st, 1)}, jeweils zur Minute ${m}` : `um ${liste(s.map((h) => `${zwei(h)}:${m}`))} Uhr`);
  } else teileText.push(`${feldText(mi, 0)}, ${feldText(st, 1)}`);
  if (!tag.stern && !wt.stern) teileText.push(`${feldText(tag, 2)} jedes Monats oder ${feldText(wt, 4)}`);
  else if (!tag.stern) teileText.push(`${feldText(tag, 2)} des Monats`);
  else if (!wt.stern) teileText.push(feldText(wt, 4));
  else if (!st.stern) teileText.push('jeden Tag');
  if (!mo.stern) teileText.push(feldText(mo, 3));
  return { felder, text: teileText.join(', ') };
}

/** Nächste Ausführungen ab `ab` (exklusive). Tag und Wochentag eingeschränkt → es reicht, wenn eins passt. */
export function cronNaechste(c: Cron, ab: Date, anzahl = 5): Date[] {
  if (c.fehler || c.neustart) return [];
  const [mi, st, tag, mo, wt] = c.felder;
  const out: Date[] = [];
  const d = new Date(ab.getTime());
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  for (let i = 0; i < 60 * 24 * 366 * 5 && out.length < anzahl; i++) {
    const tagOk = tag.werte.has(d.getDate());
    const wtOk = wt.werte.has(d.getDay());
    const datumOk = tag.stern || wt.stern ? tagOk && wtOk : tagOk || wtOk;
    if (!mo.werte.has(d.getMonth() + 1) || !datumOk) {
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      continue;
    }
    if (!st.werte.has(d.getHours())) {
      d.setHours(d.getHours() + 1, 0, 0, 0);
      continue;
    }
    if (mi.werte.has(d.getMinutes())) out.push(new Date(d.getTime()));
    d.setMinutes(d.getMinutes() + 1);
  }
  return out;
}

// ================================================================ Nutzwertanalyse

export interface Nutzwert {
  summeGewicht: number;
  /** je Alternative: Teilnutzen je Kriterium und Summe */
  ergebnisse: { teil: number[]; summe: number; rang: number }[];
}

/** Gewichte in Prozent, Punkte z. B. 1–10. Teilnutzen = Gewicht/100 × Punkte. */
export function nutzwert(gewichte: number[], punkte: number[][]): Nutzwert {
  const summeGewicht = gewichte.reduce((a, b) => a + (b || 0), 0);
  const roh = punkte.map((p) => {
    const teil = gewichte.map((g, i) => Math.round(((g || 0) / 100) * (p[i] || 0) * 100) / 100);
    return { teil, summe: Math.round(teil.reduce((a, b) => a + b, 0) * 100) / 100 };
  });
  const ergebnisse = roh.map((r) => ({ ...r, rang: 1 + roh.filter((x) => x.summe > r.summe).length }));
  return { summeGewicht, ergebnisse };
}
