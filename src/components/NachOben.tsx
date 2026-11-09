import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/** Schwebender Knopf, der nach etwas Scrollen erscheint und zurück zum Seitenanfang bringt. */
export function NachOben() {
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    const pruefe = () => setSichtbar(window.scrollY > 600);
    pruefe();
    window.addEventListener('scroll', pruefe, { passive: true });
    return () => window.removeEventListener('scroll', pruefe);
  }, []);

  if (!sichtbar) return null;
  const sanft = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: sanft ? 'smooth' : 'auto' })}
      aria-label="Nach oben"
      title="Nach oben"
      className="fixed bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_6px_20px_rgba(15,23,42,0.25)] transition hover:opacity-90"
    >
      <ArrowUp size={22} aria-hidden="true" />
    </button>
  );
}
