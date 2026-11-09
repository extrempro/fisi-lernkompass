import { useEffect, useId, useRef, useState } from 'react';
import type { Status } from '../types';
import { AMPEL } from '../lib/ampel';

const STIL: Record<Status, string> = {
  rot: 'bg-seg-rot text-seg-rot-ink',
  gelb: 'bg-seg-gelb text-seg-gelb-ink',
  gruen: 'bg-seg-gruen text-seg-gruen-ink',
};

function Symbol({ status }: { status: Status }) {
  if (status === 'rot') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke={AMPEL.rot.farbe} strokeWidth="3" />
      </svg>
    );
  }
  if (status === 'gelb') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke={AMPEL.gelb.farbe} strokeWidth="3" />
        <path d="M12 4a8 8 0 0 1 0 16z" fill={AMPEL.gelb.farbe} />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={AMPEL.gruen.farbe} />
      <path d="m7.5 12 3 3 6-6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Segment-Schalter Offen / In Arbeit / Sicher. Klick auf den aktiven Status bestätigt ihn erneut.
 * Mit „bestaetigen“ fragt eine kleine Rückfrage nach, bevor sich die Ampel ändert –
 * damit ein versehentlicher Klick nichts verstellt.
 */
export function AmpelSegment({
  titel,
  status,
  onChange,
  bestaetigen = false,
}: {
  titel: string;
  status: Status;
  onChange: (s: Status) => void;
  bestaetigen?: boolean;
}) {
  const [frage, setFrage] = useState<Status | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const frageId = useId();
  const knoepfe = useRef<Partial<Record<Status, HTMLButtonElement | null>>>({});

  const schliessen = (fokus: Status | null) => {
    setFrage(null);
    if (fokus) knoepfe.current[fokus]?.focus();
  };

  // Klick außerhalb oder Esc bricht die Rückfrage ab
  useEffect(() => {
    if (!frage) return;
    const klick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setFrage(null);
    };
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        schliessen(frage);
      }
    };
    document.addEventListener('mousedown', klick);
    document.addEventListener('keydown', taste);
    return () => {
      document.removeEventListener('mousedown', klick);
      document.removeEventListener('keydown', taste);
    };
  }, [frage]);

  const waehle = (s: Status) => {
    if (bestaetigen && s !== status) setFrage(s);
    else onChange(s);
  };

  return (
    <div ref={box} className="relative shrink-0">
      <div role="group" aria-label={`Status für ${titel}`} className="flex gap-0.5 rounded-[10px] border border-line bg-bg p-0.5">
        {(['rot', 'gelb', 'gruen'] as Status[]).map((s) => {
          const an = s === status;
          const gefragt = s === frage;
          return (
            <button
              key={s}
              ref={(el) => {
                knoepfe.current[s] = el;
              }}
              type="button"
              aria-pressed={an}
              aria-expanded={bestaetigen && !an ? gefragt : undefined}
              onClick={() => waehle(s)}
              className={`flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1 text-sm transition ${
                an ? `${STIL[s]} font-semibold` : gefragt ? 'bg-chip font-semibold text-ink ring-2 ring-accent' : 'font-medium text-muted hover:bg-chip'
              }`}
            >
              <Symbol status={s} />
              <span>{AMPEL[s].kurz}</span>
            </button>
          );
        })}
      </div>
      {frage && (
        <div
          role="alertdialog"
          aria-labelledby={frageId}
          className="absolute right-0 top-full z-20 mt-2 flex w-[min(320px,calc(100vw-32px))] flex-col gap-3 rounded-xl border border-line bg-card p-4 shadow-[0_8px_24px_rgba(15,23,42,0.18)]"
        >
          <p id={frageId} className="text-sm">
            Ampel für <strong>{titel}</strong> von <strong>{AMPEL[status].kurz}</strong> auf <strong>{AMPEL[frage].kurz}</strong> stellen?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              autoFocus
              className="btn-primaer"
              onClick={() => {
                onChange(frage);
                schliessen(frage);
              }}
            >
              Umstellen
            </button>
            <button type="button" className="btn-sekundaer" onClick={() => schliessen(status)}>
              Abbrechen
            </button>
          </div>
          <p className="text-xs text-muted">Die Rückfrage lässt sich in den Einstellungen abschalten.</p>
        </div>
      )}
    </div>
  );
}
