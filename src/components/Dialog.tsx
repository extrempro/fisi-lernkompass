import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Modales Fenster über der Seite. Schließt mit Esc, Klick daneben oder dem X;
 * der Fokus bleibt im Fenster und kehrt danach zum auslösenden Element zurück.
 */
export function Dialog({
  titel,
  onSchliessen,
  children,
  breite = 560,
}: {
  titel: string;
  onSchliessen: () => void;
  children: ReactNode;
  breite?: number;
}) {
  const fenster = useRef<HTMLDivElement>(null);
  const schliessen = useRef(onSchliessen);
  schliessen.current = onSchliessen;

  useEffect(() => {
    const vorher = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Erstes Eingabefeld fokussieren, sonst das Fenster selbst
    const erstes = fenster.current?.querySelector<HTMLElement>('[data-autofokus]') ?? fenster.current;
    erstes?.focus();

    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        schliessen.current();
        return;
      }
      if (e.key !== 'Tab' || !fenster.current) return;
      const fokusierbar = [
        ...fenster.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      ].filter((el) => !el.hasAttribute('disabled'));
      if (!fokusierbar.length) return;
      const erstesEl = fokusierbar[0];
      const letztesEl = fokusierbar[fokusierbar.length - 1];
      if (e.shiftKey && document.activeElement === erstesEl) {
        e.preventDefault();
        letztesEl.focus();
      } else if (!e.shiftKey && document.activeElement === letztesEl) {
        e.preventDefault();
        erstesEl.focus();
      }
    };
    window.addEventListener('keydown', taste, true);
    return () => {
      window.removeEventListener('keydown', taste, true);
      document.body.style.overflow = overflow;
      vorher?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(15,23,42,0.6)] p-3 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onSchliessen();
      }}
    >
      <div
        ref={fenster}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-titel"
        tabIndex={-1}
        className="relative flex w-full flex-col gap-4 rounded-xl border border-line bg-card p-5 shadow-2xl outline-none sm:p-6"
        style={{ maxWidth: breite }}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="dialog-titel" className="pt-1.5 text-xl font-semibold leading-snug">
            {titel}
          </h2>
          <button
            type="button"
            onClick={onSchliessen}
            aria-label="Schließen"
            className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-chip hover:text-ink"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
