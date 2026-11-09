import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Info, Search } from 'lucide-react';
import { HANDBUCH, type Block, type Kapitel } from '../lib/handbuch';
import { Inline } from '../components/ui';

/** Handbuch für Azubis: Bedienung der App, mit Inhaltsverzeichnis und Suche. */
export function Hilfe() {
  const [suche, setSuche] = useState('');
  const [aktiv, setAktiv] = useState(HANDBUCH[0].id);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  const treffer = useMemo(() => {
    const w = suche.trim().toLowerCase();
    if (!w) return HANDBUCH;
    return HANDBUCH.filter((k) => text(k).toLowerCase().includes(w));
  }, [suche]);

  // Welches Kapitel gerade gelesen wird: das letzte, dessen Anfang unter der festen Navigation
  // (plus etwas Luft) schon vorbeigescrollt ist; am Seitenende das letzte sichtbare.
  useEffect(() => {
    let rahmen = 0;
    const pruefe = () => {
      rahmen = 0;
      const kapitel = treffer.map((k) => document.getElementById(k.id)).filter((x): x is HTMLElement => !!x);
      if (!kapitel.length) return;
      const grenze = 140;
      let aktuell = kapitel[0].id;
      for (const el of kapitel) if (el.getBoundingClientRect().top <= grenze) aktuell = el.id;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) aktuell = kapitel[kapitel.length - 1].id;
      setAktiv(aktuell);
    };
    const beimScrollen = () => {
      if (!rahmen) rahmen = requestAnimationFrame(pruefe);
    };
    pruefe();
    window.addEventListener('scroll', beimScrollen, { passive: true });
    window.addEventListener('resize', beimScrollen);
    return () => {
      cancelAnimationFrame(rahmen);
      window.removeEventListener('scroll', beimScrollen);
      window.removeEventListener('resize', beimScrollen);
    };
  }, [treffer]);

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-[32px] font-bold leading-tight">Hilfe</h1>
        <p className="text-sm text-muted">Handbuch für Azubis – wie du den Lernkompass im Alltag nutzt.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <nav aria-label="Kapitel" className="karte flex flex-col gap-1 p-4">
            <label className="relative mb-2 block">
              <span className="sr-only">Im Handbuch suchen</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input type="search" className="eingabe w-full pl-9" placeholder="Suchen …" value={suche} onChange={(e) => setSuche(e.target.value)} />
            </label>
            <span className="ueberschrift-klein px-2">Kapitel</span>
            {HANDBUCH.map((k, i) => {
              const sichtbar = treffer.includes(k);
              const istAktiv = sichtbar && aktiv === k.id;
              return (
                <a
                  key={k.id}
                  href={`#${k.id}`}
                  aria-current={istAktiv ? 'location' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!sichtbar) setSuche('');
                    setAktiv(k.id);
                    requestAnimationFrame(() => document.getElementById(k.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
                    history.replaceState(null, '', `#${k.id}`);
                  }}
                  className={`flex min-h-[36px] items-center gap-2 rounded-lg border-l-[3px] px-2 text-sm transition ${
                    istAktiv ? 'border-accent bg-accent-soft font-semibold text-accent' : `border-transparent hover:bg-chip ${sichtbar ? 'text-ink' : 'text-muted opacity-60'}`
                  }`}
                >
                  <span className={`w-5 shrink-0 text-right text-xs ${istAktiv ? 'text-accent' : 'text-muted'}`}>{i + 1}</span>
                  {k.titel}
                </a>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          {treffer.length === 0 && (
            <p className="karte p-6 text-sm text-muted">
              Nichts gefunden für „{suche}“.{' '}
              <button type="button" className="font-semibold text-accent" onClick={() => setSuche('')}>
                Suche zurücksetzen
              </button>
            </p>
          )}
          {treffer.map((k) => (
            <section key={k.id} id={k.id} aria-labelledby={`${k.id}-titel`} className="karte flex scroll-mt-24 flex-col gap-4 p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`${k.id}-titel`} className="text-xl font-semibold">
                  {HANDBUCH.indexOf(k) + 1}. {k.titel}
                </h2>
                {k.link && (
                  <Link to={k.link.to} className="inline-flex min-h-[36px] items-center gap-1.5 text-sm font-semibold text-accent">
                    {k.link.label}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </div>
              {k.bloecke.map((b, i) => (
                <BlockAnzeige key={i} b={b} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

function text(k: Kapitel): string {
  const teile: string[] = [k.titel];
  for (const b of k.bloecke) {
    if (b.typ === 'text' || b.typ === 'hinweis') teile.push(b.text);
    else if (b.typ === 'liste') teile.push(...b.punkte);
    else if (b.typ === 'schritte') for (const p of b.punkte) teile.push(...(typeof p === 'string' ? [p] : [p.text, ...p.unter]));
    else teile.push(...b.kopf, ...b.zeilen.flat());
  }
  return teile.join(' ').replace(/\*\*/g, '');
}

function BlockAnzeige({ b }: { b: Block }) {
  switch (b.typ) {
    case 'text':
      return (
        <p className="leading-relaxed">
          <Inline text={b.text} />
        </p>
      );
    case 'hinweis':
      return (
        <p className="flex gap-2 rounded-lg bg-warn px-4 py-3 text-sm text-warn-ink">
          <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            <Inline text={b.text} />
          </span>
        </p>
      );
    case 'liste':
      return (
        <ul className="flex list-disc flex-col gap-2 pl-5">
          {b.punkte.map((p, i) => (
            <li key={i}>
              <Inline text={p} />
            </li>
          ))}
        </ul>
      );
    case 'schritte':
      return (
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          {b.punkte.map((p, i) => (
            <li key={i}>
              <Inline text={typeof p === 'string' ? p : p.text} />
              {typeof p !== 'string' && (
                <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm">
                  {p.unter.map((u, j) => (
                    <li key={j}>
                      <Inline text={u} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      );
    case 'tabelle':
      return (
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                {b.kopf.map((k) => (
                  <th key={k} scope="col" className="py-2 pr-3">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.zeilen.map((z, i) => (
                <tr key={i} className="border-b border-line align-top">
                  {z.map((c, j) =>
                    j === 0 ? (
                      <th key={j} scope="row" className="py-2 pr-3 text-left font-semibold">
                        <Inline text={c} />
                      </th>
                    ) : (
                      <td key={j} className="py-2 pr-3">
                        <Inline text={c} />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
