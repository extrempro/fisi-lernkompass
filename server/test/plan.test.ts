import { describe, expect, it } from 'vitest';
import { DatabaseSync as Database } from '../sqlite';
import { loadMigrations, migrate } from '../db';
import {
  aenderePlanEintrag,
  allePlanEintraege,
  ersetzePlan,
  legePlanEintragAn,
  loeschePlanEintrag,
  montag,
  pruefePlanEintrag,
  type PlanWerte,
} from '../plan';

const FELDER = new Set(['netzwerkgrundlagen', 'server']);

async function neueDb() {
  const db = new Database(':memory:');
  await migrate(db, null, loadMigrations(), () => {});
  return db;
}

function werte(body: unknown, alt?: PlanWerte): PlanWerte {
  const r = pruefePlanEintrag(body, FELDER, alt);
  if ('fehler' in r) throw new Error(r.fehler);
  return r.werte;
}

describe('Ausbildungsplan', () => {
  it('rechnet jedes Datum auf den Montag seiner Woche', () => {
    expect(montag('2026-11-05')).toBe('2026-11-02'); // Donnerstag
    expect(montag('2026-11-08')).toBe('2026-11-02'); // Sonntag
    expect(montag('2026-11-02')).toBe('2026-11-02'); // Montag
    expect(montag('2027-01-01')).toBe('2026-12-28'); // über den Jahreswechsel
    expect(montag('2026-02-30')).toBe(null);
    expect(montag('05.11.2026')).toBe(null);
  });

  it('prüft neue Einträge', () => {
    const w = werte({ art: 'schule', von: '2026-09-02', bis: '2026-09-25', titel: ' Blockunterricht LF 5 ' });
    expect(w.von).toBe('2026-08-31');
    expect(w.bis).toBe('2026-09-21');
    expect(w.titel).toBe('Blockunterricht LF 5');
    expect(werte({ art: 'notiz', von: '2026-09-02', titel: 'x' }).bis).toBe('2026-08-31');

    const fehler = (body: unknown) => {
      const r = pruefePlanEintrag(body, FELDER);
      return 'fehler' in r ? r.fehler : '';
    };
    expect(fehler({ art: 'urlaub', von: '2026-09-01', titel: 'x' })).toMatch(/art/);
    expect(fehler({ art: 'notiz', titel: 'x' })).toMatch(/von/);
    expect(fehler({ art: 'notiz', von: '2026-09-14', bis: '2026-09-01', titel: 'x' })).toMatch(/vor der ersten/);
    expect(fehler({ art: 'notiz', von: '2026-09-01' })).toMatch(/Titel/);
    expect(fehler({ art: 'thema', von: '2026-09-01' })).toMatch(/Themenfeld/);
    expect(fehler({ art: 'thema', von: '2026-09-01', themenfeld: 'gibtsnicht' })).toMatch(/Unbekanntes/);
    expect(fehler({ art: 'notiz', von: '2026-09-01', titel: 'x'.repeat(201) })).toMatch(/höchstens/);
    expect(fehler({ art: 'schule', von: '2026-01-01', bis: '2031-01-01', titel: 'x' })).toMatch(/Wochen/);
    // Themenfeld-Eintrag braucht keinen Titel
    expect(werte({ art: 'thema', von: '2026-09-01', themenfeld: 'server' }).themenfeld).toBe('server');
    // erledigt gibt es nur bei Aufgaben
    expect(werte({ art: 'notiz', von: '2026-09-01', titel: 'x', erledigt: true }).erledigt).toBe(0);
    expect(werte({ art: 'aufgabe', von: '2026-09-01', titel: 'x', erledigt: true }).erledigt).toBe(1);
  });

  it('legt an, ändert teilweise und löscht', async () => {
    const db = await neueDb();
    const a = legePlanEintragAn(db, werte({ art: 'aufgabe', von: '2026-11-05', titel: 'Berichtsheft schreiben' }));
    expect(a.id).toBeGreaterThan(0);
    expect(a.von).toBe('2026-11-02');

    const alt = { art: a.art, von: a.von, bis: a.bis, titel: a.titel, text: a.text, themenfeld: a.themenfeld, erledigt: a.erledigt, unteraufgaben: a.unteraufgaben };
    const b = aenderePlanEintrag(db, a.id, werte({ erledigt: true }, alt));
    expect(b.erledigt).toBe(1);
    expect(b.titel).toBe('Berichtsheft schreiben');

    legePlanEintragAn(db, werte({ art: 'schule', von: '2026-10-01', bis: '2026-10-20', titel: 'Block' }));
    expect(allePlanEintraege(db).map((e) => e.art)).toEqual(['schule', 'aufgabe']);

    expect(loeschePlanEintrag(db, a.id)).toBe(true);
    expect(loeschePlanEintrag(db, a.id)).toBe(false);
    expect(allePlanEintraege(db)).toHaveLength(1);
  });

  it('ersetzt den Plan beim Import und rettet verwaiste Themenfeld-Einträge als Notiz', async () => {
    const db = await neueDb();
    legePlanEintragAn(db, werte({ art: 'notiz', von: '2026-01-05', titel: 'alt' }));
    const n = ersetzePlan(
      db,
      [
        { art: 'schule', von: '2026-08-31', bis: '2026-09-21', titel: 'Block 1', erledigt: 0 },
        { art: 'thema', von: '2026-09-28', themenfeld: 'server', titel: '' },
        { art: 'thema', von: '2026-10-05', themenfeld: 'entfernt', titel: '' },
        { art: 'kaputt', von: 'gestern' },
        'Unsinn',
      ],
      FELDER,
    );
    expect(n).toBe(3);
    const alle = allePlanEintraege(db);
    expect(alle.map((e) => e.titel)).not.toContain('alt');
    const verwaist = alle.find((e) => e.von === '2026-10-05')!;
    expect(verwaist.art).toBe('notiz');
    expect(verwaist.titel).toMatch(/entfernt/);
  });

  it('speichert Unteraufgaben nur bei Aufgaben und prüft sie', async () => {
    const db = await neueDb();
    const a = legePlanEintragAn(
      db,
      werte({
        art: 'aufgabe',
        von: '2026-11-05',
        titel: 'Projektantrag',
        unteraufgaben: [{ text: ' Thema finden ', erledigt: true }, { text: '' }, { text: 'Antrag schreiben' }],
      }),
    );
    expect(a.unteraufgaben).toEqual([
      { text: 'Thema finden', erledigt: true },
      { text: 'Antrag schreiben', erledigt: false },
    ]);
    const alt = { ...a } as PlanWerte & { id?: number; geaendert?: string };
    delete alt.id;
    delete alt.geaendert;
    const b = aenderePlanEintrag(db, a.id, werte({ unteraufgaben: [{ text: 'Thema finden', erledigt: true }, { text: 'Antrag schreiben', erledigt: true }] }, alt));
    expect(b.unteraufgaben.every((u) => u.erledigt)).toBe(true);
    expect(allePlanEintraege(db)[0].unteraufgaben).toHaveLength(2);

    expect(werte({ art: 'notiz', von: '2026-11-05', titel: 'x', unteraufgaben: [{ text: 'weg' }] }).unteraufgaben).toEqual([]);
    const fehler = (body: unknown) => {
      const r = pruefePlanEintrag(body, FELDER);
      return 'fehler' in r ? r.fehler : '';
    };
    expect(fehler({ art: 'aufgabe', von: '2026-11-05', titel: 'x', unteraufgaben: 'a' })).toMatch(/Liste/);
    expect(fehler({ art: 'aufgabe', von: '2026-11-05', titel: 'x', unteraufgaben: [{ erledigt: true }] })).toMatch(/Text/);
    expect(fehler({ art: 'aufgabe', von: '2026-11-05', titel: 'x', unteraufgaben: Array(31).fill({ text: 'a' }) })).toMatch(/Höchstens/);

    // beschädigtes JSON in der Datenbank führt nicht zum Absturz
    db.prepare("UPDATE plan_eintrag SET unteraufgaben = 'kaputt'").run();
    expect(allePlanEintraege(db)[0].unteraufgaben).toEqual([]);
  });

  it('die Datenbank verhindert vertauschte Wochen auch direkt', async () => {
    const db = await neueDb();
    expect(() =>
      db.prepare("INSERT INTO plan_eintrag (art, von, bis, geaendert) VALUES ('notiz', '2026-02-02', '2026-01-05', '2026-01-01')").run(),
    ).toThrow(/CHECK/);
  });
});
