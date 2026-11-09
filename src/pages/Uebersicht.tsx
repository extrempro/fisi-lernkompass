import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronDown, Lightbulb, Pencil, RotateCcw } from 'lucide-react';
import { useEinstellungen, useEinstellungenSpeichern, useThemenfelder } from '../api';
import {
  AMPEL,
  FAUSTREGEL,
  ampelVon,
  balkenLabel,
  mussAuffrischen,
  prozent,
  summe,
  zaehle,
  zusammenfassung,
} from '../lib/ampel';
import { ausbildungsstandAus, formatDatum, naechstePruefung, PRUEFUNG_FELD, PRUEFUNG_NAME } from '../lib/datum';
import type { Einstellungen, PruefungKey, Status } from '../types';
import { WochenUeberblick } from '../components/WochenUeberblick';
import { Chips, FehlerHinweis, Laedt, Punkt, StapelBalken, StatusPille, ThemenIcon } from '../components/ui';

type Filter = 'alle' | Status;
type Sortierung = 'standard' | 'status' | 'AP1' | 'AP2';

export function Uebersicht() {
  const { data: felder, error, isLoading } = useThemenfelder();
  const { data: einstellungen } = useEinstellungen();
  const speichern = useEinstellungenSpeichern();
  const [filter, setFilter] = useState<Filter>('alle');
  const [sortierung, setSortierung] = useState<Sortierung>('standard');

  const kacheln = useMemo(
    () =>
      (felder ?? []).map((f, idx) => {
        const z = zaehle(f.unterthemen);
        return {
          f,
          idx,
          z,
          ampel: ampelVon(z),
          pct: prozent(z),
          auffrischen: f.unterthemen.filter(mussAuffrischen).length,
          aktualisiert: f.unterthemen.filter((u) => u.inhaltAktualisiert).length,
          luecken: f.unterthemen.filter((u) => u.status === 'gelb' && u.luecke.trim()).length,
        };
      }),
    [felder],
  );

  if (isLoading) return <Laedt />;
  if (error || !felder) return <FehlerHinweis fehler={error} />;

  const gesamt = summe(felder);
  const anzahl: Record<Filter, number> = { alle: kacheln.length, rot: 0, gelb: 0, gruen: 0 };
  kacheln.forEach((k) => anzahl[k.ampel]++);

  const sichtbar = kacheln
    .filter((k) => filter === 'alle' || k.ampel === filter)
    .sort((a, b) => {
      if (sortierung === 'status') return AMPEL[a.ampel].rang - AMPEL[b.ampel].rang || a.pct - b.pct;
      if (sortierung === 'AP1' || sortierung === 'AP2') {
        const ra = a.f.pruefung.includes(sortierung) ? 0 : 1;
        const rb = b.f.pruefung.includes(sortierung) ? 0 : 1;
        return ra - rb || a.pct - b.pct;
      }
      return a.idx - b.idx;
    });

  const stand = einstellungen ? ausbildungsstandAus(einstellungen) : null;
  const naechste = einstellungen ? naechstePruefung(einstellungen) : null;

  return (
    <>
      <header>
        <h1 className="text-[32px] font-bold leading-tight">Übersicht</h1>
        <p className="text-sm text-muted">
          Fachinformatiker Systemintegration
          {stand?.jahr ? ` · ${stand.titel}` : ''} · Berufsschule ITECH · Handelskammer Hamburg
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="karte flex min-w-0 flex-col gap-4 p-6 md:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold">Gesamtfortschritt</h2>
            <span className="text-sm text-muted">
              {gesamt.n} Unterthemen in {felder.length} Themenfeldern
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold leading-none tracking-tight">{prozent(gesamt)}</span>
            <span className="text-2xl font-semibold text-muted">%</span>
          </div>
          <StapelBalken z={gesamt} label={`Gesamt: ${balkenLabel(gesamt)}`} hoehe={12} />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {(['gruen', 'gelb', 'rot'] as Status[]).map((s) => (
              <span key={s} className="flex items-center gap-2">
                <Punkt status={s} />
                <strong>{s === 'gruen' ? gesamt.g : s === 'gelb' ? gesamt.y : gesamt.r}</strong> {AMPEL[s].label.toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        <div className="karte flex min-w-0 flex-col gap-2 p-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <CalendarDays size={18} aria-hidden="true" />
            <span>Nächste Prüfung</span>
          </div>
          {naechste && (
            <>
              <h2 className="text-xl font-semibold">{PRUEFUNG_NAME[naechste.key]}</h2>
              {naechste.tage !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold leading-none text-accent">{naechste.tage}</span>
                  <span className="text-muted">{naechste.tage === 1 ? 'Tag' : 'Tage'}</span>
                </div>
              ) : (
                <p className="font-semibold">Noch kein Termin eingetragen</p>
              )}
              <label htmlFor="naechste-datum" className="mt-2 text-sm text-muted">
                Prüfungsdatum
              </label>
              <input
                id="naechste-datum"
                type="date"
                className="eingabe"
                value={naechste.datum}
                onChange={(e) =>
                  speichern.mutate({ [PRUEFUNG_FELD[naechste.key as PruefungKey]]: e.target.value } as Partial<Einstellungen>)
                }
              />
            </>
          )}
        </div>
      </section>

      <WochenUeberblick />

      <details className="karte group px-6 py-2">
        <summary className="flex min-h-[44px] items-center justify-between gap-4">
          <span className="flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-semibold">Legende</h2>
            <span className="flex items-center gap-2" aria-hidden="true">
              <Punkt status="rot" />
              <Punkt status="gelb" />
              <Punkt status="gruen" />
            </span>
          </span>
          <span className="flex items-center gap-2 text-sm text-muted">
            Erklärung der Farben und Symbole
            <ChevronDown size={18} className="transition group-open:rotate-180" aria-hidden="true" />
          </span>
        </summary>
        <div className="flex flex-col gap-4 pb-4 pt-2">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
            {(['rot', 'gelb', 'gruen'] as Status[]).map((s) => (
              <div key={s} className="flex gap-3">
                <span className="mt-1.5">
                  <Punkt status={s} size={14} />
                </span>
                <div>
                  <strong className="block">
                    {s === 'rot' ? 'Rot' : s === 'gelb' ? 'Gelb' : 'Grün'} · {AMPEL[s].label}
                  </strong>
                  <span className="text-sm text-muted">{FAUSTREGEL[s]}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-line pt-4 text-sm text-muted sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <strong className="block text-ink">Ampel einer Kachel</strong>
              Grün ab 80 % sicheren Unterthemen und keinem roten, rot wenn alle rot sind, sonst gelb.
            </div>
            <div>
              <strong className="block text-ink">Fortschritt in %</strong>
              Grün zählt 1 Punkt, gelb 0,5, rot 0. Der Balken zeigt den Anteil jeder Farbe.
            </div>
            <div className="flex gap-2">
              <RotateCcw size={16} className="mt-1 shrink-0" aria-hidden="true" />
              <div>
                <strong className="block text-ink">Auffrischen</strong>
                Ein Unterthema wurde seit 60 Tagen nicht mehr bestätigt.
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <strong className="text-ink">Chips</strong>
              <span className="flex flex-wrap items-center gap-1">
                <span className="chip bg-chip text-muted">LF 3</span> Lernfeld
                <span className="chip bg-accent-soft text-accent">AP Teil 1</span> Teil der Abschlussprüfung
              </span>
            </div>
          </div>
        </div>
      </details>

      <section aria-label="Filter und Sortierung" className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Nach Status filtern" className="flex flex-wrap gap-2">
          {(['alle', 'rot', 'gelb', 'gruen'] as Filter[]).map((f) => {
            const an = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={an}
                onClick={() => setFilter(f)}
                className={`flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  an ? 'border-accent bg-accent text-on-accent' : 'border-line bg-card text-ink hover:bg-chip'
                }`}
              >
                {f !== 'alle' && <Punkt status={f} />}
                <span>{f === 'alle' ? 'Alle' : AMPEL[f].label}</span>
                <span className="text-xs opacity-80">{anzahl[f]}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sortierung" className="text-sm text-muted">
            Sortieren nach
          </label>
          <select
            id="sortierung"
            className="eingabe bg-card"
            value={sortierung}
            onChange={(e) => setSortierung(e.target.value as Sortierung)}
          >
            <option value="standard">Katalog-Reihenfolge</option>
            <option value="status">Status (rot zuerst)</option>
            <option value="AP1">Relevanz Abschlussprüfung Teil 1</option>
            <option value="AP2">Relevanz Abschlussprüfung Teil 2</option>
          </select>
        </div>
      </section>

      <section aria-label="Themenfelder" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sichtbar.map(({ f, z, ampel, pct, auffrischen, aktualisiert, luecken }) => (
          <Link key={f.id} to={`/thema/${f.id}`} className="karte karte-hover flex min-w-0 flex-col gap-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <ThemenIcon name={f.icon} />
              </span>
              <StatusPille status={ampel} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold leading-snug">{f.titel}</h3>
              <Chips lernfelder={f.lernfelder} pruefung={f.pruefung} />
            </div>
            <div className="mt-auto flex flex-col gap-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted">{zusammenfassung(z)}</span>
                <strong className="text-base">{pct} %</strong>
              </div>
              <StapelBalken z={z} label={balkenLabel(z)} />
              {luecken > 0 && (
                <span className="flex items-center gap-2 text-sm text-muted">
                  <Pencil size={16} aria-hidden="true" />
                  {luecken === 1 ? '1 Lernpunkt notiert' : `${luecken} Lernpunkte notiert`}
                </span>
              )}
              {aktualisiert > 0 && (
                <span className="flex items-center gap-2 text-sm text-muted">
                  <Lightbulb size={16} aria-hidden="true" />
                  {aktualisiert === 1 ? '1 Unterthema mit aktualisiertem Inhalt' : `${aktualisiert} Unterthemen mit aktualisiertem Inhalt`}
                </span>
              )}
              {auffrischen > 0 && (
                <span className="flex items-center gap-2 text-sm text-muted">
                  <RotateCcw size={16} aria-hidden="true" />
                  {auffrischen === 1 ? '1 Unterthema mal wieder auffrischen' : `${auffrischen} Unterthemen mal wieder auffrischen`}
                </span>
              )}
            </div>
          </Link>
        ))}
      </section>

      {sichtbar.length === 0 && (
        <p className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-muted">
          Keine Themenfelder mit diesem Status.
        </p>
      )}

      {stand && !einstellungen?.ausbildungsbeginn && (
        <p className="text-sm text-muted">
          Tipp: Trag in den <Link to="/einstellungen" className="font-semibold text-accent">Einstellungen</Link> deinen
          Ausbildungsbeginn und die Prüfungstermine ein.
          {naechste?.datum ? ` Nächster Termin: ${formatDatum(naechste.datum)}.` : ''}
        </p>
      )}
    </>
  );
}
