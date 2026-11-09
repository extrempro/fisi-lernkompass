import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Textfeld, das selbst speichert: kurz nach dem Tippen und beim Verlassen. */
export function TextFeld({
  id,
  label,
  wert,
  platzhalter,
  onSpeichern,
  className = '',
  fokus = false,
}: {
  id: string;
  label: ReactNode;
  wert: string;
  platzhalter?: string;
  onSpeichern: (text: string) => void;
  className?: string;
  /** beim Erscheinen direkt in das Feld springen */
  fokus?: boolean;
}) {
  const [text, setText] = useState(wert);
  const [status, setStatus] = useState<'' | 'speichert' | 'gespeichert'>('');
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const zuletzt = useRef(wert);

  // Wert von außen übernehmen (z. B. nach Import), solange nicht getippt wird
  useEffect(() => {
    if (!timer.current) {
      setText(wert);
      zuletzt.current = wert;
    }
  }, [wert]);

  const speichere = (t: string) => {
    clearTimeout(timer.current);
    timer.current = undefined;
    if (t === zuletzt.current) {
      setStatus((s) => (s === 'speichert' ? '' : s));
      return;
    }
    zuletzt.current = t;
    onSpeichern(t);
    setStatus('gespeichert');
  };

  // Wird das Feld ausgeblendet (z. B. Unterthema zugeklappt), während noch getippt wird: sofort speichern
  const offen = useRef({ text, onSpeichern });
  offen.current = { text, onSpeichern };
  useEffect(
    () => () => {
      if (!timer.current) return;
      clearTimeout(timer.current);
      timer.current = undefined;
      if (offen.current.text !== zuletzt.current) offen.current.onSpeichern(offen.current.text);
    },
    [],
  );

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <textarea
        id={id}
        rows={2}
        autoFocus={fokus}
        value={text}
        placeholder={platzhalter}
        maxLength={5000}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          setStatus('speichert');
          clearTimeout(timer.current);
          timer.current = setTimeout(() => speichere(t), 700);
        }}
        onBlur={() => speichere(text)}
        className="resize-y rounded-lg border border-line bg-card px-3 py-2 text-ink"
      />
      <span className="min-h-[1rem] text-xs text-muted" aria-live="polite">
        {status === 'speichert' ? 'Wird gespeichert …' : status === 'gespeichert' ? 'Gespeichert' : ''}
      </span>
    </div>
  );
}
