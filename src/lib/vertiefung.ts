import type { Themenfeld } from '../types';

export interface Verweis {
  feldId: string;
  feldTitel: string;
  id: string;
  titel: string;
}

/** Unterthema ("feld.unterthema") → Zusatzwissen, das es vertieft. */
export function vertiefungen(felder: Themenfeld[]): Map<string, Verweis[]> {
  const m = new Map<string, Verweis[]>();
  for (const f of felder) {
    for (const z of f.zusatz) {
      for (const ref of z.zu) {
        const liste = m.get(ref) ?? [];
        liste.push({ feldId: f.id, feldTitel: f.titel, id: z.id, titel: z.titel });
        m.set(ref, liste);
      }
    }
  }
  return m;
}

/** "feld.unterthema" → Titel und Link-Ziel des Unterthemas. */
export function unterthemaVerweis(felder: Themenfeld[], ref: string): Verweis | null {
  const [feldId, id] = ref.split('.');
  const f = felder.find((x) => x.id === feldId);
  const u = f?.unterthemen.find((x) => x.id === id);
  return f && u ? { feldId: f.id, feldTitel: f.titel, id: u.id, titel: u.titel } : null;
}
