import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowDownRight, CircleHelp, Lightbulb, Pencil, Star, Wrench } from 'lucide-react';
import { useEinstellungen, useThemenfelder, useUnterthemaAendern } from '../api';
import { ampelVon, AMPEL, balkenLabel, prozent, zaehle, zusammenfassung } from '../lib/ampel';
import { merke } from '../lib/merken';
import { useAktiverAbschnitt } from '../lib/lesestelle';
import type { Themenfeld, Unterthema } from '../types';
import { AmpelSegment } from '../components/AmpelSegment';
import { TextFeld } from '../components/TextFeld';
import { Chips, FehlerHinweis, Inline, Laedt, Punkt, StapelBalken, StatusPille } from '../components/ui';
import { ZusatzBereich } from '../zusatz/ZusatzBereich';
import { AbbildungBlock } from '../components/Grafik';
import { TabelleAnsicht } from '../components/TabelleAnsicht';
import { vertiefungen, type Verweis } from '../lib/vertiefung';
import { werkzeugeFuer } from '../lib/werkzeugListe';

export function Cheatsheet() {
  const { slug } = useParams();
  const { data: felder, error, isLoading } = useThemenfelder();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) merke('letztes-thema', slug);
  }, [slug]);

  const feld = felder?.find((f) => f.id === slug);
  const anker = feld ? [...feld.unterthemen.map((u) => `u-${u.id}`), ...feld.zusatz.map((z) => `z-${z.id}`)] : [];
  const aktiv = useAktiverAbschnitt(anker);

  if (isLoading) return <Laedt />;
  if (error || !felder) return <FehlerHinweis fehler={error} />;

  /** Sprung aus dem Inhaltsverzeichnis zu einem Unterthema oder Zusatzwissen. */
  const springe = (ziel: string) => document.getElementById(ziel)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="flex flex-wrap items-start gap-6">
      <aside
        aria-label="Themenfelder"
        className="karte min-w-0 flex-[1_1_260px] px-2 py-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
      >
        <h2 className="mx-2 mb-2 text-sm font-semibold text-muted">Themenfelder</h2>
        <ul className="flex flex-col gap-0.5">
          {felder.map((f) => {
            const z = zaehle(f.unterthemen);
            const a = ampelVon(z);
            const an = f.id === slug;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/thema/${f.id}`)}
                  aria-current={an ? 'page' : undefined}
                  className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg p-2 text-left text-sm transition ${
                    an ? 'bg-accent-soft font-semibold text-accent' : 'font-medium hover:bg-chip'
                  }`}
                >
                  <Punkt status={a} />
                  <span className="min-w-0 flex-1">
                    {f.titel}
                    <span className="sr-only">, {AMPEL[a].label}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">{prozent(z)} %</span>
                </button>
                {an && <Inhaltsverzeichnis feld={f} aktiv={aktiv} onSpringen={springe} />}
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
        {feld ? (
          <ThemenfeldAnsicht key={feld.id} feld={feld} felder={felder} />
        ) : (
          <UnbekanntesThema slug={slug} />
        )}
      </div>
    </div>
  );
}

