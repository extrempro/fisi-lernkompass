import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Eraser } from 'lucide-react';

/** Zeichenfläche in festen Koordinaten; die Anzeige skaliert. */
export const BREITE = 600;
export const HOEHE = 200;

/** Zeigt eine gespeicherte Unterschrift (nur Pfaddaten, kein HTML). */
export function UnterschriftBild({ pfad, className = '', titel }: { pfad: string; className?: string; titel?: string }) {
  return (
    <svg viewBox={`0 0 ${BREITE} ${HOEHE}`} className={className} role="img" aria-label={titel ?? 'Unterschrift'} preserveAspectRatio="xMidYMid meet">
      <path d={pfad} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Feld zum Unterschreiben mit Finger, Stift oder Maus.
 * Liefert den Pfad als „M x y L x y …“ (nur Zahlen und M/L – so prüft ihn auch der Server).
 */
export function UnterschriftFeld({ onAendern, beschriftung }: { onAendern: (pfad: string) => void; beschriftung: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const [striche, setStriche] = useState<[number, number][][]>([]);
  const zeichnet = useRef(false);

  const punkt = (e: PointerEvent): [number, number] => {
    const r = svg.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * BREITE;
    const y = ((e.clientY - r.top) / r.height) * HOEHE;
    return [Math.round(Math.max(0, Math.min(BREITE, x)) * 10) / 10, Math.round(Math.max(0, Math.min(HOEHE, y)) * 10) / 10];
  };
  const alsPfad = (l: [number, number][][]) =>
    l
      .filter((s) => s.length > 1)
      .map((s) => `M${s[0][0]} ${s[0][1]} ` + s.slice(1).map((p) => `L${p[0]} ${p[1]}`).join(' '))
      .join(' ');
  // Nach jedem fertigen Strich (und beim Löschen) den Pfad melden
  useEffect(() => {
    if (!zeichnet.current) onAendern(alsPfad(striche));
  }, [striche]);

  const start = (e: PointerEvent) => {
    e.preventDefault();
    svg.current?.setPointerCapture(e.pointerId);
    zeichnet.current = true;
    setStriche((l) => [...l, [punkt(e)]]);
  };
  const bewegen = (e: PointerEvent) => {
    if (!zeichnet.current) return;
    const p = punkt(e);
    setStriche((l) => {
      const letzter = l[l.length - 1];
      const v = letzter[letzter.length - 1];
      if (Math.hypot(p[0] - v[0], p[1] - v[1]) < 1.5) return l; // kleine Zitterer weglassen
      return [...l.slice(0, -1), [...letzter, p]];
    });
  };
  const ende = () => {
    if (!zeichnet.current) return;
    zeichnet.current = false;
    setStriche((l) => l.slice());
  };
  const loeschen = () => {
    setStriche([]);
  };

  const pfad = alsPfad(striche);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <svg
          ref={svg}
          viewBox={`0 0 ${BREITE} ${HOEHE}`}
          role="img"
          aria-label={`${beschriftung}: hier mit Finger, Stift oder Maus unterschreiben`}
          className="block aspect-[3/1] w-full cursor-crosshair touch-none select-none rounded-lg border-2 border-dashed border-line bg-white text-slate-900"
          onPointerDown={start}
          onPointerMove={bewegen}
          onPointerUp={ende}
          onPointerCancel={ende}
          onPointerLeave={ende}
        >
          <line x1={30} y1={150} x2={570} y2={150} stroke="#cbd5e1" strokeWidth={2} />
          <text x={30} y={180} fontSize={18} fill="#94a3b8">
            ✕ {beschriftung}
          </text>
          {pfad && <path d={pfad} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
        {!striche.length && (
          <span className="pointer-events-none absolute inset-x-0 top-[30%] text-center text-sm text-slate-400">Hier unterschreiben</span>
        )}
      </div>
      <button type="button" onClick={loeschen} disabled={!striche.length} className="inline-flex min-h-[36px] w-fit items-center gap-1.5 text-sm font-semibold text-accent disabled:opacity-40">
        <Eraser size={15} aria-hidden="true" />
        Unterschrift löschen und neu zeichnen
      </button>
    </div>
  );
}
