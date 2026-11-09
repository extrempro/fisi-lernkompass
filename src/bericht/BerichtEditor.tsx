import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CalendarHeart, Info, Plus, Printer, Sun, Trash2, X } from 'lucide-react';
import { useBerichtLoeschen, useBerichte, useBerichtSpeichern, useEinstellungen, useKalender, usePlan, useThemenfelder } from '../api';
import { Dialog } from '../components/Dialog';
import { UnterschriftBild } from './Unterschrift';
import { GRUND, h, sollStunden, summe, vorbelegen, vorschlaege } from '../lib/bericht';
import { formatDatum, heuteIso } from '../lib/datum';
import { feiertageZwischen } from '../lib/feiertage';
import { plusTage, tagMonat, wochentagKurz, type Woche } from '../lib/kalender';
import { freieWoche } from '../lib/schulfrei';
import type { Abwesenheit, AbwesenheitGrund, BerichtInhalt, BerichtStatus, Posten } from '../types';

type Abschnitt = 'betrieb' | 'unterweisung' | 'schule';
type Neu = { text: string; stunden: string };
const LEER_NEU: Neu = { text: '', stunden: '' };

const STATUS: { wert: BerichtStatus; label: string }[] = [
  { wert: 'entwurf', label: 'Entwurf' },
  { wert: 'fertig', label: 'Fertig' },
  { wert: 'abgezeichnet', label: 'Vom Ausbilder abgezeichnet' },
];

