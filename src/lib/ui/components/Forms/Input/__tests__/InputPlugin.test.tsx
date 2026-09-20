import { InputPlugin } from '../plugin';
import VInput from '../VInput.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('InputPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(InputPlugin);

    const inputComponent = app.component('VInput');

    expect(inputComponent).toBeDefined();
    expect(inputComponent).toBe(VInput);
  });

  it('Плагин имеет функцию install', () => {
    expect(InputPlugin.install).toBeDefined();
    expect(typeof InputPlugin.install).toBe('function');
  });
});
