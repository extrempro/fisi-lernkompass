import type { ReactNode } from 'react';
import { Lightbulb } from 'lucide-react';

/** Gemeinsame Bausteine der Werkzeuge. */

export function Kopf({ titel, text }: { titel: string; text: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{titel}</h3>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}

export function Merke({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-line bg-bg px-4 py-3 text-sm">
      <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

const TON = {
  gut: 'bg-seg-gruen text-seg-gruen-ink',
  warn: 'bg-seg-gelb text-seg-gelb-ink',
  schlecht: 'bg-seg-rot text-seg-rot-ink',
  neutral: 'bg-bg text-ink',
} as const;

/** Ergebnisbox; wird bei Änderungen vorgelesen. */
export function Ergebnis({ ton, titel, children }: { ton: keyof typeof TON; titel: string; children?: ReactNode }) {
  return (
    <div role="status" aria-live="polite" className={`rounded-lg px-4 py-3 text-sm ${TON[ton]}`}>
      <strong className="block text-base">{titel}</strong>
      {children}
    </div>
  );
}

/** Umschalter mit aria-pressed für kleine Auswahlen. */
export function Umschalter<T extends string>({
  label,
  wert,
  optionen,
  onWahl,
}: {
  label: string;
  wert: T;
  optionen: readonly (readonly [T, string])[];
  onWahl: (x: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1 rounded-xl border border-line bg-bg p-1">
      {optionen.map(([k, t]) => (
        <button
          key={k}
          type="button"
          aria-pressed={wert === k}
          onClick={() => onWahl(k)}
          className={`min-h-[36px] rounded-lg px-3 text-sm font-semibold transition ${wert === k ? 'bg-accent text-on-accent' : 'text-ink hover:bg-chip'}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
