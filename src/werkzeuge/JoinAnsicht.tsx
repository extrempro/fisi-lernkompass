import { useState } from 'react';
import { join, type JoinArt } from '../lib/werkzeuge';
import { Kopf, Merke, Umschalter } from './teile';

type W = string | number | null;
const KUNDEN: W[][] = [
  [1, 'Meier GmbH'],
  [2, 'Schulz KG'],
  [3, 'Yilmaz IT'],
];
const BESTELLUNGEN: W[][] = [
  [101, 1, 'Notebook'],
  [102, 3, 'Monitor'],
  [103, 1, 'Dockingstation'],
  [104, null, 'Headset'],
];
const KK = ['kunde_id', 'name'];
const BK = ['bestell_nr', 'kunde_id', 'artikel'];

const ARTEN: [JoinArt, string][] = [
  ['INNER', 'INNER'],
  ['LEFT', 'LEFT'],
  ['RIGHT', 'RIGHT'],
  ['FULL', 'FULL OUTER'],
  ['CROSS', 'CROSS'],
];

const ERKLAERUNG: Record<JoinArt, string> = {
  INNER: 'Nur Zeilen, die auf beiden Seiten einen Partner haben. Schulz KG (keine Bestellung) und das Headset (kein Kunde) fallen weg.',
  LEFT: 'Alle Kunden, auch ohne Bestellung. Fehlt der Partner, stehen rechts NULL-Werte – so findest du z. B. Kunden ohne Bestellung (WHERE b.bestell_nr IS NULL).',
  RIGHT: 'Alle Bestellungen, auch ohne Kunden. Spiegelbild des LEFT JOIN – meist schreibt man stattdessen einen LEFT JOIN mit vertauschten Tabellen.',
  FULL: 'Alle Zeilen beider Tabellen, ergänzt um NULL, wo der Partner fehlt. MySQL kennt FULL OUTER JOIN nicht – dort LEFT und RIGHT JOIN mit UNION verbinden.',
  CROSS: 'Kartesisches Produkt: jede Zeile links mit jeder Zeile rechts (3 × 4 = 12 Zeilen), ganz ohne Verknüpfungsbedingung. Passiert auch, wenn man die ON-Bedingung vergisst.',
};

/** SQL-JOINs anschaulich: Quelltabellen, Ergebnis und welche Zeilen dabei sind. */
export function JoinAnsicht() {
  const [art, setArt] = useState<JoinArt>('INNER');
  const erg = join(KUNDEN, BESTELLUNGEN, 0, 1, art);
  const linksDabei = new Set(erg.map((z) => z.links));
  const rechtsDabei = new Set(erg.map((z) => z.rechts));
  const sql =
    art === 'CROSS'
      ? 'SELECT k.name, b.bestell_nr, b.artikel\nFROM kunde k\nCROSS JOIN bestellung b;'
      : `SELECT k.name, b.bestell_nr, b.artikel\nFROM kunde k\n${art === 'FULL' ? 'FULL OUTER' : art} JOIN bestellung b\n  ON k.kunde_id = b.kunde_id;`;

  return (
    <div className="flex flex-col gap-5">
      <Kopf titel="SQL – JOINs verstehen" text="Wähl eine JOIN-Art und sieh, welche Zeilen im Ergebnis landen." />
      <Umschalter label="JOIN-Art" wert={art} optionen={ARTEN} onWahl={setArt} />
      <pre className="overflow-x-auto rounded-lg bg-bg px-4 py-3 font-mono text-sm text-code-ink">{sql}</pre>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Tabelle titel="kunde (links)" kopf={KK} zeilen={KUNDEN} dabei={(i) => linksDabei.has(i)} schluessel={0} />
        <Tabelle titel="bestellung (rechts)" kopf={BK} zeilen={BESTELLUNGEN} dabei={(i) => rechtsDabei.has(i)} schluessel={1} />
      </div>

      <div className="relative overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse text-sm">
          <caption className="px-3 pt-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Ergebnis: {erg.length} Zeilen</caption>
          <thead>
            <tr className="text-left">
              <th scope="col" className="px-3 py-2">
                k.name
              </th>
              <th scope="col" className="px-3 py-2">
                b.bestell_nr
              </th>
              <th scope="col" className="px-3 py-2">
                b.artikel
              </th>
            </tr>
          </thead>
          <tbody>
            {erg.map((z, i) => (
              <tr key={i} className="border-t border-line">
                <Wert w={z.links === null ? null : KUNDEN[z.links][1]} />
                <Wert w={z.rechts === null ? null : BESTELLUNGEN[z.rechts][0]} />
                <Wert w={z.rechts === null ? null : BESTELLUNGEN[z.rechts][2]} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Merke>{ERKLAERUNG[art]}</Merke>
    </div>
  );
}

function Tabelle({ titel, kopf, zeilen, dabei, schluessel }: { titel: string; kopf: string[]; zeilen: W[][]; dabei: (i: number) => boolean; schluessel: number }) {
  return (
    <div className="relative overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-sm">
        <caption className="px-3 pt-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{titel}</caption>
        <thead>
          <tr className="text-left">
            {kopf.map((k, j) => (
              <th key={k} scope="col" className={`px-3 py-2 ${j === schluessel ? 'text-accent' : ''}`}>
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z, i) => {
            const ja = dabei(i);
            return (
              <tr key={i} className={`border-t border-line ${ja ? 'bg-seg-gruen text-seg-gruen-ink' : 'text-muted line-through decoration-1'}`}>
                {z.map((w, j) => (
                  <Wert key={j} w={w} />
                ))}
                <td className="sr-only">{ja ? 'im Ergebnis' : 'nicht im Ergebnis'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Wert({ w }: { w: W }) {
  return <td className="px-3 py-2 font-mono">{w === null ? <span className="italic text-muted">NULL</span> : w}</td>;
}
