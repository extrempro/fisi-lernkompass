import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { heuteIso } from './lib/datum';
import { melde } from './companion/bus';
import type {
  Bericht,
  Projekt,
  KartenStand,
  Versuch,
  Unterschrift,
  ChangelogEintrag,
  Einstellungen,
  Ferien,
  InhaltsStand,
  PlanEintrag,
  PlanWerte,
  Status,
  Themenfeld,
  Unterthema,
  VersionInfo,
} from './types';

async function anfrage<T>(pfad: string, init?: RequestInit): Promise<T> {
  const res = await fetch(pfad, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
  });
  if (!res.ok) {
    let text = `${res.status} ${res.statusText}`;
    try {
      const j = (await res.json()) as { fehler?: string };
      if (j.fehler) text = j.fehler;
    } catch {
      /* keine JSON-Antwort */
    }
    throw new Error(text);
  }
  return (await res.json()) as T;
}

export const keys = {
  themenfelder: ['themenfelder'] as const,
  einstellungen: ['einstellungen'] as const,
  version: ['version'] as const,
  changelog: ['changelog'] as const,
  stand: ['inhalte-stand'] as const,
  plan: ['plan'] as const,
  kalender: ['kalender'] as const,
  berichte: ['berichte'] as const,
  eigeneUnterschrift: ['eigene-unterschrift'] as const,
  training: ['training'] as const,
  projekt: ['projekt'] as const,
};

export function useThemenfelder() {
  return useQuery({
    queryKey: keys.themenfelder,
    queryFn: () => anfrage<{ themenfelder: Themenfeld[] }>('/api/themenfelder').then((r) => r.themenfelder),
  });
}

export function useEinstellungen() {
  return useQuery({ queryKey: keys.einstellungen, queryFn: () => anfrage<Einstellungen>('/api/einstellungen') });
}

export function useVersion() {
  return useQuery({
    queryKey: keys.version,
    queryFn: () => anfrage<VersionInfo>('/api/version'),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useChangelog() {
  return useQuery({
    queryKey: keys.changelog,
    queryFn: () => anfrage<{ app: ChangelogEintrag[]; inhalte: ChangelogEintrag[] }>('/api/changelog'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInhaltsStand() {
  return useQuery({ queryKey: keys.stand, queryFn: () => anfrage<InhaltsStand>('/api/inhalte/stand') });
}

type UnterthemaPatch = Partial<Pick<Unterthema, 'luecke' | 'notiz'>> & { status?: Status; bestaetigen?: boolean };

/** Ändert Status, Lernpunkt oder Notiz eines Unterthemas – mit sofortiger Anzeige (optimistisch). */
export function useUnterthemaAendern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UnterthemaPatch }) =>
      anfrage<Pick<Unterthema, 'status' | 'luecke' | 'notiz' | 'geaendert' | 'inhaltAktualisiert'>>(
        `/api/unterthemen/${encodeURIComponent(id)}`,
        { method: 'PATCH', body: JSON.stringify(patch) },
      ),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: keys.themenfelder });
      const vorher = qc.getQueryData<Themenfeld[]>(keys.themenfelder);
      const [feldId, subId] = id.split('.');
      qc.setQueryData<Themenfeld[]>(keys.themenfelder, (alt) =>
        alt?.map((f) =>
          f.id !== feldId
            ? f
            : {
                ...f,
                unterthemen: f.unterthemen.map((u) => {
                  if (u.id !== subId) return u;
                  const neu: Unterthema = { ...u };
                  if (patch.status) {
                    neu.status = patch.status;
                    neu.geaendert = heuteIso();
                    neu.inhaltAktualisiert = false;
                  }
                  if (patch.bestaetigen) neu.inhaltAktualisiert = false;
                  if (patch.luecke !== undefined) neu.luecke = patch.luecke;
                  if (patch.notiz !== undefined) neu.notiz = patch.notiz;
                  return neu;
                }),
              },
        ),
      );
      return { vorher };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.vorher) qc.setQueryData(keys.themenfelder, ctx.vorher);
    },
    onSuccess: (_d, { patch }) => {
      if (patch.status) melde(`ampel-${patch.status}`);
    },
    onSettled: (_d, _e, { patch }) => {
      // Textänderungen nicht sofort neu laden, damit das Tippen nicht gestört wird
      if (patch.status || patch.bestaetigen) qc.invalidateQueries({ queryKey: keys.themenfelder });
    },
  });
}

