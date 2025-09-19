import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

// Build Vue app into Spring's static folder without clobbering existing assets
export default defineConfig(({ mode }) => {
  const envOut = process.env.VITE_OUTDIR;
  const outDir = envOut && envOut.trim() ? envOut : path.resolve(__dirname, '../src/main/resources/static');
  return {
    plugins: [vue()],
    base: '',
    build: {
      outDir,
      assetsDir: 'assets/app',
      emptyOutDir: false
    },
    server: {
      port: 5173,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  };
});
