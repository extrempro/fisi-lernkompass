import { useEffect, useState } from 'react';
import { Lightbulb, Pause, Play } from 'lucide-react';
import type { AblaufSzenario, AblaufTabelle } from '../types';

/** Zeit pro Schritt beim Abspielen – Standard ist „mittel“. */
const TEMPO = { langsam: 9000, mittel: 6000, schnell: 3500 } as const;
type Tempo = keyof typeof TEMPO;

/** Interaktiver Schritt-für-Schritt-Ablauf mit Netzwerkgrafik und animiertem Paket. */
export function Ablauf({ szenarien }: { szenarien: AblaufSzenario[] }) {
  const [szIndex, setSzIndex] = useState(0);
  const [schritt, setSchritt] = useState(0);
  const [spielt, setSpielt] = useState(false);
  const [tempo, setTempo] = useState<Tempo>('mittel');

  const sz = szenarien[Math.min(szIndex, szenarien.length - 1)];
  const n = sz.schritte.length;
  const i = Math.min(schritt, n - 1);
  const s = sz.schritte[i];
  const m = sz.geraete.length;
  const aktiv = (j: number) => s.aktiv.includes(j);
  const links = (p: number) => `calc(60px + ${p} * (100% - 120px) / ${m - 1})`;

  useEffect(() => {
    if (!spielt) return;
    const t = setInterval(() => setSchritt((alt) => Math.min(alt + 1, n - 1)), TEMPO[tempo]);
    return () => clearInterval(t);
  }, [spielt, n, tempo]);

  // Am letzten Schritt automatisch anhalten
  useEffect(() => {
    if (spielt && i >= n - 1) setSpielt(false);
  }, [spielt, i, n]);

  const waehleSzenario = (k: number) => {
    setSpielt(false);
    setSzIndex(k);
    setSchritt(0);
  };
  const zurueck = () => {
    setSpielt(false);
    setSchritt((x) => Math.max(0, x - 1));
  };
  const weiter = () => {
    setSpielt(false);
    setSchritt((x) => Math.min(n - 1, x + 1));
  };
  const abspielen = () => {
    if (spielt) return setSpielt(false);
    if (i >= n - 1) setSchritt(0);
    setSpielt(true);
  };

  const beschreibung =
    `Netzwerk: ${sz.geraete.map((g) => g.name).join(', ')}. ` +
    `Aktiv in diesem Schritt: ${s.aktiv.map((j) => sz.geraete[j]?.name).join(', ')}` +
    (s.blockiert ? '. Paket wird verworfen.' : '.') +
    (s.ziele?.length ? ` Kopien gehen an: ${s.ziele.map((j) => sz.geraete[j]?.name).join(', ')}.` : '');

  return (
    <div className="flex flex-col gap-4">
      {szenarien.length > 1 && (
        <div role="group" aria-label="Szenario wählen" className="flex flex-wrap gap-1 self-start rounded-xl border border-line bg-bg p-1">
          {szenarien.map((x, k) => {
            const an = k === szIndex;
            return (
              <button
                key={x.id}
                type="button"
                aria-pressed={an}
                onClick={() => waehleSzenario(k)}
                className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  an ? 'bg-accent text-on-accent' : 'text-ink hover:bg-chip'
                }`}
              >
                {x.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="overflow-x-auto py-1">
        <div className="min-w-[640px]">
          <div role="img" aria-label={beschreibung} className="flex items-center">
            {sz.geraete.map((g, j) => {
              const a = aktiv(j);
              return (
                <div key={g.name} className="contents">
                  {j > 0 && (
                    <span
                      className="h-[3px] flex-[1_1_24px] rounded-sm transition-colors"
                      style={{ background: a && aktiv(j - 1) ? 'var(--c-accent)' : 'var(--c-track)' }}
                    />
                  )}
                  <div
                    className={`w-[120px] shrink-0 rounded-lg border-2 p-2 text-center transition-colors ${
                      a ? 'border-accent bg-accent-soft' : 'border-line bg-card'
                    }`}
                  >
                    <strong className={`block text-sm ${a ? 'text-accent' : ''}`}>{g.name}</strong>
                    <span className="block text-xs leading-snug text-muted">{g.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div aria-hidden="true" className="relative mt-2 h-11">
            <span className="absolute left-[60px] right-[60px] top-1/2 h-0.5 bg-track" />
            {sz.geraete.map((g, j) => (
              <span
                key={g.name}
                className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-track"
                style={{ left: links(j) }}
              />
            ))}
            {(s.ziele ?? []).map((z, k) => (
              <span
                key={`${i}-${k}`}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-2 border-dashed border-accent bg-card px-2.5 py-1 text-xs font-bold text-accent opacity-90 motion-safe:animate-[ablauf-einblenden_900ms_ease-out]"
                style={{ left: links(z) }}
              >
                {s.paket}
              </span>
            ))}
            <span
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold shadow-md transition-[left,background-color] duration-[1600ms] ease-in-out motion-reduce:transition-none"
              style={{
                left: links(s.position),
                background: s.blockiert ? '#DC2626' : 'var(--c-accent)',
                color: s.blockiert ? '#FFFFFF' : 'var(--c-on-accent)',
              }}
            >
              {s.blockiert ? '✕ ' : ''}
              {s.paket}
            </span>
          </div>
        </div>
      </div>

      <div aria-live="polite" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-accent-soft p-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">
            Schritt {i + 1} von {n}
          </span>
          <strong className="my-1 block text-lg">{s.titel}</strong>
          <p>{s.text}</p>
        </div>
        {s.zeilen.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full border-collapse text-sm">
            <caption className="px-3 pt-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{sz.zeilenTitel ?? 'Was im Paket steht'}</caption>
            <thead>
              <tr>
                <th scope="col" className="px-3 py-2 text-left">
                  {sz.spalten?.[0] ? sz.spalten[0] : <span className="sr-only">Feld</span>}
                </th>
                <th scope="col" className="px-3 py-2 text-left">{sz.spalten?.[1] ?? 'Quelle'}</th>
                <th scope="col" className="px-3 py-2 text-left">{sz.spalten?.[2] ?? 'Ziel'}</th>
              </tr>
            </thead>
            <tbody>
              {s.zeilen.map(([label, q, z, hl]) => (
                <tr key={label} className="border-t border-line">
                  <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                    {label}
                  </th>
                  <td className={`px-3 py-2 font-mono ${hl ? 'font-bold text-accent' : ''}`}>{q}</td>
                  <td className={`px-3 py-2 ${sz.spalten ? '' : 'font-mono'} ${hl ? (sz.spalten ? 'font-semibold text-accent' : 'font-bold text-accent') : ''}`}>{z}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : s.tabelle ? (
          <ZustandsTabelle t={s.tabelle} />
        ) : null}
      </div>

      {s.tabelle && s.zeilen.length > 0 && <ZustandsTabelle t={s.tabelle} />}

      {sz.regeln && sz.regeln.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full border-collapse text-sm">
            <caption className="px-3 pt-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">
              Firewall-Regelwerk (von oben nach unten)
            </caption>
            <thead>
              <tr>
                {['Nr.', 'Quelle', 'Ziel', 'Port', 'Aktion', 'Prüfung'].map((k) => (
                  <th key={k} scope="col" className="px-3 py-2 text-left">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sz.regeln.map((r, j) => {
                const geprueft = typeof s.regel === 'number';
                const greift = geprueft && j === s.regel;
                const erlaubt = r[4] === 'erlauben';
                const stil = greift ? (erlaubt ? 'bg-seg-gruen text-seg-gruen-ink' : 'bg-seg-rot text-seg-rot-ink') : '';
                return (
                  <tr key={r[0]} className={`border-t border-line transition-colors ${stil}`}>
                    {r.map((zelle, k) => (
                      <td key={k} className="px-3 py-2">
                        {zelle}
                      </td>
                    ))}
                    <td className={`whitespace-nowrap px-3 py-2 font-semibold ${greift ? '' : 'text-muted'}`}>
                      {greift ? (erlaubt ? '✓ greift' : '✕ greift') : geprueft && j < (s.regel ?? 0) ? 'passt nicht' : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {s.hinweis && <p className="border-t border-line px-3 py-2 text-sm text-muted">{s.hinweis}</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-sekundaer" onClick={zurueck} disabled={i === 0}>
            ← Zurück
          </button>
          <button type="button" className="btn-sekundaer" onClick={abspielen} aria-pressed={spielt}>
            {spielt ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {spielt ? 'Pause' : 'Abspielen'}
          </button>
          <label className="flex min-h-[44px] items-center gap-2 text-sm text-muted">
            Tempo
            <select
              value={tempo}
              onChange={(e) => setTempo(e.target.value as Tempo)}
              className="eingabe min-h-[36px] py-1 text-sm"
            >
              <option value="langsam">langsam</option>
              <option value="mittel">mittel</option>
              <option value="schnell">schnell</option>
            </select>
          </label>
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {sz.schritte.map((_, j) => (
            <span key={j} className="h-2 w-2 rounded-full" style={{ background: j === i ? 'var(--c-accent)' : 'var(--c-track)' }} />
          ))}
        </div>
        {i < n - 1 ? (
          <button type="button" className="btn-primaer" onClick={weiter}>
            Weiter →
          </button>
        ) : (
          <button
            type="button"
            className="btn-primaer"
            onClick={() => {
              setSpielt(false);
              setSchritt(0);
            }}
          >
            Von vorn
          </button>
        )}
      </div>

      <div className="flex gap-3 rounded-lg border border-line bg-bg p-4">
        <Lightbulb size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
        <div>
          <strong className="block text-sm text-accent">Merksatz</strong>
          {sz.merksatz}
        </div>
      </div>
    </div>
  );
}

/** Zustandstabelle eines Schritts (MAC-, NAT-, ARP-Tabelle …); neue Zeilen sind hervorgehoben. */
function ZustandsTabelle({ t }: { t: AblaufTabelle }) {
  return (
    <div className="relative overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-sm">
        <caption className="px-3 pt-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">{t.titel}</caption>
        <thead>
          <tr>
            {t.kopf.map((k) => (
              <th key={k} scope="col" className="px-3 py-2 text-left">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.zeilen.length === 0 && (
            <tr className="border-t border-line">
              <td colSpan={t.kopf.length} className="px-3 py-2 text-muted">
                – noch leer –
              </td>
            </tr>
          )}
          {t.zeilen.map((z, j) => {
            const neu = t.neu?.includes(j);
            return (
              <tr key={j} className={`border-t border-line transition-colors ${neu ? 'bg-seg-gruen text-seg-gruen-ink' : ''}`}>
                {z.map((c, k) => (
                  <td key={k} className={`px-3 py-2 ${k > 0 ? 'font-mono' : ''} ${neu ? 'font-semibold' : ''}`}>
                    {c}
                    {neu && k === z.length - 1 && <span className="sr-only"> (neu)</span>}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
