import { useState } from 'react';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { nutzwert } from '../lib/werkzeuge';
import { Ergebnis, Kopf, Merke } from './teile';

interface Stand {
  kriterien: { name: string; gewicht: string }[];
  alternativen: string[];
  punkte: string[][]; // [alternative][kriterium]
}

const START: Stand = {
  kriterien: [
    { name: 'Anschaffungskosten', gewicht: '30' },
    { name: 'Funktionsumfang', gewicht: '25' },
    { name: 'Bedienbarkeit', gewicht: '20' },
    { name: 'Support und Updates', gewicht: '15' },
    { name: 'Datenschutz (Hosting in der EU)', gewicht: '10' },
  ],
  alternativen: ['Lösung A', 'Lösung B', 'Lösung C'],
  punkte: [
    ['8', '5', '7', '6', '9'],
    ['5', '9', '6', '8', '6'],
    ['7', '7', '8', '5', '4'],
  ],
};

const n = (s: string) => Number(s.replace(',', '.')) || 0;
const de = (x: number) => x.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Nutzwertanalyse: Kriterien gewichten, Alternativen bewerten, gewichtete Summe vergleichen. */
export function Nutzwertanalyse() {
  const [s, setS] = useState(START);
  const nw = nutzwert(
    s.kriterien.map((k) => n(k.gewicht)),
    s.punkte.map((p) => p.map(n)),
  );
  const sieger = nw.ergebnisse.map((e, i) => ({ ...e, i })).filter((e) => e.rang === 1);
  const gewichtOk = Math.abs(nw.summeGewicht - 100) < 0.001;

  const setKriterium = (i: number, k: 'name' | 'gewicht', v: string) => setS((x) => ({ ...x, kriterien: x.kriterien.map((y, j) => (j === i ? { ...y, [k]: v } : y)) }));
  const setPunkt = (a: number, k: number, v: string) => setS((x) => ({ ...x, punkte: x.punkte.map((p, j) => (j === a ? p.map((q, l) => (l === k ? v : q)) : p)) }));
  const setAlt = (a: number, v: string) => setS((x) => ({ ...x, alternativen: x.alternativen.map((y, j) => (j === a ? v : y)) }));

  return (
    <div className="flex flex-col gap-5">
      <Kopf titel="Nutzwertanalyse" text="Kriterien gewichten (zusammen 100 %), Alternativen mit 1 bis 10 Punkten bewerten. Teilnutzen = Gewicht × Punkte." />

      <div className="relative overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">Bewertungstabelle</caption>
          <thead>
            <tr className="text-left">
              <th scope="col" className="px-2 py-2">
                Kriterium
              </th>
              <th scope="col" className="px-2 py-2">
                Gewicht %
              </th>
              {s.alternativen.map((a, i) => (
                <th key={i} scope="col" className="px-2 py-2">
                  <input className="eingabe w-full font-semibold" aria-label={`Name Alternative ${i + 1}`} value={a} onChange={(e) => setAlt(i, e.target.value)} />
                </th>
              ))}
              <th scope="col" className="px-2 py-2">
                <span className="sr-only">Entfernen</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {s.kriterien.map((k, ki) => (
              <tr key={ki} className="border-t border-line align-top">
                <td className="px-2 py-1.5">
                  <input className="eingabe w-full" aria-label={`Kriterium ${ki + 1}`} value={k.name} onChange={(e) => setKriterium(ki, 'name', e.target.value)} />
                </td>
                <td className="px-2 py-1.5">
                  <input className="eingabe w-20" inputMode="decimal" aria-label={`Gewicht ${k.name}`} value={k.gewicht} onChange={(e) => setKriterium(ki, 'gewicht', e.target.value)} />
                </td>
                {s.alternativen.map((a, ai) => (
                  <td key={ai} className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        className="eingabe w-16"
                        type="number"
                        min={0}
                        max={10}
                        aria-label={`${a}: Punkte für ${k.name}`}
                        value={s.punkte[ai][ki]}
                        onChange={(e) => setPunkt(ai, ki, e.target.value)}
                      />
                      <span className="font-mono text-xs text-muted" title="Teilnutzen">
                        {de(nw.ergebnisse[ai].teil[ki])}
                      </span>
                    </div>
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    className="rounded-md p-2 text-muted hover:bg-chip hover:text-ink disabled:opacity-30"
                    disabled={s.kriterien.length <= 2}
                    aria-label={`Kriterium ${k.name} entfernen`}
                    onClick={() => setS((x) => ({ ...x, kriterien: x.kriterien.filter((_, j) => j !== ki), punkte: x.punkte.map((p) => p.filter((_, j) => j !== ki)) }))}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-line font-semibold">
              <td className="px-2 py-2">Nutzwert</td>
              <td className={`px-2 py-2 ${gewichtOk ? '' : 'text-seg-rot-ink'}`}>{de(nw.summeGewicht).replace(',00', '')} %</td>
              {nw.ergebnisse.map((e, i) => (
                <td key={i} className={`px-2 py-2 font-mono text-base ${e.rang === 1 ? 'text-accent' : ''}`}>
                  {de(e.summe)} <span className="font-sans text-xs font-normal text-muted">Rang {e.rang}</span>
                </td>
              ))}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-sekundaer"
          onClick={() => setS((x) => ({ ...x, kriterien: [...x.kriterien, { name: '', gewicht: '0' }], punkte: x.punkte.map((p) => [...p, '5']) }))}
        >
          <Plus size={16} aria-hidden="true" />
          Kriterium
        </button>
        <button type="button" className="btn-sekundaer" onClick={() => setS(START)}>
          Beispiel zurücksetzen
        </button>
      </div>

      {!gewichtOk ? (
        <Ergebnis ton="warn" titel={`Die Gewichte ergeben ${de(nw.summeGewicht).replace(',00', '')} % statt 100 %`}>
          <p>Passe die Gewichte an, sonst sind die Nutzwerte nicht vergleichbar.</p>
        </Ergebnis>
      ) : (
        <Ergebnis ton="gut" titel={sieger.length === 1 ? `Empfehlung: ${s.alternativen[sieger[0].i]} (${de(sieger[0].summe)} Punkte)` : 'Gleichstand an der Spitze'}>
          <p className="flex items-center gap-2">
            <Trophy size={16} aria-hidden="true" />
            {sieger.length === 1
              ? 'Liegen zwei Alternativen dicht beieinander, lohnt ein zweiter Blick: Wie robust ist das Ergebnis, wenn du ein Gewicht leicht änderst?'
              : 'Entscheide über ein K.-o.-Kriterium oder überprüfe die Gewichtung.'}
          </p>
        </Ergebnis>
      )}
      <Merke>
        Erst die Gewichte festlegen, dann bewerten – sonst rechnet man sich den Favoriten schön. In der Projektdokumentation gehört die Nutzwertanalyse zur
        Begründung der Entscheidung, zusammen mit einer Kostenbetrachtung.
      </Merke>
    </div>
  );
}
