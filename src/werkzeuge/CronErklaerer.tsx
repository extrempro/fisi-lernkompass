import { useMemo, useState } from 'react';
import { cronNaechste, cronParsen } from '../lib/werkzeuge';
import { Ergebnis, Kopf, Merke } from './teile';

const BEISPIELE: [string, string][] = [
  ['30 2 * * 1-5', 'Backup werktags'],
  ['*/15 * * * *', 'Monitoring'],
  ['0 3 1 * *', 'Monatsbericht'],
  ['0 8,12,18 * * *', 'dreimal täglich'],
  ['0 22 * * fri', 'Freitagabend'],
  ['@reboot', 'beim Start'],
];
const FELDER = ['Minute', 'Stunde', 'Tag', 'Monat', 'Wochentag'];
const BEREICH = ['0–59', '0–23', '1–31', '1–12', '0–7 (0 und 7 = So)'];

/** Cron-Ausdrücke erklären und die nächsten Ausführungen anzeigen. */
export function CronErklaerer() {
  const [ausdruck, setAusdruck] = useState('30 2 * * 1-5');
  const c = useMemo(() => cronParsen(ausdruck), [ausdruck]);
  const naechste = useMemo(() => cronNaechste(c, new Date(), 5), [c]);
  const teile = ausdruck.trim().split(/\s+/);

  return (
    <div className="flex flex-col gap-5">
      <Kopf titel="Cron – Zeitpläne lesen" text="Gib einen Cron-Ausdruck ein und lies, wann der Job läuft." />
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Ausdruck</span>
        <input className="eingabe font-mono text-lg" value={ausdruck} onChange={(e) => setAusdruck(e.target.value)} aria-invalid={!!c.fehler} spellCheck={false} />
      </label>
      <div className="flex flex-wrap gap-2">
        {BEISPIELE.map(([a, t]) => (
          <button key={a} type="button" className="btn-sekundaer" onClick={() => setAusdruck(a)}>
            <span className="font-mono">{a}</span>
            <span className="text-muted">{t}</span>
          </button>
        ))}
      </div>

      {!c.neustart && (
        <div className="relative overflow-x-auto">
          <div className="grid min-w-[520px] grid-cols-5 gap-2 text-center">
            {FELDER.map((f, i) => (
              <div key={f} className="rounded-lg border border-line px-2 py-2">
                <div className="font-mono text-lg font-semibold text-accent">{teile.length === 5 ? teile[i] : '?'}</div>
                <div className="text-sm font-semibold">{f}</div>
                <div className="text-xs text-muted">{BEREICH[i]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {c.fehler ? (
        <Ergebnis ton="schlecht" titel="Ungültiger Ausdruck">
          <p>{c.fehler}</p>
        </Ergebnis>
      ) : (
        <Ergebnis ton="gut" titel={c.text.charAt(0).toUpperCase() + c.text.slice(1)}>
          {naechste.length > 0 && (
            <>
              <p className="mt-1">Nächste Ausführungen:</p>
              <ul className="mt-1 flex flex-col gap-0.5 font-mono">
                {naechste.map((d) => (
                  <li key={d.getTime()}>{d.toLocaleString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</li>
                ))}
              </ul>
            </>
          )}
        </Ergebnis>
      )}
      <Merke>
        <p>
          Syntax: <code>*</code> = jeder Wert, <code>1-5</code> = Bereich, <code>1,15</code> = Liste, <code>*/10</code> = Schrittweite. Einrichten mit{' '}
          <code>crontab -e</code>, anzeigen mit <code>crontab -l</code>.
        </p>
        <p className="mt-1">Stolperfalle: Sind Tag und Wochentag beide eingeschränkt, reicht es, wenn <em>einer</em> passt – „0 0 13 * 5“ läuft an jedem 13. und an jedem Freitag.</p>
      </Merke>
    </div>
  );
}
