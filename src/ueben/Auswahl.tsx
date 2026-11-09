import type { PruefungKey, Themenfeld } from '../types';
import { PRUEFUNG_KURZ } from '../lib/datum';

/** Auswahl der Themenfelder für eine Runde, mit Schnellwahl nach Prüfung. */
export function FeldAuswahl({
  felder,
  gewaehlt,
  onAendern,
}: {
  felder: Themenfeld[];
  gewaehlt: Set<string>;
  onAendern: (s: Set<string>) => void;
}) {
  const schnell = (k: 'alle' | PruefungKey) => onAendern(new Set(felder.filter((f) => k === 'alle' || f.pruefung.includes(k)).map((f) => f.id)));
  const istSchnell = (k: 'alle' | PruefungKey) => {
    const ziel = felder.filter((f) => k === 'alle' || f.pruefung.includes(k)).map((f) => f.id);
    return ziel.length === gewaehlt.size && ziel.every((id) => gewaehlt.has(id));
  };
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-semibold">Themenfelder</legend>
      <div className="flex flex-wrap gap-1.5">
        {(['alle', 'AP1', 'AP2'] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={istSchnell(k)}
            onClick={() => schnell(k)}
            className={`min-h-[36px] rounded-lg border px-3 text-sm font-semibold transition ${
              istSchnell(k) ? 'border-accent bg-accent text-on-accent' : 'border-line bg-card hover:bg-chip'
            }`}
          >
            {k === 'alle' ? 'Alle' : `Nur ${PRUEFUNG_KURZ[k]}`}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {felder.map((f) => {
          const an = gewaehlt.has(f.id);
          return (
            <label
              key={f.id}
              className={`inline-flex min-h-[36px] cursor-pointer items-center gap-2 rounded-full border px-3 text-sm transition focus-within:outline focus-within:outline-2 focus-within:outline-accent ${
                an ? 'border-accent bg-accent-soft font-semibold text-accent' : 'border-line bg-card text-muted hover:bg-chip'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={an}
                onChange={() => {
                  const x = new Set(gewaehlt);
                  if (an) x.delete(f.id);
                  else x.add(f.id);
                  onAendern(x);
                }}
              />
              {f.titel}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
