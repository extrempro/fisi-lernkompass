import { describe, expect, it } from 'vitest';
import { ausbildungsdauer, ausbildungsjahrAm, ausbildungsWochen, plusMonate, wochenAus } from '../../src/lib/kalender';
import { ausbildungsstand } from '../../src/lib/datum';

const e = (x: Record<string, string> = {}) => ({ ausbildungsbeginn: '2025-08-01', verkuerzung_monate: '0', verkuerzung_art: 'ende', vertragsende: '', ...x });

describe('Ausbildungsdauer und Verkürzung', () => {
  it('plusMonate kürzt auf das Monatsende', () => {
    expect([plusMonate('2025-01-31', 1), plusMonate('2024-01-31', 1), plusMonate('2025-08-01', 24)]).toEqual(['2025-02-28', '2024-02-29', '2027-08-01']);
  });
  it('Regeldauer, Verkürzung am Ende und Mindestdauer', () => {
    expect(ausbildungsdauer(e())).toMatchObject({ monate: 36, ende: '2028-07-31', versatz: 0 });
    expect(ausbildungsdauer(e({ verkuerzung_monate: '12' }))).toMatchObject({ monate: 24, ende: '2027-07-31', versatz: 0 });
    // mehr als 18 Monate Verkürzung ist nicht möglich
    expect(ausbildungsdauer(e({ verkuerzung_monate: '30' }))!.monate).toBe(18);
    expect(ausbildungsdauer(e({ ausbildungsbeginn: '' }))).toBe(null);
  });
  it('Vertragsende von Hand hat Vorrang', () => {
    expect(ausbildungsdauer(e({ verkuerzung_monate: '6', vertragsende: '2028-01-15' }))).toMatchObject({ ende: '2028-01-15', endeVonHand: true });
    // ungültig oder vor dem Beginn → berechnet
    expect(ausbildungsdauer(e({ vertragsende: '2024-01-01' }))!.endeVonHand).toBe(false);
  });
  it('Anrechnung am Anfang verschiebt das Ausbildungsjahr', () => {
    const d = ausbildungsdauer(e({ verkuerzung_monate: '12', verkuerzung_art: 'anfang' }))!;
    expect(d.versatz).toBe(12);
    expect([ausbildungsjahrAm(d, '2025-08-01'), ausbildungsjahrAm(d, '2026-07-31'), ausbildungsjahrAm(d, '2026-08-01')]).toEqual([2, 2, 3]);
    const h = ausbildungsdauer(e({ verkuerzung_monate: '6', verkuerzung_art: 'anfang' }))!;
    expect([ausbildungsjahrAm(h, '2025-12-31'), ausbildungsjahrAm(h, '2026-02-01')]).toEqual([1, 2]);
  });
  it('Wochen enden mit dem Vertragsende und tragen das richtige Ausbildungsjahr', () => {
    const regel = ausbildungsWochen('2025-08-01')!;
    const kurz = wochenAus(e({ verkuerzung_monate: '12' }))!;
    expect(regel.ende).toBe('2028-07-31');
    expect(kurz.ende).toBe('2027-07-31');
    expect(kurz.wochen.length < regel.wochen.length).toBe(true);
    expect(Math.max(...kurz.wochen.map((w) => w.ausbildungsjahr))).toBe(2);
    const anfang = wochenAus(e({ verkuerzung_monate: '12', verkuerzung_art: 'anfang' }))!;
    expect([anfang.wochen[0].ausbildungsjahr, anfang.wochen[anfang.wochen.length - 1].ausbildungsjahr]).toEqual([2, 3]);
  });
  it('Ausbildungsstand mit Verkürzung', () => {
    const s = ausbildungsstand('2025-08-01', new Date('2027-08-15T12:00:00'), { ende: '2027-07-31', verkuerzung: 12 });
    expect(s.titel).toBe('Vertragsende erreicht');
    expect(s.hinweis).toMatch(/verkürzt um 12 Monate/);
    expect(ausbildungsstand('2025-08-01', new Date('2026-09-01T12:00:00'), { ende: '2027-07-31', versatz: 12, verkuerzung: 12 }).jahr).toBe(3);
    expect(ausbildungsstand('2025-08-01', new Date('2026-09-01T12:00:00')).jahr).toBe(2);
  });
});
