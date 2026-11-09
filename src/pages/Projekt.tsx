import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown, ExternalLink, Pause, Play, Plus, RotateCcw, Shuffle, Timer, Trash2 } from 'lucide-react';
import { useEinstellungen, useProjekt, useProjektSpeichern } from '../api';
import { ausbildungsdauer } from '../lib/kalender';
import { formatDatum, heuteIso, tageBis } from '../lib/datum';
import { h } from '../lib/bericht';
import { ANTRAG, ANTRAGSPORTAL_URL, DOKU, FRAGEN, MAX_STUNDEN, MERKBLATT_URL, TERMINE, type Punkt } from '../lib/projekt';
import type { Projekt as ProjektTyp } from '../types';
import { FehlerHinweis, Laedt } from '../components/ui';
import { PruefungsReiter } from './Pruefungen';

/** Begleiter für das Abschlussprojekt (Teil 2): Termine, Antrag, 40-h-Planung, Dokumentation, Fachgespräch. */
export function Projekt() {
  const { data, error, isLoading } = useProjekt();
  if (isLoading) return <Laedt />;
  if (error || !data) return <FehlerHinweis fehler={error} />;
  return <ProjektSeite start={data} />;
}

function ProjektSeite({ start }: { start: ProjektTyp }) {
  const speichern = useProjektSpeichern();
  const { data: einstellungen } = useEinstellungen();
  const [p, setP] = useState(start);
  const [stand, setStand] = useState<'gespeichert' | 'ungespeichert' | 'fehler'>('gespeichert');
  const zeit = useRef<ReturnType<typeof setTimeout>>();

  // Änderungen gesammelt nach kurzer Pause speichern
  const setze = (x: Partial<ProjektTyp>) => {
    const neu = { ...p, ...x };
    setP(neu);
    setStand('ungespeichert');
    clearTimeout(zeit.current);
    zeit.current = setTimeout(
      () => speichern.mutate(neu, { onSuccess: () => setStand('gespeichert'), onError: () => setStand('fehler') }),
      600,
    );
  };
  useEffect(() => () => clearTimeout(zeit.current), []);

  const dauer = einstellungen ? ausbildungsdauer(einstellungen) : null;
  const nachEnde = dauer ? TERMINE.filter((t) => (p.termine[t.key] ?? '') > dauer.ende) : [];
  const summeSoll = p.phasen.reduce((n, x) => n + x.soll, 0);
  const summeIst = p.phasen.reduce((n, x) => n + x.ist, 0);
  const antragFertig = ANTRAG.flatMap((g) => g.punkte).filter((x) => p.antrag[x.id]).length;
  const antragGesamt = ANTRAG.flatMap((g) => g.punkte).length;
  const dokuFertig = DOKU.flatMap((g) => g.punkte).filter((x) => p.doku[x.id]).length;
  const dokuGesamt = DOKU.flatMap((g) => g.punkte).length;
  const naechster = TERMINE.map((t) => ({ ...t, datum: p.termine[t.key] }))
    .filter((t) => t.datum && t.datum >= heuteIso())
    .sort((a, b) => a.datum!.localeCompare(b.datum!))[0];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight">Prüfungen</h1>
          <p className="text-sm text-muted">Dein Abschlussprojekt Schritt für Schritt – nach dem Merkblatt der Handelskammer Hamburg.</p>
        </div>
      </header>
      <PruefungsReiter />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="karte flex min-w-0 flex-col gap-3 p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="ueberschrift-klein">Abschlussprojekt · Teil 2 · 50 % der Endnote</span>
            <span className={`text-xs ${stand === 'fehler' ? 'text-rot' : 'text-muted'}`} aria-live="polite">
              {stand === 'gespeichert' ? 'Gespeichert' : stand === 'fehler' ? 'Speichern fehlgeschlagen' : 'Wird gespeichert …'}
            </span>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Projekttitel</span>
            <input className="eingabe text-lg font-semibold" value={p.titel} maxLength={300} placeholder="z. B. Einführung eines zentralen Monitorings für die Serverlandschaft" onChange={(e) => setze({ titel: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Auftraggeber</span>
            <input className="eingabe" value={p.auftraggeber} maxLength={300} placeholder="z. B. IT-Leitung, Abteilung Vertrieb, externer Kunde" onChange={(e) => setze({ auftraggeber: e.target.value })} />
          </label>
          <div className="mt-1 grid grid-cols-3 gap-3 text-sm">
            <Fortschritt label="Antrag" wert={antragFertig} gesamt={antragGesamt} />
            <Fortschritt label="Stunden geplant" wert={summeSoll} gesamt={MAX_STUNDEN} einheit="h" warnung={summeSoll > MAX_STUNDEN} />
            <Fortschritt label="Dokumentation" wert={dokuFertig} gesamt={dokuGesamt} />
          </div>
        </div>
        <div className="karte flex min-w-0 flex-col gap-2 p-6">
          <span className="ueberschrift-klein">Als Nächstes</span>
          {naechster ? (
            <>
              <strong className="text-lg leading-snug">{naechster.label}</strong>
              <span className="text-4xl font-bold leading-none text-accent">
                {tageBis(naechster.datum!) === 0 ? 'Heute' : tageBis(naechster.datum!)}{' '}
                {tageBis(naechster.datum!) !== 0 && <span className="text-base font-semibold text-muted">{tageBis(naechster.datum!) === 1 ? 'Tag' : 'Tage'}</span>}
              </span>
              <span className="text-sm text-muted">
                {formatDatum(naechster.datum)} · {naechster.hinweis}
              </span>
            </>
          ) : (
            <span className="text-sm text-muted">Trag unten die Termine der Handelskammer ein – sie erscheinen dann auch im Ausbildungsplan.</span>
          )}
          <div className="mt-auto flex flex-col gap-1 border-t border-line pt-3 text-sm">
            <a href={MERKBLATT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[36px] items-center gap-1.5 font-semibold text-accent">
              Merkblatt Projektarbeit (Handelskammer)
              <ExternalLink size={14} aria-hidden="true" />
            </a>
            <a href={ANTRAGSPORTAL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[36px] items-center gap-1.5 font-semibold text-accent">
              Portal „Digitaler Projektantrag“
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <Abschnitt titel="Termine" untertitel="Die Handelskammer gibt Antragsfrist und Durchführungszeitraum vor. Die Termine erscheinen im Ausbildungsplan." offen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TERMINE.map((t) => (
            <label key={t.key} className="flex flex-col gap-1">
              <span className="text-sm font-semibold">{t.label}</span>
              <input
                type="date"
                className="eingabe"
                value={p.termine[t.key] ?? ''}
                onChange={(e) => setze({ termine: { ...p.termine, [t.key]: e.target.value } })}
              />
              <span className="text-xs text-muted">{t.hinweis}</span>
            </label>
          ))}
        </div>
        {nachEnde.length > 0 && dauer && (
          <p role="alert" className="mt-4 rounded-md bg-warn px-3 py-2 text-sm text-warn-ink">
            {nachEnde.map((t) => t.label).join(', ')} {nachEnde.length > 1 ? 'liegen' : 'liegt'} nach deinem Vertragsende am {formatDatum(dauer.ende)}. Prüfe die Termine oder die Ausbildungsdauer in den Einstellungen.
          </p>
        )}
      </Abschnitt>

      <Abschnitt titel="Projektantrag" untertitel={`${antragFertig} von ${antragGesamt} Punkten erledigt`} offen={antragFertig < antragGesamt}>
        <Checkliste gruppen={ANTRAG} wert={p.antrag} onAendern={(antrag) => setze({ antrag })} />
      </Abschnitt>

      <Abschnitt titel="Zeitplanung" untertitel={`${h(summeSoll)} von höchstens ${MAX_STUNDEN} Stunden geplant · ${h(summeIst)} h tatsächlich`} offen>
        <Zeitplanung phasen={p.phasen} onAendern={(phasen) => setze({ phasen })} />
      </Abschnitt>

      <Abschnitt titel="Projektdokumentation" untertitel={`${dokuFertig} von ${dokuGesamt} Punkten erledigt`}>
        <Checkliste gruppen={DOKU} wert={p.doku} onAendern={(doku) => setze({ doku })} />
      </Abschnitt>

      <Abschnitt titel="Präsentation und Fachgespräch" untertitel="Präsentation höchstens 15 Minuten, mit Fachgespräch zusammen höchstens 30 Minuten">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <PraesentationsTimer />
          <Fachgespraech antworten={p.fragen} onAendern={(fragen) => setze({ fragen })} />
        </div>
      </Abschnitt>

      <Abschnitt titel="Notizen">
        <textarea
          className="eingabe min-h-[160px] w-full resize-y"
          value={p.notizen}
          maxLength={20000}
          placeholder="Ideen, offene Fragen an den Betreuer, Links …"
          onChange={(e) => setze({ notizen: e.target.value })}
        />
      </Abschnitt>
    </>
  );
}

function Fortschritt({ label, wert, gesamt, einheit, warnung }: { label: string; wert: number; gesamt: number; einheit?: string; warnung?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted">{label}</span>
      <strong className={warnung ? 'text-rot' : ''}>
        {h(wert)}
        {einheit ? ` ${einheit}` : ''} / {gesamt}
        {einheit ? ` ${einheit}` : ''}
      </strong>
      <span className="h-1.5 overflow-hidden rounded-full bg-track" aria-hidden="true">
        <span className={`block h-full rounded-full ${warnung ? 'bg-rot' : 'bg-accent'}`} style={{ width: `${Math.min(100, (wert / gesamt) * 100)}%` }} />
      </span>
    </div>
  );
}

function Abschnitt({ titel, untertitel, offen, children }: { titel: string; untertitel?: string; offen?: boolean; children: ReactNode }) {
  return (
    <details className="karte group min-w-0 px-5 py-1 sm:px-6" open={offen}>
      <summary className="flex min-h-[56px] items-center justify-between gap-3 py-2">
        <span>
          <h2 className="text-xl font-semibold">{titel}</h2>
          {untertitel && <span className="block text-sm text-muted">{untertitel}</span>}
        </span>
        <ChevronDown size={20} className="shrink-0 text-muted transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="pb-5 pt-2">{children}</div>
    </details>
  );
}

function Checkliste({ gruppen, wert, onAendern }: { gruppen: { titel: string; punkte: Punkt[] }[]; wert: Record<string, boolean>; onAendern: (w: Record<string, boolean>) => void }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {gruppen.map((g) => (
        <fieldset key={g.titel} className="flex flex-col gap-1">
          <legend className="ueberschrift-klein mb-1">{g.titel}</legend>
          {g.punkte.map((x) => {
            const an = !!wert[x.id];
            return (
              <label key={x.id} className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-chip">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--c-accent)]"
                  checked={an}
                  onChange={() => {
                    const n = { ...wert };
                    if (an) delete n[x.id];
                    else n[x.id] = true;
                    onAendern(n);
                  }}
                />
                <span className="text-sm">
                  <span className={`font-medium ${an ? 'text-muted line-through' : ''}`}>{x.text}</span>
                  {x.hilfe && <span className="block text-muted">{x.hilfe}</span>}
                </span>
              </label>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}

function Zeitplanung({ phasen, onAendern }: { phasen: ProjektTyp['phasen']; onAendern: (p: ProjektTyp['phasen']) => void }) {
  const soll = phasen.reduce((n, x) => n + x.soll, 0);
  const ist = phasen.reduce((n, x) => n + x.ist, 0);
  const setze = (i: number, x: Partial<ProjektTyp['phasen'][number]>) => onAendern(phasen.map((p, j) => (j === i ? { ...p, ...x } : p)));
  const zahl = (v: string) => Math.max(0, Math.min(200, Number(v.replace(',', '.')) || 0));
  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-2 pr-3">Phase</th>
              <th className="w-24 py-2 pr-3 text-right">Geplant (h)</th>
              <th className="w-24 py-2 pr-3 text-right">Tatsächlich (h)</th>
              <th className="w-[30%] py-2 pr-3">Anteil</th>
              <th className="w-10 py-2">
                <span className="sr-only">Entfernen</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {phasen.map((p, i) => (
              <tr key={i} className="border-b border-line">
                <td className="py-1.5 pr-3">
                  <input className="eingabe min-h-[38px] w-full py-1" aria-label={`Phase ${i + 1}`} value={p.name} maxLength={120} onChange={(e) => setze(i, { name: e.target.value })} />
                </td>
                <td className="py-1.5 pr-3">
                  <input className="eingabe min-h-[38px] w-full py-1 text-right tabular-nums" type="number" min={0} max={200} step={0.5} aria-label={`Geplante Stunden ${p.name}`} value={p.soll || ''} onChange={(e) => setze(i, { soll: zahl(e.target.value) })} />
                </td>
                <td className="py-1.5 pr-3">
                  <input className="eingabe min-h-[38px] w-full py-1 text-right tabular-nums" type="number" min={0} max={200} step={0.5} aria-label={`Tatsächliche Stunden ${p.name}`} value={p.ist || ''} onChange={(e) => setze(i, { ist: zahl(e.target.value) })} />
                </td>
                <td className="py-1.5 pr-3">
                  <span className="block h-2 overflow-hidden rounded-full bg-track" aria-hidden="true">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${soll ? (p.soll / Math.max(soll, MAX_STUNDEN)) * 100 : 0}%` }} />
                  </span>
                </td>
                <td className="py-1.5 text-right">
                  <button type="button" aria-label={`${p.name} entfernen`} onClick={() => onAendern(phasen.filter((_, j) => j !== i))} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-chip hover:text-rot">
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="py-2 pr-3">Summe</td>
              <td className={`py-2 pr-3 text-right tabular-nums ${soll > MAX_STUNDEN ? 'text-rot' : ''}`}>{h(soll)}</td>
              <td className={`py-2 pr-3 text-right tabular-nums ${ist > MAX_STUNDEN ? 'text-rot' : ''}`}>{h(ist)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="btn-sekundaer min-h-[40px]" disabled={phasen.length >= 20} onClick={() => onAendern([...phasen, { name: 'Neue Phase', soll: 0, ist: 0 }])}>
          <Plus size={16} aria-hidden="true" />
          Phase hinzufügen
        </button>
        {soll > MAX_STUNDEN ? (
          <span role="alert" className="text-sm font-semibold text-rot">
            {h(soll - MAX_STUNDEN)} h zu viel – höchstens {MAX_STUNDEN} Stunden sind erlaubt.
          </span>
        ) : (
          <span className="text-sm text-muted">Die Vorbereitung von Präsentation und Fachgespräch zählt nicht zu den 40 Stunden.</span>
        )}
      </div>
    </div>
  );
}

const DAUER = 15 * 60;

/** Countdown für die 15-Minuten-Präsentation: Warnung ab 2 Minuten, Überzeit wird angezeigt. */
function PraesentationsTimer() {
  const [rest, setRest] = useState(DAUER);
  const [laeuft, setLaeuft] = useState(false);
  useEffect(() => {
    if (!laeuft) return;
    const t = setInterval(() => setRest((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [laeuft]);
  const ueber = rest < 0;
  const abs = Math.abs(rest);
  const anzeige = `${ueber ? '+' : ''}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, '0')}`;
  const farbe = ueber ? 'bg-seg-rot text-seg-rot-ink' : rest <= 120 ? 'bg-warn text-warn-ink' : 'bg-accent-soft text-accent';
  return (
    <div className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2 font-semibold">
        <Timer size={18} aria-hidden="true" />
        Präsentation üben
      </h3>
      <div className={`flex flex-col items-center rounded-xl px-4 py-6 ${farbe}`} role="timer" aria-live="off" aria-label={`Restzeit ${anzeige}`}>
        <span className="text-6xl font-bold tabular-nums leading-none">{anzeige}</span>
        <span className="mt-2 text-sm">{ueber ? 'Zeit überschritten!' : rest <= 120 ? 'Zum Schluss kommen' : laeuft ? 'läuft' : rest === DAUER ? 'bereit' : 'pausiert'}</span>
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn-primaer flex-1" onClick={() => setLaeuft((x) => !x)}>
          {laeuft ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {laeuft ? 'Pause' : rest === DAUER ? 'Start' : 'Weiter'}
        </button>
        <button
          type="button"
          className="btn-sekundaer"
          onClick={() => {
            setLaeuft(false);
            setRest(DAUER);
          }}
          aria-label="Zurücksetzen"
        >
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      </div>
      <p className="text-xs text-muted">Faustregel: Rund 1–2 Folien pro Minute, Kernaussage in den ersten zwei Minuten, Fazit mit Soll-Ist-Vergleich am Ende.</p>
    </div>
  );
}

function Fachgespraech({ antworten, onAendern }: { antworten: Record<string, string>; onAendern: (a: Record<string, string>) => void }) {
  const [aktiv, setAktiv] = useState<string | null>(null);
  const zufaellig = () => {
    const rest = FRAGEN.filter((f) => f.id !== aktiv);
    setAktiv(rest[Math.floor(Math.random() * rest.length)].id);
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">Typische Fragen im Fachgespräch</h3>
        <button type="button" className="btn-sekundaer min-h-[36px] px-3" onClick={zufaellig}>
          <Shuffle size={15} aria-hidden="true" />
          Zufällige Frage
        </button>
      </div>
      <p className="text-sm text-muted">Notier dir zu jeder Frage Stichworte für dein Projekt. Übe laut – die Prüfer fragen nach, warum du etwas so gemacht hast.</p>
      <ul className="flex flex-col gap-1.5">
        {FRAGEN.map((f) => {
          const offen = aktiv === f.id;
          const hat = !!antworten[f.id]?.trim();
          return (
            <li key={f.id} className={`rounded-lg border ${offen ? 'border-accent' : 'border-line'} bg-bg`}>
              <button type="button" aria-expanded={offen} onClick={() => setAktiv(offen ? null : f.id)} className="flex min-h-[44px] w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${hat ? 'bg-gruen text-white' : 'border border-line'}`} aria-hidden="true">
                  {hat && <Check size={12} />}
                </span>
                <span className="flex-1">{f.text}</span>
                <ChevronDown size={16} className={`shrink-0 text-muted transition ${offen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {offen && (
                <div className="px-3 pb-3">
                  <textarea
                    className="eingabe min-h-[90px] w-full resize-y text-sm"
                    autoFocus
                    aria-label={`Stichworte: ${f.text}`}
                    placeholder="Deine Stichworte …"
                    maxLength={3000}
                    value={antworten[f.id] ?? ''}
                    onChange={(e) => onAendern({ ...antworten, [f.id]: e.target.value })}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
