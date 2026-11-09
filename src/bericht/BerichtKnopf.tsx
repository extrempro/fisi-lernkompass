import { Check, NotebookPen, Pencil, Plus } from 'lucide-react';
import type { Bericht } from '../types';
import { formatDatum } from '../lib/datum';
import { h, STATUS_TEXT, summe } from '../lib/bericht';

const STIL = {
  fehlt: 'border-seg-rot bg-seg-rot text-seg-rot-ink',
  entwurf: 'border-accent-soft bg-accent-soft text-accent',
  fertig: 'border-accent bg-accent-soft text-accent',
  abgezeichnet: 'border-seg-gruen bg-seg-gruen text-seg-gruen-ink',
} as const;

/** Status des Wochenberichts als Knopf, öffnet die Eingabe. */
export function BerichtKnopf({
  bericht,
  soll,
  onOeffnen,
  kw,
  kompakt = false,
}: {
  bericht: Bericht | undefined;
  soll: number;
  onOeffnen: () => void;
  kw: number;
  kompakt?: boolean;
}) {
  const status = bericht ? bericht.status : 'fehlt';
  const Icon = status === 'fehlt' ? Plus : status === 'abgezeichnet' ? Check : status === 'fertig' ? NotebookPen : Pencil;
  const s = bericht ? summe(bericht.inhalt).gesamt : 0;
  const text =
    status === 'fehlt'
      ? 'Bericht schreiben'
      : status === 'abgezeichnet'
        ? `Abgezeichnet${bericht?.abgezeichnetAm ? ` ${formatDatum(bericht.abgezeichnetAm).slice(0, 6)}` : ''}`
        : `${STATUS_TEXT[status]} · ${h(s)}/${h(soll)} h`;
  return (
    <button
      type="button"
      onClick={onOeffnen}
      title={`Berichtsheft KW ${kw}: ${STATUS_TEXT[status]}`}
      aria-label={`Berichtsheft KW ${kw}: ${STATUS_TEXT[status]}${status === 'fehlt' ? ', jetzt schreiben' : ', öffnen'}`}
      className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-xs font-semibold transition hover:opacity-80 ${STIL[status]}`}
    >
      <Icon size={14} aria-hidden="true" />
      {kompakt ? STATUS_TEXT[status] : text}
    </button>
  );
}
