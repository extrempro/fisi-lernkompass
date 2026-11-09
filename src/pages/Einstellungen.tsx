import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ChevronDown, Download, Trash2, Upload } from 'lucide-react';
import { UnterschriftBild, UnterschriftFeld } from '../bericht/Unterschrift';
import {
  importiere,
  useEigeneUnterschrift,
  useEigeneUnterschriftSpeichern,
  useChangelog,
  useEinstellungen,
  useEinstellungenSpeichern,
  useInhaltsStand,
  useVersion,
  zuruecksetzen,
} from '../api';
import { ausbildungsstandAus, formatDatum, formatZeit } from '../lib/datum';
import type { ChangelogEintrag, Einstellungen as E } from '../types';
import { FehlerHinweis, Inline, Laedt } from '../components/ui';
import { AusbildungsDauer } from '../components/AusbildungsDauer';

/** So viele Versionen stehen einzeln in den Versionshinweisen, ältere gesammelt darunter. */
const NEUESTE = 10;

function Karte({ titel, id, children }: { titel: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id ?? titel}-titel`} className="karte flex scroll-mt-24 flex-col gap-4 p-6">
      <h2 id={`${id ?? titel}-titel`} className="text-xl font-semibold">
        {titel}
      </h2>
      {children}
    </section>
  );
}

export function Einstellungen() {
  const { data: e, error, isLoading } = useEinstellungen();
  const speichern = useEinstellungenSpeichern();
  const { data: version } = useVersion();
  const { data: stand } = useInhaltsStand();
  const { data: changelog } = useChangelog();
  const qc = useQueryClient();
  const location = useLocation();
  const [meldung, setMeldung] = useState('');

  useEffect(() => {
    if (location.hash && e) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [location.hash, e, changelog]);

  if (isLoading) return <Laedt />;
  if (error || !e) return <FehlerHinweis fehler={error} />;

  const ausbildung = ausbildungsstandAus(e);
  const setze = (werte: Partial<E>) => speichern.mutate(werte);

  const importieren = async (datei: File | undefined) => {
    if (!datei) return;
    try {
      const daten = JSON.parse(await datei.text());
      if (!window.confirm(`„${datei.name}“ einspielen? Dein aktueller Lernstand wird ersetzt (vorher wird automatisch gesichert).`)) return;
      const r = await importiere(daten);
      await qc.invalidateQueries();
      setMeldung(
        `Sicherung eingespielt: ${r.unterthemen} Unterthemen, ${r.zusatz} Zusatz-Einträge` +
          (r.plan === null ? ', Ausbildungsplan unverändert (nicht in der Sicherung)' : `, ${r.plan} Einträge im Ausbildungsplan`) +
          (r.berichte === null ? ', Berichtsheft unverändert (nicht in der Sicherung).' : `, ${r.berichte} Berichte.`),
      );
    } catch (err) {
      setMeldung(`Import fehlgeschlagen: ${(err as Error).message}`);
    }
  };

  const zuruecksetzenKlick = async () => {
    if (!window.confirm('Wirklich alle Ampeln auf Rot setzen und alle Lernpunkte und Notizen löschen? Vorher wird automatisch eine Sicherung angelegt.')) {
      return;
    }
    try {
      await zuruecksetzen();
      await qc.invalidateQueries();
      setMeldung('Fortschritt zurückgesetzt. Die Sicherung liegt im Ordner data/backups.');
    } catch (err) {
      setMeldung(`Zurücksetzen fehlgeschlagen: ${(err as Error).message}`);
    }
  };

  const aktuelleVersion = changelog?.app.some((c) => c.version === __APP_VERSION__) ? __APP_VERSION__ : changelog?.app[0]?.version;

  return (
    <div className="mx-auto flex w-full max-w-[800px] flex-col gap-6">
      <header>
        <h1 className="text-[32px] font-bold leading-tight">Einstellungen</h1>
        <p className="text-sm text-muted">Änderungen werden automatisch gespeichert.</p>
      </header>

      <Karte titel="Ausbildung">
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="beginn" className="text-sm font-semibold">
              Ausbildungsbeginn
            </label>
            <input id="beginn" type="date" className="eingabe" value={e.ausbildungsbeginn} onChange={(x) => setze({ ausbildungsbeginn: x.target.value })} />
          </div>
          <div role="status" className="flex min-h-[44px] flex-col justify-center rounded-lg bg-accent-soft px-4 py-2">
            <strong className="text-accent">{ausbildung.titel}</strong>
            {ausbildung.hinweis && <span className="text-sm text-muted">{ausbildung.hinweis}</span>}
          </div>
        </div>
        <p className="text-sm text-muted">
          Das Ausbildungsjahr und die Wochen im Ausbildungsplan rechnet die App aus dem Startdatum und der Ausbildungsdauer aus. Berufsschule ITECH · Prüfende Stelle:
          Handelskammer Hamburg.
        </p>
        <AusbildungsDauer e={e} setze={setze} />
      </Karte>

      <Karte titel="Berichtsheft" id="berichtsheft">
        <p className="-mt-2 text-sm text-muted">Diese Angaben stehen im Kopf jedes Ausbildungsnachweises und auf dem Deckblatt.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextEinstellung id="azubi_name" label="Dein Name" wert={e.azubi_name} onSpeichern={(v) => setze({ azubi_name: v })} />
          <TextEinstellung id="ausbildungsberuf" label="Ausbildungsberuf" wert={e.ausbildungsberuf} onSpeichern={(v) => setze({ ausbildungsberuf: v })} />
          <TextEinstellung id="ausbildungsbetrieb" label="Ausbildungsbetrieb" wert={e.ausbildungsbetrieb} onSpeichern={(v) => setze({ ausbildungsbetrieb: v })} />
          <TextEinstellung id="ausbilder" label="Ausbilder/in" wert={e.ausbilder} onSpeichern={(v) => setze({ ausbilder: v })} />
          <TextEinstellung
            id="wochenstunden"
            label="Wochenarbeitszeit (Stunden)"
            wert={e.wochenstunden}
            typ="number"
            onSpeichern={(v) => Number(v) >= 1 && Number(v) <= 60 && setze({ wochenstunden: String(Number(v)) })}
          />
        </div>
        <p className="text-sm text-muted">
          Die Nachweise werden wöchentlich geführt. Die Wochenarbeitszeit dient zum Abgleich der Stunden in jedem Bericht.
        </p>
        <EigeneUnterschrift
          name={e.azubi_name}
          drucken={e.azubi_unterschrift_drucken === 'ja'}
          onDrucken={(ja) => setze({ azubi_unterschrift_drucken: ja ? 'ja' : 'nein' })}
        />
      </Karte>

      <Karte titel="Prüfungstermine">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              ['zwischenpruefung', 'Abschlussprüfung Teil 1'],
              ['abschlusspruefung', 'Abschlussprüfung Teil 2'],
            ] as const
          ).map(([k, label]) => (
            <div key={k} className="flex flex-col gap-1">
              <label htmlFor={k} className="text-sm font-semibold">
                {label}
              </label>
              <input id={k} type="date" className="eingabe" value={e[k]} onChange={(x) => setze({ [k]: x.target.value } as Partial<E>)} />
            </div>
          ))}
        </div>
        <p className="text-sm text-muted">Der nächste Termin erscheint als Countdown auf der Übersicht und als Markierung im Ausbildungsplan.</p>
      </Karte>

      <Karte titel="Darstellung">
        <fieldset>
          <legend className="mb-2 text-sm text-muted">Farbschema</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(
              [
                ['auto', 'Automatisch'],
                ['light', 'Hell'],
                ['dark', 'Dunkel'],
              ] as const
            ).map(([wert, label]) => {
              const an = e.theme === wert;
              return (
                <label
                  key={wert}
                  className={`relative flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
                    an ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-card'
                  }`}
                >
                  <input type="radio" name="theme" value={wert} checked={an} onChange={() => setze({ theme: wert })} className="sr-only" />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>
      </Karte>

      <Karte titel="Bedienung">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--c-accent)]"
            checked={e.ampel_bestaetigen !== 'nein'}
            onChange={(x) => setze({ ampel_bestaetigen: x.target.checked ? 'ja' : 'nein' })}
          />
          <span>
            <strong className="block">Vor dem Umstellen einer Ampel nachfragen</strong>
            <span className="text-sm text-muted">Verhindert, dass ein versehentlicher Klick deinen Lernstand verstellt.</span>
          </span>
        </label>
      </Karte>

      <Karte titel="Hoodie" id="hoodie">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--c-accent)]"
            checked={e.companion !== 'aus'}
            onChange={(x) => setze({ companion: x.target.checked ? 'an' : 'aus' })}
          />
          <span>
            <strong className="block">Hoodie anzeigen</strong>
            <span className="text-sm text-muted">
              Der Companion unten links kommentiert Quiz, Karteikarten, Rechner, Ampeln und Berichtsheft. Ein Klick auf ihn bringt einen Spruch, das
              Minus verkleinert ihn. Während der Prüfungssimulation ist er ausgeblendet.
            </span>
          </span>
        </label>
        <fieldset disabled={e.companion === 'aus'} className="disabled:opacity-50">
          <legend className="mb-2 text-sm text-muted">Wie oft er etwas sagt</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(
              [
                ['selten', 'Selten'],
                ['normal', 'Normal'],
                ['gespraechig', 'Gesprächig'],
              ] as const
            ).map(([wert, label]) => {
              const an = (e.companion_haeufigkeit ?? 'normal') === wert;
              return (
                <label
                  key={wert}
                  className={`relative flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
                    an ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-card'
                  }`}
                >
                  <input
                    type="radio"
                    name="companion_haeufigkeit"
                    value={wert}
                    checked={an}
                    onChange={() => setze({ companion_haeufigkeit: wert })}
                    className="sr-only"
                  />
                  {label}
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-muted">Blick und Lichtfarbe zeigt er immer; Serien, Rundenergebnisse und Pausen-Hinweise sagt er auch bei „Selten“ an.</p>
        </fieldset>
      </Karte>

      <Karte titel="Daten">
        <p className="-mt-2 text-sm text-muted">
          Sichere deinen Fortschritt, deinen Ausbildungsplan und dein Berichtsheft regelmäßig als JSON-Datei, z. B. vor einem Update.
        </p>
        <div className="flex flex-wrap gap-2">
          <a href="/api/export" download className="btn-primaer">
            <Download size={18} aria-hidden="true" />
            Exportieren
          </a>
          <label className="btn-sekundaer cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
            <input
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={(x) => {
                void importieren(x.target.files?.[0]);
                x.target.value = '';
              }}
            />
            <Upload size={18} aria-hidden="true" />
            Importieren
          </label>
        </div>
        {meldung && (
          <p role="status" className="rounded-lg bg-accent-soft px-4 py-3 text-sm">
            {meldung}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <div>
            <strong className="block">Fortschritt zurücksetzen</strong>
            <span className="text-sm text-muted">Setzt alle Ampeln auf Rot und löscht Lernpunkte, Notizen und den Übungsstand der Karteikarten. Ausbildungsplan und Berichtsheft bleiben erhalten.</span>
          </div>
          <button type="button" onClick={zuruecksetzenKlick} className="btn border border-rot text-rot hover:bg-seg-rot">
            Zurücksetzen
          </button>
        </div>
      </Karte>

      <Karte titel="Über die App" id="ueber">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[minmax(140px,max-content)_minmax(0,1fr)]">
          <dt className="text-muted">App-Version</dt>
          <dd>
            <strong>{__APP_VERSION__}</strong>
            <span className="text-muted">
              {' '}
              · Build {__BUILD_DATE__} · <code className="font-mono">{__GIT_COMMIT__}</code>
            </span>
          </dd>
          <dt className="text-muted">Inhaltsstand</dt>
          <dd>
            <strong>{formatDatum(stand?.stand ?? version?.inhalt) || '–'}</strong>
            {stand && (
              <span className="text-muted">
                {' '}
                · {stand.befuellt} von {stand.themenfelder} Themenfeldern befüllt
              </span>
            )}
          </dd>
          <dt className="text-muted">Datenbank</dt>
          <dd>
            <strong>Schema {version?.schema ?? '–'}</strong>
            <span className="text-muted">
              {' '}
              · {version?.letzteSicherung ? `letzte Sicherung ${formatZeit(version.letzteSicherung)}` : 'noch keine Sicherung'}
            </span>
          </dd>
        </dl>

        <a href="#versionen" className="inline-flex min-h-[44px] w-fit items-center gap-2 text-sm font-semibold text-accent">
          Alle Versionshinweise ansehen
          <ArrowDown size={16} aria-hidden="true" />
        </a>
      </Karte>

      <Karte titel="Versionshinweise" id="versionen">
        <p className="-mt-2 text-sm text-muted">
          Was sich in jeder Version geändert hat. Die gleichen Texte stehen auf GitHub unter „Releases“.
        </p>
        {changelog ? (
          <div className="flex flex-col">
            {changelog.app.slice(0, NEUESTE).map((c) => (
              <VersionsEintrag
                key={c.version}
                eintrag={c}
                aktuell={c.version === aktuelleVersion}
                offen={c.version === aktuelleVersion}
              />
            ))}
            {changelog.app.length > NEUESTE && (
              // Ältere Versionen gesammelt, damit die Liste nicht endlos wird
              <details className="group/alt border-t border-line">
                <summary className="flex min-h-[52px] flex-wrap items-center gap-x-3 gap-y-1 py-2">
                  <ChevronDown size={18} className="shrink-0 text-muted transition group-open/alt:rotate-180" aria-hidden="true" />
                  <span className="font-semibold">Ältere Versionen</span>
                  <span className="text-sm text-muted">
                    {changelog.app[changelog.app.length - 1].version} bis {changelog.app[NEUESTE].version} · {changelog.app.length - NEUESTE} Versionen
                  </span>
                </summary>
                <div className="flex flex-col border-l-2 border-line pl-3">
                  {changelog.app.slice(NEUESTE).map((c) => (
                    <VersionsEintrag key={c.version} eintrag={c} aktuell={c.version === aktuelleVersion} offen={false} />
                  ))}
                </div>
              </details>
            )}
            {changelog.inhalte.length > 0 && (
              <details className="group border-t border-line">
                <summary className="flex min-h-[52px] items-center gap-3 py-2">
                  <ChevronDown size={18} className="shrink-0 text-muted transition group-open:rotate-180" aria-hidden="true" />
                  <span className="font-semibold">Änderungen an den Inhalten</span>
                  <span className="text-sm text-muted">{changelog.inhalte.length} Einträge</span>
                </summary>
                <div className="flex flex-col gap-4 pb-4 pl-8 text-sm">
                  {changelog.inhalte.map((c) => (
                    <div key={c.version + c.datum}>
                      <h3 className="ueberschrift-klein mb-1">Stand {formatDatum(c.datum)}</h3>
                      <ul className="flex list-disc flex-col gap-1 pl-5">
                        {c.gruppen.flatMap((g) => g.punkte).map((p) => (
                          <li key={p}>
                            <Inline text={p} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">Versionshinweise werden geladen …</p>
        )}
      </Karte>
    </div>
  );
}

/** Eine Version zum Aufklappen; die installierte Version ist geöffnet und markiert. */
function VersionsEintrag({ eintrag, aktuell, offen }: { eintrag: ChangelogEintrag; aktuell: boolean; offen: boolean }) {
  const anzahl = eintrag.gruppen.reduce((n, g) => n + g.punkte.length, 0);
  return (
    <details className="group border-t border-line first:border-t-0" open={offen}>
      <summary className="flex min-h-[52px] flex-wrap items-center gap-x-3 gap-y-1 py-2">
        <ChevronDown size={18} className="shrink-0 text-muted transition group-open:rotate-180" aria-hidden="true" />
        <span className="font-semibold">Version {eintrag.version}</span>
        {aktuell && <span className="chip bg-accent text-on-accent">installiert</span>}
        <span className="text-sm text-muted">
          {formatDatum(eintrag.datum)} · {anzahl} {anzahl === 1 ? 'Änderung' : 'Änderungen'}
        </span>
      </summary>
      <div className="flex flex-col gap-3 pb-4 pl-8 text-sm">
        {eintrag.gruppen.map((g) => (
          <div key={g.titel}>
            {g.titel && <h3 className="ueberschrift-klein mb-1">{g.titel}</h3>}
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {g.punkte.map((p) => (
                <li key={p}>
                  <Inline text={p} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}

/** Textfeld, das erst beim Verlassen (oder Enter) speichert – nicht bei jedem Tastendruck. */
function TextEinstellung({
  id,
  label,
  wert,
  onSpeichern,
  typ = 'text',
}: {
  id: string;
  label: string;
  wert: string;
  onSpeichern: (v: string) => void;
  typ?: 'text' | 'number';
}) {
  const [v, setV] = useState(wert);
  useEffect(() => setV(wert), [wert]);
  const speichere = () => {
    if (v.trim() !== wert) onSpeichern(v.trim());
  };
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={typ}
        className="eingabe"
        value={v}
        maxLength={200}
        {...(typ === 'number' ? { min: 1, max: 60, step: 0.5 } : {})}
        onChange={(x) => setV(x.target.value)}
        onBlur={speichere}
        onKeyDown={(x) => {
          if (x.key === 'Enter') speichere();
        }}
      />
    </div>
  );
}

/**
 * Eigene Unterschrift (optional): Auf dem Heft ist sie laut Handelskammer nicht nötig –
 * manche Betriebe möchten sie trotzdem. Einmal hinterlegen, auf Wunsch auf jedem Nachweis drucken.
 */
function EigeneUnterschrift({ name, drucken, onDrucken }: { name: string; drucken: boolean; onDrucken: (ja: boolean) => void }) {
  const { data: u, isLoading } = useEigeneUnterschrift();
  const speichern = useEigeneUnterschriftSpeichern();
  const [pfad, setPfad] = useState('');
  const [meldung, setMeldung] = useState('');
  if (isLoading) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <div>
        <strong className="block">Deine Unterschrift (optional)</strong>
        <span className="text-sm text-muted">
          Für die Handelskammer nicht nötig – du bestätigst auf dem Anmeldeformular. Nur wenn dein Betrieb sie auf jedem Nachweis möchte.
        </span>
      </div>
      {u ? (
        <div className="flex flex-wrap items-center gap-4">
          <UnterschriftBild pfad={u.pfad} className="h-16 w-48 rounded-lg border border-line bg-white text-slate-900" titel={`Unterschrift von ${u.name}`} />
          <div className="flex flex-col gap-1">
            <label className="flex min-h-[40px] cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="h-5 w-5 accent-[var(--c-accent)]" checked={drucken} onChange={(x) => onDrucken(x.target.checked)} />
              Auf jedem Nachweis mitdrucken
            </label>
            <button
              type="button"
              className="inline-flex min-h-[36px] w-fit items-center gap-1.5 text-sm font-semibold text-rot"
              onClick={() => {
                speichern.mutate(null);
                onDrucken(false);
              }}
            >
              <Trash2 size={15} aria-hidden="true" />
              Unterschrift löschen
            </button>
          </div>
        </div>
      ) : (
        <div className="flex max-w-[480px] flex-col gap-2">
          <UnterschriftFeld beschriftung={name || 'Deine Unterschrift'} onAendern={setPfad} />
          {!name && <span className="text-sm text-warn-ink">Trag oben zuerst deinen Namen ein.</span>}
          <button
            type="button"
            className="btn-primaer w-fit"
            disabled={!pfad || !name || speichern.isPending}
            onClick={() =>
              speichern.mutate(
                { name, pfad },
                { onSuccess: () => onDrucken(true), onError: (x) => setMeldung((x as Error).message) },
              )
            }
          >
            Unterschrift speichern
          </button>
          {meldung && (
            <p role="alert" className="text-sm text-rot">
              {meldung}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
