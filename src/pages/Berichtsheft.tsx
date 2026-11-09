import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, NotebookPen, PenLine, Pencil, Printer } from 'lucide-react';
import { useAbzeichnen, useBerichte, useEinstellungen, usePlan } from '../api';
import { AbzeichnenDialog } from '../bericht/Abzeichnen';
import { BerichtEditor } from '../bericht/BerichtEditor';
import { useDrucken } from '../bericht/Druck';
import { h, sollStunden, STATUS_TEXT, summe } from '../lib/bericht';
import { formatDatum, heuteIso, naechstePruefung, PRUEFUNG_NAME } from '../lib/datum';
import { wochenAus, montagVon, tagMonat, type Woche } from '../lib/kalender';
import { lies, merke } from '../lib/merken';
import type { Bericht, BerichtStatus } from '../types';
import { FehlerHinweis, Laedt } from '../components/ui';

type Filter = 'alle' | BerichtStatus | 'fehlt';

const STATUS_STIL: Record<BerichtStatus | 'fehlt', string> = {
  fehlt: 'bg-seg-rot text-seg-rot-ink',
  entwurf: 'bg-chip text-muted',
  fertig: 'bg-accent-soft text-accent',
  abgezeichnet: 'bg-seg-gruen text-seg-gruen-ink',
};

const FARBE: Record<BerichtStatus | 'fehlt', string> = {
  abgezeichnet: 'var(--c-seg-gruen-fg)',
  fertig: 'var(--c-accent)',
  entwurf: 'var(--c-muted)',
  fehlt: '#DC2626',
};

