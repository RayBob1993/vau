import { CollapsePlugin } from '../plugin';
import VCollapse from '../VCollapse.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('CollapsePlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(CollapsePlugin);

    const collapseComponent = app.component('VCollapse');

    expect(collapseComponent).toBeDefined();
    expect(collapseComponent).toBe(VCollapse);
  });

  it('Плагин имеет функцию install', () => {
    expect(CollapsePlugin.install).toBeDefined();
    expect(typeof CollapsePlugin.install).toBe('function');
  });
});
