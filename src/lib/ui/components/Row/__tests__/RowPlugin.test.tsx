import { RowPlugin } from '../plugin';
import VRow from '../VRow.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('RowPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(RowPlugin);

    const rowComponent = app.component('VRow');

    expect(rowComponent).toBeDefined();
    expect(rowComponent).toBe(VRow);
  });

  it('Плагин имеет функцию install', () => {
    expect(RowPlugin.install).toBeDefined();
    expect(typeof RowPlugin.install).toBe('function');
  });
});
