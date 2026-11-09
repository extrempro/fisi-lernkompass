import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from './config';
import { dailyBackup, openDatabase, type DB } from './db';
import { ladeInhalte, type Inhalte } from './content/store';
import { uebernehmeStilleAenderungen, wendeUmbenennungenAn } from './lernstand';
import { registriereApi } from './routes';
import { BUILD, ROOT } from './version';

const config = loadConfig();
const app = Fastify({
  logger: { level: config.production ? 'info' : 'debug' },
  bodyLimit: 5 * 1024 * 1024,
});
const log = (m: string) => app.log.info(m);

app.log.info(`FISI-Lernkompass ${BUILD.app} (${BUILD.commit}, Build ${BUILD.build})`);

let db: DB;
try {
  db = await openDatabase(config.dataDir, log);
} catch (e) {
  app.log.fatal((e as Error).message);
  process.exit(1);
}

// ---------- Inhalte ----------
let inhalte: Inhalte = ladeInhalte(config.contentDir);
function berichte(i: Inhalte) {
  for (const m of i.meldungen) {
    const text = `${m.datei}${m.zeile ? `:${m.zeile}` : ''}  ${m.text}`;
    if (m.level === 'fehler') app.log.error(`Inhalt: ${text}`);
    else app.log.debug(`Inhalt: ${text}`);
  }
  const f = i.meldungen.filter((m) => m.level === 'fehler').length;
  app.log.info(`Inhalte geladen: ${i.themenfelder.length} Themenfelder, Stand ${i.meta.stand}${f ? `, ${f} Fehler` : ''}`);
}
function neuLaden(): Inhalte {
  inhalte = ladeInhalte(config.contentDir, inhalte);
  berichte(inhalte);
  wendeUmbenennungenAn(db!, inhalte, log);
  uebernehmeStilleAenderungen(db!, inhalte);
  return inhalte;
}
berichte(inhalte);
wendeUmbenennungenAn(db, inhalte, log);
uebernehmeStilleAenderungen(db, inhalte);

if (config.watchContent) {
  const { watch } = await import('chokidar');
  let timer: NodeJS.Timeout | undefined;
  if (config.production) app.log.info(`Inhalte werden überwacht${config.watchPolling ? ' (Abfrage alle 2 s)' : ''}`);
  watch(config.contentDir, { ignoreInitial: true, usePolling: config.watchPolling, interval: 2000 }).on('all', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      app.log.info('Inhalte geändert – lade neu');
      neuLaden();
    }, 200);
  });
}

// ---------- Sicherheit ----------
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'img-src': ["'self'", 'data:'],
      'style-src': ["'self'", "'unsafe-inline'"],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
      // Die App läuft im Heimnetz oft per HTTP – kein automatisches Umschreiben auf HTTPS.
      'upgrade-insecure-requests': null,
    },
  },
  hsts: false,
  crossOriginEmbedderPolicy: false,
});

// ---------- API ----------
await registriereApi(app, { db, config, inhalte: () => inhalte, neuLaden });

// ---------- Frontend (Produktion) ----------
const dist = join(ROOT, 'dist');
if (existsSync(join(dist, 'index.html'))) {
  await app.register(fastifyStatic, {
    root: dist,
    prefix: '/',
    setHeaders(res, pfad) {
      if (pfad.includes(`${join('dist', 'assets')}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  });
  // SPA-Fallback: alle Nicht-API-Pfade liefern index.html (React Router übernimmt)
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api/') || req.method !== 'GET') {
      return reply.code(404).send({ fehler: 'Nicht gefunden' });
    }
    reply.header('Cache-Control', 'no-cache');
    return reply.sendFile('index.html');
  });
} else {
  app.log.info('Kein gebautes Frontend in dist/ – im Dev-Modus liefert Vite das Frontend (npm run dev).');
}

// ---------- Tägliche Sicherung ----------
const sichern = () =>
  dailyBackup(db!, config.dataDir)
    .then((f) => f && app.log.info(`Tägliche Sicherung: ${f}`))
    .catch((e) => app.log.error(`Sicherung fehlgeschlagen: ${(e as Error).message}`));
await sichern();
const backupTimer = setInterval(sichern, 60 * 60 * 1000);

// ---------- Start / Stopp ----------
const stopp = async () => {
  clearInterval(backupTimer);
  await app.close();
  db!.close();
  process.exit(0);
};
process.on('SIGINT', stopp);
process.on('SIGTERM', stopp);

await app.listen({ port: config.port, host: config.host });
