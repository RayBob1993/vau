import { TextPlugin } from '../plugin';
import VText from '../VText.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('TextPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(TextPlugin);

    const textComponent = app.component('VText');

    expect(textComponent).toBeDefined();
    expect(textComponent).toBe(VText);
  });

  it('Плагин имеет функцию install', () => {
    expect(TextPlugin.install).toBeDefined();
    expect(typeof TextPlugin.install).toBe('function');
  });
});
