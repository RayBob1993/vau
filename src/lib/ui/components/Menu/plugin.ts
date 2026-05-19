import type { Plugin } from 'vue';
import VMenu from './VMenu.vue';
import VMenuItem from './VMenuItem.vue';

export const MenuPlugin: Plugin = {
  install (app) {
    app.component('VMenu', VMenu);
    app.component('VMenuItem', VMenuItem);
  }
};
