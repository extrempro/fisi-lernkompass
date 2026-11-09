import { Link } from 'react-router-dom';

export function NichtGefunden() {
  return (
    <div className="karte p-6">
      <h1 className="text-2xl font-bold">Seite nicht gefunden</h1>
      <p className="mt-2 text-muted">
        Diese Adresse gibt es nicht.{' '}
        <Link to="/" className="font-semibold text-accent">
          Zur Übersicht
        </Link>
      </p>
    </div>
  );
}
