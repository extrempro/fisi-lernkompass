import { useMemo, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lightbulb, Search, X } from 'lucide-react';
import { useThemenfelder } from '../api';
import { passt, sammleEintraege, TYP_LABEL, TYP_MEHRZAHL, type Eintrag, type EintragTyp } from '../lib/kompendium';
import { FehlerHinweis, Inline, Laedt } from '../components/ui';

const TYPEN: EintragTyp[] = ['begriff', 'befehl', 'tabelle', 'merksatz', 'frage', 'zusatz'];

const TYP_FARBE: Record<EintragTyp, string> = {
  begriff: 'bg-accent-soft text-accent',
  befehl: 'bg-code text-code-ink',
  tabelle: 'bg-chip text-muted',
  merksatz: 'bg-warn text-warn-ink',
  frage: 'bg-seg-gruen text-seg-gruen-ink',
  zusatz: 'border border-dashed border-line text-accent',
};

/** Hebt Suchtreffer im Text hervor (ohne Markdown-Formatierung). */
function Treffer({ text, suche }: { text: string; suche: string }) {
  const woerter = suche.trim().split(/\s+/).filter((w) => w.length > 1);
  if (!woerter.length) return <Inline text={text} />;
  const re = new RegExp(`(${woerter.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const klar = text.replace(/[`*]/g, '');
  const teile: ReactNode[] = klar.split(re).map((t, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-sm bg-gelb/40 px-0.5 text-inherit">
        {t}
      </mark>
    ) : (
      t
    ),
  );
  return <>{teile}</>;
}

