import { FormPlugin } from '../plugin';
import VForm from '../VForm.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('FormPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(FormPlugin);

    const formComponent = app.component('VForm');

    expect(formComponent).toBeDefined();
    expect(formComponent).toBe(VForm);
  });

  it('Плагин имеет функцию install', () => {
    expect(FormPlugin.install).toBeDefined();
    expect(typeof FormPlugin.install).toBe('function');
  });
});
