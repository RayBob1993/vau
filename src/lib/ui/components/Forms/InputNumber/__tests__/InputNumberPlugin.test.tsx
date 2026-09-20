import { InputNumberPlugin } from '../plugin';
import VInputNumber from '../VInputNumber.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('InputNumberPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(InputNumberPlugin);

    const inputNumberComponent = app.component('VInputNumber');

    expect(inputNumberComponent).toBeDefined();
    expect(inputNumberComponent).toBe(VInputNumber);
  });

  it('Плагин имеет функцию install', () => {
    expect(InputNumberPlugin.install).toBeDefined();
    expect(typeof InputNumberPlugin.install).toBe('function');
  });
});
