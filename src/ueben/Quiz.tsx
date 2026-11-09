import { useEffect, useMemo, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { useAntworten } from '../api';
import { ampelVorschlaege, mcFragen, zufall, type Karte, type McFrage } from '../lib/training';
import { lies, merke } from '../lib/merken';
import type { KartenStand, Themenfeld } from '../types';
import { AmpelVorschlaege } from './AmpelVorschlaege';
import { melde } from '../companion/bus';
import { FeldAuswahl } from './Auswahl';

/** Quiz: Erklärung lesen, den passenden Begriff wählen. Sofortige Rückmeldung; zählt fürs Leitner-Fach mit. */
export function Quiz({ felder, karten, stand }: { felder: Themenfeld[]; karten: Karte[]; stand: Map<string, KartenStand> }) {
  const [gewaehlt, setGewaehlt] = useState<Set<string>>(() => {
    const m = lies('ueben-felder');
    return new Set(m ? m.split(',').filter((id) => felder.some((f) => f.id === id)) : felder.map((f) => f.id));
  });
  const [anzahl, setAnzahl] = useState(10);
  const [fragen, setFragen] = useState<McFrage[] | null>(null);
  const waehle = (s: Set<string>) => {
    setGewaehlt(s);
    merke('ueben-felder', [...s].join(','));
  };
  const pool = karten.filter((k) => gewaehlt.has(k.feld));
  const starte = (liste?: Karte[]) => setFragen(mcFragen(liste ?? pool, liste ? liste.length : anzahl, zufall(Date.now())));

  if (fragen) {
    return (
      <QuizRunde
        fragen={fragen}
        felder={felder}
        alleKarten={karten}
        basis={stand}
        onNeu={() => setFragen(null)}
        onFalscheWiederholen={(l) => starte(l)}
      />
    );
  }
  return (
    <div className="flex flex-col gap-5">
      <FeldAuswahl felder={felder} gewaehlt={gewaehlt} onAendern={waehle} />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Anzahl Fragen</span>
        <div role="group" aria-label="Anzahl Fragen" className="flex w-fit gap-1 rounded-xl border border-line bg-bg p-1">
          {[10, 20, 30].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={anzahl === n}
              onClick={() => setAnzahl(n)}
              className={`min-h-[36px] min-w-[52px] rounded-lg px-3 text-sm font-semibold ${anzahl === n ? 'bg-accent text-on-accent' : 'hover:bg-chip'}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted">Du liest eine Erklärung und wählst den passenden Fachbegriff aus vier Antworten. Die falschen Antworten stammen meist aus demselben Thema.</p>
      <button type="button" className="btn-primaer w-fit" disabled={pool.length < 4} onClick={() => starte()}>
        Quiz starten
      </button>
    </div>
  );
}

function QuizRunde({
  fragen,
  felder,
  alleKarten,
  basis,
  onNeu,
  onFalscheWiederholen,
}: {
  fragen: McFrage[];
  felder: Themenfeld[];
  alleKarten: Karte[];
  basis: Map<string, KartenStand>;
  onNeu: () => void;
  onFalscheWiederholen: (karten: Karte[]) => void;
}) {
  const antworten = useAntworten();
  const [i, setI] = useState(0);
  const [wahl, setWahl] = useState<number | null>(null);
  const [richtig, setRichtig] = useState<Map<string, boolean>>(new Map());
  const [stand, setStand] = useState(() => new Map(basis));
  const q = fragen[i];
  const fertig = i >= fragen.length;

  const waehle = (j: number) => {
    if (wahl !== null || !q) return;
    setWahl(j);
    const ok = j === q.richtig;
    setRichtig((r) => new Map(r).set(q.id, ok));
    melde(ok ? 'richtig' : 'falsch');
    antworten.mutate([{ id: q.id, gewusst: ok }], { onSuccess: (r) => setStand((s) => new Map([...s, ...r.karten.map((x) => [x.id, x] as const)])) });
  };
  const weiter = () => {
    setWahl(null);
    setI((x) => x + 1);
  };

  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (fertig) return;
      if (wahl === null && ['1', '2', '3', '4'].includes(e.key)) waehle(Number(e.key) - 1);
      else if (wahl !== null && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        weiter();
      }
    };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  });

  const unterthemen = useMemo(() => new Set(fragen.map((f) => `${f.karte.feld}.${f.karte.unterthema}`)), [fragen]);

  useEffect(() => {
    if (fertig) melde('runde', { quote: [...richtig.values()].filter(Boolean).length / fragen.length });
  }, [fertig]);

  if (fertig) {
    const n = [...richtig.values()].filter(Boolean).length;
    const falsch = fragen.filter((f) => richtig.get(f.id) === false);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 rounded-lg bg-accent-soft p-5">
          <span className="ueberschrift-klein">Quiz beendet</span>
          <strong className="text-3xl">
            {n} von {fragen.length} richtig
          </strong>
        </div>
        {falsch.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="font-semibold">Das solltest du dir noch einmal ansehen</h3>
            <ul className="flex flex-col gap-1.5 text-sm">
              {falsch.map((f) => (
                <li key={f.id} className="rounded-lg border border-line bg-bg px-3 py-2">
                  <strong>{f.karte.vorne}</strong>
                  <span className="text-muted"> · {f.karte.unterthemaTitel}</span>
                  <span className="block text-muted">{f.karte.hinten[0]}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <AmpelVorschlaege vorschlaege={ampelVorschlaege(felder, alleKarten, stand, unterthemen)} />
        <div className="flex flex-wrap gap-2">
          {falsch.length > 0 && (
            <button type="button" className="btn-primaer" onClick={() => onFalscheWiederholen(falsch.map((f) => f.karte))}>
              Falsche wiederholen ({falsch.length})
            </button>
          )}
          <button type="button" className="btn-sekundaer" onClick={onNeu}>
            <RotateCcw size={16} aria-hidden="true" />
            Neues Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 text-sm text-muted">
        <span>
          Frage {i + 1} von {fragen.length}
        </span>
        <button type="button" className="min-h-[36px] font-semibold text-accent" onClick={onNeu}>
          Quiz beenden
        </button>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-track" aria-hidden="true">
        <span className="block h-full bg-accent transition-all" style={{ width: `${(i / fragen.length) * 100}%` }} />
      </div>
      <div className="flex flex-col gap-2 rounded-xl border-2 border-line bg-card p-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Welcher Begriff passt? · {q.karte.feldTitel}
        </span>
        <p className="text-xl leading-snug">{q.text}</p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Antworten">
        {q.optionen.map((o, j) => {
          const istRichtig = j === q.richtig;
          const stil =
            wahl === null
              ? 'border-line bg-card hover:border-accent'
              : istRichtig
                ? 'border-gruen bg-seg-gruen text-seg-gruen-ink'
                : j === wahl
                  ? 'border-rot bg-seg-rot text-seg-rot-ink'
                  : 'border-line bg-card opacity-60';
          return (
            <button
              key={o}
              type="button"
              disabled={wahl !== null}
              onClick={() => waehle(j)}
              className={`flex min-h-[56px] items-center gap-3 rounded-lg border-2 px-4 py-2 text-left font-semibold transition ${stil}`}
            >
              <kbd className="hidden h-6 w-6 shrink-0 items-center justify-center rounded border border-current text-xs sm:flex">{j + 1}</kbd>
              <span className="flex-1">{o}</span>
              {wahl !== null && istRichtig && <Check size={18} aria-label="richtig" />}
              {wahl === j && !istRichtig && <X size={18} aria-label="falsch" />}
            </button>
          );
        })}
      </div>
      {wahl !== null && (
        <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-3">
          <span className={`font-semibold ${wahl === q.richtig ? 'text-seg-gruen-ink' : 'text-rot'}`}>
            {wahl === q.richtig ? 'Richtig!' : `Leider falsch – richtig ist „${q.optionen[q.richtig]}“.`}
          </span>
          <button type="button" autoFocus className="btn-primaer" onClick={weiter}>
            {i + 1 < fragen.length ? 'Weiter' : 'Auswertung'}
          </button>
        </div>
      )}
    </div>
  );
}
