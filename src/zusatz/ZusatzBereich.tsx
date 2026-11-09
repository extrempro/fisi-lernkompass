import { Link } from 'react-router-dom';
import { CornerLeftUp, Star } from 'lucide-react';
import { useZusatzGelesen } from '../api';
import type { Themenfeld } from '../types';
import { Inline } from '../components/ui';
import { Ablauf } from './Ablauf';
import { TextAbschnitte } from './TextAbschnitte';
import { unterthemaVerweis } from '../lib/vertiefung';

/** Optionales Zusatzwissen – zählt nicht zur Ampel, nur ein "Gelesen"-Häkchen. */
export function ZusatzBereich({ feld, felder }: { feld: Themenfeld; felder: Themenfeld[] }) {
  const gelesen = useZusatzGelesen();
  if (!feld.zusatz.length) return null;

  return (
    <section aria-labelledby="zusatz-titel" className="flex flex-col gap-6 rounded-xl border-2 border-dashed border-line p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id="zusatz-titel" className="flex items-center gap-2 text-xl font-semibold">
          <Star size={20} className="text-accent" aria-hidden="true" />
          Zusatzwissen
        </h2>
        <span className="rounded-full bg-chip px-3 py-0.5 text-xs font-semibold text-muted">Optional · zählt nicht zur Ampel</span>
      </div>

      {feld.zusatz.map((z) => (
        <article key={z.id} id={`z-${z.id}`} className="karte flex scroll-mt-24 flex-col gap-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0 flex-[1_1_320px]">
              <h3 className="text-xl font-semibold">{z.titel}</h3>
              {z.intro && (
                <p className="mt-1 text-muted">
                  <Inline text={z.intro} />
                </p>
              )}
            </div>
            <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={z.gelesen}
                onChange={(e) => gelesen.mutate({ id: `${feld.id}.${z.id}`, gelesen: e.target.checked })}
                className="h-[18px] w-[18px] accent-[var(--c-accent)]"
              />
              Gelesen
            </label>
          </div>

          {z.zu.length > 0 && (
            <p className="-mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <CornerLeftUp size={16} aria-hidden="true" />
              Vertieft:
              {z.zu.map((ref) => {
                const v = unterthemaVerweis(felder, ref);
                if (!v) return null;
                return (
                  <Link
                    key={ref}
                    to={`/thema/${v.feldId}#u-${v.id}`}
                    className="chip min-h-[28px] bg-chip py-0.5 text-sm font-semibold text-accent hover:underline"
                  >
                    {v.feldId === feld.id ? v.titel : `${v.feldTitel} › ${v.titel}`}
                  </Link>
                );
              })}
            </p>
          )}

          {z.absaetze.map((a, i) => (
            <p key={i}>
              <Inline text={a} />
            </p>
          ))}
          {z.typ === 'ablauf' && z.szenarien.length > 0 && <Ablauf szenarien={z.szenarien} />}
          {z.typ === 'text' && z.abschnitte.length > 0 && <TextAbschnitte abschnitte={z.abschnitte} />}
        </article>
      ))}
    </section>
  );
}
