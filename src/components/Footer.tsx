import { Link } from 'react-router-dom';
import { useVersion } from '../api';
import { formatDatum } from '../lib/datum';

export function Footer() {
  const { data } = useVersion();
  return (
    <footer className="flex flex-wrap justify-between gap-2 border-t border-line pt-4 text-xs text-muted">
      <span>
        FISI-Lernkompass · Version {__APP_VERSION__}
        {data?.inhalt ? ` · Inhalte vom ${formatDatum(data.inhalt)}` : ''}
      </span>
      <span className="flex gap-4">
        <Link to="/hilfe" className="font-semibold text-accent">
          Hilfe
        </Link>
        <Link to="/einstellungen#ueber" className="font-semibold text-accent">
          Was ist neu?
        </Link>
      </span>
    </footer>
  );
}
