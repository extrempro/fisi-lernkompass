import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

function gitCommit(): string {
  if (process.env.GIT_COMMIT) return process.env.GIT_COMMIT;
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'unknown';
  }
}

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || pkg.version),
    __GIT_COMMIT__: JSON.stringify(gitCommit()),
    __BUILD_DATE__: JSON.stringify(process.env.BUILD_DATE || new Date().toISOString().slice(0, 10)),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': `http://localhost:${process.env.PORT || 3000}`,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
