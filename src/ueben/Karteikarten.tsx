import { useEffect, useMemo, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { useAntworten } from '../api';
import { melde } from '../companion/bus';
import { heuteIso } from '../lib/datum';
import { ampelVorschlaege, faellige, mische, zufall, type Karte } from '../lib/training';
import { lies, merke } from '../lib/merken';
import type { KartenStand, Themenfeld } from '../types';
import { Inline } from '../components/ui';
import { AmpelVorschlaege } from './AmpelVorschlaege';
import { FeldAuswahl } from './Auswahl';

type Quelle = 'faellig' | 'alle' | 'fehler';
type Art = 'beide' | 'begriff' | 'frage';
const RUNDE = 20;

/** Karteikarten mit Leitner-System: umdrehen, selbst einschätzen, Fach wandert mit. */
export function Karteikarten({ felder, karten, stand }: { felder: Themenfeld[]; karten: Karte[]; stand: Map<string, KartenStand> }) {
  const [gewaehlt, setGewaehlt] = useState<Set<string>>(() => {
    const m = lies('ueben-felder');
    return new Set(m ? m.split(',').filter((id) => felder.some((f) => f.id === id)) : felder.map((f) => f.id));
  });
  const [quelle, setQuelle] = useState<Quelle>('faellig');
  const [art, setArt] = useState<Art>('beide');
  const [runde, setRunde] = useState<Karte[] | null>(null);

  const waehle = (s: Set<string>) => {
    setGewaehlt(s);
    merke('ueben-felder', [...s].join(','));
  };

  const heute = heuteIso();
  const pool = karten.filter((k) => gewaehlt.has(k.feld) && (art === 'beide' || k.art === art));
  const auswahl =
    quelle === 'faellig'
      ? faellige(pool, stand, heute)
      : quelle === 'fehler'
        ? pool.filter((k) => {
            const s = stand.get(k.id);
            return s && s.falsch > 0 && s.fach <= 2;
          })
        : pool;
  const faecher = [1, 2, 3, 4, 5].map((f) => pool.filter((k) => (stand.get(k.id)?.fach ?? 0) === f).length);
  const neu = pool.filter((k) => !stand.has(k.id)).length;

  if (runde) return <Runde karten={runde} alleKarten={karten} basis={stand} felder={felder} onEnde={() => setRunde(null)} />;

  return (
    <div className="flex flex-col gap-5">
      <FeldAuswahl felder={felder} gewaehlt={gewaehlt} onAendern={waehle} />
      <div className="flex flex-wrap gap-6">
        <Segment
          label="Welche Karten"
          wert={quelle}
          setWert={setQuelle}
          optionen={[
            ['faellig', 'Heute fällig'],
            ['fehler', 'Fehlerliste'],
            ['alle', 'Alle'],
          ]}
        />
        <Segment
          label="Art"
          wert={art}
          setWert={setArt}
          optionen={[
            ['beide', 'Begriffe und Fragen'],
            ['begriff', 'Nur Begriffe'],
            ['frage', 'Nur Prüfungsfragen'],
          ]}
        />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-line bg-bg p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span>
            <strong className="text-2xl">{auswahl.length}</strong> Karten bereit
            <span className="text-sm text-muted"> · {pool.length} insgesamt, davon {neu} noch nie geübt</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs" aria-label="Karten je Fach">
          {faecher.map((n, i) => (
            <span key={i} className="chip bg-chip py-0.5 text-muted">
              Fach {i + 1}: <strong className="text-ink">{n}</strong>
            </span>
          ))}
        </div>
        <p className="text-xs text-muted">
          Gewusst → ein Fach weiter (Fach 2 nach 2 Tagen wieder, Fach 5 nach 3 Wochen). Nicht gewusst → zurück in Fach 1, morgen wieder.
        </p>
      </div>

      <button
        type="button"
        className="btn-primaer w-fit"
        disabled={!auswahl.length}
        onClick={() => setRunde(mische(auswahl, zufall(Date.now())).slice(0, RUNDE))}
      >
        {auswahl.length ? `Los geht's – ${Math.min(RUNDE, auswahl.length)} Karten` : quelle === 'faellig' ? 'Heute ist nichts fällig' : 'Keine Karten'}
      </button>
    </div>
  );
}

function Segment<T extends string>({ label, wert, setWert, optionen }: { label: string; wert: T; setWert: (x: T) => void; optionen: [T, string][] }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold">{label}</span>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1 rounded-xl border border-line bg-bg p-1">
        {optionen.map(([w, t]) => (
          <button
            key={w}
            type="button"
            aria-pressed={wert === w}
            onClick={() => setWert(w)}
            className={`min-h-[36px] rounded-lg px-3 text-sm font-semibold transition ${wert === w ? 'bg-accent text-on-accent' : 'text-ink hover:bg-chip'}`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Eine Runde: Karte zeigen, umdrehen, einschätzen. Nicht gewusste Karten kommen am Ende der Runde noch einmal. */
function Runde({
  karten,
  alleKarten,
  basis,
  felder,
  onEnde,
}: {
  karten: Karte[];
  alleKarten: Karte[];
  basis: Map<string, KartenStand>;
  felder: Themenfeld[];
  onEnde: () => void;
}) {
  const antworten = useAntworten();
  const [stapel, setStapel] = useState(karten);
  const [i, setI] = useState(0);
  const [offen, setOffen] = useState(false);
  const [ergebnis, setErgebnis] = useState<Map<string, boolean>>(new Map());
  // Gesamtstand inkl. der Antworten dieser Runde – für die Ampel-Vorschläge
  const [stand, setStand] = useState<Map<string, KartenStand>>(() => new Map(basis));
  const k = stapel[i];
  const fertig = i >= stapel.length;

  const bewerte = (gewusst: boolean) => {
    if (!k) return;
    const erstes = !ergebnis.has(k.id);
    if (erstes) {
      // nur der erste Versuch zählt fürs Leitner-Fach
      antworten.mutate([{ id: k.id, gewusst }], {
        onSuccess: (r) => setStand((s) => new Map([...s, ...r.karten.map((x) => [x.id, x] as const)])),
      });
      setErgebnis((e) => new Map(e).set(k.id, gewusst));
      melde(gewusst ? 'richtig' : 'falsch');
    }
    if (!gewusst && erstes) setStapel((s) => [...s, k]);
    setOffen(false);
    setI((x) => x + 1);
  };

  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (fertig || (e.target as HTMLElement).closest('input, textarea, select')) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setOffen((o) => !o);
      } else if (offen && e.key === '1') bewerte(false);
      else if (offen && e.key === '2') bewerte(true);
    };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  });

  const unterthemen = useMemo(() => new Set(karten.map((x) => `${x.feld}.${x.unterthema}`)), [karten]);

  useEffect(() => {
    if (fertig && ergebnis.size > 0) melde('runde', { quote: [...ergebnis.values()].filter(Boolean).length / ergebnis.size });
  }, [fertig]);

  if (fertig) {
    const gewusst = [...ergebnis.values()].filter(Boolean).length;
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 rounded-lg bg-accent-soft p-5">
          <span className="ueberschrift-klein">Runde geschafft</span>
          <strong className="text-3xl">
            {gewusst} von {ergebnis.size} gewusst
          </strong>
          <span className="text-sm text-muted">Nicht gewusste Karten kommen morgen wieder dran.</span>
        </div>
        <AmpelVorschlaege vorschlaege={ampelVorschlaege(felder, alleKarten, stand, unterthemen)} />
        <button type="button" className="btn-primaer w-fit" onClick={onEnde}>
          <RotateCcw size={16} aria-hidden="true" />
          Neue Runde
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 text-sm text-muted">
        <span>
          Karte {i + 1} von {stapel.length}
          {i >= karten.length ? ' · Wiederholung' : ''}
        </span>
        <button type="button" className="min-h-[36px] font-semibold text-accent" onClick={onEnde}>
          Runde beenden
        </button>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-track" aria-hidden="true">
        <span className="block h-full bg-accent transition-all" style={{ width: `${(i / stapel.length) * 100}%` }} />
      </div>

      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-label={offen ? 'Karte zurückdrehen' : 'Karte umdrehen'}
        className="flex min-h-[260px] flex-col gap-3 rounded-xl border-2 border-line bg-card p-6 text-left shadow-sm transition hover:border-accent"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {k.art === 'begriff' ? 'Begriff' : 'Prüfungsfrage'} · {k.feldTitel} · {k.unterthemaTitel}
        </span>
        <strong className={k.art === 'begriff' ? 'text-3xl leading-tight' : 'text-xl leading-snug'}>{k.vorne}</strong>
        {offen ? (
          <div className="mt-2 border-t border-line pt-3">
            {k.hinten.length === 1 ? (
              <p className="text-lg">
                <Inline text={k.hinten[0]} />
              </p>
            ) : (
              <ol className="flex list-decimal flex-col gap-1 pl-5">
                {k.hinten.map((x, j) => (
                  <li key={j}>
                    <Inline text={x} />
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : (
          <span className="mt-auto text-sm text-muted">Erst selbst überlegen, dann umdrehen (Leertaste)</span>
        )}
      </button>

      {offen && (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="btn min-h-[52px] border-2 border-rot bg-seg-rot text-seg-rot-ink" onClick={() => bewerte(false)}>
            <X size={18} aria-hidden="true" />
            Nicht gewusst <kbd className="ml-1 hidden rounded border border-current px-1 text-xs sm:inline">1</kbd>
          </button>
          <button type="button" className="btn min-h-[52px] border-2 border-gruen bg-seg-gruen text-seg-gruen-ink" onClick={() => bewerte(true)}>
            <Check size={18} aria-hidden="true" />
            Gewusst <kbd className="ml-1 hidden rounded border border-current px-1 text-xs sm:inline">2</kbd>
          </button>
        </div>
      )}
    </div>
  );
}
