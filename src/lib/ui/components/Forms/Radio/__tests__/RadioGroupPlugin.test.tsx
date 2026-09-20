import { RadioGroupPlugin } from '../plugin';
import VRadioGroup from '../VRadioGroup.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('RadioGroupPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(RadioGroupPlugin);

    const radioGroupComponent = app.component('VRadioGroup');

    expect(radioGroupComponent).toBeDefined();
    expect(radioGroupComponent).toBe(VRadioGroup);
  });

  it('Плагин имеет функцию install', () => {
    expect(RadioGroupPlugin.install).toBeDefined();
    expect(typeof RadioGroupPlugin.install).toBe('function');
  });
});
