import { ButtonGroupPlugin } from '../plugin';
import VButtonGroup from '../VButtonGroup.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('ButtonGroupPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(ButtonGroupPlugin);

    const buttonGroupComponent = app.component('VButtonGroup');

    expect(buttonGroupComponent).toBeDefined();
    expect(buttonGroupComponent).toBe(VButtonGroup);
  });

  it('Плагин имеет функцию install', () => {
    expect(ButtonGroupPlugin.install).toBeDefined();
    expect(typeof ButtonGroupPlugin.install).toBe('function');
  });
});
