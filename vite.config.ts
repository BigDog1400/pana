// vite.config.ts

import { defineConfig } from 'vite';
import solid from 'solid-start/vite'; // or solid-start/vite
// import devtools from 'solid-devtools/vite';
export default defineConfig({
  optimizeDeps: {
    exclude: ['solid-headless'],
  },
  ssr: {
    noExternal: ['solid-headless', 'solid-heroicons'],
  },
  plugins: [
    solid(),
    // devtools({
    //   /* additional options */
    //   autoname: true, // e.g. enable autoname
    //   // pass `true` or an object with options
    //   locator: {
    //     targetIDE: 'vscode',
    //     componentLocation: true,
    //     jsxLocation: true,
    //     key: 'Control',
    //   },
    // }),
    ,
  ],
});