/** Eingabe des Ausbildungsnachweises für eine Kalenderwoche. */
export function BerichtEditor({
  woche,
  onSchliessen,
  onDrucken,
}: {
  woche: Woche;
  onSchliessen: () => void;
  onDrucken?: (montag: string) => void;
}) {
  const { data: berichte = [] } = useBerichte();
  const { data: plan = [] } = usePlan();
  const { data: felder = [] } = useThemenfelder();
  const { data: e } = useEinstellungen();
  const { data: kalender } = useKalender();
  const speichern = useBerichtSpeichern();
  const loeschen = useBerichtLoeschen();

  const soll = sollStunden(e);
  const montag = woche.montag;
  const sonntag = plusTage(montag, 6);
  const alt = berichte.find((b) => b.montag === montag);
  const vorwoche = berichte.find((b) => b.montag === plusTage(montag, -7));
  const feiertage = useMemo(() => feiertageZwischen(montag, sonntag), [montag, sonntag]);
  const frei = freieWoche(montag, kalender?.ferien ?? [], feiertage);
  const schulblock = plan.filter((p) => p.art === 'schule' && p.von <= montag && p.bis >= montag);
  const istSchule = schulblock.length > 0;

  const [status, setStatus] = useState<BerichtStatus>(alt?.status ?? 'entwurf');
  const [abgezeichnetAm, setAbgezeichnetAm] = useState(alt?.abgezeichnetAm ?? heuteIso());
  const [inhalt, setInhalt] = useState<BerichtInhalt>(() =>
    alt ? structuredClone(alt.inhalt) : vorbelegen(montag, plan, feiertage, soll),
  );
  const [schuleZeigen, setSchuleZeigen] = useState(istSchule || (alt?.inhalt.schule.length ?? 0) > 0);
  const [meldung, setMeldung] = useState('');
  const [loeschFrage, setLoeschFrage] = useState(false);
  // Noch nicht mit Enter übernommene Zeilen – werden beim Speichern mitgenommen
  const [neu, setNeu] = useState<Record<Abschnitt, Neu>>({ betrieb: LEER_NEU, unterweisung: LEER_NEU, schule: LEER_NEU });
  const neuSetzer = (k: Abschnitt) => (x: Neu) => setNeu((n) => ({ ...n, [k]: x }));

  const s = summe(inhalt);
  const setzeListe = (k: Abschnitt, l: Posten[]) => setInhalt((i) => ({ ...i, [k]: l }));
  const ziel: Abschnitt = istSchule ? 'schule' : 'betrieb';
  const vorhanden = new Set([...inhalt.betrieb, ...inhalt.schule, ...inhalt.unterweisung].map((p) => p.text));
  const tipps = vorschlaege(montag, plan, felder).filter((t) => !vorhanden.has(t));

  const uebernehmeVorwoche = () => {
    if (!vorwoche) return;
    setInhalt((i) => ({
      ...i,
      betrieb: [...i.betrieb, ...vorwoche.inhalt.betrieb.filter((p) => !i.betrieb.some((x) => x.text === p.text))],
      unterweisung: [...i.unterweisung, ...vorwoche.inhalt.unterweisung.filter((p) => !i.unterweisung.some((x) => x.text === p.text))],
    }));
  };

  const absenden = () => {
    setMeldung('');
    const mitNeuen = { ...inhalt };
    for (const k of ['betrieb', 'unterweisung', 'schule'] as Abschnitt[]) {
      if (neu[k].text.trim()) mitNeuen[k] = [...inhalt[k], { text: neu[k].text.trim(), stunden: zahl(neu[k].stunden) }];
    }
    speichern.mutate(
      { montag, status, abgezeichnetAm: status === 'abgezeichnet' ? abgezeichnetAm : null, inhalt: mitNeuen },
      { onSuccess: onSchliessen, onError: (x) => setMeldung((x as Error).message) },
    );
  };

  const vorschlagsLeiste =
    tipps.length > 0 || vorwoche ? (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-0.5 text-xs text-muted">Vorschläge:</span>
        {tipps.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setzeListe(ziel, [...inhalt[ziel], { text: t, stunden: 0 }])}
            className="min-h-[32px] rounded-full border border-accent-soft bg-accent-soft px-3 text-xs font-medium text-accent hover:border-accent"
          >
            + {t}
          </button>
        ))}
        {vorwoche && (
          <button type="button" onClick={uebernehmeVorwoche} className="min-h-[32px] rounded-full border border-line bg-card px-3 text-xs font-medium hover:bg-chip">
            Tätigkeiten aus KW {woche.kw === 1 ? 'davor' : woche.kw - 1} übernehmen
          </button>
        )}
      </div>
    ) : null;

  const fortschritt = Math.min(100, soll ? (s.gesamt / soll) * 100 : 0);
  const voll = Math.abs(s.gesamt - soll) < 0.01;
  const zuViel = s.gesamt > soll + 0.01;

  return (
    <Dialog titel={`KW ${woche.kw} · ${tagMonat(montag)}–${tagMonat(sonntag)}${sonntag.slice(0, 4)}`} onSchliessen={onSchliessen} breite={760}>
      <form
        className="flex flex-col gap-5"
        onSubmit={(x) => {
          x.preventDefault();
          absenden();
        }}
      >
        <p className="-mt-3 text-sm text-muted">
          Berichtsheft · Nachweis Nr. {woche.nummer || '–'} · {woche.ausbildungsjahr ? `${woche.ausbildungsjahr}. Ausbildungsjahr` : 'vor der Ausbildung'} ·{' '}
          {istSchule ? 'Schulwoche' : 'Betriebswoche'}
        </p>

        {alt?.unterschrift && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-seg-gruen bg-seg-gruen px-3 py-2 text-sm text-seg-gruen-ink">
            <UnterschriftBild pfad={alt.unterschrift.pfad} className="h-10 w-28 shrink-0 rounded bg-white text-slate-900" titel={`Unterschrift von ${alt.unterschrift.name}`} />
            <span className="min-w-0 flex-1">
              <strong className="font-semibold">Digital abgezeichnet</strong> von {alt.unterschrift.name} am {formatDatum(alt.unterschrift.datum)}.
              <span className="block text-xs">Änderst du den Inhalt, entfällt die Unterschrift und der Bericht geht zurück auf „Fertig“.</span>
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="Status des Berichts" className="flex flex-wrap gap-1 rounded-xl border border-line bg-bg p-1">
            {STATUS.map((x) => (
              <button
                key={x.wert}
                type="button"
                aria-pressed={status === x.wert}
                onClick={() => setStatus(x.wert)}
                className={`min-h-[40px] rounded-lg px-3 text-sm font-semibold transition ${
                  status === x.wert ? 'bg-accent text-on-accent' : 'text-ink hover:bg-chip'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
          {status === 'abgezeichnet' && (
            <label className="flex items-center gap-2 text-sm font-semibold">
              am
              <input type="date" className="eingabe min-h-[40px] py-1" value={abgezeichnetAm} onChange={(x) => setAbgezeichnetAm(x.target.value)} />
            </label>
          )}
        </div>

        <PostenListe
          titel="Betriebliche Tätigkeiten"
          hinweis="Stichpunkte reichen"
          name="Tätigkeit"
          liste={inhalt.betrieb}
          neu={neu.betrieb}
          setNeu={neuSetzer('betrieb')}
          onAendern={(l) => setzeListe('betrieb', l)}
          autofokus={!istSchule}
        >
          {!istSchule && vorschlagsLeiste}
        </PostenListe>

        <PostenListe
          titel="Unterweisungen und Schulungen im Betrieb"
          name="Unterweisung"
          liste={inhalt.unterweisung}
          neu={neu.unterweisung}
          setNeu={neuSetzer('unterweisung')}
          onAendern={(l) => setzeListe('unterweisung', l)}
        />

        {schuleZeigen ? (
          <PostenListe
            titel="Berufsschule"
            hinweis="Themen des Unterrichts"
            name="Schulthema"
            liste={inhalt.schule}
            neu={neu.schule}
            setNeu={neuSetzer('schule')}
            onAendern={(l) => setzeListe('schule', l)}
            autofokus={istSchule}
          >
            {istSchule && vorschlagsLeiste}
          </PostenListe>
        ) : (
          <section className="flex flex-col gap-2 border-t border-line pt-4">
            <h3 className="font-semibold">Berufsschule</h3>
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-chip px-3 py-2.5 text-sm text-muted">
              <Info size={16} className="shrink-0" aria-hidden="true" />
              <span className="flex-1">Keine Schulwoche – für KW {woche.kw} ist kein Schulblock im Plan.</span>
              <button type="button" className="min-h-[32px] font-semibold text-accent" onClick={() => setSchuleZeigen(true)}>
                Trotzdem eintragen
              </button>
            </div>
          </section>
        )}

        <AbwesenheitListe montag={montag} liste={inhalt.abwesenheit} tagSoll={soll / 5} onAendern={(l) => setInhalt((i) => ({ ...i, abwesenheit: l }))} />

        {(frei.feiertage.length > 0 || frei.ferien.length > 0) && (
          <div className="-mt-3 flex flex-wrap gap-1.5">
            {frei.feiertage.map((t) => (
              <span key={t.datum} className="chip inline-flex items-center gap-1.5 border border-line bg-card py-1 text-sm">
                <CalendarHeart size={14} className="text-muted" aria-hidden="true" />
                <span>
                  <span className="text-muted">Feiertag:</span> <strong className="font-semibold">{t.name}</strong> · {wochentagKurz(t.datum)}
                  {t.datum > plusTage(montag, 4) ? ' – kein Arbeitstag' : ''}
                </span>
              </span>
            ))}
            {frei.ferien.map((f) => (
              <span key={f.von} className="chip inline-flex items-center gap-1.5 bg-ferien-soft py-1 text-sm font-semibold text-ferien">
                <Sun size={14} aria-hidden="true" />
                {f.name} – betrifft nur die Schule
              </span>
            ))}
          </div>
        )}

        <div
          className={`flex flex-col gap-1.5 rounded-lg p-3 ${voll ? 'bg-seg-gruen text-seg-gruen-ink' : zuViel ? 'bg-warn text-warn-ink' : 'bg-chip'}`}
          aria-live="polite"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <strong className="font-semibold">
              {voll ? 'Woche vollständig: ' : zuViel ? 'Mehr als die Wochenarbeitszeit: ' : 'Erfasst: '}
              {h(s.gesamt)} von {h(soll)} h
            </strong>
            <span className="text-xs">
              {h(s.betrieb)} h Betrieb · {h(s.unterweisung)} h Unterweisung · {h(s.schule)} h Schule · {h(s.abwesenheit)} h abwesend
            </span>
          </div>
          <div role="img" aria-label={`${h(s.gesamt)} von ${h(soll)} Stunden erfasst`} className="h-2 overflow-hidden rounded-full bg-track">
            <span className={`block h-full rounded-full ${voll ? 'bg-gruen' : zuViel ? 'bg-gelb' : 'bg-accent'}`} style={{ width: `${fortschritt}%` }} />
          </div>
        </div>

        {meldung && (
          <p role="alert" className="rounded-lg bg-seg-rot px-4 py-2 text-sm text-seg-rot-ink">
            {meldung}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <div className="flex flex-wrap gap-2">
            {alt &&
              (loeschFrage ? (
                <div role="group" aria-label="Löschen bestätigen" className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">Bericht löschen?</span>
                  <button
                    type="button"
                    autoFocus
                    className="btn bg-rot text-white hover:opacity-90"
                    onClick={() => loeschen.mutate(montag, { onSuccess: onSchliessen, onError: (x) => setMeldung((x as Error).message) })}
                  >
                    Ja, löschen
                  </button>
                  <button type="button" className="btn-sekundaer" onClick={() => setLoeschFrage(false)}>
                    Nein
                  </button>
                </div>
              ) : (
                <button type="button" className="btn border border-rot text-rot hover:bg-seg-rot" onClick={() => setLoeschFrage(true)}>
                  <Trash2 size={16} aria-hidden="true" />
                  Löschen
                </button>
              ))}
            {alt && onDrucken && !loeschFrage && (
              <button type="button" className="btn-sekundaer" onClick={() => onDrucken(montag)}>
                <Printer size={16} aria-hidden="true" />
                Drucken / PDF
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-sekundaer" onClick={onSchliessen}>
              Abbrechen
            </button>
            <button type="submit" className="btn-primaer" disabled={speichern.isPending}>
              Speichern
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

const ZAHL = 'eingabe min-h-[40px] w-[76px] py-1.5 text-right tabular-nums';

function zahl(v: string): number {
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? Math.min(80, n) : 0;
}

/** Liste aus Text + Stunden mit einer leeren Zeile zum Hinzufügen (Enter). */
function PostenListe({
  titel,
  hinweis,
  name,
  liste,
  neu,
  setNeu,
  onAendern,
  autofokus,
  children,
}: {
  titel: string;
  hinweis?: string;
  name: string;
  liste: Posten[];
  neu: Neu;
  setNeu: (x: Neu) => void;
  onAendern: (l: Posten[]) => void;
  autofokus?: boolean;
  children?: ReactNode;
}) {
  const hinzu = () => {
    if (!neu.text.trim()) return;
    onAendern([...liste, { text: neu.text.trim(), stunden: zahl(neu.stunden) }]);
    setNeu({ text: '', stunden: '' });
  };
  const taste = (x: KeyboardEvent) => {
    if (x.key === 'Enter') {
      x.preventDefault();
      hinzu();
    }
  };
  const id = name.toLowerCase();
  return (
    <section aria-labelledby={`t-${id}`} className="flex flex-col gap-2.5 border-t border-line pt-4 first:border-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`t-${id}`} className="font-semibold">
          {titel}
        </h3>
        {hinweis && <span className="text-xs text-muted">{hinweis}</span>}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_76px_40px] items-center gap-2">
        {liste.map((p, i) => (
          <PostenZeile
            key={i}
            name={`${name} ${i + 1}`}
            p={p}
            onAendern={(x) => onAendern(liste.map((y, j) => (j === i ? x : y)))}
            onEntfernen={() => onAendern(liste.filter((_, j) => j !== i))}
          />
        ))}
        <input
          className="eingabe min-h-[40px] border-dashed bg-card py-1.5"
          placeholder={`Neue ${name === 'Tätigkeit' ? 'Tätigkeit' : name === 'Unterweisung' ? 'Unterweisung' : 'Zeile'}, mit Enter hinzufügen`}
          aria-label={`Neue ${name}`}
          value={neu.text}
          maxLength={300}
          data-autofokus={autofokus && liste.length === 0 ? true : undefined}
          onChange={(x) => setNeu({ ...neu, text: x.target.value })}
          onKeyDown={taste}
        />
        <input
          className={`${ZAHL} border-dashed bg-card`}
          type="number"
          min={0}
          max={80}
          step={0.25}
          placeholder="h"
          aria-label={`Stunden neue ${name}`}
          value={neu.stunden}
          onChange={(x) => setNeu({ ...neu, stunden: x.target.value })}
          onKeyDown={taste}
        />
        <button
          type="button"
          onClick={hinzu}
          disabled={!neu.text.trim()}
          aria-label={`${name} hinzufügen`}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-chip hover:text-accent disabled:opacity-40"
        >
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>
      {children}
    </section>
  );
}

function PostenZeile({
  name,
  p,
  onAendern,
  onEntfernen,
}: {
  name: string;
  p: Posten;
  onAendern: (p: Posten) => void;
  onEntfernen: () => void;
}) {
  return (
    <>
      <input className="eingabe min-h-[40px] py-1.5" aria-label={name} value={p.text} maxLength={300} onChange={(x) => onAendern({ ...p, text: x.target.value })} />
      <input
        className={ZAHL}
        type="number"
        min={0}
        max={80}
        step={0.25}
        aria-label={`Stunden ${name}`}
        placeholder="h"
        value={p.stunden || ''}
        onChange={(x) => onAendern({ ...p, stunden: zahl(x.target.value) })}
      />
      <button
        type="button"
        onClick={onEntfernen}
        aria-label={`${name} entfernen`}
        title="Entfernen"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-chip hover:text-rot"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </>
  );
}

function AbwesenheitListe({
  montag,
  liste,
  tagSoll,
  onAendern,
}: {
  montag: string;
  liste: Abwesenheit[];
  tagSoll: number;
  onAendern: (l: Abwesenheit[]) => void;
}) {
  const tage = [0, 1, 2, 3, 4, 5, 6].map((i) => plusTage(montag, i));
  const frei = tage.slice(0, 5).find((t) => !liste.some((a) => a.tag === t)) ?? tage[0];
  const setze = (i: number, x: Partial<Abwesenheit>) => onAendern(liste.map((a, j) => (j === i ? { ...a, ...x } : a)));
  return (
    <section aria-labelledby="t-abwesenheit" className="flex flex-col gap-2.5 border-t border-line pt-4">
      <h3 id="t-abwesenheit" className="font-semibold">
        Abwesenheit
      </h3>
      {liste.length > 0 && (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_76px_40px] items-center gap-2 sm:grid-cols-[130px_130px_minmax(0,1fr)_76px_40px]">
          {liste.map((a, i) => (
            <div key={i} className="contents">
              <select className="eingabe min-h-[40px] py-1.5" aria-label={`Tag ${i + 1}`} value={a.tag} onChange={(x) => setze(i, { tag: x.target.value })}>
                {tage.map((t) => (
                  <option key={t} value={t}>
                    {wochentagKurz(t)}
                  </option>
                ))}
              </select>
              <select
                className="eingabe min-h-[40px] py-1.5"
                aria-label={`Grund ${i + 1}`}
                value={a.grund}
                onChange={(x) => setze(i, { grund: x.target.value as AbwesenheitGrund })}
              >
                {(Object.keys(GRUND) as AbwesenheitGrund[]).map((g) => (
                  <option key={g} value={g}>
                    {GRUND[g]}
                  </option>
                ))}
              </select>
              <input
                className="eingabe col-span-2 min-h-[40px] py-1.5 sm:col-span-1"
                aria-label={`Bemerkung ${i + 1}`}
                placeholder="Bemerkung (optional)"
                value={a.text}
                maxLength={300}
                onChange={(x) => setze(i, { text: x.target.value })}
              />
              <input
                className={ZAHL}
                type="number"
                min={0}
                max={80}
                step={0.25}
                aria-label={`Stunden Abwesenheit ${i + 1}`}
                value={a.stunden || ''}
                placeholder="h"
                onChange={(x) => setze(i, { stunden: zahl(x.target.value) })}
              />
              <button
                type="button"
                onClick={() => onAendern(liste.filter((_, j) => j !== i))}
                aria-label={`Abwesenheit ${wochentagKurz(a.tag)} entfernen`}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-chip hover:text-rot"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        className="btn-sekundaer min-h-[40px] w-fit"
        onClick={() => onAendern([...liste, { tag: frei, grund: 'urlaub', stunden: Math.round(tagSoll * 4) / 4, text: '' }])}
      >
        <Plus size={16} aria-hidden="true" />
        Abwesenheit hinzufügen
      </button>
    </section>
  );
}

