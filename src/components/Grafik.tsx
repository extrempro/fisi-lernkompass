import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';
import type { Abbildung, Bild } from '../types';

/** Breite laut viewBox der SVG (Originalgröße in Pixeln). */
export function svgBreite(svg: string): number | undefined {
  const m = /viewBox="\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)/.exec(svg);
  return m ? Number(m[1]) : undefined;
}

/** Höchstbreite für eine einzeln stehende Grafik: etwa 1,4-fache Originalgröße, damit Text nicht riesig wird. */
export function maxBreite(svg: string): number | undefined {
  const b = svgBreite(svg);
  return b ? Math.round(b * 1.4) : undefined;
}

/**
 * Zeigt eine SVG aus content/bilder/. Die SVG wird direkt eingebettet (vom Server bereinigt),
 * damit sie über die .sv-*-Klassen die Farben von Hell- und Dunkelmodus übernimmt.
 * Ein Klick öffnet die Grafik groß in einem Fenster.
 */
export function Grafik({ bild, unterschrift = true }: { bild: Bild; unterschrift?: boolean }) {
  const [gross, setGross] = useState(false);
  const knopf = useRef<HTMLButtonElement>(null);

  if (!bild.svg) {
    return (
      <p className="rounded-md border border-dashed border-line p-3 text-sm text-muted">
        Grafik „{bild.datei}“ konnte nicht geladen werden.
      </p>
    );
  }
  return (
    <figure className="m-0 flex flex-col gap-1.5">
      <button
        ref={knopf}
        type="button"
        onClick={() => setGross(true)}
        aria-label={`Grafik vergrößern: ${bild.alt}`}
        title="Zum Vergrößern klicken"
        className="group relative block w-full cursor-zoom-in rounded-md"
      >
        <div className="sv-figur" aria-hidden="true" dangerouslySetInnerHTML={{ __html: bild.svg }} />
        <span className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-md border border-line bg-card text-muted opacity-70 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 size={14} aria-hidden="true" />
        </span>
      </button>
      {unterschrift && <figcaption className="text-center text-xs text-muted">{bild.alt}</figcaption>}
      {gross && (
        <Lupe
          bild={bild}
          onSchliessen={() => {
            setGross(false);
            knopf.current?.focus();
          }}
        />
      )}
    </figure>
  );
}

/** Großansicht einer Grafik über der Seite; schließt mit Esc, Klick daneben oder dem X. */
function Lupe({ bild, onSchliessen }: { bild: Bild; onSchliessen: () => void }) {
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSchliessen();
    };
    window.addEventListener('keydown', taste);
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', taste);
      document.body.style.overflow = vorher;
    };
  }, [onSchliessen]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={bild.alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.75)] p-3 sm:p-6"
      onClick={onSchliessen}
    >
      <div
        className="relative flex max-h-full w-full max-w-[1400px] flex-col gap-3 overflow-auto rounded-xl bg-bg p-4 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          autoFocus
          onClick={onSchliessen}
          aria-label="Großansicht schließen"
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-chip hover:text-ink"
        >
          <X size={22} aria-hidden="true" />
        </button>
        <div className="sv-figur sv-lupe" role="img" aria-label={bild.alt} dangerouslySetInnerHTML={{ __html: bild.svg }} />
        <p className="pr-10 text-center text-sm text-muted">{bild.alt}</p>
      </div>
    </div>,
    document.body,
  );
}

export function AbbildungBlock({ a }: { a: Abbildung }) {
  const n = a.bilder.length;
  // Breite Grafiken (Abläufe, Header, Pläne) untereinander, damit sie lesbar bleiben;
  // schmale (Topologien, Stecker, Querschnitte) im Raster nebeneinander.
  const breit = a.bilder.some((b) => (svgBreite(b.svg) ?? 0) > 400);
  if (breit) {
    return (
      <div>
        <h3 className="ueberschrift-klein mb-2">{a.titel}</h3>
        <div className="flex flex-col gap-4">
          {a.bilder.map((b) => (
            <div key={b.datei} className="w-full rounded-lg border border-line bg-bg p-3" style={{ maxWidth: maxBreite(b.svg) }}>
              <Grafik bild={b} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  const spalten = n === 4 ? 'grid-cols-2 lg:grid-cols-4' : n >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : n === 2 ? 'sm:grid-cols-2' : '';
  return (
    <div>
      <h3 className="ueberschrift-klein mb-2">{a.titel}</h3>
      <div
        className={`grid gap-4 ${n === 4 ? '' : 'grid-cols-1'} ${spalten}`}
        style={n === 1 ? { maxWidth: maxBreite(a.bilder[0].svg) } : undefined}
      >
        {a.bilder.map((b) => (
          <div key={b.datei} className="rounded-lg border border-line bg-bg p-3">
            <Grafik bild={b} />
          </div>
        ))}
      </div>
    </div>
  );
}
