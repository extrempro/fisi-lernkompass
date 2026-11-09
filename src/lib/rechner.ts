/**
 * Rechner für typische Prüfungsaufgaben. Jeder Rechner liefert das Ergebnis und den Rechenweg
 * Schritt für Schritt – und kann eine Übungsaufgabe mit Zufallswerten stellen.
 */

export interface Feld {
  key: string;
  label: string;
  typ: 'zahl' | 'text' | 'auswahl';
  einheit?: string;
  optionen?: [string, string][];
  standard: string;
  hilfe?: string;
}

export interface Wert {
  key: string;
  label: string;
  text: string;
  /** zum Vergleichen in Übungsaufgaben */
  zahl?: number;
}

export interface Ergebnis {
  werte: Wert[];
  schritte: string[];
  fehler?: string;
}

export interface Aufgabe {
  text: string;
  eingaben: Record<string, string>;
  /** gefragte Werte (Keys aus Ergebnis.werte) */
  gefragt: string[];
}

export interface Rechner {
  id: string;
  titel: string;
  kurz: string;
  felder: Feld[];
  rechne: (e: Record<string, string>) => Ergebnis;
  aufgabe: (r: () => number) => Aufgabe;
  /** relative Toleranz beim Prüfen von Zahlen (Standard 0,5 %) */
  toleranz?: number;
}

// ---------- Hilfen ----------

export function zahl(s: string | undefined): number {
  if (s === undefined) return NaN;
  const t = s.trim().replace(/\s/g, '');
  // „1.234,5“ (deutsch) oder „1234.5“
  const n = /,/.test(t) ? t.replace(/\./g, '').replace(',', '.') : t;
  return n === '' ? NaN : Number(n);
}

export function de(n: number, stellen = 2): string {
  if (!Number.isFinite(n)) return '–';
  return n.toLocaleString('de-DE', { maximumFractionDigits: stellen, minimumFractionDigits: 0 });
}

function ganz(r: () => number, min: number, max: number): number {
  return min + Math.floor(r() * (max - min + 1));
}
function eins<T>(r: () => number, l: T[]): T {
  return l[Math.floor(r() * l.length)];
}

export function dauerText(s: number): string {
  if (!Number.isFinite(s)) return '–';
  const t = Math.round(s);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sek = t % 60;
  return `${h} h ${String(m).padStart(2, '0')} min ${String(sek).padStart(2, '0')} s`;
}

// ---------- Subnetting ----------

export function ipZuZahl(ip: string): number | null {
  const t = ip.trim().split('.');
  if (t.length !== 4 || t.some((x) => !/^\d{1,3}$/.test(x) || Number(x) > 255)) return null;
  return t.reduce((n, x) => n * 256 + Number(x), 0);
}
export function zahlZuIp(n: number): string {
  return [24, 16, 8, 0].map((s) => Math.floor(n / 2 ** s) % 256).join('.');
}
function bin8(n: number) {
  return n.toString(2).padStart(8, '0');
}

const subnetting: Rechner = {
  id: 'subnetting',
  titel: 'Subnetting',
  kurz: 'Netz, Broadcast und Hosts aus IP und Präfix',
  felder: [
    { key: 'ip', label: 'IP-Adresse', typ: 'text', standard: '192.168.10.77' },
    { key: 'praefix', label: 'Präfix (CIDR)', typ: 'zahl', einheit: '/', standard: '26', hilfe: '0 bis 32' },
  ],
  rechne(e) {
    const ip = ipZuZahl(e.ip ?? '');
    const p = zahl(e.praefix);
    if (ip === null) return { werte: [], schritte: [], fehler: 'Bitte eine gültige IPv4-Adresse eingeben, z. B. 192.168.10.77.' };
    if (!Number.isInteger(p) || p < 0 || p > 32) return { werte: [], schritte: [], fehler: 'Das Präfix muss zwischen 0 und 32 liegen.' };
    const groesse = 2 ** (32 - p);
    const netz = Math.floor(ip / groesse) * groesse;
    const bc = netz + groesse - 1;
    const maske = 2 ** 32 - groesse;
    const hosts = p >= 31 ? (p === 31 ? 2 : 1) : groesse - 2;
    // „interessantes“ Oktett: dort, wo die Grenze zwischen Netz- und Hostteil liegt
    const ok = p >= 32 ? 3 : Math.floor(p / 8);
    const maskeOkt = Math.floor(maske / 2 ** (24 - 8 * Math.min(ok, 3))) % 256;
    const ipOkt = Math.floor(ip / 2 ** (24 - 8 * Math.min(ok, 3))) % 256;
    const block = 256 - maskeOkt;
    const schritte = [
      `Präfix /${p}: ${p} Bits Netzteil, ${32 - p} Bits Hostteil.`,
      `Subnetzmaske: ${p} Einsen, dann Nullen → ${zahlZuIp(maske)}.`,
    ];
    if (p % 8 !== 0 && p < 32) {
      schritte.push(
        `Die Grenze liegt im ${ok + 1}. Oktett: Maske ${maskeOkt} = ${bin8(maskeOkt)}₂, Blockgröße 256 − ${maskeOkt} = ${block}.`,
        `${ipOkt} liegt im Block ${Math.floor(ipOkt / block) * block} bis ${Math.floor(ipOkt / block) * block + block - 1} (${ipOkt} ÷ ${block} = ${Math.floor(ipOkt / block)} Rest ${ipOkt % block}).`,
      );
    }
    schritte.push(
      `Netzadresse: alle Hostbits 0 → ${zahlZuIp(netz)}.`,
      `Broadcast: alle Hostbits 1 → ${zahlZuIp(bc)}.`,
      p >= 31 ? `Sonderfall /${p}: keine Netz- und Broadcastadresse im üblichen Sinn.` : `Nutzbare Hosts: 2^${32 - p} − 2 = ${groesse} − 2 = ${hosts}.`,
    );
    return {
      werte: [
        { key: 'maske', label: 'Subnetzmaske', text: zahlZuIp(maske) },
        { key: 'netz', label: 'Netzadresse', text: zahlZuIp(netz) },
        { key: 'erster', label: 'Erster Host', text: p >= 31 ? zahlZuIp(netz) : zahlZuIp(netz + 1) },
        { key: 'letzter', label: 'Letzter Host', text: p >= 31 ? zahlZuIp(bc) : zahlZuIp(bc - 1) },
        { key: 'broadcast', label: 'Broadcast', text: zahlZuIp(bc) },
        { key: 'hosts', label: 'Nutzbare Hosts', text: de(hosts, 0), zahl: hosts },
      ],
      schritte,
    };
  },
  aufgabe(r) {
    const netz = eins(r, [`192.168.${ganz(r, 0, 254)}`, `10.${ganz(r, 0, 255)}.${ganz(r, 0, 255)}`, `172.${ganz(r, 16, 31)}.${ganz(r, 0, 255)}`]);
    const ip = `${netz}.${ganz(r, 1, 254)}`;
    const p = ganz(r, 22, 29);
    return {
      text: `Ein Rechner hat die Adresse ${ip}/${p}. Bestimme Netzadresse, Broadcastadresse und die Zahl der nutzbaren Hosts.`,
      eingaben: { ip, praefix: String(p) },
      gefragt: ['netz', 'broadcast', 'hosts'],
    };
  },
  toleranz: 0,
};

