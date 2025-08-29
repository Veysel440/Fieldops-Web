import { defineConfig } from 'histoire';
import { HstVue } from '@histoire/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [HstVue()],
  setupFile: '/src/stories.setup.ts',
  vite: {
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
  }
});
