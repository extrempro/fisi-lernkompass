import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, CalendarDays, CheckCircle2, ExternalLink, FileText } from 'lucide-react';
import { useEinstellungen, useThemenfelder } from '../api';
import { AMPEL, ampelVon, balkenLabel, prozent, summe, zaehle } from '../lib/ampel';
import { formatDatum, PRUEFUNG_FELD, tageBis } from '../lib/datum';
import { KAMMER_LINKS, PRUEFUNGEN, VERKUERZUNG_INFO } from '../lib/pruefungen';
import { ausbildungsdauer } from '../lib/kalender';
import type { Einstellungen, PruefungKey, Status } from '../types';
import { FehlerHinweis, Laedt, Punkt, StapelBalken } from '../components/ui';

export function Pruefungen() {
  const { data: felder, error, isLoading } = useThemenfelder();
  const { data: einstellungen } = useEinstellungen();
  const [key, setKey] = useState<PruefungKey>('AP1');

  if (isLoading) return <Laedt />;
  if (error || !felder) return <FehlerHinweis fehler={error} />;

  const p = PRUEFUNGEN[key];
  const relevant = felder.filter((f) => f.pruefung.includes(key));
  const gesamt = summe(relevant);
  const zeilen = relevant
    .map((f) => {
      const z = zaehle(f.unterthemen);
      return { f, z, ampel: ampelVon(z), pct: prozent(z) };
    })
    .sort((a, b) => AMPEL[a.ampel].rang - AMPEL[b.ampel].rang || a.pct - b.pct);
  const sicher = zeilen.filter((x) => x.ampel === 'gruen').length;
  const datum = einstellungen?.[PRUEFUNG_FELD[key]] ?? '';
  const tage = tageBis(datum);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight">Prüfungen</h1>
          <p className="text-sm text-muted">Welche Themen für welche Prüfung zählen und wie gut du vorbereitet bist.</p>
        </div>
        <div role="group" aria-label="Prüfung wählen" className="flex gap-1 rounded-xl border border-line bg-card p-1">
          {(['AP1', 'AP2'] as PruefungKey[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={k === key}
              onClick={() => setKey(k)}
              className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold transition ${
                k === key ? 'bg-accent text-on-accent' : 'text-ink hover:bg-chip'
              }`}
            >
              {PRUEFUNGEN[k].name}
            </button>
          ))}
        </div>
      </header>
      <PruefungsReiter />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="karte flex min-w-0 flex-col gap-4 p-6 md:col-span-2">
          <div>
            <h2 className="text-2xl font-bold leading-snug">{p.name}</h2>
            <p className="text-sm text-muted">{p.sub}</p>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold leading-none">{prozent(gesamt)}</span>
              <span className="text-2xl font-semibold text-muted">%</span>
            </div>
            <span className="text-sm text-muted">
              vorbereitet · {sicher} von {zeilen.length} Themenfeldern sicher
            </span>
          </div>
          <StapelBalken z={gesamt} label={balkenLabel(gesamt)} hoehe={12} />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {(['gruen', 'gelb', 'rot'] as Status[]).map((s) => (
              <span key={s} className="flex items-center gap-2">
                <Punkt status={s} />
                <strong>{s === 'gruen' ? gesamt.g : s === 'gelb' ? gesamt.y : gesamt.r}</strong> {AMPEL[s].label.toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        <div className="karte flex min-w-0 flex-col gap-2 p-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <CalendarDays size={18} aria-hidden="true" />
            <span>Termin</span>
          </div>
          {tage !== null ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold leading-none text-accent">{Math.max(0, tage)}</span>
                <span className="text-muted">{tage === 1 ? 'Tag' : 'Tage'}</span>
              </div>
              <p className="text-sm text-muted">am {formatDatum(datum)}</p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold">Noch kein Termin</p>
              <p className="text-sm text-muted">Trag das Datum ein, sobald die Handelskammer es bekannt gibt.</p>
            </>
          )}
          <div className="mt-auto flex flex-col">
            <Link to="/einstellungen" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-accent">
              Termin in den Einstellungen ändern
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href={KAMMER_LINKS.pruefungstermine}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-accent"
            >
              Prüfungstermine der Handelskammer
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="karte flex flex-col gap-4 p-6">
        <h2 className="text-xl font-semibold">Prüfungsteile</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.teile.map((t) => (
            <div key={t.titel} className="flex flex-col gap-2 rounded-lg border border-line bg-bg p-4">
              <strong className="leading-snug">{t.titel}</strong>
              <div className="flex flex-wrap gap-1">
                <span className="chip bg-accent text-on-accent">{t.gewicht} der Endnote</span>
                <span className="chip bg-accent-soft text-accent">{t.dauer}</span>
                <span className="chip bg-chip text-muted">{t.art}</span>
              </div>
              {t.hinweis && <p className="text-sm text-muted">{t.hinweis}</p>}
            </div>
          ))}
        </div>
        <p className="flex items-start gap-2 text-sm text-muted">
          <FileText size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            Bei der Anmeldung zu jedem Prüfungsteil lädst du alle bisherigen Ausbildungsnachweise im Azubi-Infocenter hoch.{' '}
            <a href={KAMMER_LINKS.ausbildungsnachweise} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent">
              Regeln der Handelskammer
            </a>
          </span>
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="karte flex flex-col gap-4 p-6">
          <h2 className="text-xl font-semibold">Was geprüft wird</h2>
          {p.inhalte.map((b) => (
            <div key={b.titel}>
              <h3 className="mb-1 font-semibold">{b.titel}</h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
                {b.punkte.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="karte flex flex-col gap-3 p-6">
          <h2 className="text-xl font-semibold">{key === 'AP1' ? 'Gut zu wissen' : 'So bestehst du'}</h2>
          <ul className="flex flex-col gap-2">
            {p.regeln.map((r) => (
              <li key={r} className="flex gap-2 text-sm">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-auto text-xs text-muted">Grundlage: Fachinformatikerausbildungsverordnung (FIAusbV) 2020, §§ 7–9 und 18–25.</p>
        </div>
      </section>

      {einstellungen && <VerkuerzungKarte e={einstellungen} />}

      <section className="karte flex flex-col gap-2 px-6 pb-2 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold">Relevante Themenfelder</h2>
          <span className="text-sm text-muted">Größte Lücken zuerst</span>
        </div>
        <ul>
          {zeilen.map(({ f, z, ampel, pct }) => (
            <li key={f.id} className="border-t border-line">
              <Link
                to={`/thema/${f.id}`}
                className="-mx-2 flex min-h-[44px] flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-2 py-3 transition hover:bg-chip"
              >
                <span className="min-w-0 flex-[1_1_240px] font-semibold">{f.titel}</span>
                <span className="flex w-[168px] shrink-0 items-center gap-2 text-sm">
                  <Punkt status={ampel} />
                  {AMPEL[ampel].label}
                </span>
                <span className="flex-[1_1_160px]">
                  <StapelBalken z={z} label={balkenLabel(z)} />
                </span>
                <strong className="w-14 shrink-0 text-right">{pct} %</strong>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/** Reiter zwischen Prüfungsübersicht, Abschlussprojekt und Prüfungstechnik. */
export function PruefungsReiter() {
  const reiter: [string, string][] = [
    ['/pruefung', 'Überblick AP1 / AP2'],
    ['/pruefung/projekt', 'Abschlussprojekt'],
    ['/pruefung/technik', 'Prüfungstechnik'],
  ];
  return (
    <nav aria-label="Prüfungsbereiche" className="-mt-2 flex flex-wrap gap-1 border-b border-line">
      {reiter.map(([to, t]) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `-mb-px flex min-h-[44px] items-center border-b-2 px-4 text-sm font-semibold transition ${
              isActive ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
            }`
          }
        >
          {t}
        </NavLink>
      ))}
    </nav>
  );
}

/** Verkürzen oder vorzeitig zur Prüfung – mit dem eigenen Stand aus den Einstellungen. */
function VerkuerzungKarte({ e }: { e: Einstellungen }) {
  const dauer = ausbildungsdauer(e);
  const vorzeitig = e.vorzeitige_zulassung === 'ja';
  return (
    <details className="karte group px-6 py-1" open={!!dauer && (dauer.verkuerzung > 0 || vorzeitig)}>
      <summary className="flex min-h-[56px] items-center justify-between gap-3 py-2">
        <span>
          <h2 className="text-xl font-semibold">Verkürzen oder vorzeitig zur Prüfung?</h2>
          <span className="block text-sm text-muted">
            {!dauer
              ? 'Trag in den Einstellungen deinen Ausbildungsbeginn ein.'
              : `Dein Vertragsende: ${formatDatum(dauer.ende)} (${dauer.monate} Monate${dauer.verkuerzung ? `, verkürzt um ${dauer.verkuerzung}` : ''})${vorzeitig ? ' · vorzeitige Zulassung geplant' : ''}`}
          </span>
        </span>
        <ArrowRight size={18} className="shrink-0 rotate-90 text-muted transition group-open:-rotate-90" aria-hidden="true" />
      </summary>
      <div className="flex flex-col gap-4 pb-5 pt-2">
        {dauer && (dauer.verkuerzung > 0 || vorzeitig) && (
          <ul className="flex flex-col gap-2 rounded-lg bg-accent-soft p-4 text-sm">
            <li>
              <strong>Teil 2</strong> legst du in der letzten Prüfungsrunde vor deinem Vertragsende ab – Sommer (schriftlich meist April/Mai) oder Winter (meist November/Dezember). Die genauen Termine nennt die Handelskammer.
            </li>
            {dauer.verkuerzung > 0 && (
              <li>
                <strong>Teil 1</strong> soll vor dem Ende des zweiten Ausbildungsjahres stattfinden; bei einer verkürzten Ausbildung rückt er entsprechend nach vorn. Den Termin mit Betrieb und Kammer abstimmen.
              </li>
            )}
            {vorzeitig && (
              <li>
                <strong>Vorzeitige Zulassung:</strong> Trag den früheren Prüfungstermin oben bei den Prüfungsterminen ein – Countdown und Ausbildungsplan richten sich danach.
              </li>
            )}
          </ul>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-3"> </th>
                <th className="py-2 pr-3">Verkürzung</th>
                <th className="py-2">Vorzeitige Zulassung</th>
              </tr>
            </thead>
            <tbody>
              {VERKUERZUNG_INFO.map((z) => (
                <tr key={z.merkmal} className="border-b border-line align-top">
                  <th scope="row" className="py-2 pr-3 text-left font-semibold">
                    {z.merkmal}
                  </th>
                  <td className="py-2 pr-3">{z.verkuerzung}</td>
                  <td className="py-2">{z.vorzeitig}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-x-6">
          <Link to="/einstellungen" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-accent">
            Ausbildungsdauer in den Einstellungen
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a href={KAMMER_LINKS.verkuerzung} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-accent">
            Regeln der Handelskammer Hamburg
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
        <p className="text-xs text-muted">Grundlage: Berufsbildungsgesetz (BBiG) §§ 7, 8, 21 und 45; Hinweise der Handelskammer Hamburg. Im Einzelfall entscheidet die Kammer.</p>
      </div>
    </details>
  );
}