// ---------- Datenmengen ----------

const EINHEITEN: [string, number][] = [
  ['Bit', 1 / 8],
  ['Byte', 1],
  ['kB', 1e3],
  ['MB', 1e6],
  ['GB', 1e9],
  ['TB', 1e12],
  ['KiB', 2 ** 10],
  ['MiB', 2 ** 20],
  ['GiB', 2 ** 30],
  ['TiB', 2 ** 40],
];
const FAKTOR = new Map(EINHEITEN);
const ERKLAERUNG: Record<string, string> = {
  Bit: '1 Byte = 8 Bit',
  Byte: '',
  kB: '1 kB = 1.000 Byte (dezimal, SI)',
  MB: '1 MB = 1.000² Byte',
  GB: '1 GB = 1.000³ Byte',
  TB: '1 TB = 1.000⁴ Byte',
  KiB: '1 KiB = 1.024 Byte (binär, IEC)',
  MiB: '1 MiB = 1.024² Byte',
  GiB: '1 GiB = 1.024³ Byte',
  TiB: '1 TiB = 1.024⁴ Byte',
};

const datenmengen: Rechner = {
  id: 'datenmengen',
  titel: 'Datenmengen umrechnen',
  kurz: 'Bit, Byte, kB/MB/GB (1.000) und KiB/MiB/GiB (1.024)',
  felder: [
    { key: 'wert', label: 'Wert', typ: 'zahl', standard: '500' },
    { key: 'von', label: 'Einheit', typ: 'auswahl', optionen: EINHEITEN.map(([e]) => [e, e]), standard: 'GB' },
    { key: 'nach', label: 'Gesucht in', typ: 'auswahl', optionen: EINHEITEN.map(([e]) => [e, e]), standard: 'GiB' },
  ],
  rechne(e) {
    const w = zahl(e.wert);
    const von = FAKTOR.get(e.von);
    const nach = FAKTOR.get(e.nach);
    if (!Number.isFinite(w) || w < 0 || !von || !nach) return { werte: [], schritte: [], fehler: 'Bitte einen Wert ≥ 0 und zwei Einheiten wählen.' };
    const byte = w * von;
    const ziel = byte / nach;
    const schritte = [
      e.von === 'Byte' ? `${de(w)} Byte.` : `In Byte umrechnen: ${ERKLAERUNG[e.von]} → ${de(w)} ${e.von} = ${de(byte, 4)} Byte.`,
      e.nach === 'Byte' ? `Ergebnis in Byte: ${de(byte, 4)} Byte.` : `In ${e.nach} umrechnen: ${ERKLAERUNG[e.nach]} → ${de(byte, 4)} Byte ÷ ${de(nach, 6)} = ${de(ziel, 4)} ${e.nach}.`,
    ];
    if (/i/.test(e.von) !== /i/.test(e.nach) && e.von !== 'Bit' && e.nach !== 'Bit' && e.von !== 'Byte' && e.nach !== 'Byte') {
      schritte.push('Achtung: Hersteller geben Festplatten dezimal (GB) an, Betriebssysteme zeigen oft binär (GiB) – daher wirkt die Platte „kleiner“.');
    }
    return {
      werte: [{ key: 'ziel', label: `Ergebnis in ${e.nach}`, text: `${de(ziel, 4)} ${e.nach}`, zahl: ziel }, ...['Byte', 'MB', 'MiB', 'GB', 'GiB'].filter((x) => x !== e.nach).map((x) => ({ key: x, label: x, text: `${de(byte / FAKTOR.get(x)!, 4)} ${x}` }))],
      schritte,
    };
  },
  aufgabe(r) {
    const [von, nach] = eins(r, [
      ['GB', 'GiB'],
      ['TB', 'TiB'],
      ['MiB', 'MB'],
      ['GB', 'MB'],
      ['MB', 'Bit'],
      ['GiB', 'MiB'],
    ]);
    const w = eins(r, [1, 2, 4, 8, 16, 120, 250, 500, 512, 1000]);
    return { text: `Wie viel sind ${de(w)} ${von} in ${nach}? (auf zwei Nachkommastellen)`, eingaben: { wert: String(w), von, nach }, gefragt: ['ziel'] };
  },
};

// ---------- Übertragungsdauer ----------

const RATEN: [string, number][] = [
  ['kbit/s', 1e3],
  ['Mbit/s', 1e6],
  ['Gbit/s', 1e9],
];

