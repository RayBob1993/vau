import { CheckboxGroupPlugin } from '../plugin';
import VCheckboxGroup from '../VCheckboxGroup.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('CheckboxGroupPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(CheckboxGroupPlugin);

    const checkboxGroupComponent = app.component('VCheckboxGroup');

    expect(checkboxGroupComponent).toBeDefined();
    expect(checkboxGroupComponent).toBe(VCheckboxGroup);
  });

  it('Плагин имеет функцию install', () => {
    expect(CheckboxGroupPlugin.install).toBeDefined();
    expect(typeof CheckboxGroupPlugin.install).toBe('function');
  });
});
