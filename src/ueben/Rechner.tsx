import { useState } from 'react';
import { melde } from '../companion/bus';
import { Calculator, Check, Dices, X } from 'lucide-react';
import { RECHNER, pruefeAntwort, type Aufgabe, type Rechner as RechnerTyp } from '../lib/rechner';
import { zufall } from '../lib/training';
import { lies, merke } from '../lib/merken';

/** Rechner mit Rechenweg und Übungsaufgaben mit Zufallswerten. */
export function Rechner() {
  const [id, setIdRoh] = useState(() => lies('rechner') ?? RECHNER[0].id);
  const r = RECHNER.find((x) => x.id === id) ?? RECHNER[0];
  const setId = (x: string) => {
    setIdRoh(x);
    merke('rechner', x);
  };
  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="Rechner wählen" className="flex flex-wrap gap-1.5">
        {RECHNER.map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={x.id === r.id}
            onClick={() => setId(x.id)}
            className={`min-h-[40px] rounded-lg border px-3 text-sm font-semibold transition ${
              x.id === r.id ? 'border-accent bg-accent text-on-accent' : 'border-line bg-card hover:bg-chip'
            }`}
          >
            {x.titel}
          </button>
        ))}
      </div>
      {/* key: beim Wechsel alle Eingaben zurücksetzen */}
      <EinRechner key={r.id} r={r} />
    </div>
  );
}

function EinRechner({ r }: { r: RechnerTyp }) {
  const [werte, setWerte] = useState<Record<string, string>>(() => Object.fromEntries(r.felder.map((f) => [f.key, f.standard])));
  const [aufgabe, setAufgabe] = useState<Aufgabe | null>(null);
  const ergebnis = r.rechne(werte);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{r.titel}</h3>
          <p className="text-sm text-muted">{r.kurz}</p>
        </div>
        <button
          type="button"
          className="btn-primaer"
          onClick={() => {
            const a = r.aufgabe(zufall(Date.now()));
            setAufgabe(a);
          }}
        >
          <Dices size={16} aria-hidden="true" />
          {aufgabe ? 'Neue Übungsaufgabe' : 'Übungsaufgabe'}
        </button>
      </div>

      {aufgabe ? (
        <Uebung key={aufgabe.text} r={r} a={aufgabe} onRechner={() => setAufgabe(null)} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()} aria-label={`Eingaben ${r.titel}`}>
            {r.felder.map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label htmlFor={`r-${f.key}`} className="text-sm font-semibold">
                  {f.label}
                  {f.einheit && f.einheit !== '/' ? <span className="font-normal text-muted"> ({f.einheit})</span> : ''}
                </label>
                {f.typ === 'auswahl' ? (
                  <select id={`r-${f.key}`} className="eingabe" value={werte[f.key]} onChange={(e) => setWerte({ ...werte, [f.key]: e.target.value })}>
                    {f.optionen!.map(([w, t]) => (
                      <option key={w} value={w}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`r-${f.key}`}
                    className="eingabe tabular-nums"
                    inputMode={f.typ === 'zahl' ? 'decimal' : 'text'}
                    value={werte[f.key]}
                    onChange={(e) => setWerte({ ...werte, [f.key]: e.target.value })}
                  />
                )}
                {f.hilfe && <span className="text-xs text-muted">{f.hilfe}</span>}
              </div>
            ))}
          </form>
          <Ausgabe ergebnis={ergebnis} />
        </div>
      )}
    </div>
  );
}

function Ausgabe({ ergebnis, hervor }: { ergebnis: ReturnType<RechnerTyp['rechne']>; hervor?: string[] }) {
  if (ergebnis.fehler) {
    return (
      <div className="flex flex-col gap-2">
        <p role="alert" className="rounded-lg bg-warn px-4 py-3 text-sm text-warn-ink">
          {ergebnis.fehler}
        </p>
        {ergebnis.schritte.length > 0 && <Schritte schritte={ergebnis.schritte} />}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ergebnis.werte.map((w, i) => (
          <div
            key={w.key}
            className={`rounded-lg border px-4 py-2.5 ${i === 0 || hervor?.includes(w.key) ? 'border-accent bg-accent-soft' : 'border-line bg-bg'}`}
          >
            <dt className="text-xs text-muted">{w.label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{w.text}</dd>
          </div>
        ))}
      </dl>
      <Schritte schritte={ergebnis.schritte} />
    </div>
  );
}

function Schritte({ schritte }: { schritte: string[] }) {
  return (
    <section aria-label="Rechenweg" className="flex flex-col gap-2 rounded-lg border border-line bg-bg p-4">
      <h4 className="flex items-center gap-2 text-sm font-semibold">
        <Calculator size={16} aria-hidden="true" />
        Rechenweg
      </h4>
      <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm">
        {schritte.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </section>
  );
}

function Uebung({ r, a, onRechner }: { r: RechnerTyp; a: Aufgabe; onRechner: () => void }) {
  const loesung = r.rechne(a.eingaben);
  const gefragt = loesung.werte.filter((w) => a.gefragt.includes(w.key));
  const [antwort, setAntwort] = useState<Record<string, string>>({});
  const [geprueft, setGeprueft] = useState(false);
  const ok = (key: string) => pruefeAntwort(gefragt.find((w) => w.key === key)!, antwort[key] ?? '', r.toleranz);
  const alleRichtig = gefragt.every((w) => ok(w.key));

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border-2 border-line bg-card p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Übungsaufgabe</span>
        <p className="mt-1 text-lg leading-snug">{a.text}</p>
      </div>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setGeprueft(true);
          melde(alleRichtig ? 'richtig' : 'falsch');
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {gefragt.map((w) => (
            <div key={w.key} className="flex flex-col gap-1">
              <label htmlFor={`a-${w.key}`} className="text-sm font-semibold">
                {w.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`a-${w.key}`}
                  className={`eingabe w-full tabular-nums ${geprueft ? (ok(w.key) ? 'border-gruen' : 'border-rot') : ''}`}
                  inputMode={w.zahl !== undefined ? 'decimal' : 'text'}
                  value={antwort[w.key] ?? ''}
                  disabled={geprueft}
                  onChange={(e) => setAntwort({ ...antwort, [w.key]: e.target.value })}
                />
                {geprueft &&
                  (ok(w.key) ? <Check size={20} className="shrink-0 text-gruen" aria-label="richtig" /> : <X size={20} className="shrink-0 text-rot" aria-label="falsch" />)}
              </div>
              {geprueft && !ok(w.key) && <span className="text-sm">Richtig: <strong>{w.text}</strong></span>}
            </div>
          ))}
        </div>
        {!geprueft ? (
          <button type="submit" className="btn-primaer w-fit">
            Prüfen
          </button>
        ) : (
          <p className={`font-semibold ${alleRichtig ? 'text-seg-gruen-ink' : 'text-rot'}`} aria-live="polite">
            {alleRichtig ? 'Alles richtig!' : 'Nicht ganz – sieh dir den Rechenweg an.'}
          </p>
        )}
      </form>
      {geprueft && <Ausgabe ergebnis={loesung} hervor={a.gefragt} />}
      <button type="button" className="w-fit text-sm font-semibold text-accent" onClick={onRechner}>
        Zurück zum Rechner
      </button>
    </div>
  );
}
