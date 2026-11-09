import { useState } from 'react';
import { lies, merke } from '../lib/merken';
import { SubnetzBits } from '../werkzeuge/SubnetzBits';
import { RaidSimulator } from '../werkzeuge/RaidSimulator';
import { BackupPlaner } from '../werkzeuge/BackupPlaner';
import { FirewallPruefer } from '../werkzeuge/FirewallPruefer';
import { Netzplan } from '../werkzeuge/Netzplan';
import { JoinAnsicht } from '../werkzeuge/JoinAnsicht';
import { LinuxRechte } from '../werkzeuge/LinuxRechte';
import { CronErklaerer } from '../werkzeuge/CronErklaerer';
import { Nutzwertanalyse } from '../werkzeuge/Nutzwertanalyse';
import { WERKZEUGE, type WerkzeugId } from '../lib/werkzeugListe';

const ANSICHT: Record<WerkzeugId, () => JSX.Element> = {
  subnetz: SubnetzBits,
  raid: RaidSimulator,
  backup: BackupPlaner,
  firewall: FirewallPruefer,
  netzplan: Netzplan,
  join: JoinAnsicht,
  rechte: LinuxRechte,
  cron: CronErklaerer,
  nutzwert: Nutzwertanalyse,
};

/** Interaktive Werkzeuge zum Ausprobieren typischer Prüfungsthemen. */
export function Werkzeuge() {
  const [id, setIdRoh] = useState<WerkzeugId>(() => {
    const x = lies('werkzeug');
    return WERKZEUGE.some((w) => w.id === x) ? (x as WerkzeugId) : WERKZEUGE[0].id;
  });
  const setId = (x: WerkzeugId) => {
    setIdRoh(x);
    merke('werkzeug', x);
  };
  const Ansicht = ANSICHT[id];
  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="Werkzeug wählen" className="flex flex-wrap gap-1.5">
        {WERKZEUGE.map((w) => (
          <button
            key={w.id}
            type="button"
            aria-pressed={w.id === id}
            onClick={() => setId(w.id)}
            className={`min-h-[40px] rounded-lg border px-3 text-sm font-semibold transition ${w.id === id ? 'border-accent bg-accent text-on-accent' : 'border-line bg-card hover:bg-chip'}`}
          >
            {w.titel}
          </button>
        ))}
      </div>
      <Ansicht key={id} />
    </div>
  );
}
