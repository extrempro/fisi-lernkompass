import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemenfelder, useTraining } from '../api';
import { heuteIso } from '../lib/datum';
import { alleKarten, faellige, note } from '../lib/training';
import { FehlerHinweis, Laedt } from '../components/ui';
import { Karteikarten } from '../ueben/Karteikarten';
import { Quiz } from '../ueben/Quiz';
import { Simulation } from '../ueben/Simulation';
import { Rechner } from '../ueben/Rechner';
import { Werkzeuge } from '../ueben/Werkzeuge';

const REITER = [
  ['karten', 'Karteikarten'],
  ['quiz', 'Quiz'],
  ['simulation', 'Prüfungssimulation'],
  ['rechner', 'Rechner'],
  ['werkzeuge', 'Werkzeuge'],
] as const;
type Reiter = (typeof REITER)[number][0];

/** Üben: Karteikarten (Leitner), Quiz und Prüfungssimulation – alles aus den Inhalten der Cheatsheets. */
export function Ueben() {
  const { data: felder, error, isLoading } = useThemenfelder();
  const { data: training, error: tFehler, isLoading: tLaedt } = useTraining();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const reiter: Reiter = (REITER.find(([k]) => `#${k}` === hash)?.[0] ?? 'karten') as Reiter;

  const karten = useMemo(() => (felder ? alleKarten(felder) : []), [felder]);
  const stand = useMemo(() => new Map((training?.karten ?? []).map((k) => [k.id, k])), [training]);

  if (isLoading || tLaedt) return <Laedt />;
  if (error || tFehler || !felder || !training) return <FehlerHinweis fehler={error ?? tFehler} />;

  const faellig = faellige(karten, stand, heuteIso()).length;
  const sicher = karten.filter((k) => (stand.get(k.id)?.fach ?? 0) >= 3).length;
  const letzte = training.versuche[0];

  return (
    <>
      <header>
        <h1 className="text-[32px] font-bold leading-tight">Üben</h1>
        <p className="text-sm text-muted">Karteikarten, Quiz und Prüfungssimulation aus den Inhalten deiner Cheatsheets – dazu Rechner für die typischen Rechenaufgaben und Werkzeuge zum Ausprobieren.</p>
      </header>

      <section aria-label="Stand" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kachel wert={faellig} text="Karten heute fällig" />
        <Kachel wert={`${sicher}/${karten.length}`} text="Karten sicher (ab Fach 3)" />
        <Kachel wert={training.karten.filter((k) => k.zuletzt === heuteIso()).length} text="heute geübt" />
        <Kachel
          wert={letzte ? `${Math.round((letzte.richtig / letzte.fragen) * 100)} %` : '–'}
          text={letzte ? `letzte Simulation (${note(Math.round((letzte.richtig / letzte.fragen) * 100)).text})` : 'noch keine Simulation'}
        />
      </section>

      <section className="karte flex flex-col gap-5 p-5 sm:p-6">
        <div role="tablist" aria-label="Übungsart" className="flex flex-wrap gap-1 border-b border-line">
          {REITER.map(([k, t]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={reiter === k}
              onClick={() => navigate(`/ueben#${k}`)}
              className={`-mb-px min-h-[44px] border-b-2 px-4 text-sm font-semibold transition ${
                reiter === k ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div role="tabpanel">
          {reiter === 'karten' && <Karteikarten felder={felder} karten={karten} stand={stand} />}
          {reiter === 'quiz' && <Quiz felder={felder} karten={karten} stand={stand} />}
          {reiter === 'simulation' && <Simulation felder={felder} karten={karten} stand={stand} versuche={training.versuche} />}
          {reiter === 'rechner' && <Rechner />}
          {reiter === 'werkzeuge' && <Werkzeuge />}
        </div>
      </section>
    </>
  );
}

function Kachel({ wert, text }: { wert: number | string; text: string }) {
  return (
    <div className="karte flex flex-col gap-0.5 p-4">
      <span className="text-2xl font-bold leading-tight">{wert}</span>
      <span className="text-sm text-muted">{text}</span>
    </div>
  );
}
