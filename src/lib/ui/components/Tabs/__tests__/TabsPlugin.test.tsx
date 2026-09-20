import { TabsPlugin } from '../plugin';
import VTabs from '../VTabs.vue';
import VTab from '../VTab.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('TabsPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(TabsPlugin);

    const tabsComponent = app.component('VTabs');
    const tabComponent = app.component('VTab');

    expect(tabsComponent).toBeDefined();
    expect(tabComponent).toBeDefined();
    expect(tabsComponent).toBe(VTabs);
    expect(tabComponent).toBe(VTab);
  });

  it('Плагин имеет функцию install', () => {
    expect(TabsPlugin.install).toBeDefined();
    expect(typeof TabsPlugin.install).toBe('function');
  });
});
