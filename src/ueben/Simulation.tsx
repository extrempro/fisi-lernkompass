import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Clock, RotateCcw } from 'lucide-react';
import { useAntworten, useVersuchSpeichern } from '../api';
import { melde, stummSchalten } from '../companion/bus';
import { formatDatum, PRUEFUNG_NAME } from '../lib/datum';
import { ampelVorschlaege, mcFragen, note, zufall, type Karte, type McFrage } from '../lib/training';
import type { KartenStand, PruefungKey, Themenfeld, Versuch } from '../types';
import { AmpelVorschlaege } from './AmpelVorschlaege';

const UMFANG: Record<PruefungKey, { fragen: number; minuten: number }> = {
  AP1: { fragen: 30, minuten: 45 },
  AP2: { fragen: 40, minuten: 60 },
};

/** Fragen gleichmäßig über die Themenfelder der Prüfung verteilen. */
function stelleZusammen(felder: Themenfeld[], karten: Karte[], key: PruefungKey, r: () => number): McFrage[] {
  const relevant = felder.filter((f) => f.pruefung.includes(key)).map((f) => f.id);
  const proFeld = relevant.map((id) => mcFragen(karten.filter((k) => k.feld === id), 40, r));
  const liste: McFrage[] = [];
  for (let runde = 0; liste.length < UMFANG[key].fragen && runde < 40; runde++) {
    for (const l of proFeld) if (l[runde] && liste.length < UMFANG[key].fragen) liste.push(l[runde]);
  }
  return liste;
}

