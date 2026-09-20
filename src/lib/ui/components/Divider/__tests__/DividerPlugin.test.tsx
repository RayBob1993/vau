import { DividerPlugin } from '../plugin';
import VDivider from '../VDivider.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('DividerPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(DividerPlugin);

    const dividerComponent = app.component('VDivider');

    expect(dividerComponent).toBeDefined();
    expect(dividerComponent).toBe(VDivider);
  });

  it('Плагин имеет функцию install', () => {
    expect(DividerPlugin.install).toBeDefined();
    expect(typeof DividerPlugin.install).toBe('function');
  });
});
