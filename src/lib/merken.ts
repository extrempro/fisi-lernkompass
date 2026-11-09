/** Kleine Bequemlichkeiten im Browser (z. B. zuletzt geöffnetes Themenfeld). Darf fehlschlagen. */
export function lies(key: string): string | null {
  try {
    return localStorage.getItem(`lernkompass-${key}`);
  } catch {
    return null;
  }
}

export function merke(key: string, wert: string): void {
  try {
    localStorage.setItem(`lernkompass-${key}`, wert);
  } catch {
    /* ignorieren */
  }
}
