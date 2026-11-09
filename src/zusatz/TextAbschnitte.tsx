import { Check } from 'lucide-react';
import type { TextAbschnitt } from '../types';
import { Inline } from '../components/ui';
import { Grafik, maxBreite, svgBreite } from '../components/Grafik';
import { TabelleAnsicht } from '../components/TabelleAnsicht';
import { Vergleich } from './Vergleich';

/**
 * Zusatzwissen vom Typ "text": Abschnitte mit Text, Grafiken, Tabelle, Listen und Schritten.
 * Varianten: "Checkliste: …" zeigt die Punkte mit Haken, "Vergleich: …" zusätzlich Karten.
 */
export function TextAbschnitte({ abschnitte }: { abschnitte: TextAbschnitt[] }) {
  return (
    <div className="flex flex-col gap-8">
      {abschnitte.map((a, ai) => (
        <section key={`${ai}-${a.titel}`} className="flex flex-col gap-3">
          {a.titel && <h4 className="border-b border-line pb-1 text-lg font-semibold">{a.titel}</h4>}
          {a.absaetze.map((t, i) => (
            <p key={i} className={a.art === 'checkliste' ? 'text-muted' : undefined}>
              <Inline text={t} />
            </p>
          ))}
          {a.bilder.length > 0 && (
            <div
              className={`grid grid-cols-1 gap-4 ${
                a.bilder.length > 1 && a.bilder.every((x) => (svgBreite(x.svg) ?? 0) <= 400) ? 'md:grid-cols-2' : ''
              }`}
            >
              {a.bilder.map((b) => (
                <div
                  key={b.datei}
                  className="mx-auto w-full rounded-lg border border-line bg-bg p-3"
                  style={{ maxWidth: maxBreite(b.svg) }}
                >
                  <Grafik bild={b} />
                </div>
              ))}
            </div>
          )}
          {a.tabelle && <TabelleAnsicht t={a.tabelle} />}
          {a.punkte.length > 0 &&
            (a.art === 'checkliste' ? (
              <ul className="flex flex-col gap-2">
                {a.punkte.map((p, i) => (
                  <li key={i} className="flex gap-2">
                    <Check size={18} className="mt-1 shrink-0 text-gruen" aria-hidden="true" />
                    <span>
                      <Inline text={p} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="flex list-disc flex-col gap-1.5 pl-5">
                {a.punkte.map((p, i) => (
                  <li key={i}>
                    <Inline text={p} />
                  </li>
                ))}
              </ul>
            ))}
          {a.schritte.length > 0 && (
            <ol className="flex list-decimal flex-col gap-1.5 pl-5">
              {a.schritte.map((p, i) => (
                <li key={i}>
                  <Inline text={p} />
                </li>
              ))}
            </ol>
          )}
          {a.karten.length > 0 && <Vergleich karten={a.karten} />}
        </section>
      ))}
    </div>
  );
}
