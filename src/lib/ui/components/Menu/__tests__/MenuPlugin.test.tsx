import { MenuPlugin } from '../plugin';
import VMenu from '../VMenu.vue';
import VMenuItem from '../VMenuItem.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('MenuPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(MenuPlugin);

    const menuComponent = app.component('VMenu');
    const menuItemComponent = app.component('VMenuItem');

    expect(menuComponent).toBeDefined();
    expect(menuItemComponent).toBeDefined();
    expect(menuComponent).toBe(VMenu);
    expect(menuItemComponent).toBe(VMenuItem);
  });

  it('Плагин имеет функцию install', () => {
    expect(MenuPlugin.install).toBeDefined();
    expect(typeof MenuPlugin.install).toBe('function');
  });
});
