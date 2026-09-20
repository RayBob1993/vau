import { CheckboxPlugin } from '../plugin';
import VCheckbox from '../VCheckbox.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('CheckboxPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(CheckboxPlugin);

    const checkboxComponent = app.component('VCheckbox');

    expect(checkboxComponent).toBeDefined();
    expect(checkboxComponent).toBe(VCheckbox);
  });

  it('Плагин имеет функцию install', () => {
    expect(CheckboxPlugin.install).toBeDefined();
    expect(typeof CheckboxPlugin.install).toBe('function');
  });
});
