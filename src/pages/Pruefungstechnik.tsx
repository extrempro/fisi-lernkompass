import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Lightbulb, RotateCcw, X } from 'lucide-react';
import { OPERATOREN, SPIELREGELN, TIPPS, UEBUNGEN, type Uebung } from '../lib/pruefungstechnik';
import { mische, zufall } from '../lib/training';
import { PruefungsReiter } from './Pruefungen';

/** Prüfungstechnik: Arbeitsaufträge, Übung „volle Punkte?“, Spielregeln und Tipps für die schriftlichen Bereiche. */
export function Pruefungstechnik() {
  return (
    <>
      <header>
        <h1 className="text-[32px] font-bold leading-tight">Prüfungen</h1>
        <p className="text-sm text-muted">Wie du in den schriftlichen Prüfungen Punkte holst – nicht nur was, sondern wie du antwortest.</p>
      </header>
      <PruefungsReiter />

      <section className="karte flex flex-col gap-2 border-l-4 border-l-accent p-6">
        <h2 className="text-xl font-semibold">Der Arbeitsauftrag entscheidet</h2>
        <p className="text-sm">
          Die Korrekturhinweise der Kammer bewerten ausdrücklich nach der „Dimension der Aufgabenstellung“: Wer bei <strong>erläutern</strong> nur ein Stichwort
          schreibt, bekommt auch mit dem richtigen Fachbegriff oft nur einen Bruchteil der Punkte. Umgekehrt kostet eine ausführliche Antwort bei{' '}
          <strong>nennen</strong> nur Zeit. Lies deshalb zuerst das Verb – und die Punktzahl.
        </p>
      </section>

      <Abschnitt titel="Arbeitsaufträge und was sie verlangen">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {OPERATOREN.map((o) => (
            <article key={o.wort} className="flex flex-col gap-2 rounded-lg border border-line bg-bg p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-bold text-accent">{o.wort}</h3>
                <span className="chip bg-chip text-muted">{o.umfang}</span>
              </div>
              <p className="text-sm">{o.verlangt}</p>
              <div className="rounded-md bg-card p-3 text-sm">
                <p className="font-semibold">{o.frage}</p>
                <p className="mt-1 text-muted">
                  <span className="font-semibold text-ink">Antwort: </span>
                  {o.antwort}
                </p>
              </div>
              {o.falle && (
                <p className="flex gap-2 rounded-md bg-warn px-3 py-2 text-sm text-warn-ink">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{o.falle}</span>
                </p>
              )}
            </article>
          ))}
        </div>
        <p className="text-xs text-muted">Die Erklärungen sind eine Richtschnur nach gängigen Operatorenlisten; im Zweifel zählt, was die Aufgabe genau verlangt.</p>
      </Abschnitt>

      <Abschnitt titel="Übung: Welche Antwort bekommt volle Punkte?">
        <VollePunkteUebung />
      </Abschnitt>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="karte flex min-w-0 flex-col gap-3 p-6">
          <h2 className="text-xl font-semibold">Spielregeln der schriftlichen Prüfung</h2>
          <ul className="flex flex-col gap-2">
            {SPIELREGELN.map((r) => (
              <li key={r} className="flex gap-2 text-sm">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-auto text-xs text-muted">Nach den Bearbeitungshinweisen der Aufgabensätze und der FIAusbV 2020, §§ 20–23.</p>
        </div>
        <div className="karte flex min-w-0 flex-col gap-3 p-6">
          <h2 className="text-xl font-semibold">Tipps für Zeit und Punkte</h2>
          <ul className="flex flex-col gap-3">
            {TIPPS.map((t) => (
              <li key={t.titel} className="flex gap-2 text-sm">
                <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <span>
                  <strong>{t.titel}:</strong> {t.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function Abschnitt({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <section className="karte flex min-w-0 flex-col gap-4 p-6">
      <h2 className="text-xl font-semibold">{titel}</h2>
      {children}
    </section>
  );
}

function neueRunde(seed: number): Uebung[] {
  const r = zufall(seed);
  return mische(UEBUNGEN, r).map((u) => ({ ...u, antworten: mische(u.antworten, r) }));
}

function VollePunkteUebung() {
  const [runde, setRunde] = useState(() => neueRunde(Date.now()));
  const [i, setI] = useState(0);
  const [wahl, setWahl] = useState<number | null>(null);
  const [richtig, setRichtig] = useState(0);
  const u = runde[i];
  const fertig = i >= runde.length;
  const neu = () => {
    setRunde(neueRunde(Date.now()));
    setI(0);
    setWahl(null);
    setRichtig(0);
  };
  const ergebnisText = useMemo(() => (richtig === runde.length ? 'Perfekt – du triffst den Umfang sicher.' : richtig >= runde.length * 0.7 ? 'Gut – schau dir die Erklärungen der verpassten Fragen noch einmal an.' : 'Achte vor allem auf das Verb: nennen, beschreiben, erläutern und begründen verlangen deutlich unterschiedlich viel.'), [richtig, runde.length]);

  if (fertig) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 rounded-lg bg-accent-soft p-5">
          <span className="ueberschrift-klein">Übung geschafft</span>
          <strong className="text-3xl">
            {richtig} von {runde.length} richtig erkannt
          </strong>
          <span className="text-sm text-muted">{ergebnisText}</span>
        </div>
        <button type="button" className="btn-primaer w-fit" onClick={neu}>
          <RotateCcw size={16} aria-hidden="true" />
          Noch einmal
        </button>
      </div>
    );
  }

  const beantwortet = wahl !== null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>
          Frage {i + 1} von {runde.length} · {richtig} richtig
        </span>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-track" aria-hidden="true">
          <span className="block h-full bg-accent transition-all" style={{ width: `${(i / runde.length) * 100}%` }} />
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border-2 border-line bg-bg p-4">
        <div className="flex flex-wrap gap-1">
          <span className="chip bg-accent text-on-accent">{u.operator}</span>
          <span className="chip bg-chip text-muted">{u.punkte} Punkte</span>
        </div>
        <p className="text-lg font-semibold leading-snug">{u.frage}</p>
      </div>
      <p className="text-sm text-muted">Welche Antwort bekäme die volle Punktzahl?</p>
      <ul className="flex flex-col gap-2">
        {u.antworten.map((a, j) => {
          const gewaehlt = wahl === j;
          const farbe = !beantwortet
            ? 'border-line bg-card hover:border-accent'
            : a.voll
              ? 'border-gruen bg-seg-gruen text-seg-gruen-ink'
              : gewaehlt
                ? 'border-rot bg-seg-rot text-seg-rot-ink'
                : 'border-line bg-card opacity-80';
          return (
            <li key={j}>
              <button
                type="button"
                disabled={beantwortet}
                aria-pressed={gewaehlt}
                onClick={() => {
                  setWahl(j);
                  if (a.voll) setRichtig((x) => x + 1);
                }}
                className={`flex w-full flex-col gap-1 rounded-lg border-2 p-4 text-left text-sm transition ${farbe}`}
              >
                <span className="flex items-start gap-2">
                  {beantwortet && (a.voll ? <Check size={18} className="mt-0.5 shrink-0" aria-label="volle Punkte" /> : <X size={18} className="mt-0.5 shrink-0" aria-label="nicht volle Punkte" />)}
                  <span>{a.text}</span>
                </span>
                {beantwortet && <span className="pl-6 text-xs font-semibold">{a.warum}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {beantwortet && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`text-sm font-semibold ${u.antworten[wahl].voll ? 'text-gruen' : 'text-rot'}`} aria-live="polite">
            {u.antworten[wahl].voll ? 'Richtig erkannt!' : 'Nicht ganz – die grün markierte Antwort bekäme volle Punkte.'}
          </p>
          <button
            type="button"
            className="btn-primaer"
            onClick={() => {
              setI((x) => x + 1);
              setWahl(null);
            }}
          >
            {i + 1 < runde.length ? 'Nächste Frage' : 'Auswertung'}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
