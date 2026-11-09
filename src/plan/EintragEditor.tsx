import { useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { usePlanLoeschen, usePlanSpeichern } from '../api';
import { Dialog } from '../components/Dialog';
import { wochenAbstand, type Woche } from '../lib/kalender';
import { lies, merke } from '../lib/merken';
import type { PlanArt, PlanEintrag, PlanWerte, Themenfeld, Unteraufgabe } from '../types';
import { ART, ART_REIHE } from './arten';

export type EditorAuftrag = { eintrag: PlanEintrag } | { vorlage: Pick<PlanWerte, 'art' | 'von' | 'bis'> };

const TITEL: Record<PlanArt, { label: string; platzhalter: string }> = {
  schule: { label: 'Bezeichnung', platzhalter: 'z. B. Blockunterricht LF 5 und 6' },
  thema: { label: 'Titel (optional)', platzhalter: 'z. B. Subnetting üben' },
  aufgabe: { label: 'Aufgabe', platzhalter: 'z. B. Berichtsheft hochladen' },
  notiz: { label: 'Titel', platzhalter: 'z. B. Urlaub, Projektwoche, Messe' },
};

/** Fenster zum Anlegen, Ändern und Löschen eines Plan-Eintrags. */
export function EintragEditor({
  auftrag,
  wochen,
  felder,
  onSchliessen,
}: {
  auftrag: EditorAuftrag;
  wochen: Woche[];
  felder: Themenfeld[];
  onSchliessen: () => void;
}) {
  const alt = 'eintrag' in auftrag ? auftrag.eintrag : null;
  const [werte, setWerte] = useState<PlanWerte>(() => {
    if (alt) {
      return {
        art: alt.art,
        von: alt.von,
        bis: alt.bis,
        titel: alt.titel,
        text: alt.text,
        themenfeld: alt.themenfeld,
        erledigt: !!alt.erledigt,
        unteraufgaben: alt.unteraufgaben ?? [],
      };
    }
    const v = (auftrag as { vorlage: Pick<PlanWerte, 'art' | 'von' | 'bis'> }).vorlage;
    const zuletzt = lies('plan-art') as PlanArt | null;
    return { ...v, art: zuletzt && zuletzt in ART ? zuletzt : v.art, titel: '', text: '', themenfeld: '', unteraufgaben: [] };
  });
  const [meldung, setMeldung] = useState('');
  const [loeschFrage, setLoeschFrage] = useState(false);
  const [neueTeil, setNeueTeil] = useState('');
  const teile = werte.unteraufgaben ?? [];
  const setzeTeile = (liste: Unteraufgabe[]) => setze({ unteraufgaben: liste });
  const fuegeTeilHinzu = () => {
    const text = neueTeil.trim();
    if (!text || teile.length >= 30) return;
    setzeTeile([...teile, { text, erledigt: false }]);
    setNeueTeil('');
  };
  const speichern = usePlanSpeichern();
  const loeschen = usePlanLoeschen();

  const setze = (x: Partial<PlanWerte>) => {
    setMeldung('');
    setWerte((w) => {
      const n = { ...w, ...x };
      if (n.bis < n.von) n.bis = n.von;
      return n;
    });
  };

  const dauer = wochenAbstand(werte.von, werte.bis) + 1;
  const tl = TITEL[werte.art];

  const absenden = () => {
    if (werte.art === 'thema' && !werte.themenfeld) return setMeldung('Bitte ein Themenfeld wählen.');
    if (werte.art !== 'thema' && !werte.titel.trim()) return setMeldung(`Bitte ${werte.art === 'aufgabe' ? 'die Aufgabe' : 'einen Titel'} eingeben.`);
    if (!alt) merke('plan-art', werte.art);
    speichern.mutate(
      {
        id: alt?.id,
        werte: {
          ...werte,
          erledigt: werte.art === 'aufgabe' ? !!werte.erledigt : false,
          // Noch nicht hinzugefügter Text im Eingabefeld wird mitgenommen
          unteraufgaben: werte.art === 'aufgabe' ? [...teile, ...(neueTeil.trim() ? [{ text: neueTeil.trim(), erledigt: false }] : [])] : [],
        },
      },
      { onSuccess: onSchliessen, onError: (e) => setMeldung((e as Error).message) },
    );
  };

  // Der Zeitraum umfasst bereits alle vorhandenen Einträge, daher reicht die Wochenliste – gruppiert nach Ausbildungsjahr
  const optionen = (ab?: string) => {
    const gruppen = new Map<number, Woche[]>();
    for (const w of wochen) if (!ab || w.montag >= ab) gruppen.set(w.ausbildungsjahr, [...(gruppen.get(w.ausbildungsjahr) ?? []), w]);
    return [...gruppen.entries()].map(([jahr, ws]) => (
      <optgroup key={jahr} label={jahr === 0 ? 'Vor der Ausbildung' : `${jahr}. Ausbildungsjahr`}>
        {ws.map((w) => (
          <option key={w.montag} value={w.montag}>
            {w.label}
          </option>
        ))}
      </optgroup>
    ));
  };

  return (
    <Dialog titel={alt ? 'Eintrag bearbeiten' : 'Eintrag hinzufügen'} onSchliessen={onSchliessen} breite={640}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          absenden();
        }}
      >
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Art des Eintrags</legend>
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
            {ART_REIHE.map((a) => {
              const { icon: Icon, label, stil, hilfe } = ART[a];
              const an = werte.art === a;
              return (
                <label
                  key={a}
                  className={`relative flex min-h-[64px] cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
                    an ? 'border-accent bg-accent-soft' : 'border-line bg-bg hover:border-muted'
                  }`}
                >
                  <input type="radio" name="art" value={a} checked={an} onChange={() => setze({ art: a })} className="sr-only" />
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stil}`}>
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 pr-5">
                    <span className={`block text-sm font-semibold ${an ? 'text-accent' : ''}`}>{label}</span>
                    <span className="block text-xs leading-snug text-muted">{hilfe}</span>
                  </span>
                  {an && <Check size={18} className="absolute right-2.5 top-2.5 text-accent" aria-hidden="true" />}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1">
          <label htmlFor="plan-titel" className="text-sm font-semibold">
            {tl.label}
          </label>
          <input
            id="plan-titel"
            data-autofokus
            className="eingabe"
            value={werte.titel}
            maxLength={200}
            placeholder={tl.platzhalter}
            onChange={(e) => setze({ titel: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="plan-feld" className="text-sm font-semibold">
            {werte.art === 'thema' ? 'Themenfeld' : 'Themenfeld (optional)'}
          </label>
          <select id="plan-feld" className="eingabe" value={werte.themenfeld} onChange={(e) => setze({ themenfeld: e.target.value })}>
            <option value="">{werte.art === 'thema' ? 'Bitte wählen …' : 'kein Themenfeld'}</option>
            {felder.map((f) => (
              <option key={f.id} value={f.id}>
                {f.titel}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="plan-von" className="text-sm font-semibold">
              {dauer > 1 || werte.art === 'schule' ? 'Erste Woche' : 'Woche'}
            </label>
            <select id="plan-von" className="eingabe" value={werte.von} onChange={(e) => setze({ von: e.target.value })}>
              {optionen()}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="plan-bis" className="text-sm font-semibold">
              Letzte Woche
            </label>
            <select id="plan-bis" className="eingabe" value={werte.bis} onChange={(e) => setze({ bis: e.target.value })}>
              {optionen(werte.von)}
            </select>
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted" aria-live="polite">
          {dauer === 1 ? 'Gilt für eine Woche.' : `Gilt für ${dauer} Wochen.`}
        </p>

        <div className="flex flex-col gap-1">
          <label htmlFor="plan-text" className="text-sm font-semibold">
            Beschreibung (optional)
          </label>
          <textarea
            id="plan-text"
            className="eingabe min-h-[88px] resize-y"
            rows={3}
            maxLength={5000}
            value={werte.text}
            placeholder="Raum, Lehrkraft, Lernfelder, was zu tun ist …"
            onChange={(e) => setze({ text: e.target.value })}
          />
        </div>

        {werte.art === 'aufgabe' && (
          <fieldset className="flex flex-col gap-2 rounded-lg border border-line p-3">
            <legend className="px-1 text-sm font-semibold">
              Unteraufgaben (optional){teile.length > 0 && <span className="font-normal text-muted"> · {teile.filter((u) => u.erledigt).length}/{teile.length} erledigt</span>}
            </legend>
            {teile.length > 0 && (
              <ul className="flex flex-col gap-1">
                {teile.map((u, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={u.erledigt}
                      aria-label={`${u.text || 'Unteraufgabe'} erledigt`}
                      onChange={(e) => setzeTeile(teile.map((x, j) => (j === i ? { ...x, erledigt: e.target.checked } : x)))}
                      className="h-5 w-5 shrink-0 accent-[var(--c-accent)]"
                    />
                    <input
                      className="eingabe min-h-[40px] flex-1 py-1.5"
                      value={u.text}
                      maxLength={200}
                      aria-label={`Unteraufgabe ${i + 1}`}
                      onChange={(e) => setzeTeile(teile.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                    />
                    <button
                      type="button"
                      onClick={() => setzeTeile(teile.filter((_, j) => j !== i))}
                      aria-label={`Unteraufgabe „${u.text}“ entfernen`}
                      title="Entfernen"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-chip hover:text-rot"
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-2">
              <input
                className="eingabe min-h-[40px] flex-1 py-1.5"
                value={neueTeil}
                maxLength={200}
                placeholder="Neue Unteraufgabe, mit Enter hinzufügen"
                aria-label="Neue Unteraufgabe"
                onChange={(e) => setNeueTeil(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fuegeTeilHinzu();
                  }
                }}
              />
              <button type="button" className="btn-sekundaer min-h-[40px] px-3" onClick={fuegeTeilHinzu} disabled={!neueTeil.trim()}>
                <Plus size={16} aria-hidden="true" />
                Hinzufügen
              </button>
            </div>
          </fieldset>
        )}

        {alt && werte.art === 'aufgabe' && (
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={!!werte.erledigt}
              onChange={(e) => setze({ erledigt: e.target.checked })}
              className="h-5 w-5 accent-[var(--c-accent)]"
            />
            Ganze Aufgabe erledigt
          </label>
        )}

        {meldung && (
          <p role="alert" className="rounded-lg bg-seg-rot px-4 py-2 text-sm text-seg-rot-ink">
            {meldung}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <div>
            {alt &&
              (loeschFrage ? (
                <div role="group" aria-label="Löschen bestätigen" className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">Wirklich löschen?</span>
                  <button
                    type="button"
                    autoFocus
                    className="btn bg-rot text-white hover:opacity-90"
                    disabled={loeschen.isPending}
                    onClick={() => loeschen.mutate(alt.id, { onSuccess: onSchliessen, onError: (e) => setMeldung((e as Error).message) })}
                  >
                    Ja, löschen
                  </button>
                  <button type="button" className="btn-sekundaer" onClick={() => setLoeschFrage(false)}>
                    Nein
                  </button>
                </div>
              ) : (
                <button type="button" className="btn border border-rot text-rot hover:bg-seg-rot" onClick={() => setLoeschFrage(true)}>
                  <Trash2 size={16} aria-hidden="true" />
                  Löschen
                </button>
              ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-sekundaer" onClick={onSchliessen}>
              Abbrechen
            </button>
            <button type="submit" className="btn-primaer" disabled={speichern.isPending}>
              {alt ? 'Speichern' : 'Hinzufügen'}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
