import { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { formatDatum, heuteIso } from '../lib/datum';
import { ausbildungsdauer, MINDESTDAUER_MONATE, monateZwischen, plusMonate, plusTage, REGELDAUER_MONATE, VERKUERZUNG_GRUENDE } from '../lib/kalender';
import { KAMMER_LINKS } from '../lib/pruefungen';
import type { Einstellungen } from '../types';

const MAX = REGELDAUER_MONATE - MINDESTDAUER_MONATE;

/** Einstellungen zur Ausbildungsdauer: Verkürzung, Art der Anrechnung, Vertragsende, vorzeitige Zulassung. */
export function AusbildungsDauer({ e, setze }: { e: Einstellungen; setze: (x: Partial<Einstellungen>) => void }) {
  const [monate, setMonate] = useState(e.verkuerzung_monate);
  useEffect(() => setMonate(e.verkuerzung_monate), [e.verkuerzung_monate]);
  const v = Number(e.verkuerzung_monate) || 0;
  const dauer = ausbildungsdauer(e);
  const berechnet = e.ausbildungsbeginn ? plusTage(plusMonate(e.ausbildungsbeginn, REGELDAUER_MONATE - v), -1) : '';
  const heute = heuteIso();
  const restMonate = dauer && heute < dauer.ende ? monateZwischen(heute < dauer.beginn ? dauer.beginn : heute, plusTage(dauer.ende, 1)) : null;

  const speichereMonate = (roh: string) => {
    const n = Math.round(Number(roh.replace(',', '.')));
    if (!Number.isFinite(n) || n < 0) return setMonate(e.verkuerzung_monate);
    const wert = String(Math.min(n, MAX));
    setMonate(wert);
    if (wert !== e.verkuerzung_monate) setze({ verkuerzung_monate: wert });
  };

  return (
    <div className="flex flex-col gap-4 border-t border-line pt-4">
      <div>
        <h3 className="font-semibold">Ausbildungsdauer</h3>
        <p className="text-sm text-muted">
          Regeldauer {REGELDAUER_MONATE} Monate. Mit Abitur, Fachhochschulreife, Mittlerer Reife oder einer Vorausbildung kann die Ausbildung verkürzt werden – höchstens auf {MINDESTDAUER_MONATE} Monate.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="verkuerzung" className="text-sm font-semibold">
          Verkürzung
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Schnellauswahl Verkürzung" className="flex gap-1 rounded-xl border border-line bg-bg p-1">
            {['0', '6', '12'].map((x) => (
              <button
                key={x}
                type="button"
                aria-pressed={e.verkuerzung_monate === x}
                onClick={() => speichereMonate(x)}
                className={`min-h-[36px] rounded-lg px-3 text-sm font-semibold transition ${e.verkuerzung_monate === x ? 'bg-accent text-on-accent' : 'text-ink hover:bg-chip'}`}
              >
                {x === '0' ? 'keine' : `${x} Monate`}
              </button>
            ))}
          </div>
          <span className="text-sm text-muted">oder</span>
          <input
            id="verkuerzung"
            type="number"
            min={0}
            max={MAX}
            className="eingabe w-24"
            value={monate}
            onChange={(x) => setMonate(x.target.value)}
            onBlur={(x) => speichereMonate(x.target.value)}
            onKeyDown={(x) => x.key === 'Enter' && speichereMonate((x.target as HTMLInputElement).value)}
          />
          <span className="text-sm text-muted">Monate</span>
        </div>
      </div>

      {v > 0 && (
        <>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-semibold">Wie wird verkürzt?</legend>
            <Auswahl
              name="verkuerzung_art"
              wert={e.verkuerzung_art}
              optionen={[
                ['ende', 'Am Ende', 'Die Ausbildung endet früher; die Ausbildungsjahre zählen normal ab dem 1. – der übliche Fall, z. B. bei Abitur.'],
                ['anfang', 'Am Anfang angerechnet', `Die ${v} Monate gelten als schon absolviert – du startest z. B. bei 12 Monaten direkt im 2. Ausbildungsjahr (etwa nach einem Berufsgrundbildungsjahr).`],
              ]}
              onWahl={(x) => setze({ verkuerzung_art: x as Einstellungen['verkuerzung_art'] })}
            />
          </fieldset>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-semibold">Seit wann?</legend>
              <Auswahl
                name="verkuerzung_zeitpunkt"
                wert={e.verkuerzung_zeitpunkt}
                optionen={[
                  ['vertrag', 'Schon im Ausbildungsvertrag', ''],
                  ['nachtraeglich', 'Nachträglich beantragt', ''],
                ]}
                onWahl={(x) => setze({ verkuerzung_zeitpunkt: x as Einstellungen['verkuerzung_zeitpunkt'] })}
              />
            </fieldset>
            <div className="flex flex-col gap-1">
              <label htmlFor="verkuerzung-grund" className="text-sm font-semibold">
                Grund
              </label>
              <select id="verkuerzung-grund" className="eingabe" value={e.verkuerzung_grund} onChange={(x) => setze({ verkuerzung_grund: x.target.value })}>
                {VERKUERZUNG_GRUENDE.map(([k, t]) => (
                  <option key={k} value={k}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="vertragsende" className="text-sm font-semibold">
            Vertragsende <span className="font-normal text-muted">(nur wenn abweichend)</span>
          </label>
          <input id="vertragsende" type="date" className="eingabe" value={e.vertragsende} min={e.ausbildungsbeginn || undefined} onChange={(x) => setze({ vertragsende: x.target.value })} />
        </div>
        <div className="flex min-h-[44px] flex-col justify-center rounded-lg bg-bg px-4 py-2 text-sm">
          {dauer ? (
            <>
              <span>
                Ende: <strong>{formatDatum(dauer.ende)}</strong> {dauer.endeVonHand ? '(von dir eingetragen)' : `(${dauer.monate} Monate)`}
              </span>
              {dauer.endeVonHand && berechnet !== dauer.ende && <span className="text-muted">Berechnet wären es {formatDatum(berechnet)}.</span>}
            </>
          ) : (
            <span className="text-muted">Erst den Ausbildungsbeginn eintragen.</span>
          )}
        </div>
      </div>

      {v > 0 && e.verkuerzung_zeitpunkt === 'nachtraeglich' && restMonate !== null && restMonate < 12 && (
        <p role="alert" className="flex gap-2 rounded-md bg-warn px-3 py-2 text-sm text-warn-ink">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            Bis zum neuen Ende bleiben nur noch {restMonate} Monate. Für einen nachträglichen Antrag erwartet die Handelskammer, dass mindestens ein Jahr Ausbildungszeit verbleibt – stimm den Antrag rechtzeitig mit deinem Betrieb ab. Ist die Verkürzung schon genehmigt, gilt dieser Hinweis nicht.
          </span>
        </p>
      )}

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--c-accent)]"
          checked={e.vorzeitige_zulassung === 'ja'}
          onChange={(x) => setze({ vorzeitige_zulassung: x.target.checked ? 'ja' : 'nein' })}
        />
        <span>
          <strong className="block">Vorzeitige Zulassung zur Abschlussprüfung</strong>
          <span className="text-sm text-muted">
            Bei guten Leistungen kannst du früher zur Prüfung. Der Vertrag bleibt unverändert, endet aber mit dem Bestehen von Teil 2. Den Prüfungstermin trägst du unten ein.
          </span>
        </span>
      </label>

      <a href={KAMMER_LINKS.verkuerzung} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] w-fit items-center gap-2 text-sm font-semibold text-accent">
        Regeln und Antrag bei der Handelskammer Hamburg
        <ExternalLink size={16} aria-hidden="true" />
      </a>
    </div>
  );
}

function Auswahl({ name, wert, optionen, onWahl }: { name: string; wert: string; optionen: [string, string, string][]; onWahl: (x: string) => void }) {
  return (
    <>
      {optionen.map(([k, t, hilfe]) => (
        <label key={k} className="flex cursor-pointer items-start gap-3">
          <input type="radio" name={name} className="mt-1 h-4 w-4 shrink-0 accent-[var(--c-accent)]" checked={wert === k} onChange={() => onWahl(k)} />
          <span className="text-sm">
            <strong>{t}</strong>
            {hilfe && <span className="block text-muted">{hilfe}</span>}
          </span>
        </label>
      ))}
    </>
  );
}