export function Kompendium() {
  const { data: felder, error, isLoading } = useThemenfelder();
  const [params, setParams] = useSearchParams();
  const suche = params.get('q') ?? '';
  const typ = (params.get('typ') as EintragTyp | null) ?? null;
  const feld = params.get('feld') ?? '';

  const setze = (k: string, v: string | null) => {
    const neu = new URLSearchParams(params);
    if (v) neu.set(k, v);
    else neu.delete(k);
    setParams(neu, { replace: true });
  };

  const alle = useMemo(() => (felder ? sammleEintraege(felder) : []), [felder]);

  const gefiltert = useMemo(
    () => alle.filter((e) => (!typ || e.typ === typ) && (!feld || e.feldId === feld) && (!suche || passt(e, suche))),
    [alle, typ, feld, suche],
  );

  const gruppen = useMemo(() => {
    const m = new Map<string, Eintrag[]>();
    for (const e of gefiltert) {
      const liste = m.get(e.buchstabe) ?? [];
      liste.push(e);
      m.set(e.buchstabe, liste);
    }
    return [...m.entries()].sort(([a], [b]) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)));
  }, [gefiltert]);

  if (isLoading) return <Laedt />;
  if (error || !felder) return <FehlerHinweis fehler={error} />;

  const anzahlJeTyp = (t: EintragTyp) =>
    alle.filter((e) => e.typ === t && (!feld || e.feldId === feld) && (!suche || passt(e, suche))).length;
  const hatFilter = !!(suche || typ || feld);

  return (
    <>
      <header>
        <h1 className="text-[32px] font-bold leading-tight">Kompendium</h1>
        <p className="text-sm text-muted">
          {alle.length} Einträge aus allen Cheatsheets – Begriffe, Befehle, Tabellen, Merksätze, Prüfungsfragen und Zusatzwissen zum Nachschlagen.
        </p>
      </header>

      <section aria-label="Suche und Filter" className="karte z-[5] flex flex-col gap-4 p-4 sm:p-6 md:sticky md:top-[61px]">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-1">
            <label htmlFor="kompendium-suche" className="text-sm font-semibold">
              Suchen
            </label>
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="kompendium-suche"
                type="search"
                className="eingabe w-full pl-10"
                placeholder="z. B. Subnetz, DHCP, chmod, Schutzbedarf"
                value={suche}
                onChange={(e) => setze('q', e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="kompendium-feld" className="text-sm font-semibold">
              Themenfeld
            </label>
            <select id="kompendium-feld" className="eingabe bg-card" value={feld} onChange={(e) => setze('feld', e.target.value || null)}>
              <option value="">Alle Themenfelder</option>
              {felder.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.titel}
                </option>
              ))}
            </select>
          </div>
          {hatFilter && (
            <button type="button" className="btn-sekundaer" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              <X size={16} aria-hidden="true" />
              Zurücksetzen
            </button>
          )}
        </div>

        <div role="group" aria-label="Nach Art filtern" className="flex flex-wrap gap-2">
          {[null, ...TYPEN].map((t) => {
            const an = typ === t;
            const label = t ? TYP_MEHRZAHL[t] : 'Alle';
            const n = t ? anzahlJeTyp(t) : TYPEN.reduce((s, x) => s + anzahlJeTyp(x), 0);
            return (
              <button
                key={t ?? 'alle'}
                type="button"
                aria-pressed={an}
                onClick={() => setze('typ', t)}
                className={`flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  an ? 'border-accent bg-accent text-on-accent' : 'border-line bg-card text-ink hover:bg-chip'
                }`}
              >
                {label}
                <span className="text-xs opacity-80">{n}</span>
              </button>
            );
          })}
        </div>

        {gruppen.length > 1 && (
          <nav aria-label="Buchstaben" className="flex flex-wrap gap-1">
            {gruppen.map(([b]) => (
              <a
                key={b}
                href={`#k-${b}`}
                className="flex h-9 min-w-[36px] items-center justify-center rounded-md text-sm font-semibold text-accent hover:bg-accent-soft"
              >
                {b}
              </a>
            ))}
          </nav>
        )}
      </section>

      <p className="text-sm text-muted" role="status" aria-live="polite">
        {gefiltert.length === alle.length ? `${alle.length} Einträge` : `${gefiltert.length} von ${alle.length} Einträgen`}
      </p>

      {gruppen.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-muted">
          Nichts gefunden. Versuch es mit einem anderen Begriff oder entferne einen Filter.
        </p>
      ) : (
        gruppen.map(([buchstabe, eintraege]) => (
          <section key={buchstabe} id={`k-${buchstabe}`} aria-labelledby={`k-${buchstabe}-titel`} className="scroll-mt-24 md:scroll-mt-[300px]">
            <h2 id={`k-${buchstabe}-titel`} className="mb-2 text-2xl font-bold text-accent">
              {buchstabe}
            </h2>
            <ul className="karte divide-y divide-line">
              {eintraege.map((e) => (
                <EintragZeile key={e.key} e={e} suche={suche} />
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}

function EintragZeile({ e, suche }: { e: Eintrag; suche: string }) {
  const ziel = e.ziel ?? `/thema/${e.feldId}#u-${encodeURIComponent(e.subId)}`;
  return (
    <li className="flex flex-col gap-2 px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {e.typ === 'befehl' ? (
          <code className="whitespace-pre-wrap break-words rounded-md bg-code px-2 py-0.5 font-mono text-sm font-medium text-code-ink">
            <Treffer text={e.titel} suche={suche} />
          </code>
        ) : (
          <strong className={e.typ === 'frage' ? 'font-semibold' : 'text-lg font-semibold'}>
            <Treffer text={e.titel} suche={suche} />
          </strong>
        )}
        <span className={`chip ${TYP_FARBE[e.typ]}`}>{TYP_LABEL[e.typ]}</span>
      </div>

      {e.typ === 'merksatz' ? (
        <p className="flex gap-2">
          <Lightbulb size={18} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
          <span>
            <Treffer text={e.text} suche={suche} />
          </span>
        </p>
      ) : (
        e.text && (
          <p className="text-muted">
            <Treffer text={e.text} suche={suche} />
          </p>
        )
      )}

      {e.tabelle && (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-chip">
                {e.tabelle.kopf.map((k, i) => (
                  <th key={i} scope="col" className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {e.tabelle.zeilen.map((z, i) => (
                <tr key={i} className="border-t border-line">
                  {z.map((c, j) => (
                    <td key={j} className="px-3 py-2 align-top">
                      <Inline text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {e.abschnitte && e.abschnitte.length > 0 && (
        <p className="flex flex-wrap gap-1.5">
          {e.abschnitte.map((a) => (
            <span key={a} className="chip bg-chip py-0.5 text-muted">
              {a}
            </span>
          ))}
        </p>
      )}

      {e.loesung && (
        <details className="rounded-lg border border-line bg-bg px-4">
          <summary className="flex min-h-[44px] items-center text-sm font-semibold text-accent">Lösungsweg anzeigen</summary>
          <ol className="flex list-decimal flex-col gap-1 pb-3 pl-5">
            {e.loesung.map((l, i) => (
              <li key={i}>
                <Inline text={l} />
              </li>
            ))}
          </ol>
        </details>
      )}

      <Link to={ziel} className="inline-flex min-h-[32px] items-center gap-1 self-start text-sm font-medium text-accent">
        {e.feldTitel} › {e.subTitel}
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </li>
  );
}
