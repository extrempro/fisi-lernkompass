import { Link, NavLink } from 'react-router-dom';
import { BookOpen, CalendarRange, CircleHelp, Compass, Dumbbell, NotebookPen, GraduationCap, LayoutGrid, Library, Moon, SlidersHorizontal, Sun, type LucideIcon } from 'lucide-react';
import { useEinstellungenSpeichern } from '../api';

const LINKS: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/', label: 'Übersicht', icon: LayoutGrid, end: true },
  { to: '/thema', label: 'Cheatsheets', icon: BookOpen },
  { to: '/kompendium', label: 'Kompendium', icon: Library },
  { to: '/ueben', label: 'Üben', icon: Dumbbell },
  { to: '/plan', label: 'Ausbildungsplan', icon: CalendarRange },
  { to: '/berichtsheft', label: 'Berichtsheft', icon: NotebookPen },
  { to: '/pruefung', label: 'Prüfungen', icon: GraduationCap },
  { to: '/einstellungen', label: 'Einstellungen', icon: SlidersHorizontal },
];

export function Nav({ dunkel }: { dunkel: boolean }) {
  const speichern = useEinstellungenSpeichern();

  return (
    <nav aria-label="Hauptnavigation" className="sticky top-0 z-10 border-b border-line bg-card">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-6">
        <Link to="/" className="flex min-h-[44px] items-center gap-3 font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-on-accent">
            <Compass size={18} aria-hidden="true" />
          </span>
          <span>FISI-Lernkompass</span>
        </Link>
        <div className="flex flex-wrap items-center gap-0 xl:gap-1">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              className={({ isActive }) =>
                `flex min-h-[44px] min-w-[38px] items-center justify-center gap-2 rounded-lg px-1.5 py-2 sm:min-w-[42px] sm:px-2 text-sm transition xl:px-3 ${
                  isActive ? 'bg-accent-soft font-semibold text-accent' : 'font-medium text-muted hover:bg-chip'
                }`
              }
            >
              {/* Bis Laptop-Breite nur Symbole (Name als Tooltip), ab 1280 px nur Text – so passt die Leiste in eine Zeile */}
              <Icon size={18} className="xl:hidden" aria-hidden="true" />
              <span className="sr-only xl:not-sr-only">{label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/hilfe"
            title="Hilfe und Handbuch"
            aria-label="Hilfe und Handbuch"
            className={({ isActive }) =>
              // Auf dem Handy nur über die Fußzeile erreichbar, damit die Leiste in zwei Zeilen passt
              `hidden min-h-[44px] min-w-[42px] items-center justify-center rounded-lg transition sm:flex ${isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-chip'}`
            }
          >
            <CircleHelp size={18} aria-hidden="true" />
          </NavLink>
          <button
            type="button"
            onClick={() => speichern.mutate({ theme: dunkel ? 'light' : 'dark' })}
            aria-label={dunkel ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
            className="flex min-h-[44px] min-w-[38px] items-center justify-center rounded-lg text-muted sm:min-w-[42px] transition hover:bg-chip"
          >
            {dunkel ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
