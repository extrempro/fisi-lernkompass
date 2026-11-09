import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, CalendarHeart, CalendarRange, Flag, GraduationCap, Pencil, Plus, School, Sun, type LucideIcon } from 'lucide-react';
import { BerichtEditor } from '../bericht/BerichtEditor';
import { BerichtKnopf } from '../bericht/BerichtKnopf';
import { useDrucken } from '../bericht/Druck';
import { sollStunden } from '../lib/bericht';
import { useBerichte, useEinstellungen, useEinstellungenSpeichern, useKalender, usePlan, usePlanSpeichern, useProjekt, useThemenfelder } from '../api';
import { projektTermine } from '../lib/projekt';
import { feiertageZwischen } from '../lib/feiertage';
import { FreiKontext, freieWoche, useFreieWoche } from '../lib/schulfrei';
import { AMPEL, ampelVon, prozent, zaehle } from '../lib/ampel';
import { heuteIso, PRUEFUNG_FELD, PRUEFUNG_KURZ, PRUEFUNG_NAME } from '../lib/datum';
import { ART_RANG, eintraegeDerWoche, gueltigesDatum, kalenderwoche, montagVon, plusTage, schulwochen, tagMonat, wochenAbstand, wochentagKurz, type Woche, wochenAus } from '../lib/kalender';
import { lies, merke } from '../lib/merken';
import type { Bericht, Ferien, PlanArt, PlanEintrag, PruefungKey, Themenfeld } from '../types';
import { FehlerHinweis, Laedt, Punkt, ThemenIcon } from '../components/ui';
import { EintragEditor, type EditorAuftrag } from '../plan/EintragEditor';
import { ART, ART_REIHE } from '../plan/arten';
import { jahrTitel, monatDerWoche, PlanKompass } from '../plan/PlanKompass';
import { useAktiverAbschnitt } from '../lib/lesestelle';

interface Pruefungstermin {
  key: PruefungKey;
  datum: string;
}

