import { DrawerPlugin } from '../plugin';
import VDrawer from '../VDrawer.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('DrawerPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(DrawerPlugin);

    const drawerComponent = app.component('VDrawer');

    expect(drawerComponent).toBeDefined();
    expect(drawerComponent).toBe(VDrawer);
  });

  it('Плагин имеет функцию install', () => {
    expect(DrawerPlugin.install).toBeDefined();
    expect(typeof DrawerPlugin.install).toBe('function');
  });
});
