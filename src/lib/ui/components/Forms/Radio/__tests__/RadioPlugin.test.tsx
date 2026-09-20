import { RadioPlugin } from '../plugin';
import VRadio from '../VRadio.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('RadioPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(RadioPlugin);

    const radioComponent = app.component('VRadio');

    expect(radioComponent).toBeDefined();
    expect(radioComponent).toBe(VRadio);
  });

  it('Плагин имеет функцию install', () => {
    expect(RadioPlugin.install).toBeDefined();
    expect(typeof RadioPlugin.install).toBe('function');
  });
});
