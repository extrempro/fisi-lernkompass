import { resolve } from 'node:path';

export interface Config {
  port: number;
  host: string;
  dataDir: string;
  contentDir: string;
  production: boolean;
  allowContentReload: boolean;
  /** Inhalte bei Änderungen automatisch neu laden – im Dev-Modus immer, in Produktion mit CONTENT_WATCH=true */
  watchContent: boolean;
  /** Ordner regelmäßig abfragen statt auf Dateisystem-Ereignisse zu warten (nötig bei manchen Docker-Bind-Mounts) */
  watchPolling: boolean;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const production = env.NODE_ENV === 'production' || process.argv.includes('--production');
  return {
    port: Number(env.PORT) || 3000,
    host: env.HOST || '0.0.0.0',
    dataDir: resolve(env.DATA_DIR || './data'),
    contentDir: resolve(env.CONTENT_DIR || './content'),
    production,
    allowContentReload: env.ALLOW_CONTENT_RELOAD === 'true',
    watchContent: !production || env.CONTENT_WATCH === 'true',
    watchPolling: env.CONTENT_WATCH_POLL === 'true',
  };
}