const uebertragung: Rechner = {
  id: 'uebertragung',
  titel: 'Übertragungsdauer',
  kurz: 'Wie lange dauert der Download oder die Sicherung?',
  felder: [
    { key: 'menge', label: 'Datenmenge', typ: 'zahl', standard: '4,7' },
    { key: 'einheit', label: 'Einheit', typ: 'auswahl', optionen: EINHEITEN.filter(([x]) => x !== 'Bit').map(([x]) => [x, x]), standard: 'GB' },
    { key: 'rate', label: 'Übertragungsrate', typ: 'zahl', standard: '50' },
    { key: 'rateEinheit', label: 'Einheit', typ: 'auswahl', optionen: RATEN.map(([x]) => [x, x]), standard: 'Mbit/s' },
  ],
  rechne(e) {
    const m = zahl(e.menge);
    const f = FAKTOR.get(e.einheit);
    const v = zahl(e.rate);
    const rf = new Map(RATEN).get(e.rateEinheit);
    if (!(m >= 0) || !f || !(v > 0) || !rf) return { werte: [], schritte: [], fehler: 'Bitte Datenmenge ≥ 0 und eine Rate > 0 eingeben.' };
    const bit = m * f * 8;
    const bps = v * rf;
    const s = bit / bps;
    return {
      werte: [
        { key: 'sekunden', label: 'Dauer in Sekunden', text: `${de(s, 1)} s`, zahl: s },
        { key: 'dauer', label: 'Dauer', text: dauerText(s) },
      ],
      schritte: [
        `Datenmenge in Byte: ${de(m)} ${e.einheit} = ${de(m * f, 2)} Byte${e.einheit === 'Byte' ? '' : ` (${ERKLAERUNG[e.einheit]})`}.`,
        `In Bit: × 8 → ${de(bit, 2)} Bit.`,
        `Rate in Bit pro Sekunde: ${de(v)} ${e.rateEinheit} = ${de(bps, 0)} bit/s (Datenraten sind immer dezimal).`,
        `Dauer = Datenmenge ÷ Rate = ${de(bit, 0)} ÷ ${de(bps, 0)} = ${de(s, 2)} s ≈ ${dauerText(s)}.`,
      ],
    };
  },
  aufgabe(r) {
    const [m, einheit] = eins(r, [
      [4.7, 'GB'],
      [700, 'MB'],
      [25, 'GB'],
      [1.5, 'TB'],
      [800, 'MiB'],
      [12, 'GiB'],
    ] as [number, string][]);
    const [v, re] = eins(r, [
      [16, 'Mbit/s'],
      [50, 'Mbit/s'],
      [100, 'Mbit/s'],
      [250, 'Mbit/s'],
      [1, 'Gbit/s'],
    ] as [number, string][]);
    return {
      text: `Eine Datei mit ${de(m)} ${einheit} wird über eine Leitung mit ${de(v)} ${re} übertragen. Wie viele Sekunden dauert das (ohne Overhead)?`,
      eingaben: { menge: String(m).replace('.', ','), einheit, rate: String(v), rateEinheit: re },
      gefragt: ['sekunden'],
    };
  },
};

// ---------- RAID ----------

const RAID: Record<string, { min: number; nutz: (n: number) => number; ausfall: (n: number) => string; text: string }> = {
  '0': { min: 2, nutz: (n) => n, ausfall: () => 'keine – fällt eine Platte aus, sind alle Daten weg', text: 'Striping: Daten verteilt, volle Kapazität' },
  '1': { min: 2, nutz: () => 1, ausfall: (n) => `${n - 1} Platte(n)`, text: 'Spiegelung: alle Platten enthalten dasselbe' },
  '5': { min: 3, nutz: (n) => n - 1, ausfall: () => '1 Platte', text: 'Striping mit verteilter Parität (1 Platte Parität)' },
  '6': { min: 4, nutz: (n) => n - 2, ausfall: () => '2 Platten', text: 'Striping mit doppelter Parität (2 Platten Parität)' },
  '10': { min: 4, nutz: (n) => n / 2, ausfall: () => '1 Platte je Spiegel (mindestens 1, im besten Fall die Hälfte)', text: 'Spiegelpaare, die gestriped werden' },
};

