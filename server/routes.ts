import type { FastifyInstance, FastifyReply } from 'fastify';
import { join } from 'node:path';
import type { Config } from './config';
import { backupDatabase, currentSchemaVersion, latestBackup, latestSchemaVersion, transaktion, type DB } from './db';
import type { Inhalte } from './content/store';
import { inhaltsStand, unterthemaIndex, zusatzIds } from './content/store';
import { leseChangelog } from './changelog';
import {
  alleStatus,
  alleZusatz,
  EINSTELLUNGEN_STANDARD,
  heute,
  holeStatus,
  leseEinstellungen,
  schreibeEinstellungen,
  speichereStatus,
  speichereZusatz,
  STATI,
  type Einstellungen,
  type EinstellungsSchluessel,
  type Status,
  type UnterthemaStatus,
  type ZusatzStatus,
} from './lernstand';
import {
  aenderePlanEintrag,
  allePlanEintraege,
  ersetzePlan,
  holePlanEintrag,
  legePlanEintragAn,
  loeschePlanEintrag,
  pruefePlanEintrag,
} from './plan';
import { alleBerichte, ersetzeBerichte, loescheBericht, pruefeBericht, speichereBericht, zeichneAb } from './bericht';
import { montag as montagVon } from './plan';
import { legeUnterschriftAn, pruefeUnterschrift, raeumeUnterschriftenAuf, type Unterschrift } from './unterschrift';
import { alleKarten, alleVersuche, beantworte, ersetzeTraining, pruefeVersuch, speichereVersuch } from './training';
import { leseProjekt, pruefeProjekt, speichereProjekt } from './projekt';
import { BUILD, ROOT } from './version';

export interface ApiKontext {
  db: DB;
  config: Config;
  inhalte: () => Inhalte;
  neuLaden: () => Inhalte;
}

const DATUM = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TEXT = 5000;
const BACKUP_FORMAT = 'fisi-lernkompass-backup';

function fehler(reply: FastifyReply, code: number, text: string) {
  return reply.code(code).send({ fehler: text });
}

