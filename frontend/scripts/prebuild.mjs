import { rename, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const staticDir = resolve(__dirname, '../../src/main/resources/static');
const legacy = resolve(staticDir, 'index.legacy.html');
const index = resolve(staticDir, 'index.html');

async function run(){
  try {
    await stat(index);
  } catch { return; }
  try {
    await stat(legacy); // already backed up
    return;
  } catch {}
  try {
    await rename(index, legacy);
    console.log('Backed up static/index.html -> static/index.legacy.html');
  } catch (e) {
    console.warn('Could not backup index.html:', e?.message || e);
  }
}
run();