const raid: Rechner = {
  id: 'raid',
  titel: 'RAID-Kapazität',
  kurz: 'Nutzbarer Speicher und Ausfallsicherheit',
  felder: [
    { key: 'level', label: 'RAID-Level', typ: 'auswahl', optionen: Object.keys(RAID).map((k) => [k, `RAID ${k}`]), standard: '5' },
    { key: 'anzahl', label: 'Anzahl Platten', typ: 'zahl', standard: '4' },
    { key: 'groesse', label: 'Größe je Platte', typ: 'zahl', einheit: 'TB', standard: '4' },
  ],
  rechne(e) {
    const l = RAID[e.level];
    const n = zahl(e.anzahl);
    const g = zahl(e.groesse);
    if (!l || !Number.isInteger(n) || !(g > 0)) return { werte: [], schritte: [], fehler: 'Bitte Level, Anzahl (ganze Zahl) und Größe eingeben.' };
    if (n < l.min) return { werte: [], schritte: [], fehler: `RAID ${e.level} braucht mindestens ${l.min} Platten.` };
    if (e.level === '10' && n % 2) return { werte: [], schritte: [], fehler: 'RAID 10 braucht eine gerade Anzahl Platten.' };
    const nutzPlatten = l.nutz(n);
    const nutz = nutzPlatten * g;
    const brutto = n * g;
    return {
      werte: [
        { key: 'nutz', label: 'Nutzbare Kapazität', text: `${de(nutz)} TB`, zahl: nutz },
        { key: 'brutto', label: 'Bruttokapazität', text: `${de(brutto)} TB` },
        { key: 'effizienz', label: 'Effizienz', text: `${de((nutz / brutto) * 100, 1)} %`, zahl: (nutz / brutto) * 100 },
        { key: 'ausfall', label: 'Verkraftet Ausfall von', text: l.ausfall(n) },
      ],
      schritte: [
        `RAID ${e.level}: ${l.text}.`,
        `Nutzbar sind ${e.level === '0' ? 'alle' : e.level === '1' ? 'eine' : e.level === '10' ? 'die Hälfte der' : e.level === '5' ? 'n − 1' : 'n − 2'} Platten: ${de(nutzPlatten)} × ${de(g)} TB = ${de(nutz)} TB.`,
        `Effizienz = nutzbar ÷ brutto = ${de(nutz)} ÷ ${de(brutto)} = ${de((nutz / brutto) * 100, 1)} %.`,
        'Merke: RAID ersetzt keine Datensicherung – es schützt nur vor Plattenausfall, nicht vor Löschen, Ransomware oder Brand.',
      ],
    };
  },
  aufgabe(r) {
    const level = eins(r, ['1', '5', '6', '10', '0']);
    const n = level === '1' ? 2 : level === '10' ? eins(r, [4, 6, 8]) : ganz(r, RAID[level].min, 8);
    const g = eins(r, [1, 2, 4, 8, 12, 16]);
    return { text: `Ein Server erhält ${n} Festplatten mit je ${g} TB im RAID ${level}. Wie viel Speicher ist nutzbar (in TB)?`, eingaben: { level, anzahl: String(n), groesse: String(g) }, gefragt: ['nutz'] };
  },
};

// ---------- USV ----------

const usv: Rechner = {
  id: 'usv',
  titel: 'USV: Leistung und Laufzeit',
  kurz: 'Wirkleistung aus VA und cos φ, Überbrückungszeit',
  felder: [
    { key: 'va', label: 'Scheinleistung der USV', typ: 'zahl', einheit: 'VA', standard: '1500' },
    { key: 'cos', label: 'Leistungsfaktor (cos φ)', typ: 'zahl', standard: '0,6' },
    { key: 'last', label: 'Angeschlossene Last', typ: 'zahl', einheit: 'W', standard: '450' },
    { key: 'akku', label: 'Akkukapazität', typ: 'zahl', einheit: 'Wh', standard: '432', hilfe: 'z. B. 2 × 12 V × 18 Ah = 432 Wh' },
    { key: 'wirkungsgrad', label: 'Wirkungsgrad', typ: 'zahl', einheit: '%', standard: '90' },
  ],
  rechne(e) {
    const va = zahl(e.va);
    const cos = zahl(e.cos);
    const last = zahl(e.last);
    const akku = zahl(e.akku);
    const eta = zahl(e.wirkungsgrad);
    if (!(va > 0) || !(cos > 0 && cos <= 1) || !(last > 0) || !(akku > 0) || !(eta > 0 && eta <= 100)) {
      return { werte: [], schritte: [], fehler: 'Bitte alle Werte eingeben (cos φ zwischen 0 und 1, Wirkungsgrad bis 100 %).' };
    }
    const p = va * cos;
    const min = ((akku * (eta / 100)) / last) * 60;
    return {
      werte: [
        { key: 'watt', label: 'Maximale Wirkleistung', text: `${de(p, 1)} W`, zahl: p },
        { key: 'auslastung', label: 'Auslastung', text: `${de((last / p) * 100, 1)} %`, zahl: (last / p) * 100 },
        { key: 'minuten', label: 'Überbrückungszeit', text: `${de(min, 1)} min`, zahl: min },
      ],
      schritte: [
        `Wirkleistung P = Scheinleistung S × cos φ = ${de(va)} VA × ${de(cos)} = ${de(p, 1)} W.`,
        last > p ? `Achtung: Die Last von ${de(last)} W ist größer als ${de(p, 1)} W – die USV ist überlastet!` : `Die Last von ${de(last)} W liegt unter ${de(p, 1)} W (Auslastung ${de((last / p) * 100, 1)} %).`,
        `Nutzbare Energie = Akku × Wirkungsgrad = ${de(akku)} Wh × ${de(eta / 100)} = ${de(akku * (eta / 100), 1)} Wh.`,
        `Zeit = Energie ÷ Last = ${de(akku * (eta / 100), 1)} Wh ÷ ${de(last)} W = ${de(min / 60, 3)} h = ${de(min, 1)} min.`,
      ],
    };
  },
  aufgabe(r) {
    const va = eins(r, [700, 1000, 1500, 2200, 3000]);
    const cos = eins(r, [0.6, 0.7, 0.8, 0.9]);
    const last = Math.round((va * cos * eins(r, [0.4, 0.5, 0.6, 0.75])) / 10) * 10;
    const akku = eins(r, [216, 288, 432, 576, 864]);
    return {
      text: `Eine USV mit ${de(va)} VA und cos φ = ${de(cos)} versorgt einen Server mit ${de(last)} W. Der Akku hat ${de(akku)} Wh, der Wirkungsgrad beträgt 90 %. Berechne die maximale Wirkleistung und die Überbrückungszeit in Minuten.`,
      eingaben: { va: String(va), cos: String(cos).replace('.', ','), last: String(last), akku: String(akku), wirkungsgrad: '90' },
      gefragt: ['watt', 'minuten'],
    };
  },
};

// ---------- Stromkosten ----------

