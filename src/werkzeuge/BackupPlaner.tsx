import { useState } from 'react';
import { sicherungsInhalt, TAGE, wiederherstellung, type SicherungsArt } from '../lib/werkzeuge';
import { Ergebnis, Kopf, Merke } from './teile';

const ARTEN: [SicherungsArt, string, string][] = [
  ['voll', 'Voll', 'bg-accent text-on-accent'],
  ['inkr', 'Inkr.', 'bg-seg-gelb text-seg-gelb-ink'],
  ['diff', 'Diff.', 'bg-seg-gruen text-seg-gruen-ink'],
  ['keine', '–', 'bg-chip text-muted'],
];
const VORLAGEN: [string, SicherungsArt[]][] = [
  ['Voll + inkrementell', ['voll', 'inkr', 'inkr', 'inkr', 'inkr', 'keine', 'keine']],
  ['Voll + differenziell', ['voll', 'diff', 'diff', 'diff', 'diff', 'keine', 'keine']],
  ['Gemischt', ['voll', 'diff', 'inkr', 'diff', 'diff', 'keine', 'keine']],
];

/** Backup-Planer: Wochenplan festlegen, Ausfalltag wählen, benötigte Sicherungen sehen. */
export function BackupPlaner() {
  const [plan, setPlan] = useState<SicherungsArt[]>(VORLAGEN[2][1]);
  const [ausfall, setAusfall] = useState(4);
  const inhalt = sicherungsInhalt(plan);
  const w = wiederherstellung(plan, ausfall);
  const art = (a: SicherungsArt) => ARTEN.find((x) => x[0] === a)!;
  const weiter = (t: number) => setPlan((p) => p.map((x, i) => (i === t ? ARTEN[(ARTEN.findIndex((y) => y[0] === x) + 1) % ARTEN.length][0] : x)));
  const umfang = (t: number) => {
    const s = inhalt[t];
    if (s.art === 'keine') return '';
    if (s.art === 'voll') return 'alles';
    return s.ab === t ? `Änderungen ${TAGE[t]}` : `Änderungen ${TAGE[s.ab!]}–${TAGE[t]}`;
  };

  return (
    <div className="flex flex-col gap-5">
      <Kopf titel="Backup – Wiederherstellung planen" text="Leg für jeden Tag die Sicherungsart fest (anklicken wechselt) und wähle, wann der Server ausfällt." />
      <div className="flex flex-wrap gap-2">
        {VORLAGEN.map(([t, p]) => (
          <button key={t} type="button" className="btn-sekundaer" onClick={() => setPlan(p)}>
            {t}
          </button>
        ))}
      </div>

      <div className="relative overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">Wochenplan der Sicherungen</caption>
          <thead>
            <tr>
              <th scope="col" className="px-3 py-2 text-left">
                <span className="sr-only">Zeile</span>
              </th>
              {TAGE.map((t, i) => (
                <th key={t} scope="col" className={`px-2 py-2 text-center ${i === ausfall ? 'text-seg-rot-ink' : ''}`}>
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-line">
              <th scope="row" className="px-3 py-2 text-left font-semibold">
                Sicherung (abends)
              </th>
              {plan.map((a, t) => (
                <td key={t} className="px-1 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => weiter(t)}
                    aria-label={`${TAGE[t]}: ${a === 'keine' ? 'keine Sicherung' : art(a)[1]} – klicken zum Wechseln`}
                    className={`min-h-[36px] w-full rounded-lg px-2 text-xs font-semibold ${art(a)[2]} ${w.kette.includes(t) ? 'ring-2 ring-ink ring-offset-2 ring-offset-card' : ''}`}
                  >
                    {art(a)[1]}
                  </button>
                </td>
              ))}
            </tr>
            <tr className="border-t border-line">
              <th scope="row" className="px-3 py-2 text-left font-semibold">
                enthält
              </th>
              {plan.map((_, t) => (
                <td key={t} className="px-1 py-2 text-center text-xs text-muted">
                  {umfang(t)}
                </td>
              ))}
            </tr>
            <tr className="border-t border-line">
              <th scope="row" className="px-3 py-2 text-left font-semibold">
                Archivbit danach
              </th>
              {inhalt.map((s, t) => (
                <td key={t} className="px-1 py-2 text-center text-xs">
                  {s.art === 'keine' ? '' : s.setztZurueck ? 'gelöscht' : 'bleibt'}
                </td>
              ))}
            </tr>
            <tr className="border-t border-line">
              <th scope="row" className="px-3 py-2 text-left font-semibold">
                Ausfall nach
              </th>
              {TAGE.map((t, i) => (
                <td key={t} className="px-1 py-2 text-center">
                  <input type="radio" name="ausfall" aria-label={`Ausfall nach ${t}`} className="h-4 w-4 accent-[var(--c-accent)]" checked={ausfall === i} onChange={() => setAusfall(i)} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <Ergebnis ton={w.moeglich ? 'gut' : 'schlecht'} titel={w.moeglich ? `${w.kette.length} Sicherung${w.kette.length === 1 ? '' : 'en'} einspielen` : 'Keine vollständige Wiederherstellung möglich'}>
        {w.kette.length > 0 && (
          <ol className="my-1 flex flex-wrap gap-x-2 gap-y-1">
            {w.kette.map((t, i) => (
              <li key={t}>
                {i + 1}. {art(plan[t])[1].replace('Inkr.', 'Inkrementell').replace('Diff.', 'Differenziell').replace('Voll', 'Vollsicherung')} {TAGE[t]}
                {i < w.kette.length - 1 && ' →'}
              </li>
            ))}
          </ol>
        )}
        <p>{w.text}</p>
      </Ergebnis>
      <Merke>
        Vollsicherung und inkrementelle Sicherung löschen das Archivbit, die differenzielle lässt es stehen. Deshalb enthält eine inkrementelle Sicherung alles
        seit der letzten Voll- <em>oder</em> inkrementellen Sicherung – auch wenn dazwischen differenziell gesichert wurde.
      </Merke>
    </div>
  );
}