export function Ausbildungsplan() {
  const { data: e, error: eFehler, isLoading: eLaedt } = useEinstellungen();
  const { data: felder } = useThemenfelder();
  const { data: plan, error, isLoading } = usePlan();
  const [auftrag, setAuftrag] = useState<EditorAuftrag | null>(null);
  const [berichtWoche, setBerichtWoche] = useState<Woche | null>(null);
  const { data: berichte } = useBerichte();
  const drucken = useDrucken();
  const { data: kalender } = useKalender();
  const { data: projekt } = useProjekt();
  const [nurBelegt, setNurBelegtRoh] = useState(() => lies('plan-nur-belegt') === '1');
  const [zeigeFrei, setZeigeFreiRoh] = useState(() => lies('plan-ferien') !== '0');
  const setZeigeFrei = (x: boolean) => {
    setZeigeFreiRoh(x);
    merke('plan-ferien', x ? '1' : '0');
  };
  const setNurBelegt = (x: boolean) => {
    setNurBelegtRoh(x);
    merke('plan-nur-belegt', x ? '1' : '0');
  };

  const heute = heuteIso();
  const dieseWoche = montagVon(heute);

  const termine: Pruefungstermin[] = useMemo(
    () =>
      e
        ? (['AP1', 'AP2'] as PruefungKey[])
            .map((key) => ({ key, datum: e[PRUEFUNG_FELD[key]] }))
            .filter((t) => gueltigesDatum(t.datum))
        : [],
    [e],
  );

  const zeitraum = useMemo(() => {
    if (!e) return null;
    const eintraege = plan ?? [];
    return wochenAus(
      e,
      [...termine.map((t) => t.datum), ...eintraege.map((x) => x.bis)],
      eintraege.map((x) => x.von),
    );
  }, [e, plan, termine]);

  if (isLoading || eLaedt) return <Laedt />;
  if (error || eFehler || !e) return <FehlerHinweis fehler={error ?? eFehler} />;

  const eintraege = [...(plan ?? [])].sort((a, b) => ART_RANG[a.art] - ART_RANG[b.art] || a.von.localeCompare(b.von) || a.id - b.id);
  const feldMap = new Map((felder ?? []).map((f) => [f.id, f]));

  const kopf = (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[32px] font-bold leading-tight">Ausbildungsplan</h1>
        <p className="text-sm text-muted">Deine Ausbildung Woche für Woche – Schulblöcke, Themen, Aufgaben, Notizen und Prüfungen.</p>
      </div>
    </header>
  );

  if (!zeitraum) {
    return (
      <>
        {kopf}
        <KeinBeginn />
      </>
    );
  }

  const { wochen } = zeitraum;
  const schule = schulwochen(eintraege);
  const ferien = zeigeFrei ? (kalender?.ferien ?? []) : [];
  const feiertage = zeigeFrei ? feiertageZwischen(wochen[0].montag, wochen[wochen.length - 1].sonntag) : [];
  const frei = (montag: string) => freieWoche(montag, ferien, feiertage);
  // Ferienwoche = mindestens drei Werktage Ferien (einzelne freie Tage färben das Band nicht)
  const ferienWochen = new Set(wochen.filter((w) => frei(w.montag).ferienWerktage >= 3).map((w) => w.montag));
  const aktuelle = wochen.find((w) => w.montag === dieseWoche) ?? null;
  const naechsteWoche = wochen.find((w) => w.montag === plusTage(dieseWoche, 7)) ?? null;
  const berichtMap = new Map((berichte ?? []).map((b) => [b.montag, b]));
  // Fällig = Woche ist vorbei
  const faelligeWochen = wochen.filter((w) => w.nummer > 0 && w.montag < dieseWoche);
  const fehlendeBerichte = faelligeWochen.filter((w) => !berichtMap.has(w.montag));
  const soll = sollStunden(e);
  const ausbildungsWochenGesamt = wochen.filter((w) => w.ausbildungsjahr >= 1 && w.montag <= zeitraum.ende).length;
  const pruefungInWoche = (w: Woche) => termine.filter((t) => montagVon(t.datum) === w.montag);
  const offen = eintraege.filter((x) => x.art === 'aufgabe' && !x.erledigt);
  const ueberfaellig = offen.filter((x) => x.bis < dieseWoche);
  const naechste = termine
    .filter((t) => t.datum >= heute)
    .sort((a, b) => a.datum.localeCompare(b.datum))[0];

  const neu = (w: Woche, art: PlanArt = 'notiz') => setAuftrag({ vorlage: { art, von: w.montag, bis: w.montag } });
  const bearbeite = (x: PlanEintrag) => setAuftrag({ eintrag: x });
  const zeige = (montag: string) => {
    if (nurBelegt && !document.getElementById(`kw-${montag}`)) setNurBelegt(false);
    requestAnimationFrame(() => document.getElementById(`kw-${montag}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  // Wochen nach Ausbildungsjahr gruppieren
  const jahre = new Map<number, Woche[]>();
  for (const w of wochen) jahre.set(w.ausbildungsjahr, [...(jahre.get(w.ausbildungsjahr) ?? []), w]);

  const istBelegt = (w: Woche) =>
    w.montag === dieseWoche ||
    w.nummer === 1 ||
    pruefungInWoche(w).length > 0 ||
    projektTermine(projekt).some((t) => montagVon(t.datum) === w.montag) ||
    eintraegeDerWoche(eintraege, w.montag).length > 0 ||
    w.montag === montagVon(zeitraum.ende);

  return (
    <FreiKontext.Provider value={frei}>
      {kopf}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <WochenKarte
          titel="Diese Woche"
          woche={aktuelle}
          ersatz={heute < zeitraum.beginn ? 'Die Ausbildung hat noch nicht begonnen.' : `KW ${kalenderwoche(heute).kw} liegt außerhalb der Ausbildung.`}
          gesamt={ausbildungsWochenGesamt}
          schule={schule}
          eintraege={eintraege}
          pruefungInWoche={pruefungInWoche}
          felder={feldMap}
          zeitraum={zeitraum}
          bericht={aktuelle ? berichtMap.get(aktuelle.montag) : undefined}
          soll={soll}
          onBericht={setBerichtWoche}
          onNeu={neu}
          onBearbeiten={bearbeite}
          onZeigen={zeige}
          hervorheben
        />
        <WochenKarte
          titel="Nächste Woche"
          woche={naechsteWoche}
          ersatz="Die nächste Woche liegt außerhalb der Ausbildung."
          gesamt={ausbildungsWochenGesamt}
          schule={schule}
          eintraege={eintraege}
          pruefungInWoche={pruefungInWoche}
          felder={feldMap}
          zeitraum={zeitraum}
          soll={soll}
          onNeu={neu}
          onBearbeiten={bearbeite}
          onZeigen={zeige}
        />

        <div className="karte flex min-w-0 flex-col gap-3 p-6 md:col-span-2 xl:col-span-1">
          <Kennzahl
            wert={naechste ? Math.max(0, wochenAbstand(dieseWoche, montagVon(naechste.datum))) : '–'}
            einheit={naechste ? (wochenAbstand(dieseWoche, montagVon(naechste.datum)) === 1 ? 'Woche' : 'Wochen') : ''}
            text={naechste ? `bis zur ${PRUEFUNG_NAME[naechste.key]} (${wochentagKurz(naechste.datum)}${naechste.datum.slice(0, 4)})` : 'Kein Prüfungstermin eingetragen'}
          />
          <Kennzahl
            wert={fehlendeBerichte.length}
            einheit={fehlendeBerichte.length === 1 ? 'Bericht fehlt' : 'Berichte fehlen'}
            text={`${faelligeWochen.length - fehlendeBerichte.length} von ${faelligeWochen.length} fälligen Wochen geschrieben`}
            warnung={fehlendeBerichte.length > 0}
            link={{ to: '/berichtsheft', text: 'Zum Berichtsheft' }}
          />
          <Kennzahl
            wert={offen.length}
            einheit={offen.length === 1 ? 'offene Aufgabe' : 'offene Aufgaben'}
            text={ueberfaellig.length ? `davon ${ueberfaellig.length} überfällig` : 'nichts überfällig'}
            warnung={ueberfaellig.length > 0}
          />
          <Link to="/einstellungen" className="mt-auto inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-accent">
            Beginn und Prüfungstermine ändern
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <WochenBereich
        jahre={jahre}
        nurBelegt={nurBelegt}
        setNurBelegt={setNurBelegt}
        istBelegt={istBelegt}
        dieseWoche={dieseWoche}
        heute={aktuelle && aktuelle.nummer > 0 ? aktuelle : null}
        gesamt={ausbildungsWochenGesamt}
        schule={schule}
        pruefungsWochen={new Set(termine.map((t) => montagVon(t.datum)))}
        ferienWochen={ferienWochen}
        zeigeFrei={zeigeFrei}
        setZeigeFrei={setZeigeFrei}
        ferienHinweis={kalender?.ferien.length ? kalender : null}
        eintraege={eintraege}
        pruefungInWoche={pruefungInWoche}
        felder={feldMap}
        zeitraum={zeitraum}
        onNeu={neu}
        onBearbeiten={bearbeite}
        onSpringe={zeige}
        berichte={berichtMap}
        soll={soll}
        onBericht={setBerichtWoche}
      />

      {auftrag && <EintragEditor auftrag={auftrag} wochen={wochen} felder={felder ?? []} onSchliessen={() => setAuftrag(null)} />}
      {berichtWoche && (
        <BerichtEditor
          woche={berichtWoche}
          onSchliessen={() => setBerichtWoche(null)}
          onDrucken={(m) => {
            setBerichtWoche(null);
            drucken([m]);
          }}
        />
      )}
    </FreiKontext.Provider>
  );
}

/** Seitenleiste (ab lg) und die Wochenliste, gruppiert nach Ausbildungsjahr. */
function WochenBereich({
  jahre,
  nurBelegt,
  setNurBelegt,
  istBelegt,
  dieseWoche,
  heute,
  gesamt,
  schule,
  pruefungsWochen,
  ferienWochen,
  zeigeFrei,
  setZeigeFrei,
  ferienHinweis,
  eintraege,
  pruefungInWoche,
  felder,
  zeitraum,
  onNeu,
  onBearbeiten,
  onSpringe,
  berichte,
  soll,
  onBericht,
}: {
  jahre: Map<number, Woche[]>;
  nurBelegt: boolean;
  setNurBelegt: (x: boolean) => void;
  istBelegt: (w: Woche) => boolean;
  dieseWoche: string;
  heute: Woche | null;
  gesamt: number;
  schule: Set<string>;
  pruefungsWochen: Set<string>;
  ferienWochen: Set<string>;
  zeigeFrei: boolean;
  setZeigeFrei: (x: boolean) => void;
  ferienHinweis: Ferien | null;
  eintraege: PlanEintrag[];
  pruefungInWoche: (w: Woche) => Pruefungstermin[];
  felder: Map<string, Themenfeld>;
  zeitraum: { beginn: string; ende: string };
  onNeu: (w: Woche) => void;
  onBearbeiten: (e: PlanEintrag) => void;
  onSpringe: (montag: string) => void;
  berichte: Map<string, Bericht>;
  soll: number;
  onBericht: (w: Woche) => void;
}) {
  const sichtbar = new Map([...jahre.entries()].map(([j, ws]) => [j, nurBelegt ? ws.filter(istBelegt) : ws]));
  const alle = [...sichtbar.values()].flat();
  const gelesenId = useAktiverAbschnitt(alle.map((w) => `kw-${w.montag}`));
  // Vor der ersten Woche (Kopf der Seite): die aktuelle Woche anzeigen
  const gelesen = alle.find((w) => `kw-${w.montag}` === gelesenId) ?? null;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="karte hidden p-5 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
        <PlanKompass
          jahre={jahre}
          gelesen={gelesen}
          heute={heute}
          gesamt={gesamt}
          schule={schule}
          pruefungsWochen={pruefungsWochen}
          ferienWochen={ferienWochen}
          onSpringe={onSpringe}
        />
      </aside>

      <div className="flex min-w-0 flex-col gap-6">
        <section aria-label="Ansicht" className="flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="Wochen anzeigen" className="flex gap-1 rounded-xl border border-line bg-card p-1">
            {(
              [
                [false, 'Alle Wochen'],
                [true, 'Nur mit Einträgen'],
              ] as const
            ).map(([wert, label]) => (
              <button
                key={String(wert)}
                type="button"
                aria-pressed={nurBelegt === wert}
                onClick={() => setNurBelegt(wert)}
                className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  nurBelegt === wert ? 'bg-accent text-on-accent' : 'text-ink hover:bg-chip'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={zeigeFrei}
              onChange={(x) => setZeigeFrei(x.target.checked)}
              className="h-5 w-5 accent-[var(--c-accent)]"
            />
            Ferien und Feiertage
          </label>
          {/* Auf kleinen Bildschirmen ersetzt das die Seitenleiste */}
          <nav aria-label="Zum Ausbildungsjahr springen" className="flex flex-wrap gap-1 lg:hidden">
            {[...jahre.keys()].map((j) => (
              <a key={j} href={`#jahr-${j}`} className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-semibold text-accent hover:bg-chip">
                {j === 0 ? 'Vorher' : `${j}. Jahr`}
              </a>
            ))}
          </nav>
        </section>

        <Legende ferien={zeigeFrei} />
        {zeigeFrei && ferienHinweis && (
          <p className="-mt-3 text-xs text-muted">
            Schulferien {ferienHinweis.land} laut {ferienHinweis.quelle}. {ferienHinweis.hinweis}
          </p>
        )}

        {[...jahre.entries()].map(([jahr, ws]) => {
          const liste = sichtbar.get(jahr) ?? [];
          const schulInJahr = ws.filter((w) => schule.has(w.montag)).length;
          return (
            <section key={jahr} id={`jahr-${jahr}`} aria-labelledby={`jahr-${jahr}-titel`} className="karte scroll-mt-24 px-4 pb-2 pt-5 sm:px-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3">
                <h2 id={`jahr-${jahr}-titel`} className="text-xl font-semibold">
                  {jahrTitel(jahr)}
                </h2>
                <span className="text-sm text-muted">
                  {tagMonat(ws[0].montag)}
                  {ws[0].montag.slice(0, 4)} – {tagMonat(ws[ws.length - 1].sonntag)}
                  {ws[ws.length - 1].sonntag.slice(0, 4)} · {ws.length} {ws.length === 1 ? 'Woche' : 'Wochen'} · {schulInJahr} in der Schule
                </span>
              </div>
              {liste.length === 0 ? (
                <p className="border-t border-line py-4 text-sm text-muted">In diesem Jahr ist noch nichts eingetragen.</p>
              ) : (
                <ol className="flex flex-col">
                  {liste.map((w, i) => {
                    const monat = monatDerWoche(w);
                    const vorher = i > 0 ? monatDerWoche(liste[i - 1]) : '';
                    return (
                      <WochenZeile
                        key={w.montag}
                        woche={w}
                        monat={monat !== vorher ? monat : null}
                        aktuell={w.montag === dieseWoche}
                        vergangen={w.montag < dieseWoche}
                        schule={schule.has(w.montag)}
                        eintraege={eintraegeDerWoche(eintraege, w.montag)}
                        pruefungen={pruefungInWoche(w)}
                        felder={felder}
                        zeitraum={zeitraum}
                        onNeu={() => onNeu(w)}
                        onBearbeiten={onBearbeiten}
                        bericht={berichte.get(w.montag)}
                        berichtZeigen={w.nummer > 0 && (w.montag <= dieseWoche || berichte.has(w.montag))}
                        soll={soll}
                        onBericht={() => onBericht(w)}
                      />
                    );
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Kennzahl({
  wert,
  einheit,
  text,
  warnung,
  link,
}: {
  wert: number | string;
  einheit: string;
  text: string;
  warnung?: boolean;
  link?: { to: string; text: string };
}) {
  return (
    <div className="flex flex-col border-b border-line pb-3 last-of-type:border-0">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold leading-none">{wert}</span>
        <span className="font-semibold">{einheit}</span>
      </div>
      <span className={`text-sm ${warnung ? 'font-semibold text-rot' : 'text-muted'}`}>{text}</span>
      {link && (
        <Link to={link.to} className="mt-0.5 inline-flex min-h-[32px] w-fit items-center gap-1.5 text-sm font-semibold text-accent">
          {link.text}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** Karte „Diese Woche“ bzw. „Nächste Woche“ oben auf der Seite. */
function WochenKarte({
  titel,
  woche,
  ersatz,
  gesamt,
  schule,
  eintraege,
  pruefungInWoche,
  felder,
  zeitraum,
  bericht,
  soll,
  onBericht,
  onNeu,
  onBearbeiten,
  onZeigen,
  hervorheben = false,
}: {
  titel: string;
  woche: Woche | null;
  ersatz: string;
  gesamt: number;
  schule: Set<string>;
  eintraege: PlanEintrag[];
  pruefungInWoche: (w: Woche) => Pruefungstermin[];
  felder: Map<string, Themenfeld>;
  zeitraum: { beginn: string; ende: string };
  bericht?: Bericht;
  soll: number;
  onBericht?: (w: Woche) => void;
  onNeu: (w: Woche) => void;
  onBearbeiten: (e: PlanEintrag) => void;
  onZeigen: (montag: string) => void;
  hervorheben?: boolean;
}) {
  const istSchule = woche ? schule.has(woche.montag) : false;
  return (
    <section aria-label={titel} className={`karte flex min-w-0 flex-col gap-4 p-5 ${hervorheben ? 'ring-2 ring-accent-soft' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="ueberschrift-klein">{titel}</span>
          <h2 className="text-xl font-bold leading-snug">{woche ? woche.label : '—'}</h2>
          <p className="text-sm text-muted">
            {!woche ? ersatz : woche.ausbildungsjahr === 0 ? 'vor der Ausbildung' : `${woche.ausbildungsjahr}. Ausbildungsjahr · Woche ${woche.nummer} von ${gesamt}`}
          </p>
        </div>
        {woche && (
          <span className={`chip flex items-center gap-1 py-1 text-sm ${istSchule ? ART.schule.stil : 'bg-chip text-muted'}`}>
            {istSchule && <School size={14} aria-hidden="true" />}
            {istSchule ? 'Schulwoche' : 'Betrieb'}
          </span>
        )}
      </div>
      {woche && (
        <WochenInhalt
          woche={woche}
          eintraege={eintraegeDerWoche(eintraege, woche.montag)}
          pruefungen={pruefungInWoche(woche)}
          felder={felder}
          zeitraum={zeitraum}
          onBearbeiten={onBearbeiten}
          leer="Noch nichts eingetragen."
        />
      )}
      {woche && (
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <button type="button" className="btn-sekundaer min-h-[40px] px-3" onClick={() => onNeu(woche)}>
            <Plus size={16} aria-hidden="true" />
            Eintrag
          </button>
          <button type="button" className="btn-sekundaer min-h-[40px] px-3" onClick={() => onZeigen(woche.montag)}>
            <CalendarRange size={16} aria-hidden="true" />
            Im Plan zeigen
          </button>
          {onBericht && woche.nummer > 0 && (
            <span className="ml-auto">
              <BerichtKnopf bericht={bericht} soll={soll} kw={woche.kw} onOeffnen={() => onBericht(woche)} />
            </span>
          )}
        </div>
      )}
    </section>
  );
}

function KeinBeginn() {
  const speichern = useEinstellungenSpeichern();
  const [wert, setWert] = useState('');
  return (
    <section className="karte flex max-w-[640px] flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <CalendarRange size={22} aria-hidden="true" />
        </span>
        <h2 className="text-xl font-semibold">Wann hat deine Ausbildung begonnen?</h2>
      </div>
      <p className="text-sm text-muted">
        Der Plan zeigt alle Kalenderwochen ab deinem ersten Ausbildungstag bis zum Vertragsende – drei Jahre oder kürzer, wenn du in den Einstellungen eine Verkürzung einträgst.
      </p>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(x) => {
          x.preventDefault();
          if (gueltigesDatum(wert)) speichern.mutate({ ausbildungsbeginn: wert });
        }}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="plan-beginn" className="text-sm font-semibold">
            Ausbildungsbeginn
          </label>
          <input id="plan-beginn" type="date" className="eingabe" value={wert} onChange={(x) => setWert(x.target.value)} required />
        </div>
        <button type="submit" className="btn-primaer" disabled={!gueltigesDatum(wert)}>
          Plan anlegen
        </button>
      </form>
    </section>
  );
}

function Legende({ ferien }: { ferien: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted" aria-label="Legende">
      <span className="flex items-center gap-2">
        <span className="h-4 w-1.5 rounded-full bg-schule" aria-hidden="true" />
        Schulwoche
      </span>
      {ART_REIHE.map((a) => {
        const { icon: Icon, label, stil } = ART[a];
        return (
          <span key={a} className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-md ${stil}`}>
              <Icon size={14} aria-hidden="true" />
            </span>
            {label}
          </span>
        );
      })}
      <span className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-seg-rot text-seg-rot-ink">
          <GraduationCap size={14} aria-hidden="true" />
        </span>
        Prüfung
      </span>
      {ferien && (
        <>
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ferien-soft text-ferien">
              <Sun size={14} aria-hidden="true" />
            </span>
            Schulferien
          </span>
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-card">
              <CalendarHeart size={14} aria-hidden="true" />
            </span>
            Feiertag
          </span>
        </>
      )}
    </div>
  );
}

function WochenZeile({
  woche,
  monat,
  aktuell,
  vergangen,
  schule,
  eintraege,
  pruefungen,
  felder,
  zeitraum,
  onNeu,
  onBearbeiten,
  bericht,
  berichtZeigen,
  soll,
  onBericht,
}: {
  woche: Woche;
  monat: string | null;
  aktuell: boolean;
  vergangen: boolean;
  schule: boolean;
  eintraege: PlanEintrag[];
  pruefungen: Pruefungstermin[];
  felder: Map<string, Themenfeld>;
  zeitraum: { beginn: string; ende: string };
  onNeu: () => void;
  onBearbeiten: (e: PlanEintrag) => void;
  bericht: Bericht | undefined;
  berichtZeigen: boolean;
  soll: number;
  onBericht: () => void;
}) {
  return (
    <>
      {monat && (
        <li aria-hidden="true" className="border-t border-line pb-1 pt-3">
          <span className="ueberschrift-klein">{monat}</span>
        </li>
      )}
      <li
        id={`kw-${woche.montag}`}
        aria-current={aktuell ? 'date' : undefined}
        className={`group relative grid scroll-mt-24 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-t border-line py-2 pl-4 pr-1 sm:grid-cols-[128px_minmax(0,1fr)_auto] ${
          aktuell ? 'rounded-lg bg-accent-soft' : ''
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute bottom-1 left-0 top-1 w-1.5 rounded-full ${schule ? 'bg-schule' : 'bg-transparent'}`}
        />
        {/* Handy: KW-Kopf in einer Zeile oben, Einträge darunter; ab sm: drei Spalten */}
        <div
          className={`flex flex-wrap items-baseline gap-x-2 pt-1 sm:flex-col sm:gap-0 ${vergangen && !aktuell ? 'opacity-70' : ''}`}
        >
          <strong className="leading-tight">
            KW {woche.kw}
            {schule && <span className="sr-only"> (Schulwoche)</span>}
          </strong>
          <span className="text-xs text-muted">
            {tagMonat(woche.montag)}–{tagMonat(woche.sonntag)}
          </span>
          {aktuell && <span className="chip bg-accent text-on-accent sm:mt-1">Diese Woche</span>}
        </div>
        <div className="flex items-start justify-end gap-1 sm:col-start-3 sm:row-start-1">
          {berichtZeigen && <BerichtKnopf bericht={bericht} soll={soll} kw={woche.kw} onOeffnen={onBericht} />}
          <button
            type="button"
            onClick={onNeu}
            aria-label={`Eintrag in KW ${woche.kw} hinzufügen`}
            title="Eintrag hinzufügen"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted opacity-60 transition hover:bg-chip hover:text-accent hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Plus size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="col-span-2 min-w-0 py-0.5 empty:hidden sm:col-span-1 sm:col-start-2 sm:row-start-1">
          <WochenInhalt
            woche={woche}
            eintraege={eintraege}
            pruefungen={pruefungen}
            felder={felder}
            zeitraum={zeitraum}
            onBearbeiten={onBearbeiten}
          />
        </div>
      </li>
    </>
  );
}

/**
 * Alles, was in einer Woche steht – klar getrennt:
 * oben eine Zeile mit besonderen Tagen (Ferien, Feiertage, Prüfungen, Beginn/Ende),
 * darunter die eigenen Einträge als einheitliche Karten.
 */
function WochenInhalt({
  woche,
  eintraege,
  pruefungen,
  felder,
  zeitraum,
  onBearbeiten,
  leer,
}: {
  woche: Woche;
  eintraege: PlanEintrag[];
  pruefungen: Pruefungstermin[];
  felder: Map<string, Themenfeld>;
  zeitraum: { beginn: string; ende: string };
  onBearbeiten: (e: PlanEintrag) => void;
  leer?: string;
}) {
  const frei = useFreieWoche(woche.montag);
  const { data: projekt } = useProjekt();
  const tage: ReactNode[] = [];
  for (const p of pruefungen) {
    tage.push(
      <li key={p.key}>
        <Link to="/pruefung" className={`${TAG_CHIP} bg-seg-rot font-semibold text-seg-rot-ink hover:underline`}>
          <GraduationCap size={14} aria-hidden="true" />
          {PRUEFUNG_NAME[p.key]} · {wochentagKurz(p.datum)}
          <span className="sr-only">({PRUEFUNG_KURZ[p.key]})</span>
        </Link>
      </li>,
    );
  }
  for (const t of projektTermine(projekt).filter((x) => montagVon(x.datum) === woche.montag)) {
    tage.push(
      <li key={`p-${t.key}`}>
        <Link to="/pruefung/projekt" className={`${TAG_CHIP} bg-accent-soft font-semibold text-accent hover:underline`}>
          <BriefcaseBusiness size={14} aria-hidden="true" />
          {t.kurz} · {wochentagKurz(t.datum)}
        </Link>
      </li>,
    );
  }
  if (montagVon(zeitraum.beginn) === woche.montag) {
    tage.push(
      <TagChip key="beginn" icon={Flag} stil="bg-seg-gruen font-semibold text-seg-gruen-ink">
        Ausbildungsbeginn · {wochentagKurz(zeitraum.beginn)}
      </TagChip>,
    );
  }
  if (montagVon(zeitraum.ende) === woche.montag) {
    tage.push(
      <TagChip key="ende" icon={Flag} stil="bg-chip font-semibold text-muted">
        Vertragsende · {wochentagKurz(zeitraum.ende)}
      </TagChip>,
    );
  }
  for (const f of frei.ferien) {
    tage.push(
      <TagChip key={`f-${f.von}`} icon={Sun} stil="bg-ferien-soft text-ferien">
        <strong className="font-semibold">{f.name}</strong>
        {f.von === f.bis ? ` · ${wochentagKurz(f.von)}` : ` ${tagMonat(f.von)}–${tagMonat(f.bis)}`}
      </TagChip>,
    );
  }
  for (const t of frei.feiertage) {
    tage.push(
      <TagChip key={`t-${t.datum}`} icon={CalendarHeart} stil="border border-line bg-card text-ink">
        <span className="text-muted">Feiertag</span> <strong className="font-semibold">{t.name}</strong> · {wochentagKurz(t.datum)}
      </TagChip>,
    );
  }

  if (!tage.length && !eintraege.length) {
    return leer ? <p className="text-sm text-muted">{leer}</p> : null;
  }
  return (
    <div className="flex flex-col gap-2">
      {tage.length > 0 && (
        <ul aria-label="Besondere Tage" className="flex flex-wrap gap-1.5">
          {tage}
        </ul>
      )}
      {eintraege.length > 0 && (
        <ul aria-label="Einträge" className="flex flex-col gap-1.5">
          {eintraege.map((x) => (
            <EintragKarte key={x.id} e={x} woche={woche} feld={felder.get(x.themenfeld)} onBearbeiten={() => onBearbeiten(x)} />
          ))}
        </ul>
      )}
    </div>
  );
}

const TAG_CHIP = 'inline-flex min-h-[28px] items-center gap-1.5 rounded-md px-2 py-0.5 text-[13px] leading-snug';

function TagChip({ icon: Icon, stil, children }: { icon: LucideIcon; stil: string; children: ReactNode }) {
  return (
    <li>
      <span className={`${TAG_CHIP} ${stil}`}>
        <Icon size={14} className="shrink-0" aria-hidden="true" />
        <span>{children}</span>
      </span>
    </li>
  );
}

/**
 * Ein Eintrag als Karte mit festem Aufbau:
 * Symbol (bei Aufgaben das Häkchen) · Titel · eine Infozeile · Bearbeiten-Knopf,
 * darunter Beschreibung und eingerückte Unteraufgaben.
 */
function EintragKarte({
  e,
  woche,
  feld,
  onBearbeiten,
}: {
  e: PlanEintrag;
  woche: Woche;
  feld: Themenfeld | undefined;
  onBearbeiten: () => void;
}) {
  const speichern = usePlanSpeichern();
  const art = ART[e.art];
  const Icon = art.icon;
  const dauer = wochenAbstand(e.von, e.bis) + 1;
  const nr = wochenAbstand(e.von, woche.montag) + 1;
  const titel = e.titel || (feld ? feld.titel : 'Themenfeld');
  const z = feld ? zaehle(feld.unterthemen) : null;
  const teile = e.art === 'aufgabe' ? e.unteraufgaben : [];
  const geschafft = teile.filter((u) => u.erledigt).length;
  const erledigt = e.art === 'aufgabe' && !!e.erledigt;

  /** Unteraufgabe umschalten; sind danach alle erledigt, gilt die Aufgabe als erledigt (und umgekehrt). */
  const schalte = (i: number) => {
    const neu = teile.map((u, j) => (j === i ? { ...u, erledigt: !u.erledigt } : u));
    speichern.mutate({ id: e.id, werte: { unteraufgaben: neu, erledigt: neu.every((u) => u.erledigt) } });
  };

  // Infozeilen: 1) Art und Dauer, 2) Themenfeld mit Lernstand, 3) Fortschritt der Unteraufgaben
  const art1 = `${art.label}${dauer > 1 ? ` · Woche ${nr} von ${dauer}` : ''}`;
  return (
    <li className="grid min-w-0 grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-x-2.5 rounded-lg border border-line bg-card px-3 py-2">
      {e.art === 'aufgabe' ? (
        <input
          type="checkbox"
          checked={erledigt}
          onChange={(x) => speichern.mutate({ id: e.id, werte: { erledigt: x.target.checked } })}
          aria-label={`${titel} erledigt`}
          className="mt-0.5 h-6 w-6 cursor-pointer accent-[var(--c-accent)]"
        />
      ) : (
        <span className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-md ${art.stil}`} title={art.label}>
          <Icon size={16} aria-hidden="true" />
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        <span className={`font-semibold leading-snug ${erledigt ? 'text-muted line-through' : ''}`}>{titel}</span>
        <span className="text-xs text-muted">{art1}</span>
        {feld && z && (
          <Link
            to={`/thema/${feld.id}`}
            className="mt-0.5 inline-flex w-fit max-w-full flex-wrap items-center gap-x-1.5 text-xs font-medium text-accent hover:underline"
          >
            {(e.art !== 'thema' || e.titel) && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <ThemenIcon name={feld.icon} size={12} />
                <span className="truncate">{feld.titel}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              Lernstand {prozent(z)} %
              <Punkt status={ampelVon(z)} size={8} />
              <span className="sr-only">{AMPEL[ampelVon(z)].label}</span>
            </span>
          </Link>
        )}
        {teile.length > 0 && (
          <span className={`text-xs ${geschafft === teile.length ? 'font-semibold text-seg-gruen-ink' : 'text-muted'}`}>
            {geschafft} von {teile.length} Unteraufgaben erledigt
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onBearbeiten}
        aria-label={`${titel} bearbeiten`}
        title="Bearbeiten"
        className="-mr-1.5 -mt-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-chip hover:text-accent"
      >
        <Pencil size={15} aria-hidden="true" />
      </button>
      {e.text && <p className="col-start-2 col-end-4 mt-1 line-clamp-2 whitespace-pre-line text-sm text-muted">{e.text}</p>}
      {teile.length > 0 && (
        <ul aria-label={`Unteraufgaben von ${titel}`} className="col-start-2 col-end-4 mt-1.5 flex flex-col border-l-2 border-line pl-3">
          {teile.map((u, i) => (
            <li key={i}>
              <label className="flex min-h-[30px] cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={u.erledigt}
                  onChange={() => schalte(i)}
                  className="h-[18px] w-[18px] shrink-0 cursor-pointer accent-[var(--c-accent)]"
                />
                <span className={u.erledigt ? 'text-muted line-through' : ''}>{u.text}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
