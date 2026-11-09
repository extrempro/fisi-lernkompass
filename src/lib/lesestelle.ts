import { useEffect, useState } from 'react';

/**
 * Welcher Abschnitt wird gerade gelesen? Der letzte, dessen Oberkante die Lesehöhe
 * (knapp unter der Navigation) erreicht hat. Am Seitenende der letzte sichtbare.
 */
export function useAktiverAbschnitt(ids: string[]): string | null {
  const [aktiv, setAktiv] = useState<string | null>(null);
  const schluessel = ids.join('|');
  useEffect(() => {
    if (!ids.length || typeof window === 'undefined') return;
    let frame = 0;
    const pruefe = () => {
      frame = 0;
      let akt: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) akt = id;
      }
      const amEnde = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
      if (amEnde) {
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top < window.innerHeight - 120) akt = id;
        }
      }
      setAktiv(akt);
    };
    const anstossen = () => {
      if (!frame) frame = requestAnimationFrame(pruefe);
    };
    anstossen();
    window.addEventListener('scroll', anstossen, { passive: true });
    window.addEventListener('resize', anstossen);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', anstossen);
      window.removeEventListener('resize', anstossen);
    };
  }, [schluessel]);
  return aktiv;
}