const strom: Rechner = {
  id: 'strom',
  titel: 'Stromkosten',
  kurz: 'Verbrauch und Kosten pro Jahr',
  felder: [
    { key: 'watt', label: 'Leistungsaufnahme', typ: 'zahl', einheit: 'W', standard: '65' },
    { key: 'stunden', label: 'Betrieb pro Tag', typ: 'zahl', einheit: 'h', standard: '8' },
    { key: 'tage', label: 'Tage pro Jahr', typ: 'zahl', standard: '220' },
    { key: 'preis', label: 'Strompreis', typ: 'zahl', einheit: 'ct/kWh', standard: '32' },
    { key: 'anzahl', label: 'Anzahl Geräte', typ: 'zahl', standard: '1' },
  ],
  rechne(e) {
    const w = zahl(e.watt);
    const h = zahl(e.stunden);
    const t = zahl(e.tage);
    const ct = zahl(e.preis);
    const n = zahl(e.anzahl) || 1;
    if (!(w >= 0) || !(h >= 0 && h <= 24) || !(t >= 0 && t <= 366) || !(ct >= 0)) return { werte: [], schritte: [], fehler: 'Bitte gültige Werte eingeben (höchstens 24 h am Tag, 366 Tage).' };
    const kwh = (w * h * t * n) / 1000;
    const euro = (kwh * ct) / 100;
    return {
      werte: [
        { key: 'kwh', label: 'Verbrauch pro Jahr', text: `${de(kwh, 2)} kWh`, zahl: kwh },
        { key: 'euro', label: 'Kosten pro Jahr', text: `${de(euro, 2)} €`, zahl: euro },
      ],
      schritte: [
        `Energie = Leistung × Zeit = ${de(w)} W × ${de(h)} h × ${de(t)} Tage${n !== 1 ? ` × ${de(n)} Geräte` : ''} = ${de(w * h * t * n)} Wh.`,
        `In kWh: ÷ 1.000 → ${de(kwh, 2)} kWh.`,
        `Kosten = ${de(kwh, 2)} kWh × ${de(ct)} ct/kWh = ${de(kwh * ct, 1)} ct = ${de(euro, 2)} €.`,
      ],
    };
  },
  aufgabe(r) {
    const w = eins(r, [15, 35, 65, 120, 250, 400]);
    const h = eins(r, [8, 10, 24]);
    const t = h === 24 ? 365 : eins(r, [220, 230, 250]);
    const ct = eins(r, [28, 30, 32, 35]);
    const n = eins(r, [1, 1, 10, 25]);
    return {
      text: `${n === 1 ? 'Ein Gerät' : `${n} Geräte`} mit je ${w} W ${n === 1 ? 'läuft' : 'laufen'} ${h} Stunden am Tag an ${t} Tagen im Jahr. Strom kostet ${ct} ct/kWh. Berechne Verbrauch (kWh) und Kosten (€) pro Jahr.`,
      eingaben: { watt: String(w), stunden: String(h), tage: String(t), preis: String(ct), anzahl: String(n) },
      gefragt: ['kwh', 'euro'],
    };
  },
};

// ---------- Amortisation ----------

const amortisation: Rechner = {
  id: 'amortisation',
  titel: 'Amortisation',
  kurz: 'Wann lohnt sich die Neuanschaffung?',
  felder: [
    { key: 'invest', label: 'Anschaffungskosten (neu)', typ: 'zahl', einheit: '€', standard: '1200' },
    { key: 'kostenAlt', label: 'Laufende Kosten bisher', typ: 'zahl', einheit: '€/Jahr', standard: '600' },
    { key: 'kostenNeu', label: 'Laufende Kosten neu', typ: 'zahl', einheit: '€/Jahr', standard: '150' },
  ],
  rechne(e) {
    const i = zahl(e.invest);
    const a = zahl(e.kostenAlt);
    const n = zahl(e.kostenNeu);
    if (!(i >= 0) || !(a >= 0) || !(n >= 0)) return { werte: [], schritte: [], fehler: 'Bitte alle Werte eingeben.' };
    const ersparnis = a - n;
    if (ersparnis <= 0) {
      return { werte: [], schritte: [`Ersparnis = ${de(a)} € − ${de(n)} € = ${de(ersparnis)} € – ohne Ersparnis amortisiert sich die Anschaffung nie.`], fehler: 'Die neuen Kosten sind nicht niedriger – keine Amortisation.' };
    }
    const jahre = i / ersparnis;
    return {
      werte: [
        { key: 'ersparnis', label: 'Ersparnis pro Jahr', text: `${de(ersparnis, 2)} €`, zahl: ersparnis },
        { key: 'jahre', label: 'Amortisationszeit', text: `${de(jahre, 2)} Jahre`, zahl: jahre },
        { key: 'monate', label: 'in Monaten', text: `${de(jahre * 12, 1)} Monate`, zahl: jahre * 12 },
      ],
      schritte: [
        `Ersparnis pro Jahr = laufende Kosten bisher − neu = ${de(a)} € − ${de(n)} € = ${de(ersparnis, 2)} €.`,
        `Amortisationszeit = Anschaffung ÷ Ersparnis = ${de(i)} € ÷ ${de(ersparnis, 2)} €/Jahr = ${de(jahre, 2)} Jahre.`,
        `In Monaten: × 12 = ${de(jahre * 12, 1)} Monate. Ab dann spart die neue Lösung Geld.`,
      ],
    };
  },
  aufgabe(r) {
    const i = eins(r, [800, 1200, 2400, 5000, 9000]);
    const a = eins(r, [600, 900, 1500, 2400]);
    const n = Math.round(a * eins(r, [0.2, 0.3, 0.5]));
    return {
      text: `Ein neues System kostet ${de(i)} €. Die laufenden Kosten sinken dadurch von ${de(a)} € auf ${de(n)} € pro Jahr. Nach wie vielen Jahren hat sich die Anschaffung amortisiert?`,
      eingaben: { invest: String(i), kostenAlt: String(a), kostenNeu: String(n) },
      gefragt: ['jahre'],
    };
  },
};


// ---------- RAID-Plattenbedarf ----------

