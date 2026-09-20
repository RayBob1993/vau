import { InputPasswordPlugin } from '../plugin';
import VInputPassword from '../VInputPassword.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('InputPasswordPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(InputPasswordPlugin);

    const inputPasswordComponent = app.component('VInputPassword');

    expect(inputPasswordComponent).toBeDefined();
    expect(inputPasswordComponent).toBe(VInputPassword);
  });

  it('Плагин имеет функцию install', () => {
    expect(InputPasswordPlugin.install).toBeDefined();
    expect(typeof InputPasswordPlugin.install).toBe('function');
  });
});
