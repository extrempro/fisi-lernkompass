import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { netzplan, type Vorgang, type VorgangZeit } from '../lib/werkzeuge';
import { Ergebnis, Kopf, Merke } from './teile';

interface Zeile {
  id: string;
  name: string;
  dauer: string;
  vor: string;
}

const START: Zeile[] = [
  { id: 'A', name: 'Bedarf aufnehmen', dauer: '2', vor: '' },
  { id: 'B', name: 'Hardware bestellen', dauer: '5', vor: 'A' },
  { id: 'C', name: 'Image erstellen', dauer: '3', vor: 'A' },
  { id: 'D', name: 'Netzwerkdosen prüfen', dauer: '1', vor: 'A' },
  { id: 'E', name: 'Geräte einrichten', dauer: '2', vor: 'B, C' },
  { id: 'F', name: 'Aufstellen', dauer: '1', vor: 'D, E' },
  { id: 'G', name: 'Übergabe, Doku', dauer: '1', vor: 'F' },
];

const B = 168; // Knotenbreite
const H = 88; // Knotenhöhe
const ZH = H / 4;

/** Netzplan mit Vorwärts- und Rückwärtsrechnung, Puffern und kritischem Pfad. */
export function Netzplan() {
  const [zeilen, setZeilen] = useState(START);
  const vorgaenge: Vorgang[] = zeilen.map((z) => ({
    id: z.id.trim(),
    name: z.name.trim(),
    dauer: z.dauer.trim() === '' ? NaN : Number(z.dauer.replace(',', '.')),
    vorgaenger: z.vor
      .split(/[,;\s]+/)
      .map((x) => x.trim())
      .filter(Boolean),
  }));
  const leer = vorgaenge.find((v) => !v.id);
  const plan = leer ? { zeiten: [], dauer: 0, fehler: 'Jeder Vorgang braucht eine Nummer.' } : netzplan(vorgaenge);
  const setze = (i: number, k: keyof Zeile, v: string) => setZeilen((zs) => zs.map((z, j) => (j === i ? { ...z, [k]: v } : z)));
  const naechsteId = () => {
    for (let c = 65; c < 91; c++) if (!zeilen.some((z) => z.id === String.fromCharCode(c))) return String.fromCharCode(c);
    return String(zeilen.length + 1);
  };
  const kritisch = plan.zeiten.filter((z) => z.kritisch).map((z) => z.id);

  return (
    <div className="flex flex-col gap-5">
      <Kopf titel="Netzplan – kritischer Pfad" text="Trag Vorgänge mit Dauer und Vorgängern ein. Der Netzplan rechnet vorwärts, rückwärts und markiert den kritischen Pfad." />

      <div className="relative overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <caption className="sr-only">Vorgangsliste</caption>
          <thead>
            <tr className="text-left">
              <th scope="col" className="px-2 py-2">
                Nr.
              </th>
              <th scope="col" className="px-2 py-2">
                Vorgang
              </th>
              <th scope="col" className="px-2 py-2">
                Dauer (Tage)
              </th>
              <th scope="col" className="px-2 py-2">
                Vorgänger
              </th>
              <th scope="col" className="px-2 py-2">
                <span className="sr-only">Entfernen</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {zeilen.map((z, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-2 py-1.5">
                  <input className="eingabe w-14 font-mono" aria-label={`Nummer Zeile ${i + 1}`} value={z.id} onChange={(e) => setze(i, 'id', e.target.value)} />
                </td>
                <td className="px-2 py-1.5">
                  <input className="eingabe w-full" aria-label={`Vorgang ${z.id}`} value={z.name} onChange={(e) => setze(i, 'name', e.target.value)} />
                </td>
                <td className="px-2 py-1.5">
                  <input className="eingabe w-20" inputMode="decimal" aria-label={`Dauer ${z.id}`} value={z.dauer} onChange={(e) => setze(i, 'dauer', e.target.value)} />
                </td>
                <td className="px-2 py-1.5">
                  <input className="eingabe w-28 font-mono" aria-label={`Vorgänger von ${z.id}`} placeholder="z. B. A, B" value={z.vor} onChange={(e) => setze(i, 'vor', e.target.value)} />
                </td>
                <td className="px-2 py-1.5">
                  <button type="button" className="rounded-md p-2 text-muted hover:bg-chip hover:text-ink" aria-label={`Vorgang ${z.id} entfernen`} onClick={() => setZeilen((zs) => zs.filter((_, j) => j !== i))}>
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-sekundaer" onClick={() => setZeilen((zs) => [...zs, { id: naechsteId(), name: '', dauer: '1', vor: '' }])}>
          <Plus size={16} aria-hidden="true" />
          Vorgang hinzufügen
        </button>
        <button type="button" className="btn-sekundaer" onClick={() => setZeilen(START)}>
          Beispiel zurücksetzen
        </button>
      </div>

      {plan.fehler ? (
        <Ergebnis ton="warn" titel="Netzplan kann nicht berechnet werden">
          <p>{plan.fehler}</p>
        </Ergebnis>
      ) : (
        <>
          <Ergebnis ton="neutral" titel={`Projektdauer: ${zahl(plan.dauer)} Tage`}>
            <p>Kritischer Pfad: {kritisch.join(' → ')} – jede Verzögerung dort verschiebt das Projektende.</p>
          </Ergebnis>
          <Grafik zeiten={plan.zeiten} />
        </>
      )}

      <Merke>
        Vorwärts: FAZ = größter FEZ der Vorgänger, FEZ = FAZ + Dauer. Rückwärts: SEZ = kleinster SAZ der Nachfolger, SAZ = SEZ − Dauer. Gesamtpuffer GP = SAZ − FAZ,
        freier Puffer FP = kleinster FAZ der Nachfolger − FEZ. Kritisch ist, wer keinen Gesamtpuffer hat.
      </Merke>
    </div>
  );
}

const zahl = (n: number) => n.toLocaleString('de-DE');

function Grafik({ zeiten }: { zeiten: VorgangZeit[] }) {
  const ebenen = new Map<number, VorgangZeit[]>();
  for (const z of zeiten) ebenen.set(z.ebene, [...(ebenen.get(z.ebene) ?? []), z]);
  const pos = new Map<string, { x: number; y: number }>();
  const maxZeilen = Math.max(1, ...[...ebenen.values()].map((e) => e.length));
  const breite = Math.max(1, ebenen.size) * (B + 48) - 48 + 20;
  const hoehe = maxZeilen * (H + 28) - 28 + 20;
  for (const [e, liste] of ebenen) {
    const versatz = ((maxZeilen - liste.length) * (H + 28)) / 2;
    liste.forEach((z, i) => pos.set(z.id, { x: 10 + e * (B + 48), y: 10 + versatz + i * (H + 28) }));
  }
  const kanten = zeiten.flatMap((z) => z.vorgaenger.map((v) => ({ von: zeiten.find((x) => x.id === v)!, nach: z })));

  return (
    <div className="relative overflow-x-auto rounded-lg border border-line bg-card">
      <svg width={breite} height={hoehe} viewBox={`0 0 ${breite} ${hoehe}`} role="img" aria-labelledby="netzplan-titel">
        <title id="netzplan-titel">Netzplan, kritische Vorgänge rot umrandet</title>
        <defs>
          <marker id="np-pfeil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" className="sv-pf" />
          </marker>
          <marker id="np-pfeil-k" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" style={{ fill: 'var(--sv-e-fg)' }} />
          </marker>
        </defs>
        {kanten.map(({ von, nach }) => {
          const a = pos.get(von.id)!;
          const b = pos.get(nach.id)!;
          const k = von.kritisch && nach.kritisch && von.fez === nach.faz;
          const x1 = a.x + B;
          const y1 = a.y + H / 2;
          const x2 = b.x - 2;
          const y2 = b.y + H / 2;
          // über mehrere Spalten: auf Höhe der Quelle bis in die letzte Lücke, dort zum Ziel schwenken
          const xg = nach.ebene - von.ebene > 1 ? x2 - 46 : x1;
          const m = (xg + x2) / 2;
          return <path key={`${von.id}-${nach.id}`} d={`M${x1} ${y1} L${xg} ${y1} C${m} ${y1} ${m} ${y2} ${x2} ${y2}`} className={k ? 'sv-ln-e' : 'sv-ln'} markerEnd={`url(#${k ? 'np-pfeil-k' : 'np-pfeil'})`} />;
        })}
        {zeiten.map((z) => {
          const { x, y } = pos.get(z.id)!;
          const d = B / 3;
          const name = z.name.length > 16 ? z.name.slice(0, 15) + '…' : z.name;
          return (
            <g key={z.id} transform={`translate(${x} ${y})`}>
              <rect width={B} height={H} rx={4} className={z.kritisch ? 'sv-e' : 'sv-box'} />
              {[1, 2, 3].map((r) => (
                <line key={r} x1={0} x2={B} y1={r * ZH} y2={r * ZH} className="sv-ln-d" style={{ strokeDasharray: 'none', strokeWidth: 1 }} />
              ))}
              <line x1={B / 2} x2={B / 2} y1={0} y2={ZH} className="sv-ln-d" style={{ strokeDasharray: 'none', strokeWidth: 1 }} />
              <line x1={B / 2} x2={B / 2} y1={3 * ZH} y2={H} className="sv-ln-d" style={{ strokeDasharray: 'none', strokeWidth: 1 }} />
              <line x1={30} x2={30} y1={ZH} y2={2 * ZH} className="sv-ln-d" style={{ strokeDasharray: 'none', strokeWidth: 1 }} />
              <line x1={d} x2={d} y1={2 * ZH} y2={3 * ZH} className="sv-ln-d" style={{ strokeDasharray: 'none', strokeWidth: 1 }} />
              <line x1={2 * d} x2={2 * d} y1={2 * ZH} y2={3 * ZH} className="sv-ln-d" style={{ strokeDasharray: 'none', strokeWidth: 1 }} />
              <Feld x={B / 4} y={0} k="FAZ" w={zahl(z.faz)} />
              <Feld x={(3 * B) / 4} y={0} k="FEZ" w={zahl(z.fez)} />
              <text x={15} y={ZH + 15} textAnchor="middle" className="sv-tb">
                {z.id}
              </text>
              <text x={36} y={ZH + 15} className="sv-t">
                {name}
              </text>
              <Feld x={d / 2} y={2 * ZH} k="D" w={zahl(z.dauer)} />
              <Feld x={d * 1.5} y={2 * ZH} k="GP" w={zahl(z.gp)} />
              <Feld x={d * 2.5} y={2 * ZH} k="FP" w={zahl(z.fp)} />
              <Feld x={B / 4} y={3 * ZH} k="SAZ" w={zahl(z.saz)} />
              <Feld x={(3 * B) / 4} y={3 * ZH} k="SEZ" w={zahl(z.sez)} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Feld({ x, y, k, w }: { x: number; y: number; k: string; w: string }) {
  return (
    <text x={x} y={y + 15} textAnchor="middle">
      <tspan className="sv-tk">{k} </tspan>
      <tspan className="sv-tb">{w}</tspan>
    </text>
  );
}