const raidBedarf: Rechner = {
  id: 'raidBedarf',
  titel: 'RAID-Plattenbedarf',
  kurz: 'Wie viele Platten brauche ich – mit Parität und Hot Spare?',
  felder: [
    { key: 'bedarf', label: 'Benötigter Speicher', typ: 'zahl', einheit: 'TB', standard: '9', hilfe: 'Daten + Wachstum + Reserve zusammenzählen' },
    { key: 'groesse', label: 'Größe je Platte', typ: 'zahl', einheit: 'TB', standard: '2' },
    { key: 'level', label: 'RAID-Level', typ: 'auswahl', optionen: Object.keys(RAID).map((k) => [k, `RAID ${k}`]), standard: '6' },
    { key: 'spare', label: 'Hot Spares', typ: 'zahl', standard: '1' },
  ],
  rechne(e) {
    const b = zahl(e.bedarf);
    const g = zahl(e.groesse);
    const sp = zahl(e.spare);
    const l = RAID[e.level];
    if (!(b > 0) || !(g > 0) || !l || !Number.isInteger(sp) || sp < 0) return { werte: [], schritte: [], fehler: 'Bitte Bedarf und Plattengröße > 0 sowie eine ganze Zahl Hot Spares eingeben.' };
    const daten = Math.ceil(b / g - 1e-9);
    let raidPlatten: number;
    let schritt: string;
    if (e.level === '0') {
      raidPlatten = Math.max(daten, l.min);
      schritt = 'RAID 0 braucht keine Platten für Redundanz.';
    } else if (e.level === '1') {
      if (daten > 1) return { werte: [], schritte: [], fehler: 'RAID 1 spiegelt nur eine Platte – der Bedarf ist größer als eine Platte. RAID 10 wählen.' };
      raidPlatten = 2;
      schritt = 'RAID 1: eine zweite Platte als Spiegel.';
    } else if (e.level === '10') {
      raidPlatten = Math.max(daten * 2, l.min);
      schritt = `RAID 10: jede Datenplatte wird gespiegelt → ${de(daten)} × 2${daten * 2 < l.min ? `, mindestens ${l.min}` : ''}.`;
    } else {
      const par = e.level === '5' ? 1 : 2;
      raidPlatten = Math.max(daten + par, l.min);
      schritt = `RAID ${e.level}: + ${par} Platte${par > 1 ? 'n' : ''} für die Parität → ${de(daten)} + ${par} = ${de(daten + par)}${daten + par < l.min ? `, mindestens ${l.min}` : ''}.`;
    }
    const gesamt = raidPlatten + sp;
    const nutz = l.nutz(raidPlatten) * g;
    return {
      werte: [
        { key: 'gesamt', label: 'Platten insgesamt', text: `${de(gesamt)} Platten`, zahl: gesamt },
        { key: 'raid', label: 'davon im RAID', text: `${de(raidPlatten)} Platten` },
        { key: 'nutz', label: 'Nutzbare Kapazität', text: `${de(nutz)} TB` },
      ],
      schritte: [
        `Platten für die Daten: ${de(b)} TB ÷ ${de(g)} TB = ${de(b / g)} → aufrunden auf ${de(daten)}.`,
        schritt,
        sp ? `Hot Spare${sp > 1 ? 's' : ''}: + ${de(sp)} → ${de(raidPlatten)} + ${de(sp)} = ${de(gesamt)} Platten. Hot Spares zählen nicht zur Nutzkapazität.` : `Ohne Hot Spare: ${de(gesamt)} Platten.`,
        `Kontrolle: nutzbar ${de(nutz)} TB ≥ ${de(b)} TB benötigt.`,
      ],
    };
  },
  aufgabe(r) {
    const level = eins(r, ['5', '6', '10']);
    const g = eins(r, [1, 2, 4, 8]);
    const b = g * ganz(r, 2, 8) + eins(r, [0, g / 2]);
    const spare = eins(r, [0, 1, 1, 2]);
    return {
      text: `Benötigt werden ${de(b)} TB Speicher. Es stehen Platten mit je ${de(g)} TB zur Verfügung. Das System soll als RAID ${level}${spare ? ` mit ${spare} Hot Spare${spare > 1 ? 's' : ''}` : ''} laufen. Wie viele Platten werden insgesamt benötigt?`,
      eingaben: { bedarf: String(b).replace('.', ','), groesse: String(g), level, spare: String(spare) },
      gefragt: ['gesamt'],
    };
  },
  toleranz: 0,
};

// ---------- Archiv-Speicherbedarf ----------

