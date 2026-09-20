import type { Plugin } from 'vue';
import VSection from './VSection.vue';

export const SectionPlugin: Plugin = {
  install (app) {
    app.component('VSection', VSection);
  }
};
