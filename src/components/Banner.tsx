import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { useChangelog, useEinstellungen, useEinstellungenSpeichern, useVersion } from '../api';
import { Inline } from './ui';

/**
 * Zwei Hinweise, nur bei App-Updates (nicht bei reinen Inhaltsänderungen):
 * 1. "Neue Version verfügbar" – der Browser zeigt noch das alte Frontend.
 * 2. "Neu in Version x" – einmalig nach einem Update.
 */
export function Banner() {
  const { data: version } = useVersion();
  const { data: einstellungen } = useEinstellungen();
  const { data: changelog } = useChangelog();
  const speichern = useEinstellungenSpeichern();

  const frontend = __APP_VERSION__;
  const veraltet = !!version && version.app !== frontend;
  const gesehen = einstellungen?.gesehene_version;

  // Erster Start: aktuelle Version still als gesehen speichern, damit kein Banner erscheint.
  useEffect(() => {
    if (einstellungen && !gesehen && version && !veraltet) {
      speichern.mutate({ gesehene_version: version.app });
    }
  }, [einstellungen, gesehen, version, veraltet]); // speichern bewusst nicht als Abhängigkeit

  if (veraltet) {
    return (
      <div role="status" className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-accent bg-card py-2 pl-4 pr-2">
        <RefreshCw size={20} className="shrink-0 text-accent" aria-hidden="true" />
        <span className="flex-[1_1_240px] text-sm">Es gibt eine neue Version des Lernkompass.</span>
        <button type="button" className="btn-primaer" onClick={() => window.location.reload()}>
          Seite neu laden
        </button>
      </div>
    );
  }

  if (version && gesehen && gesehen !== version.app) {
    const eintrag = changelog?.app.find((e) => e.version === version.app);
    const neu = eintrag?.gruppen.find((g) => g.titel === 'Neu')?.punkte[0] ?? eintrag?.gruppen[0]?.punkte[0];
    return (
      <div role="status" className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-accent-soft py-1 pl-4 pr-1">
        <Sparkles size={20} className="shrink-0 text-accent" aria-hidden="true" />
        <span className="flex-[1_1_240px] py-2 text-sm">
          <strong>Neu in Version {version.app}</strong>
          {neu && (
            <>
              : <Inline text={neu} />
            </>
          )}
        </span>
        <Link to="/einstellungen#ueber" className="inline-flex min-h-[44px] items-center px-2 text-sm font-semibold text-accent">
          Details
        </Link>
        <button
          type="button"
          aria-label="Hinweis schließen"
          onClick={() => speichern.mutate({ gesehene_version: version.app })}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-card"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return null;
}
