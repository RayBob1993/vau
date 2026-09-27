import { LayoutPlugin } from '../plugin';
import VLayout from '../VLayout.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('LayoutPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(LayoutPlugin);

    const layoutComponent = app.component('VLayout');

    expect(layoutComponent).toBeDefined();
    expect(layoutComponent).toBe(VLayout);
  });

  it('Плагин имеет функцию install', () => {
    expect(LayoutPlugin.install).toBeDefined();
    expect(typeof LayoutPlugin.install).toBe('function');
  });
});
