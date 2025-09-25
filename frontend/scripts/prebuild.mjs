import { rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const staticDir = resolve(__dirname, '../../src/main/resources/static');
const appDir = resolve(staticDir, 'assets/app');
// If running inside Docker build, Vite uses VITE_OUTDIR (e.g. /web/dist)
const envOut = (process.env.VITE_OUTDIR || '').trim();
const outAppDir = envOut ? resolve(envOut, 'assets/app') : null;

async function cleanupAppAssets() {
  try {
    await rm(appDir, { recursive: true, force: true });
    console.log('Cleaned static/assets/app');
  } catch (e) {
    console.warn('Could not clean app assets:', e?.message || e);
  }
  if (outAppDir && outAppDir !== appDir) {
    try {
      await rm(outAppDir, { recursive: true, force: true });
      console.log(`Cleaned ${outAppDir.replace(/\\/g, '/')}`);
    } catch (e) {
      console.warn('Could not clean VITE_OUTDIR assets:', e?.message || e);
    }
  }
}

async function run(){
  await cleanupAppAssets();
}
run();
