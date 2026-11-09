import { useState } from 'react';
import { HardDrive } from 'lucide-react';
import { RAID_INFO, raidBloecke, raidZustand, type RaidLevel } from '../lib/werkzeuge';
import { Ergebnis, Kopf, Merke, Umschalter } from './teile';

const LEVEL = (Object.keys(RAID_INFO) as RaidLevel[]).map((k) => [k, RAID_INFO[k].name] as const);

/** RAID-Ausfall-Simulator: Platten anklicken, Zustand und Blockbelegung sehen. */
export function RaidSimulator() {
  const [level, setLevelRoh] = useState<RaidLevel>('5');
  const [n, setN] = useState(4);
  const [groesse, setGroesse] = useState(4);
  const [aus, setAus] = useState<number[]>([]);
  const info = RAID_INFO[level];
  const z = raidZustand(level, n, aus);
  const bloecke = raidBloecke(level, n);

  const setLevel = (l: RaidLevel) => {
    setLevelRoh(l);
    const min = RAID_INFO[l].min;
    setN((x) => {
      let y = Math.max(x, min);
      if (RAID_INFO[l].gerade && y % 2) y++;
      return y;
    });
    setAus([]);
  };
  const anzahlen = Array.from({ length: 8 - info.min + 1 }, (_, i) => info.min + i).filter((x) => !info.gerade || x % 2 === 0);
  const umschalten = (d: number) => setAus((a) => (a.includes(d) ? a.filter((x) => x !== d) : [...a, d]));

  return (
    <div className="flex flex-col gap-5">
      <Kopf titel="RAID – Ausfall simulieren" text="Klick auf eine Platte, um sie ausfallen zu lassen. Wie viele verträgt das Array?" />
      <div className="flex flex-wrap items-end gap-4">
        <Umschalter label="RAID-Level" wert={level} optionen={LEVEL} onWahl={setLevel} />
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Platten</span>
          <select
            className="eingabe"
            value={n}
            onChange={(e) => {
              setN(Number(e.target.value));
              setAus([]);
            }}
          >
            {anzahlen.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">je Platte (TB)</span>
          <input type="number" min={1} className="eingabe w-24" value={groesse} onChange={(e) => setGroesse(Math.max(1, Number(e.target.value) || 1))} />
        </label>
      </div>
      <p className="text-sm text-muted">{info.prinzip}</p>

      <div className="relative overflow-x-auto">
        <div className="flex min-w-fit gap-3">
          {bloecke.map((platte, d) => {
            const kaputt = aus.includes(d);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={kaputt}
                aria-label={`Platte ${d + 1} ${kaputt ? 'ausgefallen – zum Reparieren klicken' : 'läuft – zum Ausfallen klicken'}`}
                onClick={() => umschalten(d)}
                className={`flex w-[84px] shrink-0 flex-col gap-1.5 rounded-xl border-2 p-2 text-left transition ${
                  kaputt ? 'border-seg-rot-ink bg-seg-rot' : 'border-line bg-card hover:border-accent'
                } ${level === '10' && d % 2 === 1 ? '-ml-1' : ''}`}
              >
                <span className={`flex items-center gap-1 text-xs font-semibold ${kaputt ? 'text-seg-rot-ink' : 'text-muted'}`}>
                  <HardDrive size={14} aria-hidden="true" />
                  {kaputt ? 'defekt' : `Platte ${d + 1}`}
                </span>
                {platte.map((b, s) => (
                  <span
                    key={s}
                    className={`rounded-md px-2 py-1 text-center font-mono text-xs ${kaputt ? 'bg-card text-muted line-through opacity-60' : b.art === 'paritaet' ? 'bg-seg-gelb text-seg-gelb-ink' : b.art === 'spiegel' ? 'bg-accent-soft text-accent' : 'bg-chip text-ink'}`}
                  >
                    {b.text}
                  </span>
                ))}
                {level === '10' && <span className="text-center text-[11px] text-muted">Paar {Math.floor(d / 2) + 1}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <span>
          <span className="mr-1 inline-block h-3 w-3 rounded-sm bg-chip align-middle" aria-hidden="true" />
          Datenblock
        </span>
        {(level === '5' || level === '6') && (
          <span>
            <span className="mr-1 inline-block h-3 w-3 rounded-sm bg-seg-gelb align-middle" aria-hidden="true" />
            Parität ({level === '6' ? 'p und q' : 'p'})
          </span>
        )}
        {(level === '1' || level === '10') && (
          <span>
            <span className="mr-1 inline-block h-3 w-3 rounded-sm bg-accent-soft align-middle" aria-hidden="true" />
            Spiegelkopie
          </span>
        )}
      </div>

      <Ergebnis
        ton={z.status === 'ok' ? 'gut' : z.status === 'degradiert' ? 'warn' : 'schlecht'}
        titel={z.status === 'ok' ? 'Läuft' : z.status === 'degradiert' ? `Degradiert – ${aus.length} von ${n} Platten ausgefallen` : 'Datenverlust'}
      >
        <p>{z.text}</p>
      </Ergebnis>

      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-bg px-4 py-3">
          <dt className="text-muted">Brutto</dt>
          <dd className="text-lg font-semibold">{n * groesse} TB</dd>
        </div>
        <div className="rounded-lg bg-bg px-4 py-3">
          <dt className="text-muted">Nutzbar</dt>
          <dd className="text-lg font-semibold">
            {z.nutzbar * groesse} TB <span className="text-sm font-normal text-muted">({Math.round((z.nutzbar / n) * 100)} %)</span>
          </dd>
        </div>
        <div className="rounded-lg bg-bg px-4 py-3">
          <dt className="text-muted">Verträgt sicher</dt>
          <dd className="text-lg font-semibold">
            {z.toleranz} {z.toleranz === 1 ? 'Ausfall' : 'Ausfälle'}
            {level === '10' && <span className="block text-sm font-normal text-muted">bis zu {n / 2}, wenn es verschiedene Paare trifft</span>}
          </dd>
        </div>
      </dl>
      <Merke>RAID ersetzt kein Backup: Es schützt vor Plattenausfällen, nicht vor Löschen, Ransomware, Brand oder Diebstahl.</Merke>
    </div>
  );
}
