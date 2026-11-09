import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useUnterthemaAendern } from '../api';
import { AMPEL } from '../lib/ampel';
import type { AmpelVorschlag } from '../lib/training';
import { Punkt } from '../components/ui';

/** Vorschläge nach einer Runde: Ampel per Klick anpassen (der Klick ist die Bestätigung). */
export function AmpelVorschlaege({ vorschlaege }: { vorschlaege: AmpelVorschlag[] }) {
  const aendern = useUnterthemaAendern();
  const [erledigt, setErledigt] = useState<Set<string>>(new Set());
  if (!vorschlaege.length) return null;
  return (
    <section aria-labelledby="ampel-vorschlag" className="flex flex-col gap-2 rounded-lg border border-line bg-bg p-4">
      <h3 id="ampel-vorschlag" className="font-semibold">
        Vorschläge für deine Ampel
      </h3>
      <ul className="flex flex-col gap-1.5">
        {vorschlaege.slice(0, 8).map((v) => {
          const fertig = erledigt.has(v.id);
          return (
            <li key={v.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="min-w-0 flex-1">
                <strong className="font-semibold">{v.unterthema.titel}</strong>
                <span className="text-muted"> · {v.feldTitel} · {v.grund}</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <Punkt status={v.von} size={8} /> {AMPEL[v.von].kurz}
                <ArrowRight size={12} aria-hidden="true" />
                <Punkt status={v.nach} size={8} /> {AMPEL[v.nach].kurz}
              </span>
              {fertig ? (
                <span className="inline-flex min-h-[36px] items-center gap-1 text-sm font-semibold text-seg-gruen-ink">
                  <Check size={14} aria-hidden="true" /> umgestellt
                </span>
              ) : (
                <button
                  type="button"
                  className="btn-sekundaer min-h-[36px] px-3"
                  onClick={() =>
                    aendern.mutate({ id: v.id, patch: { status: v.nach } }, { onSuccess: () => setErledigt((s) => new Set(s).add(v.id)) })
                  }
                >
                  Auf „{AMPEL[v.nach].kurz}“ stellen
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
