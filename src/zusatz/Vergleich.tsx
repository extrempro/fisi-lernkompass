import type { VergleichKarte } from '../types';
import { Inline } from '../components/ui';
import { Grafik } from '../components/Grafik';

export function Vergleich({ karten }: { karten: VergleichKarte[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {karten.map((k) => (
        <div key={k.titel} className="flex flex-col gap-2 rounded-lg border border-line bg-bg p-4">
          <strong>{k.titel}</strong>
          {k.bild ? (
            <div className="rounded-md bg-card p-2">
              <Grafik bild={k.bild} unterschrift={false} />
            </div>
          ) : k.schema ? (
            <pre className="overflow-x-auto rounded-md bg-code p-2 font-mono text-[13px] leading-snug text-code-ink" aria-hidden="true">
              {k.schema}
            </pre>
          ) : null}
          <p className="text-sm">
            <Inline text={k.kurz} />
          </p>
          {k.plus && (
            <p className="text-sm">
              <strong className="text-gruen">+</strong> <span className="sr-only">Vorteil:</span>
              <span className="text-muted">
                <Inline text={k.plus} />
              </span>
            </p>
          )}
          {k.minus && (
            <p className="text-sm">
              <strong className="text-rot">−</strong> <span className="sr-only">Nachteil:</span>
              <span className="text-muted">
                <Inline text={k.minus} />
              </span>
            </p>
          )}
          {k.beispiel && (
            <p className="mt-auto text-sm">
              <span className="font-semibold">Beispiel:</span>{' '}
              <span className="text-muted">
                <Inline text={k.beispiel} />
              </span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
