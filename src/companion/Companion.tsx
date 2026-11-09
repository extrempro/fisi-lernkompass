import { useEffect, useRef, useState } from 'react';
import { Minus } from 'lucide-react';
import { useEinstellungen } from '../api';
import { lies, merke } from '../lib/merken';
import { hoere, hoereStumm, istStumm, melde } from './bus';
import { Hoodie } from './Hoodie';
import { anzeigeDauer, reagiere, START_ZUSTAND, vorname, type Haeufigkeit, type Licht, type Pose } from './logik';
import { klartext } from './saetze';

/** Nach so viel sichtbarer Zeit am Stück schlägt der Hoodie eine Pause vor */
const PAUSE_NACH_MS = 45 * 60_000;
/** Wie lange ein Ausdruck gehalten wird, bevor er wieder ruhig schaut */
const AUSDRUCK_MS = 3500;

let begruesst = false;

/** Der Companion unten links: reagiert auf Ereignisse aus src/companion/bus.ts. */
export function Companion() {
  const { data: e } = useEinstellungen();
  const an = !!e && e.companion !== 'aus';
  const haeufigkeit = (e?.companion_haeufigkeit ?? 'normal') as Haeufigkeit;
  const name = vorname(e?.azubi_name ?? '');

  const [stumm, setStumm] = useState(istStumm);
  const [klein, setKlein] = useState(() => lies('hoodie-klein') === 'ja');
  const [pose, setPose] = useState<Pose>('ruhe');
  const [licht, setLicht] = useState<Licht>('neutral');
  const [blase, setBlase] = useState<{ text: string; nr: number } | null>(null);

  const zustand = useRef(START_ZUSTAND);
  const aktuell = useRef({ an, haeufigkeit, name, klein });
  aktuell.current = { an, haeufigkeit, name, klein };

  useEffect(() => hoereStumm(() => setStumm(istStumm())), []);

  // Auf Ereignisse reagieren
  useEffect(() => {
    let ausdruckZeit: ReturnType<typeof setTimeout> | undefined;
    let blasenZeit: ReturnType<typeof setTimeout> | undefined;
    const aus = hoere((m) => {
      const a = aktuell.current;
      if (!a.an || istStumm()) return;
      const { zustand: z, reaktion } = reagiere(zustand.current, m, new Date(), a.haeufigkeit, a.name);
      zustand.current = z;
      if (a.klein && m.art !== 'klick') return;
      setPose(reaktion.pose);
      setLicht(reaktion.licht);
      clearTimeout(ausdruckZeit);
      ausdruckZeit = setTimeout(() => {
        setPose('ruhe');
        setLicht('neutral');
      }, AUSDRUCK_MS);
      if (reaktion.text) {
        const text = reaktion.text;
        setBlase((b) => ({ text, nr: (b?.nr ?? 0) + 1 }));
        clearTimeout(blasenZeit);
        blasenZeit = setTimeout(() => setBlase(null), anzeigeDauer(text));
      }
    });
    return () => {
      aus();
      clearTimeout(ausdruckZeit);
      clearTimeout(blasenZeit);
    };
  }, []);

  // Begrüßung, sobald die Einstellungen da sind – einmal pro Seitenaufruf
  useEffect(() => {
    if (!an || begruesst) return;
    begruesst = true;
    const t = setTimeout(() => melde('start'), 1200);
    return () => clearTimeout(t);
  }, [an]);

  // Pausen-Hinweis nach 45 Minuten, in denen die App sichtbar war
  useEffect(() => {
    if (!an) return;
    let sichtbar = 0;
    let letzte = Date.now();
    const t = setInterval(() => {
      const jetzt = Date.now();
      if (document.visibilityState === 'visible') sichtbar += jetzt - letzte;
      letzte = jetzt;
      if (sichtbar >= PAUSE_NACH_MS) {
        sichtbar = 0;
        melde('pause');
      }
    }, 60_000);
    return () => clearInterval(t);
  }, [an]);

  if (!an || stumm) return null;

  const setzeKlein = (k: boolean) => {
    setKlein(k);
    merke('hoodie-klein', k ? 'ja' : 'nein');
    if (k) setBlase(null);
  };

  if (klein) {
    return (
      <button
        type="button"
        onClick={() => setzeKlein(false)}
        aria-label="Hoodie einblenden"
        title="Hoodie einblenden"
        className="fixed bottom-6 left-4 z-20 h-12 w-12 overflow-hidden rounded-full bg-[#0B0B0D] shadow-[0_6px_20px_rgba(15,23,42,0.35)] ring-1 ring-white/10 print:hidden"
      >
        <Hoodie pose="ruhe" licht="neutral" klein />
      </button>
    );
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-20 flex max-w-[calc(100vw-6rem)] flex-col items-start gap-2 print:hidden">
      <div role="status" aria-live="polite" className="sr-only">
        {blase ? `Hoodie: ${klartext(blase.text)}` : ''}
      </div>
      {blase && (
        <button
          key={blase.nr}
          type="button"
          onClick={() => setBlase(null)}
          aria-label="Sprechblase ausblenden"
          title="Ausblenden"
          className="hoodie-blase pointer-events-auto max-w-[260px] rounded-lg border border-[#2F3A50] bg-[#060607] px-3 py-2 text-left font-mono text-[13px] leading-snug text-[#D3DAE8] shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
        >
          <span aria-hidden="true">
            &gt; {blase.text}
            <span className="hoodie-cursor">_</span>
          </span>
        </button>
      )}
      <div className="group pointer-events-auto relative">
        <button
          type="button"
          onClick={() => melde('klick')}
          aria-label="Hoodie – klick für einen Spruch"
          title="Hoodie"
          className="block h-16 w-16 overflow-hidden rounded-2xl bg-[#0B0B0D] shadow-[0_6px_20px_rgba(15,23,42,0.35)] ring-1 ring-white/10 sm:h-[84px] sm:w-[84px]"
        >
          <Hoodie pose={pose} licht={licht} />
        </button>
        <button
          type="button"
          onClick={() => setzeKlein(true)}
          aria-label="Hoodie verkleinern"
          title="Verkleinern"
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-card text-muted opacity-0 shadow transition-opacity focus:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <Minus size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
