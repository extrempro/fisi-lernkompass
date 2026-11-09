import type { ReactNode } from 'react';
import {
  Sparkles,
  BookOpen,
  ClipboardList,
  Cloud,
  Database,
  Globe,
  Headphones,
  Laptop,
  Monitor,
  Network,
  Scale,
  Server,
  Shield,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import type { PruefungKey, Status } from '../types';
import { AMPEL, anteil, type Zaehlung } from '../lib/ampel';
import { PRUEFUNG_KURZ, PRUEFUNG_NAME } from '../lib/datum';

const ICONS: Record<string, LucideIcon> = {
  monitor: Monitor,
  laptop: Laptop,
  network: Network,
  globe: Globe,
  server: Server,
  cloud: Cloud,
  shield: Shield,
  terminal: Terminal,
  database: Database,
  headphones: Headphones,
  'clipboard-list': ClipboardList,
  scale: Scale,
  sparkles: Sparkles,
};

export function ThemenIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = ICONS[name] ?? BookOpen;
  return <Icon size={size} aria-hidden="true" />;
}

export function Punkt({ status, size = 10 }: { status: Status; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: AMPEL[status].farbe }}
    />
  );
}

export function StatusPille({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line px-3 py-1 text-sm font-medium">
      <Punkt status={status} />
      <span>{AMPEL[status].label}</span>
    </span>
  );
}

export function StapelBalken({ z, label, hoehe = 8 }: { z: Zaehlung; label: string; hoehe?: number }) {
  return (
    <div role="img" aria-label={label} className="flex gap-0.5 overflow-hidden rounded-full bg-track" style={{ height: hoehe }}>
      <span style={{ width: anteil(z.g, z.n), background: AMPEL.gruen.farbe }} />
      <span style={{ width: anteil(z.y, z.n), background: AMPEL.gelb.farbe }} />
      <span style={{ width: anteil(z.r, z.n), background: AMPEL.rot.farbe }} />
    </div>
  );
}

export function Chips({ lernfelder, pruefung }: { lernfelder: string[]; pruefung: PruefungKey[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {lernfelder.map((l) => (
        <span key={l} className="chip bg-chip text-muted">
          {l}
        </span>
      ))}
      {pruefung.map((p) => (
        <span key={p} className="chip bg-accent-soft text-accent" title={PRUEFUNG_NAME[p]}>
          {PRUEFUNG_KURZ[p] ?? p}
        </span>
      ))}
    </div>
  );
}

/** Einfache Inline-Formatierung aus Markdown: `code`, **fett**, [Link](https://…). */
export function Inline({ text }: { text: string }) {
  const teile: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) teile.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('`')) {
      teile.push(
        <code key={i++} className="rounded bg-code px-1 font-mono text-[0.9em] text-code-ink">
          {t.slice(1, -1)}
        </code>,
      );
    } else if (t.startsWith('**')) {
      teile.push(<strong key={i++}>{t.slice(2, -2)}</strong>);
    } else {
      const lm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(t)!;
      teile.push(
        <a key={i++} href={lm[2]} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">
          {lm[1]}
        </a>,
      );
    }
    last = m.index + t.length;
  }
  if (last < text.length) teile.push(text.slice(last));
  return <>{teile}</>;
}

export function Laedt() {
  return (
    <p className="py-12 text-center text-muted" role="status">
      Lädt …
    </p>
  );
}

export function FehlerHinweis({ fehler }: { fehler: unknown }) {
  return (
    <div className="karte p-6" role="alert">
      <h2 className="text-xl font-semibold">Das hat nicht geklappt</h2>
      <p className="mt-2 text-muted">
        {fehler instanceof Error ? fehler.message : 'Unbekannter Fehler'}. Läuft der Server? Im Dev-Modus mit{' '}
        <code className="font-mono">npm run dev</code> starten.
      </p>
    </div>
  );
}
