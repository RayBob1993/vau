import { InputCodePlugin } from '../plugin';
import VInputCode from '../VInputCode.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('InputCodePlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(InputCodePlugin);

    const inputCodeComponent = app.component('VInputCode');

    expect(inputCodeComponent).toBeDefined();
    expect(inputCodeComponent).toBe(VInputCode);
  });

  it('Плагин имеет функцию install', () => {
    expect(InputCodePlugin.install).toBeDefined();
    expect(typeof InputCodePlugin.install).toBe('function');
  });
});
