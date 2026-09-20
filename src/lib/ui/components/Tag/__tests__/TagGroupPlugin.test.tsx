import { TagGroupPlugin } from '../plugin';
import VTagGroup from '../VTagGroup.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('TagGroupPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(TagGroupPlugin);

    const tagGroupComponent = app.component('VTagGroup');

    expect(tagGroupComponent).toBeDefined();
    expect(tagGroupComponent).toBe(VTagGroup);
  });

  it('Плагин имеет функцию install', () => {
    expect(TagGroupPlugin.install).toBeDefined();
    expect(typeof TagGroupPlugin.install).toBe('function');
  });
});
