import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useBerichte, useEigeneUnterschrift, useEinstellungen } from '../api';
import { UnterschriftBild } from './Unterschrift';
import { GRUND, h, summe } from '../lib/bericht';
import { formatDatum } from '../lib/datum';
import { wochenAus, kalenderwoche, plusTage, wochentagKurz } from '../lib/kalender';
import type { Bericht, Einstellungen, Posten, Unterschrift } from '../types';

/**
 * Drucken bzw. „Als PDF speichern“ über den Druckdialog des Browsers.
 * Die Seiten werden in einen eigenen Bereich am Ende der Seite gerendert;
 * beim Drucken ist nur dieser Bereich sichtbar (siehe .druckbereich in index.css).
 */
interface Auftrag {
  montage: string[];
  deckblatt: boolean;
}

const DruckKontext = createContext<(montage: string[], deckblatt?: boolean) => void>(() => {});
export const useDrucken = () => useContext(DruckKontext);

export function DruckProvider({ children }: { children: ReactNode }) {
  const [auftrag, setAuftrag] = useState<Auftrag | null>(null);
  return (
    <DruckKontext.Provider value={(montage, deckblatt = false) => setAuftrag({ montage: [...montage].sort(), deckblatt })}>
      {children}
      {auftrag && <DruckBereich auftrag={auftrag} onFertig={() => setAuftrag(null)} />}
    </DruckKontext.Provider>
  );
}

function DruckBereich({ auftrag, onFertig }: { auftrag: Auftrag; onFertig: () => void }) {
  const { data: berichte } = useBerichte();
  const { data: e } = useEinstellungen();
  const { data: eigene, isLoading: eigeneLaedt } = useEigeneUnterschrift();

  useEffect(() => {
    if (!berichte || !e || eigeneLaedt) return;
    const vorher = document.title;
    const erste = auftrag.montage[0];
    const letzte = auftrag.montage[auftrag.montage.length - 1];
    // Dateiname beim Speichern als PDF
    document.title = `Ausbildungsnachweise ${e.azubi_name || ''} ${formatDatum(erste)}${letzte !== erste ? `-${formatDatum(plusTage(letzte, 6))}` : ''}`.trim();
    const fertig = () => {
      document.title = vorher;
      onFertig();
    };
    window.addEventListener('afterprint', fertig, { once: true });
    // zwei Frames warten, damit die Seiten gezeichnet sind
    const f = requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
    return () => {
      cancelAnimationFrame(f);
      window.removeEventListener('afterprint', fertig);
    };
  }, [berichte, e, eigeneLaedt]);

  if (!berichte || !e || eigeneLaedt) return null;
  const map = new Map(berichte.map((b) => [b.montag, b]));
  const liste = auftrag.montage.map((m) => map.get(m)).filter((b): b is Bericht => !!b);
  const nummer = new Map((wochenAus(e)?.wochen ?? []).map((w) => [w.montag, w]));

  return createPortal(
    <div className="druckbereich" aria-hidden="true">
      {auftrag.deckblatt && <Deckblatt e={e} berichte={liste} />}
      {liste.map((b) => (
        <BerichtSeite
          key={b.montag}
          b={b}
          e={e}
          nr={nummer.get(b.montag)?.nummer ?? 0}
          jahr={nummer.get(b.montag)?.ausbildungsjahr ?? 0}
          azubi={e.azubi_unterschrift_drucken === 'ja' ? (eigene ?? null) : null}
        />
      ))}
    </div>,
    document.body,
  );
}