/** Übersicht aller Ausbildungsnachweise: Stand, fehlende Wochen, Liste, Abzeichnen und Drucken. */
export function Berichtsheft() {
  const { data: e, error: eFehler, isLoading: eLaedt } = useEinstellungen();
  const { data: berichte, error, isLoading } = useBerichte();
  const { data: plan = [] } = usePlan();
  const drucken = useDrucken();
  const abzeichnen = useAbzeichnen();
  const [offen, setOffen] = useState<Woche | null>(null);
  const [filter, setFilter] = useState<Filter>('alle');
  const [jahr, setJahr] = useState<number | 0>(0);
  const [auswahl, setAuswahl] = useState<Set<string>>(new Set());
  const [deckblatt, setDeckblattRoh] = useState(() => lies('bericht-deckblatt') !== '0');
  const [abzeichnenAm, setAbzeichnenAm] = useState(heuteIso());
  const [signieren, setSignieren] = useState(false);
  const [meldungAbz, setMeldungAbz] = useState('');
  const setDeckblatt = (x: boolean) => {
    setDeckblattRoh(x);
    merke('bericht-deckblatt', x ? '1' : '0');
  };

  const zeitraum = useMemo(
    () => (e ? wochenAus(e, (berichte ?? []).map((b) => b.montag), (berichte ?? []).map((b) => b.montag)) : null),
    [e, berichte],
  );

  if (isLoading || eLaedt) return <Laedt />;
  if (error || eFehler || !e || !berichte) return <FehlerHinweis fehler={error ?? eFehler} />;

  const kopf = (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[32px] font-bold leading-tight">Berichtsheft</h1>
        <p className="text-sm text-muted">Deine Ausbildungsnachweise Woche für Woche – zum Abzeichnen und Hochladen bei der Handelskammer.</p>
      </div>
    </header>
  );
  if (!zeitraum) {
    return (
      <>
        {kopf}
        <section className="karte flex max-w-[640px] flex-col gap-3 p-6">
          <h2 className="text-xl font-semibold">Erst den Ausbildungsbeginn eintragen</h2>
          <p className="text-sm text-muted">Die Nachweise werden pro Ausbildungswoche nummeriert – dafür braucht die App deinen ersten Ausbildungstag.</p>
          <Link to="/einstellungen" className="btn-primaer w-fit">
            Zu den Einstellungen
          </Link>
        </section>
      </>
    );
  }

  const soll = sollStunden(e);
  const dieseWoche = montagVon(heuteIso());
  const map = new Map(berichte.map((b) => [b.montag, b]));
  const status = (w: Woche): BerichtStatus | 'fehlt' => map.get(w.montag)?.status ?? 'fehlt';
  // Fällige Wochen (bis heute) und alle Wochen mit Bericht, neueste oben
  const zeilen = zeitraum.wochen.filter((w) => (w.nummer > 0 && w.montag <= dieseWoche) || map.has(w.montag)).reverse();
  // Fällig ist eine Woche, wenn sie vorbei ist; die laufende Woche zählt erst danach als fehlend
  const faellig = zeilen.filter((w) => w.nummer > 0 && w.montag < dieseWoche);
  const zaehl = { abgezeichnet: 0, fertig: 0, entwurf: 0, fehlt: 0 };
  for (const w of faellig) zaehl[status(w)]++;
  const n = faellig.length;
  const fehlend = faellig.filter((w) => status(w) === 'fehlt');
  const bereit = zeilen.filter((w) => status(w) === 'fertig');
  const sichtbar = zeilen.filter((w) => (filter === 'alle' || status(w) === filter) && (!jahr || w.ausbildungsjahr === jahr));
  const druckbar = sichtbar.filter((w) => map.has(w.montag));
  const gewaehlt = [...auswahl].filter((m) => map.has(m));
  const jahre = [...new Set(zeilen.map((w) => w.ausbildungsjahr))].sort();
  const pruefung = naechstePruefung(e);
  const angabenFehlen = !e.azubi_name || !e.ausbildungsbetrieb;
  const druckenMit = (montage: string[]) => drucken(montage, deckblatt);

  const umschalten = (m: string) =>
    setAuswahl((a) => {
      const x = new Set(a);
      if (x.has(m)) x.delete(m);
      else x.add(m);
      return x;
    });
  const alleGewaehlt = druckbar.length > 0 && druckbar.every((w) => auswahl.has(w.montag));

  return (
    <>
      {kopf}

      {angabenFehlen && (
        <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-warn px-4 py-3 text-warn-ink">
          <AlertTriangle size={18} className="shrink-0" aria-hidden="true" />
          <span className="flex-1 text-sm">Für den Kopf jedes Nachweises fehlen noch dein Name und der Ausbildungsbetrieb.</span>
          <Link to="/einstellungen#berichtsheft" className="text-sm font-semibold underline">
            In den Einstellungen eintragen
          </Link>
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="karte flex min-w-0 flex-col gap-4 p-6 lg:col-span-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-5xl font-bold leading-none">{n - zaehl.fehlt}</span>
            <span className="text-lg font-semibold">von {n} fälligen Wochen geschrieben</span>
          </div>
          <div role="img" aria-label={`${zaehl.abgezeichnet} abgezeichnet, ${zaehl.fertig} fertig, ${zaehl.entwurf} Entwurf, ${zaehl.fehlt} fehlen`} className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-track">
            {(['abgezeichnet', 'fertig', 'entwurf', 'fehlt'] as const).map((k) =>
              zaehl[k] ? <span key={k} style={{ width: `${(zaehl[k] / Math.max(1, n)) * 100}%`, background: FARBE[k] }} /> : null,
            )}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {(['abgezeichnet', 'fertig', 'entwurf', 'fehlt'] as const).map((k) => (
              <span key={k} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: FARBE[k] }} aria-hidden="true" />
                <strong>{zaehl[k]}</strong> {k === 'fehlt' ? 'fehlen' : STATUS_TEXT[k].toLowerCase()}
              </span>
            ))}
          </div>
          {fehlend.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
              <span className="font-semibold">Es fehlen:</span>
              {fehlend.slice(0, 8).map((w) => (
                <button key={w.montag} type="button" onClick={() => setOffen(w)} className="chip min-h-[32px] bg-seg-rot px-2.5 font-semibold text-seg-rot-ink hover:underline">
                  KW {w.kw}
                </button>
              ))}
              {fehlend.length > 8 && <span className="text-muted">und {fehlend.length - 8} weitere</span>}
            </div>
          )}
        </div>

        <div className="karte flex min-w-0 flex-col gap-3 p-6">
          {meldungAbz && (
            <p role="status" className="rounded-lg bg-seg-gruen px-3 py-2 text-sm text-seg-gruen-ink">
              {meldungAbz}
            </p>
          )}
          {bereit.length > 0 ? (
            <div className="flex flex-col gap-2">
              <strong className="font-semibold">{bereit.length === 1 ? '1 Bericht ist' : `${bereit.length} Berichte sind`} fertig zum Abzeichnen</strong>
              <span className="text-sm text-muted">Leg sie deiner Ausbilderin oder deinem Ausbilder vor – mindestens einmal im Monat.</span>
              <button type="button" className="btn-primaer min-h-[44px] w-fit" onClick={() => setSignieren(true)}>
                <PenLine size={16} aria-hidden="true" />
                Digital abzeichnen lassen
              </button>
              <details className="group text-sm">
                <summary className="inline-flex min-h-[36px] items-center gap-1 font-semibold text-accent">Auf Papier abgezeichnet?</summary>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button type="button" className="btn-sekundaer min-h-[40px] px-3" onClick={() => druckenMit(bereit.map((w) => w.montag))}>
                    <Printer size={16} aria-hidden="true" />
                    Drucken
                  </button>
                  <label className="flex items-center gap-2">
                    am
                    <input type="date" className="eingabe min-h-[40px] py-1" value={abzeichnenAm} onChange={(x) => setAbzeichnenAm(x.target.value)} />
                  </label>
                  <button
                    type="button"
                    className="btn-sekundaer min-h-[40px] px-3"
                    disabled={abzeichnen.isPending}
                    onClick={() => abzeichnen.mutate({ montage: bereit.map((w) => w.montag), datum: abzeichnenAm })}
                  >
                    <Check size={16} aria-hidden="true" />
                    Als abgezeichnet markieren
                  </button>
                </div>
              </details>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <strong className="font-semibold">Nichts zum Abzeichnen offen</strong>
              <span className="text-sm text-muted">Berichte mit dem Status „Fertig“ erscheinen hier.</span>
            </div>
          )}
          <div className="mt-auto flex flex-col gap-1 border-t border-line pt-3 text-sm">
            <strong className="font-semibold">{PRUEFUNG_NAME[pruefung.key]}</strong>
            <span className="text-muted">
              {pruefung.datum ? `Am ${formatDatum(pruefung.datum)}. ` : ''}Bei der Anmeldung lädst du alle Nachweise bis dahin im Azubi-Infocenter hoch –
              höchstens 20 MB pro Datei.
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="liste-titel" className="karte flex flex-col gap-4 px-4 pb-2 pt-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="liste-titel" className="text-xl font-semibold">
            Alle Nachweise
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex min-h-[40px] cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="h-5 w-5 accent-[var(--c-accent)]" checked={deckblatt} onChange={(x) => setDeckblatt(x.target.checked)} />
              mit Deckblatt
            </label>
            <button type="button" className="btn-sekundaer min-h-[40px] px-3" disabled={!gewaehlt.length} onClick={() => druckenMit(gewaehlt)}>
              <Printer size={16} aria-hidden="true" />
              Auswahl drucken{gewaehlt.length ? ` (${gewaehlt.length})` : ''}
            </button>
            <button type="button" className="btn-primaer min-h-[40px] px-3" disabled={!druckbar.length} onClick={() => druckenMit(druckbar.map((w) => w.montag))}>
              <Printer size={16} aria-hidden="true" />
              {filter === 'alle' && !jahr ? 'Alle drucken' : 'Angezeigte drucken'} ({druckbar.length})
            </button>
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted">Drucken öffnet den Druckdialog des Browsers – dort „Als PDF speichern“ wählen, um die Datei für die Handelskammer zu erhalten.</p>

        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Nach Status filtern" className="flex flex-wrap gap-1 rounded-xl border border-line bg-bg p-1">
            {(['alle', 'fehlt', 'entwurf', 'fertig', 'abgezeichnet'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`min-h-[36px] rounded-lg px-3 text-sm font-semibold transition ${filter === f ? 'bg-accent text-on-accent' : 'text-ink hover:bg-chip'}`}
              >
                {f === 'alle' ? 'Alle' : STATUS_TEXT[f]}
                {f !== 'alle' && <span className="ml-1 font-normal opacity-80">{zeilen.filter((w) => status(w) === f).length}</span>}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            Ausbildungsjahr
            <select className="eingabe min-h-[40px] py-1" value={jahr} onChange={(x) => setJahr(Number(x.target.value))}>
              <option value={0}>alle</option>
              {jahre.map((j) => (
                <option key={j} value={j}>
                  {j === 0 ? 'vor der Ausbildung' : `${j}. Jahr`}
                </option>
              ))}
            </select>
          </label>
        </div>

        {sichtbar.length === 0 ? (
          <p className="border-t border-line py-6 text-center text-sm text-muted">Keine Nachweise für diesen Filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th scope="col" className="w-10 py-2 pr-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--c-accent)]"
                      aria-label="Alle angezeigten auswählen"
                      checked={alleGewaehlt}
                      onChange={() => setAuswahl(alleGewaehlt ? new Set() : new Set(druckbar.map((w) => w.montag)))}
                    />
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Nr.</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Woche</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Status</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Stunden</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Inhalt</th>
                  <th scope="col" className="py-2 font-semibold">
                    <span className="sr-only">Aktionen</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sichtbar.map((w) => (
                  <BerichtZeile
                    key={w.montag}
                    w={w}
                    b={map.get(w.montag)}
                    soll={soll}
                    schule={plan.some((p) => p.art === 'schule' && p.von <= w.montag && p.bis >= w.montag)}
                    gewaehlt={auswahl.has(w.montag)}
                    onWaehlen={() => umschalten(w.montag)}
                    onOeffnen={() => setOffen(w)}
                    onDrucken={() => druckenMit([w.montag])}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {signieren && (
        <AbzeichnenDialog
          kandidaten={bereit.map((w) => map.get(w.montag)!).reverse()}
          wochen={new Map(zeitraum.wochen.map((w) => [w.montag, w]))}
          onSchliessen={() => setSignieren(false)}
          onFertig={(n) => {
            setSignieren(false);
            setMeldungAbz(n === 1 ? '1 Bericht wurde digital abgezeichnet.' : `${n} Berichte wurden digital abgezeichnet.`);
          }}
        />
      )}

      {offen && (
        <BerichtEditor
          woche={offen}
          onSchliessen={() => setOffen(null)}
          onDrucken={(m) => {
            setOffen(null);
            druckenMit([m]);
          }}
        />
      )}
    </>
  );
}

function BerichtZeile({
  w,
  b,
  soll,
  schule,
  gewaehlt,
  onWaehlen,
  onOeffnen,
  onDrucken,
}: {
  w: Woche;
  b: Bericht | undefined;
  soll: number;
  schule: boolean;
  gewaehlt: boolean;
  onWaehlen: () => void;
  onOeffnen: () => void;
  onDrucken: () => void;
}) {
  const st = b?.status ?? 'fehlt';
  const laufend = !b && w.montag >= montagVon(heuteIso());
  const s = b ? summe(b.inhalt).gesamt : 0;
  const stichworte = b ? [...b.inhalt.betrieb, ...b.inhalt.schule].map((p) => p.text).filter(Boolean) : [];
  return (
    <tr className="border-b border-line align-top last:border-0">
      <td className="py-3 pr-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-[var(--c-accent)] disabled:opacity-30"
          aria-label={`KW ${w.kw} auswählen`}
          checked={gewaehlt}
          disabled={!b}
          onChange={onWaehlen}
        />
      </td>
      <td className="py-3 pr-3 tabular-nums text-muted">{w.nummer || '–'}</td>
      <td className="whitespace-nowrap py-3 pr-3">
        <strong className="block">KW {w.kw}</strong>
        <span className="text-xs text-muted">
          {tagMonat(w.montag)}–{tagMonat(w.sonntag)}
          {w.sonntag.slice(0, 4)}
          {schule ? ' · Schule' : ''}
        </span>
      </td>
      <td className="py-3 pr-3">
        <span className={`chip whitespace-nowrap py-0.5 ${laufend ? 'bg-chip text-muted' : STATUS_STIL[st]}`}>{laufend ? 'Läuft noch' : STATUS_TEXT[st]}</span>
        {b?.status === 'abgezeichnet' && b.abgezeichnetAm && (
          <span className="flex items-center gap-1 text-xs text-muted">
            {b.unterschrift && <PenLine size={12} aria-hidden="true" />}
            {b.unterschrift ? 'digital' : 'am'} {formatDatum(b.abgezeichnetAm)}
          </span>
        )}
      </td>
      <td className={`py-3 pr-3 text-right tabular-nums ${b && Math.abs(s - soll) > 0.01 ? 'text-warn-ink' : ''}`}>{b ? `${h(s)} h` : '–'}</td>
      <td className="max-w-[360px] py-3 pr-3 text-muted">
        <span className="line-clamp-2">{stichworte.length ? stichworte.join(' · ') : b ? 'ohne Tätigkeiten' : ''}</span>
      </td>
      <td className="whitespace-nowrap py-2 text-right">
        <button type="button" onClick={onOeffnen} className={b ? 'btn-sekundaer min-h-[36px] px-3' : 'btn-primaer min-h-[36px] px-3'}>
          {b ? <Pencil size={14} aria-hidden="true" /> : <NotebookPen size={14} aria-hidden="true" />}
          {b ? 'Bearbeiten' : 'Schreiben'}
        </button>
        {b && (
          <button type="button" onClick={onDrucken} aria-label={`KW ${w.kw} drucken`} title="Drucken / PDF" className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-chip hover:text-accent">
            <Printer size={16} aria-hidden="true" />
          </button>
        )}
      </td>
    </tr>
  );
}

