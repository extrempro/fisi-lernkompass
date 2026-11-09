import { CalendarCheck, School } from 'lucide-react';
import { monatJahr, plusTage, tagMonat, type Woche } from '../lib/kalender';
import { ART } from './arten';

export function jahrTitel(jahr: number): string {
  return jahr === 0 ? 'Vor der Ausbildung' : jahr > 3 ? `${jahr}. Ausbildungsjahr (Verlängerung)` : `${jahr}. Ausbildungsjahr`;
}

/** Monat einer Woche = Monat ihres Donnerstags (wie bei der ISO-Kalenderwoche). */
export function monatDerWoche(w: Woche): string {
  return monatJahr(plusTage(w.montag, 3));
}

/**
 * Seitenleiste des Ausbildungsplans: wo man gerade liest (Ausbildungsjahr, Monat, KW),
 * Fortschritt der Ausbildung und je Jahr ein Band aller Wochen mit Schul- und Prüfungswochen.
 */
export function PlanKompass({
  jahre,
  gelesen,
  heute,
  gesamt,
  schule,
  pruefungsWochen,
  ferienWochen,
  onSpringe,
}: {
  jahre: Map<number, Woche[]>;
  /** Woche, die gerade oben im Fenster steht */
  gelesen: Woche | null;
  /** aktuelle Kalenderwoche, falls sie in der Ausbildung liegt */
  heute: Woche | null;
  /** Anzahl Ausbildungswochen (Regeldauer) */
  gesamt: number;
  schule: Set<string>;
  pruefungsWochen: Set<string>;
  ferienWochen: Set<string>;
  onSpringe: (montag: string) => void;
}) {
  const ort = gelesen ?? heute;
  const fortschritt = heute && heute.nummer ? Math.min(100, Math.round((heute.nummer / gesamt) * 100)) : null;

  return (
    <nav aria-label="Übersicht Ausbildungsplan" className="flex flex-col gap-4">
      {ort && (
        <div aria-live="polite" className="flex flex-col gap-0.5">
          <span className="ueberschrift-klein">Du bist hier</span>
          <strong className="text-lg leading-snug">{jahrTitel(ort.ausbildungsjahr)}</strong>
          <span className="text-sm">
            {monatDerWoche(ort)} · KW {ort.kw}
          </span>
          {ort.nummer > 0 && (
            <span className="text-sm text-muted">
              Ausbildungswoche {ort.nummer} von {gesamt}
            </span>
          )}
          <span
            className={`chip mt-1 inline-flex w-fit items-center gap-1 py-0.5 ${schule.has(ort.montag) ? ART.schule.stil : 'bg-chip text-muted'}`}
          >
            {schule.has(ort.montag) && <School size={12} aria-hidden="true" />}
            {schule.has(ort.montag) ? 'Schulwoche' : 'Betrieb'}
          </span>
          {heute && ort.montag !== heute.montag && (
            <button
              type="button"
              onClick={() => onSpringe(heute.montag)}
              className="mt-1 inline-flex min-h-[44px] w-fit items-center gap-2 text-left text-sm font-semibold text-accent hover:underline"
            >
              <CalendarCheck size={16} aria-hidden="true" />
              Zur aktuellen Woche
            </button>
          )}
        </div>
      )}

      {fortschritt !== null && heute && (
        <div className="flex flex-col gap-1.5 border-t border-line pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="ueberschrift-klein">Ausbildung</span>
            <strong className="text-sm">{fortschritt} %</strong>
          </div>
          <div
            role="img"
            aria-label={`Heute Ausbildungswoche ${heute.nummer} von ${gesamt}, ${fortschritt} Prozent geschafft`}
            className="h-2 overflow-hidden rounded-full bg-track"
          >
            <span className="block h-full rounded-full bg-accent" style={{ width: `${fortschritt}%` }} />
          </div>
          <span className="text-xs text-muted">
            Heute Woche {heute.nummer} von {gesamt}
          </span>
        </div>
      )}

      <ol className="flex flex-col gap-3 border-t border-line pt-4">
        {[...jahre.entries()].map(([jahr, ws]) => {
          const aktiv = ort?.ausbildungsjahr === jahr;
          const monate: { name: string; montag: string }[] = [];
          for (const w of ws) {
            const m = monatDerWoche(w);
            if (monate[monate.length - 1]?.name !== m) monate.push({ name: m, montag: w.montag });
          }
          const ortMonat = ort ? monatDerWoche(ort) : '';
          const schulwochen = ws.filter((w) => schule.has(w.montag)).length;
          return (
            <li key={jahr} className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => onSpringe(ws[0].montag)}
                aria-current={aktiv ? 'location' : undefined}
                className={`-mx-2 flex min-h-[44px] flex-col items-start rounded-lg px-2 py-1 text-left transition ${
                  aktiv ? 'bg-accent-soft text-accent' : 'hover:bg-chip'
                }`}
              >
                <span className="text-sm font-semibold">{jahrTitel(jahr)}</span>
                <span className={`text-xs ${aktiv ? '' : 'text-muted'}`}>
                  {tagMonat(ws[0].montag)}
                  {ws[0].montag.slice(2, 4)} – {tagMonat(ws[ws.length - 1].sonntag)}
                  {ws[ws.length - 1].sonntag.slice(2, 4)} · {schulwochen} Schulw.
                </span>
              </button>
              <Jahresband
                wochen={ws}
                schule={schule}
                pruefungsWochen={pruefungsWochen}
                ferienWochen={ferienWochen}
                heute={heute?.montag}
                gelesen={ort?.montag}
                onSpringe={onSpringe}
              />
              {aktiv && monate.length > 1 && (
                <ul className="grid grid-cols-2 gap-x-1">
                  {monate.map((m) => {
                    const hier = m.name === ortMonat;
                    return (
                      <li key={m.montag}>
                        <button
                          type="button"
                          onClick={() => onSpringe(m.montag)}
                          aria-current={hier ? 'location' : undefined}
                          className={`flex min-h-[32px] w-full items-center rounded-md px-2 text-left text-xs transition ${
                            hier ? 'bg-accent font-semibold text-on-accent' : 'text-muted hover:bg-chip hover:text-ink'
                          }`}
                        >
                          {m.name.replace(/ (\d{2})(\d{2})$/, ' ’$2')}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-line pt-3 text-xs text-muted" aria-hidden="true">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-1.5 rounded-sm bg-schule" /> Schule
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-1.5 rounded-sm bg-rot" /> Prüfung
        </span>
        {ferienWochen.size > 0 && (
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-1.5 rounded-sm bg-ferien" /> Ferien
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-1.5 rounded-sm bg-accent" /> Heute
        </span>
      </div>
    </nav>
  );
}

/** Ein schmaler Balken pro Woche: Schule violett, Prüfung rot, heute blau; die gelesene Woche ist markiert. */
function Jahresband({
  wochen,
  schule,
  pruefungsWochen,
  ferienWochen,
  heute,
  gelesen,
  onSpringe,
}: {
  wochen: Woche[];
  schule: Set<string>;
  pruefungsWochen: Set<string>;
  ferienWochen: Set<string>;
  heute?: string;
  gelesen?: string;
  onSpringe: (montag: string) => void;
}) {
  const schulAnzahl = wochen.filter((w) => schule.has(w.montag)).length;
  const ferienAnzahl = wochen.filter((w) => ferienWochen.has(w.montag)).length;
  return (
    <div
      role="img"
      aria-label={`${wochen.length} Wochen, davon ${schulAnzahl} Schulwochen${ferienAnzahl ? ` und ${ferienAnzahl} Ferienwochen` : ''}`}
      className="flex h-4 items-end gap-px"
    >
      {wochen.map((w) => {
        const farbe = pruefungsWochen.has(w.montag)
          ? 'bg-rot'
          : w.montag === heute
            ? 'bg-accent'
            : schule.has(w.montag)
              ? 'bg-schule'
              : ferienWochen.has(w.montag)
                ? 'bg-ferien'
                : 'bg-track';
        const markiert = w.montag === gelesen;
        return (
          <span
            key={w.montag}
            title={`KW ${w.kw} · ${tagMonat(w.montag)}–${tagMonat(w.sonntag)}`}
            onClick={() => onSpringe(w.montag)}
            className={`min-w-0 flex-1 cursor-pointer rounded-[1px] transition-[height] hover:opacity-70 ${farbe} ${markiert ? 'h-4' : 'h-2.5'}`}
          />
        );
      })}
    </div>
  );
}