function Kopfdaten({ e, zeilen }: { e: Einstellungen; zeilen: [string, ReactNode][] }) {
  return (
    <dl className="druck-daten">
      {[['Name', e.azubi_name || '—'] as [string, ReactNode], ['Ausbildungsberuf', e.ausbildungsberuf || '—'], ['Ausbildungsbetrieb', e.ausbildungsbetrieb || '—'], ...zeilen].map(
        ([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ),
      )}
    </dl>
  );
}

function Deckblatt({ e, berichte }: { e: Einstellungen; berichte: Bericht[] }) {
  const z = wochenAus(e);
  const erste = berichte[0]?.montag;
  const letzte = berichte[berichte.length - 1]?.montag;
  return (
    <section className="druck-seite druck-deckblatt">
      <h1>Ausbildungsnachweise</h1>
      <p className="druck-unter">Berichtsheft · wöchentlich</p>
      <Kopfdaten
        e={e}
        zeilen={[
          ['Ausbilder/in', e.ausbilder || '—'],
          ['Ausbildungszeit', z ? `${formatDatum(z.beginn)} – ${formatDatum(z.ende)}` : '—'],
          ['Enthaltene Nachweise', erste ? `${berichte.length} (${formatDatum(erste)} – ${formatDatum(plusTage(letzte, 6))})` : '—'],
        ]}
      />
      <Fuss e={e} text="Deckblatt" />
    </section>
  );
}

/** Ein Abschnitt der Nachweistabelle: Kopfzeile mit Zwischensumme, darunter die Zeilen (oder „– keine –“). */
function Abschnitt({ titel, zeilen, leer }: { titel: string; zeilen: { text: ReactNode; stunden: number }[]; leer: string }) {
  const zwischen = zeilen.reduce((n, z) => n + (z.stunden || 0), 0);
  return (
    <tbody>
      <tr className="druck-abschnitt">
        <th scope="rowgroup">{titel}</th>
        <th className="druck-h">{zeilen.length ? h(zwischen) : ''}</th>
      </tr>
      {zeilen.length ? (
        zeilen.map((z, i) => (
          <tr key={i}>
            <td>{z.text}</td>
            <td className="druck-h">{z.stunden ? h(z.stunden) : ''}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td className="druck-leer" colSpan={2}>
            {leer}
          </td>
        </tr>
      )}
    </tbody>
  );
}

const nachPosten = (l: Posten[]) => l.map((p) => ({ text: p.text, stunden: p.stunden }));

function BerichtSeite({ b, e, nr, jahr, azubi }: { b: Bericht; e: Einstellungen; nr: number; jahr: number; azubi: Unterschrift | null }) {
  const s = summe(b.inhalt);
  const sonntag = plusTage(b.montag, 6);
  return (
    <section className="druck-seite">
      <header className="druck-kopf">
        <div>
          <h1>Ausbildungsnachweis Nr. {nr || '–'}</h1>
          <span className="druck-unter">wöchentlich</span>
        </div>
      </header>
      <Kopfdaten
        e={e}
        zeilen={[
          ['Ausbildungsjahr', jahr ? String(jahr) : '—'],
          ['Berichtszeitraum', <strong key="z">{`${formatDatum(b.montag)} – ${formatDatum(sonntag)}`}</strong>],
        ]}
      />
      <table className="druck-tabelle">
        <colgroup>
          <col />
          <col className="druck-h" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Tätigkeit, Thema bzw. Grund</th>
            <th scope="col" className="druck-h">
              Stunden
            </th>
          </tr>
        </thead>
        <Abschnitt titel="Betriebliche Tätigkeiten" zeilen={nachPosten(b.inhalt.betrieb)} leer="– keine –" />
        <Abschnitt titel="Unterweisungen, betrieblicher Unterricht" zeilen={nachPosten(b.inhalt.unterweisung)} leer="– keine –" />
        <Abschnitt titel="Berufsschule (Themen des Unterrichts)" zeilen={nachPosten(b.inhalt.schule)} leer="– kein Berufsschulunterricht in dieser Woche –" />
        <Abschnitt
          titel="Abwesenheit (Urlaub, Krankheit, Feiertag)"
          zeilen={b.inhalt.abwesenheit.map((a) => ({
            text: `${wochentagKurz(a.tag)}${a.tag.slice(0, 4)} – ${GRUND[a.grund]}${a.text && a.grund !== 'krank' ? ` (${a.text})` : ''}`,
            stunden: a.stunden,
          }))}
          leer="– keine –"
        />
        <tfoot>
          <tr className="druck-summe">
            <th scope="row">Summe der Woche</th>
            <td className="druck-h">{h(s.gesamt)}</td>
          </tr>
        </tfoot>
      </table>
      <div className="druck-unterschrift">
        <p>Die ordnungsgemäße Führung des Ausbildungsnachweises wird bestätigt.</p>
        <div className="druck-felder">
          <div className="druck-feld">
            <span className="druck-wert">{b.status === 'abgezeichnet' && b.abgezeichnetAm ? formatDatum(b.abgezeichnetAm) : ''}</span>
            <span className="druck-linie">Datum</span>
          </div>
          <div className="druck-feld">
            {b.unterschrift && <UnterschriftBild pfad={b.unterschrift.pfad} className="druck-signatur" titel={`Unterschrift ${b.unterschrift.name}`} />}
            <span className="druck-linie">
              Unterschrift Ausbildende/r bzw. Ausbilder/in
              {b.unterschrift ? ` – ${b.unterschrift.name}, digital unterschrieben am ${formatDatum(b.unterschrift.datum)}` : ''}
            </span>
          </div>
        </div>
        {azubi && (
          <div className="druck-felder">
            <div className="druck-feld">
              <span className="druck-wert">{formatDatum(b.geaendert)}</span>
              <span className="druck-linie">Datum</span>
            </div>
            <div className="druck-feld">
              <UnterschriftBild pfad={azubi.pfad} className="druck-signatur" titel={`Unterschrift ${azubi.name}`} />
              <span className="druck-linie">Unterschrift Auszubildende/r – {azubi.name}</span>
            </div>
          </div>
        )}
      </div>
      <Fuss e={e} text={`KW ${kalenderwoche(b.montag).kw}/${kalenderwoche(b.montag).jahr}`} />
    </section>
  );
}

function Fuss({ e, text }: { e: Einstellungen; text: string }) {
  return (
    <footer className="druck-fuss">
      <span>
        {e.azubi_name || 'Ausbildungsnachweis'} · {text}
      </span>
      <span>erstellt mit dem FISI-Lernkompass</span>
    </footer>
  );
}
