import { AlertPlugin } from '../plugin';
import VAlert from '../VAlert.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('AlertPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(AlertPlugin);

    const alertComponent = app.component('VAlert');

    expect(alertComponent).toBeDefined();
    expect(alertComponent).toBe(VAlert);
  });

  it('Плагин имеет функцию install', () => {
    expect(AlertPlugin.install).toBeDefined();
    expect(typeof AlertPlugin.install).toBe('function');
  });
});
