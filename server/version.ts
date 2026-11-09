import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));

function paketVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
    return pkg.version;
  } catch {
    return '0.0.0';
  }
}

function gitCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'unknown';
  }
}

/** Beim Docker-Build geschriebene Datei mit dem Build-Datum (JJJJ-MM-TT). */
function buildDatum(): string {
  const datei = new URL('../build-date.txt', import.meta.url);
  try {
    return existsSync(datei) ? readFileSync(datei, 'utf8').trim() || 'dev' : 'dev';
  } catch {
    return 'dev';
  }
}

/** Version, Commit und Build-Datum: aus Umgebungsvariablen, der Build-Datei (Docker) oder lokal ermittelt. */
export const BUILD = {
  app: process.env.APP_VERSION || paketVersion(),
  commit: process.env.GIT_COMMIT || gitCommit(),
  build: process.env.BUILD_DATE || buildDatum(),
};