const archiv: Rechner = {
  id: 'archiv',
  titel: 'Speicherbedarf mit Komprimierung',
  kurz: 'Archiv über Jahre – und wie lange reicht der Speicher?',
  felder: [
    { key: 'monat', label: 'Datenmenge pro Monat', typ: 'zahl', einheit: 'GiB', standard: '30' },
    { key: 'komp', label: 'Komprimierungsrate', typ: 'zahl', einheit: '%', standard: '60', hilfe: 'um wie viel Prozent die Daten kleiner werden' },
    { key: 'jahre', label: 'Aufbewahrung', typ: 'zahl', einheit: 'Jahre', standard: '10' },
    { key: 'vorhanden', label: 'Vorhandener Speicher', typ: 'zahl', einheit: 'GiB', standard: '1024', hilfe: '1 TiB = 1.024 GiB; 0 = nicht berechnen' },
  ],
  rechne(e) {
    const m = zahl(e.monat);
    const k = zahl(e.komp);
    const j = zahl(e.jahre);
    const v = zahl(e.vorhanden);
    if (!(m > 0) || !(k >= 0 && k < 100) || !(j > 0) || !(v >= 0)) return { werte: [], schritte: [], fehler: 'Bitte Datenmenge > 0, Komprimierung von 0 bis unter 100 %, Jahre > 0 und Speicher ≥ 0 eingeben.' };
    const rest = 1 - k / 100;
    const proJahr = m * rest * 12;
    const gesamt = proJahr * j;
    const werte: Wert[] = [
      { key: 'gesamt', label: `Speicherbedarf für ${de(j)} Jahre`, text: `${de(gesamt)} GiB`, zahl: gesamt },
      { key: 'jahr', label: 'Bedarf pro Jahr', text: `${de(proJahr)} GiB`, zahl: proJahr },
    ];
    const schritte = [
      `Nach der Komprimierung bleiben ${de(100 - k)} % übrig: ${de(m)} GiB × ${de(rest)} = ${de(m * rest)} GiB pro Monat.`,
      `Pro Jahr: ${de(m * rest)} GiB × 12 = ${de(proJahr)} GiB.`,
      `Für ${de(j)} Jahre: ${de(proJahr)} GiB × ${de(j)} = ${de(gesamt)} GiB (${de(gesamt / 1024)} TiB).`,
    ];
    if (v > 0) {
      const reicht = v / proJahr;
      werte.push({ key: 'reicht', label: 'Vorhandener Speicher reicht', text: `${de(Math.floor(reicht + 1e-9))} volle Jahre (${de(reicht)})`, zahl: Math.floor(reicht + 1e-9) });
      schritte.push(`Reichweite: ${de(v)} GiB ÷ ${de(proJahr)} GiB pro Jahr = ${de(reicht)} → ${de(Math.floor(reicht + 1e-9))} volle Jahre (abrunden, das angefangene Jahr passt nicht mehr ganz).`);
    }
    schritte.push('Achtung: „60 % Komprimierung“ heißt meist „60 % kleiner“. Steht in der Aufgabe „auf 60 % komprimiert“, bleiben 60 % übrig – genau lesen.');
    return { werte, schritte };
  },
  aufgabe(r) {
    const m = eins(r, [10, 20, 25, 30, 40, 50, 80]);
    const k = eins(r, [20, 30, 40, 50, 60, 75]);
    const j = eins(r, [6, 8, 10]);
    const v = eins(r, [512, 1024, 2048]);
    const fragReichweite = r() < 0.5;
    return {
      text: fragReichweite
        ? `Pro Monat fallen ${m} GiB an, die mit ${k} % Komprimierung archiviert werden. Für wie viele volle Jahre reicht ein Archivspeicher von ${de(v)} GiB?`
        : `Pro Monat fallen ${m} GiB an, die mit ${k} % Komprimierung archiviert werden. Wie viel Speicher (GiB) wird für ${j} Jahre Aufbewahrung benötigt?`,
      eingaben: { monat: String(m), komp: String(k), jahre: String(j), vorhanden: String(v) },
      gefragt: [fragReichweite ? 'reicht' : 'gesamt'],
    };
  },
};

// ---------- VoIP-Bandbreite ----------

const CODECS: [string, string, number][] = [
  ['g711', 'G.711 (64 kbit/s)', 64],
  ['g722', 'G.722 (64 kbit/s, HD)', 64],
  ['g729', 'G.729 (8 kbit/s)', 8],
  ['eigen', 'eigene Bitrate', 0],
];

const voip: Rechner = {
  id: 'voip',
  titel: 'VoIP-Bandbreite',
  kurz: 'Gleichzeitige Gespräche mit Codec und Overhead',
  felder: [
    { key: 'codec', label: 'Codec', typ: 'auswahl', optionen: CODECS.map(([k, t]) => [k, t]), standard: 'g711' },
    { key: 'bitrate', label: 'Eigene Bitrate', typ: 'zahl', einheit: 'kbit/s', standard: '64', hilfe: 'nur bei „eigene Bitrate“' },
    { key: 'overhead', label: 'Protokoll-Overhead', typ: 'zahl', einheit: '%', standard: '25' },
    { key: 'intern', label: 'Interne Gespräche', typ: 'zahl', standard: '4' },
    { key: 'extern', label: 'Externe Gespräche', typ: 'zahl', standard: '10' },
    { key: 'cloud', label: 'Telefonanlage', typ: 'auswahl', optionen: [['cloud', 'in der Cloud (intern zählt doppelt)'], ['lokal', 'im Haus (intern ohne Internet)']], standard: 'cloud' },
  ],
  rechne(e) {
    const c = CODECS.find(([k]) => k === e.codec);
    const rate = c && c[2] ? c[2] : zahl(e.bitrate);
    const oh = zahl(e.overhead);
    const i = zahl(e.intern);
    const x = zahl(e.extern);
    if (!c || !(rate > 0) || !(oh >= 0) || !Number.isInteger(i) || !Number.isInteger(x) || i < 0 || x < 0) return { werte: [], schritte: [], fehler: 'Bitte Codec bzw. Bitrate, Overhead ≥ 0 und ganze Zahlen für die Gespräche eingeben.' };
    const cloud = e.cloud !== 'lokal';
    const proVerb = rate * (1 + oh / 100);
    const verb = (cloud ? i * 2 : 0) + x;
    const gesamt = proVerb * verb;
    return {
      werte: [
        { key: 'gesamt', label: 'Bandbreite je Richtung', text: `${de(gesamt)} kbit/s (${de(gesamt / 1000, 3)} Mbit/s)`, zahl: gesamt },
        { key: 'proVerbindung', label: 'je Verbindung', text: `${de(proVerb)} kbit/s`, zahl: proVerb },
        { key: 'verbindungen', label: 'Verbindungen über den Internetanschluss', text: de(verb), zahl: verb },
      ],
      schritte: [
        `Bitrate des Codecs: ${de(rate)} kbit/s je Richtung.`,
        `Mit ${de(oh)} % Overhead: ${de(rate)} × ${de(1 + oh / 100, 4)} = ${de(proVerb)} kbit/s je Verbindung.`,
        cloud
          ? `Cloud-Anlage: Jedes Telefon ist einzeln mit der Cloud verbunden – ${de(i)} interne Gespräche × 2 = ${de(i * 2)} Verbindungen, dazu ${de(x)} externe = ${de(verb)} Verbindungen.`
          : `Anlage im Haus: Interne Gespräche bleiben im LAN; über das Internet laufen nur die ${de(x)} externen Gespräche.`,
        `Gesamt: ${de(verb)} × ${de(proVerb)} kbit/s = ${de(gesamt)} kbit/s ≈ ${de(gesamt / 1000, 3)} Mbit/s – im Upload und im Download.`,
      ],
    };
  },
  aufgabe(r) {
    const codec = eins(r, ['g711', 'g722', 'g729']);
    const oh = eins(r, [10, 15, 20, 25, 30]);
    const i = ganz(r, 0, 8);
    const x = ganz(r, 2, 20);
    const cloud = eins(r, ['cloud', 'cloud', 'lokal']);
    const name = CODECS.find(([k]) => k === codec)![1];
    return {
      text: `Eine ${cloud === 'cloud' ? 'Cloud-Telefonanlage' : 'Telefonanlage im eigenen Haus'} nutzt ${name}, der Protokoll-Overhead beträgt ${oh} %. Gleichzeitig laufen ${i} interne und ${x} externe Gespräche. Welche Bandbreite (kbit/s) wird je Richtung am Internetanschluss benötigt?`,
      eingaben: { codec, bitrate: '64', overhead: String(oh), intern: String(i), extern: String(x), cloud },
      gefragt: ['gesamt'],
    };
  },
};