export function useZusatzGelesen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, gelesen }: { id: string; gelesen: boolean }) =>
      anfrage(`/api/zusatz/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ gelesen }) }),
    onSuccess: (_d, { gelesen }) => {
      if (gelesen) melde('zusatz');
      return qc.invalidateQueries({ queryKey: keys.themenfelder });
    },
  });
}

export function useEinstellungenSpeichern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (werte: Partial<Einstellungen>) =>
      anfrage<Einstellungen>('/api/einstellungen', { method: 'PUT', body: JSON.stringify(werte) }),
    onMutate: async (werte) => {
      await qc.cancelQueries({ queryKey: keys.einstellungen });
      const vorher = qc.getQueryData<Einstellungen>(keys.einstellungen);
      if (vorher) qc.setQueryData(keys.einstellungen, { ...vorher, ...werte });
      return { vorher };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.vorher) qc.setQueryData(keys.einstellungen, ctx.vorher);
    },
    onSuccess: (daten) => qc.setQueryData(keys.einstellungen, daten),
  });
}

// ---------- Ausbildungsplan ----------

export function usePlan() {
  return useQuery({
    queryKey: keys.plan,
    queryFn: () => anfrage<{ eintraege: PlanEintrag[] }>('/api/plan').then((r) => r.eintraege),
  });
}

/** Schulferien aus den Inhalten (content/ferien-hamburg.json) */
export function useKalender() {
  return useQuery({ queryKey: keys.kalender, queryFn: () => anfrage<Ferien>('/api/kalender'), staleTime: 60 * 60 * 1000 });
}

/** Legt einen Eintrag an (ohne id) oder ändert ihn (mit id, auch teilweise). */
export function usePlanSpeichern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, werte }: { id?: number; werte: Partial<PlanWerte> }) =>
      id === undefined
        ? anfrage<PlanEintrag>('/api/plan', { method: 'POST', body: JSON.stringify(werte) })
        : anfrage<PlanEintrag>(`/api/plan/${id}`, { method: 'PATCH', body: JSON.stringify(werte) }),
    onMutate: async ({ id, werte }) => {
      // Abhaken (auch Unteraufgaben) soll sofort sichtbar sein
      if (id === undefined || (werte.erledigt === undefined && werte.unteraufgaben === undefined)) return {};
      await qc.cancelQueries({ queryKey: keys.plan });
      const vorher = qc.getQueryData<PlanEintrag[]>(keys.plan);
      qc.setQueryData<PlanEintrag[]>(keys.plan, (alt) =>
        alt?.map((e) =>
          e.id !== id
            ? e
            : {
                ...e,
                ...(werte.erledigt !== undefined ? { erledigt: werte.erledigt ? 1 : 0 } : {}),
                ...(werte.unteraufgaben ? { unteraufgaben: werte.unteraufgaben } : {}),
              },
        ),
      );
      return { vorher };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.vorher) qc.setQueryData(keys.plan, ctx.vorher);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.plan }),
  });
}

export function usePlanLoeschen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => anfrage(`/api/plan/${id}`, { method: 'DELETE' }),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.plan }),
  });
}

// ---------- Berichtsheft ----------

export function useBerichte() {
  return useQuery({
    queryKey: keys.berichte,
    queryFn: () => anfrage<{ berichte: Bericht[] }>('/api/berichte').then((r) => r.berichte),
  });
}

export function useBerichtSpeichern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: Pick<Bericht, 'montag' | 'status' | 'abgezeichnetAm' | 'inhalt'>) =>
      anfrage<Bericht & { unterschriftEntfernt: boolean }>(`/api/berichte/${b.montag}`, { method: 'PUT', body: JSON.stringify(b) }),
    onSuccess: () => melde('bericht'),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.berichte }),
  });
}

export function useBerichtLoeschen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (montag: string) => anfrage(`/api/berichte/${montag}`, { method: 'DELETE' }),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.berichte }),
  });
}

/** Mehrere Berichte als „vom Ausbilder abgezeichnet“ markieren. */
export function useAbzeichnen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ montage, datum, unterschrift }: { montage: string[]; datum: string; unterschrift?: Pick<Unterschrift, 'name' | 'pfad'> }) =>
      anfrage<{ geaendert: number }>('/api/berichte/abzeichnen', { method: 'POST', body: JSON.stringify({ montage, datum, unterschrift }) }),
    onSuccess: () => melde('abgezeichnet'),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.berichte }),
  });
}

/** Eigene (Azubi-)Unterschrift, einmal hinterlegt */
export function useEigeneUnterschrift() {
  return useQuery({
    queryKey: keys.eigeneUnterschrift,
    queryFn: () => anfrage<{ unterschrift: Unterschrift | null }>('/api/unterschrift/azubi').then((r) => r.unterschrift),
  });
}

export function useEigeneUnterschriftSpeichern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (u: Pick<Unterschrift, 'name' | 'pfad'> | null) =>
      u ? anfrage('/api/unterschrift/azubi', { method: 'PUT', body: JSON.stringify(u) }) : anfrage('/api/unterschrift/azubi', { method: 'DELETE' }),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.eigeneUnterschrift }),
  });
}

// ---------- Prüfungstraining ----------

export function useTraining() {
  return useQuery({
    queryKey: keys.training,
    queryFn: () => anfrage<{ karten: KartenStand[]; versuche: Versuch[] }>('/api/training'),
  });
}

/** Antworten speichern (Leitner). Mehrere auf einmal, z. B. am Ende einer Prüfungssimulation. */
export function useAntworten() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (antworten: { id: string; gewusst: boolean }[]) =>
      anfrage<{ karten: KartenStand[] }>('/api/training/antworten', { method: 'POST', body: JSON.stringify({ antworten }) }),
    onSuccess: (r) =>
      qc.setQueryData<{ karten: KartenStand[]; versuche: Versuch[] }>(keys.training, (alt) => {
        if (!alt) return alt;
        const neu = new Map(alt.karten.map((k) => [k.id, k]));
        for (const k of r.karten) neu.set(k.id, k);
        return { ...alt, karten: [...neu.values()] };
      }),
  });
}

export function useVersuchSpeichern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: Omit<Versuch, 'id' | 'datum'>) => anfrage<Versuch>('/api/training/versuch', { method: 'POST', body: JSON.stringify(v) }),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.training }),
  });
}

// ---------- Abschlussprojekt ----------

export function useProjekt() {
  return useQuery({ queryKey: keys.projekt, queryFn: () => anfrage<Projekt>('/api/projekt') });
}

export function useProjektSpeichern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Projekt) => anfrage<Projekt>('/api/projekt', { method: 'PUT', body: JSON.stringify(p) }),
    onSuccess: (p) => qc.setQueryData(keys.projekt, p),
  });
}

export async function importiere(
  daten: unknown,
): Promise<{ unterthemen: number; zusatz: number; plan: number | null; berichte: number | null }> {
  return anfrage('/api/import', { method: 'POST', body: JSON.stringify(daten) });
}

export async function zuruecksetzen(): Promise<void> {
  await anfrage('/api/reset', { method: 'POST', body: '{}' });
}
