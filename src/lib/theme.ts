import { useEffect, useState } from 'react';
import type { Einstellungen } from '../types';

function systemDunkel(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

/** Setzt die Klasse "dark" auf <html> passend zur Einstellung (auto folgt dem System). */
export function useTheme(theme: Einstellungen['theme'] | undefined): boolean {
  const [system, setSystem] = useState(systemDunkel);

  useEffect(() => {
    let mq: MediaQueryList | null = null;
    try {
      mq = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return;
    }
    const f = (e: MediaQueryListEvent) => setSystem(e.matches);
    mq.addEventListener('change', f);
    return () => mq?.removeEventListener('change', f);
  }, []);

  // Solange die Einstellungen noch laden, den Stand aus theme-init.js beibehalten (kein Aufblitzen)
  const dunkel =
    theme === undefined ? document.documentElement.classList.contains('dark') : theme === 'dark' || (theme === 'auto' && system);

  useEffect(() => {
    if (theme === undefined) return;
    document.documentElement.classList.toggle('dark', dunkel);
    try {
      localStorage.setItem('lernkompass-theme', dunkel ? 'dark' : 'light');
    } catch {
      /* ignorieren */
    }
  }, [dunkel, theme]);

  return dunkel;
}