// ---------- Verfügbarkeit ----------

const verfuegbarkeit: Rechner = {
  id: 'verfuegbarkeit',
  titel: 'Verfügbarkeit',
  kurz: 'Erlaubte Ausfallzeit pro Jahr – oder Verfügbarkeit aus Ausfallzeit',
  felder: [
    { key: 'richtung', label: 'Gesucht', typ: 'auswahl', optionen: [['ausfall', 'Ausfallzeit aus Verfügbarkeit'], ['prozent', 'Verfügbarkeit aus Ausfallzeit']], standard: 'ausfall' },
    { key: 'prozent', label: 'Verfügbarkeit', typ: 'zahl', einheit: '%', standard: '99,9' },
    { key: 'stunden', label: 'Ausfallzeit pro Jahr', typ: 'zahl', einheit: 'h', standard: '12' },
  ],
  rechne(e) {
    const jahr = 365 * 24;
    if (e.richtung === 'prozent') {
      const h = zahl(e.stunden);
      if (!(h >= 0 && h <= jahr)) return { werte: [], schritte: [], fehler: `Bitte eine Ausfallzeit von 0 bis ${jahr} Stunden eingeben.` };
      const p = ((jahr - h) / jahr) * 100;
      return {
        werte: [{ key: 'prozent', label: 'Verfügbarkeit', text: `${de(p, 4)} %`, zahl: p }],
        schritte: [`Ein Jahr hat 365 × 24 = ${de(jahr)} Stunden.`, `Verfügbarkeit = (${de(jahr)} − ${de(h)}) ÷ ${de(jahr)} × 100 = ${de(p, 4)} %.`],
      };
    }
    const p = zahl(e.prozent);
    if (!(p > 0 && p <= 100)) return { werte: [], schritte: [], fehler: 'Bitte eine Verfügbarkeit über 0 bis 100 % eingeben.' };
    const h = jahr * (1 - p / 100);
    return {
      werte: [
        { key: 'stunden', label: 'Ausfallzeit pro Jahr', text: `${de(h)} h`, zahl: h },
        { key: 'minuten', label: 'in Minuten', text: `${de(h * 60, 1)} min`, zahl: h * 60 },
        { key: 'monat', label: 'pro Monat (Durchschnitt)', text: `${de((h * 60) / 12, 1)} min` },
      ],
      schritte: [`Ein Jahr hat 365 × 24 = ${de(jahr)} Stunden.`, `Erlaubter Ausfall = ${de(jahr)} h × (1 − ${de(p, 4)} %) = ${de(jahr)} × ${de(1 - p / 100, 6)} = ${de(h)} h = ${de(h * 60, 1)} min.`],
    };
  },
  aufgabe(r) {
    if (r() < 0.5) {
      const p = eins(r, ['99', '99,5', '99,9', '99,95', '99,99']);
      return { text: `Ein Dienstleister sagt ${p} % Verfügbarkeit pro Jahr zu. Wie viele Stunden Ausfall sind damit höchstens erlaubt?`, eingaben: { richtung: 'ausfall', prozent: p, stunden: '0' }, gefragt: ['stunden'] };
    }
    const h = eins(r, [4, 8, 12, 24, 36, 48]);
    return { text: `Ein Server war im letzten Jahr insgesamt ${h} Stunden nicht erreichbar. Welche Verfügbarkeit in Prozent hatte er (auf vier Nachkommastellen)?`, eingaben: { richtung: 'prozent', prozent: '99', stunden: String(h) }, gefragt: ['prozent'] };
  },
  toleranz: 0.00001,
};

export const RECHNER: Rechner[] = [subnetting, datenmengen, uebertragung, raid, raidBedarf, archiv, usv, verfuegbarkeit, voip, strom, amortisation];

/** Prüft eine Eingabe gegen den richtigen Wert: Zahlen mit Toleranz, Texte (IP) exakt. */
export function pruefeAntwort(w: Wert, eingabe: string, toleranz = 0.005): boolean {
  if (w.zahl !== undefined) {
    const x = zahl(eingabe);
    if (!Number.isFinite(x)) return false;
    if (toleranz === 0) return Math.abs(x - w.zahl) < 1e-9;
    return Math.abs(x - w.zahl) <= Math.max(Math.abs(w.zahl) * toleranz, 0.005);
  }
  return eingabe.trim().replace(/\s/g, '') === w.text.replace(/\s/g, '');
}