/** Unterthemen und Zusatzwissen des aktuellen Themenfelds; markiert, was gerade gelesen wird. Nur auf breiten Bildschirmen. */
function Inhaltsverzeichnis({
  feld,
  aktiv,
  onSpringen,
}: {
  feld: Themenfeld;
  aktiv: string | null;
  onSpringen: (ziel: string) => void;
}) {
  const eintrag = (ziel: string, inhalt: ReactNode, key: string) => {
    const an = aktiv === ziel;
    return (
      <li key={key}>
        <button
          type="button"
          onClick={() => onSpringen(ziel)}
          aria-current={an ? 'location' : undefined}
          className={`-ml-px flex min-h-[32px] w-full items-center gap-2 border-l-2 py-1 pl-3 pr-2 text-left text-[13px] leading-snug transition ${
            an ? 'border-accent font-semibold text-accent' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          {inhalt}
        </button>
      </li>
    );
  };
  return (
    <nav aria-label={`Inhalt: ${feld.titel}`} className="mb-2 ml-[18px] mt-1 hidden lg:block">
      <ul className="border-l border-line">
        {feld.unterthemen.map((u) =>
          eintrag(
            `u-${u.id}`,
            <>
              <Punkt status={u.status} size={8} />
              <span className="min-w-0 flex-1">{u.titel}</span>
            </>,
            u.id,
          ),
        )}
      </ul>
      {feld.zusatz.length > 0 && (
        <>
          <p className="mb-1 ml-3 mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Zusatzwissen</p>
          <ul className="border-l border-line">
            {feld.zusatz.map((z) =>
              eintrag(
                `z-${z.id}`,
                <>
                  <Star size={12} className="shrink-0 text-accent" aria-hidden="true" />
                  <span className="min-w-0 flex-1">{z.titel}</span>
                </>,
                z.id,
              ),
            )}
          </ul>
        </>
      )}
    </nav>
  );
}

function UnbekanntesThema({ slug }: { slug?: string }) {
  return (
    <div className="karte p-6">
      <h1 className="text-2xl font-bold">Themenfeld nicht gefunden</h1>
      <p className="mt-2 text-muted">„{slug}“ gibt es nicht (mehr). Wähle links ein Themenfeld aus.</p>
    </div>
  );
}

function ThemenfeldAnsicht({
  feld,
  felder,
}: {
  feld: Themenfeld;
  felder: Themenfeld[];
}) {
  const vertieft = vertiefungen(felder);
  const z = zaehle(feld.unterthemen);
  const ampel = ampelVon(z);
  const luecken = feld.unterthemen.filter((u) => u.status === 'gelb' && u.luecke.trim()).length;
  const { hash } = useLocation();

  // Sprung zu einem Zusatzwissen: #z-<id>
  useEffect(() => {
    if (!hash.startsWith('#z-')) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    return () => clearTimeout(t);
  }, [hash, feld]);

  // Sprung aus dem Kompendium: #u-<id> scrollt zum Unterthema
  useEffect(() => {
    if (!hash.startsWith('#u-')) return;
    const id = decodeURIComponent(hash.slice(3));
    if (!feld.unterthemen.some((u) => u.id === id)) return;
    const t = setTimeout(() => document.getElementById(`u-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    return () => clearTimeout(t);
  }, [hash, feld]);



  return (
    <>
      <header className="karte flex flex-col gap-4 p-6">
        <Link to="/" className="inline-flex min-h-[44px] items-center gap-2 self-start text-sm font-medium text-accent">
          <ArrowLeft size={16} aria-hidden="true" />
          Zur Übersicht
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[32px] font-bold leading-tight">{feld.titel}</h1>
            <div className="mt-2">
              <Chips lernfelder={feld.lernfelder} pruefung={feld.pruefung} />
            </div>
          </div>
          <StatusPille status={ampel} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted">
              {z.n} Unterthemen: {zusammenfassung(z)}
            </span>
            <strong className="text-base">{prozent(z)} %</strong>
          </div>
          <StapelBalken z={z} label={balkenLabel(z)} />
        </div>
        {luecken > 0 && (
          <p className="flex items-center gap-2 rounded-lg bg-warn px-3 py-2 text-sm font-medium text-warn-ink">
            <Pencil size={16} aria-hidden="true" />
            {luecken === 1
              ? '1 Lernpunkt notiert – steht beim gelben Unterthema'
              : `${luecken} Lernpunkte notiert – stehen bei den gelben Unterthemen`}
          </p>
        )}
      </header>

      {feld.worum && (
        <section className="karte p-6">
          <h2 className="mb-2 text-xl font-semibold">Worum geht's</h2>
          <p>
            <Inline text={feld.worum} />
          </p>
        </section>
      )}

      <section className="karte px-6 pb-2 pt-6">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold">Unterthemen</h2>
          <span className="text-sm text-muted">Status setzen – bei „In Arbeit“ notierst du, was noch hakt.</span>
        </div>
        <div>
          {feld.unterthemen.map((u) => (
            <UnterthemaZeile
              key={u.id}
              feldId={feld.id}
              u={u}
              vertiefung={vertieft.get(`${feld.id}.${u.id}`) ?? []}
            />
          ))}
        </div>
      </section>

      {feld.fehler.length > 0 && (
        <section className="karte p-6">
          <h2 className="mb-2 text-xl font-semibold">Häufige Fehler</h2>
          <ul className="flex flex-col gap-2">
            {feld.fehler.map((f) => (
              <li key={f} className="flex gap-3">
                <AlertTriangle size={18} className="mt-1 shrink-0 text-rot" aria-hidden="true" />
                <span>
                  <Inline text={f} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ZusatzBereich feld={feld} felder={felder} />

      {feld.links.length > 0 && (
        <section className="karte p-6">
          <h2 className="mb-2 text-xl font-semibold">Weiterführende Links</h2>
          <ul className="flex flex-col gap-2">
            {feld.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline underline-offset-2">
                  {l.titel}
                </a>
                {l.info && <span className="text-muted"> – {l.info}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function UnterthemaZeile({
  feldId,
  u,
  vertiefung,
}: {
  feldId: string;
  u: Unterthema;
  vertiefung: Verweis[];
}) {
  const aendern = useUnterthemaAendern();
  const { data: einstellungen } = useEinstellungen();
  const id = `${feldId}.${u.id}`;
  const [notizOffen, setNotizOffen] = useState(false);
  const werkzeuge = werkzeugeFuer(feldId, u.id);

  return (
    <div id={`u-${u.id}`} className="scroll-mt-24 border-t border-line">
      <div className="flex flex-wrap items-center gap-2 py-2">
        <h3 className="flex min-h-[44px] min-w-0 flex-[1_1_240px] flex-wrap items-center gap-x-3 gap-y-1 py-2 text-lg font-semibold">
          <span>{u.titel}</span>
          {!u.hatInhalt && <span className="chip bg-chip font-normal text-muted">Gerüst</span>}
          {vertiefung.length > 0 && (
            <span className="chip inline-flex items-center gap-1 bg-accent-soft font-medium text-accent" title="Dazu gibt es Zusatzwissen">
              <Star size={12} aria-hidden="true" />
              Vertiefung
            </span>
          )}
        </h3>
        <AmpelSegment
          titel={u.titel}
          status={u.status}
          bestaetigen={einstellungen?.ampel_bestaetigen !== 'nein'}
          onChange={(s) => aendern.mutate({ id, patch: { status: s } })}
        />
      </div>

      {u.inhaltAktualisiert && (
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-accent-soft px-3 py-1 text-sm">
          <Lightbulb size={16} className="shrink-0 text-accent" aria-hidden="true" />
          <span className="flex-1">Inhalt aktualisiert – lohnt sich ein zweiter Blick.</span>
          <button
            type="button"
            className="min-h-[44px] px-2 font-semibold text-accent"
            onClick={() => aendern.mutate({ id, patch: { bestaetigen: true } })}
          >
            Gesehen
          </button>
        </div>
      )}

      {u.status === 'gelb' && (
        <div className="mb-4 rounded-lg bg-warn px-4 pt-3">
          <TextFeld
            id={`luecke-${id}`}
            label={
              <span className="flex items-center gap-2 text-warn-ink">
                <CircleHelp size={18} className="shrink-0" aria-hidden="true" />
                Was fällt dir noch schwer, was willst du dir nochmal anschauen?
              </span>
            }
            wert={u.luecke}
            platzhalter="z. B. Blockgröße bei /27 üben, Broadcast-Adresse verwechselt"
            onSpeichern={(t) => aendern.mutate({ id, patch: { luecke: t } })}
          />
          <p className="pb-2 text-xs text-muted">Bleibt gespeichert, auch wenn du später auf „Sicher“ wechselst.</p>
        </div>
      )}

        <div className="flex flex-col gap-6 pb-8">
          {vertiefung.length > 0 && (
            <div className="flex flex-col gap-1 rounded-lg border border-dashed border-line px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-muted">
                <Star size={16} className="text-accent" aria-hidden="true" />
                Vertiefung im Zusatzwissen
              </span>
              <ul className="flex flex-col">
                {vertiefung.map((v) => (
                  <li key={`${v.feldId}.${v.id}`}>
                    <Link
                      to={`/thema/${v.feldId}#z-${v.id}`}
                      className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-accent hover:underline"
                    >
                      <ArrowDownRight size={16} aria-hidden="true" />
                      {v.titel}
                      {v.feldId !== feldId && <span className="font-normal text-muted">({v.feldTitel})</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {werkzeuge.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-dashed border-line px-4 py-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-muted">
                <Wrench size={16} className="text-accent" aria-hidden="true" />
                Zum Ausprobieren
              </span>
              {werkzeuge.map((w) => (
                <Link
                  key={w.id}
                  to="/ueben#werkzeuge"
                  onClick={() => merke('werkzeug', w.id)}
                  className="inline-flex min-h-[44px] items-center font-semibold text-accent hover:underline"
                >
                  Werkzeug: {w.titel}
                </Link>
              ))}
            </div>
          )}
          {u.hatInhalt ? <UnterthemaInhalt u={u} /> : (
            <p className="rounded-lg border border-dashed border-line p-4 text-muted">
              Cheatsheet folgt. Bis dahin kannst du dir unten Notizen machen, z. B. was du in der Berufsschule nachfragen willst.
            </p>
          )}
          {u.notiz.trim() || notizOffen ? (
            <TextFeld
              id={`notiz-${id}`}
              label="Meine Notiz"
              wert={u.notiz}
              platzhalter="z. B. in Berufsschule nachfragen"
              onSpeichern={(t) => aendern.mutate({ id, patch: { notiz: t } })}
              fokus={notizOffen && !u.notiz.trim()}
            />
          ) : (
            <button
              type="button"
              onClick={() => setNotizOffen(true)}
              className="inline-flex min-h-[44px] items-center gap-2 self-start text-sm font-semibold text-accent hover:underline"
            >
              <Pencil size={16} aria-hidden="true" />
              Notiz hinzufügen
            </button>
          )}
        </div>
    </div>
  );
}

function UnterthemaInhalt({ u }: { u: Unterthema }) {
  return (
    <>
      {u.begriffe.length > 0 && (
        <div>
          <h3 className="ueberschrift-klein mb-2">Kernbegriffe</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[minmax(120px,max-content)_minmax(0,1fr)]">
            {u.begriffe.map((b) => (
              <div key={b.begriff} className="contents">
                <dt className="font-semibold">
                  <Inline text={b.begriff} />
                </dt>
                <dd className="mb-2 text-muted sm:mb-0">
                  <Inline text={b.erklaerung} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {u.abbildungen.map((a) => (
        <AbbildungBlock key={a.titel} a={a} />
      ))}

      {u.tabellen.map((t) => (
        <div key={t.titel}>
          <h3 className="ueberschrift-klein mb-2">{t.titel}</h3>
          <TabelleAnsicht t={t} />
        </div>
      ))}

      {u.befehle.length > 0 && (
        <div>
          <h3 className="ueberschrift-klein mb-2">Befehle</h3>
          <div className="flex flex-col gap-2">
            {u.befehle.map((b) => (
              <div key={b.befehl} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <code className="whitespace-pre-wrap break-words rounded-md bg-code px-2 py-1 font-mono text-sm text-code-ink">
                  {b.befehl}
                </code>
                {b.info && <span className="text-sm text-muted">{b.info}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {u.merksatz && (
        <div className="flex gap-3 rounded-lg bg-accent-soft p-4">
          <Lightbulb size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <strong className="block text-sm text-accent">Merksatz</strong>
            <Inline text={u.merksatz} />
          </div>
        </div>
      )}

      {u.frage && (
        <div className="rounded-lg border border-line bg-bg p-4">
          <h3 className="ueberschrift-klein mb-1">Typische Prüfungsfrage</h3>
          <p className="mb-2 font-semibold">
            <Inline text={u.frage.frage} />
          </p>
          <ol className="flex list-decimal flex-col gap-1 pl-5">
            {u.frage.loesung.map((l, i) => (
              <li key={i}>
                <Inline text={l} />
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}
