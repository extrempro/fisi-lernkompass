import { useState } from 'react';
import { PenLine } from 'lucide-react';
import { useAbzeichnen, useEinstellungen } from '../api';
import { Dialog } from '../components/Dialog';
import { h, summe } from '../lib/bericht';
import { formatDatum, heuteIso } from '../lib/datum';
import { tagMonat, type Woche } from '../lib/kalender';
import type { Bericht } from '../types';
import { UnterschriftFeld } from './Unterschrift';

/**
 * Sammel-Abzeichnen mit gezeichneter Unterschrift: Die Ausbilderin oder der Ausbilder
 * sieht die Berichte, wählt aus und unterschreibt einmal für alle.
 */
export function AbzeichnenDialog({
  kandidaten,
  wochen,
  onSchliessen,
  onFertig,
}: {
  kandidaten: Bericht[];
  wochen: Map<string, Woche>;
  onSchliessen: () => void;
  onFertig: (n: number) => void;
}) {
  const { data: e } = useEinstellungen();
  const abzeichnen = useAbzeichnen();
  const [auswahl, setAuswahl] = useState(() => new Set(kandidaten.map((b) => b.montag)));
  const [name, setName] = useState(e?.ausbilder ?? '');
  const [datum, setDatum] = useState(heuteIso());
  const [pfad, setPfad] = useState('');
  const [bestaetigt, setBestaetigt] = useState(false);
  const [meldung, setMeldung] = useState('');

  const gewaehlt = kandidaten.filter((b) => auswahl.has(b.montag));
  const bereit = gewaehlt.length > 0 && name.trim() && pfad && bestaetigt;
  const umschalten = (m: string) =>
    setAuswahl((a) => {
      const x = new Set(a);
      if (x.has(m)) x.delete(m);
      else x.add(m);
      return x;
    });

  return (
    <Dialog titel="Digital abzeichnen" onSchliessen={onSchliessen} breite={720}>
      <form
        className="flex flex-col gap-5"
        onSubmit={(x) => {
          x.preventDefault();
          if (!bereit) return;
          abzeichnen.mutate(
            { montage: gewaehlt.map((b) => b.montag), datum, unterschrift: { name: name.trim(), pfad } },
            { onSuccess: (r) => onFertig(r.geaendert), onError: (err) => setMeldung((err as Error).message) },
          );
        }}
      >
        <p className="-mt-3 text-sm text-muted">
          Für die Ausbilderin oder den Ausbilder: Berichte prüfen, auswählen und einmal unterschreiben. Die Unterschrift erscheint auf jedem ausgewählten Nachweis im PDF.
        </p>

        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-sm font-semibold">
            Berichte ({gewaehlt.length} von {kandidaten.length} ausgewählt)
          </legend>
          <ul className="flex max-h-[260px] flex-col overflow-y-auto rounded-lg border border-line">
            {kandidaten.map((b) => {
              const w = wochen.get(b.montag);
              const s = summe(b.inhalt);
              const stichworte = [...b.inhalt.betrieb, ...b.inhalt.schule].map((p) => p.text).filter(Boolean);
              return (
                <li key={b.montag} className="border-b border-line last:border-0">
                  <label className="flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-chip">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 accent-[var(--c-accent)]"
                      checked={auswahl.has(b.montag)}
                      onChange={() => umschalten(b.montag)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <strong>
                          Nr. {w?.nummer ?? '–'} · KW {w?.kw ?? ''}{' '}
                          <span className="font-normal text-muted">
                            {tagMonat(b.montag)}–{w ? tagMonat(w.sonntag) : ''}
                          </span>
                        </strong>
                        <span className="text-sm tabular-nums text-muted">{h(s.gesamt)} h</span>
                      </span>
                      <span className="line-clamp-2 text-sm text-muted">{stichworte.join(' · ') || 'ohne Tätigkeiten'}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
          <div className="flex flex-col gap-1">
            <label htmlFor="ab-name" className="text-sm font-semibold">
              Name der Ausbilderin / des Ausbilders
            </label>
            <input id="ab-name" className="eingabe" value={name} maxLength={200} onChange={(x) => setName(x.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="ab-datum" className="text-sm font-semibold">
              Datum
            </label>
            <input id="ab-datum" type="date" className="eingabe" value={datum} onChange={(x) => setDatum(x.target.value)} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Unterschrift</span>
          <UnterschriftFeld beschriftung={name.trim() || 'Ausbilder/in'} onAendern={setPfad} />
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--c-accent)]" checked={bestaetigt} onChange={(x) => setBestaetigt(x.target.checked)} />
          <span>
            Ich bestätige die ordnungsgemäße Führung der ausgewählten Ausbildungsnachweise
            {datum ? ` (Datum ${formatDatum(datum)})` : ''}.
          </span>
        </label>

        {meldung && (
          <p role="alert" className="rounded-lg bg-seg-rot px-4 py-2 text-sm text-seg-rot-ink">
            {meldung}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <span className="text-xs text-muted">Wird ein Bericht danach geändert, entfällt seine Unterschrift automatisch.</span>
          <div className="flex gap-2">
            <button type="button" className="btn-sekundaer" onClick={onSchliessen}>
              Abbrechen
            </button>
            <button type="submit" className="btn-primaer" disabled={!bereit || abzeichnen.isPending}>
              <PenLine size={16} aria-hidden="true" />
              {gewaehlt.length === 1 ? '1 Bericht unterschreiben' : `${gewaehlt.length} Berichte unterschreiben`}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
