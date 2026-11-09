import { useState } from 'react';
import { rechteAusOktal, rechteSymbolisch, rechteZuOktal, umaskRechte, type Rechte } from '../lib/werkzeuge';
import { Kopf, Merke } from './teile';

const WER = ['Besitzer (u)', 'Gruppe (g)', 'Andere (o)'];
const WAS = [
  ['r', 'lesen', 4],
  ['w', 'schreiben', 2],
  ['x', 'ausführen', 1],
] as const;

/** chmod-Rechner: Häkchen ↔ Oktal ↔ symbolisch, dazu Sonderrechte und umask. */
export function LinuxRechte() {
  const [r, setR] = useState<Rechte>(() => rechteAusOktal('754')!);
  const [oktal, setOktal] = useState('754');
  const [verz, setVerz] = useState(false);
  const [umask, setUmask] = useState('022');
  const u = umaskRechte(umask);

  const neu = (x: Rechte) => {
    setR(x);
    setOktal(rechteZuOktal(x));
  };
  const bit = (w: number, b: number) => {
    const bits = r.bits.map((z) => [...z]) as Rechte['bits'];
    bits[w][b] = !bits[w][b];
    neu({ ...r, bits });
  };
  const oktalEingabe = (s: string) => {
    setOktal(s);
    const x = rechteAusOktal(s);
    if (x) setR(x);
  };
  const ok = !!rechteAusOktal(oktal);
  const sym = rechteSymbolisch(r, verz);

  return (
    <div className="flex flex-col gap-5">
      <Kopf titel="Linux – Rechte berechnen" text="Häkchen setzen oder Oktalzahl eingeben – beides bleibt synchron." />
      <div className="relative overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <caption className="sr-only">Rechte je Benutzerklasse</caption>
          <thead>
            <tr className="text-left">
              <th scope="col" className="px-3 py-2">
                <span className="sr-only">Wer</span>
              </th>
              {WAS.map(([k, t, w]) => (
                <th key={k} scope="col" className="px-3 py-2 text-center">
                  {k} <span className="font-normal text-muted">({t}, {w})</span>
                </th>
              ))}
              <th scope="col" className="px-3 py-2 text-center">
                Summe
              </th>
            </tr>
          </thead>
          <tbody>
            {WER.map((wer, w) => (
              <tr key={wer} className="border-t border-line">
                <th scope="row" className="px-3 py-2 text-left font-semibold">
                  {wer}
                </th>
                {WAS.map(([k, t], b) => (
                  <td key={k} className="px-3 py-2 text-center">
                    <input type="checkbox" aria-label={`${wer}: ${t}`} className="h-5 w-5 accent-[var(--c-accent)]" checked={r.bits[w][b]} onChange={() => bit(w, b)} />
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-mono text-lg font-semibold">{(r.bits[w][0] ? 4 : 0) + (r.bits[w][1] ? 2 : 0) + (r.bits[w][2] ? 1 : 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <fieldset className="flex flex-wrap gap-x-6 gap-y-2">
        <legend className="mb-1 text-sm font-semibold">Sonderrechte</legend>
        {(
          [
            ['suid', 'SUID (4)', 'läuft mit den Rechten des Besitzers, z. B. passwd'],
            ['sgid', 'SGID (2)', 'neue Dateien im Verzeichnis erben die Gruppe'],
            ['sticky', 'Sticky Bit (1)', 'nur der Besitzer darf löschen, z. B. /tmp'],
          ] as const
        ).map(([k, t, h]) => (
          <label key={k} className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--c-accent)]" checked={r[k]} onChange={() => neu({ ...r, [k]: !r[k] })} />
            <span>
              <strong>{t}</strong>
              <span className="block text-muted">{h}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Oktal</span>
          <input className="eingabe font-mono text-lg" value={oktal} onChange={(e) => oktalEingabe(e.target.value)} aria-invalid={!ok} />
          {!ok && <span className="text-sm text-seg-rot-ink">3 oder 4 Ziffern von 0 bis 7</span>}
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Symbolisch (ls -l)</span>
          <span className="eingabe flex items-center font-mono text-lg">{sym}</span>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-[var(--c-accent)]" checked={verz} onChange={() => setVerz(!verz)} />
            ist ein Verzeichnis
          </label>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Befehl</span>
          <code className="eingabe flex items-center font-mono">chmod {rechteZuOktal(r)} {verz ? 'ordner' : 'datei'}</code>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <label className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold">umask</span>
          <input className="eingabe w-24 font-mono" value={umask} onChange={(e) => setUmask(e.target.value)} aria-invalid={!u} />
          {u ? (
            <span className="text-sm">
              neue Dateien: <strong className="font-mono">{u.datei}</strong> (666 − umask) · neue Verzeichnisse: <strong className="font-mono">{u.verzeichnis}</strong> (777 − umask)
            </span>
          ) : (
            <span className="text-sm text-seg-rot-ink">drei Oktalziffern, z. B. 022</span>
          )}
        </label>
      </div>
      <Merke>
        r = 4, w = 2, x = 1 – pro Klasse addieren. Bei Verzeichnissen heißt x „hineinwechseln“ und r „Inhalt auflisten“. Ein großes S oder T zeigt ein Sonderrecht ohne
        das zugehörige x. Genau genommen ist die umask kein Minus, sondern ein Ausblenden von Bits – bei den üblichen Werten kommt dasselbe heraus.
      </Merke>
    </div>
  );
}
