import { InputGroupPlugin } from '../plugin';
import VInputGroup from '../VInputGroup.vue';
import VInputGroupAddon from '../VInputGroupAddon.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('InputGroupPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(InputGroupPlugin);

    const inputGroupComponent = app.component('VInputGroup');
    const inputGroupAddonComponent = app.component('VInputGroupAddon');

    expect(inputGroupComponent).toBeDefined();
    expect(inputGroupAddonComponent).toBeDefined();
    expect(inputGroupComponent).toBe(VInputGroup);
    expect(inputGroupAddonComponent).toBe(VInputGroupAddon);
  });

  it('Плагин имеет функцию install', () => {
    expect(InputGroupPlugin.install).toBeDefined();
    expect(typeof InputGroupPlugin.install).toBe('function');
  });
});
