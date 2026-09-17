import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  root:resolve(here,'react-src'),
  base:'./',
  plugins:[react()],
  build:{outDir:resolve(here,'.react-build'),emptyOutDir:true,rollupOptions:{input:{game:resolve(here,'react-src/weekly-it-project-game/index.html'),tutorial:resolve(here,'react-src/it-decision-tutorial/index.html')}}},
  test:{globals:true,environment:'jsdom',setupFiles:resolve(here,'react-src/common/setupTests.js'),include:['**/src/*.{test,spec}.{js,jsx,ts,tsx}']}
});
