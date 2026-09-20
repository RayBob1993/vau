import { TagPlugin } from '../plugin';
import VTag from '../VTag.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('TagPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(TagPlugin);

    const tagComponent = app.component('VTag');

    expect(tagComponent).toBeDefined();
    expect(tagComponent).toBe(VTag);
  });

  it('Плагин имеет функцию install', () => {
    expect(TagPlugin.install).toBeDefined();
    expect(typeof TagPlugin.install).toBe('function');
  });
});