function mmss(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function Simulation({
  felder,
  karten,
  stand,
  versuche,
}: {
  felder: Themenfeld[];
  karten: Karte[];
  stand: Map<string, KartenStand>;
  versuche: Versuch[];
}) {
  const [key, setKey] = useState<PruefungKey>('AP1');
  const [fragen, setFragen] = useState<McFrage[] | null>(null);

  if (fragen) return <Durchgang key={fragen[0]?.id} pruefung={key} fragen={fragen} felder={felder} karten={karten} basis={stand} onEnde={() => setFragen(null)} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Prüfung</span>
        <div role="group" aria-label="Prüfung wählen" className="flex w-fit gap-1 rounded-xl border border-line bg-bg p-1">
          {(['AP1', 'AP2'] as PruefungKey[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={key === k}
              onClick={() => setKey(k)}
              className={`min-h-[40px] rounded-lg px-4 text-sm font-semibold ${key === k ? 'bg-accent text-on-accent' : 'hover:bg-chip'}`}
            >
              {PRUEFUNG_NAME[k]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-line bg-bg p-4 text-sm">
        <strong className="text-base">
          {UMFANG[key].fragen} Fragen · {UMFANG[key].minuten} Minuten
        </strong>
        <span className="text-muted">
          Gemischt aus allen Themenfeldern, die zu {PRUEFUNG_NAME[key]} gehören. Du kannst zwischen den Fragen springen; ausgewertet wird erst beim Abgeben – oder wenn die Zeit um ist.
        </span>
        <span className="flex items-start gap-2 text-warn-ink">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          Die echte Prüfung besteht aus offenen Aufgaben, Rechnungen und Fallbeispielen. Die Simulation prüft dein Fachwissen – für Rechenaufgaben gibt es den Reiter „Rechner“.
        </span>
      </div>
      <button type="button" className="btn-primaer w-fit" onClick={() => setFragen(stelleZusammen(felder, karten, key, zufall(Date.now())))}>
        <Clock size={16} aria-hidden="true" />
        Simulation starten
      </button>

      {versuche.length > 0 && (
        <section aria-labelledby="bisherige" className="flex flex-col gap-2">
          <h3 id="bisherige" className="font-semibold">
            Bisherige Versuche
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3">Datum</th>
                  <th className="py-2 pr-3">Prüfung</th>
                  <th className="py-2 pr-3 text-right">Ergebnis</th>
                  <th className="py-2 pr-3">Note</th>
                  <th className="py-2 text-right">Zeit</th>
                </tr>
              </thead>
              <tbody>
                {versuche.slice(0, 10).map((v) => {
                  const p = Math.round((v.richtig / v.fragen) * 100);
                  return (
                    <tr key={v.id} className="border-b border-line last:border-0">
                      <td className="py-2 pr-3">{formatDatum(v.datum)}</td>
                      <td className="py-2 pr-3">{PRUEFUNG_NAME[v.pruefung]}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {v.richtig}/{v.fragen} · {p} %
                      </td>
                      <td className="py-2 pr-3">{note(p).text}</td>
                      <td className="py-2 text-right tabular-nums">{mmss(v.dauer)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Durchgang({
  pruefung,
  fragen,
  felder,
  karten,
  basis,
  onEnde,
}: {
  pruefung: PruefungKey;
  fragen: McFrage[];
  felder: Themenfeld[];
  karten: Karte[];
  basis: Map<string, KartenStand>;
  onEnde: () => void;
}) {
  const antworten = useAntworten();
  const speichern = useVersuchSpeichern();
  const limit = UMFANG[pruefung].minuten * 60;
  const [wahl, setWahl] = useState<(number | null)[]>(() => fragen.map(() => null));
  const [i, setI] = useState(0);
  const [rest, setRest] = useState(limit);
  const [abgegeben, setAbgegeben] = useState(false);
  const [frage, setFrage] = useState(false);
  const [stand, setStand] = useState(() => new Map(basis));
  const start = useRef(Date.now());

  const abgeben = () => {
    if (abgegeben) return;
    setAbgegeben(true);
    const dauer = Math.min(limit, Math.round((Date.now() - start.current) / 1000));
    const felderErgebnis: Record<string, [number, number]> = {};
    fragen.forEach((q, j) => {
      const e = felderErgebnis[q.karte.feld] ?? [0, 0];
      felderErgebnis[q.karte.feld] = [e[0] + (wahl[j] === q.richtig ? 1 : 0), e[1] + 1];
    });
    const richtig = fragen.filter((q, j) => wahl[j] === q.richtig).length;
    speichern.mutate({ pruefung, fragen: fragen.length, richtig, dauer, felder: felderErgebnis });
    antworten.mutate(
      fragen.map((q, j) => ({ id: q.id, gewusst: wahl[j] === q.richtig })),
      { onSuccess: (r) => setStand((s) => new Map([...s, ...r.karten.map((x) => [x.id, x] as const)])) },
    );
  };

  useEffect(() => {
    if (abgegeben) return;
    const t = setInterval(() => {
      const r = limit - Math.round((Date.now() - start.current) / 1000);
      setRest(Math.max(0, r));
      if (r <= 0) abgeben();
    }, 1000);
    return () => clearInterval(t);
  });

  // Während der Prüfung schweigt der Hoodie und ist ausgeblendet; danach kommentiert er das Ergebnis.
  useEffect(() => {
    if (abgegeben) {
      melde('simulation', { quote: fragen.filter((q, j) => wahl[j] === q.richtig).length / fragen.length });
      return;
    }
    return stummSchalten('simulation');
  }, [abgegeben]);

  const unterthemen = useMemo(() => new Set(fragen.map((f) => `${f.karte.feld}.${f.karte.unterthema}`)), [fragen]);
  const offen = wahl.filter((w) => w === null).length;

  if (abgegeben) {
    const richtig = fragen.filter((q, j) => wahl[j] === q.richtig).length;
    const p = Math.round((richtig / fragen.length) * 100);
    const n = note(p);
    const feldNamen = new Map(felder.map((f) => [f.id, f.titel]));
    const proFeld = new Map<string, [number, number]>();
    fragen.forEach((q, j) => {
      const e = proFeld.get(q.karte.feld) ?? [0, 0];
      proFeld.set(q.karte.feld, [e[0] + (wahl[j] === q.richtig ? 1 : 0), e[1] + 1]);
    });
    return (
      <div className="flex flex-col gap-5">
        <div className={`flex flex-wrap items-end justify-between gap-3 rounded-lg p-5 ${p >= 50 ? 'bg-seg-gruen text-seg-gruen-ink' : 'bg-seg-rot text-seg-rot-ink'}`}>
          <div>
            <span className="ueberschrift-klein !text-current">{PRUEFUNG_NAME[pruefung]} · Simulation</span>
            <strong className="block text-4xl">{p} %</strong>
            <span>
              {richtig} von {fragen.length} richtig · Note {n.note} ({n.text})
            </span>
          </div>
          <span className="text-sm">{p >= 50 ? 'Bestanden-Grenze (50 %) erreicht' : 'Unter der Bestehensgrenze von 50 %'}</span>
        </div>
        <section aria-labelledby="pro-feld" className="flex flex-col gap-2">
          <h3 id="pro-feld" className="font-semibold">
            Nach Themenfeld
          </h3>
          <ul className="flex flex-col gap-1.5">
            {[...proFeld.entries()]
              .sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1])
              .map(([id, [r, g]]) => (
                <li key={id} className="grid grid-cols-[minmax(0,1fr)_120px_56px] items-center gap-3 text-sm">
                  <span className="truncate">{feldNamen.get(id) ?? id}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-track" aria-hidden="true">
                    <span className="block h-full rounded-full" style={{ width: `${(r / g) * 100}%`, background: r / g >= 0.67 ? '#16A34A' : r / g >= 0.5 ? '#F59E0B' : '#DC2626' }} />
                  </span>
                  <span className="text-right tabular-nums">
                    {r}/{g}
                  </span>
                </li>
              ))}
          </ul>
        </section>
        <details className="rounded-lg border border-line bg-bg px-4 py-2">
          <summary className="flex min-h-[40px] items-center font-semibold">Alle Fragen mit Lösung</summary>
          <ol className="flex list-decimal flex-col gap-2 py-2 pl-5 text-sm">
            {fragen.map((q, j) => (
              <li key={q.id}>
                <span>{q.text}</span>
                <span className="block">
                  Richtig: <strong>{q.optionen[q.richtig]}</strong>
                  {wahl[j] !== q.richtig && (
                    <span className="text-rot"> · deine Antwort: {wahl[j] === null ? 'keine' : q.optionen[wahl[j]!]}</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </details>
        <AmpelVorschlaege vorschlaege={ampelVorschlaege(felder, karten, stand, unterthemen)} />
        <button type="button" className="btn-primaer w-fit" onClick={onEnde}>
          <RotateCcw size={16} aria-hidden="true" />
          Zurück zur Auswahl
        </button>
      </div>
    );
  }

  const q = fragen[i];
  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-16 z-[5] flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-card px-4 py-2 shadow-sm">
        <span className="text-sm font-semibold">
          Frage {i + 1} von {fragen.length} · {fragen.length - offen} beantwortet
        </span>
        <span className={`inline-flex items-center gap-1.5 font-semibold tabular-nums ${rest < 300 ? 'text-rot' : ''}`} role="timer" aria-label={`Restzeit ${mmss(rest)}`}>
          <Clock size={16} aria-hidden="true" />
          {mmss(rest)}
        </span>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border-2 border-line bg-card p-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Welcher Begriff passt? · {q.karte.feldTitel}</span>
        <p className="text-xl leading-snug">{q.text}</p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Antworten">
        {q.optionen.map((o, j) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={wahl[i] === j}
            onClick={() => setWahl((w) => w.map((x, k) => (k === i ? j : x)))}
            className={`min-h-[56px] rounded-lg border-2 px-4 py-2 text-left font-semibold transition ${
              wahl[i] === j ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-card hover:border-accent'
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button type="button" className="btn-sekundaer" disabled={i === 0} onClick={() => setI(i - 1)}>
            ← Zurück
          </button>
          <button type="button" className="btn-sekundaer" disabled={i === fragen.length - 1} onClick={() => setI(i + 1)}>
            Weiter →
          </button>
        </div>
        {frage ? (
          <span className="flex flex-wrap items-center gap-2 text-sm">
            {offen ? `${offen} Fragen sind noch offen. ` : ''}Wirklich abgeben?
            <button type="button" className="btn-primaer min-h-[40px]" autoFocus onClick={abgeben}>
              Ja, abgeben
            </button>
            <button type="button" className="btn-sekundaer min-h-[40px]" onClick={() => setFrage(false)}>
              Nein
            </button>
          </span>
        ) : (
          <button type="button" className="btn-primaer" onClick={() => setFrage(true)}>
            Abgeben
          </button>
        )}
      </div>

      <nav aria-label="Fragenübersicht" className="flex flex-wrap gap-1">
        {fragen.map((_, j) => (
          <button
            key={j}
            type="button"
            onClick={() => setI(j)}
            aria-current={j === i ? 'step' : undefined}
            aria-label={`Frage ${j + 1}${wahl[j] === null ? ', offen' : ', beantwortet'}`}
            className={`h-9 w-9 rounded-md border text-xs font-semibold ${
              j === i ? 'border-accent bg-accent text-on-accent' : wahl[j] === null ? 'border-line bg-card text-muted' : 'border-accent-soft bg-accent-soft text-accent'
            }`}
          >
            {j + 1}
          </button>
        ))}
      </nav>
    </div>
  );
}
