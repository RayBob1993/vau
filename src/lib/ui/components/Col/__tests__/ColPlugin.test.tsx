import { ColPlugin } from '../plugin';
import VCol from '../VCol.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('ColPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(ColPlugin);

    const colComponent = app.component('VCol');

    expect(colComponent).toBeDefined();
    expect(colComponent).toBe(VCol);
  });

  it('Плагин имеет функцию install', () => {
    expect(ColPlugin.install).toBeDefined();
    expect(typeof ColPlugin.install).toBe('function');
  });
});
