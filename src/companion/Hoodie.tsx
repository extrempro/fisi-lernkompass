import type { Licht, Pose } from './logik';

export const LICHT_FARBE: Record<Licht, string> = {
  neutral: '#B4C0D8',
  gruen: '#97C459',
  gelb: '#EF9F27',
  rot: '#E24B4A',
  blau: '#85B7EB',
};

const STOFF = '#16161A';

/** Augen im Schatten der Kapuze – je Ausdruck eine Form, gezeichnet um die Augenhöhe y = 12 */
function Augen({ pose, farbe }: { pose: Pose; farbe: string }) {
  const linie = { fill: 'none', stroke: farbe, strokeWidth: 3.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (pose) {
    case 'freut':
      return <path d="M-17 15 L-10 7 L-3 15 M3 15 L10 7 L17 15" {...linie} />;
    case 'autsch':
      return <path d="M-17 6 L-6 12 L-17 18 M17 6 L6 12 L17 18" {...linie} />;
    case 'denkt':
      return (
        <>
          <circle cx="-10" cy="12" r="4" fill={farbe} />
          <path d="M4 8 L16 5" {...linie} />
          <circle cx="10" cy="14" r="2.5" fill={farbe} />
        </>
      );
    case 'muede':
      return <path d="M-17 13 L-5 13 M5 13 L17 13" {...linie} />;
    case 'zwinkert':
      return (
        <>
          <ellipse cx="-10" cy="12" rx="3.4" ry="4.4" fill={farbe} />
          <path d="M4 13 Q10 7 16 13" {...linie} />
        </>
      );
    default:
      return (
        <g className="hoodie-blinzeln">
          <ellipse cx="-10" cy="12" rx="3.4" ry="4.4" fill={farbe} />
          <ellipse cx="10" cy="12" rx="3.4" ry="4.4" fill={farbe} />
        </g>
      );
  }
}

/**
 * Die Figur: Kapuzenpulli, Gesicht im Schatten, nur die Augen leuchten.
 * Stimmung über Augenform, Kopfhaltung und Lichtfarbe. Eigenes Motiv – bewusst ohne Maske
 * oder Bezug auf bekannte Figuren.
 */
export function Hoodie({ pose, licht, klein = false }: { pose: Pose; licht: Licht; klein?: boolean }) {
  const farbe = LICHT_FARBE[licht];
  const kopfDrehung = pose === 'denkt' ? 'rotate(-8)' : pose === 'muede' ? 'translate(0 10) rotate(12)' : undefined;
  const bewegung = pose === 'freut' ? 'hoodie-hops' : pose === 'autsch' ? 'hoodie-wackeln' : 'hoodie-atmen';
  return (
    <svg viewBox="-112 -90 224 224" className="h-full w-full" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="hoodie-schein" cx="50%" cy="42%" r="60%">
          <stop offset="0" stopColor={farbe} stopOpacity={klein ? 0.25 : 0.38} className="hoodie-licht" />
          <stop offset="1" stopColor={farbe} stopOpacity="0" className="hoodie-licht" />
        </radialGradient>
      </defs>
      <rect x="-112" y="-90" width="224" height="224" fill="url(#hoodie-schein)" />
      <g className={bewegung}>
        {/* Körper mit Kordeln */}
        <path d="M-42 44 Q-80 56 -90 100 L-94 134 L94 134 L90 100 Q80 56 42 44 Z" fill={STOFF} stroke={farbe} strokeOpacity="0.25" strokeWidth="2" className="hoodie-licht" />
        <path d="M-8 52 L-10 84 M8 52 L10 84" stroke="#2A2A30" strokeWidth="2" />
        {/* Kopf mit Kapuze, Gesicht im Schatten */}
        <g transform={kopfDrehung}>
          <path d="M0 -52 Q-40 -48 -46 0 Q-50 30 -42 50 L42 50 Q50 30 46 0 Q40 -48 0 -52 Z" fill="#1A1A1F" />
          <path d="M0 -24 Q-26 -20 -27 10 Q-26 38 0 50 Q26 38 27 10 Q26 -20 0 -24 Z" fill="#020203" />
          <path d="M0 -52 L0 -24" stroke="#24242A" strokeWidth="1.5" />
          <path d="M-46 0 Q-40 -48 0 -52 Q40 -48 46 0" fill="none" stroke={farbe} strokeWidth="3" opacity="0.6" className="hoodie-licht" />
          {/* schwacher Schein um die Augen */}
          <ellipse cx="0" cy="12" rx="24" ry="11" fill={farbe} opacity="0.1" />
          <g transform="translate(0 12) scale(1.3) translate(0 -12)">
            <Augen pose={pose} farbe={farbe} />
          </g>
        </g>
      </g>
    </svg>
  );
}
