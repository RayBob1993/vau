import { ButtonPlugin } from '../plugin';
import VButton from '../VButton.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('ButtonPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(ButtonPlugin);

    const buttonComponent = app.component('VButton');

    expect(buttonComponent).toBeDefined();
    expect(buttonComponent).toBe(VButton);
  });

  it('Плагин имеет функцию install', () => {
    expect(ButtonPlugin.install).toBeDefined();
    expect(typeof ButtonPlugin.install).toBe('function');
  });
});
