import { PlaceholderPlugin } from '../plugin';
import VPlaceholder from '../VPlaceholder.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('PlaceholderPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(PlaceholderPlugin);

    const placeholderComponent = app.component('VPlaceholder');

    expect(placeholderComponent).toBeDefined();
    expect(placeholderComponent).toBe(VPlaceholder);
  });

  it('Плагин имеет функцию install', () => {
    expect(PlaceholderPlugin.install).toBeDefined();
    expect(typeof PlaceholderPlugin.install).toBe('function');
  });
});
