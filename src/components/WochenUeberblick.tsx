import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarHeart, CalendarRange, NotebookPen, School, Sun } from 'lucide-react';
import { useBerichte, useEinstellungen, useKalender, usePlan, useThemenfelder } from '../api';
import { BerichtEditor } from '../bericht/BerichtEditor';
import { BerichtKnopf } from '../bericht/BerichtKnopf';
import { sollStunden } from '../lib/bericht';
import { heuteIso } from '../lib/datum';
import { feiertageHamburg } from '../lib/feiertage';
import { wochenAus, eintraegeDerWoche, kalenderwoche, montagVon, plusTage, tagMonat, wochentagKurz, type Woche } from '../lib/kalender';
import { freieWoche } from '../lib/schulfrei';
import { ART } from '../plan/arten';
import type { PlanEintrag } from '../types';

/**
 * Zwei Karten für die Übersicht: was diese Woche ansteht (Plan, Ferien, Aufgaben)
 * und wie es um das Berichtsheft steht. Erscheint erst, wenn der Ausbildungsbeginn eingetragen ist.
 */
export function WochenUeberblick() {
  const { data: e } = useEinstellungen();
  const { data: plan } = usePlan();
  const { data: berichte } = useBerichte();
  const { data: kalender } = useKalender();
  const { data: felder = [] } = useThemenfelder();
  const [offen, setOffen] = useState<Woche | null>(null);

  if (!e || !plan || !berichte) return null;
  const zeitraum = wochenAus(e);
  if (!zeitraum) {
    return (
      <section className="karte flex flex-wrap items-center gap-3 p-5">
        <CalendarRange size={20} className="text-accent" aria-hidden="true" />
        <span className="flex-1 text-sm">Trag deinen Ausbildungsbeginn ein – dann siehst du hier deine Woche und den Stand deines Berichtshefts.</span>
        <Link to="/plan" className="btn-primaer min-h-[40px] px-3">
          Ausbildungsplan anlegen
        </Link>
      </section>
    );
  }

  const heute = heuteIso();
  const montag = montagVon(heute);
  const jahr = Number(heute.slice(0, 4));
  const feiertage = [jahr - 1, jahr, jahr + 1].flatMap(feiertageHamburg);
  const woche = zeitraum.wochen.find((w) => w.montag === montag) ?? null;
  const naechste = zeitraum.wochen.find((w) => w.montag === plusTage(montag, 7)) ?? null;
  const frei = freieWoche(montag, kalender?.ferien ?? [], feiertage);
  const istSchule = (m: string) => plan.some((p) => p.art === 'schule' && p.von <= m && p.bis >= m);
  const diese = eintraegeDerWoche(plan, montag);
  const ueberfaellig = plan.filter((p) => p.art === 'aufgabe' && !p.erledigt && p.bis < montag);
  const schulblockNaechste = naechste ? plan.find((p) => p.art === 'schule' && p.von <= naechste.montag && p.bis >= naechste.montag) : undefined;

  // Berichtsheft
  const map = new Map(berichte.map((b) => [b.montag, b]));
  const faellig = zeitraum.wochen.filter((w) => w.nummer > 0 && w.montag < montag);
  const fehlend = faellig.filter((w) => !map.has(w.montag));
  const letzte = faellig[faellig.length - 1];
  const bereit = berichte.filter((b) => b.status === 'fertig').length;
  const soll = sollStunden(e);

  return (
    <section aria-label="Diese Woche und Berichtsheft" className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="karte flex min-w-0 flex-col gap-3 p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span className="ueberschrift-klein">Diese Woche</span>
            <h2 className="text-xl font-semibold">{woche ? woche.label : `KW ${kalenderwoche(montag).kw}`}</h2>
          </div>
          <span className={`chip flex items-center gap-1 py-1 text-sm ${istSchule(montag) ? ART.schule.stil : 'bg-chip text-muted'}`}>
            {istSchule(montag) && <School size={14} aria-hidden="true" />}
            {istSchule(montag) ? 'Schulwoche' : 'Betrieb'}
          </span>
        </div>

        {(frei.ferien.length > 0 || frei.feiertage.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {frei.ferien.map((f) => (
              <span key={f.von} className="chip inline-flex items-center gap-1.5 bg-ferien-soft py-1 text-[13px] text-ferien">
                <Sun size={14} aria-hidden="true" />
                <strong className="font-semibold">{f.name}</strong>
              </span>
            ))}
            {frei.feiertage.map((t) => (
              <span key={t.datum} className="chip inline-flex items-center gap-1.5 border border-line bg-card py-1 text-[13px]">
                <CalendarHeart size={14} className="text-muted" aria-hidden="true" />
                {t.name} · {wochentagKurz(t.datum)}
              </span>
            ))}
          </div>
        )}

        {diese.length ? (
          <ul className="flex flex-col gap-1.5">
            {diese.slice(0, 5).map((p) => (
              <EintragKurz key={p.id} p={p} feldTitel={felder.find((f) => f.id === p.themenfeld)?.titel} />
            ))}
            {diese.length > 5 && <li className="text-sm text-muted">und {diese.length - 5} weitere</li>}
          </ul>
        ) : (
          <p className="text-sm text-muted">Für diese Woche ist nichts geplant.</p>
        )}

        {ueberfaellig.length > 0 && (
          <div className="flex items-start gap-2 rounded-lg bg-seg-rot px-3 py-2 text-sm text-seg-rot-ink">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold">{ueberfaellig.length === 1 ? '1 Aufgabe überfällig' : `${ueberfaellig.length} Aufgaben überfällig`}:</strong>{' '}
              {ueberfaellig
                .slice(0, 3)
                .map((p) => p.titel)
                .join(', ')}
              {ueberfaellig.length > 3 ? ' …' : ''}
            </span>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-sm">
          <span className="text-muted">
            {naechste
              ? `Nächste Woche (KW ${naechste.kw}): ${schulblockNaechste ? `Schule – ${schulblockNaechste.titel}` : 'Betrieb'}`
              : 'Nächste Woche liegt außerhalb der Ausbildung.'}
          </span>
          <Link to="/plan" className="inline-flex min-h-[36px] items-center gap-1.5 font-semibold text-accent">
            Zum Ausbildungsplan
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="karte flex min-w-0 flex-col gap-3 p-6">
        <div className="flex items-center gap-2 text-sm text-muted">
          <NotebookPen size={18} aria-hidden="true" />
          <span>Berichtsheft</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className={`text-5xl font-bold leading-none ${fehlend.length ? 'text-rot' : 'text-gruen'}`}>{fehlend.length}</span>
          <span className="font-semibold">{fehlend.length === 1 ? 'Bericht fehlt' : 'Berichte fehlen'}</span>
          <span className="text-sm text-muted">· {faellig.length - fehlend.length} von {faellig.length} geschrieben</span>
        </div>

        {letzte && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-bg px-3 py-2">
            <span className="text-sm">
              Letzte Woche <strong>KW {letzte.kw}</strong>
              <span className="text-muted">
                {' '}
                · {tagMonat(letzte.montag)}–{tagMonat(letzte.sonntag)}
              </span>
            </span>
            <BerichtKnopf bericht={map.get(letzte.montag)} soll={soll} kw={letzte.kw} onOeffnen={() => setOffen(letzte)} />
          </div>
        )}

        {bereit > 0 && (
          <p className="text-sm">
            <strong>{bereit === 1 ? '1 Bericht ist fertig' : `${bereit} Berichte sind fertig`}</strong> und {bereit === 1 ? 'wartet' : 'warten'} aufs Abzeichnen.
          </p>
        )}
        {(!e.azubi_name || !e.ausbildungsbetrieb) && (
          <p className="text-sm text-warn-ink">
            Name und Betrieb fehlen noch für das PDF –{' '}
            <Link to="/einstellungen#berichtsheft" className="font-semibold underline">
              eintragen
            </Link>
            .
          </p>
        )}

        <div className="mt-auto flex justify-end border-t border-line pt-3 text-sm">
          <Link to="/berichtsheft" className="inline-flex min-h-[36px] items-center gap-1.5 font-semibold text-accent">
            Zum Berichtsheft
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {offen && <BerichtEditor woche={offen} onSchliessen={() => setOffen(null)} />}
    </section>
  );
}

function EintragKurz({ p, feldTitel }: { p: PlanEintrag; feldTitel?: string }) {
  const art = ART[p.art];
  const Icon = art.icon;
  const erledigt = p.art === 'aufgabe' && !!p.erledigt;
  const teile = p.art === 'aufgabe' ? p.unteraufgaben : [];
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${art.stil}`} title={art.label}>
        <Icon size={14} aria-hidden="true" />
      </span>
      <span className={`min-w-0 flex-1 truncate ${erledigt ? 'text-muted line-through' : 'font-medium'}`}>{p.titel || feldTitel || art.label}</span>
      {teile.length > 0 && (
        <span className="shrink-0 text-xs text-muted">
          {teile.filter((u) => u.erledigt).length}/{teile.length}
        </span>
      )}
    </li>
  );
}