function istObjekt(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

export async function registriereApi(app: FastifyInstance, k: ApiKontext): Promise<void> {
  const versionInfo = () => {
    const sicherung = latestBackup(k.config.dataDir);
    return {
      app: BUILD.app,
      commit: BUILD.commit,
      build: BUILD.build,
      schema: currentSchemaVersion(k.db),
      inhalt: k.inhalte().meta.stand,
      letzteSicherung: sicherung?.zeit ?? null,
    };
  };

  app.get('/api/health', async () => ({ status: 'ok', ...versionInfo() }));
  app.get('/api/version', async () => versionInfo());

  app.get('/api/changelog', async () => ({
    // Alle App-Versionen für die Versionshinweise in den Einstellungen
    app: leseChangelog(join(ROOT, 'CHANGELOG.md'), Infinity),
    inhalte: leseChangelog(join(k.config.contentDir, 'CHANGELOG.md'), 30),
  }));

  app.get('/api/inhalte/stand', async () => inhaltsStand(k.inhalte()));

  app.post('/api/inhalte/neu-laden', async (_req, reply) => {
    if (k.config.production && !k.config.allowContentReload) {
      return fehler(reply, 403, 'Neuladen ist deaktiviert (ALLOW_CONTENT_RELOAD=true setzen oder App neu starten)');
    }
    const i = k.neuLaden();
    return { ok: true, ...inhaltsStand(i), meldungen: i.meldungen };
  });

  // ---------- Themenfelder mit Lernstand ----------
  app.get('/api/themenfelder', async () => {
    const status = alleStatus(k.db);
    const zusatz = alleZusatz(k.db);
    return {
      themenfelder: k.inhalte().themenfelder.map((f) => ({
        id: f.id,
        titel: f.titel,
        icon: f.icon,
        lernfelder: f.lernfelder,
        pruefung: f.pruefung,
        worum: f.worum,
        fehler: f.fehler,
        links: f.links,
        unterthemen: f.unterthemen.map((u) => {
          const s = status.get(`${f.id}.${u.id}`);
          const st: Status = s?.status ?? 'rot';
          return {
            id: u.id,
            titel: u.titel,
            begriffe: u.begriffe,
            tabellen: u.tabellen,
            befehle: u.befehle,
            merksatz: u.merksatz,
            frage: u.frage,
            abbildungen: u.abbildungen,
            hatInhalt: u.hatInhalt,
            status: st,
            luecke: s?.luecke ?? '',
            notiz: s?.notiz ?? '',
            geaendert: s?.geaendert ?? null,
            inhaltAktualisiert: !!(s && st !== 'rot' && s.inhalt_hash && s.inhalt_hash !== u.hash),
          };
        }),
        zusatz: f.zusatz.map((z) => ({
          id: z.id,
          titel: z.titel,
          typ: z.typ,
          intro: z.intro,
          absaetze: z.absaetze,
          abschnitte: z.abschnitte,
          zu: z.zu,
          szenarien: z.szenarien,
          gelesen: zusatz.get(`${f.id}.${z.id}`)?.gelesen === 1,
        })),
      })),
    };
  });

  app.patch<{ Params: { id: string }; Body: unknown }>('/api/unterthemen/:id', async (req, reply) => {
    const id = req.params.id;
    const info = unterthemaIndex(k.inhalte()).get(id);
    if (!info) return fehler(reply, 404, `Unbekanntes Unterthema "${id}"`);
    const body = req.body;
    if (!istObjekt(body)) return fehler(reply, 400, 'JSON-Objekt erwartet');

    const alt = holeStatus(k.db, id);
    const neu: UnterthemaStatus = alt
      ? { ...alt }
      : { unterthema_id: id, status: 'rot', luecke: '', notiz: '', inhalt_hash: null, geaendert: heute() };

    if (body.status !== undefined) {
      if (!STATI.includes(body.status as Status)) return fehler(reply, 400, 'status muss rot, gelb oder gruen sein');
      neu.status = body.status as Status;
      neu.inhalt_hash = info.hash;
      neu.geaendert = heute();
    }
    if (body.bestaetigen === true) {
      neu.inhalt_hash = info.hash;
    }
    for (const feld of ['luecke', 'notiz'] as const) {
      if (body[feld] !== undefined) {
        if (typeof body[feld] !== 'string' || (body[feld] as string).length > MAX_TEXT) {
          return fehler(reply, 400, `${feld} muss Text mit höchstens ${MAX_TEXT} Zeichen sein`);
        }
        neu[feld] = body[feld] as string;
      }
    }
    speichereStatus(k.db, neu);
    return {
      id,
      status: neu.status,
      luecke: neu.luecke,
      notiz: neu.notiz,
      geaendert: neu.geaendert,
      inhaltAktualisiert: neu.status !== 'rot' && !!neu.inhalt_hash && neu.inhalt_hash !== info.hash,
    };
  });

  app.patch<{ Params: { id: string }; Body: unknown }>('/api/zusatz/:id', async (req, reply) => {
    const id = req.params.id;
    if (!zusatzIds(k.inhalte()).has(id)) return fehler(reply, 404, `Unbekanntes Zusatzwissen "${id}"`);
    const body = req.body;
    if (!istObjekt(body) || typeof body.gelesen !== 'boolean') return fehler(reply, 400, 'gelesen (true/false) erwartet');
    speichereZusatz(k.db, id, body.gelesen);
    return { id, gelesen: body.gelesen };
  });

  // ---------- Einstellungen ----------
  app.get('/api/einstellungen', async () => leseEinstellungen(k.db));

  app.put<{ Body: unknown }>('/api/einstellungen', async (req, reply) => {
    const body = req.body;
    if (!istObjekt(body)) return fehler(reply, 400, 'JSON-Objekt erwartet');
    const werte: Partial<Einstellungen> = {};
    for (const [key, wert] of Object.entries(body)) {
      if (!(key in EINSTELLUNGEN_STANDARD)) return fehler(reply, 400, `Unbekannte Einstellung "${key}"`);
      if (typeof wert !== 'string') return fehler(reply, 400, `${key} muss Text sein`);
      if (['ausbildungsbeginn', 'zwischenpruefung', 'abschlusspruefung', 'vertragsende'].includes(key) && wert !== '' && !DATUM.test(wert)) {
        return fehler(reply, 400, `${key} muss ein Datum JJJJ-MM-TT oder leer sein`);
      }
      if (key === 'theme' && !['auto', 'light', 'dark'].includes(wert)) {
        return fehler(reply, 400, 'theme muss auto, light oder dark sein');
      }
      if (['ampel_bestaetigen', 'azubi_unterschrift_drucken', 'vorzeitige_zulassung'].includes(key) && !['ja', 'nein'].includes(wert)) {
        return fehler(reply, 400, `${key} muss ja oder nein sein`);
      }
      if (['azubi_name', 'ausbildungsberuf', 'ausbildungsbetrieb', 'ausbilder'].includes(key) && wert.length > 200) {
        return fehler(reply, 400, `${key} darf höchstens 200 Zeichen haben`);
      }
      if (key === 'wochenstunden' && !(Number(wert) >= 1 && Number(wert) <= 60)) {
        return fehler(reply, 400, 'wochenstunden muss eine Zahl zwischen 1 und 60 sein');
      }
      if (key === 'verkuerzung_monate' && !(/^\d{1,2}$/.test(wert) && Number(wert) <= 18)) {
        return fehler(reply, 400, 'verkuerzung_monate muss eine ganze Zahl von 0 bis 18 sein (Mindestdauer 18 Monate)');
      }
      if (key === 'verkuerzung_art' && !['ende', 'anfang'].includes(wert)) {
        return fehler(reply, 400, 'verkuerzung_art muss ende oder anfang sein');
      }
      if (key === 'verkuerzung_zeitpunkt' && !['vertrag', 'nachtraeglich'].includes(wert)) {
        return fehler(reply, 400, 'verkuerzung_zeitpunkt muss vertrag oder nachtraeglich sein');
      }
      if (key === 'verkuerzung_grund' && !['', 'abitur', 'fachhochschulreife', 'mittlere-reife', 'berufsausbildung', 'vorausbildung', 'alter', 'leistung', 'sonstiges'].includes(wert)) {
        return fehler(reply, 400, 'verkuerzung_grund ist unbekannt');
      }
      if (key === 'companion' && !['an', 'aus'].includes(wert)) {
        return fehler(reply, 400, 'companion muss an oder aus sein');
      }
      if (key === 'companion_haeufigkeit' && !['selten', 'normal', 'gespraechig'].includes(wert)) {
        return fehler(reply, 400, 'companion_haeufigkeit muss selten, normal oder gespraechig sein');
      }
      werte[key as EinstellungsSchluessel] = wert;
    }
    schreibeEinstellungen(k.db, werte);
    return leseEinstellungen(k.db);
  });

  // ---------- Ausbildungsplan ----------
  app.get('/api/kalender', async () => k.inhalte().ferien);

  const feldIds = () => new Set(k.inhalte().themenfelder.map((f) => f.id));
  const planId = (roh: string) => (/^\d{1,9}$/.test(roh) ? Number(roh) : null);

  app.get('/api/plan', async () => ({ eintraege: allePlanEintraege(k.db) }));

  app.post<{ Body: unknown }>('/api/plan', async (req, reply) => {
    const r = pruefePlanEintrag(req.body, feldIds());
    if ('fehler' in r) return fehler(reply, 400, r.fehler);
    return reply.code(201).send(legePlanEintragAn(k.db, r.werte));
  });

  app.patch<{ Params: { id: string }; Body: unknown }>('/api/plan/:id', async (req, reply) => {
    const id = planId(req.params.id);
    const alt = id === null ? undefined : holePlanEintrag(k.db, id);
    if (!alt || id === null) return fehler(reply, 404, 'Unbekannter Eintrag');
    const werte = {
      art: alt.art,
      von: alt.von,
      bis: alt.bis,
      titel: alt.titel,
      text: alt.text,
      themenfeld: alt.themenfeld,
      erledigt: alt.erledigt,
      unteraufgaben: alt.unteraufgaben,
    };
    const r = pruefePlanEintrag(req.body, feldIds(), werte);
    if ('fehler' in r) return fehler(reply, 400, r.fehler);
    return aenderePlanEintrag(k.db, id, r.werte);
  });

  app.delete<{ Params: { id: string } }>('/api/plan/:id', async (req, reply) => {
    const id = planId(req.params.id);
    if (id === null || !loeschePlanEintrag(k.db, id)) return fehler(reply, 404, 'Unbekannter Eintrag');
    return { ok: true };
  });

  // ---------- Berichtsheft ----------
  app.get('/api/berichte', async () => ({ berichte: alleBerichte(k.db) }));

  app.put<{ Params: { montag: string }; Body: unknown }>('/api/berichte/:montag', async (req, reply) => {
    const b = pruefeBericht(req.params.montag, req.body);
    if (typeof b === 'string') return fehler(reply, 400, b);
    const r = speichereBericht(k.db, b);
    if (r.unterschriftEntfernt) raeumeUnterschriftenAuf(k.db);
    return r;
  });

  app.delete<{ Params: { montag: string } }>('/api/berichte/:montag', async (req, reply) => {
    if (!loescheBericht(k.db, req.params.montag)) return fehler(reply, 404, 'Kein Bericht für diese Woche');
    raeumeUnterschriftenAuf(k.db);
    return { ok: true };
  });

  app.post<{ Body: unknown }>('/api/berichte/abzeichnen', async (req, reply) => {
    const b = req.body;
    if (!istObjekt(b) || !Array.isArray(b.montage) || b.montage.length > 300) return fehler(reply, 400, 'montage (Liste) erwartet');
    const datum = typeof b.datum === 'string' && montagVon(b.datum) ? b.datum : heute();
    const montage = b.montage.filter((m): m is string => typeof m === 'string' && montagVon(m) === m);
    // Mit gezeichneter Unterschrift des Ausbilders (optional)
    if (b.unterschrift !== undefined) {
      const u = pruefeUnterschrift({ ...(istObjekt(b.unterschrift) ? b.unterschrift : {}), datum }, 'ausbilder');
      if (typeof u === 'string') return fehler(reply, 400, u);
      // zeichneAb arbeitet selbst in einer Transaktion; eine ungenutzte Unterschrift wird danach entfernt
      const neu = legeUnterschriftAn(k.db, u);
      let geaendert = 0;
      try {
        geaendert = zeichneAb(k.db, montage, datum, neu.id);
      } finally {
        if (!geaendert) k.db.prepare('DELETE FROM unterschrift WHERE id = ?').run(neu.id);
      }
      return { ok: true, geaendert };
    }
    return { ok: true, geaendert: zeichneAb(k.db, montage, datum) };
  });

  // Eigene Unterschrift des Azubis (optional, wird auf Wunsch mitgedruckt)
  const eigene = () =>
    (k.db.prepare("SELECT * FROM unterschrift WHERE rolle = 'azubi' ORDER BY id DESC LIMIT 1").get() as Unterschrift | undefined) ?? null;
  app.get('/api/unterschrift/azubi', async () => ({ unterschrift: eigene() }));
  app.put<{ Body: unknown }>('/api/unterschrift/azubi', async (req, reply) => {
    const u = pruefeUnterschrift(req.body, 'azubi');
    if (typeof u === 'string') return fehler(reply, 400, u);
    let neu: Unterschrift | undefined;
    transaktion(k.db, () => {
      k.db.exec("DELETE FROM unterschrift WHERE rolle = 'azubi'");
      neu = legeUnterschriftAn(k.db, u);
    });
    return { unterschrift: neu };
  });
  app.delete('/api/unterschrift/azubi', async () => {
    k.db.exec("DELETE FROM unterschrift WHERE rolle = 'azubi'");
    return { ok: true };
  });

  // ---------- Prüfungstraining ----------
  app.get('/api/training', async () => ({ karten: alleKarten(k.db), versuche: alleVersuche(k.db) }));

  app.post<{ Body: unknown }>('/api/training/antworten', async (req, reply) => {
    const b = req.body;
    if (!istObjekt(b) || !Array.isArray(b.antworten)) return fehler(reply, 400, 'antworten (Liste) erwartet');
    return { karten: beantworte(k.db, b.antworten) };
  });

  app.post<{ Body: unknown }>('/api/training/versuch', async (req, reply) => {
    const v = pruefeVersuch(req.body);
    if (typeof v === 'string') return fehler(reply, 400, v);
    return speichereVersuch(k.db, v);
  });

  // ---------- Abschlussprojekt ----------
  app.get('/api/projekt', async () => leseProjekt(k.db));
  app.put<{ Body: unknown }>('/api/projekt', async (req, reply) => {
    const p = pruefeProjekt(req.body);
    if (typeof p === 'string') return fehler(reply, 400, p);
    return speichereProjekt(k.db, p);
  });

  // ---------- Export / Import / Zurücksetzen ----------
  app.get('/api/export', async (_req, reply) => {
    const daten = {
      format: BACKUP_FORMAT,
      appVersion: BUILD.app,
      schemaVersion: currentSchemaVersion(k.db),
      inhaltStand: k.inhalte().meta.stand,
      exportiertAm: new Date().toISOString(),
      unterthemen: [...alleStatus(k.db).values()],
      zusatz: [...alleZusatz(k.db).values()],
      plan: allePlanEintraege(k.db),
      berichte: alleBerichte(k.db),
      eigeneUnterschrift: eigene(),
      karten: alleKarten(k.db),
      projekt: leseProjekt(k.db),
      versuche: alleVersuche(k.db),
      einstellungen: leseEinstellungen(k.db),
    };
    reply.header('Content-Disposition', `attachment; filename="lernkompass-backup-${heute()}.json"`);
    reply.header('Cache-Control', 'no-store');
    return daten;
  });

  app.post<{ Body: unknown }>('/api/import', async (req, reply) => {
    const b = req.body;
    if (!istObjekt(b) || b.format !== BACKUP_FORMAT) return fehler(reply, 400, 'Keine gültige Lernkompass-Sicherung');
    const schema = Number(b.schemaVersion);
    if (!Number.isInteger(schema) || schema < 1) return fehler(reply, 400, 'schemaVersion fehlt');
    if (schema > latestSchemaVersion()) {
      return fehler(reply, 400, `Die Sicherung stammt aus einer neueren App-Version (Schema ${schema}). Bitte zuerst die App aktualisieren.`);
    }
    if (!Array.isArray(b.unterthemen)) return fehler(reply, 400, '"unterthemen" fehlt');

    const unterthemen: UnterthemaStatus[] = [];
    for (const r of b.unterthemen) {
      if (!istObjekt(r) || typeof r.unterthema_id !== 'string') continue;
      unterthemen.push({
        unterthema_id: r.unterthema_id,
        status: STATI.includes(r.status as Status) ? (r.status as Status) : 'rot',
        luecke: typeof r.luecke === 'string' ? r.luecke.slice(0, MAX_TEXT) : '',
        notiz: typeof r.notiz === 'string' ? r.notiz.slice(0, MAX_TEXT) : '',
        inhalt_hash: typeof r.inhalt_hash === 'string' ? r.inhalt_hash : null,
        geaendert: typeof r.geaendert === 'string' && DATUM.test(r.geaendert) ? r.geaendert : heute(),
      });
    }
    const zusatz: ZusatzStatus[] = Array.isArray(b.zusatz)
      ? b.zusatz
          .filter((r): r is Record<string, unknown> => istObjekt(r) && typeof r.zusatz_id === 'string')
          .map((r) => ({
            zusatz_id: r.zusatz_id as string,
            gelesen: r.gelesen ? 1 : 0,
            geaendert: typeof r.geaendert === 'string' && DATUM.test(r.geaendert) ? r.geaendert : heute(),
          }))
      : [];
    const einstellungen: Partial<Einstellungen> = {};
    if (istObjekt(b.einstellungen)) {
      for (const key of Object.keys(EINSTELLUNGEN_STANDARD) as EinstellungsSchluessel[]) {
        const v = b.einstellungen[key];
        if (typeof v === 'string') einstellungen[key] = v;
      }
    }

    await backupDatabase(k.db, k.config.dataDir, 'import');
    transaktion(k.db, () => {
      k.db.exec('DELETE FROM unterthema_status; DELETE FROM zusatz_status;');
      const s1 = k.db.prepare(
        'INSERT INTO unterthema_status (unterthema_id, status, luecke, notiz, inhalt_hash, geaendert) VALUES (@unterthema_id, @status, @luecke, @notiz, @inhalt_hash, @geaendert)',
      );
      for (const r of unterthemen) s1.run({ ...r });
      const s2 = k.db.prepare('INSERT INTO zusatz_status (zusatz_id, gelesen, geaendert) VALUES (@zusatz_id, @gelesen, @geaendert)');
      for (const r of zusatz) s2.run({ ...r });
    });
    schreibeEinstellungen(k.db, einstellungen);
    // Ältere Sicherungen kennen den Plan noch nicht – dann bleibt der vorhandene Plan erhalten.
    const plan = Array.isArray(b.plan) ? ersetzePlan(k.db, b.plan, feldIds()) : null;
    const berichte = Array.isArray(b.berichte) ? ersetzeBerichte(k.db, b.berichte) : null;
    if (b.eigeneUnterschrift !== undefined) {
      k.db.exec("DELETE FROM unterschrift WHERE rolle = 'azubi'");
      const u = b.eigeneUnterschrift ? pruefeUnterschrift(b.eigeneUnterschrift, 'azubi') : null;
      if (u && typeof u !== 'string') legeUnterschriftAn(k.db, u);
    }
    if (istObjekt(b.projekt)) {
      const p = pruefeProjekt(b.projekt);
      if (typeof p !== 'string') speichereProjekt(k.db, p);
    }
    const training = Array.isArray(b.karten) ? ersetzeTraining(k.db, b.karten, Array.isArray(b.versuche) ? b.versuche : []) : null;
    return { ok: true, unterthemen: unterthemen.length, zusatz: zusatz.length, plan, berichte, karten: training?.karten ?? null };
  });

  app.post('/api/reset', async () => {
    await backupDatabase(k.db, k.config.dataDir, 'reset');
    k.db.exec('DELETE FROM unterthema_status; DELETE FROM zusatz_status; DELETE FROM karte; DELETE FROM pruefung_versuch;');
    return { ok: true };
  });

  app.all('/api/*', async (_req, reply) => fehler(reply, 404, 'Unbekannter API-Pfad'));
}
